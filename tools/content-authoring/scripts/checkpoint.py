#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# ///
"""Structural checkpoint checks and atomic storage; never semantic/human approval.

Use an explicitly selected private root. No network, discovery or source ingestion.
validate reads one candidate and its selected draft; --previous checks continuity.
save validates then atomically replaces --out, using its existing state as previous.
Paths inside a checkpoint are relative to --root; symlinks and escapes are rejected.
JSON output is nonsensitive diagnostics only (not facts, paths, hashes or approvals).
Exit codes: 0 structurally consistent, 1 inconsistent, 2 I/O/usage error.
A pass does not establish consent, authenticity, completeness or eligibility.
Single writer only; stop other writers before save. No automatic approval command.
"""

import argparse
from datetime import date
import hashlib
import json
import math
import os
from pathlib import Path, PurePosixPath
import sys
import tempfile
import uuid


class Invalid(ValueError):
    """Nonsensitive validation diagnostic."""


def require(condition, code):
    if not condition:
        raise Invalid(code)


def text(value):
    return isinstance(value, str) and bool(value.strip())


def positive(value):
    return type(value) is int and value > 0


def is_date(value):
    try:
        return isinstance(value, str) and date.fromisoformat(value).isoformat() == value
    except ValueError:
        return False


def inside(root, relative):
    require(text(relative), "path.required")
    path = PurePosixPath(relative)
    require(not path.is_absolute() and ".." not in path.parts and "\\" not in relative
            and ":" not in relative and relative == path.as_posix() and relative != ".",
            "path.relative_required")
    current = root
    for part in path.parts:
        current = current / part
        require(not current.is_symlink(), "path.symlink_forbidden")
    require(current.resolve().is_relative_to(root), "path.outside_root")
    return current


def selected(root, path):
    absolute = Path(os.path.abspath(path))
    require(absolute.is_relative_to(root), "selected.outside_root")
    return inside(root, absolute.relative_to(root).as_posix())


def load(path):
    def pairs(items):
        result = {}
        for key, value in items:
            require(key not in result, "json.duplicate_key")
            result[key] = value
        return result

    def nonfinite(_value):
        raise Invalid("json.nonfinite_number")

    def finite_float(value):
        result = float(value)
        require(math.isfinite(result), "json.nonfinite_number")
        return result

    return json.loads(path.read_text(encoding="utf-8"), object_pairs_hook=pairs,
                      parse_constant=nonfinite, parse_float=finite_float)


def expected_versions(manifest, kind):
    return {"agent": manifest["agent"], **manifest["types"][kind]}


