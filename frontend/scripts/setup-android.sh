#!/usr/bin/env sh
set -eu
cd "$(dirname "$0")/.."
npm install
if [ ! -d android ]; then
  npm run cap:add
fi
npm run cap:sync
printf '\nAndroid platform is ready. Open it with: npm run cap:open\n'
