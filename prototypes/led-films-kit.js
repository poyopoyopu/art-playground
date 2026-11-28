/* led-films-kit.js — 透明なLED膜5枚を重ねて描く共通部分(クロちゃん作、2026/11/28)。STORM・FLOCKの試作で使う。
   作品側は5枚の膜それぞれの小さなキャンバス(LED1粒=1ピクセル、GX×GY)に描くだけ。
   このキットが、奥の膜ほど小さく暗く・粒が少しぼけ・ゆっくり揺れる形で5枚を重ね、LEDの粒として光らせ、光のにじみを足す。
   使い方:
     var kit=LEDFilms.init({canvas:cv, draw:function(t,dt){ kit.films[L].ctx に描く(L=0が一番奥、4が一番手前) }});
     kit.GX, kit.GY … 膜のLEDの数(横・縦)。描く座標は左上が(0,0)
     kit.flash … 0〜1。全部の膜のLEDを白くほのかに光らせる(稲光など)
     kit.spread … 0〜1。膜どうしの奥行きを広げる
     kit.toGrid(clientX,clientY) … 画面の座標を一番手前の膜のLED座標に
   2026/11/28 おっちゃん「幕を活用できてないよね？幕毎にランダム性が合った方がいいかな」→ 膜ごとに粒の大きさ・傾き・ずれ・色味・明るさが違い、各膜が8〜25秒おきにばらばらに選び直してゆっくり変わる。ときどき1枚だけ横に滑る・またたく・暗くなってまた灯る。
   ap-kit.js には触らない。 */
