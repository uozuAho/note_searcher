#!/bin/bash

set -eu

npm run e2e:compile
npx extest run-tests 'e2e-out/default_settings/*.js'
npx extest run-tests 'e2e-out/dead_links_on/*.js' -o e2e/dead_links_on/settings.json
