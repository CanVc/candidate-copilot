#!/usr/bin/env bash
# No framework or installed toolchain required: disposable executable PATH fixtures.
set -euo pipefail
script_path=${BASH_SOURCE[0]}
[[ $script_path == */* ]] || script_path=./$script_path
root=$(cd -- "${script_path%/*}/../.." && pwd)
tmp=$(mktemp -d)
trap 'rm -rf -- "$tmp"' EXIT
mkdir -p "$tmp/bin" "$tmp/outside"
export FIXTURE_OS_RELEASE="$tmp/os-release"
export FIXTURE_CALLS="$tmp/calls"
checks=0

stub() {
  local name=$1 output=$2 status=${3:-0}
  {
    printf '#!/bin/bash\n'
    printf '[[ ${1-} == --version && $# == 1 ]] || exit 99\n'
    printf 'printf "%%s\\n" %q >> "$FIXTURE_CALLS"\n' "$name"
    printf 'printf "%%s\\n" %q\nexit %s\n' "$output" "$status"
  } > "$tmp/bin/$name"
  chmod +x "$tmp/bin/$name"
}

reset_fixtures() {
  rm -f -- "$tmp/bin/"*
  : > "$FIXTURE_CALLS"
  printf 'ID=ubuntu\nVERSION_ID="24.04"\n' > "$FIXTURE_OS_RELEASE"
  cat > "$tmp/bin/cat" <<'STUB'
#!/bin/bash
[[ $# == 1 && $1 == /etc/os-release ]] || exit 99
exec /bin/cat "$FIXTURE_OS_RELEASE"
STUB
  chmod +x "$tmp/bin/cat"
  stub git 'git version 2.43.0'
  stub node "v$(< "$root/.node-version")"
  stub npm '11.19.1'
}

run_case() {
  local name=$1 expected=$2 diagnostic=$3 status=0
  shift 3
  # Every invocation is outside the repository, with no host tools on PATH.
  (cd "$tmp/outside" && PATH="$tmp/bin" /bin/bash "$root/scripts/check-workstation.sh" "$@") > "$tmp/output" 2>&1 || status=$?
  if { [[ $expected == pass ]] && (( status != 0 )); } ||
     { [[ $expected == fail ]] && (( status == 0 )); } ||
     ! grep -Fq -- "$diagnostic" "$tmp/output"; then
    printf 'FAIL test: %s (exit %s, expected %s / %s)\n' "$name" "$status" "$expected" "$diagnostic" >&2
    cat "$tmp/output" >&2
    exit 1
  fi
  if (( $# == 0 )) && grep -Eq '^(python3|uv)$' "$FIXTURE_CALLS"; then
    printf 'FAIL test: %s executed optional BMAD tooling\n' "$name" >&2
    exit 1
  fi
  if [[ $expected == fail ]]; then
    grep -Fq 'docs/development/workstation.md#' "$tmp/output"
    if grep -Fq 'prerequisites ready' "$tmp/output"; then
      printf 'FAIL test: %s reported readiness on failure\n' "$name" >&2
      exit 1
    fi
  fi
  checks=$((checks + 1))
  printf 'PASS test: %s\n' "$name"
}

reset_fixtures
run_case 'ready without Python or uv, outside repository' pass 'Application prerequisites ready'
stub python3 'Python 1.0.0' 42
stub uv 'uv broken' 42
run_case 'default ignores broken BMAD tools' pass 'Application prerequisites ready'
if grep -Eq 'python3|uv broken' "$tmp/output"; then exit 1; fi

reset_fixtures
stub python3 'Python 3.12.3'
stub uv 'uv 0.11.15 (x86_64-unknown-linux-gnu)'
run_case 'BMAD ready' pass 'BMAD tool versions ready' --bmad
stub python3 'Python 3.11.0'
stub uv 'uv 0.11.15'
run_case 'BMAD minimum Python and plain uv' pass 'BMAD tool versions ready' --bmad

for tool in git node npm python3 uv; do
  reset_fixtures
  stub python3 'Python 3.12.3'
  stub uv 'uv 0.11.15'
  rm -- "$tmp/bin/$tool"
  run_case "missing $tool" fail "$tool is missing from PATH" --bmad
  case "$tool" in
    git) output='git version 2.43.0' ;;
    node) output="v$(< "$root/.node-version")" ;;
    npm) output='11.19.1' ;;
    python3) output='Python 3.12.3' ;;
    uv) output='uv 0.11.15' ;;
  esac
  stub "$tool" "$output" 7
  run_case "broken $tool despite valid-looking version" fail "$tool --version failed" --bmad
done

reset_fixtures
stub git 'git version 2.42.9'
run_case 'old Git' fail 'require Git >=2.43.0'
stub git 'git version 2.9.0'
run_case 'cross-width old Git' fail 'require Git >=2.43.0'
for version in 2.43.0-rc0 2.43.0.rc0 2.43.0~rc0 2.43.0+alpha1; do
  stub git "git version $version"
  run_case "prerelease Git $version" fail 'require Git >=2.43.0'
done
stub git 'git version 2.44.0'
run_case 'newer Ubuntu Git' pass 'git version 2.44.0'
stub git 'git version 2.43.0.ubuntu1'
run_case 'distribution suffix accepted' pass 'git version 2.43.0.ubuntu1'
stub git 'git version nonsense'
run_case 'malformed Git' fail 'require Git >=2.43.0'
stub git 'git version 2.43'
run_case 'incomplete Git version' fail 'require Git >=2.43.0'

reset_fixtures
stub node 'v24.15.0'
run_case 'historical Node' fail 'require v24.22.0 from .node-version'
reset_fixtures
stub npm '11.12.1'
run_case 'historical npm' fail 'require bundled npm 11.19.1'
for tool in node npm; do
  reset_fixtures
  stub "$tool" 'malformed version'
  run_case "malformed $tool" fail "reported 'malformed version'"
done

for version in 'Python 3.10.9' 'Python 3.9.18' 'Python malformed' 'Python 3.12'; do
  reset_fixtures
  stub python3 "$version"
  stub uv 'uv 0.11.15'
  run_case "unsupported $version" fail 'BMAD requires Python >=3.11' --bmad
done
for version in 'uv 0.11.14' 'uv malformed' 'uv 0.11.15garbage'; do
  reset_fixtures
  stub python3 'Python 3.12.3'
  stub uv "$version"
  run_case "unsupported $version" fail 'require uv 0.11.15' --bmad
done

reset_fixtures
run_case 'unknown argument' fail 'Usage:' --unknown
run_case 'extra argument' fail 'Usage:' --bmad extra
run_case 'empty argument' fail 'Usage:' ''
run_case 'duplicate argument' fail 'Usage:' --bmad --bmad
printf 'ID=debian\nVERSION_ID="24.04"\n' > "$FIXTURE_OS_RELEASE"
run_case 'non-Ubuntu' fail 'Unsupported platform'
printf 'ID=ubuntu\nVERSION_ID="22.04"\n' > "$FIXTURE_OS_RELEASE"
run_case 'old Ubuntu' fail 'Unsupported platform'
printf 'ID=ubuntu\n' > "$FIXTURE_OS_RELEASE"
run_case 'missing platform version' fail 'Unsupported platform'
rm -- "$FIXTURE_OS_RELEASE"
run_case 'unreadable platform' fail 'Cannot read /etc/os-release'
# Vary the pin independently in a disposable clone of just the gate and marker.
reset_fixtures
original_root=$root
mkdir -p "$tmp/project/scripts"
cp "$root/scripts/check-workstation.sh" "$tmp/project/scripts/"
printf '24.23.0\n' > "$tmp/project/.node-version"
root="$tmp/project"
stub node 'v24.23.0'
run_case 'gate consumes alternate Node pin' pass 'Node v24.23.0'
stub node "v$(< "$original_root/.node-version")"
run_case 'gate rejects former Node pin' fail 'require v24.23.0 from .node-version'
root=$original_root
printf 'All %s workstation fixture tests passed.\n' "$checks"
