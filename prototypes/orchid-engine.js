/* orchid-engine.js — 黒い蘭の描画エンジン(Claude作)
   おっちゃん提供の黒蘭の写真から起こした花の幾何と描画だけを持つ共有部品。
   「世界のルール」は持たない。法則は各作品(orchid-a/b/c)の側で実装する。

   ap-kit.js とは無関係。編集する場合は、これを読んでいる3作品すべてを確認すること。
   - prototypes/orchid-a-bleed.html
   - prototypes/orchid-b-descent.html
   - prototypes/orchid-c-gaze.html
*/
(function(){
'use strict';

/* ---------- 乱数 ---------- */
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);
  t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function gauss(r){let u=0,v=0;while(!u)u=r();while(!v)v=r();
  return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)}

/* ---------- 遺伝子(花の形質) ---------- */
const FIELDS={
  len:[0.60,1.55], wid:[0.45,1.70], curl:[-1.00,1.00], twist:[-0.80,0.80],
  fringe:[0.02,0.95], depth:[2.40,5.40], hue:[200,420], sat:[0.15,1.00],
  lum:[0.03,0.20], sheen:[0.15,1.00], ray:[12,70], tail:[0.15,1.70],
  lipR:[0.50,1.50], seed:[0,9999]
};
const KEYS=Object.keys(FIELDS);
const WILD={len:1.00,wid:1.00,curl:0.45,twist:0.10,fringe:0.55,depth:4.60,
  hue:288,sat:0.95,lum:0.070,sheen:0.75,ray:44,tail:1.15,lipR:1.00,seed:1234};

function clone(g){const o={};for(const k of KEYS)o[k]=g[k];return o}
function clamp(k,v){const f=FIELDS[k];return v<f[0]?f[0]:v>f[1]?f[1]:v}
function mutate(g,s,r){const o={};
  for(const k of KEYS){const f=FIELDS[k];
    o[k]=clamp(k,g[k]+gauss(r)*(f[1]-f[0])*s*(k==='seed'?3.0:0.5))}
  return o}
function randomGene(r){const o={};
  for(const k of KEYS){const f=FIELDS[k];o[k]=f[0]+r()*(f[1]-f[0])}
  o.lum=0.03+r()*r()*0.14;o.fringe=0.15+r()*0.7;return o}
function lerpG(a,b,t){const o={};for(const k of KEYS)o[k]=a[k]+(b[k]-a[k])*t;return o}

/* ---------- 器官 ---------- */
const ROLE=[
  {a:-90 ,L:1.02,W:0.30,ck: 2.60,kind:'sepal'}, /* 背萼片(上・鉤状) */
  {a:-156,L:1.00,W:0.54,ck: 1.05,kind:'wing' }, /* 側萼片 左 */
  {a:-24 ,L:1.00,W:0.54,ck:-1.05,kind:'wing' }, /* 側萼片 右 */
  {a: 146,L:1.32,W:0.23,ck:-1.60,kind:'petal'}, /* 側花弁 左 */
  {a: 34 ,L:1.32,W:0.23,ck: 1.60,kind:'petal'}, /* 側花弁 右 */
  {a: 90 ,L:0.00,W:0.00,ck: 0.00,kind:'lip'  }  /* 唇弁 */
];
const N=6, ORDER=[1,2,0,3,4,5];

/* ---------- 自己相似フリンジ(鋸歯の中の鋸歯) ---------- */
function fringePath(pts,depth,amp,seed,close){
  const df=Math.floor(depth),fr=depth-df;
  let a=pts;
  for(let d=0;d<df+1;d++){
    const k=amp*Math.pow(0.58,d)*(d===df?fr:1);
    if(k<0.001)break;
    const b=[],n=a.length,last=close?n:n-1;
    for(let i=0;i<last;i++){
      const p=a[i],q=a[(i+1)%n];b.push(p);
      const dx=q[0]-p[0],dy=q[1]-p[1],L=Math.hypot(dx,dy);
      if(L<0.7)continue;
      const s=Math.sin(i*12.9898+d*78.233+seed)*43758.5453,j=0.62+(s-Math.floor(s))*0.9;
      b.push([(p[0]+q[0])/2-dy/L*L*k*j,(p[1]+q[1])/2+dx/L*L*k*j]);
    }
    if(!close)b.push(a[n-1]);
    a=b;
  }
  return a;
}
function toPath(pts){const p=new Path2D();p.moveTo(pts[0][0],pts[0][1]);
  for(let i=1;i<pts.length;i++)p.lineTo(pts[i][0],pts[i][1]);p.closePath();return p}

