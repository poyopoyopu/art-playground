/* KOI POND ENGINE — クロード(クロちゃん)作 2026-09-20
   koi-pond-b.html (Canvas強化版) と koi-pond-c.html (WebGL屈折版) の共通シミュレーション。
   世界のルール(SHOAL LAW)は prototypes/koi-pond.html と同じ:
     HOLD(餌)  … 餌を食べた鯉は「半分のスケール2匹」に分裂(最大4階層)
     TAP(波紋) … 波紋の中で同世代の鯉どうしが出会うと一段上のスケールへ合体
   このファイルは描画の「中身」だけを持ち、水面の表現(ぼかし・光の網・屈折)は各HTML側の担当。
*/
(function(){
'use strict';

function rand(a, b){ return a + Math.random() * (b - a); }
function angDiff(a, b){
  var d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

var E = {
  W: 0, H: 0, T: 0,
  koi: [], pads: [], ripples: [], crumbs: [],
  feed: null, CAP: 46, P: {},
  bottom: null, bottomScale: 4
};

/* ---------------- palette ---------------- */
E.newPalette = function(){
  E.P = {
    hue:    205 + rand(-8, 8),
    sat:    rand(42, 56),
    lum:    rand(26, 33),
    koiHue: rand(6, 20),
    koiSat: rand(62, 84),
    padHue: rand(98, 134)
  };
};

/* ---------------- pond bottom (soft mottled) ---------------- */
E.buildBottom = function(){
  var s = E.bottomScale;
  var w = Math.max(8, Math.ceil(E.W / s)), h = Math.max(8, Math.ceil(E.H / s));
  var c = document.createElement('canvas');
  c.width = w; c.height = h;
  var g = c.getContext('2d');
  var P = E.P;
  var grad = g.createLinearGradient(0, 0, w * 0.4, h);
  grad.addColorStop(0, 'hsl(' + P.hue + ',' + P.sat + '%,' + (P.lum + 7) + '%)');
  grad.addColorStop(1, 'hsl(' + (P.hue + 6) + ',' + (P.sat + 6) + '%,' + (P.lum - 5) + '%)');
  g.fillStyle = grad;
  g.fillRect(0, 0, w, h);
  var n = Math.round((w * h) / 90) + 40;
  for (var i = 0; i < n; i++){
    var x = rand(0, w), y = rand(0, h), r = rand(4, 26);
    var l = P.lum + rand(-9, 10);
    var rg = g.createRadialGradient(x, y, 0, x, y, r);
    rg.addColorStop(0, 'hsla(' + (P.hue + rand(-10, 10)) + ',' + P.sat + '%,' + l + '%,.55)');
    rg.addColorStop(1, 'hsla(' + P.hue + ',' + P.sat + '%,' + l + '%,0)');
    g.fillStyle = rg;
    g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill();
  }
  E.bottom = c;
};

E.drawBottom = function(ctx){
  var dx = Math.sin(E.T * 0.11) * 3, dy = Math.cos(E.T * 0.09) * 3;
  ctx.drawImage(E.bottom, -4 + dx, -4 + dy, E.W + 8, E.H + 8);
};

/* ---------------- lily pads ---------------- */
E.buildPads = function(){
  E.pads = [];
  var n = 4 + (Math.random() * 4 | 0);
  for (var i = 0; i < n; i++){
    E.pads.push({
      x: rand(0.08, 0.92) * E.W,
      y: rand(0.06, 0.94) * E.H,
      r: rand(14, 24),
      a: rand(0, 6.283),
      ph: rand(0, 6.283),
      flower: Math.random() < 0.6,
      fr: rand(6.5, 10)
    });
  }
};

/* ---------------- koi ---------------- */
function Koi(x, y, gen, white, hueShift){
  var P = E.P;
  this.gen = gen;
  this.sc = Math.pow(0.68, gen);
  this.len = 42 * this.sc;
  this.w = 6.3 * this.sc;
  this.x = x; this.y = y;
  this.dir = rand(0, 6.283);
  this.spd = (25 + rand(-5, 8)) * (0.78 + 0.22 * this.sc);
  this.wigPh = rand(0, 6.283);
  this.wigSp = 5.2 + 3.4 * (1 - this.sc);
  this.fed = 0; this.flee = 0; this.slow = 0;
  this.dep = rand(0.12, 0.92);          // 0=水面すれすれ 1=底
  this.depPh = rand(0, 6.283);
  this.white = (white === undefined) ? (Math.random() < 0.3) : white;
  this.hue = P.koiHue + (hueShift === undefined ? rand(-6, 8) : hueShift);
  this.spots = [];
  var ns = 1 + (Math.random() * 3 | 0);
  for (var i = 0; i < ns; i++){
    this.spots.push({ p: rand(0.1, 0.82), o: rand(-0.42, 0.42), r: rand(0.42, 0.88) });
  }
  this.hist = [];
  for (var j = 0; j < 12; j++){
    this.hist.push({ x: x - Math.cos(this.dir) * j * this.len / 10,
                     y: y - Math.sin(this.dir) * j * this.len / 10 });
  }
}
E.Koi = Koi;

/* 体の履歴(背骨)を今の位置で張り直す。瞬間移動させるときは必ずこれを使う。
   これを忘れると、旧位置と新位置が1本の棒でつながった鯉が描かれる(2026/09/20のバグ) */
Koi.prototype.place = function(x, y, dir){
  this.x = x; this.y = y;
  if (dir !== undefined) this.dir = dir;
  this.hist = [];
  for (var j = 0; j < 12; j++){
    this.hist.push({ x: x - Math.cos(this.dir) * j * this.len / 11,
                     y: y - Math.sin(this.dir) * j * this.len / 11 });
  }
};

Koi.prototype.step = function(dt){
  var i, r, d, dx, dy, want;
  var T = E.T;

  this.dir += Math.sin(T * 0.7 + this.wigPh) * 0.9 * dt + rand(-1, 1) * 1.2 * dt;

  // 深さはゆっくり上下する。餌があると浮いてくる
  var tgt = 0.5 + Math.sin(T * 0.23 + this.depPh) * 0.38;
  if (E.feed && Math.hypot(E.feed.x - this.x, E.feed.y - this.y) < 200) tgt = 0.08;
  this.dep += (tgt - this.dep) * Math.min(1, dt * 0.9);

  if (E.feed){
    dx = E.feed.x - this.x; dy = E.feed.y - this.y;
    d = Math.hypot(dx, dy) + 0.001;
    if (d < 300){
      want = Math.atan2(dy, dx);
      this.dir += angDiff(want, this.dir) * Math.min(1, (1 - d / 300) * 2.6) * dt * 2.8;
      if (d < 52){ this.fed += dt * (1.5 - d / 90); this.slow = 1; }
    }
  }

  for (i = 0; i < E.ripples.length; i++){
    r = E.ripples[i];
    dx = this.x - r.x; dy = this.y - r.y;
    d = Math.hypot(dx, dy) + 0.001;
    if (Math.abs(d - r.r) < 54 && r.life > 0.15){
      want = Math.atan2(dy, dx);
      this.dir += angDiff(want, this.dir) * 3.4 * dt * r.life;
      this.flee = Math.max(this.flee, r.life);
      this.dep = Math.min(1, this.dep + dt * 0.8 * r.life); // 驚いて潜る
    }
  }

  var m = 30;
  if (this.x < m)         this.dir += angDiff(0, this.dir) * 3 * dt;
  if (this.x > E.W - m)   this.dir += angDiff(Math.PI, this.dir) * 3 * dt;
  if (this.y < m)         this.dir += angDiff(Math.PI / 2, this.dir) * 3 * dt;
  if (this.y > E.H - m)   this.dir += angDiff(-Math.PI / 2, this.dir) * 3 * dt;

  this.flee *= Math.pow(0.24, dt);
  this.slow *= Math.pow(0.02, dt);
  var sp = this.spd * (1 + this.flee * 2.3) * (1 - this.slow * 0.55);
  this.x += Math.cos(this.dir) * sp * dt;
  this.y += Math.sin(this.dir) * sp * dt;
  this.x = Math.max(6, Math.min(E.W - 6, this.x));
  this.y = Math.max(6, Math.min(E.H - 6, this.y));

  var need = this.len / 11;
  var h0 = this.hist[0];
  var gap = Math.hypot(this.x - h0.x, this.y - h0.y);
  if (!isFinite(gap) || gap > this.len * 1.5){
    this.place(this.x, this.y, this.dir);   // 飛んだときは張り直す
    return;
  }
  var guard = 0;
  while (gap > need && guard < 8){
    var k = need / gap;
    this.hist.unshift({ x: h0.x + (this.x - h0.x) * k,
                        y: h0.y + (this.y - h0.y) * k });
    if (this.hist.length > 12) this.hist.pop();
    h0 = this.hist[0];
    gap = Math.hypot(this.x - h0.x, this.y - h0.y);
    guard++;
  }
};

function bodyW(f){
  var v = Math.pow(Math.max(0, Math.sin(Math.PI * Math.min(1, 0.22 + 0.78 * f))), 0.8);
  return Math.max(0.05, v);
}

Koi.prototype.spine = function(){
  var n = this.hist.length, i, f, a, amp, off;
  var mid = [], nx = [], ny = [];
  for (i = 0; i < n; i++){
    var p = this.hist[i];
    var q = this.hist[Math.min(i + 1, n - 1)];
    var pv = this.hist[Math.max(i - 1, 0)];
    a = Math.atan2(q.y - pv.y, q.x - pv.x);
    f = i / (n - 1);
    amp = this.w * 0.62 * f * f * (1 + this.flee * 0.8);
    off = Math.sin(E.T * this.wigSp - i * 0.8 + this.wigPh) * amp;
    mid.push({ x: p.x + Math.cos(a + Math.PI / 2) * off,
               y: p.y + Math.sin(a + Math.PI / 2) * off,
               w: bodyW(f) * this.w, a: a, f: f });
    nx.push(Math.cos(a + Math.PI / 2));
    ny.push(Math.sin(a + Math.PI / 2));
  }
  return { mid: mid, nx: nx, ny: ny, n: n };
};

function outlinePath(ctx, S, dx, dy){
  var j, m0;
  ctx.beginPath();
  for (j = 0; j < S.n; j++){
    m0 = S.mid[j];
    var px = m0.x + S.nx[j] * m0.w + dx, py = m0.y + S.ny[j] * m0.w + dy;
    if (j === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  for (j = S.n - 1; j >= 0; j--){
    m0 = S.mid[j];
    ctx.lineTo(m0.x - S.nx[j] * m0.w + dx, m0.y - S.ny[j] * m0.w + dy);
  }
  ctx.closePath();
}

/* 底に落ちる影。深いほど大きく・薄く・ズレる */
Koi.prototype.drawShadow = function(ctx){
  var S = this.spine();
  var k = 5 + this.dep * 16;
  ctx.save();
  ctx.globalAlpha = 0.34 - this.dep * 0.17;
  ctx.fillStyle = '#031a26';
  outlinePath(ctx, S, k * 0.55, k * 0.8);
  ctx.fill();
  ctx.restore();
};

Koi.prototype.draw = function(ctx){
  var S = this.spine(), n = S.n, mid = S.mid, nx = S.nx, ny = S.ny, i;
  var P = E.P;

  // 尾びれ
  var tail = mid[n - 1], ref = mid[Math.max(0, n - 4)];
  var ta = Math.atan2(tail.y - ref.y, tail.x - ref.x);
  ctx.save();
  ctx.translate(tail.x, tail.y);
  ctx.rotate(ta);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-this.w * 1.2, -this.w * 1.15, -this.w * 2.1, -this.w * 0.5);
  ctx.quadraticCurveTo(-this.w * 1.25, 0, -this.w * 2.1, this.w * 0.5);
  ctx.quadraticCurveTo(-this.w * 1.2, this.w * 1.15, 0, 0);
  ctx.fillStyle = this.white ? 'rgba(252,248,244,.5)' : 'hsla(' + this.hue + ',' + P.koiSat + '%,58%,.46)';
  ctx.fill();
  ctx.restore();

  // 胸びれ
  var pec = mid[Math.min(3, n - 1)];
  ctx.save();
  ctx.translate(pec.x, pec.y);
  ctx.rotate(pec.a + Math.sin(E.T * this.wigSp + this.wigPh) * 0.35);
  ctx.globalAlpha = 0.45;
  ctx.fillStyle = this.white ? '#fbf6f2' : 'hsl(' + this.hue + ',' + P.koiSat + '%,64%)';
  ctx.beginPath(); ctx.ellipse(0, this.w * 1.15, this.w * 1.0, this.w * 0.38, 0.5, 0, 6.283); ctx.fill();
  ctx.beginPath(); ctx.ellipse(0, -this.w * 1.15, this.w * 1.0, this.w * 0.38, -0.5, 0, 6.283); ctx.fill();
  ctx.globalAlpha = 1;
  ctx.restore();

  // 体(横断方向のグラデーションで丸みを出す)
  var head = mid[0];
  var gx = Math.cos(head.a + Math.PI / 2) * this.w * 1.6;
  var gy = Math.sin(head.a + Math.PI / 2) * this.w * 1.6;
  var g = ctx.createLinearGradient(this.x - gx, this.y - gy, this.x + gx, this.y + gy);
  if (this.white){
    g.addColorStop(0, 'hsl(28,24%,99%)');
    g.addColorStop(0.45, 'hsl(28,22%,93%)');
    g.addColorStop(1, 'hsl(24,26%,78%)');
  } else {
    g.addColorStop(0, 'hsl(' + this.hue + ',' + P.koiSat + '%,58%)');
    g.addColorStop(0.45, 'hsl(' + this.hue + ',' + P.koiSat + '%,47%)');
    g.addColorStop(1, 'hsl(' + (this.hue - 6) + ',' + P.koiSat + '%,33%)');
  }
  outlinePath(ctx, S, 0, 0);
  ctx.fillStyle = g;
  ctx.fill();

  ctx.save();
  outlinePath(ctx, S, 0, 0);
  ctx.clip();

  // 斑
  var spot = this.white ? 'hsl(' + this.hue + ',' + P.koiSat + '%,46%)' : 'hsl(30,28%,94%)';
  for (i = 0; i < this.spots.length; i++){
    var s = this.spots[i];
    var idx = Math.min(n - 1, Math.max(0, Math.round(s.p * (n - 1))));
    var m1 = mid[idx];
    ctx.beginPath();
    ctx.ellipse(m1.x + nx[idx] * m1.w * s.o, m1.y + ny[idx] * m1.w * s.o,
                m1.w * s.r * 1.15, m1.w * s.r * 0.95, m1.a, 0, 6.283);
    ctx.fillStyle = spot;
    ctx.fill();
  }

  // 鱗のきらめき(背側の細い筋)
  ctx.globalAlpha = 0.16;
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = this.w * 0.5;
  ctx.beginPath();
  for (i = 0; i < n; i++){ if (i === 0) ctx.moveTo(mid[i].x, mid[i].y); else ctx.lineTo(mid[i].x, mid[i].y); }
  ctx.stroke();
  ctx.globalAlpha = 0.1;
  ctx.lineWidth = Math.max(0.6, this.w * 0.14);
  for (i = 1; i < n; i += 1){
    var mm = mid[i];
    ctx.beginPath();
    ctx.arc(mm.x, mm.y, mm.w * 0.95, mm.a - 2.1, mm.a + 2.1);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // 縁の陰
  ctx.globalAlpha = 0.3;
  ctx.lineWidth = Math.max(0.8, this.w * 0.5);
  ctx.strokeStyle = 'rgba(8,30,42,.9)';
  outlinePath(ctx, S, 0, 0);
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.restore();
};

/* ---------------- ripples / crumbs ---------------- */
E.addRipple = function(x, y, str){
  E.ripples.push({ x: x, y: y, r: 6, rMax: 170 * str, band: 16 * str, life: 1, sp: 135 * str });
  if (E.ripples.length > 8) E.ripples.shift();
};
E.addCrumbs = function(x, y, n){
  for (var i = 0; i < n; i++){
    E.crumbs.push({ x: x + rand(-8, 8), y: y + rand(-8, 8),
                    vx: rand(-14, 14), vy: rand(-14, 14), life: 1, r: rand(0.9, 1.7) });
  }
};

/* ---------------- 世界のルール ---------------- */
function resolveSplits(){
  var born = [];
  for (var i = E.koi.length - 1; i >= 0; i--){
    var k = E.koi[i];
    if (k.fed > 1.25 && k.gen < 3 && E.koi.length + born.length < E.CAP){
      var a = k.dir + Math.PI / 2, off = k.len * 0.3;
      for (var s = -1; s <= 1; s += 2){
        var c = new Koi(k.x + Math.cos(a) * off * s, k.y + Math.sin(a) * off * s,
                        k.gen + 1, k.white, k.hue - E.P.koiHue);
        c.dir = k.dir + s * 0.7;
        c.dep = k.dep;
        born.push(c);
      }
      E.addRipple(k.x, k.y, 0.45);
      E.addCrumbs(k.x, k.y, 6);
      E.koi.splice(i, 1);
    } else if (k.fed > 1.25){
      k.fed = 1.0;
    }
  }
  for (var j = 0; j < born.length; j++) E.koi.push(born[j]);
}

E.tap = function(x, y){
  E.addRipple(x, y, 1);
  var merged = 0, rad = 130;
  for (var i = 0; i < E.koi.length && merged < 4; i++){
    var a = E.koi[i];
    if (!a || a.gen === 0) continue;
    if (Math.hypot(a.x - x, a.y - y) > rad) continue;
    for (var j = i + 1; j < E.koi.length; j++){
      var b = E.koi[j];
      if (!b || b.gen !== a.gen) continue;
      if (Math.hypot(b.x - x, b.y - y) > rad) continue;
      if (Math.hypot(a.x - b.x, a.y - b.y) > 90 * a.sc + 42) continue;
      var big = new Koi((a.x + b.x) / 2, (a.y + b.y) / 2, a.gen - 1, a.white, a.hue - E.P.koiHue);
      big.dir = a.dir;
      big.dep = Math.min(a.dep, b.dep);
      E.koi.splice(j, 1);
      E.koi.splice(i, 1, big);
      E.addRipple(big.x, big.y, 0.55);
      merged++;
      break;
    }
  }
  return merged;
};

E.setFeed = function(x, y){ E.feed = { x: x, y: y }; };
E.clearFeed = function(){ E.feed = null; };

/* ---------------- lifecycle ---------------- */
E.resize = function(w, h){
  E.W = w; E.H = h;
  E.buildBottom();
};
E.reset = function(){
  E.koi = []; E.ripples = []; E.crumbs = []; E.feed = null;
  for (var i = 0; i < 9; i++) E.koi.push(new Koi(rand(0.15, 0.85) * E.W, rand(0.15, 0.85) * E.H, 0));
};
E.mutate = function(){
  E.newPalette();
  E.buildBottom();
  E.buildPads();
  for (var i = 0; i < E.koi.length; i++){
    var k = E.koi[i];
    k.hue = E.P.koiHue + rand(-6, 8);
    k.place(rand(0.1, 0.9) * E.W, rand(0.1, 0.9) * E.H, rand(0, 6.283));
  }
};

E.step = function(dt){
  E.T += dt;
  if (E.feed && Math.random() < dt * 5) E.addCrumbs(E.feed.x, E.feed.y, 1);
  var i, r, c;
  for (i = E.ripples.length - 1; i >= 0; i--){
    r = E.ripples[i];
    r.r += r.sp * dt;
    r.life = 1 - r.r / r.rMax;
    if (r.life <= 0) E.ripples.splice(i, 1);
  }
  for (i = E.crumbs.length - 1; i >= 0; i--){
    c = E.crumbs[i];
    c.x += c.vx * dt; c.y += c.vy * dt;
    c.vx *= Math.pow(0.2, dt); c.vy *= Math.pow(0.2, dt);
    c.life -= dt * 1.05;
    if (c.life <= 0) E.crumbs.splice(i, 1);
  }
  for (i = 0; i < E.koi.length; i++) E.koi[i].step(dt);
  if (E.feed) resolveSplits();
};

/* 指定した深さ帯の鯉だけ描く(手前ほどくっきり描くための分割) */
E.drawKoiBand = function(ctx, lo, hi, withShadow){
  for (var i = 0; i < E.koi.length; i++){
    var k = E.koi[i];
    if (k.dep < lo || k.dep >= hi) continue;
    if (withShadow) k.drawShadow(ctx);
    k.draw(ctx);
  }
};

E.drawCrumbs = function(ctx){
  for (var i = 0; i < E.crumbs.length; i++){
    var c = E.crumbs[i];
    ctx.beginPath(); ctx.arc(c.x, c.y, c.r, 0, 6.283);
    ctx.fillStyle = 'rgba(255,240,215,' + (0.8 * c.life) + ')';
    ctx.fill();
  }
};

/* 水面に浮くもの(葉・花・餌の目印)。屈折させない層 */
E.drawSurface = function(ctx){
  var P = E.P, T = E.T;
  for (var i = 0; i < E.pads.length; i++){
    var p = E.pads[i];
    var bx = p.x + Math.sin(T * 0.45 + p.ph) * 2.4;
    var by = p.y + Math.cos(T * 0.37 + p.ph) * 2.2;
    ctx.save();
    ctx.translate(bx, by);
    ctx.fillStyle = 'rgba(2,20,32,.3)';
    ctx.beginPath(); ctx.arc(4, 6, p.r * 1.02, 0, 6.283); ctx.fill();
    ctx.rotate(p.a + Math.sin(T * 0.2 + p.ph) * 0.07);
    var pg = ctx.createRadialGradient(-p.r * 0.3, -p.r * 0.3, p.r * 0.1, 0, 0, p.r);
    pg.addColorStop(0, 'hsl(' + (P.padHue + 8) + ',34%,30%)');
    pg.addColorStop(1, 'hsl(' + (P.padHue - 6) + ',32%,17%)');
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, p.r, 0.26, 6.283 - 0.26);
    ctx.closePath();
    ctx.fillStyle = pg;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, 0, p.r * 0.66, 0.4, 5.5);
    ctx.strokeStyle = 'hsla(' + P.padHue + ',42%,50%,.4)';
    ctx.lineWidth = 1.1;
    ctx.stroke();
    ctx.restore();

    if (p.flower){
      var fx = bx + Math.cos(p.a + 2.2) * (p.r + 8);
      var fy = by + Math.sin(p.a + 2.2) * (p.r + 8);
      ctx.save();
      ctx.translate(fx, fy);
      ctx.rotate(p.ph);
      ctx.fillStyle = 'rgba(2,20,32,.22)';
      ctx.beginPath(); ctx.arc(2, 3, p.fr * 0.9, 0, 6.283); ctx.fill();
      for (var k = 0; k < 8; k++){
        ctx.rotate(6.283 / 8);
        ctx.beginPath();
        ctx.ellipse(p.fr * 0.6, 0, p.fr * 0.6, p.fr * 0.24, 0, 0, 6.283);
        ctx.fillStyle = 'rgba(255,252,248,.95)';
        ctx.fill();
      }
      ctx.beginPath(); ctx.arc(0, 0, p.fr * 0.26, 0, 6.283);
      ctx.fillStyle = 'rgba(255,224,146,.95)';
      ctx.fill();
      ctx.restore();
    }
  }
  if (E.feed){
    ctx.beginPath();
    ctx.arc(E.feed.x, E.feed.y, 14 + Math.sin(T * 7) * 3, 0, 6.283);
    ctx.strokeStyle = 'rgba(255,240,210,.36)';
    ctx.lineWidth = 1.4;
    ctx.stroke();
  }
};

E.newPalette();
window.KoiSim = E;

})();
