const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const zlib = require('zlib');
const { Readable } = require('stream');

const root = path.resolve(__dirname, '..');
const dir = path.join(root, 'outputs/rank-social-deploy');
const baseline = JSON.parse(fs.readFileSync(path.join(dir, 'baseline.json'), 'utf8'));
const manifest = JSON.parse(fs.readFileSync(path.join(dir, 'patch-manifest.json'), 'utf8'));
const project = 'honxomlang-e6974';
const lib = 'C:/Users/Kien/AppData/Roaming/npm/node_modules/firebase-tools/lib/';

(async () => {
  if (process.argv[2] !== '--publish') throw Error('Pass --publish to release the validated rank/social changes.');
  for (const file of manifest.validationFiles || []) {
    const result = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
    if (result.status !== 'passed') throw Error(`Validation has not passed: ${file}`);
  }
  const account = require(lib + 'auth.js').getGlobalDefaultAccount();
  if (!account) throw Error('No Firebase account is signed in.');
  await require(lib + 'requireAuth.js').requireAuth({ ...account, project, nonInteractive: true });
  const hosting = require(lib + 'hosting/api.js');
  const Client = require(lib + 'apiv2.js').Client;
  const client = new Client({ urlPrefix: require(lib + 'api.js').hostingApiOrigin(), apiVersion: 'v1beta1', auth: true });
  const current = await hosting.getChannel(project, project, 'live');
  if (current.release.version.name !== baseline.version.name) throw Error('The live site changed after preparation. Re-prepare and retest before publishing.');
  if (baseline.files.length < 100) throw Error('Hosting baseline is incomplete.');
  const hashes = Object.fromEntries(baseline.files.map(file => {
    if (file.status !== 'ACTIVE') throw Error('Baseline contains a non-active file.');
    return [file.path, file.hash];
  }));
  if (Object.keys(hashes).length !== baseline.files.length) throw Error('Hosting baseline has duplicate file paths.');
  const uploads = new Map(), changes = [];
  for (const file of manifest.patches) {
    if (!hashes['/' + file]) throw Error('Unexpected file in a surgical patch: ' + file);
    const packed = zlib.gzipSync(fs.readFileSync(path.join(dir, 'public', file)), { level: 9 });
    const hash = crypto.createHash('sha256').update(packed).digest('hex');
    uploads.set(hash, packed); changes.push({ path: '/' + file, oldHash: hashes['/' + file], newHash: hash }); hashes['/' + file] = hash;
  }
  const name = await hosting.createVersion(project, project, { config: baseline.version.config });
  fs.writeFileSync(path.join(dir, 'pending-release.json'), JSON.stringify({ name, baseline: baseline.version.name, changes }, null, 2));
  const entries = Object.entries(hashes);
  for (let i = 0; i < entries.length; i += 500) {
    const populated = await client.post('/' + name + ':populateFiles', { files: Object.fromEntries(entries.slice(i, i + 500)) });
    const uploadClient = new Client({ urlPrefix: populated.body.uploadUrl, auth: true });
    for (const hash of populated.body.uploadRequiredHashes || []) {
      const body = uploads.get(hash);
      if (!body) throw Error('An unchanged Hosting file is missing from the local upload cache.');
      await uploadClient.request({ method: 'POST', path: '/' + hash, body: Readable.from([body]) });
    }
  }
  await hosting.updateVersion(project, project, name.split('/').pop(), { status: 'FINALIZED' });
  const beforeRelease = await hosting.getChannel(project, project, 'live');
  if (beforeRelease.release.version.name !== baseline.version.name) throw Error('A newer Hosting release appeared during upload; the patch was not published.');
  const release = await hosting.createRelease(project, project, 'live', name, { message: manifest.message });
  fs.writeFileSync(path.join(dir, 'release.json'), JSON.stringify({ name: release.name, version: name, baseline: baseline.version.name, changes, scope: manifest.scope, releasedAt: new Date().toISOString() }, null, 2));
  console.log('Published validated rank/social Hosting patch:', name);
})().catch(error => { console.error(error.message); process.exitCode = 1; });
