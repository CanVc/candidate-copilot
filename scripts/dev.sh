#!/usr/bin/env bash
# Select the installed toolchain and supervise only this invocation's services.
if [[ ${BASH_SOURCE[0]} != "$0" ]]; then
  printf 'Run this script with bash; do not source it.\n' >&2
  return 2
fi
set -euo pipefail

usage() {
  printf 'Usage: bash scripts/dev.sh [all|worker|frontend|--help]\n'
  printf 'Default: all. Ctrl+C stops every service started by this invocation.\n'
  printf 'Tools and dependencies must already be installed; see docs/development/application.md.\n'
}

if (( $# > 1 )); then usage >&2; exit 2; fi
mode=${1-all}
case "$mode" in
  --help|-h) usage; exit 0 ;;
  all) services=(worker frontend) ;;
  worker|frontend) services=("$mode") ;;
  *) usage >&2; exit 2 ;;
esac

fail() {
  printf 'Development startup failed: %s\n' "$1" >&2
  exit 1
}

script_path=${BASH_SOURCE[0]}
[[ $script_path == */* ]] || script_path=./$script_path
root=$(cd -- "${script_path%/*}/.." && pwd -P)
cd -- "$root"
export PROJECT_ROOT="$root"
[[ -r .node-version ]] || fail 'Missing .node-version; restore the repository pin.'
required_node=$(< .node-version)
[[ $required_node =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]] || fail 'Invalid .node-version; restore the repository pin.'

export PATH="$HOME/.local/share/fnm:$PATH"
command -v fnm >/dev/null 2>&1 || fail 'fnm is missing. Follow docs/development/workstation.md#node-and-npm.'
fnm_env=$(fnm env --shell bash) || fail 'fnm environment initialization failed. See docs/development/workstation.md#troubleshooting.'
eval "$fnm_env" || fail 'Cannot apply the fnm Bash environment.'
fnm use "$required_node" || fail 'Cannot select the pinned Node. Follow docs/development/workstation.md#node-and-npm; nothing is installed automatically.'
hash -r
bash scripts/check-workstation.sh || fail 'Workstation checks failed. See docs/development/workstation.md#troubleshooting.'
command -v setsid >/dev/null 2>&1 || fail 'setsid is missing. See the util-linux prerequisites in docs/development/application.md.'
for service in "${services[@]}"; do
  binary=vite
  [[ $service != worker ]] || binary=wrangler
  [[ -x node_modules/.bin/$binary ]] || fail "Missing local $binary. Complete docs/development/application.md#current-setup-and-checks first."
done

# Noninteractive Bash must not create background job groups: setsid must exec
# without forking so that $! is the new, owned process-group ID.
set +m
children=()
cleanup() {
  local status=$? pid active deadline
  trap - EXIT
  # Keep repeated terminal interruptions from cutting cleanup short.
  trap '' INT TERM
  deadline=$((SECONDS + 5))
  while (( SECONDS < deadline )); do
    active=false
    for pid in "${children[@]}"; do
      # The direct child may not have entered setsid yet on an early signal.
      if kill -0 -- "-$pid" 2>/dev/null; then
        kill -TERM -- "-$pid" 2>/dev/null || true
        active=true
      elif kill -0 "$pid" 2>/dev/null; then
        kill -TERM "$pid" 2>/dev/null || true
        active=true
      fi
    done
    [[ $active == true ]] || break
    sleep 0.1
  done
  for pid in "${children[@]}"; do
    if kill -0 -- "-$pid" 2>/dev/null; then
      printf 'Stopping unresponsive owned %s process group.\n' "$pid" >&2
      kill -KILL -- "-$pid" 2>/dev/null || true
    fi
    kill -KILL "$pid" 2>/dev/null || true
    wait "$pid" 2>/dev/null || true
  done
  exit "$status"
}
trap cleanup EXIT
# Defer interruption until each new PID has been recorded for cleanup.
interrupted=0
trap 'if (( interrupted == 0 )); then interrupted=130; fi' INT
trap 'if (( interrupted == 0 )); then interrupted=143; fi' TERM

for service in "${services[@]}"; do
  printf 'Starting %s (npm run dev:%s).\n' "$service" "$service"
  # No interactive input or automatic answers; Worker retains its protected CI
  # command and both services retain the existing local npm configuration.
  setsid npm run "dev:$service" </dev/null &
  children+=("$!")
  (( interrupted == 0 )) || exit "$interrupted"
done
trap 'exit 130' INT
trap 'exit 143' TERM
(( interrupted == 0 )) || exit "$interrupted"
printf 'Ctrl+C stops this launcher and its services.\n'
if [[ $mode != worker ]]; then printf 'Frontend: http://127.0.0.1:5173/\n'; fi
status=0
if (( ${#children[@]} == 1 )); then
  wait "${children[0]}" || status=$?
else
  finished=
  wait -n -p finished "${children[@]}" || status=$?
  # A very early exit may already have left Bash's active-job table. Explicit
  # wait still retrieves its cached status instead of reporting a spurious 127.
  if [[ -z ${finished:-} ]]; then
    for pid in "${children[@]}"; do
      if ! kill -0 "$pid" 2>/dev/null; then
        status=0
        wait "$pid" || status=$?
        break
      fi
    done
  fi
fi
printf 'A development service exited (status %s); stopping owned services.\n' "$status" >&2
# A dev server is expected to keep running, even if it unexpectedly exits 0.
(( status != 0 )) || status=1
exit "$status"
