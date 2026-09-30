// Artifact-only headless Chromium checks. No GUI browser is opened.
import {spawn} from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
const dir=path.dirname(fileURLToPath(import.meta.url));
const artifact=path.resolve(dir,'../mockup-resources-v2-style-2026-09-30.html');
const approved=await fs.readFile(path.resolve(dir,'../wireframe-resources-2026-09-30.html'),'utf8');
const styled=await fs.readFile(artifact,'utf8');
const reference=await fs.readFile(path.resolve(dir,'../../imports/candidate-copilot-maquette-v2/index.html'),'utf8');
assert.equal(styled.match(/<script>([\s\S]*?)<\/script>/)[1],approved.match(/<script>([\s\S]*?)<\/script>/)[1],'Approved simulation JavaScript must remain byte-identical');
const css=styled.match(/<style>([\s\S]*?)<\/style>/)[1];
const sourceHex=new Set(reference.match(/#[0-9a-f]{3,8}\b/gi));
const appliedHex=[...new Set(css.match(/#[0-9a-f]{3,8}\b/gi))];
assert(appliedHex.every(value=>sourceHex.has(value)),'No new CSS hex colors');
await fs.writeFile(path.join(dir,'source-integrity.json'),JSON.stringify({simulationByteIdentical:true,appliedHexColors:appliedHex,allHexColorsFromV2:true},null,2)+'\n');
const binary=process.env.CHROME_BINARY || '/home/cvc/.cache/ms-playwright/chromium-1223/chrome-linux64/chrome';
const profile=await fs.mkdtemp(path.join(os.tmpdir(),'resources-wireframe-'));
const browser=spawn(binary,['--headless=new','--no-sandbox','--disable-gpu','--no-first-run','--remote-debugging-port=0','--user-data-dir='+profile,'about:blank'],{stdio:['ignore','ignore','pipe']});
let errors='';browser.stderr.on('data',d=>errors+=d);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const report=[];
let ws;
try {
 let port;
 for(let i=0;i<100;i++) {try{port=(await fs.readFile(path.join(profile,'DevToolsActivePort'),'utf8')).split('\n')[0];break;}catch{}await sleep(100);}
 if(!port)throw Error(errors);
 const target=await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`,{method:'PUT'})).json();
 ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});
 let serial=0;const pending=new Map();const exceptions=[];const requests=new Map();const fontNetwork=[];
 ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}else if(m.method==='Runtime.exceptionThrown')exceptions.push(m.params);else if(m.method==='Network.requestWillBeSent')requests.set(m.params.requestId,m.params.request.url);else if(m.method==='Network.loadingFailed' && /fonts\.(googleapis|gstatic)\.com/.test(requests.get(m.params.requestId)||''))fontNetwork.push({url:requests.get(m.params.requestId),error:m.params.errorText});else if(m.method==='Network.responseReceived' && /fonts\.(googleapis|gstatic)\.com/.test(m.params.response.url))fontNetwork.push({url:m.params.response.url,status:m.params.response.status});};
 const cdp=(method,params={})=>new Promise((resolve,reject)=>{const id=++serial;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});
 const evaluate=async expression=>{const r=await cdp('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 await cdp('Page.enable');await cdp('Runtime.enable');await cdp('Network.enable');await cdp('DOM.enable');await cdp('CSS.enable');
 const fontEvidence=[];
 const inspectFonts=async label=>{
  await evaluate('Promise.race([document.fonts.ready,new Promise(r=>setTimeout(r,8000))])');
  const declared=await evaluate(`({status:document.fonts.status,faces:[...document.fonts].map(f=>({family:f.family,weight:f.weight,style:f.style,status:f.status})),computed:{body:getComputedStyle(document.body).fontFamily,identity:getComputedStyle(document.querySelector('.identity-text strong')).fontFamily,metadata:getComputedStyle(document.querySelector('.header-note')).fontFamily}})`);
  const {root}=await cdp('DOM.getDocument');const rendered={};
  for(const [role,selector] of Object.entries({body:'.reply-text',heading:'.identity-text strong',metadata:'.header-note'})){
   const {nodeId}=await cdp('DOM.querySelector',{nodeId:root.nodeId,selector});
   rendered[role]=(await cdp('CSS.getPlatformFontsForNode',{nodeId})).fonts;
  }
  fontEvidence.push({label,...declared,rendered});
 };
 const viewport=async(width,height=780)=>{await cdp('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});await sleep(150);};
 const navigate=async url=>{await cdp('Page.navigate',{url});for(let i=0;i<100;i++){await sleep(50);if(await evaluate('document.readyState === "complete"'))break;}await sleep(200);};
 const scenario=async value=>{await evaluate(`window.postMessage({wireframe:true,action:'scenario',value:${JSON.stringify(value)}},'*')`);await sleep(100);};
 const click=async selector=>{await evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);await sleep(80);};
 const snapshot=()=>evaluate(`(() => {const $=s=>document.querySelector(s),r=$('#active-row'),c=$('#chat-column').getBoundingClientRect(),l=$('#library').getBoundingClientRect();return {active:[...document.querySelectorAll('.active-token')].map(e=>e.dataset.resource),history:[...document.querySelectorAll('.history')].map(e=>[...e.children].map(c=>c.dataset.resource)),draft:$('#draft').value,disabled:$('#send').disabled,open:!$('#library').hidden,mode:$('#library').className,row:{client:r.clientWidth,scroll:r.scrollWidth,tops:[...r.children].map(e=>e.getBoundingClientRect().top)},pageWidth:document.documentElement.scrollWidth,width:innerWidth,chat:{x:c.x,width:c.width,right:c.right},library:{x:l.x,width:l.width},readingTop:$('#reading').scrollTop,focus:document.activeElement.id}})()`);
 const setDraft=async text=>evaluate(`document.querySelector('#draft').value=${JSON.stringify(text)};document.querySelector('#draft').dispatchEvent(new Event('input',{bubbles:true}))`);
 const screenshot=async name=>{const r=await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await fs.writeFile(path.join(dir,name+'.png'),Buffer.from(r.data,'base64'));};
 await viewport(1360);
 await navigate(pathToFileURL(artifact).href+'?surface=1');
 await inspectFonts('desktop 1360px');
 let s=await snapshot();assert.equal(s.active.length,0);assert.equal(s.history.length,0);assert.equal(s.pageWidth,1360);
 assert.equal(await evaluate("document.querySelectorAll('.history:empty').length"),0);
 await screenshot('desktop-zero-closed');report.push('Zero selection: no history band or global scope label.');
 await setDraft('Brouillon inchangé — accents & texte.');await click('#resources-trigger');
 const initial=(await snapshot()).chat;
 for(const id of ['A','B','A','A'])await click(`[data-toggle="${id}"]`);
 s=await snapshot();assert.deepEqual(s.active,['B','A']);assert.equal(s.draft,'Brouillon inchangé — accents & texte.');assert(s.open);assert.deepEqual(s.chat,initial);
 assert.equal(await evaluate("document.querySelector('[data-toggle=\"A\"]').getAttribute('aria-pressed')"),'true');
 await click('[data-remove="B"]');s=await snapshot();assert.deepEqual(s.active,['A']);assert.equal(s.draft,'Brouillon inchangé — accents & texte.');
 await click('#close-library');s=await snapshot();assert.equal(s.focus,'resources-trigger');assert.deepEqual(s.chat,initial);
 report.push('Immediate add/remove 1:1; no duplicate tokens, no Apply/auto-send; draft and chat geometry preserved; close restores focus.');
 await scenario('multiple');s=await snapshot();assert.equal(s.pageWidth,1360);assert(s.mode.includes('side'));assert(s.library.x>=s.chat.right);await screenshot('desktop-multiple-margin-open');
 await scenario('waiting');s=await snapshot();assert.equal(s.pageWidth,1360);assert.deepEqual(s.history,[['A','B']]);assert.deepEqual(s.active,['C','D']);assert(s.disabled);
 await setDraft('Prochain brouillon conservé.');await click('#resources-trigger');await click('[data-toggle="C"]');await click('[data-toggle="E"]');
 s=await snapshot();assert.deepEqual(s.active,['D','E']);assert.deepEqual(s.history,[['A','B']]);assert(s.disabled);
 await click('#close-library');await screenshot('desktop-waiting-different-scope');
 await evaluate("window.postMessage({wireframe:true,action:'resolve',value:'success'},'*')");await sleep(100);
 s=await snapshot();assert.equal(s.draft,'Prochain brouillon conservé.');assert.deepEqual(s.active,['D','E']);assert.deepEqual(s.history,[['A','B']]);assert(!s.disabled);
 assert.equal(await evaluate("document.querySelectorAll('.history button').length"),0);
 report.push('Waiting snapshot A+B vs editable D+E; Send disabled while pending; reply preserves draft/active resources; no historical remove controls.');
 await click('#send');s=await snapshot();assert.deepEqual(s.history,[['A','B'],['D','E']]);assert.deepEqual(s.active,['D','E']);assert.equal(s.draft,'');
 await setDraft('Brouillon pendant erreur.');await evaluate("window.postMessage({wireframe:true,action:'resolve',value:'error'},'*')");await sleep(100);
 s=await snapshot();assert.deepEqual(s.history,[['A','B'],['D','E']]);assert.deepEqual(s.active,['D','E']);assert.equal(s.draft,'Brouillon pendant erreur.');
 report.push('Actual submit snapshots immutable resources; selection persists across sends; simulated error retains historical scope and future draft/selection.');
 // Produce enough transcript for explicit scrolled-up testing, then arrive without scrolling.
 for(let i=0;i<4;i++){await setDraft('Question illustrative '+i);await click('#send');await evaluate("window.postMessage({wireframe:true,action:'resolve',value:'success'},'*')");await sleep(80);}
 await setDraft('Tour en attente pour lecture haute.');await click('#send');await setDraft('Texte de prochain tour.');
 await evaluate("document.querySelector('#reading').scrollTop=80");const scroll=(await snapshot()).readingTop;
 await click('#resources-trigger');await click('[data-toggle="A"]');await click('#close-library');assert.equal((await snapshot()).readingTop,scroll);
 await evaluate("window.postMessage({wireframe:true,action:'resolve',value:'success'},'*')");await sleep(100);assert.equal((await snapshot()).readingTop,scroll);
 await click('#privacy');await click('#close-privacy');assert.equal((await snapshot()).readingTop,scroll);assert.equal((await snapshot()).draft,'Texte de prochain tour.');
 report.push('Scrolled-up transcript stays at scrollTop=80 through library open/selection/close, reply arrival and privacy scaffold.');
 for(const width of [900,390,320]) {
  await viewport(width,width<400?740:780);await scenario('multiple');s=await snapshot();assert.equal(s.pageWidth,width);assert(s.mode.includes('sheet'));
  assert.equal(await evaluate("document.querySelector('.identity').getBoundingClientRect().height>0"),true);const closedGeometry=s.chat;
  await screenshot(width===900?'narrow-desktop-sheet-open':`mobile-${width}-sheet-open`);
  await click('#close-library');assert.deepEqual((await snapshot()).chat,closedGeometry);assert.equal((await snapshot()).focus,'resources-trigger');
  await scenario('overflow');s=await snapshot();assert.deepEqual(s.active,['A','B','C','D','E']);assert.equal(s.pageWidth,width);
  if(width<400){assert(s.row.scroll>s.row.client);assert.equal(new Set(s.row.tops).size,1);assert.equal(await evaluate("new Set([...document.querySelectorAll('.historical-token')].map(e=>e.getBoundingClientRect().top)).size > 1"),true);}
  await screenshot(width===900?'narrow-desktop-overflow-closed':`mobile-${width}-active-overflow`);
  if(width<400){
   await inspectFonts('mobile '+width+'px');
   assert.equal(await evaluate("[...document.querySelectorAll('.remove,.toggle,#resources-trigger,#privacy')].filter(e=>e.getClientRects().length).every(e=>e.getBoundingClientRect().height>=44)"),true);
   await evaluate("document.querySelector('#active-row').focus({preventScroll:true})");
   await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'ArrowRight',code:'ArrowRight',windowsVirtualKeyCode:39});
   await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:'ArrowRight',code:'ArrowRight',windowsVirtualKeyCode:39});
   assert.equal(await evaluate("document.querySelector('#active-row').scrollLeft>0"),true);
   await click('#resources-trigger');await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});await sleep(80);
   assert.equal((await snapshot()).open,false);assert.equal((await snapshot()).focus,'resources-trigger');
   await scenario('waiting');await evaluate("document.querySelector('.guide').open=false");await screenshot(`mobile-${width}-waiting-fixed-scope`);
  }
  report.push(`${width}px: sheet overlay, no chat reflow, focus restoration, no full-page horizontal overflow${width<400?'; single active row overflow, keyboard horizontal scroll, Escape/focus restoration, 44px visible targets and wrapping historical tokens':''}.`);
 }
 await viewport(1440,1200);await navigate(pathToFileURL(artifact).href);await sleep(200);
 assert.equal(await evaluate("document.querySelector('#review-status').textContent.includes('timing : simulation manuelle')"),true);
 for(const width of ['fluid','900','320','390']){
  await click(`[data-width="${width}"]`);
  if(width!=='fluid')assert.equal(await evaluate("document.querySelector('#preview').getBoundingClientRect().width"),Number(width));
 }
 await evaluate("document.querySelector('#scenario').value='waiting';document.querySelector('#scenario').dispatchEvent(new Event('change'))");await sleep(150);
 assert.equal(await evaluate("document.querySelector('#preview').getBoundingClientRect().width"),390);
 assert.equal(await evaluate("document.querySelector('#receive').disabled"),false);
 await screenshot('reviewer-controls-mobile-waiting');
 report.push('Standalone file:// preview loads nested interactive surface; viewport controls and waiting/receive controls work.');
 for (const width of [390,320]) {
  await viewport(width,900);await sleep(150);
  assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'),true);
 }
 report.push('Reviewer wrapper also has no full-page horizontal overflow at 390/320px browser widths.');
 await viewport(1360,780);await navigate(pathToFileURL(artifact).href+'?surface=1');
 await scenario('overflow');const growthGeometry=(await snapshot()).chat;
 await setDraft('Brouillon long illustratif.\n'.repeat(30));
 const growth=await evaluate("({height:document.querySelector('#draft').getBoundingClientRect().height,scrollHeight:document.querySelector('#draft').scrollHeight,composerBottom:document.querySelector('#composer').getBoundingClientRect().bottom,viewport:innerHeight})");
 assert(growth.height<=180);assert(growth.scrollHeight>growth.height);assert(growth.composerBottom<=growth.viewport);assert.deepEqual((await snapshot()).chat,growthGeometry);
 await evaluate("document.querySelector('.guide').open=false");assert.equal(await evaluate("document.querySelector('.guide').open"),false);
 await click('#resources-trigger');await click('#privacy');assert.equal(await evaluate("document.querySelector('#privacy-dialog').open"),true);await click('#close-privacy');await click('#close-library');
 report.push('Bounded long-draft growth with internal overflow; composer remains in viewport; optional guide collapse and privacy access tested. No physical keyboard claims.');
 assert.equal(await evaluate("document.querySelector('#active-row').getBoundingClientRect().bottom <= document.querySelector('#draft').getBoundingClientRect().top"),true);
 const styleAudit=await evaluate("({paper:getComputedStyle(document.body).backgroundColor,ink:getComputedStyle(document.querySelector('.identity-text strong')).color,send:getComputedStyle(document.querySelector('#send')).backgroundColor,answer:getComputedStyle(document.querySelector('.answer')).backgroundColor,activeCount:document.querySelectorAll('.active-token').length,uploadInputs:document.querySelectorAll('input[type=file]').length,historyBeforeReply:[...document.querySelectorAll('.answer')].every(e=>!e.querySelector('.history')||e.firstElementChild.classList.contains('history')),identityVisible:document.querySelector('.identity').getBoundingClientRect().height>0})");
 assert.equal(styleAudit.paper,'rgb(243, 240, 232)');assert.equal(styleAudit.send,'rgb(29, 91, 68)');assert.equal(styleAudit.answer,'rgb(237, 243, 238)');assert.equal(styleAudit.uploadInputs,0);assert(styleAudit.historyBeforeReply);assert(styleAudit.identityVisible);
 report.push('Core v2 paper/green/answer colors verified; historical tokens precede reply; no file input; identity visible.');
 await fs.writeFile(path.join(dir,'font-results.json'),JSON.stringify({fontEvidence,fontNetwork},null,2)+'\n');
 report.push('Font evidence saved separately: CSS declarations, FontFace status, actual platform font usage and inherited stylesheet network results.');
 assert.equal(exceptions.length,0);report.push('No uncaught JavaScript exceptions during checks.');
 await fs.writeFile(path.join(dir,'browser-results.json'),JSON.stringify({tool:'Cached Chromium 1223 via Node native CDP/WebSocket, headless only',checks:report,limitations:['No physical touch/virtual keyboard or screen-reader testing.','No backend, runtime recovery, real evidence retrieval or persistence tested.','Inherited remote font delivery depends on environment; font-results.json distinguishes declarations from actual rendering.']},null,2)+'\n');
 console.log(report.join('\n'));
} finally {ws?.close();browser.kill('SIGTERM');await sleep(500);await fs.rm(profile,{recursive:true,force:true,maxRetries:5,retryDelay:200});}
