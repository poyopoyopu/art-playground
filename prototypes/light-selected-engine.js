/* LIGHT SELECTED ENGINE — ChatGPT作。参考画像の黒地・高彩度の光点・軌跡・回折感を8作品に集中改良。 */
(function(){
const TAU=Math.PI*2, clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const rand=(a,b)=>a+Math.random()*(b-a);
const names=['RIBBON','STREAM','GRIDWARP','REFLECT','TUNNEL','RAIN','MATRIX','SPARK'];
window.LightSelected=function(canvas,index){
 const ctx=canvas.getContext('2d');let W=1,H=1,dpr=1,hue=rand(0,360),seed=rand(0,9999),touch=null;
 function resize(){dpr=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;canvas.width=W*dpr;canvas.height=H*dpr;canvas.style.width=W+'px';canvas.style.height=H+'px';ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle='#000';ctx.fillRect(0,0,W,H)}
 addEventListener('resize',resize);resize();
 function fade(a=.18){ctx.fillStyle=`rgba(0,0,0,${a})`;ctx.fillRect(0,0,W,H)}
 function dot(x,y,r,h,a=.85){ctx.save();ctx.globalCompositeOperation='lighter';ctx.shadowBlur=8+r*5;ctx.shadowColor=`hsla(${h},100%,60%,${a})`;ctx.fillStyle=`hsla(${h},100%,${58+Math.min(r*5,20)}%,${a})`;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();ctx.restore()}
 function star(x,y,h,s=1){ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle=`hsla(${h},100%,70%,.45)`;ctx.shadowBlur=18*s;ctx.shadowColor=`hsla(${h},100%,65%,.8)`;ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(x-s*18,y);ctx.lineTo(x+s*18,y);ctx.moveTo(x,y-s*18);ctx.lineTo(x,y+s*18);ctx.stroke();dot(x,y,1.8*s,h,1);ctx.restore()}
 function pointOnRibbon(u,row,ph,mode){let x=W*(.02+.96*u),base=(row-7.5)*Math.min(W,H)*.055;let y=H*.55+base;let bend;
  if(mode===0)bend=Math.sin(u*9+row*.62+ph)*Math.min(W,H)*.09;
  else bend=Math.sin(u*7+row*.24-ph*1.5)*Math.min(W,H)*.14*(.45+.55*u);
  return [x,y+bend];
 }
 function render(ph){
  const S=Math.min(W,H),cx=W/2,cy=H/2;fade(.13);ctx.globalCompositeOperation='lighter';
  if(index===0){
   for(let r=0;r<22;r++){let pts=[];for(let i=0;i<82;i++){let u=i/81,p=pointOnRibbon(u,r,ph,0);pts.push(p);dot(p[0],p[1],1.05+(r%4)*.3,hue+r*13+u*120, .72)}}
   for(let r=0;r<8;r++){let pts=[];for(let i=0;i<60;i++)pts.push(pointOnRibbon(i/59,r*2,ph,0));ctx.strokeStyle=`hsla(${hue+r*28},100%,65%,.11)`;ctx.lineWidth=1;ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.stroke()}
   for(let i=0;i<7;i++){let u=(i/7+.12*ph)%1,p=pointOnRibbon(u,7.5,ph,0);star(p[0],p[1],hue+i*43,1.1)}
  }
  if(index===1){
   for(let lane=0;lane<18;lane++)for(let i=0;i<75;i++){let u=i/74,x=-S*.1+W*1.2*u;let y=cy+(lane-9)*S*.048+Math.sin(u*8+lane*.3-ph*1.7)*S*.12;let h=hue+lane*11+i*2;dot(x,y,1.15+(i%9===0),h,.78);if(i%17===0){ctx.strokeStyle=`hsla(${h},100%,65%,.16)`;ctx.beginPath();ctx.moveTo(x-18,y);ctx.lineTo(x+18,y);ctx.stroke()}}
   for(let k=0;k<10;k++){let u=(k*.13+ph*.055)%1,x=W*u,y=cy+Math.sin(u*8-ph)*S*.12;star(x,y,hue+k*31,.7)}
  }
  if(index===2){
   let q=touch||{x:cx,y:cy};for(let j=-15;j<=15;j++)for(let i=-21;i<=21;i++){let ox=i*S*.038,oy=j*S*.038,dx=ox+cx-q.x,dy=oy+cy-q.y,r=Math.hypot(dx,dy),a=Math.atan2(dy,dx)+Math.sin(r*.025-ph)*(.7*Math.exp(-r/(S*.45)));let k=1+.9*Math.exp(-r/(S*.22));let x=q.x+Math.cos(a)*r*k,y=q.y+Math.sin(a)*r*k;dot(x,y,1.15,hue+i*8-j*5+r*.13,.78)}
   star(q.x,q.y,hue+ph*30,1.3);
  }
  if(index===3){
   for(let i=0;i<430;i++){let u=(i*0.618+seed*.0001)%1,side=i%4;let x,y;
    if(side===0){x=u*W;y=(Math.sin(u*10+ph+i)*.5+.5)*H*.18}
    if(side===1){x=W-u*W;y=H-(Math.sin(u*9-ph+i)*.5+.5)*H*.18}
    if(side===2){x=(Math.sin(u*8+ph)*.5+.5)*W;y=u*H}
    if(side===3){x=W-(Math.sin(u*8-ph)*.5+.5)*W;y=H-u*H}
    dot(x,y,1.1+(i%19===0)*1.5,hue+i*1.7+ph*18,.72)
   }
   for(let i=0;i<9;i++){let a=i/9*TAU+ph*.12,x=cx+Math.cos(a)*S*.39,y=cy+Math.sin(a)*S*.25;star(x,y,hue+i*37,1)}
  }
  if(index===4){
   for(let z=1;z<38;z++){let zz=(z/38+ph*.065)%1,r=S*(.025+zz*.76),n=12+Math.floor(zz*58);for(let i=0;i<n;i++){let a=i/n*TAU+Math.sin(zz*9)*.25,x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r*.57;dot(x,y,1+zz*2.2,hue+i*8+z*6,.74)}}
   star(cx,cy,hue+40,1.7);
  }
  if(index===5){
   for(let col=0;col<34;col++){let x=W*(col+.5)/34;for(let j=0;j<20;j++){let y=((j/20+ph*.10+col*.009)%1)*H;let drift=Math.sin(y*.018+ph*1.2+col)*7;dot(x+drift,y,1.05+(j%7===0),hue+col*9+j*2,.7);if(j%5===0){ctx.strokeStyle=`hsla(${hue+col*9},100%,65%,.10)`;ctx.beginPath();ctx.moveTo(x,y-28);ctx.lineTo(x+drift,y);ctx.stroke()}}}
   for(let i=0;i<6;i++){let x=W*(i+.5)/6,y=H*(.2+.12*Math.sin(ph+i));star(x,y,hue+i*51,.75)}
  }
  if(index===6){
   let cols=29,rows=20;for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){let x=W*(i+.5)/cols,y=H*(j+.5)/rows;let q=touch||{x:cx,y:cy},dx=x-q.x,dy=y-q.y,r=Math.hypot(dx,dy);let a=Math.sin(ph*2+r*.025)*.12;let xx=x+(-dy*a)+Math.sin(ph+i*.2)*2,yy=y+(dx*a)+Math.cos(ph+j*.2)*2;dot(xx,yy,1.1+(i+j)%11===0,hue+i*7+j*11,.72)}
   star(cx,cy,hue+ph*20,1.2);
  }
  if(index===7){
   for(let i=0;i<300;i++){let a=(i*2.399+seed)%TAU,r=Math.pow((i%100)/100,.68)*S*.62,p=1+.18*Math.sin(ph*3+i*.17);let x=cx+Math.cos(a)*r*p,y=cy+Math.sin(a)*r*p*.7;dot(x,y,1.05+(i%17===0)*1.8,hue+i*.95+r*.08,.74)}
   for(let i=0;i<18;i++){let a=i/18*TAU+ph*.18,r=S*(.18+.018*i),x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r*.7;star(x,y,hue+i*20, i%6===0?1.2:.55)}
  }
  ctx.globalCompositeOperation='source-over';
 }
 function mutate(){hue=rand(0,360);seed=rand(0,99999);if(touch){touch={x:rand(W*.15,W*.85),y:rand(H*.15,H*.85)}}}
 function reset(){touch=null;hue=rand(0,360);seed=rand(0,99999);ctx.fillStyle='#000';ctx.fillRect(0,0,W,H)}
 function hit(x,y){if(window.APKit&&APKit.isUI(x,y))return true;touch={x,y};return true}
 canvas.addEventListener('pointerdown',e=>hit(e.clientX,e.clientY));canvas.addEventListener('pointermove',e=>{if(e.buttons)hit(e.clientX,e.clientY)});
 function live(now){render(now*.001);requestAnimationFrame(live)}live(0);
 APKit.init({canvas,gifName:'selected-'+String(index+1).padStart(2,'0')+'-'+names[index].toLowerCase()+'-loop',clockFormat:'spec',loopFrame:ph=>render(ph),buttons:[{label:'✦',name:'mutate',onClick:mutate},{label:'↻',name:'reset',onClick:reset}]});
};})();
