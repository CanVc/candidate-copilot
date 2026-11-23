#!/bin/sh
# Use the already-installed project Node, but inherit no Node, TLS, proxy,
# dotenv, Wrangler, browser, credential, XDG or HOME configuration.
# Only a shell builtin resolves the operator's trusted installed binary.
node=$(command -v node) || exit 1
case $node in /*) ;; *) exit 1 ;; esac
case $0 in */*) dir=${0%/*} ;; *) dir=. ;; esac
exec /usr/bin/env -i PATH=/usr/bin:/bin LANG=C.UTF-8 "$node" --no-warnings --experimental-transform-types "$dir/cli.mjs" "$@"
