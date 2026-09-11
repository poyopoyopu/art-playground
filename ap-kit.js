/* ===========================================================================
   ap-kit.js — Art Playground shared kit
   One implementation of the parts every piece needs, so they cannot drift:
     · clock (v27 spec: centred, seconds held back, tabular figures, second-
       boundary resync, screen wake lock, controls fade while it is running)
     · fullscreen, with the iPhone Safari fallback (no Fullscreen API there)
     · GIF export: 3 seconds, seamless, at frame rates GIF can actually hold

   A piece opts into GIF export by supplying loopFrame(phase). phase runs
   0 → 2π across the loop; render the same image at 0 and at 2π and the loop
   closes. Use APKit.T(k, phase) for anything that would otherwise be time*k.
   =========================================================================== */
(function(){
"use strict";

const TAU=Math.PI*2;
let opts=null, clockOn=false, wakeLock=null, toastTimer=null, idleTimer=null,
    exporting=false, workerURL=null, ctrlEl=null, clockEl=null, clockT=null,
    clockD=null, toastEl=null, sheetEl=null, sheetTitle=null, sheetMsg=null,
    barWrap=null, barFill=null, acts=null;

const CSS=`
.apk-ctrl{position:fixed;z-index:60;right:4vw;bottom:max(3.4vh,env(safe-area-inset-bottom));
 display:flex;gap:8px;transition:opacity .7s,transform .7s}
.apk-ctrl.apk-idle{opacity:0;transform:translateY(10px);pointer-events:none}
/* capsule dock: one floating bar instead of loose circles, centred so it reads
   as a tool that appeared rather than furniture that was always there */
.apk-ctrl.apk-dock{right:auto;left:50%;transform:translateX(-50%);gap:2px;padding:6px;
 border-radius:30px;background:rgba(8,8,14,.5);border:1px solid rgba(255,255,255,.14);
 backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);box-shadow:0 6px 30px #0009}
.apk-ctrl.apk-dock.apk-idle{transform:translateX(-50%) translateY(10px)}
.apk-ctrl.apk-dock .apk-btn{border:none;background:transparent;box-shadow:none;backdrop-filter:none;
 width:46px;height:46px}
.apk-ctrl.apk-dock .apk-btn.apk-on{background:rgba(255,255,255,.92);color:#07070e}
.apk-btn{width:42px;height:42px;border-radius:50%;border:1px solid #ffffff24;background:#07070ecc;
 color:#fff;font-size:15px;line-height:1;box-shadow:0 4px 18px #0009;backdrop-filter:blur(10px);
 padding:0;font-family:inherit}
.apk-btn:active{transform:scale(.92)}
.apk-btn.apk-on{background:#fff;color:#07070e;border-color:#fff}
.apk-btn:disabled{opacity:.35}
.apk-clock.apk-top{top:calc(env(safe-area-inset-top) + 20px);transform:translate(-50%,0)}
.apk-clock.apk-top .apk-t{font-size:clamp(30px,8.5vw,58px)}
.apk-clock.apk-top .apk-d{font-size:clamp(10px,2.7vw,14px);letter-spacing:.26em}
.apk-clock{position:fixed;z-index:55;left:50%;top:50%;transform:translate(-50%,-50%);display:none;
 flex-direction:column;align-items:center;gap:6px;pointer-events:none;
 font-family:ui-monospace,"SF Mono",SFMono-Regular,Menlo,Consolas,monospace;
 font-variant-numeric:tabular-nums;font-feature-settings:"tnum" 1;
 user-select:none;-webkit-user-select:none;color:#fff}
.apk-clock.apk-on{display:flex}
.apk-clock .apk-t{font-size:clamp(44px,16.5vw,132px);line-height:1;font-weight:600;letter-spacing:.01em;
 text-shadow:0 0 3px rgba(0,0,0,.95),0 0 14px rgba(0,0,0,.9),0 4px 34px rgba(0,0,0,.85)}
.apk-clock .apk-t i{font-style:normal;opacity:.62}
.apk-clock .apk-d{font-size:clamp(11px,3.3vw,17px);letter-spacing:.3em;opacity:.62;
 text-shadow:0 0 3px rgba(0,0,0,.95),0 2px 16px rgba(0,0,0,.9)}
.apk-toast{position:fixed;z-index:70;left:50%;bottom:calc(max(3.4vh,env(safe-area-inset-bottom)) + 54px);
 transform:translateX(-50%);max-width:78vw;padding:11px 18px;border-radius:14px;background:#0a0a16e6;
 border:1px solid #ffffff1f;backdrop-filter:blur(10px);color:#fff;font-size:12px;line-height:1.6;
 text-align:center;opacity:0;transition:opacity .35s;pointer-events:none;
 font-family:system-ui,-apple-system,sans-serif}
.apk-toast.apk-on{opacity:1}
.apk-sheet{position:fixed;z-index:80;inset:0;display:none;align-items:center;justify-content:center;
 background:#000c;backdrop-filter:blur(18px);font-family:system-ui,-apple-system,sans-serif}
.apk-sheet.apk-on{display:flex}
.apk-card{width:min(88vw,360px);padding:22px;border:1px solid #ffffff20;border-radius:20px;
 background:#080812f2;text-align:center;color:#fff;box-shadow:0 20px 80px #000}
.apk-card h2{margin:0 0 8px;font-size:12px;letter-spacing:.24em;font-weight:600}
.apk-card p{margin:0;font-size:11.5px;line-height:1.75;opacity:.62}
.apk-card img{max-width:100%;max-height:42vh;margin-top:14px;border-radius:12px;border:1px solid #ffffff1a}
.apk-bar{height:3px;margin:16px 0;background:#ffffff14;border-radius:4px;overflow:hidden}
.apk-bar i{display:block;height:100%;width:0;background:linear-gradient(90deg,#7ad9ff,#ff7ad9);
 transition:width .12s}
.apk-acts{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-top:14px}
.apk-acts button,.apk-acts a{padding:9px 17px;border:1px solid #ffffff25;border-radius:20px;
 background:none;color:#fff;font-size:10.5px;letter-spacing:.14em;text-decoration:none;font-family:inherit}
`;

function el(tag,cls,html){const n=document.createElement(tag);if(cls)n.className=cls;
 if(html!==undefined)n.innerHTML=html;return n}

function build(){
  document.head.appendChild(el('style',null,CSS));

  clockEl=el('div','apk-clock');
  clockT=el('div','apk-t','00:00<i>:00</i>');
  clockD=el('div','apk-d');
  clockEl.appendChild(clockT);clockEl.appendChild(clockD);
  document.body.appendChild(clockEl);

  toastEl=el('div','apk-toast');
  document.body.appendChild(toastEl);

  sheetEl=el('div','apk-sheet');
  const card=el('div','apk-card');
  sheetTitle=el('h2',null,'EXPORT LOOP');
  sheetMsg=el('p',null,'');
  barWrap=el('div','apk-bar');barFill=el('i');barWrap.appendChild(barFill);
  acts=el('div','apk-acts');
  card.appendChild(sheetTitle);card.appendChild(sheetMsg);card.appendChild(barWrap);card.appendChild(acts);
  sheetEl.appendChild(card);
  document.body.appendChild(sheetEl);

  if(opts.clockPos==='top')clockEl.classList.add('apk-top');
  ctrlEl=el('div','apk-ctrl'+(opts.dock?' apk-dock':''));
  (opts.buttons||[]).forEach(b=>{
    const n=el('button','apk-btn',b.label);
    n.setAttribute('aria-label',b.name||'button');
    n.onclick=()=>{b.onClick&&b.onClick(n);if(b.toggle)n.classList.toggle('apk-on');bumpIdle()};
    ctrlEl.appendChild(n);
  });
  if(opts.loopFrame){
    const g=el('button','apk-btn','◉');g.setAttribute('aria-label','export gif');
    g.onclick=()=>exportGif(g);ctrlEl.appendChild(g);
  }
  const ck=el('button','apk-btn','🕐');ck.setAttribute('aria-label','clock');
  ck.onclick=()=>{
    clockOn=!clockOn;
    clockEl.classList.toggle('apk-on',clockOn);
    ck.classList.toggle('apk-on',clockOn);
    if(clockOn){tick();requestWake()}else{releaseWake();showCtrl()}
    bumpIdle();
  };
  ctrlEl.appendChild(ck);
  // No fullscreen button when the piece asks for none: the browser, OS and
  // home-screen web app already have their own, and a second one gets in the way.
  if(opts.fullscreenButton!==false){
    const fs=el('button','apk-btn','⛶');fs.setAttribute('aria-label','fullscreen');
    fs.onclick=toggleFullscreen;ctrlEl.appendChild(fs);
  }
  document.body.appendChild(ctrlEl);
  if(opts.autoHide)bumpIdle();

  addEventListener('pointerdown',bumpIdle,{passive:true});
}

// ---------- clock ----------
const WEEK_JA=['日','月','火','水','木','金','土'];
const WEEK_EN=['SUN','MON','TUE','WED','THU','FRI','SAT'];
const pad=n=>String(n).padStart(2,'0');
function tick(){
  if(!clockOn)return;
  const d=new Date();
  clockT.innerHTML=pad(d.getHours())+':'+pad(d.getMinutes())+'<i>:'+pad(d.getSeconds())+'</i>';
  // 'spec' is the house format: YYYY MM DD DDD, month as a number, never "SEP 11"
  clockD.textContent = (opts.clockFormat==='spec')
    ? d.getFullYear()+' '+pad(d.getMonth()+1)+' '+pad(d.getDate())+' '+WEEK_EN[d.getDay()]
    : (d.getMonth()+1)+'月'+d.getDate()+'日 ('+WEEK_JA[d.getDay()]+')';
}
// re-sync to the second boundary each tick so the display never drifts
function schedule(){tick();setTimeout(schedule,1000-(Date.now()%1000)+8)}

async function requestWake(){
  try{if('wakeLock' in navigator)wakeLock=await navigator.wakeLock.request('screen')}catch(_){}
}
function releaseWake(){try{wakeLock&&wakeLock.release()}catch(_){}wakeLock=null}

function showCtrl(){ctrlEl&&ctrlEl.classList.remove('apk-idle')}
function bumpIdle(){
  showCtrl();clearTimeout(idleTimer);
  // while viewing there should be only the artwork (and the clock, if on)
  if(clockOn||opts.autoHide)idleTimer=setTimeout(()=>ctrlEl.classList.add('apk-idle'),3500);
}

function toast(msg,ms){
  if(!toastEl)return;
  clearTimeout(toastTimer);
  toastEl.textContent=msg;toastEl.classList.add('apk-on');
  toastTimer=setTimeout(()=>toastEl.classList.remove('apk-on'),ms||3600);
}

// ---------- fullscreen ----------
function fsEl(){return document.fullscreenElement||document.webkitFullscreenElement}
async function toggleFullscreen(){
  const d=document.documentElement;
  // iPhone Safari has no Fullscreen API at all — the standalone home-screen app
  // is the only way to lose the browser chrome, so say that instead of failing
  if(!(d.requestFullscreen||d.webkitRequestFullscreen)){
    if(window.navigator.standalone)toast('すでにフルスクリーンで動いています');
    else toast('iPhoneのSafariは全画面表示に対応していません。共有ボタン → 「ホーム画面に追加」で開くと、フチなしの全画面で使えます',7000);
    return;
  }
  try{
    if(fsEl())(document.exitFullscreen||document.webkitExitFullscreen).call(document);
    else await (d.requestFullscreen||d.webkitRequestFullscreen).call(d);
  }catch(_){toast('全画面表示に切り替えられませんでした')}
}

// ---------- GIF ----------
/* GIF holds frame delays in whole multiples of 10ms. 30fps becomes 33.3ms,
   is stored as 30ms and plays 10% fast — these three are honest. */
const PRESETS=[
  {name:'SMOOTH',fps:25,delay:40,side:420},
  {name:'BALANCED',fps:20,delay:50,side:460},
  {name:'LIGHT',fps:12.5,delay:80,side:480}
];
const GIF_JS='https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.js';
const GIF_WORKER='https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.worker.js';

function loadScript(src){return new Promise((ok,no)=>{
  const s=document.createElement('script');s.src=src;s.onload=()=>ok();s.onerror=()=>no(Error('load'));
  document.head.appendChild(s)})}
async function prep(){
  if(!window.GIF)await loadScript(GIF_JS);
  if(!workerURL){
    const r=await fetch(GIF_WORKER);
    if(!r.ok)throw Error('worker');
    workerURL=URL.createObjectURL(await r.blob());
  }
}
function addAct(label,fn){const b=el('button',null,label);b.onclick=fn;acts.appendChild(b);return b}
function askPreset(){return new Promise(res=>{
  sheetEl.classList.add('apk-on');
  sheetTitle.textContent='EXPORT LOOP';
  sheetMsg.textContent='なめらかさを選んでください';
  barWrap.style.display='none';acts.innerHTML='';
  PRESETS.forEach(p=>addAct(p.name+' · '+p.fps+'fps',()=>{barWrap.style.display='';res(p)}));
  addAct('キャンセル',()=>{barWrap.style.display='';res(null)});
})}

async function exportGif(btn){
  if(exporting)return;
  const preset=await askPreset();
  if(!preset){sheetEl.classList.remove('apk-on');return}
  exporting=true;btn.disabled=true;
  sheetTitle.textContent='RENDERING LOOP';
  sheetMsg.textContent='3秒のシームレスループを描き出しています…';
  barFill.style.width='0%';acts.innerHTML='';
  try{
    await prep();
    const src=opts.canvas;
    const side=Math.min(preset.side,Math.round(Math.min(innerWidth,innerHeight)));
    const FRAMES=Math.round(LOOP_DUR*preset.fps);
    const out=document.createElement('canvas');out.width=out.height=side;
    const og=out.getContext('2d',{alpha:false});
    const gif=new GIF({workers:2,quality:10,dither:false,width:side,height:side,
      workerScript:workerURL,repeat:0});

    // anything with trails or feedback carries history, so run the loop through
    // once before recording; by then each frame matches the same frame last time
    const PRE=opts.preroll===false?0:FRAMES;
    for(let i=0;i<PRE;i++){
      opts.loopFrame((i%FRAMES)/FRAMES*TAU);
      if(i%6===0){barFill.style.width=(i/PRE*24)+'%';await new Promise(r=>setTimeout(r,0))}
    }
    for(let i=0;i<FRAMES;i++){
      opts.loopFrame(i/FRAMES*TAU);
      const crop=Math.min(src.width,src.height);
      og.drawImage(src,(src.width-crop)/2,(src.height-crop)/2,crop,crop,0,0,side,side);
      gif.addFrame(og,{copy:true,delay:preset.delay});
      barFill.style.width=(24+i/FRAMES*26)+'%';
      await new Promise(r=>setTimeout(r,0));
    }
    sheetMsg.textContent='GIFにエンコード中…';
    const blob=await new Promise((ok,no)=>{
      gif.on('progress',p=>barFill.style.width=(50+p*50)+'%');
      gif.on('finished',ok);
      gif.on('abort',()=>no(Error('abort')));
      gif.render();
    });
    const url=URL.createObjectURL(blob),mb=(blob.size/1048576).toFixed(1);
    const overWeb=blob.size>15*1048576,overApp=blob.size>5*1048576;
    sheetTitle.textContent='LOOP READY';
    sheetMsg.textContent=side+'×'+side+' · '+preset.fps+'fps · '+FRAMES+'コマ · '+mb+'MB'
      +(overWeb?' — Xの上限15MB超え。LIGHTで撮り直しを'
       :overApp?' — 5MB超えなのでSafariのx.comから投稿を'
       :' — Xアプリからそのまま投稿できます');
    barFill.style.width='100%';
    const img=new Image();img.src=url;
    sheetEl.querySelector('.apk-card').insertBefore(img,barWrap);
    acts.innerHTML='';

    /* Hand the GIF straight to the system share sheet, so it reaches Photos or
       the X app as a real .gif file. Saving by long-pressing the preview can
       flatten it to a still frame; this passes the file itself.
       navigator.share must run inside the tap, so the File is built up front
       and the call is the first thing the handler does. */
    const file=new File([blob],(opts.gifName||'loop')+'.gif',{type:'image/gif'});
    const canShare = navigator.canShare && navigator.share && navigator.canShare({files:[file]});
    if(canShare){
      addAct('共有 / 写真に保存',async()=>{
        try{ await navigator.share({files:[file]}); }
        catch(err){ if(err && err.name!=='AbortError')toast('共有できませんでした'); }
      });
    }
    const a=el('a',null,canShare?'ファイルに保存':'ダウンロード');
    a.href=url;a.download=(opts.gifName||'loop')+'.gif';
    acts.appendChild(a);
    addAct('閉じる',()=>{img.remove();URL.revokeObjectURL(url);sheetEl.classList.remove('apk-on')});
    if(!canShare&&/iPhone|iPad/.test(navigator.userAgent))
      sheetMsg.textContent+='（このブラウザは共有に非対応です。ダウンロードしてファイルAppから投稿してください）';
  }catch(e){
    console.error(e);
    sheetTitle.textContent='EXPORT FAILED';
    sheetMsg.textContent='GIFの書き出しに失敗しました。通信環境を確認して、もう一度お試しください。';
    acts.innerHTML='';addAct('閉じる',()=>sheetEl.classList.remove('apk-on'));
  }finally{
    exporting=false;btn.disabled=false;
    opts.onExportEnd&&opts.onExportEnd();
  }
}

const LOOP_DUR=3.0;

/* Turn "time * k" into something that closes over the loop. Live, pass phase
   as null and it is just time*k. In a loop, k is rounded to a whole number of
   cycles — with a floor of one, because these pieces have cycles far longer
   than three seconds and every one of them would otherwise round to zero and
   freeze the GIF into a still image. */
function T(k,phase,time){
  if(phase===null||phase===undefined)return time*k;
  const cycles=Math.max(1,Math.round(k*LOOP_DUR/TAU));
  return cycles*phase;
}

/* Whether a screen point belongs to the kit's own UI — the dock, the export
   sheet, or a toast. Pieces that swallow touches (p5 returns false to
   preventDefault) must ask this first, or they kill the taps meant for these
   controls. Checking only the dock was not enough: the export sheet is a
   separate layer. */
function isUI(x,y){
  const el=document.elementFromPoint(x,y);
  return !!(el && el.closest && el.closest('.apk-ctrl,.apk-sheet,.apk-toast'));
}

window.APKit={
  isUI:isUI,
  init(o){
    opts=o||{};
    if(document.readyState==='loading')
      document.addEventListener('DOMContentLoaded',()=>{build();schedule()});
    else{build();schedule()}
    return window.APKit;
  },
  T:T,
  LOOP_DUR:LOOP_DUR,
  toast:toast,
  isExporting(){return exporting},
  isClockOn(){return clockOn}
};
})();
