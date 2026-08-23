#!/usr/bin/env bash

set -o errexit
set -o nounset
set -o pipefail

SCRIPT_DIR="$(dirname -- "${BASH_SOURCE[0]}")"

# build in parallel
npm run deploy:html &
npm run deploy:js &
wait

# copy contents of deploy/ to dithermark/

rsync --recursive --itemize-changes --human-readable --exclude='*.DS_STORE' --exclude='*.directory' --exclude='/api' "$SCRIPT_DIR/deploy/" "$SCRIPT_DIR/dithermark/"

# zip dithermark
zip -r dithermark.zip "$SCRIPT_DIR/dithermark"

# open index.html in browser for testing
open "$SCRIPT_DIR/dithermark/index.html"

