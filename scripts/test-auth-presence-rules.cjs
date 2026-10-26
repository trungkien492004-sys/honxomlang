const fs = require('fs');
const path = require('path');
const lib = 'C:/Users/Kien/AppData/Roaming/npm/node_modules/firebase-tools/lib/';
const project = 'honxomlang-e6974';
const dir = path.resolve(__dirname, '../outputs/auth-presence');

(async () => {
  const account = require(lib + 'auth.js').getGlobalDefaultAccount();
  await require(lib + 'requireAuth.js').requireAuth({ ...account, project, nonInteractive: true });
  const Client = require(lib + 'apiv2.js').Client;
  const client = new Client({ urlPrefix: 'https://firebaserules.googleapis.com', apiVersion: 'v1', auth: true });
  const content = fs.readFileSync(path.join(dir, 'firestore.rules'), 'utf8');
  const cases = [
    ['anonymous public directory read', 'list', 'duel_directory/Alice', null, 'ALLOW'],
    ['another account cannot write a player presence record', 'create', 'duel_directory/Bob', 'Alice', 'DENY'],
    ['sender reads own invite', 'get', 'duel_invites/Alice_Bob', 'Alice', 'ALLOW'],
    ['recipient reads own invite', 'get', 'duel_invites/Alice_Bob', 'Bob', 'ALLOW'],
    ['unrelated account cannot read invite', 'get', 'duel_invites/Alice_Bob', 'Eve', 'DENY'],
    ['authenticated player reads saved deck', 'get', 'duel_players/Alice', 'Alice', 'ALLOW'],
    ['anonymous cannot read saved deck', 'get', 'duel_players/Alice', null, 'DENY'],
    ['another account cannot write a saved deck', 'create', 'duel_players/Bob', 'Alice', 'DENY'],
    ['another account cannot forge an invite', 'create', 'duel_invites/Bob_Alice', 'Alice', 'DENY'],
    ['anonymous cannot read an invite', 'get', 'duel_invites/Alice_Bob', null, 'DENY'],
    ['public rank profile read', 'get', 'rank_profiles/test-public', null, 'ALLOW'],
    ['public rank profile list', 'list', 'rank_profiles/test-public', null, 'ALLOW'],
    ['public participant count read', 'list', 'site_members/test-member', null, 'ALLOW'],
    ['client cannot forge Elo', 'create', 'rank_profiles/attacker', 'attacker', 'DENY'],
    ['client cannot change Elo', 'update', 'rank_profiles/attacker', 'attacker', 'DENY'],
    ['client cannot change rank totals', 'update', 'rank_stats/global', 'attacker', 'DENY'],
    ['client cannot create ranked results', 'create', 'rank_matches/fake', 'attacker', 'DENY'],
    ['rank queue remains server-only', 'get', 'rank_queue/attacker', 'attacker', 'DENY'],
    ['canonical duel state remains private', 'get', 'duel_private/fake', 'attacker', 'DENY'],
    ['account cannot register a different UID', 'create', 'site_members/another', 'attacker', 'DENY'],
    ['anonymous cannot register a member', 'create', 'site_members/anonymous', null, 'DENY']
  ];
  const suite = cases.map(([name, method, document, uid, expectation]) => ({
    expectation,
    ...(document.startsWith('duel_invites/') ? { resource: { data: { from: 'Alice', to: 'Bob' } } } : {}),
    request: {
      method,
      path: '/databases/(default)/documents/' + document,
      auth: uid ? { uid, token: { firebase: { sign_in_provider: 'google.com' } } } : null
    }
  }));
  const response = await client.post('/projects/' + project + ':test', {
    source: { files: [{ name: 'firestore.rules', content }] },
    testSuite: { testCases: suite }
  });
  const errors = (response.body.issues || []).filter(issue => issue.severity === 'ERROR');
  const failures = (response.body.testResults || []).map((result, index) => ({
    name: cases[index][0], state: result.state, debug: result.debugMessages
  })).filter(result => result.state !== 'SUCCESS');
  if (errors.length || failures.length || response.body.testResults?.length !== cases.length) {
    throw Error(JSON.stringify({ errors, failures, body: response.body }));
  }
  fs.writeFileSync(path.join(dir, 'rules-results.json'), JSON.stringify({
    status: 'passed', checks: cases.map(item => item[0]),
    scope: 'Firebase Rules dry-run evaluation; it does not publish or write data.'
  }, null, 2));
  console.log('Presence and rank Firestore rules:', cases.length, 'checks passed.');
})().catch(error => { console.error(error.message); process.exitCode = 1; });
