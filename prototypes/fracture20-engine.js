/* FRACTURE 20 — ChatGPT作。非対称IFS風の自己相似増殖。万華鏡的なabs折り返し・放射対称は使わない。 */
(()=>{'use strict';
const names=['BLOCK','FANG','DIAMOND','CROSS','HEX','STAR','BAR','RING','CHEVRON','ZIGZAG','CAPSULE','EYE','BRACKET','TOOTH','SHARD','DOT','HOLE','MESH','ARC','CELL'];
const canvas=document.querySelector('#c'),gl=canvas.getContext('webgl2',{antialias:false,alpha:false});if(!gl){document.body.innerHTML='<pre style="color:#fff;background:#000;padding:20px">WebGL2 required</pre>';return}
const V=`#version 300 es
precision highp float;in vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;
const F=`#version 300 es
precision highp float;out vec4 O;uniform vec2 R;uniform float T,M,S;uniform sampler2D L;
#define PI 3.14159265359
vec2 rot(vec2 p,float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c)*p;}
float box(vec2 p,vec2 b){vec2 d=abs(p)-b;return length(max(d,0.))+min(max(d.x,d.y),0.);}
float tri(vec2 p){return max(abs(p.x)*.86+p.y*.5-.29,-p.y-.22);}
float diamond(vec2 p){return abs(p.x)+abs(p.y)-.34;}
float hex(vec2 p){p=abs(p);return max(p.x*.866+p.y*.5,p.y)-.28;}
float star5(vec2 p){float a=atan(p.y,p.x);float h=PI/5.;float q=cos(floor(.5+a/h)*h-a)*length(p);return q-(.29+.07*cos(5.*a));}
float crossS(vec2 p){return min(box(p,vec2(.055,.31)),box(p,vec2(.31,.055)));}
float ring(vec2 p){return abs(length(p)-.25)-.055;}
float capsule(vec2 p){p.x=abs(p.x)-.18;return length(max(vec2(p.x,p.y),0.))+min(max(p.x,p.y),0.)-.08;}
float eye(vec2 p){float d=abs(length(vec2(p.x,p.y*1.7))-.22)-.045;return max(d,abs(p.x)-.26);}
float chevron(vec2 p){p=rot(p,.785);return max(abs(p.x)-.045,abs(p.y)-.27);}
float shape(vec2 p,float id){
 if(id<.5)return box(p,vec2(.23));
 if(id<1.5)return tri(p);
 if(id<2.5)return diamond(p);
 if(id<3.5)return crossS(p);
 if(id<4.5)return hex(p);
 if(id<5.5)return star5(p);
 if(id<6.5)return box(p,vec2(.32,.045));
 if(id<7.5)return ring(p);
 if(id<8.5)return chevron(p);
 if(id<9.5){p.x+=.08*sin(p.y*18.);return box(p,vec2(.28,.045));}
 if(id<10.5)return capsule(p);
 if(id<11.5)return eye(p);
 if(id<12.5){float a=atan(p.y,p.x);p=rot(p,a*.08);return max(box(p,vec2(.24,.045)),abs(p.x)-.045);}
 if(id<13.5){p.y+=.08;return max(tri(p),-p.y-.10);}
 if(id<14.5){p=rot(p,-.35);return max(box(p,vec2(.27,.035)),p.y-.10);}
 if(id<15.5)return length(p)-.075;
 if(id<16.5)return -(length(p)-.22);
 if(id<17.5)return min(box(p,vec2(.25,.025)),box(p,vec2(.025,.25)));
 if(id<18.5){p=rot(p,-.35);return abs(length(p)-.25)-.035;}
 return min(length(p)-.20,box(p,vec2(.075,.075)));
}
vec3 palette(float x){return .5+.5*cos(6.28318*(vec3(x+S*.013,x+.21+S*.009,x+.47+S*.017)));}
float child(vec2 p,float id,float level,float branch,vec3 law){
 float ang=-.55+branch*.73+sin(S+level*1.7+branch)*.19+law.b*.8;
 float sc=.53+law.r*.10+sin(S+branch*2.3)*.025;
 vec2 off=vec2(.33+branch*.13,-.12+branch*.19);
 off=rot(off,ang);
 p=rot(p,ang*.42);
 p=(p-off)/sc;
 return shape(p,id)*sc;
}
float fractal(vec2 p,float id,vec3 law){
 float d=99.;
 vec2 q=p;
 for(int level=0;level<8;level++){
   float z=float(level);
   d=min(d,shape(q,id)*(.72+z*.035));
   vec2 q0=q;
   float b=mod(floor((q.x*17.+q.y*13.+S)*2.),3.);
   q=rot(q,.11*sin(S+z*.7)+law.g*.12);
   float ang=-.62+b*.71+sin(S+z*1.9)*.11+law.b*.55;
   float sc=.56+law.r*.06;
   vec2 off=rot(vec2(.29+.10*b,-.16+.13*b),ang);
   q=(q-off)/sc;
   q+=.035*vec2(sin(q0.y*9.+S),cos(q0.x*7.-S))*law.r;
 }
 return d;
}
void main(){
 vec2 p=(gl_FragCoord.xy-.5*R)/min(R.x,R.y);vec2 uv=gl_FragCoord.xy/R;vec3 law=texture(L,uv).rgb;
 float t=T*.00020;float id=M;
 p.x+=.035*sin(p.y*8.+t)*law.r;p.y+=.028*cos(p.x*7.-t)*law.g;
 float d=fractal(p*1.25,id,law);
 float edge=exp(-abs(d)*52.);float fill=smoothstep(.035,-.025,d);
 float v=clamp(fill*.86+edge*.75,0.,1.);
 float band=sin(d*42.-t*1.4+law.b*5.)*.5+.5;
 vec3 c=palette(v*.72+band*.12+d*.25+law.g*.22);
 c*=.38+1.55*v;c+=palette(v+.33)*.16*edge;
 float vig=smoothstep(1.45,.12,length(p));O=vec4(c*vig,1.);
}`;
function compile(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){console.error(gl.getShaderInfoLog(s));document.body.innerHTML='<pre style="color:#fff;background:#000;padding:20px">Shader error</pre>';return null}return s}
const vs=compile(gl.VERTEX_SHADER,V),fs=compile(gl.FRAGMENT_SHADER,F);if(!vs||!fs)return;const P=gl.createProgram();gl.attachShader(P,vs);gl.attachShader(P,fs);gl.linkProgram(P);if(!gl.getProgramParameter(P,gl.LINK_STATUS)){console.error(gl.getProgramInfoLog(P));document.body.innerHTML='<pre style="color:#fff;background:#000;padding:20px">WebGL link error</pre>';return}gl.useProgram(P);
const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const pl=gl.getAttribLocation(P,'p');gl.enableVertexAttribArray(pl);gl.vertexAttribPointer(pl,2,gl.FLOAT,false,0,0);
const N=192,D=new Uint8Array(N*N*4);D.fill(128);for(let i=3;i<D.length;i+=4)D[i]=255;const tex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tex);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,N,N,0,gl.RGBA,gl.UNSIGNED_BYTE,D);
const uR=gl.getUniformLocation(P,'R'),uT=gl.getUniformLocation(P,'T'),uM=gl.getUniformLocation(P,'M'),uS=gl.getUniformLocation(P,'S'),uL=gl.getUniformLocation(P,'L');let mode=+(new URLSearchParams(location.search).get('mode')||0);mode=(mode+20)%20;let seed=Math.random()*100;
function resize(){const d=Math.min(devicePixelRatio||1,1.5);canvas.width=innerWidth*d;canvas.height=innerHeight*d;gl.viewport(0,0,canvas.width,canvas.height)}addEventListener('resize',resize);resize();
function paint(x,y,rad){const cx=x/innerWidth*N,cy=(1-y/innerHeight)*N,rr=Math.max(3,rad/innerWidth*N);for(let j=-rr;j<=rr;j++)for(let i=-rr;i<=rr;i++){const X=Math.floor(cx+i),Y=Math.floor(cy+j),dd=Math.hypot(i,j)/rr;if(X<0||X>=N||Y<0||Y>=N||dd>1)continue;const k=(Y*N+X)*4,q=1-dd;D[k]=Math.min(255,D[k]+105*q);D[k+1]=Math.min(255,D[k+1]+70*q);D[k+2]=Math.min(255,D[k+2]+85*q)}gl.bindTexture(gl.TEXTURE_2D,tex);gl.texSubImage2D(gl.TEXTURE_2D,0,0,0,N,N,gl.RGBA,gl.UNSIGNED_BYTE,D)}
function reset(){D.fill(128);for(let i=3;i<D.length;i+=4)D[i]=255;seed=Math.random()*100}
function mutate(){seed=Math.random()*100;mode=Math.floor(Math.random()*20)}
function render(t){gl.useProgram(P);gl.uniform2f(uR,canvas.width,canvas.height);gl.uniform1f(uT,t);gl.uniform1f(uM,mode);gl.uniform1f(uS,seed);gl.uniform1i(uL,0);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,tex);gl.drawArrays(gl.TRIANGLES,0,6)}
function draw(t){render(t);requestAnimationFrame(draw)}
canvas.addEventListener('pointerdown',e=>{if(window.APKit&&APKit.isUI(e.clientX,e.clientY))return true;paint(e.clientX,e.clientY,46);return false});canvas.addEventListener('pointermove',e=>{if(e.buttons){if(window.APKit&&APKit.isUI(e.clientX,e.clientY))return true;paint(e.clientX,e.clientY,22);return false}});
draw(performance.now()/1000);
APKit.init({canvas,gifName:'fracture20-'+String(mode+1).padStart(2,'0')+'-'+names[mode].toLowerCase()+'-loop',clockFormat:'spec',loopFrame:p=>{render(p)},buttons:[{label:'✦',name:'mutate',onClick:mutate},{label:'↻',name:'reset',onClick:reset}]});
})();