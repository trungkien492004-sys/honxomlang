const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');
const project = 'honxomlang-e6974';
const lib = 'C:/Users/Kien/AppData/Roaming/npm/node_modules/firebase-tools/lib/';
const dir = path.resolve(__dirname, '../outputs/rank-social-deploy');

(async () => {
  const account = require(lib + 'auth.js').getGlobalDefaultAccount();
  await require(lib + 'requireAuth.js').requireAuth({ ...account, project, nonInteractive: true });
  const expectedHosting = JSON.parse(fs.readFileSync(path.join(dir, 'release.json'), 'utf8'));
  const hosting = require(lib + 'hosting/api.js');
  const live = await hosting.getChannel(project, project, 'live');
  assert.equal(live.release.version.name, expectedHosting.version, 'Live Hosting version must be the released rank/social patch.');
  for (const [file, marker] of [
    ['assets/js/site_rank.js', 'rankQuickMatch'],
    ['assets/js/site_rank_players.js', 'rank_friendships'],
    ['assets/css/site_rank.css', '.rank-progress']
  ]) {
    const response = await fetch(`https://${project}.web.app/${file}?verify=${Date.now()}`);
    assert.equal(response.status, 200, `${file} must be available on live Hosting.`);
    assert.ok((await response.text()).includes(marker), `${file} must contain the expected live feature.`);
  }
  const expectedRules = JSON.parse(fs.readFileSync(path.join(dir, 'rules-release.json'), 'utf8'));
  const rules = require(lib + 'gcp/rules.js');
  const release = (await rules.listAllReleases(project)).find(item => item.name === expectedRules.previous || item.name.endsWith('/cloud.firestore'));
  assert.ok(release, 'Active Firestore release must be available.');
  const active = (await rules.listAllReleases(project)).find(item => item.name.endsWith('/cloud.firestore'));
  assert.equal(active?.rulesetName, expectedRules.rulesetName, 'Active Firestore rules must include the released friend rules.');
  const source = (await rules.getRulesetContent(active.rulesetName)).find(item => item.content.includes('service cloud.firestore'));
  assert.ok(source?.content.includes('match /rank_friendships/'));
  assert.ok(source?.content.includes('match /rank_daily/'));
  console.log('Live rank/social release verified:', live.release.version.name, expectedRules.rulesetName);
})().catch(error => { console.error(error.message); process.exitCode = 1; });
