const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const dir = path.join(root, 'outputs/rank-social-deploy');
const pub = path.join(dir, 'public');
const project = 'honxomlang-e6974';
const baseUrl = `https://${project}.web.app`;
const lib = 'C:/Users/Kien/AppData/Roaming/npm/node_modules/firebase-tools/lib/';
const patches = ['assets/js/site_rank.js', 'assets/js/site_rank_players.js', 'assets/css/site_rank.css', 'assets/js/meme_game.js'];
const startMarker = '    // Friend requests expose only the sender and recipient; friendship membership is immutable.';
const endMarker = '    // Players publish only their own saved duel deck; no Elo is client-writable.';

function mergeRules(live, local) {
  const localStart = local.indexOf(startMarker), localEnd = local.indexOf(endMarker, localStart);
  if (localStart < 0 || localEnd < 0) throw Error('Could not isolate the local friend rules.');
  const block = local.slice(localStart, localEnd);
  const oldStart = live.indexOf(startMarker), oldEnd = live.indexOf(endMarker, oldStart);
  if (oldStart >= 0 && oldEnd > oldStart) return live.slice(0, oldStart) + block + live.slice(oldEnd);
  const insertion = live.indexOf(endMarker);
  if (insertion < 0) throw Error('Live rules changed; cannot safely add the friend rules.');
  return live.slice(0, insertion) + block + live.slice(insertion);
}

(async () => {
  fs.mkdirSync(pub, { recursive: true });
  const account = require(lib + 'auth.js').getGlobalDefaultAccount();
  await require(lib + 'requireAuth.js').requireAuth({ ...account, project, nonInteractive: true });
  const hosting = require(lib + 'hosting/api.js');
  const current = await hosting.getChannel(project, project, 'live');
  const version = current.release.version;
  const Client = require(lib + 'apiv2.js').Client;
  const client = new Client({ urlPrefix: require(lib + 'api.js').hostingApiOrigin(), apiVersion: 'v1beta1', auth: true });
  let token; const files = [];
  do {
    const response = await client.get('/' + version.name + '/files', { queryParams: { pageSize: 1000, ...(token ? { pageToken: token } : {}) } });
    files.push(...(response.body.files || [])); token = response.body.nextPageToken;
  } while (token);
  for (const file of patches) if (!files.some(item => item.path === '/' + file && item.status === 'ACTIVE')) throw Error('Required live file is absent: ' + file);
  fs.writeFileSync(path.join(dir, 'baseline.json'), JSON.stringify({ version, files }, null, 2));
  const html = await Promise.all(['index.html', 'memecard.html'].map(async file => {
    const response = await fetch(`${baseUrl}/${file}`); if (!response.ok) throw Error(`Could not read live ${file}: ${response.status}`);
    return [file, await response.text()];
  }));
  for (const [file, content] of html) {
    const required = file === 'index.html' ? patches.filter(asset => asset !== 'assets/js/meme_game.js') : patches;
    for (const asset of required) if (!content.includes(asset)) throw Error(`${file} no longer loads ${asset}; update the patch scope before publishing.`);
  }
  for (const file of patches) {
    const target = path.join(pub, file); fs.mkdirSync(path.dirname(target), { recursive: true }); fs.copyFileSync(path.join(root, file), target);
  }

  const rules = require(lib + 'gcp/rules.js');
  const releases = await rules.listAllReleases(project);
  const release = releases.find(item => item.name.endsWith('/cloud.firestore')) || releases.find(item => item.name.endsWith('/cloud.firestore/(default)'));
  if (!release) throw Error('Active Firestore rules release is missing.');
  const sources = await rules.getRulesetContent(release.rulesetName);
  const source = sources.find(item => item.content.includes('service cloud.firestore'));
  if (!source) throw Error('Active rules source is missing.');
  fs.writeFileSync(path.join(dir, 'baseline-rules.json'), JSON.stringify({ release, sources }, null, 2));
  const local = fs.readFileSync(path.join(root, 'firestore.rules'), 'utf8');
  fs.writeFileSync(path.join(dir, 'firestore.rules'), mergeRules(source.content, local));
  fs.writeFileSync(path.join(dir, 'patch-manifest.json'), JSON.stringify({
    patches,
    validationFiles: ['rank-service-results.json', 'ui-results.json', 'rules-results.json', 'ai-results.json'],
    message: 'Add friend requests, friend challenges, win/loss/draw records and rank progress.',
    scope: 'Refresh rank UI and add private Firestore friend records. Secure quick matchmaking source remains disabled until server deployment.'
  }, null, 2));
  console.log(`Prepared a rank/social patch against Hosting ${version.name} and Firestore rules ${release.rulesetName}.`);
})().catch(error => { console.error(error.message); process.exitCode = 1; });
