/* trick-kit.js — トリック作品(別枠)用の小さな共通部品。クロちゃん(Claude)作 2026/11/10。
   ap-kit.js はそのまま使い、これは「ヒントの1行」「傾きボタン」「画面を消さない」「WebGL2の下ごしらえ」「押す・なぞる・タップの判定」だけをまとめる。
   使うのは prototypes/ のトリック作品だけ(ギャラリー本体の作品は使っていない)。 */
(function(){
var st=document.createElement('style');
st.textContent=[
'html,body{margin:0;height:100%;overflow:hidden;touch-action:none;background:#000}',
'canvas{position:fixed;inset:0;width:100%;height:100%;display:block}',
'#hint{position:fixed;left:0;right:0;bottom:calc(96px + env(safe-area-inset-bottom));text-align:center;color:#fff;',
' font:600 15px/1.5 system-ui,-apple-system,"Hiragino Sans",sans-serif;letter-spacing:.06em;',
' text-shadow:0 0 8px #000,0 0 8px #000,0 1px 2px #000,0 0 3px #000;pointer-events:none;opacity:0;transition:opacity .6s;padding:0 20px}',
'#hint.on{opacity:1}',
/* 傾きセンサーのボタン(センサーを使う作品は、ボタンで示す) */
'#tiltBtn{position:fixed;left:14px;top:calc(64px + env(safe-area-inset-top));z-index:5;display:flex;align-items:center;gap:7px;',
' height:44px;padding:0 15px 0 12px;border-radius:22px;border:1.5px solid rgba(255,255,255,.75);background:rgba(20,20,24,.82);',
' color:#fff;font:700 14px/1 system-ui,-apple-system,"Hiragino Sans",sans-serif;letter-spacing:.04em;-webkit-tap-highlight-color:transparent}',
'#tiltBtn svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round}',
'#tiltBtn.on{background:#fff;color:#111;border-color:#fff}'
].join('\n');
document.head.appendChild(st);

var TK={dpr:1}, hint=null, hintT=0;
function hintEl(){if(!hint){hint=document.getElementById('hint');
  if(!hint){hint=document.createElement('div');hint.id='hint';document.body.appendChild(hint);}}return hint;}
TK.say=function(s,ms){var h=hintEl();h.textContent=s;h.classList.add('on');clearTimeout(hintT);
  if(ms)hintT=setTimeout(function(){h.classList.remove('on');},ms);};
TK.hush=function(){clearTimeout(hintT);hintEl().classList.remove('on');};

// 画面を消さない(眺めている間に暗くならないように)
var wl=null;
TK.wake=function(){if(navigator.wakeLock&&!wl)navigator.wakeLock.request('screen').then(function(l){wl=l;
  l.addEventListener('release',function(){wl=null;});}).catch(function(){});};
document.addEventListener('visibilitychange',function(){if(!document.hidden)TK.wake();});

// WebGL2(広色域 display-p3 が使える端末ではそれで描く)。body はフラグメントシェーダーの本体。R(画面の大きさpx)は自動で渡す
TK.gl=function(cv,body,names,onResize){
  var gl=cv.getContext('webgl2',{antialias:false,preserveDrawingBuffer:true});
  if(!gl){TK.say('このブラウザでは表示できないみたい(WebGL2が必要)',0);return null;}
  if('drawingBufferColorSpace' in gl){try{gl.drawingBufferColorSpace='display-p3';}catch(e){}}
  function sh(t,src){var s=gl.createShader(t);gl.shaderSource(s,src);gl.compileShader(s);
    if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))console.error(gl.getShaderInfoLog(s));return s;}
  var pr=gl.createProgram();
  gl.attachShader(pr,sh(gl.VERTEX_SHADER,'#version 300 es\nin vec2 p;void main(){gl_Position=vec4(p,0.,1.);}'));
  gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,'#version 300 es\nprecision highp float;uniform vec2 R;out vec4 o;\n'+body));
  gl.linkProgram(pr);gl.useProgram(pr);
  var b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
  var loc=gl.getAttribLocation(pr,'p');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
  var U={R:gl.getUniformLocation(pr,'R')};
  (names||[]).forEach(function(n){U[n]=gl.getUniformLocation(pr,n);});
  function resize(){TK.dpr=Math.min(window.devicePixelRatio||1,2);
    cv.width=Math.round(innerWidth*TK.dpr);cv.height=Math.round(innerHeight*TK.dpr);gl.viewport(0,0,cv.width,cv.height);
    if(onResize)onResize();}
  addEventListener('resize',resize);resize();
  return {gl:gl,U:U,draw:function(){gl.uniform2f(U.R,cv.width,cv.height);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);}};
};
// 画面の座標(CSSのpx・上が0) → シェーダーの座標(端末のpx・下が0)
TK.gx=function(x){return x*TK.dpr;};
TK.gy=function(cv,y){return cv.height-y*TK.dpr;};

