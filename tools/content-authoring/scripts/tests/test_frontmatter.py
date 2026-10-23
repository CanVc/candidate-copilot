"""Generic template regression checks; never read actual private material."""

import json
from pathlib import Path
import unittest


TOOLS = Path(__file__).resolve().parents[2]
ROOT = TOOLS.parents[1]


class FrontmatterTemplateTests(unittest.TestCase):
    def test_both_draft_templates_expose_metadata_and_empty_reviews(self):
        manifest = json.loads((TOOLS / "versions.json").read_text())
        templates = {"A": "professional-context.md", "B": "realization.md"}
        for kind, name in templates.items():
            with self.subTest(kind=kind):
                text = (TOOLS / "templates" / name).read_text()
                self.assertIn(f'Template **{manifest["types"][kind]["template"]}**', text)
                draft = text.split("```markdown\n", 1)[1].split("```", 1)[0]
                self.assertTrue(draft.startswith("---\n"))
                frontmatter, body = draft[4:].split("\n---\n", 1)
                pairs = [line.split(": ", 1) for line in frontmatter.splitlines()]
                self.assertEqual(len(pairs), len({key for key, _value in pairs}),
                                 "Duplicate frontmatter keys")
                fields = dict(pairs)
                self.assertEqual(set(fields), {
                    "document_id", "created_at", "modified_at", "title",
                    "reviewed_by", "reviewed_at",
                })
                for key in ("created_at", "modified_at", "reviewed_by", "reviewed_at"):
                    self.assertEqual(fields[key], '""')
                self.assertEqual(fields["document_id"], '"<UUID stable>"')
                self.assertIn(fields["title"][1:-1], body)
                self.assertIn("YYYY-MM-DDTHH:mm:ssZ", text)
                self.assertIn("content/AGENTS.md", text)

    def test_agent_and_procedure_versions_match_manifest(self):
        manifest = json.loads((TOOLS / "versions.json").read_text())
        self.assertIn(f'Version agent **{manifest["agent"]}**',
                      (TOOLS / "agent.md").read_text())
        for name in ("checkpoint.md", "review.md"):
            with self.subTest(procedure=name):
                self.assertIn(f'Procédure **{manifest["agent"]}**',
                              (TOOLS / "workflow" / name).read_text())
        for name in ("checkpoint-template.json", "checkpoint-realization-template.json"):
            with self.subTest(skeleton=name):
                skeleton = json.loads((TOOLS / "workflow" / name).read_text())
                self.assertEqual(skeleton["document_timestamps"], {
                    "created_at": None, "modified_at": None,
                })

    def test_authoring_reminder_is_outside_both_content_trees(self):
        reminder = ROOT / "content" / "AGENTS.md"
        self.assertTrue(reminder.is_file())
        for name in ("private", "public"):
            self.assertFalse(reminder.is_relative_to(ROOT / "content" / name))
        text = reminder.read_text()
        self.assertIn("not a knowledge source", text)
        self.assertIn("Never promote a file automatically", text)
        self.assertIn("YYYY-MM-DDTHH:mm:ssZ", text)
        self.assertIn('reviewed_by: ""', text)
        self.assertIn('reviewed_at: ""', text)
        self.assertIn("date-only", text)


if __name__ == "__main__":
    unittest.main()
