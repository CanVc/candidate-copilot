// Construction-only Pi loader probe. No session, prompt, credentials or provider.
// Invoke with Node and the installed Pi package root, after reading its SDK docs.
import assert from 'node:assert/strict';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const packageRoot = process.argv[2];
assert(packageRoot, 'Pass the installed Pi package root; no package acquisition is performed.');
const { loadSkills, formatSkillsForPrompt } = await import(pathToFileURL(join(packageRoot, 'dist/index.js')).href);
const project = fileURLToPath(new URL('../../../../', import.meta.url));
const temporary = mkdtempSync(join(tmpdir(), 'synthetic-authoring-pi-'));
try {
  const source = join(project, '.pi/skills/content-authoring/SKILL.md');
  const destination = join(temporary, '.pi/skills/content-authoring/SKILL.md');
  mkdirSync(dirname(destination), { recursive: true });
  copyFileSync(source, destination);
  const { skills, diagnostics } = loadSkills({
    cwd: temporary,
    agentDir: join(temporary, '.agent'),
    skillPaths: [dirname(destination)],
    includeDefaults: false,
  });
  assert.deepEqual(diagnostics, []);
  assert.equal(skills.length, 1);
  assert.equal(skills[0].name, 'content-authoring');
  assert.equal(skills[0].disableModelInvocation, true);
  assert(!formatSkillsForPrompt(skills).includes('content-authoring'));
  const body = readFileSync(skills[0].filePath, 'utf8');
  for (const match of body.matchAll(/\{project-root\}\/([^`\s]+)/g)) {
    const relative = match[1];
    assert(!relative.includes('..'));
    assert(readFileSync(join(project, relative)).length > 0);
  }
  console.log('PASS: one Pi skill, no diagnostics, explicit-only prompt exclusion; routed generic resources exist.');
  console.log('LIMIT: loader/resource wiring only, not interactive command execution or model behavior.');
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
