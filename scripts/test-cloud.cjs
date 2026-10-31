// P6 cloud sync: fake identity + localStorage-backed in-memory Firestore, never the real project.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),puppeteer=require('puppeteer');
const root=path.resolve(__dirname,'..'),pub=path.join(root,'dist'),out=path.join(root,'outputs/cloud');fs.mkdirSync(out,{recursive:true});

const DB_KEY='__fakeFirestore';
const stubIdentity=`(() => {
  const read = () => { try { return JSON.parse(localStorage.getItem(${JSON.stringify(DB_KEY)}) || '{}'); } catch { return {}; } };
  const clone = value => value === undefined ? undefined : JSON.parse(JSON.stringify(value));
  const subs = [];
  const snapshot = (key, data) => ({ exists: data !== undefined, id: key.split('/').pop(), data: () => clone(data) });
  const rowsOf = name => Object.entries(read()).filter(([key]) => key.startsWith(name + '/'));
  const listSnapshot = name => ({ docs: rowsOf(name).map(([key, data]) => snapshot(key, data)) });
  const notifyAll = () => subs.slice().forEach(entry => entry.fn(entry.view()));
  const save = docs => localStorage.setItem(${JSON.stringify(DB_KEY)}, JSON.stringify(docs));
  const write = docs => { save(docs); notifyAll(); };

  function plain(pathName) {
    return {
      path: pathName,
      get() { return Promise.resolve(snapshot(pathName, read()[pathName])); },
      set(data) { const docs = read(); docs[pathName] = clone(data); write(docs); return Promise.resolve(); },
      update(data) { const docs = read(); docs[pathName] = { ...(docs[pathName] || {}), ...clone(data) }; write(docs); return Promise.resolve(); },
      delete() { const docs = read(); delete docs[pathName]; write(docs); return Promise.resolve(); },
      onSnapshot(fn) { const entry = { fn, view: () => snapshot(pathName, read()[pathName]) }; subs.push(entry); entry.fn(entry.view()); return () => subs.splice(subs.indexOf(entry), 1); }
    };
  }
  function offline(pathName) {
    return { path: pathName, get: () => Promise.reject(Error('mock offline')), set: () => Promise.reject(Error('mock offline')), update: () => Promise.reject(Error('mock offline')), delete: () => Promise.reject(Error('mock offline')), onSnapshot: plain(pathName).onSnapshot };
  }
  const ref = pathName => (window.__cloudWriteFails ? offline : plain)(pathName);
  function collection(name) {
    const query = {
      where() { return query; }, orderBy() { return query; }, limit() { return query; },
      get() { return Promise.resolve(listSnapshot(name)); },
      onSnapshot(fn) { const entry = { fn, view: () => listSnapshot(name) }; subs.push(entry); entry.fn(entry.view()); return () => subs.splice(subs.indexOf(entry), 1); }
    };
    query.doc = id => ref(name + '/' + id);
    return query;
  }
  const store = {
    doc: ref, collection,
    async runTransaction(fn) { return fn({ get: r => Promise.resolve(snapshot(r.path, read()[r.path])), set: (r, d) => r.set(d), update: (r, d) => r.update(d) }); }
  };
  window.firebase = { firestore: Object.assign(() => store, { FieldValue: { serverTimestamp: () => Date.now(), increment: n => n }, Timestamp: { fromMillis: () => Date.now() } }) };
  window.__cloudDocs = read;
  window.__cloudWrite = (key, value) => { const docs = read(); docs[key] = value; write(docs); };
  window.__cloudFail = on => { window.__cloudWriteFails = !!on; };

  let user = null, ready = false;
  const listeners = [];
  const state = () => ({ user, ready, newbie: false });
  window.siteIdentity = {
    get user() { return user; }, get ready() { return ready; }, get db() { return store; },
    get newbie() { return false; }, get signing() { return false; }, error: null,
    whenReady: Promise.resolve(),
    subscribe(fn) { listeners.push(fn); fn(state()); return () => listeners.splice(listeners.indexOf(fn), 1); },
    login() { return Promise.resolve(user); }
  };
  window.__setAuth = value => { user = value; ready = true; listeners.slice().forEach(fn => fn(state())); };
  setTimeout(() => { if (!ready) { ready = true; listeners.slice().forEach(fn => fn(state())); } }, 250);
})();`;

const server=http.createServer((req,res)=>{const f=path.resolve(pub,'.'+new URL(req.url,'http://localhost').pathname.replace(/^\/$/,'/index.html'));if(!f.startsWith(pub+path.sep))return res.writeHead(403).end();fs.readFile(f,(e,b)=>{if(e)return res.writeHead(404).end();res.writeHead(200,{'Content-Type':({'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.mp3':'audio/mpeg'})[path.extname(f)]||'application/octet-stream'});res.end(b);});});
const USER={uid:'cloudtestuid123',displayName:'Tester',email:'tester@example.com',metadata:{creationTime:new Date(Date.now()-86400000).toISOString()}};
const KEY='player_progress';

