import { readdirSync, statSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";
import type { Plugin } from "esbuild";

/**
 * File-based routing for the watch, beside Expo Router's `app/`: every screen
 * file under a routes folder (`watch/` by convention) becomes a
 * `<NavigationRoute>`, with Expo Router's naming rules, so a project reads
 *
 *   app/                 Expo Router (the phone)
 *   watch/               the watch, same conventions
 *     _layout.tsx        wraps the whole watch stack (providers, boundaries)
 *     index.tsx          → /
 *     counter.tsx        → /counter
 *     lists/[id].tsx     → /lists/[id]        useParams<"/lists/[id]">()
 *     (more)/about.tsx   → /about             groups add no segment
 *     lists/_layout.tsx  wraps every screen under lists/
 *     +not-found.tsx     any route nothing else matches
 *
 * A screen module default-exports its component and may export
 * `options = { title }`. A `_layout` default-exports a component that renders
 * its `children` (Expo Router's <Slot />). Files and folders starting with "."
 * or "_" (other than `_layout`), tests and `.d.ts` files are not routes, so
 * helpers can live beside the screens. esbuild has no require.context, so the
 * plugin below generates the entry at build time and re-scans when a file is
 * added or removed under the folder.
 */

/** The virtual entry the plugin resolves; pass it as the build's `entry`. */
export const WATCH_ROUTES_ENTRY = "react-watchos:watch-routes";

const SCREEN_FILE = /\.(tsx|ts|jsx|js)$/;
const NOT_A_ROUTE = /(\.test|\.spec|\.d)\.(tsx|ts|jsx|js)$/;

export interface WatchRouteFile {
  /** Route pattern, e.g. "/lists/[id]". */
  path: string;
  /** File relative to the routes folder, "/"-separated. */
  file: string;
  /** `_layout` files that wrap this screen, outermost first (root excluded). */
  layouts: string[];
}

export interface WatchRouteTable {
  routes: WatchRouteFile[];
  /** The root `_layout`, which wraps the whole stack. */
  rootLayout: string | null;
  /** The root `+not-found` screen. */
  notFound: string | null;
}

const isGroup = (segment: string) => /^\(.+\)$/.test(segment);

/** Expo Router's file → path mapping for one screen file. */
export function routePathOf(file: string): string {
  const segments = file
    .replace(SCREEN_FILE, "")
    .split("/")
    .filter((segment) => !isGroup(segment));
  if (segments[segments.length - 1] === "index") segments.pop();
  return `/${segments.join("/")}`;
}

function isHidden(segment: string): boolean {
  return segment.startsWith(".") || segment.startsWith("_");
}

/** The last path segment without its extension: "lists/_layout.tsx" → "_layout". */
function baseName(file: string): string {
  return (file.split("/").pop() ?? "").replace(SCREEN_FILE, "");
}

const isLayout = (file: string) => baseName(file) === "_layout";

/**
 * Turns the files of a routes folder (relative, "/"-separated) into the route
 * table. Pure, so the conventions are unit-tested without a file system.
 * Throws when two files claim one path, as Expo Router does.
 */
export function routesFromFiles(files: readonly string[]): WatchRouteTable {
  const screens = files.filter((file) => {
    if (!SCREEN_FILE.test(file) || NOT_A_ROUTE.test(file)) return false;
    if (file.split("/").slice(0, -1).some(isHidden)) return false;
    const name = baseName(file);
    if (name.startsWith("+")) return false;
    return !isHidden(name) || name === "_layout";
  });
  const layouts = new Map<string, string>();
  for (const file of screens) {
    if (isLayout(file)) {
      layouts.set(file.split("/").slice(0, -1).join("/"), file);
    }
  }
  const byPath = new Map<string, WatchRouteFile>();
  for (const file of screens) {
    if (isLayout(file)) continue;
    const dirs = file.split("/").slice(0, -1);
    const wrapping: string[] = [];
    for (let depth = 1; depth <= dirs.length; depth++) {
      const layout = layouts.get(dirs.slice(0, depth).join("/"));
      if (layout) wrapping.push(layout);
    }
    const path = routePathOf(file);
    const taken = byPath.get(path);
    if (taken) {
      throw new Error(
        `watch routes: ${taken.file} and ${file} both map to ${path}`,
      );
    }
    byPath.set(path, { path, file, layouts: wrapping });
  }
  const notFound = files.find((file) =>
    /^\+not-found\.(tsx|ts|jsx|js)$/.test(file),
  );
  const nestedNotFound = files.find((file) =>
    /\/\+not-found\.(tsx|ts|jsx|js)$/.test(file),
  );
  if (nestedNotFound) {
    throw new Error(
      `watch routes: ${nestedNotFound} — +not-found is only supported at the root`,
    );
  }
  return {
    routes: [...byPath.values()].sort((a, b) => a.path.localeCompare(b.path)),
    rootLayout: layouts.get("") ?? null,
    notFound: notFound ?? null,
  };
}

/** Every file and directory under `dir`, skipping node_modules. */
function walk(dir: string): { files: string[]; dirs: string[] } {
  const files: string[] = [];
  const dirs: string[] = [dir];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules") continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      const inner = walk(full);
      files.push(...inner.files);
      dirs.push(...inner.dirs);
    } else if (entry.isFile()) {
      files.push(full);
    }
  }
  return { files, dirs };
}