function petalOutline(g,ro,R){
  const L=R*0.92*ro.L*g.len,steps=26,mid=[],nor=[];
  let x=0,y=0;
  for(let i=0;i<=steps;i++){
    const t=i/steps;mid.push([x,y]);
    const ang=g.curl*ro.ck*t*0.95+g.twist*Math.sin(t*Math.PI)*0.5;
    nor.push([-Math.sin(ang),Math.cos(ang)]);
    x+=Math.cos(ang)*(L/steps);y+=Math.sin(ang)*(L/steps);
  }
  const Wm=L*ro.W*g.wid,up=[],dn=[];
  for(let i=0;i<=steps;i++){
    const t=i/steps,w=Wm*Math.pow(Math.sin(Math.PI*Math.pow(t,0.62)),0.75)*(1-0.25*t);
    const p=mid[i],nv=nor[i];
    up.push([p[0]+nv[0]*w,p[1]+nv[1]*w]);
    dn.push([p[0]-nv[0]*w,p[1]-nv[1]*w]);
  }
  return {out:fringePath(up.concat(dn.reverse()),g.depth,g.fringe*0.30,g.seed,true),
          mid:mid,L:L,Wm:Wm};
}
function lipGeo(g,R){
  const rad=R*0.30*g.lipR,steps=64,ring=[];
  for(let i=0;i<steps;i++){const a=i/steps*Math.PI*2,rr=rad*(1+0.06*Math.sin(a*5+g.seed*0.01));
    ring.push([Math.cos(a)*rr,Math.sin(a)*rr*1.08])}
  const disc=toPath(fringePath(ring,g.depth+0.4,g.fringe*0.34,g.seed+7,true));
  const tl=rad*2.1*g.tail,tw=rad*0.30,tail=[],sg=16;
  for(let i=0;i<=sg;i++){const t=i/sg;tail.push([ tw*(1-t)*Math.sqrt(1-t*0.3),rad*0.8+tl*t])}
  for(let i=sg;i>=0;i--){const t=i/sg;tail.push([-tw*(1-t)*Math.sqrt(1-t*0.3),rad*0.8+tl*t])}
  return {disc:disc,tail:toPath(fringePath(tail,g.depth,g.fringe*0.42,g.seed+13,true)),rad:rad};
}

function buildGeo(genes,R){
  const o=[];
  for(let i=0;i<N;i++){
    const g=genes[i],ro=ROLE[i];
    if(ro.kind==='lip'){o.push({g:g,ro:ro,lip:lipGeo(g,R),hit:[0,R*0.20]});continue}
    const pg=petalOutline(g,ro,R),th=ro.a*Math.PI/180;
    const cs=Math.cos(th),sn=Math.sin(th),hm=pg.mid[Math.floor(pg.mid.length*0.55)];
    o.push({g:g,ro:ro,path:toPath(pg.out),L:pg.L,Wm:pg.Wm,th:th,
      hit:[hm[0]*cs-hm[1]*sn,hm[0]*sn+hm[1]*cs]});
  }
  o.R=R;return o;
}

/* ---------- 色 ---------- */
function col(p,l,a){
  const h=((p.hue%360)+360)%360;
  return 'hsla('+h.toFixed(1)+','+(p.sat*100).toFixed(0)+'%,'+
    (Math.max(0,Math.min(100,l*100))).toFixed(1)+'%,'+a+')';
}

/* ---------- 描画 ----------
   o = {cx,cy,bp,alpha,scale,lipOff,orient(i,ro,bp),paint(i,g)}
   orient: {ang,scale,dx,dy} を返すと器官の姿勢を上書きできる
   paint : {hue,sat,lum,sheen,alpha} を返すと色を上書きできる
*/
function defPaint(g){return {hue:g.hue,sat:g.sat,lum:g.lum,sheen:g.sheen,alpha:1}}

