# Ubuntu workstation toolchain — Story 1.1

Selected and verified **2026-10-19**. Target: **Ubuntu 24.04 LTS, Bash**, including 24.04.5. These are deliberately selected versions, not claims that every pin is the latest release. This guide prepares application prerequisites **before** initialization; application/dependency compatibility belongs to Story 1.2.

## Platform

```bash
cat /etc/os-release
uname -m
```

Require `ID=ubuntu` and `VERSION_ID="24.04"`. Other Ubuntu releases, Ubuntu derivatives, macOS and Windows are unsupported by this gate. Do not falsify `/etc/os-release` to bypass it. Arrange a supported Ubuntu workstation instead. Installer downloads must support the reported CPU architecture; execution below was tested only on x86_64.

**Access and side effects:** Internet is required for Ubuntu package indexes/packages, GitHub/fnm, Node downloads and (optionally) Astral/uv. A fresh clone also requires repository access. `sudo` is needed **only** for the explicitly shown `apt-get` commands. Read those commands before executing: they change OS packages. Everything else runs as your normal user, writes user-owned installation directories or temporary files, and needs no root access. The prerequisite gate itself never installs, downloads, edits shell files or changes packages. No Cloudflare account, hosted service, production secret or live-model credential is needed.

## Git

Install Ubuntu-maintained Git and download/unpacking utilities, accepting Ubuntu's security and maintenance revisions rather than freezing a Debian package revision:

```bash
sudo apt-get update
sudo apt-get install --yes git curl ca-certificates unzip xz-utils less
git --version                         # require >=2.43.0
apt-cache policy git                  # inspect installed/candidate Ubuntu package
```

Use Ubuntu's configured official repositories, not a third-party Git PPA. Keep distribution security updates enabled. Git's upstream version output need not show the Ubuntu package's security revision; `apt-cache policy git` does. The read-only gate checks the executed version, not package provenance.

If the repository is not cloned yet, clone it using its actual authorized URL and enter it. For an existing clone, enter its root now. Set this variable for subsequent commands (replace the example path):

```bash
cd "$HOME/dev/candidate-copilot"
export PROJECT_ROOT="$PWD"
```

Do not proceed with Story 1.2 until the application gate passes.

## Node and npm

Use **fnm 1.39.0**, installed per user, to select the committed `.node-version` (**24.22.0**). That Node distribution bundles **npm 11.19.1**. fnm is the installation/version-selection tool, not a runtime prerequisite checked by the gate.

Download the versioned official installer to a temporary file, **review it before running**, and stop if anything is unexpected. Never pipe a downloaded installer straight into a shell. No `sudo`:

```bash
FNM_SETUP_DIR=$(mktemp -d)
curl --fail --show-error --location \
  https://raw.githubusercontent.com/Schniz/fnm/v1.39.0/.ci/install.sh \
  --output "$FNM_SETUP_DIR/install.sh" &&
less "$FNM_SETUP_DIR/install.sh" &&    # review; q only closes the pager
read -r -p 'Run the reviewed fnm installer? Type yes: ' FNM_APPROVAL &&
[[ $FNM_APPROVAL == yes ]] &&
bash "$FNM_SETUP_DIR/install.sh" \
  --release v1.39.0 --install-dir "$HOME/.local/share/fnm" --skip-shell
rm -rf -- "$FNM_SETUP_DIR"             # only this disposable download directory
```

If `curl` fails, **stop**; do not execute a missing, partial or previously downloaded installer. `--release` pins the binary as well as the installer source; `--skip-shell` prevents automatic shell configuration changes. The installer downloads the architecture-specific GitHub release and needs `curl`/`unzip`.

With your editor, add the following **once** to your own `~/.bashrc`, not `/etc/profile` or another global shell file. Also execute these two lines in the current Bash session (or open a new interactive Bash):

```bash
export PATH="$HOME/.local/share/fnm:$PATH"
eval "$(fnm env --use-on-cd --shell bash)"
```

