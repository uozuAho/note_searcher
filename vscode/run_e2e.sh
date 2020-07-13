#!/bin/bash

set -eu

npm run e2e:compile
npx extest run-tests 'e2e-out/default_settings/*.js'