function drawPetal(ctx,o,go,i,opt,S,bp,A){
  const g=go.g,p=opt.paint?opt.paint(i,g):defPaint(g);
  const al=A*(p.alpha==null?1:p.alpha);
  if(al<=0.004)return;
  const or=opt.orient?opt.orient(i,go.ro,bp):null;
  ctx.save();
  ctx.translate(opt.cx+(or&&or.dx||0)*S,opt.cy+(or&&or.dy||0)*S);
  ctx.rotate(or&&or.ang!=null?or.ang:go.th+Math.sin(bp+i*1.17)*0.014);
  const br=S*(or&&or.scale!=null?or.scale:1)*(1+Math.sin(bp+i*0.7)*0.012);
  ctx.scale(br,br);
  const gr=ctx.createLinearGradient(0,0,go.L,0);
  gr.addColorStop(0   ,col(p,p.lum*0.55,al));
  gr.addColorStop(0.32,col(p,p.lum*1.75,al));
  gr.addColorStop(0.72,col(p,p.lum*0.90,al));
  gr.addColorStop(1   ,col(p,p.lum*0.35,al));
  ctx.fillStyle=gr;ctx.fill(go.path);
  ctx.save();ctx.clip(go.path);
  const sa=p.sheen*0.30*al,sh=ctx.createLinearGradient(0,-go.Wm*0.55,0,go.Wm*0.55);
  sh.addColorStop(0,'rgba(255,255,255,0)');
  sh.addColorStop(0.42,col(p,0.72,sa));
  sh.addColorStop(0.50,'rgba(255,255,255,'+(sa*0.55).toFixed(3)+')');
  sh.addColorStop(0.60,col(p,0.55,sa*0.7));
  sh.addColorStop(1,'rgba(255,255,255,0)');
  ctx.fillStyle=sh;ctx.fillRect(0,-go.Wm*1.2,go.L*1.05,go.Wm*2.4);
  ctx.restore();
  ctx.lineWidth=Math.max(0.8,go.L*0.006);
  ctx.strokeStyle=col(p,0.52,0.20*p.sheen*al);
  ctx.stroke(go.path);
  ctx.restore();
}

function drawLip(ctx,o,go,i,opt,S,bp,A){
  const g=go.g,lp=go.lip,p=opt.paint?opt.paint(i,g):defPaint(g);
  const al=A*(p.alpha==null?1:p.alpha);
  if(al<=0.004)return;
  const or=opt.orient?opt.orient(i,go.ro,bp):null;
  const off=(opt.lipOff==null?0.06:opt.lipOff)*o.R;
  ctx.save();
  ctx.translate(opt.cx+(or&&or.dx||0)*S,opt.cy+off*S+(or&&or.dy||0)*S);
  if(or&&or.ang!=null)ctx.rotate(or.ang-Math.PI/2);
  const br=S*(or&&or.scale!=null?or.scale:1)*(1+Math.sin(bp+2.2)*0.016);
  ctx.scale(br,br);
  const tg=ctx.createLinearGradient(0,0,0,lp.rad*3.2);
  tg.addColorStop(0,col(p,p.lum*2.2,al));
  tg.addColorStop(0.35,col(p,p.lum*1.1,al));
  tg.addColorStop(1,col(p,p.lum*0.35,al));
  ctx.fillStyle=tg;ctx.fill(lp.tail);
  const k=0.4+p.sat*0.6;
  const dg=ctx.createRadialGradient(0,0,lp.rad*0.04,0,0,lp.rad*1.05);
  dg.addColorStop(0   ,col(p,0.04,al));
  dg.addColorStop(0.30,col(p,0.30*k,al));
  dg.addColorStop(0.62,col(p,0.40*k,al));
  dg.addColorStop(0.88,col(p,p.lum*1.3,al));
  dg.addColorStop(1   ,col(p,p.lum*0.5,al));
  ctx.fillStyle=dg;ctx.fill(lp.disc);
  ctx.save();ctx.clip(lp.disc);
  const n=Math.round(g.ray);
  ctx.lineWidth=Math.max(0.6,lp.rad*0.012);
  for(let j=0;j<n;j++){
    const a=j/n*Math.PI*2;
    ctx.strokeStyle=(j%2)?col(p,0.03,0.45*al):col(p,0.62,0.13*al);
    ctx.beginPath();ctx.moveTo(Math.cos(a)*lp.rad*0.10,Math.sin(a)*lp.rad*0.10);
    ctx.lineTo(Math.cos(a)*lp.rad*1.25,Math.sin(a)*lp.rad*1.30);ctx.stroke();
  }
  ctx.restore();
  const cg=ctx.createRadialGradient(0,-lp.rad*0.12,0,0,-lp.rad*0.12,lp.rad*0.30);
  cg.addColorStop(0,'rgba(255,255,255,'+(0.40*p.sheen*al).toFixed(3)+')');
  cg.addColorStop(1,'rgba(255,255,255,0)');
  ctx.fillStyle=cg;ctx.beginPath();ctx.arc(0,-lp.rad*0.12,lp.rad*0.32,0,7);ctx.fill();
  ctx.lineWidth=Math.max(0.7,lp.rad*0.010);
  ctx.strokeStyle=col(p,0.58,0.22*p.sheen*al);ctx.stroke(lp.disc);
  ctx.restore();
}

