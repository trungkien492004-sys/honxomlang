const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const dir = path.join(root, 'outputs/auth-presence');
const publicDir = path.join(dir, 'public');
const project = 'honxomlang-e6974';
const lib = 'C:/Users/Kien/AppData/Roaming/npm/node_modules/firebase-tools/lib/';
const baseUrl = `https://${project}.web.app`;
const patches = [
  'index.html', 'memecard.html', 'assets/js/firebase.js', 'assets/js/site_access.js',
  'assets/js/site_identity.js', 'assets/js/site_rank.js', 'assets/js/site_rank_players.js',
  'assets/js/meme_id_duel.js', 'assets/css/site_rank.css'
];
const startMarker = '    // Public names and IDs only; saved decks remain available to signed-in players.';
const endMarker = '    // Canonical state is server-only; each member reads one redacted view.';

async function fetchFile(relative) {
  const response = await fetch(`${baseUrl}/${relative}`);
  if (!response.ok) throw Error(`Could not read live ${relative}: ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  const target = path.join(publicDir, relative);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, bytes);
  return bytes.toString('utf8');
}

function replaceRuleBlock(remote, local) {
  const localStart = local.indexOf(startMarker);
  const localEnd = local.indexOf(endMarker, localStart);
  const matchStart = remote.indexOf('match /duel_directory/{userId}');
  if (localStart < 0 || localEnd < 0 || matchStart < 0) {
    throw Error('Could not isolate the public duel-directory rules block.');
  }
  const commentStart = remote.lastIndexOf(startMarker, matchStart);
  const remoteStart = commentStart >= 0 ? commentStart : matchStart;
  const open = remote.indexOf('{\n', matchStart);
  if (open < 0) throw Error('Could not find the opening brace for the public directory rule.');
  let depth = 0;
  let remoteEnd = -1;
  for (let index = open; index < remote.length; index++) {
    if (remote[index] === '{') depth++;
    else if (remote[index] === '}' && --depth === 0) { remoteEnd = index + 1; break; }
  }
  if (remoteEnd < 0) throw Error('Could not find the end of the public directory rules.');
  const block = local.slice(localStart, localEnd);
  return remote.slice(0, remoteStart) + block + remote.slice(remoteEnd);
}

(async () => {
  fs.mkdirSync(publicDir, { recursive: true });
  const account = require(lib + 'auth.js').getGlobalDefaultAccount();
  await require(lib + 'requireAuth.js').requireAuth({ ...account, project, nonInteractive: true });
  const api = require(lib + 'hosting/api.js');
  const Client = require(lib + 'apiv2.js').Client;
  const client = new Client({ urlPrefix: require(lib + 'api.js').hostingApiOrigin(), apiVersion: 'v1beta1', auth: true });
  const version = (await api.getChannel(project, project, 'live')).release.version;
  let token;
  const files = [];
  do {
    const response = await client.get('/' + version.name + '/files', {
      queryParams: { pageSize: 1000, ...(token ? { pageToken: token } : {}) }
    });
    files.push(...(response.body.files || []));
    token = response.body.nextPageToken;
  } while (token);
  fs.writeFileSync(path.join(dir, 'baseline.json'), JSON.stringify({ version, files }, null, 2));

  const index = await fetchFile('index.html');
  const duel = await fetchFile('memecard.html');
  const assets = [...new Set([...index.matchAll(/(?:src|href)="(assets\/[^"?]+)(?:\?[^" ]*)?"/g),
    ...duel.matchAll(/(?:src|href)="(assets\/[^"?]+)(?:\?[^" ]*)?"/g)].map(match => match[1]))];
  for (let i = 0; i < assets.length; i += 8) await Promise.all(assets.slice(i, i + 8).map(fetchFile));
  for (const file of patches) {
    const target = path.join(publicDir, file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(path.join(root, file), target);
  }

  const rules = require(lib + 'gcp/rules.js');
  const release = (await rules.listAllReleases(project)).find(item => item.name.endsWith('/cloud.firestore'));
  if (!release) throw Error('Could not read the active Firestore rules release.');
  const sources = await rules.getRulesetContent(release.rulesetName);
  fs.writeFileSync(path.join(dir, 'baseline-rules.json'), JSON.stringify({ release, sources }, null, 2));
  const source = sources.find(item => item.content.includes('service cloud.firestore'));
  if (!source) throw Error('Active ruleset did not contain Cloud Firestore rules.');
  const localRules = fs.readFileSync(path.join(root, 'firestore.rules'), 'utf8');
  fs.writeFileSync(path.join(dir, 'firestore.rules'), replaceRuleBlock(source.content, localRules));
  fs.writeFileSync(path.join(dir, 'patch-manifest.json'), JSON.stringify({
    patches,
    validationFiles: ['test-results.json', 'rules-results.json'],
    message: 'Stop login flicker and show live online/offline status on the rank board.',
    scope: 'Stabilize login restoration, publish account presence, and display live status in BXH Rank.'
  }, null, 2));
  console.log(`Prepared against Hosting ${version.name} and Firestore rules ${release.rulesetName}.`);
})().catch(error => { console.error(error.message); process.exitCode = 1; });