Then select the repository pin; `fnm install` needs Internet, and `fnm use` selects it only for your shell. fnm creates a default alias on the first install: capture whether one exists and remove only the newly created default, preserving the existing default or its absence. Do not change the global/default Node version to satisfy this project:

```bash
fnm --version                         # fnm 1.39.0
cd "$PROJECT_ROOT"
NODE_VERSION=$(cat .node-version)
NODE_DEFAULT_BEFORE=$(fnm default 2>/dev/null || true)
fnm install "$NODE_VERSION" &&
{ if [[ -z $NODE_DEFAULT_BEFORE ]]; then fnm unalias default; fi; } &&
fnm use "$NODE_VERSION"
hash -r
node --version                        # v24.22.0
npm --version                         # 11.19.1, bundled with that Node
```

Do **not** use `sudo npm`, `npm install -g npm`, or an unpinned global npm upgrade. Do not install application packages yet. The committed pin, rather than a duplicated Node installation command, is the source of the selected Node version.

## Verify

From the repository root:

```bash
bash scripts/check-workstation.sh
```

Or from any directory, with the absolute path to the clone:

```bash
bash "$PROJECT_ROOT/scripts/check-workstation.sh"
```

A successful run prints the platform and Git/Node/npm versions and exits **0**. Missing tools, failing version commands, malformed/incorrect versions, unsupported platform and unsupported arguments exit **nonzero** and point to corrective guide sections. Only `--bmad` is supported as an optional argument; default mode neither requires nor executes Python/uv. The gate uses no network, sudo, package manager, writes or application dependencies. It executes each relevant tool's `--version` command; checking a file's existence alone is not considered success.

The gate establishes tool readiness, not package compatibility, full fresh-clone readiness, executable provenance or hosted/product readiness. Fix all failures before Story 1.2.

## BMAD tooling

**Optional and separate from the TypeScript application runtime.** For BMAD work, use Ubuntu's Python **3.12** (BMAD's resolver requires **>=3.11**) and **uv 0.11.15**. Routine application development does not require these tools, manual Python activation, a repository `.venv`, or Python application dependencies. Preserve installed `_bmad/` and `.agents/` files.

Install Python from Ubuntu (Internet/sudo required only for apt):

```bash
sudo apt-get update
sudo apt-get install --yes python3
python3 --version                     # Ubuntu 24.04 supplies Python 3.12.x
```

Download and review the versioned uv installer before running it, as your normal user. Stop on any download error:

```bash
UV_SETUP_DIR=$(mktemp -d)
curl --fail --show-error --location https://astral.sh/uv/0.11.15/install.sh \
  --output "$UV_SETUP_DIR/install.sh" &&
less "$UV_SETUP_DIR/install.sh" &&    # review; q only closes the pager
read -r -p 'Run the reviewed uv installer? Type yes: ' UV_APPROVAL &&
[[ $UV_APPROVAL == yes ]] &&
UV_INSTALL_DIR="$HOME/.local/bin" UV_NO_MODIFY_PATH=1 \
  sh "$UV_SETUP_DIR/install.sh"
rm -rf -- "$UV_SETUP_DIR"              # only this disposable download directory
```

`UV_NO_MODIFY_PATH=1` prevents automatic shell-file edits. Add this line once to your own `~/.bashrc` and execute it in the current session:

```bash
export PATH="$HOME/.local/bin:$PATH"
hash -r
uv --version                         # uv 0.11.15 (optional build information)
```

Verify BMAD tool versions and run the existing read-only resolver smoke:

```bash
cd "$PROJECT_ROOT"
bash scripts/check-workstation.sh --bmad
uv run _bmad/scripts/resolve_config.py --project-root "$PWD" --key core.project_name
```

Expect exit 0 and JSON containing `"core.project_name": "candidate-copilot"`. The existing script uses PEP 723 metadata (`requires-python = ">=3.11"`) and the Python standard library; `uv run` needs no manual activation or repository virtualenv here. The gate checks versions only; the resolver smoke separately proves actual BMAD execution/configuration. uv may use its per-user cache. If Python discovery is wrong, explicitly select the Ubuntu interpreter with `uv run --python /usr/bin/python3 _bmad/scripts/resolve_config.py --project-root "$PROJECT_ROOT" --key core.project_name`; do not edit installed BMAD code or create a local virtualenv to compensate.

