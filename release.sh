#!/usr/bin/env bash

cd "$(cd "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
set -e

if [[ -z $1 ]]; then
  VERSION_HELP="$(npm version -h)"
  VERSION_HELP="${VERSION_HELP/alias: verison/}"
  VERSION_HELP=$(echo "$VERSION_HELP" | sed '/^$/N;/^\n$/D')
  echo
  echo "${VERSION_HELP/npm version /"${BASH_SOURCE[0]} "}"
  cd --
  exit 1
fi

VERSION="$(npm version "$@" -m "Updated version to %s")"

git push
git push origin $VERSION

echo $VERSION

cd --
