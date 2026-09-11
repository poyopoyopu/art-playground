/* DOT20 — ChatGPT作。黒地・高彩度の光点・放射/渦/レンズ変形を20ルールで展開。 */
(function(){const TAU=Math.PI*2;const NAMES=['TUNNEL','LENS','VORTEX','WAVE','RIPPLE','PINWHEEL','FOLD','BLOOM','SPIRAL','KNOT','PRESSURE','ORBIT','PRISM','BURST','MIRROR','CURRENT','SPLIT','GRAVITY','MESH','FRACTURE'];
window.Dot20=function(canvas,index){const g=canvas.getContext('2d');let W=1,H=1,S=1,d=1,phase=0,hue=Math.random()*360,seed=Math.random()*9999,p=null;
function size(){d=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;S=Math.min(W,H);canvas.width=W*d;canvas.height=H*d;canvas.style.width=W+'px';canvas.style.height=H+'px';g.setTransform(d,0,0,d,0,0);g.fillStyle='#000';g.fillRect(0,0,W,H)}addEventListener('resize',size);size();
function dot(x,y,rx,ry,h,a=.9){g.save();g.shadowBlur=Math.max(2,rx*5);g.shadowColor=`hsla(${h},100%,65%,${a})`;g.fillStyle=`hsla(${h},100%,${62+18*Math.min(1,rx/8)}%,${a})`;g.beginPath();g.ellipse(x,y,rx,ry,0,0,TAU);g.fill();g.restore()}
function render(t){g.fillStyle='rgba(0,0,0,.20)';g.fillRect(0,0,W,H);g.globalCompositeOperation='lighter';const cx=W/2,cy=H/2,q=p||{x:cx,y:cy};
for(let j=0;j<34;j++)for(let i=0;i<62;i++){let u=i/61,v=(j-16.5)/16.5,x,y,ang,r,hh,rx,ry;
if(index===0){x=W*(u-.5);y=S*v*.82;let rr=Math.hypot(x,y),a=Math.atan2(y,x)+.55*Math.sin(rr*.018-t*1.5);x=cx+Math.cos(a)*rr*1.35;y=cy+Math.sin(a)*rr*.72}
if(index===1){x=W*(u-.5);y=S*v*.82;let dx=x,dy=y,r=Math.hypot(dx,dy),k=1+1.5*Math.exp(-r*r/(S*S*.055));x=cx+dx*k;y=cy+dy*k}
if(index===2){x=W*(u-.5);y=S*v*.82;let r=Math.hypot(x,y),a=Math.atan2(y,x)+r*.012+t*.7;x=cx+Math.cos(a)*r;y=cy+Math.sin(a)*r}
if(index===3){x=W*u;y=cy+S*v*.48+Math.sin(u*TAU*2.2+j*.28+t)*S*.075}
if(index===4){x=W*(u-.5);y=S*v*.82;let r=Math.hypot(x,y),k=1+.55*Math.sin(r*.025-t*2);x=cx+x*k;y=cy+y*k}
if(index===5){let a=u*TAU*2+v*.45+t*.35,r=(j+3)*S*.015;x=cx+Math.cos(a)*r*(.7+u);y=cy+Math.sin(a)*r*(.7+u)}
if(index===6){x=W*(u-.5);y=S*v*.82;let fold=Math.sin(x*.018+t)+Math.abs(y)*.004;x=cx+x+Math.sign(y)*S*.13*fold;y=cy+y*.72}
if(index===7){let a=u*TAU,r=(j+2)*S*.018*(.7+.3*Math.sin(t+u*8));x=cx+Math.cos(a)*r;y=cy+Math.sin(a)*r}
if(index===8){let r=(j+2)*S*.015+u*S*.55,a=u*TAU*3+r*.012+t*.45;x=cx+Math.cos(a)*r*.55;y=cy+Math.sin(a)*r*.55}
if(index===9){let a=u*TAU*2+v*2.4,r=(j+2)*S*.016;x=cx+Math.cos(a)*r*(1+.3*Math.sin(a*3));y=cy+Math.sin(a)*r*(1+.3*Math.cos(a*2))}
if(index===10){x=W*(u-.5);y=S*v*.82;let dx=x-q.x+cx,dy=y-q.y+cy,r=Math.hypot(dx,dy),k=1+1.9*Math.exp(-r*r/(S*S*.035));x=q.x+(dx)*k;y=q.y+(dy)*k}
if(index===11){let a=u*TAU+t*.4,r=(j+2)*S*.016;x=cx+Math.cos(a)*r;y=cy+Math.sin(a)*r*.65}
if(index===12){x=W*(u-.5);y=S*v*.82;let a=Math.atan2(y,x),r=Math.hypot(x,y),sector=Math.sin(a*6+t)*S*.025;x=cx+x+Math.cos(a+1.57)*sector;y=cy+y+Math.sin(a+1.57)*sector}
if(index===13){let a=u*TAU*3+t*.3,r=(j+2)*S*.018*(.4+u);x=cx+Math.cos(a)*r;y=cy+Math.sin(a)*r}
if(index===14){x=W*(u-.5);y=S*v*.82;let ax=Math.abs(x),ay=Math.abs(y);x=cx+Math.sign(x)*Math.min(ax,ay*1.15);y=cy+Math.sign(y)*Math.min(ay,ax*1.15)}
if(index===15){x=W*(u-.5);y=S*v*.82;let a=Math.atan2(y,x),r=Math.hypot(x,y),flow=Math.sin(a*5-r*.018+t)*S*.055;x=cx+x+Math.cos(a+1.57)*flow;y=cy+y+Math.sin(a+1.57)*flow}
if(index===16){x=W*(u-.5);y=S*v*.82;let a=Math.atan2(y,x),r=Math.hypot(x,y);if(a>0)a+=.5*Math.sin(r*.025+t);x=cx+Math.cos(a)*r;y=cy+Math.sin(a)*r}
if(index===17){x=W*(u-.5);y=S*v*.82;let r=Math.hypot(x,y),k=1+.8/(1+r*.025);x=cx+x*k;y=cy+y*k}
if(index===18){x=W*(u-.5);y=S*v*.82;let a=Math.atan2(y,x),r=Math.hypot(x,y);a+=.25*Math.sin(r*.03+t)+.18*Math.sin(a*4);x=cx+Math.cos(a)*r;y=cy+Math.sin(a)*r}
if(index===19){x=W*(u-.5);y=S*v*.82;let r=Math.hypot(x,y),a=Math.atan2(y,x);r+=S*.06*Math.sin(a*8+r*.02+t);a+=.25*Math.sin(r*.025);x=cx+Math.cos(a)*r;y=cy+Math.sin(a)*r}
rx=1.6+1.6*(Math.sin(i*.7+j*.31+seed)*.5+.5);ry=rx*(.55+.35*Math.abs(Math.sin((i+j)*.19+t)));hh=hue+(i*7+j*11)+index*23;dot(x,y,rx,ry,hh,.78);
}
// a small number of white-hot anchors creates the photographic flare feel
for(let k=0;k<7;k++){let a=k/7*TAU+t*.12,r=S*(.18+.018*k),x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r*.65;dot(x,y,2.4,2.4,hue+k*43,1)}g.globalCompositeOperation='source-over'}
function animate(ms){phase=ms*.001;render(phase);requestAnimationFrame(animate)}
function mutate(){hue=Math.random()*360;seed=Math.random()*99999;p={x:W*(.2+.6*Math.random()),y:H*(.2+.6*Math.random())}}
function reset(){hue=Math.random()*360;seed=Math.random()*99999;p=null;g.fillStyle='#000';g.fillRect(0,0,W,H)}
function touch(x,y){if(window.APKit&&APKit.isUI(x,y))return true;p={x,y};return true}
canvas.addEventListener('pointerdown',e=>touch(e.clientX,e.clientY));canvas.addEventListener('pointermove',e=>{if(e.buttons)touch(e.clientX,e.clientY)});animate(0);
APKit.init({canvas,gifName:'dot20-'+String(index+1).padStart(2,'0')+'-'+NAMES[index].toLowerCase()+'-loop',clockFormat:'spec',loopFrame:render,buttons:[{label:'✦',name:'mutate',onClick:mutate},{label:'↻',name:'reset',onClick:reset}]});};})();