/* FRACTAL20 — ChatGPT作。参考画像の色や形は模倣せず、自己相似・再帰・階層構造とタッチ反応を主題に再設計。 */
window.Fractal20=function(canvas,index){
const ctx=canvas.getContext('2d');let W=0,H=0,D=1,phase=0,seed=Math.random()*99999,marks=[],active=null;
const N=['BRANCH','SPLIT','CORAL','FRACTURE','FERN','TREE','LIGHTNING','NEST','RINGS','CARPET','DRIFT','BIFURCATE','BLOOM','VEINS','SNOW','TENDRIL','MIRROR','MESH','GROWTH','VOID'];
const C=[['#e8e4dc','#706b62'],['#d7d7d7','#555'],['#d8c9ad','#65533e'],['#e4e0d6','#57534c'],['#c7d8d4','#465b58'],['#eee6d2','#5c5140'],['#f0c8a8','#63483b'],['#d2d7df','#4d5663'],['#d8c8df','#584b60'],['#e5e1d7','#59554d'],['#cbd7d2','#4b5c57'],['#e3d2b6','#66513a'],['#ead6cf','#654c49'],['#ccd7c5','#4e5a47'],['#dedede','#4c4c4c'],['#d6c7b5','#5b4d42'],['#d7d9e5','#515466'],['#d8d0bc','#5e5546'],['#d5dfcf','#4d594b'],['#e7e2d8','#4f4b45']];
function resize(){D=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;canvas.width=W*D;canvas.height=H*D;ctx.setTransform(D,0,0,D,0,0)}addEventListener('resize',resize);resize();
function rnd(n){return Math.abs(Math.sin(n*91.17+seed*17.31)*43758.5453)%1}
function touch(x,y){if(window.APKit&&APKit.isUI(x,y))return true;marks.push({x,y,a:rnd(marks.length+4)*Math.PI*2,p:rnd(marks.length+9)});if(marks.length>5)marks.shift();return true}
function field(x,y){let fx=0,fy=0;for(const m of marks){let dx=m.x-x,dy=m.y-y,d=Math.hypot(dx,dy)+1,q=Math.exp(-d*d/(Math.min(W,H)**2*.055));fx+=dx*q*(.55+m.p);fy+=dy*q*(.55+m.p)}return [fx,fy]}
function stroke(a,b,c,w,al){ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.strokeStyle=c;ctx.lineWidth=w;ctx.globalAlpha=al;ctx.stroke()}
function branch(x,y,len,ang,depth,twist,c,w){if(depth<=0||len<.7)return;const [fx,fy]=field(x,y),pull=Math.hypot(fx,fy);ang+=Math.atan2(fy,fx)*Math.min(.28,pull/Math.min(W,H)*.28);const x2=x+Math.cos(ang)*len,y2=y+Math.sin(ang)*len;stroke([x,y],[x2,y2],c,w*(.65+depth*.08),.55+.03*depth);const bend=.12*Math.sin(phase*2+depth);const k=0.68+twist*.05;branch(x2,y2,len*k,ang-bend-twist*.025,depth-1,twist,c,w);branch(x2,y2,len*k,ang+bend+twist*.025,depth-1,-twist,c,w)}
function lsystem(x,y,len,ang,depth,c){if(depth===0){stroke([x,y],[x+Math.cos(ang)*len,y+Math.sin(ang)*len],c,1,.65);return}const [fx,fy]=field(x,y),a=ang+Math.atan2(fy,fx)*.12;const x2=x+Math.cos(a)*len,y2=y+Math.sin(a)*len;stroke([x,y],[x2,y2],c,.8,.45);lsystem(x2,y2,len*.71,a-.47,depth-1,c);lsystem(x2,y2,len*.71,a+.47,depth-1,c)}
function spiral(cx,cy,r0,r1,turns,c,w){ctx.beginPath();for(let i=0;i<=420;i++){let q=i/420,r=r0+(r1-r0)*q,a=q*Math.PI*2*turns+phase*.7;for(const m of marks){let dx=cx+Math.cos(a)*r-m.x,dy=cy+Math.sin(a)*r-m.y,d=Math.hypot(dx,dy)+1,f=Math.exp(-d*d/(Math.min(W,H)**2*.03));a+=Math.atan2(dy,dx)*f*1.8}let x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r;i?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.strokeStyle=c;ctx.lineWidth=w;ctx.globalAlpha=.62;ctx.stroke()}
function render(ph=phase){phase=ph;const S=Math.min(W,H),cx=W/2,cy=H/2,[light,dark]=C[index%20];ctx.globalAlpha=1;ctx.fillStyle='#030303';ctx.fillRect(0,0,W,H);
if(index===0){for(let i=0;i<9;i++)branch(cx+(i-4)*S*.11,H+20,S*(.25+i*.008),-Math.PI/2+(i-4)*.055,8,1,light,1)}
else if(index===1){for(let i=0;i<12;i++)lsystem(cx,cy,S*.34,(i/12)*Math.PI*2+phase*.08,7,light)}
else if(index===2){for(let i=0;i<11;i++)branch(cx+Math.cos(i*.57)*S*.12,cy+Math.sin(i*.57)*S*.12,S*.18,i*.57+phase*.05,7,2,light,.9)}
else if(index===3){for(let i=0;i<15;i++){let a=i/15*Math.PI*2,rr=S*.09;branch(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr,S*.18,a+Math.PI,8,3,light,.9)}}
else if(index===4){for(let i=0;i<6;i++){let x=cx+(i-2.5)*S*.11;branch(x,cy+S*.3,S*.22,-Math.PI/2+(i-2.5)*.08,9,1.5,light,.75)}}
else if(index===5){branch(cx,cy+S*.46,S*.30,-Math.PI/2,10,2.2,light,1.2);branch(cx,cy+S*.46,S*.22,-Math.PI/2-.45,8,1.3,dark,.7)}
else if(index===6){for(let i=0;i<14;i++){let a=-Math.PI/2+(i-6.5)*.045;branch(cx,cy+S*.45,S*.32,a,7,6*Math.sin(i),light,.8)}}
else if(index===7){for(let r=0;r<7;r++)for(let i=0;i<8;i++){let a=i/8*Math.PI*2,rr=S*(.04+r*.055);spiral(cx+Math.cos(a)*rr*.25,cy+Math.sin(a)*rr*.25,S*.008,S*.075,2.2+r*.08,dark,.7)}}
else if(index===8){for(let i=0;i<13;i++)spiral(cx,cy,S*.015+i*S*.012,S*(.10+i*.045),2.8+i*.16,i%3?dark:light,.8)}
else if(index===9){const n=3;for(let j=-n;j<=n;j++)for(let i=-n;i<=n;i++){let x=cx+i*S*.14,y=cy+j*S*.14;branch(x,y,S*.09,Math.atan2(j,i)+phase*.08,5,1.5,light,.65)}}
else if(index===10){for(let j=-18;j<=18;j++){let y=cy+j*S*.025;for(let k=0;k<5;k++){let x=cx-S*.52+k*S*.26;let a=Math.sin(y*.018+phase*1.5+k)*.5;branch(x,y,S*.08,a,5,j*.2,dark,.55)}}}
else if(index===11){for(let i=0;i<10;i++){let a=-Math.PI*.92+i*Math.PI*.84/9;branch(cx,cy+S*.42,S*.31,a,8,4*Math.sin(i),light,.9)}}
else if(index===12){for(let i=0;i<18;i++){let a=i/18*Math.PI*2;let x=cx+Math.cos(a)*S*.24,y=cy+Math.sin(a)*S*.24;branch(x,y,S*.13,a+Math.PI/2,6,2,light,.65)}}
else if(index===13){for(let i=0;i<12;i++){let a=i/12*Math.PI*2;branch(cx,cy,S*.34,a,7,1.7,i%2?dark:light,.75)}}
else if(index===14){for(let i=0;i<9;i++){let a=i/9*Math.PI*2;lsystem(cx+Math.cos(a)*S*.10,cy+Math.sin(a)*S*.10,S*.15,a+Math.PI,6,light)}}
else if(index===15){for(let i=0;i<7;i++){let a=-Math.PI/2+(i-3)*.12;branch(cx,cy,S*.38,a,9,5,light,.8)}}
else if(index===16){for(let k=0;k<4;k++){let a=k*Math.PI/2+phase*.04;branch(cx,cy,S*.42,a,8,2.5,light,.8);branch(cx,cy,S*.31,a+.2,7,-2,dark,.55)}}
else if(index===17){for(let j=-4;j<=4;j++)for(let i=-4;i<=4;i++){let x=cx+i*S*.105,y=cy+j*S*.105;branch(x,y,S*.055,Math.atan2(j,i)+phase*.05,4,1.1,(i+j)%3?dark:light,.55)}}
else if(index===18){for(let i=0;i<10;i++){let a=i/10*Math.PI*2;let r=S*.06+Math.sin(phase+i)*S*.01;branch(cx+Math.cos(a)*r,cy+Math.sin(a)*r,S*.34,a+Math.PI*.5,8,2+i*.2,light,.75)}}
else {for(let i=0;i<7;i++){let a=i/7*Math.PI*2;let x=cx+Math.cos(a)*S*.26,y=cy+Math.sin(a)*S*.26;branch(x,y,S*.20,a+Math.PI,8,3,light,.7)}for(const m of marks){ctx.globalAlpha=.8;ctx.fillStyle=light;ctx.beginPath();ctx.arc(m.x,m.y,3,0,Math.PI*2);ctx.fill()}}
for(const m of marks){ctx.globalAlpha=.7;ctx.fillStyle=light;ctx.beginPath();ctx.arc(m.x,m.y,2.5+2*Math.sin(phase*2+m.a),0,Math.PI*2);ctx.fill()}}
function mutate(){seed=Math.random()*99999;marks=[];for(let i=0;i<2+(Math.random()*3|0);i++)touch(W*(.2+.6*Math.random()),H*(.2+.6*Math.random()))}
function reset(){marks=[];seed=Math.random()*99999}
canvas.addEventListener('pointerdown',e=>{if(window.APKit&&APKit.isUI(e.clientX,e.clientY))return true;active=true;touch(e.clientX,e.clientY)});
canvas.addEventListener('pointermove',e=>{if(window.APKit&&APKit.isUI(e.clientX,e.clientY))return true;if(active)touch(e.clientX,e.clientY)});
canvas.addEventListener('pointerup',()=>active=false);canvas.addEventListener('pointercancel',()=>active=false);
function draw(){phase=(phase+.006)%(Math.PI*2);render();requestAnimationFrame(draw)}
mutate();draw();
APKit.init({canvas:canvas,gifName:N[index]+'-loop',clockFormat:'spec',loopFrame:function(p){render(p)},buttons:[{label:'✦',name:'mutate',onClick:mutate},{label:'↻',name:'reset',onClick:reset}]});
};
