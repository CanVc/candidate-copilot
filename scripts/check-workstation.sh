#!/usr/bin/env bash
# Read-only, offline prerequisite gate. Installation belongs in the guide.
set -uo pipefail

script_path=${BASH_SOURCE[0]}
[[ $script_path == */* ]] || script_path=./$script_path
script_dir=$(cd -- "${script_path%/*}" && pwd) || exit 1
project_root=$(cd -- "$script_dir/.." && pwd) || exit 1
guide="$project_root/docs/development/workstation.md"
bmad=false
failures=0

fail() {
  printf 'FAIL: %s\n  See %s#%s\n' "$1" "$guide" "$2" >&2
  failures=$((failures + 1))
}

case "${1-}" in
  '')
    if (( $# != 0 )); then
      fail 'Usage: bash scripts/check-workstation.sh [--bmad]' verify
      exit 1
    fi ;;
  --bmad)
    if (( $# != 1 )); then
      fail 'Usage: bash scripts/check-workstation.sh [--bmad]' verify
      exit 1
    fi
    bmad=true ;;
  *)
    fail 'Usage: bash scripts/check-workstation.sh [--bmad]' verify
    exit 1 ;;
esac

# Parse data, never source executable shell content from os-release.
if ! os_release=$(cat /etc/os-release 2>/dev/null); then
  fail 'Cannot read /etc/os-release; only Ubuntu 24.04 LTS is supported.' platform
  exit 1
fi
os_id= os_version=
while IFS='=' read -r key value; do
  case "$value" in
    \"*\") value=${value:1:${#value}-2} ;;
    \'*\') value=${value:1:${#value}-2} ;;
  esac
  case "$key" in
    ID) os_id=$value ;;
    VERSION_ID) os_version=$value ;;
  esac
done <<< "$os_release"
if [[ $os_id != ubuntu || $os_version != 24.04 ]]; then
  fail "Unsupported platform: ID=${os_id:-unknown}, VERSION_ID=${os_version:-unknown}; require Ubuntu 24.04 LTS." platform
  exit 1
fi
printf 'PASS: Ubuntu 24.04 LTS\n'

required_node=$(< "$project_root/.node-version")
if [[ ! $required_node =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  fail 'Invalid .node-version; restore the committed Node pin.' node-and-npm
  exit 1
fi

# Capture failures as well as output: a plausible version with nonzero exit is broken.
version_output() {
  local tool=$1 section=$2
  if ! command -v "$tool" >/dev/null 2>&1; then
    fail "$tool is missing from PATH." "$section"
    return 1
  fi
  if ! actual=$("$tool" --version 2>&1); then
    fail "$tool --version failed: ${actual:-no output}." "$section"
    return 1
  fi
}

# Compare numeric components without integer overflow or octal interpretation.
at_least() {
  local actual_version=$1 minimum=$2 a b i
  local -a actual_parts minimum_parts
  IFS=. read -r -a actual_parts <<< "$actual_version"
  IFS=. read -r -a minimum_parts <<< "$minimum"
  for i in 0 1 2; do
    a=${actual_parts[i]}; b=${minimum_parts[i]}
    while [[ ${#a} -gt 1 && $a == 0* ]]; do a=${a#0}; done
    while [[ ${#b} -gt 1 && $b == 0* ]]; do b=${b#0}; done
    if (( ${#a} > ${#b} )); then return 0; fi
    if (( ${#a} < ${#b} )); then return 1; fi
    if [[ $a > $b ]]; then return 0; fi
    if [[ $a < $b ]]; then return 1; fi
  done
  return 0
}

if version_output git git; then
  if [[ ! $actual =~ [.+~-](rc|alpha|beta|pre|dev)([0-9.+~-]|$) ]] &&
     [[ $actual =~ ^git\ version\ ([0-9]+\.[0-9]+\.[0-9]+)([.+~-][[:alnum:].+~_-]+)?$ ]] &&
     at_least "${BASH_REMATCH[1]}" 2.43.0; then
    printf 'PASS: %s (require Git >=2.43.0)\n' "$actual"
  else
    fail "Git reported '$actual'; require Git >=2.43.0 from Ubuntu packages." git
  fi
fi
if version_output node node-and-npm; then
  if [[ $actual == "v$required_node" ]]; then
    printf 'PASS: Node %s\n' "$actual"
  else
    fail "Node reported '$actual'; require v$required_node from .node-version." node-and-npm
  fi
fi
if version_output npm node-and-npm; then
  if [[ $actual == 11.19.1 ]]; then
    printf 'PASS: npm %s\n' "$actual"
  else
    fail "npm reported '$actual'; require bundled npm 11.19.1." node-and-npm
  fi
fi

if $bmad; then
  if version_output python3 bmad-tooling; then
    if [[ $actual =~ ^Python\ ([0-9]+\.[0-9]+\.[0-9]+)$ ]] &&
       at_least "${BASH_REMATCH[1]}" 3.11.0; then
      printf 'PASS: %s (BMAD requires >=3.11; Ubuntu supplies 3.12)\n' "$actual"
    else
      fail "python3 reported '$actual'; BMAD requires Python >=3.11 (use Ubuntu 3.12)." bmad-tooling
    fi
  fi
  if version_output uv bmad-tooling; then
    if [[ $actual =~ ^uv\ 0\.11\.15(\ \([^\(\)]+\))?$ ]]; then
      printf 'PASS: %s\n' "$actual"
    else
      fail "uv reported '$actual'; require uv 0.11.15." bmad-tooling
    fi
  fi
fi

if (( failures > 0 )); then
  printf 'Workstation NOT ready: %s failed check(s).\n' "$failures" >&2
  exit 1
fi
printf 'Application prerequisites ready for Story 1.2 (dependency compatibility is not checked).\n'
if $bmad; then
  printf 'BMAD tool versions ready; run the separate resolver smoke in the guide.\n'
fi
