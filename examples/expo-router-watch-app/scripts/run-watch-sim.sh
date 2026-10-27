#!/usr/bin/env bash
# Runs this example's watch app on a watchOS simulator through the repo's
# shared run script (js/scripts/run-watch-sim.sh): it builds the watch bundle
# from watch/, ad-hoc builds the watch scheme, re-signs for the simulator so
# the App Group survives, installs and launches. Run `pnpm prebuild` first.
#
# Usage: pnpm run:watch [SIM_UDID]
set -euo pipefail
HERE=$(cd "$(dirname "$0")/.." && pwd)
APP_DIR="$HERE" \
  WORKSPACE="$HERE/ios/RouterWatchApp.xcworkspace" \
  SCHEME="Router Watch" \
  BUNDLE_ID="com.example.routerwatch.watch" \
  WATCH_PRODUCT="RouterWatch" \
  JS_BUILD="cd '$HERE' && pnpm build:watch" \
  exec bash "$HERE/../../js/scripts/run-watch-sim.sh" "$@"
