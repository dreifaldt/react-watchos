import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { watchBuildOptions } from "../esbuild/preset.mts";
import {
  routePathOf,
  routesFromFiles,
  WATCH_ROUTES_ENTRY,
  watchRoutesPlugin,
} from "../esbuild/watch-routes.mts";
import {
  MemoryHost,
  NOT_FOUND_ROUTE,
  type SerializedNode,
  Text,
  useParams,
  VStack,
  WatchRouter,
} from "../src/index";
import { findByText, findByType, mountApp, resetApp } from "../src/testing";

const jsRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

afterEach(resetApp);

describe("watch route conventions", () => {
  it("maps files to Expo Router paths", () => {
    expect(routePathOf("index.tsx")).toBe("/");
    expect(routePathOf("counter.tsx")).toBe("/counter");
    expect(routePathOf("lists/index.tsx")).toBe("/lists");
    expect(routePathOf("lists/[id].tsx")).toBe("/lists/[id]");
    expect(routePathOf("(more)/about.tsx")).toBe("/about");
    expect(routePathOf("docs/[...rest].tsx")).toBe("/docs/[...rest]");
  });

  it("builds the table with nested layouts, skipping non-routes", () => {
    const table = routesFromFiles([
      "_layout.tsx",
      "index.tsx",
      "+not-found.tsx",
      "lists/_layout.tsx",
      "lists/[id].tsx",
      "lists/(admin)/_layout.tsx",
      "lists/(admin)/edit.tsx",
      "lists/helpers.test.tsx",
      "_components/Row.tsx",
      ".hidden/x.tsx",
      "types.d.ts",
      "readme.md",
    ]);
    expect(table.rootLayout).toBe("_layout.tsx");
    expect(table.notFound).toBe("+not-found.tsx");
    expect(table.routes).toEqual([
      { path: "/", file: "index.tsx", layouts: [] },
      {
        path: "/lists/[id]",
        file: "lists/[id].tsx",
        layouts: ["lists/_layout.tsx"],
      },
      {
        path: "/lists/edit",
        file: "lists/(admin)/edit.tsx",
        layouts: ["lists/_layout.tsx", "lists/(admin)/_layout.tsx"],
      },
    ]);
  });

  it("refuses two files for one path, and a nested +not-found", () => {
    expect(() => routesFromFiles(["about.tsx", "(more)/about.tsx"])).toThrow(
      "about.tsx and (more)/about.tsx both map to /about",
    );
    expect(() => routesFromFiles(["lists/+not-found.tsx"])).toThrow(
      "only supported at the root",
    );
  });
});

describe("watchRoutesPlugin", () => {
  const routesDir = (files: Record<string, string>) => {
    const dir = mkdtempSync(join(tmpdir(), "rnw-routes-"));
    for (const [file, source] of Object.entries(files)) {
      mkdirSync(dirname(join(dir, file)), { recursive: true });
      writeFileSync(join(dir, file), source);
    }
    return dir;
  };
  const bundle = async (dir: string) => {
    const outfile = join(dir, "out", "bundle.js");
    await build(
      watchBuildOptions({
        entry: WATCH_ROUTES_ENTRY,
        outfile,
        nodePaths: [join(jsRoot, "node_modules")],
        plugins: [
          watchRoutesPlugin({ dir, importFrom: join(jsRoot, "src/index.ts") }),
        ],
      }),
    );
    return readFileSync(outfile, "utf8");
  };

  it("bundles every screen and layout into one QuickJS entry", async () => {
    const dir = routesDir({
      "_layout.tsx":
        "export default function L({ children }) { return children; }\n",
      "index.tsx":
        'export const options = { title: "Home" };\n' +
        'export default function Home() { return "screen:home"; }\n',
      "lists/[id].tsx":
        'export default function List() { return "screen:list"; }\n',
    });
    const js = await bundle(dir);
    expect(js).toContain("screen:home");
    expect(js).toContain("screen:list");
    expect(js).toContain('"/lists/[id]"');
    expect(js).toContain('"Home"');
  });

  it("fails the build when two files claim one path", async () => {
    const dir = routesDir({
      "about.tsx": "export default function A() { return null; }\n",
      "(more)/about.tsx": "export default function B() { return null; }\n",
    });
    await expect(bundle(dir)).rejects.toThrow("both map to /about");
  });
});

describe("WatchRouter", () => {
  function Shell({ children }: { children?: ReactNode }) {
    return <VStack>{children}</VStack>;
  }
  function ListsLayout({ children }: { children?: ReactNode }) {
    return (
      <VStack>
        <Text>lists layout</Text>
        {children}
      </VStack>
    );
  }
  function ListScreen() {
    const { id } = useParams<"/lists/[id]">();
    return <Text>{`list ${id}`}</Text>;
  }

  it("mounts routes with titles, folder layouts, params and not-found", () => {
    const host = new MemoryHost();
    const app = mountApp(
      <WatchRouter
        routes={[
          {
            path: "/",
            file: "index.tsx",
            module: {
              default: () => <Text>home</Text>,
              options: { title: "Home" },
            },
            layouts: [],
          },
          {
            path: "/lists/[id]",
            file: "lists/[id].tsx",
            module: { default: ListScreen },
            layouts: [
              { file: "lists/_layout.tsx", module: { default: ListsLayout } },
            ],
          },
        ]}
        rootLayout={{ file: "_layout.tsx", module: { default: Shell } }}
        notFound={{
          file: "+not-found.tsx",
          module: { default: () => <Text>nothing here</Text> },
        }}
      />,
      host,
    );
    const latest = (): SerializedNode => {
      const root = host.lastCommit?.root;
      if (!root) throw new Error("nothing committed");
      return root;
    };
    const stack = findByType(latest(), "NavigationStack")[0];
    if (!stack) throw new Error("no stack");
    const routes = findByType(latest(), "NavigationRoute");
    expect(routes.map((r) => r.props.path)).toEqual([
      "/",
      "/lists/[id]",
      NOT_FOUND_ROUTE,
    ]);
    expect(routes[0]?.props.title).toBe("Home");
    expect(findByText(latest(), "home")).toHaveLength(1);

    let seq = 0;
    const go = (path: string[]) =>
      app.dispatchEvent({
        nodeId: stack.id,
        event: "pathChange",
        payload: { path },
        seq: ++seq,
      });
    expect(go(["/lists/7"]).accepted).toBe(true);
    expect(findByText(latest(), "lists layout")).toHaveLength(1);
    expect(findByText(latest(), "list 7")).toHaveLength(1);

    expect(go(["/nowhere"]).accepted).toBe(true);
    expect(findByText(latest(), "nothing here")).toHaveLength(1);
  });
});
