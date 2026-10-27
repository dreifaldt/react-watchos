# expo-router-watch-app

Expo Router on the phone and file-based routes on the watch, **side by side
with the same conventions**:

```
app/                  Expo Router: the iPhone app
  _layout.tsx         <Stack />
  index.tsx           /
  lists/[id].tsx      /lists/[id]
watch/                react-watchos: the watch app
  _layout.tsx         wraps the whole watch stack (ErrorBoundary, OTA health)
  index.tsx           /
  counter.tsx         /counter
  lists/_layout.tsx   wraps every screen under lists/
  lists/[id].tsx      /lists/[id]          useParams<"/lists/[id]">()
  (settings)/about.tsx  /about             a group adds no segment
  +not-found.tsx      anything nothing else matches
shared/lists.ts       plain TS both sides import
targets/watch/        the watch target's Swift glue (react-watchos scaffold)
```

Each watch screen default-exports its component and may export
`options = { title }`. A `_layout` renders its `children` (Expo Router's
`<Slot />`). Files and folders starting with `_` (other than `_layout`) or
`.`, tests and `.d.ts` files are not routes, so helpers can sit beside the
screens. Two files that claim one path fail the build, as in Expo Router.

There is no hand-written watch entry. `react-watchos build --routes watch`
(and `dev --routes watch`) generate it at build time: an esbuild plugin scans
`watch/`, imports every screen and layout, and mounts them with `WatchRouter`
(one `NavigationStack`, so deep links, `href()` and `useParams()` work as
everywhere else in react-watchos). With neither `--entry` nor `--routes`, the
CLI picks up a `./watch` folder by convention.

## Run it

```bash
pnpm --filter expo-router-watch-app test        # routes table + rendering
pnpm --filter expo-router-watch-app build:watch # watch/ -> targets/watch/assets/bundle.js
pnpm --filter expo-router-watch-app prebuild    # generates ios/ (macOS)
pnpm --filter expo-router-watch-app run:watch   # build, re-sign, launch on a watch sim
```

`pnpm dev:watch` serves a live-reload bundle that DEBUG watch builds poll;
adding or deleting a file under `watch/` regenerates the routes.

## Not yet

- Typed routes (Expo Router's generated `href` types): `href()` already types
  the params of a template, but nothing checks that the template exists.
- Nested navigators: the watch has one stack, so a folder `_layout` wraps its
  screens rather than starting a new navigator.
- Widgets and App Intents still use their own entry (see
  [`expo-watch-app`](../expo-watch-app)).