def validate(state, root, manifest, previous=None):
    require(isinstance(state, dict), "state.object_required")
    require(type(state.get("schema_version")) is int and state["schema_version"] == 1,
            "state.schema_version")
    try:
        require(str(uuid.UUID(state.get("document_id", ""))) == state["document_id"],
                "state.document_id")
    except (ValueError, TypeError, AttributeError):
        raise Invalid("state.document_id") from None
    kind = state.get("type")
    require(kind in ("A", "B"), "state.type")
    require(positive(state.get("revision")) and positive(state.get("checkpoint_seq")),
            "state.revision_sequence")
    require(is_date(state.get("created_at")), "state.created_at")
    require(state.get("stage") in ("choose", "understand", "investigate", "synthesize",
                                  "draft", "facts", "comprehension", "eligibility", "blocked", "paused"),
            "state.stage")
    require(state.get("versions") == expected_versions(manifest, kind), "state.versions")
    if kind == "B":
        scope = state.get("scope")
        require(isinstance(scope, dict) and scope.get("setting") in (None, "professional", "personal")
                and isinstance(scope.get("maturity"), str) and isinstance(scope.get("usage"), str),
                "state.scope")
    else:
        require(state.get("scope") is None, "state.scope_A_null")
    for key in ("facts", "provenance", "corrections", "decisions", "uncertainties",
                "next_questions", "changed_facts", "review_history", "authorized_sources"):
        require(isinstance(state.get(key), list), "state.list_" + key)
    for fact in state["facts"]:
        require(isinstance(fact, dict) and text(fact.get("text"))
                and fact.get("status") in ("source_assertion", "inference", "confirmed",
                                           "unknown", "conflict", "excluded"), "state.fact")
    for path in state["authorized_sources"]:
        inside(root, path)  # Containment only; never opens source material.
    gaps = state.get("gaps")
    require(isinstance(gaps, dict) and isinstance(gaps.get("required"), list)
            and isinstance(gaps.get("optional"), list), "state.gaps")
    criteria = state.get("criteria")
    ids = {f"C{i}" for i in range(1, 6)} if kind == "A" else {f"R{i}" for i in range(1, 7)}
    require(isinstance(criteria, dict) and set(criteria) == ids, "state.criteria_ids")
    conditional = "C5" if kind == "A" else "R6"
    for key, item in criteria.items():
        require(isinstance(item, dict) and item.get("applicability") in
                ("required", "applicable", "inapplicable", "unresolved")
                and isinstance(item.get("passages"), list) and isinstance(item.get("gap"), str),
                "state.criterion")
        require(key == conditional or item["applicability"] == "required", "state.required_criterion")
        require(item["applicability"] != "inapplicable" or text(item.get("rationale")),
                "state.omission_rationale")
    handling = state.get("handling")
    require(isinstance(handling, dict) and text(handling.get("route"))
            and text(handling.get("automatic_context"))
            and isinstance(handling.get("material_scope"), list), "state.handling")
    consent = handling.get("consent")
    require(consent is None or (isinstance(consent, dict) and text(consent.get("by"))
                               and is_date(consent.get("at")) and text(consent.get("scope"))),
            "state.consent_record")
    require("draft" in state, "state.draft_required")
    draft = state["draft"]
    draft_text = None
    if draft is not None:
        require(isinstance(draft, dict), "state.draft")
        draft_path = inside(root, draft.get("path"))
        data = draft_path.read_bytes()
        require(draft.get("sha256") == hashlib.sha256(data).hexdigest(), "draft.digest_mismatch")
        draft_text = data.decode("utf-8")
    for item in criteria.values():
        for passage in item["passages"]:
            require(isinstance(passage, dict) and text(passage.get("section"))
                    and text(passage.get("quote")), "state.passage")
            require(draft_text is not None and passage["quote"] in draft_text
                    and passage["section"] in draft_text, "draft.passage_missing")
    approvals = state.get("approvals")
    require(isinstance(approvals, dict) and set(approvals) == {"facts", "comprehension", "eligibility"},
            "state.approvals")
    for key, approval in approvals.items():
        if approval is None:
            continue
        require(isinstance(approval, dict) and text(approval.get("by"))
                and is_date(approval.get("at")) and draft is not None
                and approval.get("revision") == state["revision"]
                and approval.get("draft_sha256") == draft["sha256"]
                and approval.get("versions") == state["versions"], "approval.binding")
        require(consent is not None, "approval.missing_consent_record")
        if kind == "B":
            require(scope["setting"] is not None and text(scope["maturity"]) and text(scope["usage"]),
                    "approval.unknown_scope")
        require(not gaps["required"], "approval.required_gaps")
        if key in ("comprehension", "eligibility"):
            require(approvals["facts"] is not None, "approval.facts_first")
            require(all(item["applicability"] == "inapplicable" or item["passages"]
                        for item in criteria.values()), "approval.missing_passages")
            require(all(item["applicability"] != "unresolved" and not item["gap"]
                        for item in criteria.values()), "approval.unresolved_criteria")
        if key == "eligibility":
            require(approvals["comprehension"] is not None, "approval.comprehension_first")
    if previous is None:
        return
    for key in ("document_id", "type", "created_at"):
        require(state[key] == previous[key], "transition.identity")
    require(state["checkpoint_seq"] == previous["checkpoint_seq"] + 1, "transition.sequence")
    for key in ("corrections", "decisions", "review_history"):
        require(state[key][:len(previous[key])] == previous[key], "transition.history")
    # Older accepted checkpoints treated an omitted draft as null. Repair only
    # that omission; identity, history, sequence and version rules still apply.
    changed = state["draft"] != previous.get("draft") or state["versions"] != previous["versions"]
    revision_changed = state["revision"] != previous["revision"]
    require(state["revision"] == previous["revision"] + (1 if revision_changed else 0),
            "transition.revision")
    require(not changed or revision_changed, "transition.new_revision_required")
    if revision_changed:
        require(all(value is None for value in approvals.values()), "transition.renew_all_reviews")
    if any(value is not None and approvals[key] != value
           for key, value in previous["approvals"].items()):
        record = {"revision": previous["revision"], "approvals": previous["approvals"]}
        require(record in state["review_history"][len(previous["review_history"]):],
                "transition.archive_reviews")
    if state["handling"] != previous["handling"] or state["authorized_sources"] != previous["authorized_sources"]:
        require(all(value is None for value in approvals.values()), "transition.recheck_handling")


def store(state, output):
    """Atomic single-file replace; no lock or multi-file draft transaction."""
    output.parent.mkdir(parents=True, exist_ok=True)
    fd, temporary = tempfile.mkstemp(prefix=".checkpoint-", dir=output.parent)
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as stream:
            json.dump(state, stream, ensure_ascii=False, indent=2, allow_nan=False)
            stream.write("\n")
            stream.flush()
            os.fsync(stream.fileno())
        os.replace(temporary, output)
    finally:
        if os.path.exists(temporary):
            os.unlink(temporary)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("command", choices=("validate", "save"))
    parser.add_argument("target", type=Path, help="selected candidate JSON within --root")
    parser.add_argument("--root", required=True, type=Path, help="explicit private or synthetic root")
    parser.add_argument("--versions", required=True, type=Path, help="generic current versions.json")
    parser.add_argument("--previous", type=Path, help="selected previous checkpoint (validate only)")
    parser.add_argument("--out", type=Path, help="checkpoint destination (save only)")
    parser.add_argument("--verbose", action="store_true", help="emit structural-only scope reminder to stderr")
    args = parser.parse_args()
    if (args.command == "save" and (args.out is None or args.previous is not None)) or (args.command == "validate" and args.out):
        parser.error("save requires --out and forbids --previous; validate forbids --out")
    try:
        require(args.root.is_dir() and not args.root.is_symlink(), "root.directory_required")
        root = args.root.resolve()
        target = selected(root, args.target)
        output = selected(root, args.out) if args.out else None
        require(output != target, "save.separate_candidate_required")
        previous_path = output if output and output.exists() else args.previous
        previous = load(selected(root, previous_path)) if previous_path else None
        state = load(target)
        validate(state, root, load(args.versions), previous)
        if output:
            if previous is None:
                require(state["checkpoint_seq"] == 1 and state["revision"] == 1, "transition.initial")
            store(state, output)
        if args.verbose:
            print("Structure only; human approval and meaning remain unverified.", file=sys.stderr)
        print(json.dumps({"ok": True, "operation": args.command, "scope": "structural-only"}))
        return 0
    except Invalid as error:
        print(json.dumps({"ok": False, "errors": [str(error)]}))
        return 1
    except (OSError, UnicodeError, ValueError, KeyError, TypeError, AttributeError):
        print(json.dumps({"ok": False, "errors": ["input.unreadable_or_malformed"]}))
        return 2


if __name__ == "__main__":
    sys.exit(main())