export function scanWatchRoutes(dir: string): {
  table: WatchRouteTable;
  dirs: string[];
} {
  const root = resolve(dir);
  if (!statSync(root, { throwIfNoEntry: false })?.isDirectory()) {
    throw new Error(`watch routes: ${root} is not a folder`);
  }
  const { files, dirs } = walk(root);
  const relativeFiles = files.map((file) =>
    relative(root, file).split(sep).join("/"),
  );
  return { table: routesFromFiles(relativeFiles), dirs };
}

/**
 * The generated entry: imports every screen and layout statically (one
 * bundle, no lazy loading on the watch) and mounts them with WatchRouter.
 */
export function generateWatchRoutesEntry(
  table: WatchRouteTable,
  { dir, importFrom = "react-watchos" }: { dir: string; importFrom?: string },
): string {
  const root = resolve(dir);
  const imports: string[] = [];
  const names = new Map<string, string>();
  const moduleOf = (file: string): string => {
    const known = names.get(file);
    if (known) return known;
    const name = `m${names.size}`;
    names.set(file, name);
    imports.push(
      `import * as ${name} from ${JSON.stringify(join(root, file))};`,
    );
    return name;
  };
  const routes = table.routes.map(
    (route) =>
      `{ path: ${JSON.stringify(route.path)}, file: ${JSON.stringify(route.file)}, ` +
      `module: ${moduleOf(route.file)}, layouts: [${route.layouts
        .map(
          (file) =>
            `{ file: ${JSON.stringify(file)}, module: ${moduleOf(file)} }`,
        )
        .join(", ")}] }`,
  );
  const optional = (key: string, file: string | null) =>
    file === null
      ? ""
      : `, ${key}: { file: ${JSON.stringify(file)}, module: ${moduleOf(file)} }`;
  const extras =
    optional("rootLayout", table.rootLayout) +
    optional("notFound", table.notFound);
  return [
    `import { createElement } from "react";`,
    `import { runApp, WatchRouter } from ${JSON.stringify(importFrom)};`,
    ...imports,
    `runApp(createElement(WatchRouter, { routes: [`,
    `  ${routes.join(",\n  ")}`,
    `]${extras} }));`,
    "",
  ].join("\n");
}

export interface WatchRoutesPluginOptions {
  /** The routes folder, e.g. "watch". */
  dir: string;
  /** Where WatchRouter and runApp are imported from (default "react-watchos"). */
  importFrom?: string;
}

/** Resolves {@link WATCH_ROUTES_ENTRY} to a generated entry for `dir`. */
export function watchRoutesPlugin({
  dir,
  importFrom,
}: WatchRoutesPluginOptions): Plugin {
  const root = resolve(dir);
  const namespace = "react-watchos-watch-routes";
  return {
    name: "react-watchos-watch-routes",
    setup(build) {
      build.onResolve({ filter: /^react-watchos:watch-routes$/ }, () => ({
        path: root,
        namespace,
      }));
      build.onLoad({ filter: /.*/, namespace }, () => {
        try {
          const { table, dirs } = scanWatchRoutes(root);
          return {
            contents: generateWatchRoutesEntry(table, {
              dir: root,
              ...(importFrom ? { importFrom } : {}),
            }),
            loader: "js",
            resolveDir: root,
            // A new or deleted screen changes the generated entry; esbuild
            // already watches the files it imports, not the folder listings.
            watchDirs: dirs,
          };
        } catch (error) {
          return {
            errors: [
              { text: error instanceof Error ? error.message : String(error) },
            ],
            watchDirs: [root],
          };
        }
      });
    },
  };
}
