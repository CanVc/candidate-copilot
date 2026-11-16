"""Modest generic policy/manifest checks, not model-behavior evidence."""

import hashlib
import json
from pathlib import Path
import re
import unittest


TOOLS = Path(__file__).resolve().parents[2]
ROOT = TOOLS.parents[1]


class EditorialPolicyTests(unittest.TestCase):
    def test_runtime_resources_defer_completeness_to_BC_without_old_vetoes(self):
        resources = [TOOLS / name for name in (
            "agent.md", "types.md", "README.md", "workflow/author.md", "workflow/review.md",
            "workflow/checkpoint.md",
            "guides/professional-context.md", "guides/realization.md",
            "templates/professional-context.md", "templates/realization.md",
        )] + [ROOT / ".pi/skills/content-authoring/SKILL.md"]
        contrary = re.compile(
            r"Une lacune requise bloque|Chaque manque requis bloque|"
            r"Si un fait requis manque, bloquer|Information requise indisponible : document bloqué|"
            r"C1–C4 indisponibles bloquent|enregistrer le blocage et proposer arrêt|"
            r"Les lacunes requises ou ambiguïtés matérielles bloquent l’accord"
        )
        for path in resources:
            with self.subTest(resource=path.name):
                text = path.read_text()
                if path == TOOLS / "workflow/checkpoint.md":
                    for phrase in ("BC seul juge leur suffisance", "sans veto d’approbation",
                                   "l’intégrité des citations fournies restent contrôlées",
                                   "traitement/consentement"):
                        self.assertIn(phrase, text)
                    self.assertIn('MANIFEST=tools/content-authoring/versions/1.0.2.json', text)
                    invocations = re.findall(r'(?:save|validate) "\$[^"\n]+"[^`\n]*', text)
                    self.assertEqual(len(invocations), 2)
                    for invocation in invocations:
                        self.assertIn('--versions "$MANIFEST"', invocation)
                else:
                    self.assertIn("complétude éditoriale", text)
                    self.assertIn("validation du document", text)
                    self.assertIn("publication", text)
                self.assertNotRegex(text, contrary)
        helper = (TOOLS / "scripts/checkpoint.py").read_text()
        for veto in ("unknown_scope", "required_gaps", "missing_passages", "unresolved_criteria"):
            self.assertNotIn(f'"approval.{veto}"', helper)

    def test_changed_guides_criteria_and_author_procedure_match_manifest(self):
        manifest = json.loads((TOOLS / "versions.json").read_text())
        self.assertEqual(manifest["release"], "1.0.4")
        self.assertEqual(manifest["agent"], "1.0.4")
        self.assertEqual(manifest["checkpoint_schema"], 1)
        for kind, filename in (("A", "professional-context.md"), ("B", "realization.md")):
            with self.subTest(kind=kind):
                versions = manifest["types"][kind]
                self.assertEqual(set(versions.values()), {"1.0.3"})
                guide = (TOOLS / "guides" / filename).read_text()
                self.assertIn(f'Guide **{versions["guide"]}**, critères **{versions["criteria"]}**', guide)
                template = (TOOLS / "templates" / filename).read_text()
                self.assertIn(f'critères **{versions["criteria"]}**', template)
        self.assertIn(f'Critères et applicabilité **{manifest["types"]["A"]["criteria"]}**',
                      (TOOLS / "types.md").read_text())
        self.assertIn(f'Boucle d’authoring **{manifest["agent"]}**',
                      (TOOLS / "workflow/author.md").read_text())

    def test_publication_release_preserves_historical_manifest_and_type_versions(self):
        historical = (TOOLS / "versions/1.0.3.json").read_bytes()
        self.assertEqual(hashlib.sha256(historical).hexdigest(),
                         "d27e31ca6f2900631b9701fa6b267c51230c22f2d482014d616a27573fede16a")
        current = json.loads((TOOLS / "versions.json").read_text())
        old = json.loads(historical)
        self.assertEqual(current["types"], old["types"])
        self.assertEqual(current["checkpoint_schema"], old["checkpoint_schema"])
        for name in ("checkpoint-template.json", "checkpoint-realization-template.json"):
            skeleton = json.loads((TOOLS / "workflow" / name).read_text())
            self.assertEqual(skeleton["versions"]["agent"], current["agent"])
            kind = skeleton["type"]
            for key in ("template", "guide", "criteria"):
                self.assertEqual(skeleton["versions"][key], current["types"][kind][key])
        for name in ("README.md", "agent.md", "workflow/review.md", "workflow/checkpoint.md"):
            self.assertIn("1.0.4", (TOOLS / name).read_text())
            self.assertIn("reviewed_at", (TOOLS / name).read_text())

    def test_current_notices_withdraw_both_gates_without_claiming_they_passed(self):
        for path in (TOOLS / "acceptance.md",
                     ROOT / "docs/_bmad-output/implementation-artifacts/handoff-2-0-content-authoring.md"):
            with self.subTest(resource=path.name):
                notice = path.read_text().split("\n## ", 2)[1]
                for phrase in ("12 novembre 2026", "trois pilotes validés", "retirés, pas réussis",
                               "done", "1.0.3", "1.0.2.json", "non-production"):
                    self.assertIn(phrase, notice)
                self.assertIn("histor", notice)

    def test_story_closure_preserves_publication_and_future_story_boundaries(self):
        artifacts = ROOT / "docs/_bmad-output/implementation-artifacts"
        story = (artifacts / "spec-2-0-define-and-pilot-the-content-authoring-workflow.md").read_text()
        frontmatter = re.match(r"\A---\n(.*?)\n---(?:\n|\Z)", story, re.DOTALL)
        self.assertIsNotNone(frontmatter)
        self.assertEqual(re.findall(r"^status:[ \t]*'([^'\n]+)'[ \t]*(?:#.*)?$",
                                    frontmatter.group(1), re.MULTILINE), ["done"])
        tracking = (artifacts / "sprint-status.yaml").read_text()
        self.assertEqual(len(re.findall(r"^development_status:[ \t]*$", tracking, re.MULTILINE)), 1)
        development = re.search(r"^development_status:[ \t]*\n(.*?)(?=^[^\s#]|\Z)",
                                tracking, re.MULTILINE | re.DOTALL)
        self.assertIsNotNone(development)
        for key, status in (("2-0-define-and-pilot-the-content-authoring-workflow", "done"),
                            ("epic-2", "in-progress"),
                            ("2-1-prepare-an-explicitly-public-knowledge-base", "in-progress")):
            self.assertEqual(re.findall(rf"^  {re.escape(key)}:[ \t]*([^#\n]*?)[ \t]*(?:#.*)?$",
                                        development.group(1), re.MULTILINE), [status])
        acceptance = (TOOLS / "acceptance.md").read_text().split("\n**23 octobre 2026", 1)[0]
        for pilot in ("A-01 / 6", "B-01 / 8", "B-02 / 3"):
            self.assertIn(pilot, acceptance)
        self.assertIn("ne confère aucun nouvel accord de publication", acceptance)
        self.assertIn("2026-11-12", acceptance)


if __name__ == "__main__":
    unittest.main()
