/* LIGHT ENGINE — ChatGPT作。参考画像の「黒地＋高彩度の光点＋軌跡＋回折」を20種類の別ルールで展開。 */
(function(){
  const TAU=Math.PI*2;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const rnd=(a,b)=>a+Math.random()*(b-a);
  const names=['RIBBON','STREAM','GRIDWARP','ORBITAL','BURST','REFLECT','TUNNEL','RAIN','SPIRAL','WAVE','CROSS','CELL','COMET','HALO','MATRIX','VORTEX','DRIFT','SPARK','PRISM','NEBULA'];
  window.Light20=function(canvas,index){
    const ctx=canvas.getContext('2d'); let W=1,H=1,dpr=1,phase=0,last=0; let hue=rnd(0,360),seed=Math.random()*1000; let touch=null;
    function resize(){dpr=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;canvas.width=W*dpr;canvas.height=H*dpr;canvas.style.width=W+'px';canvas.style.height=H+'px';ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle='#000';ctx.fillRect(0,0,W,H)}
    addEventListener('resize',resize); resize();
    function bg(a=.11){ctx.fillStyle=`rgba(0,0,0,${a})`;ctx.fillRect(0,0,W,H)}
    function dot(x,y,r,h,s=90,l=62,a=.9){ctx.save();ctx.shadowBlur=Math.max(5,r*4);ctx.shadowColor=`hsla(${h},100%,65%,${a})`;ctx.fillStyle=`hsla(${h},${s}%,${l}%,${a})`;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();ctx.restore()}
    function line(points,h,w=1,a=.35){ctx.save();ctx.lineWidth=w;ctx.strokeStyle=`hsla(${h},100%,65%,${a})`;ctx.shadowBlur=8;ctx.shadowColor=`hsla(${h},100%,60%,${a})`;ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.stroke();ctx.restore()}
    function flare(x,y,h){ctx.save();ctx.globalCompositeOperation='lighter';for(let k=0;k<3;k++){ctx.strokeStyle=`hsla(${h+k*35},100%,65%,.28)`;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x-22-k*8,y);ctx.lineTo(x+22+k*8,y);ctx.moveTo(x,y-22-k*8);ctx.lineTo(x,y+22+k*8);ctx.stroke()}dot(x,y,2.5,h,100,78,1);ctx.restore()}
    function p(){return touch||{x:W*.5,y:H*.5};}
    function render(ph){
      bg(.16); const cx=W/2,cy=H/2,S=Math.min(W,H), T=ph;
      ctx.globalCompositeOperation='lighter';
      if(index===0){for(let j=0;j<15;j++){let pts=[];for(let i=0;i<90;i++){let u=i/89,x=W*(.05+.9*u),y=cy+(j-7)*S*.055+Math.sin(u*9+j*.7+T)*S*.09;pts.push([x,y]);dot(x,y,1.6,hue+j*13+u*90,100,64,.8)}line(pts,hue+j*13,.7,.24)}}
      if(index===1){for(let j=0;j<24;j++){for(let i=0;i<46;i++){let u=i/45,x=-S*.1+W*1.2*u,y=cy+(j-12)*S*.045+Math.sin(u*7+j*.25-T*1.7)*S*.13;dot(x,y,1.7,hue+j*8+i*2,100,64,.85)}}}
      if(index===2){let q=p();for(let j=-14;j<=14;j++)for(let i=-18;i<=18;i++){let x=cx+i*S*.045,y=cy+j*S*.045,dx=x-q.x,dy=y-q.y,r=Math.hypot(dx,dy);let a=Math.atan2(dy,dx)+Math.sin(r*.025-T)*.9;let k=1+Math.exp(-r*.012)*.9;x=cx+Math.cos(a)*r*k;y=cy+Math.sin(a)*r*k;dot(x,y,1.5,hue+(i-j)*9+r*.08,100,63,.82)}}
      if(index===3){for(let ring=1;ring<13;ring++){let R=ring*S*.055;for(let i=0;i<ring*16;i++){let a=i/(ring*16)*TAU+T*(.35+ring*.015);let x=cx+Math.cos(a)*R,y=cy+Math.sin(a)*R*.72;dot(x,y,1.8,hue+ring*18+i*2,100,65,.9)}}}
      if(index===4){let q=p();for(let i=0;i<420;i++){let a=i*2.399+seed, r=Math.pow((i%100)/100,.65)*S*.52, pulse=1+.15*Math.sin(T*3+i);let x=q.x+Math.cos(a)*r* pulse,y=q.y+Math.sin(a)*r*pulse;dot(x,y,1.4+1.2*(i%7===0),hue+i*.9+r*.1,100,65,.75)}flare(q.x,q.y,hue)}
      if(index===5){for(let i=0;i<330;i++){let x=rnd(-S*.15,W+S*.15),y=rnd(-S*.1,H+S*.1),m=Math.min(x,W-x,y,H-y);let dx=x-cx,dy=y-cy;let side=i%4; if(side===0)x=cx-Math.abs(dx);if(side===1)x=cx+Math.abs(dx);if(side===2)y=cy-Math.abs(dy);if(side===3)y=cy+Math.abs(dy);dot(x,y,1.5,hue+i*1.1+T*15,100,64,.7)}}
      if(index===6){for(let z=1;z<32;z++){let zz=(z/32+T*.08)%1,r=S*(.04+zz*.75), n=10+Math.floor(zz*50);for(let i=0;i<n;i++){let a=i/n*TAU, x=cx+Math.cos(a)*r, y=cy+Math.sin(a)*r*.58;dot(x,y,1.3+zz*2,hue+i*9+z*7,100,67,.75)}}}
      if(index===7){for(let i=0;i<30;i++){let x=W*(i+.5)/30;for(let j=0;j<16;j++){let y=((j/16+T*.12+i*.013)%1)*H;let h=hue+i*11;dot(x+Math.sin(y*.02+T+i)*5,y,1.3,h,100,64,.72);if(j>0)line([[x,y],[x,y-H/16*.9]],h,.6,.12)}}}
      if(index===8){for(let r=0;r<18;r++){let R=S*(.035+r*.032);let pts=[];for(let i=0;i<90;i++){let a=i/89*TAU+T*(.5-r*.012),rr=R*(.72+.28*i/89);let x=cx+Math.cos(a)*rr,y=cy+Math.sin(a)*rr;pts.push([x,y]);dot(x,y,1.4,hue+r*10+i*1.7,100,66,.8)}line(pts,hue+r*10,.8,.22)}}
      if(index===9){for(let j=0;j<20;j++){let pts=[];for(let i=0;i<70;i++){let u=i/69,x=W*(i/69),y=cy+(j-9.5)*S*.06+Math.sin(u*TAU*2+j*.35+T*1.4)*S*(.05+.004*j);pts.push([x,y]);dot(x,y,1.6,hue+j*12+u*80,100,64,.8)}line(pts,hue+j*12,.7,.2)}}
      if(index===10){for(let k=-4;k<=4;k++){let pts=[];for(let i=0;i<80;i++){let u=i/79,x=W*u,y=cy+k*S*.12+(x-cx)*.62;pts.push([x,y]);dot(x,y,1.7,hue+k*24+u*100,100,66,.75)}line(pts,hue+k*24,1,.25)}for(let i=0;i<18;i++)flare(W*(i+.5)/18,cy+(W*(i+.5)/18-cx)*.62,hue+i*20)}
      if(index===11){let cols=17,rows=13;for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){let x=W*(i+.5)/cols,y=H*(j+.5)/rows;let qx=Math.sin(y*.018+T)*S*.08,qy=Math.cos(x*.02-T)*S*.08;dot(x+qx,y+qy,1.7,hue+i*10+j*13,100,65,.8)}}
      if(index===12){for(let c=0;c<11;c++){let base=c/10*W,pts=[];for(let i=0;i<75;i++){let u=i/74,x=base+Math.sin(u*8+c+T)*S*.07,y=H*(1-u)+Math.cos(u*7+c)*S*.04;pts.push([x,y]);dot(x,y,1.5,hue+c*25+u*80,100,65,.8)}line(pts,hue+c*25,1,.25)}}
      if(index===13){let q=p();for(let r=0;r<9;r++){let R=S*(.08+r*.045);for(let i=0;i<90;i++){let a=i/90*TAU+T*(.25+r*.02);let x=q.x+Math.cos(a)*R,y=q.y+Math.sin(a)*R*.72;dot(x,y,1.5,hue+r*18+i,100,66,.72)}}flare(q.x,q.y,hue+60)}
      if(index===14){for(let j=0;j<19;j++)for(let i=0;i<27;i++){let x=W*(i+.5)/27,y=H*(j+.5)/19;let s=1+Math.sin(T*2+i*.3+j*.2)*.5;dot(x,y,1.5*s,hue+i*9+j*7,100,65,.8)}}
      if(index===15){for(let arm=0;arm<14;arm++){let pts=[];for(let i=0;i<50;i++){let r=i/49*S*.55,a=arm/14*TAU+r*.018+T*(arm%2?-1:1)*.5;let x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r;pts.push([x,y]);dot(x,y,1.6,hue+arm*24+i*2,100,66,.8)}line(pts,hue+arm*24,1,.22)}}
      if(index===16){for(let i=0;i<260;i++){let a=i*2.17+seed,r=rnd(0,S*.58),x=cx+Math.cos(a+Math.sin(r*.02+T))*r,y=cy+Math.sin(a+Math.sin(r*.02+T))*r*.7;dot(x,y,1.3,hue+i*1.7+r*.08,100,63,.72)}}
      if(index===17){for(let i=0;i<240;i++){let a=rnd(0,TAU),r=rnd(S*.04,S*.65),x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r*.7;dot(x,y,1+rnd(0,2),hue+i*7,100,70,.85);if(i%13===0)flare(x,y,hue+i*7)}}
      if(index===18){for(let i=0;i<22;i++){let a=i/22*TAU+T*.3;for(let j=0;j<34;j++){let r=S*.02+j*S*.018,x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r*.6;dot(x,y,1.4,hue+i*17+j*3,100,67,.78)}}}
      if(index===19){for(let i=0;i<520;i++){let a=rnd(0,TAU),r=Math.pow(Math.random(),1.8)*S*.55;let cloud=Math.exp(-Math.pow(r/(S*.28),2));let x=cx+Math.cos(a)*r*1.15,y=cy+Math.sin(a)*r*.68;dot(x,y,1+cloud*2,hue+200*cloud+i*.8+r*.1,100,60+20*cloud,.65+cloud*.25)}}
      ctx.globalCompositeOperation='source-over';
    }
    function animate(now){phase=now*.001;render(phase);last=now;requestAnimationFrame(animate)}
    function mutate(){hue=rnd(0,360);seed=Math.random()*10000; if(touch){touch.x=rnd(W*.2,W*.8);touch.y=rnd(H*.2,H*.8)}}
    function reset(){hue=rnd(0,360);seed=Math.random()*10000;touch=null;ctx.fillStyle='#000';ctx.fillRect(0,0,W,H)}
    function touchAt(x,y){if(window.APKit&&APKit.isUI(x,y))return true;touch={x,y};return true}
    canvas.addEventListener('pointerdown',e=>touchAt(e.clientX,e.clientY));canvas.addEventListener('pointermove',e=>{if(e.buttons)touchAt(e.clientX,e.clientY)});
    animate(0);
    APKit.init({canvas,gifName:'light-'+String(index+1).padStart(2,'0')+'-'+names[index].toLowerCase()+'-loop',clockFormat:'spec',loopFrame:function(ph){render(ph)},buttons:[{label:'✦',name:'mutate',onClick:mutate},{label:'↻',name:'reset',onClick:reset}]});
  };
})();
