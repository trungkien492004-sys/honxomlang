const fs = require('fs');
const path = require('path');
const project = 'honxomlang-e6974';
const lib = 'C:/Users/Kien/AppData/Roaming/npm/node_modules/firebase-tools/lib/';
const dir = path.resolve(__dirname, '../outputs/rank-social-deploy');

(async () => {
  if (process.argv[2] !== '--publish') throw Error('Pass --publish to publish the reviewed Firestore friend rules.');
  const result = JSON.parse(fs.readFileSync(path.join(dir, 'rules-results.json'), 'utf8'));
  if (result.status !== 'passed') throw Error('Firestore rules checks have not passed.');
  const account = require(lib + 'auth.js').getGlobalDefaultAccount();
  await require(lib + 'requireAuth.js').requireAuth({ ...account, project, nonInteractive: true });
  const rules = require(lib + 'gcp/rules.js');
  const baseline = JSON.parse(fs.readFileSync(path.join(dir, 'baseline-rules.json'), 'utf8'));
  const live = (await rules.listAllReleases(project)).find(item => item.name === baseline.release.name);
  if (live?.rulesetName !== baseline.release.rulesetName) throw Error('Firestore rules changed after preparation. Rebase and retest before publishing.');
  const created = await rules.createRuleset(project, [{ name: 'firestore.rules', content: fs.readFileSync(path.join(dir, 'firestore.rules'), 'utf8') }]);
  const rulesetName = typeof created === 'string' ? created : created.name;
  if (!rulesetName) throw Error('Firestore did not return the new ruleset name.');
  await rules.updateRelease(project, rulesetName, 'cloud.firestore');
  fs.writeFileSync(path.join(dir, 'rules-release.json'), JSON.stringify({ rulesetName, previous: live.rulesetName, at: new Date().toISOString() }, null, 2));
  console.log('Published validated private friend and server-only daily-counter rules.');
})().catch(error => { console.error(error.message); process.exitCode = 1; });
