"""Read-only self-checks for these draft fixtures, not a public-source validator."""

from datetime import datetime, timezone
from pathlib import Path
import re
import unittest
from uuid import UUID


BASE = Path(__file__).resolve().parent
CONTEXT_HEADINGS = [
    "Environnement et périmètre",
    "Mon rôle et mes responsabilités",
    "Autonomie et collaboration",
    "Activités concrètes",
    "Contraintes structurantes",
]
PROJECT_HEADINGS = [
    "Objectif et contexte",
    "Ma contribution et le périmètre réalisé",
    "Solution et choix importants",
    "État du projet et usages réels",
    "Résultats démontrés et limites",
    "Contraintes et retour d'expérience",
]
DOCUMENTS = {
    "mission-regie-collections.md": CONTEXT_HEADINGS,
    "projet-reperage-reserves.md": PROJECT_HEADINGS,
    "projet-prototype-prets.md": PROJECT_HEADINGS,
}


class SyntheticCorpusChecks(unittest.TestCase):
    def test_exact_document_inventory(self):
        directory = BASE / "documents"
        self.assertEqual({p.name for p in directory.iterdir()}, set(DOCUMENTS))
        for name in DOCUMENTS:
            path = directory / name
            self.assertFalse(path.is_symlink(), name)
            self.assertTrue(path.is_file(), name)
            self.assertTrue(path.resolve().is_relative_to(BASE), name)

    def test_draft_metadata(self):
        identities = set()
        for name in DOCUMENTS:
            with self.subTest(document=name):
                text = (BASE / "documents" / name).read_text(encoding="utf-8")
                self.assertTrue(text.startswith("---\n"))
                parts = text.split("---\n", 2)
                self.assertEqual(len(parts), 3)
                fields = {}
                for line in parts[1].splitlines():
                    match = re.fullmatch(r'([a-z_]+): "([^"\n]*)"', line)
                    self.assertIsNotNone(match, line)
                    self.assertNotIn(match[1], fields)
                    fields[match[1]] = match[2]
                self.assertEqual(set(fields), {
                    "document_id", "created_at", "modified_at", "title",
                    "reviewed_by", "reviewed_at",
                })
                identity = UUID(fields["document_id"])
                self.assertEqual(identity.version, 4)
                self.assertEqual(str(identity), fields["document_id"])
                self.assertNotIn(identity, identities)
                identities.add(identity)
                timestamps = {}
                for key in ("created_at", "modified_at"):
                    value = fields[key]
                    self.assertRegex(value, r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$")
                    timestamps[key] = datetime.strptime(
                        value, "%Y-%m-%dT%H:%M:%SZ"
                    ).replace(tzinfo=timezone.utc)
                self.assertLessEqual(timestamps["created_at"], timestamps["modified_at"])
                self.assertLessEqual(timestamps["modified_at"], datetime.now(timezone.utc))
                self.assertEqual(fields["reviewed_by"], "")
                self.assertEqual(fields["reviewed_at"], "")
                self.assertNotIn("visibility", fields)
                self.assertTrue(fields["title"].startswith("Fiction — "))
                self.assertTrue(parts[2].lstrip().startswith("# " + fields["title"] + "\n"))

    def test_synthetic_warnings_and_editorial_structures(self):
        for name, headings in DOCUMENTS.items():
            with self.subTest(document=name):
                text = (BASE / "documents" / name).read_text(encoding="utf-8")
                self.assertIn("DOCUMENT SYNTHÉTIQUE POUR LES TESTS", text)
                self.assertIn("sans rapport avec BC", text)
                self.assertIn("Le « je » désigne une personne fictive.", text)
                self.assertEqual(re.findall(r"^## (.+)$", text, re.MULTILINE), headings)

    def test_links_and_whitespace(self):
        paths = [BASE / "README.md", BASE / "check.py"]
        paths.extend(BASE / "documents" / name for name in DOCUMENTS)
        for path in paths:
            with self.subTest(file=path.name):
                raw = path.read_bytes()
                self.assertTrue(raw.endswith(b"\n"))
                text = raw.decode("utf-8")
                for number, line in enumerate(text.splitlines(), 1):
                    self.assertEqual(line, line.rstrip(), f"{path.name}:{number}")
                if path.suffix == ".md":
                    for destination in re.findall(r"\]\(([^)]+)\)", text):
                        target = (path.parent / destination).resolve()
                        self.assertTrue(target.is_relative_to(BASE), destination)
                        self.assertTrue(target.is_file(), destination)

    def test_scripted_arithmetic_and_explicit_limits(self):
        text = (BASE / "documents" / "projet-reperage-reserves.md").read_text(encoding="utf-8")
        anomalies = re.search(
            r"comportait (\d+) entrées d'anomalies ; (\d+) ont été résolues et (\d+) sont restées ouvertes",
            text,
        )
        self.assertIsNotNone(anomalies)
        total, resolved, open_items = map(int, anomalies.groups())
        self.assertEqual(total, resolved + open_items)
        medians = re.search(r"temps médian passe de (\d+) minutes avant correction à (\d+) minutes", text)
        reduction = re.search(r"La baisse de (\d+) minutes de la médiane", text)
        self.assertIsNotNone(medians)
        self.assertIsNotNone(reduction)
        before, after = map(int, medians.groups())
        self.assertEqual(before - after, int(reduction[1]))
        self.assertIn("le nombre d'objets distincts touchés n'est pas défini", text)
        self.assertIn("on ne peut pas calculer la médiane des gains individuels", text)

    def test_documented_future_coverage(self):
        text = (BASE / "README.md").read_text(encoding="utf-8")
        self.assertEqual(text.count("| « "), 14)
        self.assertIn("« Est-ce que BC a réalisé ces projets ? »", text)
        self.assertIn("scripted expectations for future tests", text)
        self.assertIn("not results from such a validator", text)
        for case in ("No `visibility: public`", "Empty `reviewed_by`", "Empty `reviewed_at`"):
            self.assertIn("| " + case + " | Reject", text)


if __name__ == "__main__":
    unittest.main(verbosity=2)
