#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# ///
"""Disposable synthetic plumbing tests, not BC achievements or semantic evidence."""

from contextlib import redirect_stdout
import copy
import hashlib
import io
import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

SCRIPT = Path(__file__).resolve().parents[1] / "checkpoint.py"
TOOLS = SCRIPT.parents[1]
spec = importlib.util.spec_from_file_location("checkpoint", SCRIPT)
helper = importlib.util.module_from_spec(spec)
spec.loader.exec_module(helper)


class CheckpointTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="synthetic-authoring-")
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name).resolve()
        self.manifest = json.loads((TOOLS / "versions.json").read_text())
        # Copy generic skeleton only; never open any content/private path.
        self.state = json.loads((TOOLS / "workflow/checkpoint-template.json").read_text())
        self.state.update(document_id="00000000-0000-4000-8000-000000000001", created_at="2026-10-22", stage="draft")
        self.state["handling"] = {"route": "SYNTHETIC offline fixture", "automatic_context": "none (fixture)",
                                  "material_scope": ["synthetic"],
                                  "consent": {"by": "FIXTURE-NOT-BC", "at": "2026-10-22", "scope": "synthetic only"}}
        self.draft = self.root / "draft.md"
        self.draft.write_text("# Synthetic\n\n## Scope\nUn objet fictif tourne localement.\n", encoding="utf-8")
        self.bind()
        self.state["facts"] = [{"status": "confirmed", "text": "synthetic fact, not career evidence"}]
        self.state["corrections"] = ["synthetic correction: no real use claimed"]
        self.state["decisions"] = ["synthetic omission"]
        self.state["uncertainties"] = ["synthetic unknown"]
        self.state["next_questions"] = ["synthetic next question"]
        for key, item in self.state["criteria"].items():
            item.update(gap="", passages=[{"section": "## Scope", "quote": "Un objet fictif tourne localement."}])
            if key == "C5":
                item.update(applicability="inapplicable", rationale="synthetic: no structural constraint", passages=[])

    def bind(self):
        self.state["draft"] = {"path": "draft.md", "sha256": hashlib.sha256(self.draft.read_bytes()).hexdigest()}

    def check(self, previous=None):
        helper.validate(self.state, self.root, self.manifest, previous)

    def approval(self):
        return {"by": "FIXTURE-NOT-BC", "at": "2026-10-22", "revision": self.state["revision"],
                "draft_sha256": self.state["draft"]["sha256"], "versions": self.state["versions"].copy()}

    def test_fresh_roundtrip_restores_corrections_decisions_questions(self):
        output = self.root / "checkpoint.json"
        self.check()
        helper.store(self.state, output)
        restored = helper.load(output)
        self.assertEqual(restored, self.state)
        helper.validate(restored, self.root, self.manifest)
        self.assertTrue(restored["corrections"] and restored["facts"] and restored["uncertainties"]
                        and restored["decisions"] and restored["next_questions"])
        self.assertEqual(list(self.root.glob(".checkpoint-*")), [])

    def test_both_checkpoint_skeletons_match_exact_delivered_versions(self):
        for filename in ("checkpoint-template.json", "checkpoint-realization-template.json"):
            with self.subTest(filename=filename):
                skeleton = json.loads((TOOLS / "workflow" / filename).read_text())
                self.assertEqual(skeleton["versions"], helper.expected_versions(self.manifest, skeleton["type"]))
                self.assertEqual(skeleton["schema_version"], self.manifest["checkpoint_schema"])
                self.assertIn("draft", skeleton)
                self.assertIsNone(skeleton["draft"])

    def test_personal_prototype_without_production_is_structurally_valid(self):
        self.state.update(type="B", scope={"setting": "personal", "maturity": "prototype in progress", "usage": "synthetic local demo, no production"})
        self.state["criteria"] = {f"R{i}": {"applicability": "required" if i < 6 else "inapplicable",
            "rationale": "synthetic: no operations", "gap": "", "passages": []} for i in range(1, 7)}
        self.check()  # Does not claim semantic R1-R5 completeness.
        self.assertIsNone(self.state["approvals"]["eligibility"])

    def test_type_B_unknown_scope_can_pause_without_invention(self):
        template = json.loads((TOOLS / "workflow/checkpoint-realization-template.json").read_text())
        self.state.update(type="B", scope=template["scope"], criteria=template["criteria"], stage="paused")
        self.check()
        self.state["approvals"]["facts"] = self.approval()
        with self.assertRaisesRegex(helper.Invalid, "unknown_scope"):
            self.check()

    def test_setting_maturity_and_usage_are_independent(self):
        template = json.loads((TOOLS / "workflow/checkpoint-realization-template.json").read_text())
        self.state.update(type="B", criteria=template["criteria"])
        for setting in ("professional", "personal"):
            for maturity in ("PoC", "in progress", "stopped"):
                for usage in ("no deployment or observed users", "synthetic attested users"):
                    with self.subTest(setting=setting, maturity=maturity, usage=usage):
                        self.state["scope"] = {"setting": setting, "maturity": maturity, "usage": usage}
                        self.check()
        self.assertIsNone(self.state["approvals"]["eligibility"])

    def test_required_gap_blocks_approval_but_not_provisional_checkpoint(self):
        self.state["gaps"]["required"] = ["synthetic missing attribution"]
        self.state["stage"] = "blocked"
        self.check()
        self.state["approvals"]["facts"] = self.approval()
        with self.assertRaisesRegex(helper.Invalid, "required_gaps"):
            self.check()

    def test_optional_gap_does_not_block_recorded_review(self):
        self.state["gaps"]["optional"] = ["synthetic optional number"]
        self.state["approvals"]["facts"] = self.approval()
        self.check()

    def test_omission_needs_private_reason_and_required_cannot_be_omitted(self):
        self.state["criteria"]["C5"]["rationale"] = ""
        with self.assertRaisesRegex(helper.Invalid, "omission_rationale"):
            self.check()
        self.state["criteria"]["C5"]["rationale"] = "synthetic"
        self.state["criteria"]["C1"]["applicability"] = "inapplicable"
        with self.assertRaisesRegex(helper.Invalid, "required_criterion"):
            self.check()

    def test_missing_comprehension_passage_then_literal_correction(self):
        self.state["criteria"]["C1"]["passages"][0]["quote"] = "Absent synthetic text"
        with self.assertRaisesRegex(helper.Invalid, "passage_missing"):
            self.check()
        self.draft.write_text(self.draft.read_text() + "Absent synthetic text\n")
        self.bind()
        self.check()  # Presence only; no comprehension claim.

    def test_identity_created_date_and_type_remain_stable(self):
        previous = copy.deepcopy(self.state)
        self.state["checkpoint_seq"] += 1
        for key, value in (("document_id", "00000000-0000-4000-8000-000000000002"), ("created_at", "2026-10-21")):
            with self.subTest(key=key):
                old = self.state[key]
                self.state[key] = value
                with self.assertRaisesRegex(helper.Invalid, "identity"):
                    self.check(previous)
                self.state[key] = old
        self.check(previous)

    def test_rewrite_even_with_unchanged_facts_requires_revision_and_fresh_reviews(self):
        self.state["approvals"] = {key: self.approval() for key in self.state["approvals"]}
        previous = copy.deepcopy(self.state)
        self.draft.write_text(self.draft.read_text() + "\nReformulation fictive.\n")
        self.bind()
        self.state["checkpoint_seq"] += 1
        self.state["approvals"] = dict.fromkeys(self.state["approvals"])
        with self.assertRaisesRegex(helper.Invalid, "new_revision_required"):
            self.check(previous)
        self.state["revision"] += 1
        self.state["approvals"]["facts"] = self.approval()
        with self.assertRaisesRegex(helper.Invalid, "renew_all_reviews"):
            self.check(previous)
        self.state["approvals"]["facts"] = None
        with self.assertRaisesRegex(helper.Invalid, "archive_reviews"):
            self.check(previous)
        self.state["review_history"].append({"revision": previous["revision"], "approvals": previous["approvals"]})
        self.check(previous)
        self.assertEqual(self.state["document_id"], previous["document_id"])
        self.assertEqual(self.state["changed_facts"], [])

    def test_revision_sequence_rollback_and_history_truncation_fail(self):
        previous = copy.deepcopy(self.state)
        with self.assertRaisesRegex(helper.Invalid, "sequence"):
            self.check(previous)
        self.state["checkpoint_seq"] += 1
        self.state["revision"] = 3
        with self.assertRaisesRegex(helper.Invalid, "transition.revision"):
            self.check(previous)
        self.state["revision"] = 1
        self.state["corrections"] = []
        with self.assertRaisesRegex(helper.Invalid, "history"):
            self.check(previous)

    def test_version_mismatch_and_changed_final_versions_reset_approvals(self):
        previous = copy.deepcopy(self.state)
        self.state["versions"]["guide"] = "0.0.0"
        with self.assertRaisesRegex(helper.Invalid, "versions"):
            self.check()
        self.state["versions"]["guide"] = "2.0.0"
        self.manifest["types"]["A"]["guide"] = "2.0.0"
        self.state["checkpoint_seq"] += 1
        with self.assertRaisesRegex(helper.Invalid, "new_revision_required"):
            self.check(previous)
        self.state["revision"] += 1
        self.check(previous)

    def test_changed_bytes_and_stale_approval_digest_fail(self):
        self.draft.write_text("synthetic changed bytes")
        with self.assertRaisesRegex(helper.Invalid, "digest_mismatch"):
            self.check()
        self.bind()
        for item in self.state["criteria"].values():
            item["passages"] = []
        self.state["approvals"]["facts"] = {**self.approval(), "draft_sha256": "0" * 64}
        with self.assertRaisesRegex(helper.Invalid, "binding"):
            self.check()

    def test_path_escape_absolute_and_symlink_are_rejected(self):
        for relative in ("../outside.md", "/tmp/outside.md", "C:/outside.md", "draft\\escape.md", "./draft.md"):
            with self.subTest(relative=relative), self.assertRaises(helper.Invalid):
                helper.inside(self.root, relative)
        (self.root / "linked.md").symlink_to(self.draft)
        with self.assertRaisesRegex(helper.Invalid, "symlink"):
            helper.inside(self.root, "linked.md")

    def test_approval_needs_real_form_date_binding_and_preceding_reviews(self):
        self.state["approvals"]["eligibility"] = self.approval()
        with self.assertRaisesRegex(helper.Invalid, "facts_first"):
            self.check()
        self.state["approvals"]["facts"] = self.approval()
        with self.assertRaisesRegex(helper.Invalid, "comprehension_first"):
            self.check()
        self.state["approvals"]["comprehension"] = self.approval()
        self.check()  # All identities are visibly fixtures, never human acceptance.
        self.state["approvals"]["facts"]["at"] = "not-a-date"
        with self.assertRaisesRegex(helper.Invalid, "binding"):
            self.check()

    def test_consent_change_clears_reviews_and_unknown_consent_cannot_back_approval(self):
        previous = copy.deepcopy(self.state)
        self.state["checkpoint_seq"] += 1
        self.state["handling"]["route"] = "synthetic changed route"
        self.state["approvals"]["facts"] = self.approval()
        with self.assertRaisesRegex(helper.Invalid, "recheck_handling"):
            self.check(previous)
        self.state["handling"]["consent"] = None
        with self.assertRaisesRegex(helper.Invalid, "missing_consent"):
            self.check()

    def test_handling_or_source_withdrawal_archives_at_same_revision_on_validate_and_save(self):
        for field in ("handling", "authorized_sources"):
            with self.subTest(field=field):
                self.state["approvals"] = {key: self.approval() for key in self.state["approvals"]}
                snapshot = {"revision": self.state["revision"], "approvals": copy.deepcopy(self.state["approvals"])}
                # An identical older snapshot is not a newly appended archive.
                self.state["review_history"].append(copy.deepcopy(snapshot))
                previous = copy.deepcopy(self.state)
                output = self.root / "checkpoint.json"
                helper.store(previous, output)
                before = output.read_bytes()
                self.state["checkpoint_seq"] += 1
                if field == "handling":
                    self.state[field]["route"] += " changed"
                else:
                    self.state[field].append("selected-synthetic-source.md")
                self.state["approvals"] = dict.fromkeys(self.state["approvals"])
                with self.assertRaisesRegex(helper.Invalid, "archive_reviews"):
                    self.check(previous)
                result = self.save_candidate(output)
                self.assertEqual(json.loads(result.stdout)["errors"], ["transition.archive_reviews"])
                self.assertEqual(result.returncode, 1)
                self.assertEqual(output.read_bytes(), before)
                self.state["review_history"].append(copy.deepcopy(snapshot))
                self.check(previous)
                result = self.save_candidate(output)
                self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
                self.assertEqual(helper.load(output), self.state)
                self.assertEqual(self.state["revision"], previous["revision"])
                self.assertEqual(self.state["review_history"][:-1], previous["review_history"])

    def test_review_withdrawal_without_revision_requires_snapshot(self):
        self.state["approvals"]["facts"] = self.approval()
        previous = copy.deepcopy(self.state)
        self.state["checkpoint_seq"] += 1
        self.state["approvals"]["facts"] = None
        with self.assertRaisesRegex(helper.Invalid, "archive_reviews"):
            self.check(previous)
        self.state["review_history"].append({"revision": previous["revision"], "approvals": previous["approvals"]})
        self.check(previous)

    def test_approval_replacement_requires_snapshot_on_validate_and_save(self):
        self.state["approvals"] = {key: self.approval() for key in self.state["approvals"]}
        previous = copy.deepcopy(self.state)
        output = self.root / "checkpoint.json"
        helper.store(previous, output)
        before = output.read_bytes()
        self.state["checkpoint_seq"] += 1
        self.state["approvals"]["facts"]["by"] = "SECOND-SYNTHETIC-REVIEWER"
        with self.assertRaisesRegex(helper.Invalid, "archive_reviews"):
            self.check(previous)
        result = self.save_candidate(output)
        self.assertEqual(result.returncode, 1)
        self.assertEqual(json.loads(result.stdout)["errors"], ["transition.archive_reviews"])
        self.assertEqual(output.read_bytes(), before)
        self.state["review_history"].append({"revision": previous["revision"], "approvals": previous["approvals"]})
        self.check(previous)
        result = self.save_candidate(output)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertEqual(helper.load(output), self.state)

    def test_completing_absent_approvals_does_not_require_archive(self):
        self.state["approvals"]["facts"] = self.approval()
        previous = copy.deepcopy(self.state)
        output = self.root / "checkpoint.json"
        helper.store(previous, output)
        self.state["checkpoint_seq"] += 1
        for key in ("comprehension", "eligibility"):
            self.state["approvals"][key] = self.approval()
        self.check(previous)
        result = self.save_candidate(output)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertEqual(helper.load(output)["review_history"], [])
        self.assertEqual(self.state["approvals"]["facts"], previous["approvals"]["facts"])

    def undrafted(self):
        self.state["draft"] = None
        self.state["stage"] = "paused"
        for item in self.state["criteria"].values():
            item["passages"] = []

    def test_new_state_requires_explicit_nullable_draft_on_validate_and_initial_save(self):
        self.undrafted()
        del self.state["draft"]
        with self.assertRaisesRegex(helper.Invalid, "state.draft_required"):
            self.check()
        output = self.root / "checkpoint.json"
        result = self.save_candidate(output)
        self.assertEqual(result.returncode, 1)
        self.assertEqual(json.loads(result.stdout)["errors"], ["state.draft_required"])
        self.assertFalse(output.exists())
        self.state["draft"] = None
        self.check()
        result = self.save_candidate(output)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIsNone(helper.load(output)["draft"])

    def test_legacy_absent_draft_can_be_repaired_without_identity_or_history_loss(self):
        self.undrafted()
        previous = copy.deepcopy(self.state)
        del previous["draft"]  # Accepted as null by the earlier helper.
        previous["review_history"] = [{"revision": 1, "approvals": copy.deepcopy(previous["approvals"])}]
        output = self.root / "checkpoint.json"
        helper.store(previous, output)
        before = output.read_bytes()
        self.state = copy.deepcopy(previous)
        self.state["draft"] = None
        self.state["checkpoint_seq"] += 1
        self.check(previous)
        self.assertNotIn("draft", previous)
        candidate = self.root / "candidate.json"
        candidate.write_text(json.dumps(self.state))
        result = self.cli("validate", candidate, "--root", self.root, "--versions", TOOLS / "versions.json", "--previous", output)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertEqual(output.read_bytes(), before)
        result = self.save_candidate(output)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        restored = helper.load(output)
        self.assertEqual(restored, {**previous, "draft": None, "checkpoint_seq": previous["checkpoint_seq"] + 1})
        self.state["checkpoint_seq"] += 1
        self.assertEqual(self.save_candidate(output).returncode, 0)

    def test_first_draft_after_legacy_absence_still_requires_new_revision(self):
        previous = copy.deepcopy(self.state)
        del previous["draft"]
        previous["stage"] = "paused"
        for item in previous["criteria"].values():
            item["passages"] = []
        self.state["checkpoint_seq"] += 1
        with self.assertRaisesRegex(helper.Invalid, "new_revision_required"):
            self.check(previous)
        self.state["revision"] += 1
        self.check(previous)

    def test_final_metadata_changes_bytes_and_requires_exact_final_reapproval(self):
        identity = f"document_id: {self.state['document_id']}\ncreated_at: {self.state['created_at']}\n"
        body = self.draft.read_text()
        self.draft.write_text("---\n" + identity + "---\n" + body)
        self.bind()
        self.state["approvals"] = {key: self.approval() for key in self.state["approvals"]}
        preliminary = copy.deepcopy(self.state)
        # Simulate newly collected fixture metadata, not a model or human review.
        metadata = "visibility: public\nreviewed_by: FIXTURE-NOT-BC\nreviewed_at: 2026-10-22\n"
        self.draft.write_text("---\n" + identity + metadata + "---\n" + body)
        self.bind()
        self.state["checkpoint_seq"] += 1
        self.state["approvals"] = dict.fromkeys(self.state["approvals"])
        with self.assertRaisesRegex(helper.Invalid, "new_revision_required"):
            self.check(preliminary)
        self.state["revision"] += 1
        self.state["review_history"].append({"revision": preliminary["revision"], "approvals": preliminary["approvals"]})
        self.check(preliminary)  # Still private/provisional despite the text metadata.
        provisional = copy.deepcopy(self.state)
        self.state["checkpoint_seq"] += 1
        self.state["approvals"]["facts"] = preliminary["approvals"]["facts"]
        with self.assertRaisesRegex(helper.Invalid, "binding"):
            self.check(provisional)
        self.state["approvals"] = {key: self.approval() for key in self.state["approvals"]}
        self.check(provisional)
        final = copy.deepcopy(self.state)
        # Instruction-following is not enforced by the helper: manually simulate
        # withdrawing old frontmatter when a reviewed document is rewritten.
        self.draft.write_text("---\n" + identity + "---\n" + body + "\nRéécriture synthétique.\n")
        self.bind()
        self.state["checkpoint_seq"] += 1
        self.state["revision"] += 1
        self.state["approvals"] = dict.fromkeys(self.state["approvals"])
        self.state["review_history"].append({"revision": final["revision"], "approvals": final["approvals"]})
        self.check(final)
        self.assertIn(identity, self.draft.read_text())
        for field in ("visibility: public", "reviewed_by:", "reviewed_at:"):
            self.assertNotIn(field, self.draft.read_text())
        self.assertEqual(self.state["review_history"][-1]["approvals"], final["approvals"])

    def test_failed_atomic_replace_preserves_old_checkpoint_and_cleans_temp(self):
        output = self.root / "checkpoint.json"
        helper.store(self.state, output)
        before = output.read_bytes()
        with patch.object(helper.os, "replace", side_effect=OSError("synthetic failure")):
            with self.assertRaises(OSError):
                helper.store({"synthetic": "not valid"}, output)
        self.assertEqual(output.read_bytes(), before)
        self.assertEqual(list(self.root.glob(".checkpoint-*")), [])

    def cli(self, *args):
        return subprocess.run([sys.executable, str(SCRIPT), *map(str, args)], capture_output=True, text=True, timeout=5)

    def save_candidate(self, output):
        candidate = self.root / "candidate.json"
        candidate.write_text(json.dumps(self.state))
        return self.cli("save", candidate, "--root", self.root, "--versions", TOOLS / "versions.json", "--out", output)

    def test_nonfinite_json_intake_is_rejected_with_safe_diagnostics_and_no_replacement(self):
        output = self.root / "checkpoint.json"
        helper.store(self.state, output)
        before = output.read_bytes()
        self.state["checkpoint_seq"] += 1
        self.state["decisions"].extend(["SYNTHETIC-PRIVATE-MARKER", "NUMBER_PLACEHOLDER"])
        candidate = self.root / "candidate.json"
        for token in ("NaN", "Infinity", "-Infinity", "1e400", "-1e400"):
            candidate.write_text(json.dumps(self.state).replace('"NUMBER_PLACEHOLDER"', token))
            for command, extra in (("validate", ("--previous", output)), ("save", ("--out", output))):
                with self.subTest(token=token, command=command):
                    result = self.cli(command, candidate, "--root", self.root, "--versions", TOOLS / "versions.json", *extra)
                    self.assertEqual(result.returncode, 1, result.stdout + result.stderr)
                    self.assertEqual(json.loads(result.stdout), {"ok": False, "errors": ["json.nonfinite_number"]})
                    self.assertEqual(result.stderr, "")
                    self.assertNotIn("SYNTHETIC-PRIVATE-MARKER", result.stdout)
                    self.assertEqual(output.read_bytes(), before)
                    self.assertEqual(list(self.root.glob(".checkpoint-*")), [])

    def test_nonfinite_serialization_preserves_old_checkpoint_and_cleans_temp(self):
        output = self.root / "checkpoint.json"
        helper.store(self.state, output)
        before = output.read_bytes()
        for value in (float("nan"), float("inf"), -float("inf")):
            with self.subTest(value=value):
                self.state["decisions"] = [{"synthetic": value}]
                with self.assertRaises(ValueError):
                    helper.store(self.state, output)
                self.assertEqual(output.read_bytes(), before)
                self.assertEqual(list(self.root.glob(".checkpoint-*")), [])

    def test_serialization_failure_reports_only_safe_json_diagnostic(self):
        output = self.root / "checkpoint.json"
        helper.store(self.state, output)
        before = output.read_bytes()
        previous = copy.deepcopy(self.state)
        self.state["checkpoint_seq"] += 1
        self.state["decisions"].append({"SYNTHETIC-PRIVATE-MARKER": float("nan")})
        args = [str(SCRIPT), "save", str(self.root / "candidate.json"), "--root", str(self.root),
                "--versions", str(TOOLS / "versions.json"), "--out", str(output)]
        stream = io.StringIO()
        # Intake rejects these values already; inject one after intake to exercise
        # the independent serializer guard and CLI's nonsensitive error handler.
        with patch.object(sys, "argv", args), patch.object(helper, "load", side_effect=[previous, self.state, self.manifest]):
            with redirect_stdout(stream):
                result = helper.main()
        self.assertEqual(result, 2)
        self.assertEqual(json.loads(stream.getvalue()), {"ok": False, "errors": ["input.unreadable_or_malformed"]})
        self.assertEqual(output.read_bytes(), before)
        self.assertEqual(list(self.root.glob(".checkpoint-*")), [])

    def test_cli_safe_json_help_save_resume_and_invalid_input(self):
        self.assertEqual(self.cli("--help").returncode, 0)
        candidate = self.root / "candidate.json"
        output = self.root / "checkpoint.json"
        candidate.write_text(json.dumps(self.state))
        args = ("--root", self.root, "--versions", TOOLS / "versions.json")
        result = self.cli("save", candidate, *args, "--out", output)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.state["checkpoint_seq"] += 1
        candidate.write_text(json.dumps(self.state))
        self.assertEqual(self.cli("save", candidate, *args, "--out", output).returncode, 0)
        result = self.cli("validate", output, *args)
        self.assertEqual(result.returncode, 0)
        self.assertNotIn("synthetic fact", result.stdout)
        candidate.write_text("not JSON with private-looking synthetic marker")
        result = self.cli("validate", candidate, *args)
        self.assertEqual(result.returncode, 2)
        self.assertNotIn("private-looking", result.stdout + result.stderr)
        self.assertIsInstance(json.loads(result.stdout)["errors"], list)

    def test_duplicate_keys_and_invalid_schema_are_rejected(self):
        duplicate = self.root / "duplicate.json"
        duplicate.write_text('{"type":"A","type":"B"}')
        with self.assertRaisesRegex(helper.Invalid, "duplicate_key"):
            helper.load(duplicate)
        self.state["schema_version"] = True
        with self.assertRaisesRegex(helper.Invalid, "schema_version"):
            self.check()


if __name__ == "__main__":
    unittest.main()
