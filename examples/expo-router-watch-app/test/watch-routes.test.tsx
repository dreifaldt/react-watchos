import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import {
  MemoryHost,
  type SerializedNode,
  WatchRouter,
  type WatchLayoutModule,
  type WatchScreenModule,
} from "react-watchos";
import { scanWatchRoutes } from "react-watchos/build";
import {
  findByText,
  findByType,
  mountApp,
  resetApp,
} from "react-watchos/testing";
import * as About from "../watch/(settings)/about";
import * as NotFound from "../watch/+not-found";
import * as RootLayout from "../watch/_layout";
import * as Counter from "../watch/counter";
import * as Home from "../watch/index";
import * as LabControls from "../watch/lab/controls";
import * as LabDialogs from "../watch/lab/dialogs";
import * as LabGestures from "../watch/lab/gestures";
import * as LabIndex from "../watch/lab/index";
import * as LabText from "../watch/lab/text";
import * as ListsLayout from "../watch/lists/_layout";
import * as List from "../watch/lists/[id]";

const watchDir = join(dirname(fileURLToPath(import.meta.url)), "..", "watch");

const screens: Record<string, WatchScreenModule> = {
  "index.tsx": Home,
  "counter.tsx": Counter,
  "lists/[id].tsx": List,
  "(settings)/about.tsx": About,
  "lab/index.tsx": LabIndex,
  "lab/text.tsx": LabText,
  "lab/controls.tsx": LabControls,
  "lab/dialogs.tsx": LabDialogs,
  "lab/gestures.tsx": LabGestures,
};
const layouts: Record<string, WatchLayoutModule> = {
  "_layout.tsx": RootLayout,
  "lists/_layout.tsx": ListsLayout,
};

afterEach(resetApp);

describe("watch/ routes", () => {
  const { table } = scanWatchRoutes(watchDir);

  it("maps the folder like Expo Router maps app/", () => {
    expect(table.routes.map((route) => route.path)).toEqual([
      "/",
      "/about",
      "/counter",
      "/lab",
      "/lab/controls",
      "/lab/dialogs",
      "/lab/gestures",
      "/lab/text",
      "/lists/[id]",
    ]);
    // lab/_kit.tsx is a helper, not a route.
    expect(table.routes.some((route) => route.file.includes("_kit"))).toBe(
      false,
    );
    expect(table.rootLayout).toBe("_layout.tsx");
    expect(table.notFound).toBe("+not-found.tsx");
    expect(
      table.routes.find((route) => route.path === "/lists/[id]")?.layouts,
    ).toEqual(["lists/_layout.tsx"]);
  });

  it("renders the screens, the folder layout and not-found", () => {
    const host = new MemoryHost();
    const app = mountApp(
      <WatchRouter
        routes={table.routes.map((route) => ({
          path: route.path,
          file: route.file,
          module: screens[route.file] ?? {},
          layouts: route.layouts.map((file) => ({
            file,
            module: layouts[file] ?? {},
          })),
        }))}
        rootLayout={{ file: "_layout.tsx", module: RootLayout }}
        notFound={{ file: "+not-found.tsx", module: NotFound }}
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
    expect(
      findByType(latest(), "NavigationLink").map((link) => link.props.label),
    ).toEqual(["Core Lab", "Counter", "Day hike", "Gym", "About", "Broken link"]);

    let seq = 0;
    const go = (path: string[]) =>
      app.dispatchEvent({
        nodeId: stack.id,
        event: "pathChange",
        payload: { path },
        seq: ++seq,
      });
    go(["/lists/hike"]);
    expect(findByText(latest(), "• Rain jacket")).toHaveLength(1);
    expect(findByText(latest(), "watch/lists/_layout.tsx")).toHaveLength(1);
    go(["/nowhere"]);
    expect(findByText(latest(), "No screen here")).toHaveLength(1);
  });
});