(function(){
'use strict';
var LEDFilms={init:function(o){
  var cv=o.canvas,NF=5;
  var gl=cv.getContext('webgl2',{antialias:false,alpha:false,preserveDrawingBuffer:true,powerPreference:'high-performance'});
  var kit={films:[],GX:1,GY:1,flash:0,spread:0,flashTint:[.75,.8,1],gl:gl,ok:!!gl};
  if(!gl)return kit;
  function prog(vs,fs){
    function sh(t,s){var x=gl.createShader(t);gl.shaderSource(x,s);gl.compileShader(x);if(!gl.getShaderParameter(x,gl.COMPILE_STATUS))console.error(gl.getShaderInfoLog(x));return x;}
    var p=gl.createProgram();gl.attachShader(p,sh(gl.VERTEX_SHADER,vs));gl.attachShader(p,sh(gl.FRAGMENT_SHADER,fs));gl.linkProgram(p);
    if(!gl.getProgramParameter(p,gl.LINK_STATUS))console.error(gl.getProgramInfoLog(p));
    var u={},n=gl.getProgramParameter(p,gl.ACTIVE_UNIFORMS);for(var i=0;i<n;i++){var f=gl.getActiveUniform(p,i);u[f.name]=gl.getUniformLocation(p,f.name);}
    return {p:p,u:u};}
  var VS='#version 300 es\nlayout(location=0) in vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  var ledP=prog(VS,
  '#version 300 es\nprecision highp float;\nuniform sampler2D u_tex;uniform vec2 u_res,u_grid;uniform float u_cell,u_t,u_flash,u_spread;uniform vec3 u_ftint;uniform vec2 u_fo[5];uniform float u_fr[5],u_fs[5],u_fb[5];uniform vec3 u_ft[5];out vec4 o;\n'+
  'vec3 film(vec2 fc,int Li){float L=float(Li);float z=L/4.;\n'+
  ' float s=mix(mix(.56,.36,u_spread),1.,z)*u_fs[Li];vec2 ctr=u_res*vec2(.5,.52);\n'+
  ' vec2 sway=vec2(sin(u_t*.11+L*1.7),cos(u_t*.083+L*.9))*(1.-z)*u_cell*3.;\n'+
  ' vec2 q=fc-ctr;float ca=cos(u_fr[Li]),sa=sin(u_fr[Li]);q=vec2(ca*q.x-sa*q.y,sa*q.x+ca*q.y);\n'+
  ' vec2 p=q/s+ctr+sway+u_fo[Li]*u_cell;\n'+
  ' if(p.x<0.||p.y<0.||p.x>=u_grid.x*u_cell||p.y>=u_grid.y*u_cell)return vec3(0.);\n'+
  ' vec2 cid=floor(p/u_cell);vec2 f=fract(p/u_cell)-.5;\n'+
  ' vec3 v=texelFetch(u_tex,ivec2(int(cid.x)+Li*int(u_grid.x),int(u_grid.y-1.-cid.y)),0).rgb;\n'+
  ' v+=u_ftint*u_flash*(.05+.12*z);\n'+
  ' float lum=max(max(v.r,v.g),v.b);v*=(floor(min(lum,1.)*20.+.5)/20.*step(.1,lum)+lum*step(lum,.1))/max(lum,1e-4);\n'+
  ' float dd=max(abs(f.x),abs(f.y))*2.;float led=smoothstep(.88,.6-.2*(1.-z),dd)*(1.+.3*(1.-length(f)*2.));\n'+
  ' float e=min(min(p.x,p.y),min(u_grid.x*u_cell-p.x,u_grid.y*u_cell-p.y))/u_cell;\n'+
  ' vec3 edge=vec3(.5,.55,.7)*exp(-e*1.2)*.06*(1.-z*.5)*(1.+u_flash*3.);\n'+
  ' vec3 off=vec3(.009,.010,.014)*smoothstep(.9,.6,dd);\n'+
  ' return (v*u_ft[Li]*led*1.5*u_fb[Li]+off+edge)*mix(.42,1.,pow(z,.8));}\n'+
  'void main(){vec3 c=vec3(0.);for(int i=0;i<5;i++)c+=film(gl_FragCoord.xy,i);o=vec4(c,1.);}');
  var blurP=prog(VS,'#version 300 es\nprecision highp float;\nuniform sampler2D u_tex;uniform vec2 u_step,u_inv;uniform float u_thr;out vec4 o;\n'+
  'vec3 f(vec3 c){return max(c-u_thr,0.);}\n'+
  'void main(){vec2 uv=gl_FragCoord.xy*u_inv;vec3 s=f(texture(u_tex,uv).rgb)*.227;\n'+
  ' s+=(f(texture(u_tex,uv+u_step).rgb)+f(texture(u_tex,uv-u_step).rgb))*.194;\n'+
  ' s+=(f(texture(u_tex,uv+u_step*2.).rgb)+f(texture(u_tex,uv-u_step*2.).rgb))*.121;\n'+
  ' s+=(f(texture(u_tex,uv+u_step*3.).rgb)+f(texture(u_tex,uv-u_step*3.).rgb))*.054;\n'+
  ' s+=(f(texture(u_tex,uv+u_step*4.).rgb)+f(texture(u_tex,uv-u_step*4.).rgb))*.016;\n'+
  ' o=vec4(s,1.);}');
  var compP=prog(VS,'#version 300 es\nprecision highp float;\nuniform sampler2D u_a,u_b,u_c;uniform vec2 u_inv;out vec4 o;\n'+
  'void main(){vec2 uv=gl_FragCoord.xy*u_inv;vec3 c=texture(u_a,uv).rgb+texture(u_b,uv).rgb*.55+texture(u_c,uv).rgb*.75;\n'+
  ' c=c/(1.+max(c-.85,0.)*.7);o=vec4(c,1.);}');
  var quad=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,quad);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
  var vao=gl.createVertexArray();gl.bindVertexArray(vao);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
  var tex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tex);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  function mkRT(w,h){var t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA8,w,h,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    var f=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,f);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,t,0);
    gl.bindFramebuffer(gl.FRAMEBUFFER,null);return {t:t,f:f,w:w,h:h};}
  // 膜ごとの個性: 粒の大きさ・傾き・ずれ・色味・明るさ。各膜がばらばらのタイミングで目標を選び直し、ゆっくり近づく。ときどき1枚だけ滑る・またたく
  var FP=[];
  function rr(a,b){return a+Math.random()*(b-a);}
  function pick(L,first){var z=L/4,f=FP[L]||{};
    f.ts=(L===4?rr(1.02,1.16):rr(.82,1.28));f.tr=(L===4?rr(-.035,.035):rr(-.16,.16));
    f.tox=rr(-6,6)*(1-z*.7);f.toy=rr(-4,4)*(1-z*.7);f.tb=rr(.7,1.15);
    var hue=Math.random();f.tt=[.82+.3*Math.max(0,Math.cos(6.283*hue)),.82+.3*Math.max(0,Math.cos(6.283*(hue-.33))),.82+.3*Math.max(0,Math.cos(6.283*(hue-.67)))];
    f.next=rr(8,25);if(first){f.s=f.ts;f.r=f.tr;f.ox=f.tox;f.oy=f.toy;f.b=f.tb;f.t3=f.tt.slice();f.ev=0;f.evT=rr(4,20);f.evK=0;}
    FP[L]=f;}
  for(var Lp=0;Lp<NF;Lp++)pick(Lp,true);
  var uFo=new Float32Array(10),uFr=new Float32Array(5),uFs=new Float32Array(5),uFb=new Float32Array(5),uFt=new Float32Array(15);
  function stepFilms(dt){for(var L=0;L<NF;L++){var f=FP[L];f.next-=dt;if(f.next<=0)pick(L,false);
      var k=1-Math.exp(-dt*.35);f.s+=(f.ts-f.s)*k;f.r+=(f.tr-f.r)*k;f.ox+=(f.tox-f.ox)*k;f.oy+=(f.toy-f.oy)*k;f.b+=(f.tb-f.b)*k;for(var c=0;c<3;c++)f.t3[c]+=(f.tt[c]-f.t3[c])*k;
      f.evT-=dt;if(f.evT<=0&&f.ev<=0){f.ev=1;f.evK=Math.floor(Math.random()*3);f.evDir=Math.random()<.5?-1:1;f.evT=rr(10,30);}
      var sx=0,bm=1;if(f.ev>0){f.ev-=dt/(f.evK===0?2.2:1.2);var e=Math.max(0,f.ev);
        if(f.evK===0)sx=Math.sin((1-e)*Math.PI)*f.evDir*14*(1-L/4*.6);
        else if(f.evK===1)bm=.35+.65*(Math.sin((1-e)*40)>0?1:.2);
        else bm=Math.abs(e*2-1);}
      uFo[L*2]=f.ox+sx;uFo[L*2+1]=f.oy;uFr[L]=f.r;uFs[L]=f.s;uFb[L]=f.b*bm;uFt[L*3]=f.t3[0];uFt[L*3+1]=f.t3[1];uFt[L*3+2]=f.t3[2];}}
  kit.filmParams=FP;stepFilms(0);
  var RT=null,W=0,H=0,CELL=8,dpr=Math.min(2,window.devicePixelRatio||1),qscale=1;
  var atlas=document.createElement('canvas'),actx=atlas.getContext('2d');
  function resize(){var s=dpr*qscale;W=Math.max(2,Math.round(innerWidth*s));H=Math.max(2,Math.round(innerHeight*s));cv.width=W;cv.height=H;
    CELL=Math.max(3,Math.round(4.2*W/innerWidth));var GX=Math.ceil(W/CELL),GY=Math.ceil(H/CELL);
    if(GX!==kit.GX||GY!==kit.GY||!kit.films.length){kit.GX=GX;kit.GY=GY;atlas.width=GX*NF;atlas.height=GY;kit.films=[];
      for(var L=0;L<NF;L++){var c=document.createElement('canvas');c.width=GX;c.height=GY;kit.films.push({canvas:c,ctx:c.getContext('2d'),L:L,z:L/4});}
      if(o.onResize)o.onResize(kit);}
    if(RT)for(var k in RT){gl.deleteTexture(RT[k].t);gl.deleteFramebuffer(RT[k].f);}
    RT={sc:mkRT(W,H),q1:mkRT(Math.max(2,W>>2),Math.max(2,H>>2)),q2:mkRT(Math.max(2,W>>2),Math.max(2,H>>2)),e1:mkRT(Math.max(2,W>>3),Math.max(2,H>>3)),e2:mkRT(Math.max(2,W>>3),Math.max(2,H>>3))};}
  kit.toGrid=function(x,y){   // 画面の座標→一番手前の膜のLED座標(膜の傾き・大きさ・ずれも戻す)
    var f=FP[4],fx=x*W/innerWidth,fy=(innerHeight-y)*H/innerHeight,cx=W*.5,cy=H*.52,qx=fx-cx,qy=fy-cy,ca=Math.cos(f.r),sa=Math.sin(f.r);
    var rx=ca*qx-sa*qy,ry=sa*qx+ca*qy;var px=rx/f.s+cx+uFo[8]*CELL,py=ry/f.s+cy+uFo[9]*CELL;
    return {x:px/CELL,y:kit.GY-py/CELL};};
  function pass(src,dst,sx,sy,thr){gl.bindFramebuffer(gl.FRAMEBUFFER,dst.f);gl.viewport(0,0,dst.w,dst.h);gl.useProgram(blurP.p);
    gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,src.t);gl.uniform1i(blurP.u.u_tex,0);
    gl.uniform2f(blurP.u.u_step,sx,sy);gl.uniform2f(blurP.u.u_inv,1/dst.w,1/dst.h);gl.uniform1f(blurP.u.u_thr,thr);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);}
  addEventListener('resize',resize);resize();
  var t0=performance.now(),last=t0,frames=0,acc=0;
  function frame(now){
    var dt=Math.min(.1,(now-last)/1000);last=now;var t=(now-t0)/1000;
    stepFilms(dt);o.draw(t,dt,kit);
    actx.clearRect(0,0,atlas.width,atlas.height);
    for(var L=0;L<NF;L++)actx.drawImage(kit.films[L].canvas,L*kit.GX,0);
    gl.bindVertexArray(vao);
    gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,tex);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true);   // 透明な所は暗く(残像が消えていくように)
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,atlas);
    gl.bindFramebuffer(gl.FRAMEBUFFER,RT.sc.f);gl.viewport(0,0,W,H);gl.useProgram(ledP.p);
    gl.uniform1i(ledP.u.u_tex,0);gl.uniform2f(ledP.u.u_res,W,H);gl.uniform2f(ledP.u.u_grid,kit.GX,kit.GY);gl.uniform1f(ledP.u.u_cell,CELL);
    gl.uniform1f(ledP.u.u_t,t);gl.uniform1f(ledP.u.u_flash,kit.flash);gl.uniform1f(ledP.u.u_spread,kit.spread);gl.uniform3f(ledP.u.u_ftint,kit.flashTint[0],kit.flashTint[1],kit.flashTint[2]);
    gl.uniform2fv(ledP.u['u_fo[0]'],uFo);gl.uniform1fv(ledP.u['u_fr[0]'],uFr);gl.uniform1fv(ledP.u['u_fs[0]'],uFs);gl.uniform1fv(ledP.u['u_fb[0]'],uFb);gl.uniform3fv(ledP.u['u_ft[0]'],uFt);
    gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
    pass(RT.sc,RT.q1,2.5/W,0,.16);pass(RT.q1,RT.q2,0,1.5/RT.q1.h,0);pass(RT.q2,RT.e1,2/RT.q2.w,0,0);pass(RT.e1,RT.e2,0,2/RT.e1.h,0);
    gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,W,H);gl.useProgram(compP.p);
    gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,RT.sc.t);gl.uniform1i(compP.u.u_a,0);
    gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,RT.q2.t);gl.uniform1i(compP.u.u_b,1);
    gl.activeTexture(gl.TEXTURE2);gl.bindTexture(gl.TEXTURE_2D,RT.e2.t);gl.uniform1i(compP.u.u_c,2);
    gl.uniform2f(compP.u.u_inv,1/W,1/H);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);gl.activeTexture(gl.TEXTURE0);
    frames++;acc+=dt;if(frames===90){if(acc/90>.021&&qscale>.6){qscale*=.85;resize();}frames=0;acc=0;}
    requestAnimationFrame(frame);}
  requestAnimationFrame(function(n){last=n;frame(n);});
  // 画面を消さない
  var wl=null;function wake(){if(navigator.wakeLock&&!wl&&document.visibilityState==='visible')navigator.wakeLock.request('screen').then(function(l){wl=l;l.addEventListener('release',function(){wl=null;});}).catch(function(){});}
  wake();document.addEventListener('visibilitychange',wake);addEventListener('pointerdown',wake);
  // 膜の上の時刻(確認用 ?t=HH:MM:SS)
  var Q=new URLSearchParams(location.search),tOff=0;
  if(Q.get('t')){var m=Q.get('t').split(':');var tg=new Date();tg.setHours(+m[0]||0,+m[1]||0,+m[2]||0,0);tOff=tg.getTime()-Date.now();}
  kit.now=function(){return new Date(Date.now()+tOff);};
  kit.query=Q;
  return kit;
}};
window.LEDFilms=LEDFilms;
})();