// 傾き: 左上のボタンで入れる(iPhoneはここで「動きと方向」の許可が出る)。x=左右、y=前後の傾き(入れた時の向きからの度数)
TK.tilt=function(onMsg){
  var s={on:false,x:0,y:0}, base=null, got=false;
  var btn=document.createElement('button');btn.id='tiltBtn';btn.type='button';btn.setAttribute('aria-pressed','false');
  btn.innerHTML='<svg viewBox="0 0 24 24"><rect x="8.5" y="3" width="7" height="18" rx="2"/><path d="M4.5 9c-1 2-1 4 0 6M19.5 9c1 2 1 4 0 6"/></svg><span>傾き OFF</span>';
  document.body.appendChild(btn);
  function onOri(e){if(e.beta==null||e.gamma==null)return;got=true;
    if(!base)base={b:e.beta,g:e.gamma};
    s.x+=((e.gamma-base.g)-s.x)*.2;s.y+=((e.beta-base.b)-s.y)*.2;}
  function set(on){s.on=on;btn.classList.toggle('on',on);btn.setAttribute('aria-pressed',on?'true':'false');
    btn.querySelector('span').textContent=on?'傾き ON':'傾き OFF';
    if(on){base=null;got=false;addEventListener('deviceorientation',onOri);
      TK.say('傾き ON。'+(onMsg||'スマホを傾けてみて'),5000);
      setTimeout(function(){if(s.on&&!got){set(false);TK.say('この端末では傾きセンサーが使えないみたい',4500);}},2000);}
    else{removeEventListener('deviceorientation',onOri);s.x=0;s.y=0;}}
  btn.addEventListener('click',function(){
    TK.wake();
    if(s.on){set(false);TK.say('傾き OFF',2000);return;}
    var D=window.DeviceOrientationEvent;
    if(!D){TK.say('この端末では傾きセンサーが使えないみたい',4500);return;}
    if(typeof D.requestPermission==='function'){
      var no=function(){TK.say('傾きが許可されなかった。設定で許可すると使える',5000);};
      D.requestPermission().then(function(r){if(r==='granted')set(true);else no();}).catch(no);
    }else set(true);
  });
  return s;
};

// 押す・なぞる・タップ。h.down(x,y) / h.move(x,y,d) / h.up(x,y,tap,d)。TK.down は押している間の情報(無ければnull)
TK.down=null;
TK.press=function(cv,h){
  cv.addEventListener('pointerdown',function(e){
    if(window.APKit&&APKit.isUI(e.clientX,e.clientY))return;
    TK.wake();TK.down={x:e.clientX,y:e.clientY,cx:e.clientX,cy:e.clientY,t:performance.now(),moved:false};
    if(h.down)h.down(e.clientX,e.clientY);
  });
  cv.addEventListener('pointermove',function(e){var d=TK.down;if(!d)return;
    if(Math.hypot(e.clientX-d.x,e.clientY-d.y)>10)d.moved=true;d.cx=e.clientX;d.cy=e.clientY;
    if(h.move)h.move(e.clientX,e.clientY,d);});
  function up(){var d=TK.down;if(!d)return;TK.down=null;
    if(h.up)h.up(d.cx,d.cy,!d.moved&&performance.now()-d.t<300,d);}
  cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
};
// 押さえ続けている(動かさずに0.25秒以上)か
TK.holding=function(){var d=TK.down;return !!(d&&!d.moved&&performance.now()-d.t>250);};

// ap-kit の決まりの組み込み(spec時計・dock・autoHide・全画面ボタン無し・GIF無し・✦と↻)
TK.kit=function(cv,name,mutate,reset){
  APKit.init({canvas:cv,gifName:name+'-loop',clockFormat:'spec',dock:true,autoHide:true,fullscreenButton:false,
    buttons:[{label:'✦',name:'mutate',onClick:mutate},{label:'↻',name:'reset',onClick:reset}]});
};
window.TK=TK;
})();
