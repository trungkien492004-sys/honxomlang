const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const zlib = require('node:zlib');
const { Readable } = require('node:stream');

const project = 'honxomlang-e6974';
const site = project;
const lib = 'C:/Users/Kien/AppData/Roaming/npm/node_modules/firebase-tools/lib/';
const dir = path.resolve(__dirname, '../outputs/rank-challenge');

(async () => {
  if (process.argv[2] !== '--publish') throw Error('Pass --publish to publish the validated duel challenge fix.');
  const manifest = JSON.parse(fs.readFileSync(path.join(dir, 'patch-manifest.json'), 'utf8'));
  if (JSON.stringify(manifest.patches) !== JSON.stringify(['assets/js/meme_id_duel.js'])) throw Error('The hotfix must change only assets/js/meme_id_duel.js.');
  for (const file of manifest.validationFiles || []) {
    const result = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
    if (result.status !== 'passed') throw Error(`Validation has not passed: ${file}`);
  }

  const baseline = JSON.parse(fs.readFileSync(path.join(dir, 'baseline.json'), 'utf8'));
  const account = require(lib + 'auth.js').getGlobalDefaultAccount();
  if (!account) throw Error('No Firebase account is signed in.');
  await require(lib + 'requireAuth.js').requireAuth({ ...account, project, nonInteractive: true });

  const hosting = require(lib + 'hosting/api.js');
  const Client = require(lib + 'apiv2.js').Client;
  const client = new Client({ urlPrefix: require(lib + 'api.js').hostingApiOrigin(), apiVersion: 'v1beta1', auth: true });
  const live = await hosting.getChannel(project, site, 'live');
  if (live.release.version.name !== baseline.version.name) throw Error('The live site changed after preparation. Re-prepare and retest before publishing.');
  if (!Array.isArray(baseline.files) || baseline.files.length < 100) throw Error('Hosting baseline is incomplete.');

  const hashes = Object.fromEntries(baseline.files.map(file => {
    if (file.status !== 'ACTIVE') throw Error('Baseline contains a non-active file.');
    return [file.path, file.hash];
  }));
  if (Object.keys(hashes).length !== baseline.files.length) throw Error('Baseline has duplicate Hosting file paths.');
  const filePath = '/assets/js/meme_id_duel.js';
  if (!hashes[filePath]) throw Error('The current live site does not contain the duel module.');

  const packed = zlib.gzipSync(fs.readFileSync(path.join(dir, 'public', filePath.slice(1))), { level: 9 });
  const newHash = crypto.createHash('sha256').update(packed).digest('hex');
  const oldHash = hashes[filePath];
  hashes[filePath] = newHash;
  const name = await hosting.createVersion(project, site, { config: baseline.version.config });
  const changes = [{ path: filePath, oldHash, newHash }];
  fs.writeFileSync(path.join(dir, 'pending-release.json'), JSON.stringify({ name, baseline: baseline.version.name, changes }, null, 2));

  const entries = Object.entries(hashes);
  for (let i = 0; i < entries.length; i += 500) {
    const populated = await client.post('/' + name + ':populateFiles', { files: Object.fromEntries(entries.slice(i, i + 500)) });
    const uploadClient = new Client({ urlPrefix: populated.body.uploadUrl, auth: true });
    for (const hash of populated.body.uploadRequiredHashes || []) {
      if (hash !== newHash) throw Error('An unchanged Hosting file unexpectedly needs a local upload.');
      await uploadClient.request({ method: 'POST', path: '/' + hash, body: Readable.from([packed]) });
    }
  }

  await hosting.updateVersion(project, site, name.split('/').pop(), { status: 'FINALIZED' });
  const beforeRelease = await hosting.getChannel(project, site, 'live');
  if (beforeRelease.release.version.name !== baseline.version.name) throw Error('A newer Hosting release appeared during upload; the patch was not published.');
  const release = await hosting.createRelease(project, site, 'live', name, { message: manifest.message });
  fs.writeFileSync(path.join(dir, 'release.json'), JSON.stringify({ name: release.name, version: name, baseline: baseline.version.name, changes, scope: manifest.scope, releasedAt: new Date().toISOString() }, null, 2));
  console.log('Published the single-file duel challenge hotfix:', name);
})().catch(error => { console.error(error.message); process.exitCode = 1; });