(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
const browser=await puppeteer.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--no-sandbox','--disable-background-timer-throttling','--disable-renderer-backgrounding']});
try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>{errors.push(e.message);if(process.env.DEBUG_ERRORS)console.error(e.stack);});
 await page.setRequestInterception(true);
 page.on('request',r=>r.url().includes('site_identity.js')?r.respond({status:200,contentType:'text/javascript',body:stubIdentity}):r.continue());
 await page.evaluateOnNewDocument(()=>{try{localStorage.setItem('rank-promo-dismissed','1');sessionStorage.setItem('rank-promo-dismissed','1');}catch{}});
 await page.setViewport({width:1366,height:768});
 const boot=async()=>{await page.goto(base+'/memecard.html');await page.waitForFunction(()=>window.memeProgress&&window.memePacks&&window.memeCloud&&window.siteIdentity&&window.siteIdentity.ready,{timeout:30000});await page.waitForSelector('#packBtn');};
 const signIn=async()=>{await page.evaluate(u=>window.__setAuth(u),USER);};
 const doc=()=>page.evaluate(k=>window.__cloudDocs()[k]||null,`${KEY}/${USER.uid}`);
 const waitStatus=async next=>page.waitForFunction(s=>memeCloud.status===s,{polling:100,timeout:20000},next);

 await boot();
 const guest=await page.evaluate(()=>({status:memeCloud.status,chip:document.getElementById('cloudState').textContent,title:document.getElementById('cloudBtn').title,account:memeCloud.account,chips:document.querySelectorAll('.progress-chips .progress-chip').length}));
 assert.equal(guest.status,'guest','a guest keeps progress on the device');assert.equal(guest.account,null);assert.equal(guest.chip,'Khách');
 assert.match(guest.title,/Đăng nhập Google/);assert.ok(guest.chips>=5,'the cloud chip joins the HUD chips');
 assert.equal(await doc(),null,'a guest never writes to cloud');
 await page.screenshot({path:path.join(out,'cloud-guest-hud-1366x768.png')});

 await signIn();
 await waitStatus('synced');
 const firstPush=await doc();
 assert.equal(firstPush.uid,USER.uid,'the document belongs to the signed-in player');assert.equal(firstPush.v,1);
 assert.ok(Number.isFinite(firstPush.savedAt)&&firstPush.savedAt>0,'savedAt carries the local stamp');
 assert.equal(firstPush.state.level,await page.evaluate(()=>memeProgress.state.level));
 assert.equal(firstPush.state.xu,await page.evaluate(()=>memeProgress.state.xu));
 assert.ok(Object.keys(firstPush.state.owned).length>0,'the owned map travels with the payload');
 assert.equal(await page.evaluate(()=>document.getElementById('cloudState').textContent),'Đã lưu');

 const localChange=await page.evaluate(async()=>{memeProgress.addXu(700);const pending=memeCloud.pending;const result=await memeCloud.pushNow();return {pending,result,savedAt:memeProgress.state.updatedAt,xu:memeProgress.state.xu};});
 assert.equal(localChange.pending,true,'a local change marks the queue dirty');assert.equal(localChange.result.ok,true);
 const pushed=await doc();assert.equal(pushed.state.xu,localChange.xu,'a newer local copy overwrites cloud');assert.equal(pushed.savedAt,localChange.savedAt);

 const debounced=await page.evaluate(async uid=>{memeProgress.addDust(321);const marked=memeCloud.pending;await new Promise(r=>setTimeout(r,memeCloud.DEBOUNCE+900));return {marked,savedAt:(window.__cloudDocs()['player_progress/'+uid]||{}).savedAt,now:memeProgress.state.updatedAt};},USER.uid);
 assert.equal(debounced.marked,true,'an edit queues a sync without a button press');assert.ok(debounced.savedAt>=debounced.now,'the debounced push flushes by itself');

 await page.click('#cloudBtn');await page.waitForSelector('.cloud-modal');
 const modal=await page.evaluate(()=>({title:document.querySelector('.cloud-modal h2').textContent,facts:[...document.querySelectorAll('.cloud-facts b')].map(n=>n.textContent),push:!document.getElementById('cloudPush').disabled,pull:!document.getElementById('cloudPull').disabled,note:document.querySelector('.cloud-note').textContent}));
 assert.match(modal.title,/Đồng bộ tiến trình/);assert.ok(modal.facts.length>=5,'the modal lists the sync facts');
 assert.equal(modal.push,true);assert.equal(modal.pull,true);assert.match(modal.note,/Bản mới hơn thắng/);
 await page.screenshot({path:path.join(out,'cloud-modal-1366x768.png')});
 await page.click('#cloudClose');await page.waitForFunction(()=>document.getElementById('modal').classList.contains('hidden'));

 await page.evaluate(()=>window.__cloudFail(true));
 const offline=await page.evaluate(async()=>{memeProgress.addXu(50);const result=await memeCloud.pushNow();return {result,status:memeCloud.status,error:memeCloud.error,chip:document.getElementById('cloudBtn').title,label:document.getElementById('cloudState').textContent,xu:memeProgress.state.xu,stored:JSON.parse(localStorage.getItem('xom-progress-v1')).xu};});
 assert.equal(offline.result.ok,false,'a failed push is reported');assert.match(offline.result.error,/mock offline/);
 assert.equal(offline.status,'error');assert.match(offline.error,/mock offline/);assert.equal(offline.label,'Lỗi lưu');assert.match(offline.chip,/vẫn an toàn trên máy/);
 assert.equal(offline.xu,offline.stored,'local play keeps working while cloud is down');
 await page.evaluate(()=>window.__cloudFail(false));
 await page.evaluate(()=>memeCloud.pushNow());

 const future=await page.evaluate(uid=>{const key='player_progress/'+uid,saved=Date.now()+120000,docs=window.__cloudDocs(),mine=docs[key];mine.savedAt=saved;mine.state.updatedAt=saved;mine.state.level=23;mine.state.xu=4242;window.__cloudWrite(key,mine);return saved;},USER.uid);
 await boot();await signIn();await waitStatus('loaded');
 const adopted=await page.evaluate(()=>({level:memeProgress.state.level,xu:memeProgress.state.xu,savedAt:memeProgress.state.updatedAt,chip:document.getElementById('cloudState').textContent,stored:JSON.parse(localStorage.getItem('xom-progress-v1')).level}));
 assert.equal(adopted.level,23,'a newer cloud copy replaces the local progress');assert.equal(adopted.xu,4242);
 assert.equal(adopted.savedAt,future,'adopting keeps the cloud stamp instead of claiming a new local edit');
 assert.equal(adopted.chip,'Đã tải');assert.equal(adopted.stored,23,'the adopted copy is written back to localStorage');
 assert.equal((await doc()).savedAt,future,'the pull does not push a fresh timestamp');

 await page.evaluate(uid=>{const key='player_progress/'+uid,saved=Date.now()-600000,docs=window.__cloudDocs(),mine=docs[key];mine.savedAt=saved;mine.state.updatedAt=saved;mine.state.level=4;mine.state.xu=11;window.__cloudWrite(key,mine);},USER.uid);
 await boot();await signIn();await waitStatus('synced');
 const kept=await page.evaluate(()=>({level:memeProgress.state.level,xu:memeProgress.state.xu}));
 assert.equal(kept.level,23,'an older cloud copy never overwrites newer local progress');assert.equal(kept.xu,4242);
 await page.evaluate(()=>memeCloud.pushNow());
 const resynced=await doc();
 assert.equal(resynced.state.level,kept.level,'the newer local copy is offered back to cloud');assert.equal(resynced.state.xu,kept.xu);

 const hud=await page.evaluate(()=>({xu:document.getElementById('progressXu').textContent,level:document.getElementById('progressLevel').textContent}));
 assert.equal(hud.level,String(kept.level));assert.match(hud.xu,/^4[.,]242$/,'the HUD repaints from the synced wallet');

 await page.click('#cloudBtn');await page.waitForSelector('.cloud-modal');
 await page.click('#cloudPull');
 const pulled=await page.evaluate(async()=>{await new Promise(r=>setTimeout(r,600));return {notice:document.querySelector('.mini-action-toast')?.textContent||'',status:memeCloud.status};});
 assert.match(pulled.notice,/Đã tải tiến trình từ cloud/,'manual pull reports what it did');
 assert.equal(pulled.status,'loaded');
 await page.click('#cloudClose');

 await page.setViewport({width:390,height:844});
 await page.waitForFunction(()=>!document.querySelector('.mini-action-toast'),{polling:200,timeout:9000});
 const mobile=await page.evaluate(()=>{const b=document.getElementById('cloudBtn');return {width:b.getBoundingClientRect().width,label:getComputedStyle(document.getElementById('cloudState')).display};});
 assert.ok(mobile.width<=64,`the mobile chip is icon-only (${mobile.width}px)`);assert.equal(mobile.label,'none');
 await page.screenshot({path:path.join(out,'cloud-hud-390x844.png')});
 await page.setViewport({width:1366,height:768});

 const paths=await page.evaluate(prefix=>Object.keys(window.__cloudDocs()).filter(k=>k.startsWith(prefix)),KEY+'/');
 assert.deepEqual(paths,[`${KEY}/${USER.uid}`],'exactly one private progress document per player');

 assert.deepEqual(errors,[],errors.join('\n'));
 console.log('P6: HUD cloud chip, guests never write, first sign-in pushes, newer-local and newer-cloud resolution, debounced flush, manual push/pull modal, offline errors keep local play alive, one private document per player, mobile icon chip, no page errors.');
}finally{await browser.close();server.close();}})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
