const fs = require('fs');
const path = require('path');
const project = 'honxomlang-e6974';
const lib = 'C:/Users/Kien/AppData/Roaming/npm/node_modules/firebase-tools/lib/';
const dir = path.resolve(__dirname, '../outputs/rank-social-deploy');

(async () => {
  const account = require(lib + 'auth.js').getGlobalDefaultAccount();
  await require(lib + 'requireAuth.js').requireAuth({ ...account, project, nonInteractive: true });
  const Client = require(lib + 'apiv2.js').Client;
  const client = new Client({ urlPrefix: 'https://firebaserules.googleapis.com', apiVersion: 'v1', auth: true });
  const content = fs.readFileSync(path.join(dir, 'firestore.rules'), 'utf8');
  const cases = [
    ['friendship is visible to a member', 'get', 'rank_friendships/alice__bob', 'alice', { uids: ['alice', 'bob'] }, 'ALLOW'],
    ['friendship is visible to the other member', 'get', 'rank_friendships/alice__bob', 'bob', { uids: ['alice', 'bob'] }, 'ALLOW'],
    ['unrelated account cannot read a friendship', 'get', 'rank_friendships/alice__bob', 'mallory', { uids: ['alice', 'bob'] }, 'DENY'],
    ['friend request is visible to its sender', 'get', 'rank_friend_requests/alice_bob', 'alice', { from: 'alice', to: 'bob', status: 'pending' }, 'ALLOW'],
    ['friend request is visible to its recipient', 'get', 'rank_friend_requests/alice_bob', 'bob', { from: 'alice', to: 'bob', status: 'pending' }, 'ALLOW'],
    ['unrelated account cannot read a friend request', 'get', 'rank_friend_requests/alice_bob', 'mallory', { from: 'alice', to: 'bob', status: 'pending' }, 'DENY'],
    ['a missing reverse friend request is not readable', 'get', 'rank_friend_requests/bob_alice', 'alice', null, 'DENY'],
    ['daily rank counters remain server-only', 'get', 'rank_daily/alice_2026-10-26', 'alice', null, 'DENY']
  ];
  const testCases = cases.map(([name, method, document, uid, data, expectation]) => ({
    expectation,
    ...(data ? { resource: { data } } : {}),
    request: { method, path: `/databases/(default)/documents/${document}`, auth: uid ? { uid, token: {} } : null }
  }));
  const response = await client.post(`/projects/${project}:test`, { source: { files: [{ name: 'firestore.rules', content }] }, testSuite: { testCases } });
  const errors = (response.body.issues || []).filter(issue => issue.severity === 'ERROR');
  const failures = (response.body.testResults || []).map((result, index) => ({ name: cases[index][0], state: result.state, debug: result.debugMessages })).filter(result => result.state !== 'SUCCESS');
  if (errors.length || failures.length || response.body.testResults?.length !== cases.length) throw Error(JSON.stringify({ errors, failures, body: response.body }));
  fs.writeFileSync(path.join(dir, 'rules-results.json'), JSON.stringify({ status: 'passed', checks: cases.map(item => item[0]), scope: 'Firebase Firestore Rules dry-run; no changes were published.' }, null, 2));
  console.log('Rank/social Firestore Rules:', cases.length, 'checks passed.');
})().catch(error => { console.error(error.message); process.exitCode = 1; });
