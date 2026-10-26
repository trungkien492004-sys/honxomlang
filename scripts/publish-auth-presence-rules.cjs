const fs = require('fs');
const path = require('path');
const lib = 'C:/Users/Kien/AppData/Roaming/npm/node_modules/firebase-tools/lib/';
const project = 'honxomlang-e6974';
const dir = path.resolve(__dirname, '../outputs/auth-presence');

(async () => {
  if (JSON.parse(fs.readFileSync(path.join(dir, 'rules-results.json'), 'utf8')).status !== 'passed') {
    throw Error('Firestore rules validation is missing.');
  }
  const account = require(lib + 'auth.js').getGlobalDefaultAccount();
  await require(lib + 'requireAuth.js').requireAuth({ ...account, project, nonInteractive: true });
  const rules = require(lib + 'gcp/rules.js');
  const baseline = JSON.parse(fs.readFileSync(path.join(dir, 'baseline-rules.json'), 'utf8'));
  const current = (await rules.listAllReleases(project)).find(item => item.name === baseline.release.name);
  if (current?.rulesetName !== baseline.release.rulesetName) {
    throw Error('Firestore rules changed after preparation; refresh the baseline before publishing.');
  }
  const created = await rules.createRuleset(project, [{
    name: 'firestore.rules',
    content: fs.readFileSync(path.join(dir, 'firestore.rules'), 'utf8')
  }]);
  const rulesetName = typeof created === 'string' ? created : created.name;
  if (!rulesetName) throw Error('Firestore did not return a new ruleset.');
  await rules.updateRelease(project, rulesetName, 'cloud.firestore');
  fs.writeFileSync(path.join(dir, 'rules-release.json'), JSON.stringify({
    rulesetName,
    previousRuleset: baseline.release.rulesetName,
    at: new Date().toISOString()
  }, null, 2));
  console.log('Published the validated, owner-only presence fields for public directory entries.');
})().catch(error => { console.error(error.message); process.exitCode = 1; });