## Troubleshooting

- **Missing command or wrong PATH:** run `type -a git node npm fnm python3 uv` (missing optional tools are fine in application mode). Inspect `printf '%s\n' "$PATH"`. Open a fresh Bash or execute the relevant per-user PATH/fnm setup above, then `hash -r`. `which`/`command -v` alone do not prove execution; rerun `--version` and the gate. A stale system Node/npm, alias, shim or older user installation can shadow the selected tools.
- **Git missing/old/malformed:** return to [Git](#git), inspect `apt-cache policy git`, and install/update Ubuntu's Git. Fix package-source/download errors rather than adding a PPA or accepting a version below 2.43.0. Gate success does not prove your Git package is Ubuntu-maintained.
- **Node or npm mismatch/broken execution:** return to [Node and npm](#node-and-npm). In a correctly initialized Bash, run `fnm use "$(cat "$PROJECT_ROOT/.node-version")"`, `hash -r`, and inspect `type -a node npm`. Both must come from the selected Node installation. If that installation is corrupt or its bundled npm was upgraded, reinstall that specific Node version using fnm (confirm any other projects using it first). Do not repair it with sudo or a global npm upgrade. The historical Node 24.15.0/npm 11.12.1 must fail this gate.
- **Downloads/TLS/permissions:** check Internet, DNS, proxy configuration, system time, CA certificates and access to the official URLs below. Retry into a fresh temporary directory; do not use `curl -k`, ignore a failed download, or execute partial scripts. `Permission denied` in user installation directories usually means an earlier root-owned install: inspect `ls -ld "$HOME/.local" "$HOME/.local/bin" "$HOME/.local/share/fnm"`. Have the owner/admin correct only the affected paths; do not broadly `chmod 777`, recursively change ownership of your home, or rerun installers with sudo. If sudo is unavailable, an administrator must perform the explicit apt steps.
- **Python/uv failure:** return to [BMAD tooling](#bmad-tooling), check `python3 --version`, `uv --version` and PATH. Install Ubuntu's Python, not a replacement for `/usr/bin/python3`; use uv 0.11.15, not an arbitrary self-update. Recheck `--bmad`, then the resolver. Configuration errors after version success concern the existing BMAD setup, not application runtime dependencies.
- **Unsupported platform/usage:** see [Platform](#platform) and [Verify](#verify). Invoke with no argument or just `--bmad`. Do not change the gate's platform data or version pins to suppress failures.

## Dated official selection evidence

Checked **2026-10-19**. Historical architecture candidates are not inherited guarantees:

| Selection | Official reference and evidence |
| --- | --- |
| Node 24.22.0 + bundled npm 11.19.1 | [Node distribution index](https://nodejs.org/dist/index.json) lists `v24.22.0`, release date `2026-10-14`, npm `11.19.1`, LTS `Krypton`. [Release schedule/status](https://nodejs.org/en/about/previous-releases) identifies Node 24 as LTS. [Release files/checksums](https://nodejs.org/dist/v24.22.0/) provide the binary distributions. |
| npm compatibility with selected Node | [Official npm registry metadata for 11.19.1](https://registry.npmjs.org/npm/11.19.1) declares Node `^20.17.0 || >=22.9.0`, which includes 24.22.0. This is npm's engine compatibility, not evidence for future Vite/Wrangler/etc. dependencies. |
| Git >=2.43.0 from Ubuntu | [Ubuntu Noble Git package](https://launchpad.net/ubuntu/noble/+package/git); keep Ubuntu maintenance/security revisions. Observed upstream output is `git version 2.43.0`; do not freeze a distribution revision. |
| fnm 1.39.0 | [Official versioned source](https://github.com/Schniz/fnm/tree/v1.39.0), [installer source](https://github.com/Schniz/fnm/blob/v1.39.0/.ci/install.sh) and [release](https://github.com/Schniz/fnm/releases/tag/v1.39.0). Installer supports `--release`, `--install-dir`, `--skip-shell`. |
| Ubuntu Python 3.12; BMAD >=3.11 | [Ubuntu Noble Python package](https://packages.ubuntu.com/noble/python3); existing `_bmad/scripts/resolve_config.py` declares `>=3.11` and uses standard-library `tomllib`. |
| uv 0.11.15 | [Official installation documentation](https://docs.astral.sh/uv/getting-started/installation/), [release](https://github.com/astral-sh/uv/releases/tag/0.11.15), [versioned installer](https://astral.sh/uv/0.11.15/install.sh). Versioned installer was reachable and supports opting out of shell modification. |

## Verification record and limitations

Executed on **2026-10-19**, Ubuntu **24.04.5 LTS/x86_64**, starting from the existing workstation (not a clean machine): Git 2.43.0, Node 24.15.0/npm 11.12.1, fnm 1.39.0, Python 3.12.3, uv 0.11.15.

- Fetched official Node/npm metadata and confirmed the selected versions/engine range. Official LTS, fnm, Ubuntu Git and uv documentation URLs were reachable. Downloaded and inspected the versioned fnm/uv installer sources/options. No installers or apt commands were run on the host workstation; acquisition was subsequently rehearsed in the disposable container below.
- Downloaded the official Node 24.22.0 linux-x64 archive into a disposable directory, verified it against that release's official `SHASUMS256.txt`, and extracted it there. Temporarily prepended only its `bin` directory to PATH for gate execution, preserving the agent's existing Node/default/shell configuration. Both default and `--bmad` gates passed with real Node 24.22.0/npm 11.19.1. No global npm update was used.
- The original Node 24.15.0/npm 11.12.1 failed the default gate with both actual/required versions and exit 1, as intended.
- `uv run _bmad/scripts/resolve_config.py --project-root "$PWD" --key core.project_name` returned the expected project name using existing Python/uv, without activation or creating a repository virtualenv.
- `bash -n scripts/check-workstation.sh tests/toolchain/check-workstation.test.sh` passed. `bash tests/toolchain/check-workstation.test.sh` passed 45 disposable PATH-fixture cases, including absence/broken execution, malformed/wrong/prerelease versions, cross-width numeric comparisons, recorded non-invocation of optional Python/uv, explicit BMAD mode, invalid usage/platform, alternate Node-pin consumption and invocation outside the repository. Fixtures are not proof of installation.
- `git diff --check` passed after implementation (including whitespace checks on the new deliverables).

**Clean acquisition rehearsal:** also executed on 2026-10-19 in a disposable official `ubuntu:24.04` x86_64 container, image digest `sha256:68ee22004a9109b44973313b02ff7b1de250f1de0f5ecb628d73f579aaff33ac`. The clone was mounted read-only; the container was removed afterward. An administrator installed the guide's apt packages (Git 2.43.0, Python 3.12.3 and download utilities); a fresh non-root user then ran the exact versioned fnm/uv installers and Node selection sequence. Installer review/approval was performed before the automated rehearsal rather than through an interactive pager. Both initially absent and existing fnm defaults were verified unchanged after selection. User `.bashrc` setup was verified from a new interactive Bash with a clean environment. Default/BMAD gates, resolver smoke and all 45 fixture cases passed without hosted credentials. Expected no-terminal/job-control warnings did not prevent the container's interactive Bash checks.

**Not proven:** a full graphical Ubuntu workstation installation, interactive pager/confirmation usability, other CPU architectures, future application dependency compatibility, or later-story fresh-clone application startup. The container establishes clean tool acquisition and persisted Bash setup, not desktop or application acceptance. No installation/default changes were made to the host.

**Story boundary:** no application skeleton/dependencies/lockfile, database or business tables, hosted resources, secrets or real-model calls are created. Later stories own initialization, locked dependency compatibility, frontend/Worker/local D1 startup, and full fresh-clone validation. Do not start those tasks to make this gate pass.
