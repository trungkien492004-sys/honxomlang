const assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),http=require('http'),puppeteer=require('puppeteer');
const pub=path.resolve(__dirname,'..','dist');
const server=http.createServer((req,res)=>{const f=path.resolve(pub,'.'+new URL(req.url,'http://l').pathname.replace(/^\/$/,'/memecard.html'));if(!f.startsWith(pub+path.sep))return res.writeHead(403).end();fs.readFile(f,(e,b)=>{if(e)return res.writeHead(404).end();res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png'})[path.extname(f)]||'application/octet-stream');res.end(b);});});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await puppeteer.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--no-sandbox']});
try{
 const page=await browser.newPage();await page.setViewport({width:1100,height:760});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`http://127.0.0.1:${server.address().port}/memecard.html`);
 await page.waitForFunction(()=>window.memeVfxPack&&window.memeFx,{timeout:30000});
 // 1. mọi ảnh sheet/hạt tải được và đúng kích thước khung
 const imgs=await page.evaluate(async()=>{const P=memeVfxPack,out=[];
  for(const [k,s] of Object.entries(P.SHEETS)){const r=await new Promise(res=>{const i=new Image();i.onload=()=>res([i.naturalWidth,i.naturalHeight]);i.onerror=()=>res(null);i.src='assets/vfx/'+s.src;});
   out.push({k,ok:!!r&&r[0]>=s.fw*s.frames&&r[1]===s.fh,size:r,need:[s.fw*s.frames,s.fh]});}
  for(const n of ['magic_01','circle_05','flare_01','star_01','spark_01','slash_01']){const r=await new Promise(res=>{const i=new Image();i.onload=()=>res(1);i.onerror=()=>res(0);i.src='assets/vfx/kenney-particles/'+n+'.png';});out.push({k:n,ok:!!r});}
  return out;});
 assert.deepEqual(imgs.filter(i=>!i.ok),[],'ảnh hiệu ứng tải được: '+JSON.stringify(imgs.filter(i=>!i.ok)));
 // 2. memeFx đã được bọc, hiệu ứng thật sự sinh phần tử và tự dọn
 const r=await page.evaluate(async()=>{const P=memeVfxPack,layer=document.getElementById('memeFxLayer');
  const wrapped=!!memeFx.__packWrapped;const before=layer.children.length;
  P.playSheet('lightning',{x:300,y:300});P.magicCircle({x:500,y:300});P.sparkleBurst({x:700,y:300},'#ffd36b',10);
  const during=layer.children.length-before;const live=P.live;
  await new Promise(r=>setTimeout(r,1800));return{wrapped,during,live,after:layer.children.length-before,liveAfter:P.live};});
 assert.ok(r.wrapped,'memeFx đã được bọc');assert.ok(r.during>=10,'sinh phần tử hiệu ứng: '+r.during);assert.equal(r.after,0,'hiệu ứng tự dọn');assert.equal(r.liveAfter,0);
 // 3. chế độ minimal thì không phát
 const min=await page.evaluate(()=>{memeFx.setMode('minimal');const l=document.getElementById('memeFxLayer'),b=l.children.length;memeVfxPack.playSheet('lightning',{x:1,y:1});memeVfxPack.magicCircle({x:2,y:2});const n=l.children.length-b;memeFx.setMode('full');return n;});
 assert.equal(min,0,'minimal: không phát hiệu ứng');
 assert.deepEqual(errors,[],'không lỗi trang: '+errors.join('; '));
 console.log('test-vfx-pack: OK');
}finally{await browser.close();server.close();}})().catch(e=>{console.error(e);process.exitCode=1;server.close();});