function drawFlower(ctx,geo,opt){
  const S=opt.scale==null?1:opt.scale,bp=opt.bp||0,A=opt.alpha==null?1:opt.alpha;
  if(A<=0.004||S<=0.0008)return;
  for(const i of ORDER){
    const go=geo[i];
    if(go.ro.kind==='lip')drawLip(ctx,geo,go,i,opt,S,bp,A);
    else drawPetal(ctx,geo,go,i,opt,S,bp,A);
  }
}

/* ---------- 背景(暗い葉のボケ) ---------- */
function makeBG(W,H,seed,tint){
  const b=document.createElement('canvas');b.width=W;b.height=H;
  const x=b.getContext('2d'),r=mulberry32(seed);
  x.fillStyle='#05070a';x.fillRect(0,0,W,H);
  for(let i=0;i<26;i++){
    const px=r()*W,py=r()*H,rr=(0.10+r()*0.30)*Math.max(W,H);
    const g=x.createRadialGradient(px,py,0,px,py,rr);
    const h=(tint==null?68:tint)+r()*46,l=4+r()*9;
    g.addColorStop(0,'hsla('+h+',34%,'+l+'%,0.55)');
    g.addColorStop(1,'hsla('+h+',34%,'+l+'%,0)');
    x.fillStyle=g;x.beginPath();x.arc(px,py,rr,0,7);x.fill();
  }
  const v=x.createRadialGradient(W/2,H*0.45,Math.min(W,H)*0.12,W/2,H*0.45,Math.max(W,H)*0.72);
  v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,0.88)');
  x.fillStyle=v;x.fillRect(0,0,W,H);
  return b;
}

/* ---------- 器官の当たり判定 ---------- */
function pick(geo,x,y,cx,cy,R,scale){
  const S=scale||1;let best=-1,bd=1e9;
  for(let i=0;i<N;i++){
    const o=geo[i],px=cx+o.hit[0]*S,py=cy+o.hit[1]*S;
    const d=Math.hypot(x-px,y-py);
    if(d<bd){bd=d;best=i}
  }
  return bd<R*0.62*S?best:-1;
}

/* ---------- 小物 ---------- */
function label(ctx,W,H,R,txt,right,alpha){
  ctx.save();
  ctx.font=(Math.max(10,R*0.045)|0)+'px ui-monospace,Menlo,monospace';
  ctx.fillStyle='rgba(200,190,215,'+(alpha==null?0.38:alpha)+')';
  ctx.textBaseline='bottom';
  const pad=Math.max(14,R*0.07);
  if(right){ctx.textAlign='right';ctx.fillText(txt,W-pad,H-pad)}
  else ctx.fillText(txt,pad,H-pad);
  ctx.restore();
}

window.Orchid={FIELDS:FIELDS,KEYS:KEYS,WILD:WILD,ROLE:ROLE,N:N,ORDER:ORDER,
  mulberry32:mulberry32,gauss:gauss,clone:clone,mutate:mutate,randomGene:randomGene,
  lerpG:lerpG,buildGeo:buildGeo,drawFlower:drawFlower,makeBG:makeBG,pick:pick,
  col:col,label:label};
})();
