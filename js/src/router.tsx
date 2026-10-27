import type { ComponentType, ReactNode } from "react";
import {
  NavigationProvider,
  NavigationRoute,
  NavigationStack,
  useNavigation,
} from "./navigation";

/**
 * The runtime half of file-based watch routes. The build plugin
 * (esbuild/watch-routes.mts) scans the routes folder and mounts this with the
 * table it generated; apps don't render it by hand.
 *
 * Every route becomes a direct `<NavigationRoute>` child of one controlled
 * `<NavigationStack>` — the stack only sees routes declared as its children —
 * so a folder `_layout` wraps the SCREEN inside its route, and the root
 * `_layout` wraps the whole stack. A layout renders `children` the way an
 * Expo Router layout renders `<Slot />`; keep the root one to providers and
 * boundaries, since anything visible it draws sits outside the stack.
 */

/** Per-screen options a route file may export as `options`. */
export interface WatchRouteOptions {
  /** Native navigation title while the screen is shown. */
  title?: string;
}

export interface WatchLayoutProps {
  children?: ReactNode;
}

/** What a screen file exports. */
export interface WatchScreenModule {
  default?: ComponentType;
  options?: WatchRouteOptions;
}

/** What a `_layout` file exports. */
export interface WatchLayoutModule {
  default?: ComponentType<WatchLayoutProps>;
}

export interface WatchRouterRoute {
  path: string;
  file: string;
  module: WatchScreenModule;
  /** Folder layouts around this screen, outermost first. */
  layouts: Array<{ file: string; module: WatchLayoutModule }>;
}

export interface WatchRouterProps {
  routes: WatchRouterRoute[];
  rootLayout?: { file: string; module: WatchLayoutModule };
  notFound?: { file: string; module: WatchScreenModule };
  initialPath?: string[];
}

/** The pattern a `+not-found` screen answers on. A catch-all scores below
 *  every concrete route, so it wins only when nothing else matches. */
export const NOT_FOUND_ROUTE = "/[...unmatched]";

function exported<T>(file: string, value: T | undefined): T {
  if (value === undefined) {
    throw new Error(`watch routes: ${file} has no default export`);
  }
  return value;
}

function screen(
  file: string,
  module: WatchScreenModule,
  layouts: WatchRouterRoute["layouts"],
): ReactNode {
  const Screen = exported(file, module.default);
  let element: ReactNode = <Screen />;
  for (const layout of [...layouts].reverse()) {
    const Layout = exported(layout.file, layout.module.default);
    element = <Layout>{element}</Layout>;
  }
  return element;
}

const titleOf = (module: WatchScreenModule) =>
  module.options?.title === undefined ? {} : { title: module.options.title };

function RouterStack({ routes, rootLayout, notFound }: WatchRouterProps) {
  const { path, setPath } = useNavigation();
  const stack = (
    <NavigationStack path={path} onPathChange={setPath}>
      {routes.map((route) => (
        <NavigationRoute
          key={route.path}
          path={route.path}
          {...titleOf(route.module)}
        >
          {screen(route.file, route.module, route.layouts)}
        </NavigationRoute>
      ))}
      {notFound ? (
        <NavigationRoute path={NOT_FOUND_ROUTE} {...titleOf(notFound.module)}>
          {screen(notFound.file, notFound.module, [])}
        </NavigationRoute>
      ) : null}
    </NavigationStack>
  );
  if (!rootLayout) return stack;
  const Root = exported(rootLayout.file, rootLayout.module.default);
  return <Root>{stack}</Root>;
}

/** Mounts a generated route table: a NavigationProvider around one stack. */
export function WatchRouter({ initialPath, ...table }: WatchRouterProps) {
  return (
    <NavigationProvider {...(initialPath ? { initialPath } : {})}>
      <RouterStack {...table} />
    </NavigationProvider>
  );
}
