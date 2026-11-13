// Squid Kit (CC0 1.0). There is NO glb / FBX model, skeleton or animation clip for the squid: its motion and colour changes are too complex.
// With three.js, use this file as-is (see README.md). For any other engine, port this code: README.md "Other engines (porting guide)".
// イカは動きや発色が複雑なため、glb や FBX のモデルはありません。three.js ではこのファイルでそのまま動きます。ほかのエンジンではこのコードを移植してください（README.md）。
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
// src/game/squid/squid-species.ts
var smooth$2 = (a, b, x) => {
	const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
	return t * t * (3 - 2 * t);
};
var SQUIDS = {
	aori: {
		id: "aori",
		name: "アオリイカ",
		ml: .3,
		mantleW: .13,
		mantleH: .115,
		profile: (s) => {
			if (s < .18) return .9 + .1 * smooth$2(0, .18, s);
			const u = (s - .18) / .82;
			return Math.pow(Math.max(0, 1 - Math.pow(u, 1.9)), .72);
		},
		belly: .92,
		spine: 0,
		dorsalSqueeze: 1,
		headLen: .2,
		headW: .105,
		headH: .085,
		eyeR: .05,
		pupil: "round",
		fin0: .03,
		fin1: .99,
		finW: .19,
		finShape: (u) => Math.pow(Math.sin(Math.PI * Math.pow(u, .85)), .75) * (.55 + .45 * smooth$2(0, .6, u)),
		finWaves: 1.1,
		finAmp: .55,
		finFreq: 1.8,
		finAt: .08,
		arms: [
			.3,
			.4,
			.45,
			.42
		],
		armR: .03,
		tentRest: .45,
		tentMax: 1.6,
		tentR: .011,
		clubR: .024,
		base: [
			.8,
			.74,
			.68
		],
		belly_: [
			.9,
			.88,
			.86
		],
		spot: [
			.45,
			.2,
			.12
		],
		spotDense: 1,
		shine: [
			.25,
			.85,
			.75
		],
		pattern: 0,
		finOpacity: .82,
		inkSpread: 0,
		jet: 1,
		armRatio: [
			.72,
			.86,
			1,
			.94
		],
		armFix: 1.05,
		armRFrac: .17,
		heightFix: 1
	},
	kouika: {
		id: "kouika",
		name: "コウイカ",
		ml: .18,
		mantleW: .27,
		mantleH: .14,
		profile: (s) => {
			const u = (s - .42) / .58;
			const e = Math.sqrt(Math.max(0, 1 - Math.min(1, Math.abs(u)) ** 2.2));
			return s < .42 ? .78 + .22 * Math.sqrt(Math.max(0, 1 - ((.42 - s) / .42) ** 2)) : e;
		},
		belly: .62,
		spine: 0,
		dorsalSqueeze: .3,
		headLen: .22,
		headW: .2,
		headH: .12,
		eyeR: .056,
		pupil: "w",
		fin0: .02,
		fin1: .985,
		finW: .075,
		finShape: (u) => Math.pow(Math.sin(Math.PI * u), .28),
		finWaves: 2.6,
		finAmp: .45,
		finFreq: 3.2,
		finAt: -.05,
		arms: [
			.28,
			.3,
			.32,
			.34
		],
		armR: .04,
		tentRest: 0,
		tentMax: 1.25,
		tentR: .012,
		clubR: .03,
		base: [
			.52,
			.38,
			.27
		],
		belly_: [
			.88,
			.84,
			.78
		],
		spot: [
			.22,
			.12,
			.07
		],
		spotDense: 1.3,
		shine: [
			.85,
			.82,
			.7
		],
		pattern: 1,
		finOpacity: .92,
		inkSpread: 1,
		jet: .55,
		armRatio: [
			.9,
			.88,
			.94,
			1
		],
		armFix: 1.12,
		armRFrac: .2,
		heightFix: .8
	}
};
// src/game/squid/squid.ts
var NEUTRAL = {
	mantle: 0,
	breathe: 1,
	headPitch: 0,
	headYaw: 0,
	eyeYaw: .15,
	eyePitch: 0,
	pupil: .6,
	finAmp: 1.5,
	finFreq: .8,
	finDir: 1,
	finFold: 0,
	finLift: 0,
	finTurn: 0,
	armSpread: .12,
	armCurl: -.15,
	armTip: .25,
	armWave: .15,
	armPitch: .12,
	armGather: .2,
	armRaise: 0,
	armIdle: 1,
	armPinch: .6,
	armDroop: 0,
	armBundle: 0,
	armFlare: 0,
	wrap: 0,
	tentOut: 0,
	tentShow: 1,
	funnelAim: .25,
	funnelOpen: .3,
	dark: .25,
	pale: 0,
	cloud: 0,
	flicker: 0,
	sag: 0,
	flat: 0,
	colorLife: 1
};
/** 近づく速さ（1/秒）。書いていないものは 4 */
var RATE = {
	mantle: 14,
	pale: 10,
	dark: 3,
	tentOut: 30,
	finFold: 6,
	armGather: 5,
	wrap: 3,
	pupil: 3,
	eyeYaw: 7,
	eyePitch: 7,
	cloud: 2,
	flicker: 3,
	flat: 2,
	armPinch: 1.5,
	armDroop: 1.2,
	armBundle: 6,
	armFlare: 8,
	colorLife: 2
};
/** 部品の番号（シェーダーの色分けにも使う） */
var PART = {
	mantle: 0,
	head: 1,
	arm: 2,
	tentacle: 3,
	fin: 4,
	funnel: 5,
	spine: 6
};
var smooth$1 = (a, b, x) => {
	const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
	return t * t * (3 - 2 * t);
};
var lookCache = /* @__PURE__ */ new Map();
/**
* 写真と形を読む（なければ null：数式の形と描いた模様で作る）。
* url：ファイル名（aori.json など）→ 読む URL（配布するイカのキット・ギャラリーが渡す。ふつうは public/squid/）
*/
function loadSquidLook(id, url) {
	let p = lookCache.get(id);
	if (!p) {
		const base = "/squid/";
		const at = url ?? ((f) => base + f);
		const loader = new THREE.TextureLoader();
		const tex = async (v) => {
			const t = await loader.loadAsync(at(`${id}_${v}.webp`));
			t.colorSpace = THREE.SRGBColorSpace;
			t.anisotropy = 4;
			return t;
		};
		p = (async () => {
			try {
				const r = await fetch(at(`${id}.json`));
				if (!r.ok) return null;
				const shape = await r.json();
				const [dorsal, ventral, side] = await Promise.all([
					tex("dorsal"),
					tex("ventral"),
					tex("side")
				]);
				return {
					shape,
					tex: {
						dorsal,
						ventral,
						side
					}
				};
			} catch {
				return null;
			}
		})();
		lookCache.set(id, p);
	}
	return p;
}
/** 0〜1 を配列の中で直線に補う */
var sample$1 = (arr, t) => {
	const x = Math.min(1, Math.max(0, t)) * (arr.length - 1);
	const i = Math.min(arr.length - 2, Math.floor(x));
	return arr[i] + (arr[i + 1] - arr[i]) * (x - i);
};
function formOf(sp, shape) {
	const ml = sp.ml;
	if (!shape) {
		const hw0 = (h) => .94 + .06 * smooth$1(-.1, .35, h) - .36 * smooth$1(.62, 1, h);
		return {
			mlen: ml,
			a: (s) => sp.mantleW * ml * sp.profile(s),
			top: (s) => sp.mantleH * ml * sp.profile(s),
			bot: (s) => sp.mantleH * ml * sp.profile(s) * sp.belly,
			headLen: sp.headLen * ml,
			hw: (h) => sp.headW * ml * hw0(h),
			ht: (h) => sp.headH * ml * hw0(h),
			hb: (h) => sp.headH * ml * hw0(h) * .85,
			fin0: sp.fin0,
			fin1: sp.fin1,
			finW: (u) => sp.finW * ml * sp.finShape(u),
			finAt: sp.finAt,
			arms: sp.arms.map((a) => a * ml),
			armR: sp.armR * ml,
			eye: {
				x: sp.headW * ml * .98 - sp.eyeR * ml * .62,
				y: sp.headH * ml * .22,
				z: sp.headLen * ml * .4,
				R: sp.eyeR * ml
			},
			spine: sp.spine * ml,
			strip: null
		};
	}
	const m = shape.mantle;
	const hd = shape.head;
	const hf = sp.heightFix;
	const hAt = (arr, h) => sample$1(arr, (h + .15) / 1.15);
	const L = shape.arms.len * sp.armFix;
	const R = shape.eye ? shape.eye.r * 1.12 : sp.eyeR * ml;
	return {
		mlen: m.len,
		a: (s) => sample$1(m.w, s),
		top: (s) => sample$1(m.top, s) * hf,
		bot: (s) => sample$1(m.bot, s) * hf,
		headLen: hd.len,
		hw: (h) => hAt(hd.w, h),
		ht: (h) => hAt(hd.top, h) * hf,
		hb: (h) => hAt(hd.bot, h) * hf,
		fin0: shape.fin.s0,
		fin1: shape.fin.s1,
		finW: (u) => sample$1(shape.fin.w, u),
		finAt: 0,
		arms: sp.armRatio.map((r) => r * L),
		armR: shape.arms.bundle * sp.armRFrac,
		eye: shape.eye ? {
			x: shape.eye.x - R * .62,
			y: shape.eye.y * hf,
			z: shape.eye.z,
			R
		} : {
			x: hAt(hd.w, .4),
			y: 0,
			z: hd.len * .4,
			R
		},
		spine: sp.spine > 0 ? shape.spine : 0,
		strip: {
			tipX: shape.arms.tipX,
			baseX: shape.arms.baseX,
			half: shape.arms.bundle * shape.dorsal.k / 2
		}
	};
}
var SKIN_HEAD = `
uniform vec3 uBase; uniform vec3 uBelly; uniform vec3 uSpot; uniform vec3 uShine;
uniform float uDark; uniform float uPale; uniform float uCloud; uniform float uFlicker; uniform float uTime;
uniform float uDense; uniform float uPattern; uniform float uMale; uniform float uParts;
uniform float uPhoto; uniform sampler2D uTexT; uniform sampler2D uTexB; uniform sampler2D uTexS;
uniform vec3 uBg; uniform float uFinLum; uniform float uFinMin; uniform float uWet;
uniform float uArmWhite; uniform vec3 uArmLight; uniform vec3 uArmBrown;
uniform float uDash; uniform vec2 uDashS; uniform float uClear; uniform float uFinOp;
varying vec4 vSkin; varying vec2 vUvT; varying vec2 vUvB; varying vec2 vUvS; varying vec3 vW;
float sqH(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float chromo(vec2 p, float grow, float seed) {
  vec2 i = floor(p), f = fract(p);
  float acc = 0.0;
  for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
    vec2 g = vec2(float(x), float(y));
    float r = sqH(i + g + seed);
    vec2 o = vec2(sqH(i + g + 3.1 + seed), sqH(i + g + 7.7 + seed)) * 0.8 + 0.1;
    float d = length(g + o - f);
    float beat = 1.0 + uFlicker * 0.55 * sin(uTime * (6.0 + 5.0 * r) + r * 40.0);
    float size = (0.07 + 0.2 * grow * (0.55 + 0.9 * r)) * beat;
    acc = max(acc, smoothstep(size, size * 0.55, d));
  }
  return acc;
}
vec3 partColor(float k) {
  return k < 0.5 ? vec3(0.9, 0.2, 0.2) : k < 1.5 ? vec3(0.95, 0.75, 0.2) : k < 2.5 ? vec3(0.2, 0.75, 0.3)
    : k < 3.5 ? vec3(0.2, 0.85, 0.9) : k < 4.5 ? vec3(0.3, 0.4, 0.95) : k < 5.5 ? vec3(0.85, 0.35, 0.9) : vec3(0.95, 0.95, 0.9);
}
float lum(vec3 c) { return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
`;
var SKIN_FRAG = `
#include <color_fragment>
float sqDash = 0.0;
float sqDashR = 0.0;
{
  float part = vSkin.w;
  float side = vSkin.z;               // 胴・頭・ひれ：+1 背中〜−1 お腹。腕・触腕：+1 口の側（吸盤）
  vec2 p = vSkin.xy;                   // 胴長で割った皮の上の長さ（前後・まわり）
  bool limb = part > 1.5 && part < 3.5;
  bool fin = part > 3.5 && part < 4.5;
  float back = limb ? 1.0 - smoothstep(-0.2, 0.7, side) : smoothstep(-0.65, -0.05, side);
  // 流れる雲：濃さはこのまま（濃くしすぎない）。見える時間は Squid.update の色のゆらぎで長くしている
  float band = uCloud * smoothstep(0.2, 0.95, sin(p.x * 13.0 - uTime * 4.5));
  vec3 col;
  float alpha = 1.0;
  if (uPhoto > 0.5) {
    vec3 w = vW;
    // ひれは 1 枚の板の表と裏：上を向いた面は背中の写真、下を向いた面はお腹の写真
    if (fin) w = ((vW.x > 0.0) == gl_FrontFacing) ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 1.0, 0.0);
    col = texture2D(uTexT, vUvT).rgb * w.x + texture2D(uTexB, vUvB).rgb * w.y + texture2D(uTexS, vUvS).rgb * w.z;
    if (part > 2.5 && part < 3.5) col = mix(col, col * 1.25 + 0.04, 0.5);
    // 透けたひれ：写真は暗い背景に透けた膜なので、膜の色と透け具合に分ける（C = a·F + (1 − a)·bg）
    if (fin) {
      float a = clamp((lum(col) - lum(uBg)) / max(0.05, uFinLum - lum(uBg)), uFinMin, 1.0);
      col = clamp((col - (1.0 - a) * uBg) / a, 0.0, 1.0);
      alpha = a;
    }
    // 腕の色を白っぽく（コウイカ：写真の腕は赤橙が強すぎる）。写真の明るさの濃淡は残し、暗い所は薄い茶色に
    if (limb && uArmWhite > 0.0) {
      float l = lum(col);
      vec3 w = mix(uArmBrown, uArmLight, smoothstep(0.04, 0.32, l));
      // 頭から出たすぐの所は半分だけ（つなぎ目に色の段を作らない）
      col = mix(col, w * (0.8 + 0.5 * smoothstep(0.1, 0.5, l)), uArmWhite * mix(0.55, 1.0, smoothstep(0.03, 0.12, p.x)));
    }
    // 腕の口の側は、白っぽい皮と吸盤
    if (limb) {
      vec2 q = vec2(p.x * 70.0, p.y * 70.0);
      float d = length(fract(q) - 0.5);
      float oral = smoothstep(0.35, 0.8, side);
      col = mix(col, mix(uBelly, col, 0.35), oral * 0.8);
      col = mix(col, col * 0.62, oral * smoothstep(0.38, 0.28, d) * 0.7);
    }
    // 色素胞：濃くなると粒が広がってつながり、薄いと縮んで透ける
    // 白く抜けると色素胞は縮むが、流れる雲（band）の通る所だけは少し開いて、斑点がうっすら流れて見える
    float dd = uDark - 0.3;
    float wgt = 0.3 + 0.7 * back;
    float keep = 1.0 - uPale;
    float bandW = band * (1.0 - 0.15 * uPale);
    vec3 deep = uSpot * (0.75 + 0.5 * lum(col));
    col = mix(col, deep, clamp(dd * 1.1 * keep + bandW * 0.55, 0.0, 1.0) * 0.6 * wgt * (1.0 - 0.3 * uPale));
    // 斑点の粒は重い（イカを描く重さの 6 割強）。ふだんの色（斑点の濃さ 0）では、計算しても絵が変わらないので飛ばす
    float spotW = clamp((dd * 1.6 + uFlicker * 0.25) * keep + bandW, 0.0, 1.0) * 0.75 * wgt;
    float spotPale = 0.0;
    if (spotW > 0.0) {
      float grow = clamp(dd * 1.4 * keep + bandW, 0.0, 1.2);
      float spots = max(chromo(p * 30.0 * uDense, grow, 0.0), 0.75 * chromo(p * 62.0 * uDense + 17.0, grow * 0.85, 5.0));
      col = mix(col, uSpot * 0.85, spots * spotW);
      // 白く抜けるときの明るくする混ぜで斑点まで薄まらないよう、雲の斑点の所は白さを少し弱める
      spotPale = spots * bandW * 0.6 * uPale;
    }
    // 白っぽくなる：色素胞が縮んで透け、腹の色の方へ少し寄る。真っ白にはせず、写真の模様は残す
    // 写真の色そのものを少し明るく、少し色を抜く（掛け算なので模様は残る。白へ混ぜると模様が消えて真っ白になる）
    vec3 pl = mix(col, vec3(lum(col)), 0.35) * 1.22 + 0.015;
    col = mix(col, pl, clamp(uPale + max(0.0, -dd) * 0.8, 0.0, 1.0) * (1.0 - clamp(spotPale, 0.0, 1.0)));
  } else {
    col = mix(uBelly, uBase, back);
    float grow = clamp(uDark * (0.35 + 0.65 * back) + 0.1 + band * 0.9, 0.0, 1.25);
    col = mix(col, uSpot * 1.25, clamp((uDark - 0.2) * (1.0 - uPale) + band * 0.6 * (1.0 - 0.15 * uPale), 0.0, 1.0) * 0.6 * (0.25 + 0.75 * back));
    float spots = max(chromo(p * 30.0 * uDense, grow, 0.0), 0.75 * chromo(p * 62.0 * uDense + 17.0, grow * 0.85, 5.0));
    col = mix(col, uSpot * (1.15 - 0.5 * grow), spots * (0.55 + 0.45 * grow) * (0.95 - 0.6 * uPale) * (0.35 + 0.65 * back));
    if (uPattern > 0.5 && part < 1.5) {
      float w = fract(p.x * 19.0 + 0.22 * sin(p.y * 26.0 + p.x * 4.0));
      float line = smoothstep(0.78, 0.86, w) * (1.0 - smoothstep(0.9, 0.98, w)) * smoothstep(0.15, 0.6, side);
      col = mix(col, uShine, line * (0.75 - 0.35 * uDark));
    }
    if (fin) {
      col = mix(col, uShine, smoothstep(0.03, 0.0, abs(p.y - 0.012)) * 0.55);
      alpha = uFinOp;
    }
    if (limb) {
      vec2 q = vec2(p.x * 70.0, p.y * 70.0);
      float d = length(fract(q) - 0.5);
      float suck = smoothstep(0.35, 0.6, side) * smoothstep(0.38, 0.28, d);
      col = mix(col, vec3(0.92, 0.85, 0.82), smoothstep(0.3, 0.7, side) * 0.6);
      col = mix(col, vec3(0.62, 0.5, 0.48), suck * 0.6);
    }
    col = mix(col, mix(col, uBelly, 0.6), uPale * 0.45);
  }
  // アオリのオス：背中の白い点
  if (uMale > 0.5 && part < 0.5) {
    vec2 q = p * vec2(9.0, 7.0);
    float s = sqH(floor(q));
    float d = length(fract(q) - 0.5);
    col = mix(col, vec3(0.95), smoothstep(0.22, 0.14, d) * step(0.55, s) * smoothstep(0.2, 0.6, side) * (1.0 - 0.6 * uDark));
  }
  // アオリ：背中全体に横向き（胴のまわりの向き）に入った、光る短い線（虹色素胞）。前から後ろへ 1cm ほどおきの列に、
  // ずらして並ぶ。線ごとに青白〜黄白で、見る角度で光る線が入れ替わる（光り方は SKIN_DASH）。色素胞が広がると少し隠れる
  if (uDash > 0.0 && part < 0.5) {
    float sb = (p.x - uDashS.x) / uDashS.y;
    float along = smoothstep(0.03, 0.1, sb) * (1.0 - smoothstep(0.85, 0.95, sb));
    float dorsal = smoothstep(0.1, 0.4, side);
    vec2 q = vec2(p.x / 0.03, p.y / 0.062);
    vec2 c = floor(q);
    vec2 f = fract(q);
    float rr = sqH(c + 11.0);
    float cx = 0.5 + (sqH(c + 3.0) - 0.5) * 0.4;
    float cy = 0.5 + (sqH(c + 7.0) - 0.5) * 0.35;
    float hl = 0.24 + 0.18 * sqH(c + 5.0);
    // 線はまん中ほど太く明るく、両端へ細く消える。少し弓なり
    float dy = abs(f.y - cy) / hl;
    float bend = (f.y - cy) * (f.y - cy) * 0.25;
    float w = 0.0013 * (1.0 - 0.7 * dy * dy);
    float aa = fwidth(p.x) * 0.8;
    float dash = smoothstep(w + aa, w * 0.2, abs(f.x - cx - bend) * 0.03) * smoothstep(1.0, 0.5, dy) * step(0.22, rr);
    // 明るさは線ごとにばらつく
    dash *= 0.35 + 0.65 * sqH(c + 23.0);
    sqDash = dash * dorsal * along * uDash * (1.0 - 0.5 * clamp(uDark - 0.3, 0.0, 1.0));
    sqDashR = sqH(c + 17.0);
    // 線の所は下の肌を暗めにする（明るい肌に光を足すと色が飛んで白くなる。光の色をそのまま見せる）
    col = mix(col, col * 0.35, sqDash * 0.7);
  }
  // 透明感：腕と触腕の先だけ透ける（根元から胴長の 14% までは透けず、32% から先がいちばん透ける）。胴・頭・漏斗は透けない。
  // ふち（斜めに見える所）ほど透け、正面は少しだけ。色の濃い所（色素胞の斑点・濃い模様）は透けにくく、白く抜けるともっと透ける。
  // ひれは写真から決めた透け方のまま
  if (limb && uClear > 0.0) {
    vec3 vn = normalize(vNormal);
    float facing = abs(dot(vn, normalize(vViewPosition)));
    float center = 1.0 - (limb ? 0.65 : 0.55) * uClear;
    float edge = 1.0 - 0.92 * uClear;
    float a = mix(edge, center, smoothstep(0.05, 0.85, facing));
    a -= 0.15 * uPale * uClear;
    // 濃い所：本当に濃い斑点（linear の明るさで 0.15 より暗い）と、色が濃くなったとき
    float pig = clamp((0.15 - lum(col)) * 7.0, 0.0, 1.0) + clamp(uDark - 0.45, 0.0, 1.0) * 0.5;
    a = mix(a, 1.0, clamp(pig, 0.0, 1.0) * 0.7);
    alpha = mix(1.0, clamp(a, 0.08, 1.0), smoothstep(0.14, 0.32, p.x));
  }
  // コウイカの甲の針：骨の色
  if (part > 5.5) { col = vec3(0.79, 0.72, 0.6); alpha = 1.0; sqDash = 0.0; }
  if (uParts > 0.5) { col = partColor(part); alpha = 1.0; sqDash = 0.0; }
  diffuseColor.rgb = col;
  diffuseColor.a *= alpha;
}
`;
/** 背中の光る短い線の光り方：見る角度で青・緑・金色と色が変わる。面の向きと見る向きで、光る線が入れ替わる（きらきら） */
var SKIN_DASH = `
#include <emissivemap_fragment>
if (sqDash > 0.0) {
  vec3 dn = normalize(normal);
  vec3 dv = normalize(vViewPosition);
  float glint = 0.5 + 0.5 * sin(dot(dn, vec3(9.0, 7.0, 5.0)) + dot(dv, vec3(6.0, -8.0, 4.0)) + sqDashR * 40.0);
  glint = 0.25 + 0.75 * smoothstep(0.35, 0.95, glint);
  // 色は見る角度で、青 → 緑 → 金色と移り変わる（線ごとにずれる）
  float hue = fract(sqDashR + dot(dv, vec3(0.35, 0.5, 0.25)) + dot(dn, vec3(0.2, -0.3, 0.25)));
  vec3 iri = hue < 0.33 ? mix(vec3(0.35, 0.65, 1.0), vec3(0.3, 1.0, 0.45), hue / 0.33)
    : hue < 0.66 ? mix(vec3(0.3, 1.0, 0.45), vec3(1.0, 0.85, 0.35), (hue - 0.33) / 0.33)
    : mix(vec3(1.0, 0.85, 0.35), vec3(0.35, 0.65, 1.0), (hue - 0.66) / 0.34);
  totalEmissiveRadiance += iri * sqDash * glint * 1.15;
}
`;
/** 色は sRGB で書く（new THREE.Color(r, g, b) は明るさがそのまま linear になり、白っぽくなる） */
var srgb = (c) => new THREE.Color().setRGB(c[0], c[1], c[2], THREE.SRGBColorSpace);
function makeSkinUniforms(sp, look) {
	const bg = look ? srgb(look.shape.bg) : new THREE.Color(0, 0, 0);
	return {
		uBase: { value: srgb(sp.base) },
		uBelly: { value: srgb(sp.belly_) },
		uSpot: { value: srgb(sp.spot) },
		uShine: { value: srgb(sp.shine) },
		uDark: { value: .25 },
		uPale: { value: 0 },
		uCloud: { value: 0 },
		uFlicker: { value: 0 },
		uTime: { value: 0 },
		uDense: { value: sp.spotDense },
		uPattern: { value: sp.pattern },
		uMale: { value: 0 },
		uParts: { value: 0 },
		uPhoto: { value: look ? 1 : 0 },
		uTexT: { value: look?.tex.dorsal ?? null },
		uTexB: { value: look?.tex.ventral ?? null },
		uTexS: { value: look?.tex.side ?? null },
		uBg: { value: bg },
		uFinLum: { value: sp.id === "aori" ? .19 : .22 },
		uFinMin: { value: sp.id === "aori" ? .6 : .68 },
		uWet: { value: 0 },
		uArmWhite: { value: sp.id === "kouika" ? .85 : 0 },
		uArmLight: { value: srgb([
			.9,
			.86,
			.79
		]) },
		uArmBrown: { value: srgb([
			.56,
			.44,
			.32
		]) },
		uDash: { value: sp.id === "aori" ? 1 : 0 },
		uClear: { value: sp.id === "aori" ? .6 : .35 },
		uFinOp: { value: sp.finOpacity },
		uDashS: { value: new THREE.Vector2(0, 1) }
	};
}
function skinMaterial(u, opts) {
	const m = new THREE.MeshStandardMaterial({
		roughness: .38,
		metalness: 0,
		...opts
	});
	m.onBeforeCompile = (sh) => {
		Object.assign(sh.uniforms, u);
		sh.vertexShader = "attribute vec4 aSkin; attribute vec2 aUvT; attribute vec2 aUvB; attribute vec2 aUvS; attribute vec3 aW;\nvarying vec4 vSkin; varying vec2 vUvT; varying vec2 vUvB; varying vec2 vUvS; varying vec3 vW;\n" + sh.vertexShader.replace("#include <begin_vertex>", "#include <begin_vertex>\nvSkin = aSkin; vUvT = aUvT; vUvB = aUvB; vUvS = aUvS; vW = aW;");
		sh.fragmentShader = SKIN_HEAD + sh.fragmentShader.replace("#include <color_fragment>", SKIN_FRAG).replace("#include <emissivemap_fragment>", SKIN_DASH);
	};
	m.customProgramCacheKey = () => "squid-skin2";
	return m;
}
/** 両目で 1 つの材質。aEye = (目の球の中の位置, 左右 +1 / −1) */
function eyeMaterial(sp, look, pupil, parts) {
	const m = new THREE.MeshStandardMaterial({
		roughness: .06,
		metalness: 0,
		color: 16777215
	});
	const iris = srgb(sp.pupil === "w" ? [
		.72,
		.6,
		.3
	] : [
		.1,
		.13,
		.17
	]);
	const ring = srgb(sp.pupil === "w" ? [
		.9,
		.78,
		.45
	] : [
		.25,
		.85,
		.75
	]);
	const lid = srgb(sp.base);
	const e = look?.shape.eye;
	const S = look?.shape.side;
	const eyeUv = e && S ? new THREE.Vector4(e.px[0] / S.w, e.px[1] / S.h, e.px[2] / .85 / S.w, e.px[2] / .85 / S.h) : new THREE.Vector4();
	m.onBeforeCompile = (sh) => {
		sh.uniforms.uPupil = pupil;
		sh.uniforms.uParts = parts;
		sh.uniforms.uIris = { value: iris };
		sh.uniforms.uRing = { value: ring };
		sh.uniforms.uLid = { value: lid };
		sh.uniforms.uW = { value: sp.pupil === "w" ? 1 : 0 };
		sh.uniforms.uPhoto = { value: look ? 1 : 0 };
		sh.uniforms.uTexS = { value: look?.tex.side ?? null };
		sh.uniforms.uEye = { value: eyeUv };
		sh.vertexShader = "attribute vec4 aEye;\nvarying vec3 vEyeP; varying float vMirror;\n" + sh.vertexShader.replace("#include <begin_vertex>", "#include <begin_vertex>\nvEyeP = aEye.xyz; vMirror = aEye.w;");
		sh.fragmentShader = "uniform float uPupil; uniform float uParts; uniform vec3 uIris; uniform vec3 uRing; uniform vec3 uLid; uniform float uW;\nuniform float uPhoto; uniform sampler2D uTexS; uniform vec4 uEye;\nvarying vec3 vEyeP; varying float vMirror;\n" + sh.fragmentShader.replace("#include <color_fragment>", `#include <color_fragment>
        {
          vec3 d = normalize(vEyeP);
          float rr = length(d.xy);
          vec3 col;
          if (uPhoto > 0.5) {
            vec2 uv = vec2(uEye.x + vMirror * d.x * uEye.z, 1.0 - (uEye.y - d.y * uEye.w));
            col = texture2D(uTexS, uv).rgb;
            // 丸い瞳は、開くと写真の瞳より大きく黒くなる（コウイカの W の瞳は写真のまま）
            if (uW < 0.5) col = mix(col, vec3(0.005), smoothstep(0.03, 0.0, rr - (0.18 + 0.3 * uPupil)) * smoothstep(0.55, 0.75, uPupil));
          } else {
            col = mix(uIris * 0.75, uIris * 1.2, smoothstep(0.15, 0.6, rr));
            col = mix(col, uRing, smoothstep(0.52, 0.62, rr) * (1.0 - smoothstep(0.72, 0.8, rr)) * (0.6 + 0.4 * smoothstep(-0.5, 0.5, d.y)));
            float pup;
            if (uW > 0.5) {
              vec2 q = d.xy / 0.62;
              float yc = 0.11 * cos(q.x * 12.566) - 0.02;
              float t = 0.035 + 0.09 * uPupil;
              pup = smoothstep(t + 0.02, t, abs(q.y - yc)) * smoothstep(0.52, 0.46, abs(q.x));
            } else {
              float r = 0.15 + 0.2 * uPupil;
              pup = smoothstep(r + 0.03, r, length(d.xy * vec2(0.9, 1.0)));
            }
            col = mix(col, vec3(0.01), pup);
            col = mix(uLid, col, smoothstep(0.5, 0.6, d.z));
          }
          if (uParts > 0.5) col = vec3(0.1);
          diffuseColor.rgb = col;
        }`);
	};
	m.customProgramCacheKey = () => "squid-eye3-" + sp.pupil + (look ? "-photo" : "");
	return m;
}
/** flip で表と裏を入れ替える（行が +Z へ進む筒は、そのままだと内側が表になる） */
function gridIndex(rows, cols, flip = false) {
	const idx = [];
	for (let i = 0; i < rows - 1; i++) for (let j = 0; j < cols - 1; j++) {
		const a = i * cols + j;
		const b = a + cols;
		if (flip) idx.push(a, a + 1, b, a + 1, b + 1, b);
		else idx.push(a, b, a + 1, a + 1, b, b + 1);
	}
	return idx;
}
function gridGeometry(rows, cols, flip = false) {
	const g = new THREE.BufferGeometry();
	const n = rows * cols;
	g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(n * 3), 3).setUsage(THREE.DynamicDrawUsage));
	g.setAttribute("normal", new THREE.BufferAttribute(new Float32Array(n * 3), 3).setUsage(THREE.DynamicDrawUsage));
	g.setAttribute("aSkin", new THREE.BufferAttribute(new Float32Array(n * 4), 4));
	addPhotoAttrs(g);
	g.setIndex(gridIndex(rows, cols, flip));
	return g;
}
function addPhotoAttrs(g) {
	const n = g.attributes.position.count;
	g.setAttribute("aUvT", new THREE.BufferAttribute(new Float32Array(n * 2), 2));
	g.setAttribute("aUvB", new THREE.BufferAttribute(new Float32Array(n * 2), 2));
	g.setAttribute("aUvS", new THREE.BufferAttribute(new Float32Array(n * 2), 2));
	g.setAttribute("aW", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
}
/** 休んでいる形の位置と法線から、背中・お腹・横の写真のどこを貼るかを決める（胴の座標。m は頭など胴の座標へ直す行列） */
function bakePhoto(g, shape, hf, m, finFlag = false) {
	const pos = g.attributes.position;
	const nrm = g.attributes.normal;
	const T = g.attributes.aUvT.array;
	const Bv = g.attributes.aUvB.array;
	const S = g.attributes.aUvS.array;
	const W = g.attributes.aW.array;
	const P = new THREE.Vector3();
	const N = new THREE.Vector3();
	const nm = m ? new THREE.Matrix3().getNormalMatrix(m) : null;
	const { dorsal: D, ventral: V, side: Sd } = shape;
	for (let i = 0; i < pos.count; i++) {
		P.fromBufferAttribute(pos, i);
		N.fromBufferAttribute(nrm, i);
		if (m) P.applyMatrix4(m);
		if (nm) N.applyMatrix3(nm).normalize();
		T[i * 2] = (D.x0 - P.z * D.k) / D.w;
		T[i * 2 + 1] = 1 - (D.yc + P.x * D.k) / D.h;
		Bv[i * 2] = (V.x0 - P.z * V.k) / V.w;
		Bv[i * 2 + 1] = 1 - (V.yc + P.x * V.k) / V.h;
		S[i * 2] = (Sd.x0 - P.z * Sd.k) / Sd.w;
		S[i * 2 + 1] = 1 - (Sd.yc - P.y / hf * Sd.k) / Sd.h;
		if (finFlag) {
			W[i * 3] = N.y >= 0 ? 1 : -1;
			W[i * 3 + 1] = 0;
			W[i * 3 + 2] = 0;
			continue;
		}
		const t = Math.max(0, N.y) ** 3;
		const b = Math.max(0, -N.y) ** 3;
		const s = Math.abs(N.x) ** 3 * 1.1;
		const sum = t + b + s || 1;
		W[i * 3] = t / sum;
		W[i * 3 + 1] = b / sum;
		W[i * 3 + 2] = s / sum;
	}
	for (const k of [
		"aUvT",
		"aUvB",
		"aUvS",
		"aW"
	]) g.attributes[k].needsUpdate = true;
}
/** three.js の computeVertexNormals と同じ計算（面の法線を足して長さ 1 に。結果は同じ）を、配列のまま速く（2.5 倍ほど） */
function fastNormals(g) {
	const P = g.attributes.position.array;
	const N = g.attributes.normal.array;
	const I = g.index.array;
	N.fill(0);
	for (let t = 0; t < I.length; t += 3) {
		const a = I[t] * 3;
		const b = I[t + 1] * 3;
		const c = I[t + 2] * 3;
		const cbx = P[c] - P[b];
		const cby = P[c + 1] - P[b + 1];
		const cbz = P[c + 2] - P[b + 2];
		const abx = P[a] - P[b];
		const aby = P[a + 1] - P[b + 1];
		const abz = P[a + 2] - P[b + 2];
		const nx = cby * abz - cbz * aby;
		const ny = cbz * abx - cbx * abz;
		const nz = cbx * aby - cby * abx;
		N[a] += nx;
		N[a + 1] += ny;
		N[a + 2] += nz;
		N[b] += nx;
		N[b + 1] += ny;
		N[b + 2] += nz;
		N[c] += nx;
		N[c + 1] += ny;
		N[c + 2] += nz;
	}
	for (let i = 0; i < N.length; i += 3) {
		const l = 1 / (Math.sqrt(N[i] * N[i] + N[i + 1] * N[i + 1] + N[i + 2] * N[i + 2]) || 1);
		N[i] *= l;
		N[i + 1] *= l;
		N[i + 2] *= l;
	}
	g.attributes.normal.needsUpdate = true;
}
/** 中心の線に沿った筒（腕・触腕）。点の数 n、まわり m。先は 0 の太さで閉じる */
var Tube = class {
	geo;
	n;
	m;
	T = new THREE.Vector3();
	N = new THREE.Vector3();
	B = new THREE.Vector3();
	D = new THREE.Vector3();
	/** まわりの角ごとの角・cos・sin（毎回同じなので 1 回だけ） */
	ang;
	cos;
	sin;
	constructor(n, m) {
		this.n = n;
		this.m = m;
		this.geo = gridGeometry(n, m + 1, true);
		this.ang = new Float64Array(m + 1);
		this.cos = new Float64Array(m + 1);
		this.sin = new Float64Array(m + 1);
		for (let j = 0; j <= m; j++) {
			const a = j / m * Math.PI * 2;
			this.ang[j] = a;
			this.cos[j] = Math.cos(a);
			this.sin[j] = Math.sin(a);
		}
	}
	/** 写真の貼り方：sig（根元 0〜先 1）と、まわりの角（0 = 口の側）から、背中の写真の uv */
	setPhoto(uv) {
		const T = this.geo.attributes.aUvT.array;
		const W = this.geo.attributes.aW.array;
		for (let i = 0; i < this.n; i++) for (let j = 0; j <= this.m; j++) {
			const q = i * (this.m + 1) + j;
			const [u, v] = uv(i / (this.n - 1), j / this.m * Math.PI * 2);
			T[q * 2] = u;
			T[q * 2 + 1] = v;
			W[q * 3] = 1;
		}
		this.geo.attributes.aUvT.needsUpdate = true;
		this.geo.attributes.aW.needsUpdate = true;
	}
	/** 点 pts、太さ r(i)、平たさ flat(i)（口の側の向きに縮める）、最初の口の側の向き oral */
	set(pts, r, flat, oral, part, ml) {
		const { n, m, T, N, B, D } = this;
		const pos = this.geo.attributes.position.array;
		const nrm = this.geo.attributes.normal.array;
		const skin = this.geo.attributes.aSkin.array;
		N.copy(oral);
		let along = 0;
		for (let i = 0; i < n; i++) {
			const a = pts[Math.max(0, i - 1)];
			const b = pts[Math.min(n - 1, i + 1)];
			T.subVectors(b, a);
			if (T.lengthSq() < 1e-12) T.set(0, 0, 1);
			T.normalize();
			N.addScaledVector(T, -N.dot(T));
			if (N.lengthSq() < 1e-10) N.set(1, 0, 0).addScaledVector(T, -T.x);
			N.normalize();
			B.crossVectors(T, N);
			if (i > 0) along += pts[i].distanceTo(pts[i - 1]);
			const ri = r(i);
			const fl = flat(i);
			for (let j = 0; j <= m; j++) {
				const ang = this.ang[j];
				const c = this.cos[j];
				const s = this.sin[j];
				D.copy(N).multiplyScalar(c * fl).addScaledVector(B, s);
				const k = (i * (m + 1) + j) * 3;
				pos[k] = pts[i].x + D.x * ri;
				pos[k + 1] = pts[i].y + D.y * ri;
				pos[k + 2] = pts[i].z + D.z * ri;
				D.copy(N).multiplyScalar(c).addScaledVector(B, s * fl).normalize();
				nrm[k] = D.x;
				nrm[k + 1] = D.y;
				nrm[k + 2] = D.z;
				const q = (i * (m + 1) + j) * 4;
				skin[q] = along / ml;
				skin[q + 1] = ang * Math.max(ri, .002) / ml;
				skin[q + 2] = c;
				skin[q + 3] = part;
			}
		}
		this.geo.attributes.position.needsUpdate = true;
		this.geo.attributes.normal.needsUpdate = true;
		this.geo.attributes.aSkin.needsUpdate = true;
	}
};
/** 胴の格子の周りの角：お腹の真ん中（−π/2）から始めて、継ぎ目をお腹に隠す */
var phiAt = (j, na) => -Math.PI / 2 + j / na * Math.PI * 2;
/** 粒の絵を 1 枚にまとめた絵（4 × 2 マス、1 マス 128px）。0 = ぼかした丸（水しぶき・砂）、1〜4 = 墨のもや、5・6 = 流れて伸びた墨の筋。
*  白で描き、色は粒ごとに付ける。作るのに 0.15 秒ほどかかるので、SquidFx を作るとき（読み込みのとき）に作っておく */
var TILE = {
	soft: 0,
	ink: 1,
	streak: 5
};
var puffAtlas = (() => {
	let t = null;
	return () => {
		if (t) return t;
		const S = 128;
		const c = document.createElement("canvas");
		c.width = 512;
		c.height = 256;
		const g = c.getContext("2d");
		const img = g.createImageData(512, 256);
		const put = (k, alpha) => {
			const ox = k % 4 * S;
			const oy = (1 - Math.floor(k / 4)) * S;
			for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
				const a = Math.max(0, Math.min(1, alpha(x / S * 2 - 1, y / S * 2 - 1, x / S, y / S)));
				const i = ((oy + y) * S * 4 + ox + x) * 4;
				img.data[i] = img.data[i + 1] = img.data[i + 2] = 255;
				img.data[i + 3] = Math.round(a * 255);
			}
		};
		const soft = (u, v) => {
			const d = Math.hypot(u, v);
			return d < .45 ? 1 - .3 * d / .45 : .7 * Math.max(0, 1 - (d - .45) / .55);
		};
		put(0, soft);
		put(7, soft);
		for (let k = 0; k < 6; k++) {
			const seed = 17.3 + k * 41.7;
			const hash = (x, y) => {
				const h = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453;
				return h - Math.floor(h);
			};
			const vn = (x, y) => {
				const ix = Math.floor(x);
				const iy = Math.floor(y);
				const fx = x - ix;
				const fy = y - iy;
				const sx = fx * fx * (3 - 2 * fx);
				const sy = fy * fy * (3 - 2 * fy);
				const a = hash(ix, iy) + (hash(ix + 1, iy) - hash(ix, iy)) * sx;
				return a + (hash(ix, iy + 1) + (hash(ix + 1, iy + 1) - hash(ix, iy + 1)) * sx - a) * sy;
			};
			const fbm = (x, y) => {
				let s = 0;
				let amp = .5;
				let f = 1;
				for (let o = 0; o < 4; o++) {
					s += amp * vn(x * f, y * f);
					amp *= .5;
					f *= 2.03;
				}
				return s / .94;
			};
			const streak = k >= 4;
			put(1 + k, (u, v, x, y) => {
				const nx = streak ? x * 1.2 : x * 2.2;
				const ny = streak ? y * 6 : y * 2.2;
				const wx = fbm(nx + 3.1, ny + 1.7) * 1.6;
				const wy = fbm(nx + 8.3, ny + 4.2) * 1.6;
				const n = fbm(nx + wx, ny + wy);
				const fine = fbm(nx * 2.3 + 11, ny * 2.3 + 5);
				return (1 - smooth$1(.2, 1, (streak ? Math.hypot(u * .85, v * 2.4) : Math.hypot(u, v)) + (n - .5) * .7)) * (.28 + .72 * smooth$1(.28, .75, n * .85 + fine * .15));
			});
		}
		g.putImageData(img, 0, 0);
		t = new THREE.CanvasTexture(c);
		t.colorSpace = THREE.SRGBColorSpace;
		return t;
	};
})();
/** 粒をまとめて 1 回で描く板（カメラの方を向く）。粒ごとに位置・大きさ・回り・色・濃さ・絵のマス */
var PUFF_VS = `
attribute vec3 aPos;
attribute float aSize;
attribute float aRot;
attribute vec3 aCol;
attribute float aAlpha;
attribute float aTile;
varying vec2 vUv;
varying vec3 vCol;
varying float vAlpha;
#include <fog_pars_vertex>
void main() {
  vec4 mvPosition = modelViewMatrix * vec4(aPos, 1.0);
  float c = cos(aRot);
  float s = sin(aRot);
  vec2 q = position.xy;
  mvPosition.xy += vec2(c * q.x - s * q.y, s * q.x + c * q.y) * aSize;
  gl_Position = projectionMatrix * mvPosition;
  vUv = (vec2(mod(aTile, 4.0), floor(aTile / 4.0)) + uv) / vec2(4.0, 2.0);
  vCol = aCol;
  // カメラのすぐ前の粒は薄くする（VR で頭が墨の雲に入っても、大きな板が画面いっぱいに何枚も重ならない）
  float d = -mvPosition.z;
  vAlpha = aAlpha * smoothstep(0.06, 0.06 + aSize * 0.9, d);
  #include <fog_vertex>
}`;
var PUFF_FS = `
uniform sampler2D map;
varying vec2 vUv;
varying vec3 vCol;
varying float vAlpha;
#include <common>
#include <fog_pars_fragment>
void main() {
  vec4 t = texture2D(map, vUv);
  float a = t.a * vAlpha;
  if (a < 0.003) discard;
  gl_FragColor = vec4(vCol * t.rgb, a);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
}`;
/** 一度に出せる粒の数（超えたら古いものから消す） */
var MAX_PUFFS = 700;
/** 堤防の跡の数（墨・濡れた跡それぞれ） */
var MAX_STAINS = 300;
/** 墨の調整（イカを見るページのつまみで変える。掛ける数）。水の中の墨は、見るページでつまみを合わせた値（2026-11-11） */
var INK_TUNE = {
	/** 水の中の墨：粒の数・大きさ・広がり（大きくなる分）・消えるまでの長さ・濃さ・吐く勢い */
	waterAmount: 2.75,
	waterSize: 3,
	waterSpread: 3,
	waterLife: 1.05,
	waterDark: .56,
	waterSpeed: 1.7,
	/** 水の外で噴くとき：墨の粒の割合（1 で半分が墨）・噴く強さ・粒の大きさ・何回に 1 回墨を混ぜるか（0 で混ぜない） */
	airInk: 1,
	airPower: 1,
	airSize: 1,
	airEvery: 3,
	/** 堤防（陸に置いた所）に落ちた墨の跡：大きさ・濃さ・残る秒数（濡れた跡はその半分で乾く） */
	stainSize: 1,
	stainDark: 1,
	stainLife: 30
};
({ ...INK_TUNE });
/** 墨の跡の形：にじんだ丸と、まわりに飛んだ小さな粒 */
var stainTex = (() => {
	let t = null;
	return () => {
		if (t) return t;
		const S = 128;
		const c = document.createElement("canvas");
		c.width = c.height = S;
		const g = c.getContext("2d");
		let seed = 5;
		const rnd = () => (seed = seed * 16807 % 2147483647) / 2147483647;
		const blob = (x, y, r, a) => {
			const gr = g.createRadialGradient(x, y, 0, x, y, r);
			gr.addColorStop(0, "rgba(255,255,255," + a + ")");
			gr.addColorStop(.7, "rgba(255,255,255," + a * .9 + ")");
			gr.addColorStop(1, "rgba(255,255,255,0)");
			g.fillStyle = gr;
			g.beginPath();
			g.arc(x, y, r, 0, Math.PI * 2);
			g.fill();
		};
		for (let i = 0; i < 9; i++) blob(64 + (rnd() - .5) * 30, 64 + (rnd() - .5) * 30, 14 + rnd() * 16, .9);
		for (let i = 0; i < 14; i++) {
			const a = rnd() * Math.PI * 2;
			const d = 34 + rnd() * 24;
			blob(64 + Math.cos(a) * d, 64 + Math.sin(a) * d, 2 + rnd() * 4, .85);
		}
		t = new THREE.CanvasTexture(c);
		return t;
	};
})();
/** 堤防の跡を、墨と濡れた跡それぞれ 1 回で描く（板を並べた InstancedMesh。跡ごとの濃さは aAlpha） */
function stainLayer(wet) {
	const g = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
	const alpha = new THREE.InstancedBufferAttribute(new Float32Array(MAX_STAINS), 1);
	alpha.setUsage(THREE.DynamicDrawUsage);
	g.setAttribute("aAlpha", alpha);
	const m = new THREE.MeshStandardMaterial({
		color: wet ? new THREE.Color().setRGB(.32, .32, .31, THREE.SRGBColorSpace) : new THREE.Color().setRGB(.02, .018, .022, THREE.SRGBColorSpace),
		map: stainTex(),
		transparent: true,
		roughness: wet ? .6 : .12,
		envMapIntensity: wet ? .3 : 1,
		metalness: 0,
		depthWrite: false,
		polygonOffset: true,
		polygonOffsetFactor: -2,
		polygonOffsetUnits: -2
	});
	m.onBeforeCompile = (sh) => {
		sh.vertexShader = "attribute float aAlpha;\nvarying float vStainA;\n" + sh.vertexShader.replace("#include <begin_vertex>", "#include <begin_vertex>\nvStainA = aAlpha;");
		sh.fragmentShader = "varying float vStainA;\n" + sh.fragmentShader.replace("#include <color_fragment>", "#include <color_fragment>\ndiffuseColor.a *= vStainA;");
	};
	m.customProgramCacheKey = () => "squid-stain";
	const mesh = new THREE.InstancedMesh(g, m, MAX_STAINS);
	mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
	mesh.count = 0;
	mesh.frustumCulled = false;
	mesh.renderOrder = wet ? 3 : 4;
	return {
		mesh,
		alpha
	};
}
/** 値のノイズを 4 段重ねたもの（0〜1）。seed で模様が変わる */
function fbmNoise(seed) {
	const hash = (x, y) => {
		const h = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453;
		return h - Math.floor(h);
	};
	const vn = (x, y) => {
		const ix = Math.floor(x);
		const iy = Math.floor(y);
		const fx = x - ix;
		const fy = y - iy;
		const sx = fx * fx * (3 - 2 * fx);
		const sy = fy * fy * (3 - 2 * fy);
		const a = hash(ix, iy) + (hash(ix + 1, iy) - hash(ix, iy)) * sx;
		return a + (hash(ix, iy + 1) + (hash(ix + 1, iy + 1) - hash(ix, iy + 1)) * sx - a) * sy;
	};
	return (x, y) => {
		let s = 0;
		let amp = .5;
		let f = 1;
		for (let o = 0; o < 4; o++) {
			s += amp * vn(x * f, y * f);
			amp *= .5;
			f *= 2.03;
		}
		return s / .94;
	};
}
/** 堤防に描く墨の判子（4 種類、128px）：縁がノイズで大きく崩れたしみ。中も濃いところと薄いところがある */
var inkStamps = (() => {
	let arr = null;
	return () => {
		if (arr) return arr;
		arr = [];
		const S = 128;
		for (let k = 0; k < 4; k++) {
			const fbm = fbmNoise(5.1 + k * 13.7);
			const c = document.createElement("canvas");
			c.width = c.height = S;
			const g = c.getContext("2d");
			const img = g.createImageData(S, S);
			for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
				const u = x / S * 2 - 1;
				const v = y / S * 2 - 1;
				const n = fbm(x / S * 3 + 1.3, y / S * 3 + 7.1);
				const m = fbm(x / S * 7 + 4.2, y / S * 7 + 2.6);
				const a = (1 - smooth$1(.58, .72, Math.hypot(u, v) + (n - .5) * 1.1)) * (.3 + .7 * smooth$1(.35, .65, m * .6 + n * .4));
				const i = (y * S + x) * 4;
				img.data[i] = 14;
				img.data[i + 1] = 12;
				img.data[i + 2] = 14;
				img.data[i + 3] = Math.round(Math.max(0, Math.min(1, a)) * 255);
			}
			g.putImageData(img, 0, 0);
			arr.push(c);
		}
		return arr;
	};
})();
/** 落ちた墨が広がる段（秒、大きさ、濃さ）：まず小さく濃く、1〜2 秒かけて薄くにじみ広がる */
var SPLAT_STAGES = [
	[
		0,
		.7,
		.85
	],
	[
		.15,
		.9,
		.4
	],
	[
		.5,
		1.05,
		.2
	],
	[
		1.5,
		1.2,
		.1
	]
];
/** 堤防の墨：地面に敷いた 1 枚の絵（2m 四方、768px）へ、落ちた墨を判子で描き重ねる。
*  重なるとひとつながりの跡になり、重なった所ほど濃く、縁は薄く崩れる。落ちた墨はしばらくにじんで広がり、
*  残る秒数をかけて少しずつ薄れる。絵を送るのは変わったときだけ（多くても 1 秒に 20 回） */
var InkGround = class InkGround {
	static SIZE = 2;
	static PX = 768;
	mesh;
	g;
	tex;
	cx = 0;
	cz = 0;
	placed = false;
	splats = [];
	dirty = false;
	upT = 0;
	fadeT = 0;
	constructor() {
		const c = document.createElement("canvas");
		c.width = c.height = InkGround.PX;
		this.g = c.getContext("2d");
		this.tex = new THREE.CanvasTexture(c);
		this.tex.colorSpace = THREE.SRGBColorSpace;
		this.tex.anisotropy = 4;
		const m = new THREE.MeshStandardMaterial({
			map: this.tex,
			transparent: true,
			roughness: .2,
			metalness: 0,
			depthWrite: false,
			polygonOffset: true,
			polygonOffsetFactor: -2,
			polygonOffsetUnits: -2
		});
		this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(InkGround.SIZE, InkGround.SIZE).rotateX(-Math.PI / 2), m);
		this.mesh.renderOrder = 4;
		this.mesh.visible = false;
		inkStamps();
	}
	/** 墨の粒が落ちた：飛んできた向きへ伸びたしみと、まわりに小さなしぶき */
	drop(at, size, vx, vz) {
		const sp = Math.hypot(vx, vz);
		this.add(at, size * 2.4 * INK_TUNE.stainSize, sp > 1e-4 ? Math.atan2(vz, vx) : Math.random() * Math.PI * 2, 1 + Math.min(1.4, sp * .6));
		for (let i = 0, n = Math.floor(Math.random() * 3); i < n; i++) {
			const a = Math.atan2(vz, vx) + (Math.random() - .5) * 1.2;
			const d = size * (2 + Math.random() * 3);
			this.add(at.clone().add(new THREE.Vector3(Math.cos(a) * d, 0, Math.sin(a) * d)), size * (.4 + Math.random() * .5) * INK_TUNE.stainSize, a, 1);
		}
	}
	/** 漏斗の口から地面へ垂れた墨のたまり */
	pool(at, r) {
		this.add(at, r * INK_TUNE.stainSize, Math.random() * Math.PI * 2, 1.1 + Math.random() * .4);
	}
	add(at, r, ang, el) {
		if (!this.placed) {
			this.placed = true;
			this.cx = at.x;
			this.cz = at.z;
			this.mesh.position.set(at.x, at.y + 6e-4, at.z);
			this.mesh.visible = true;
		}
		this.splats.push({
			x: at.x,
			z: at.z,
			r,
			ang,
			el,
			age: 0,
			k: Math.floor(Math.random() * 4),
			stage: 0
		});
		this.fadeT = 0;
	}
	update(dt) {
		if (!this.placed) return;
		const g = this.g;
		const P = InkGround.PX;
		const stamps = inkStamps();
		for (let i = this.splats.length - 1; i >= 0; i--) {
			const s = this.splats[i];
			s.age += dt;
			while (s.stage < SPLAT_STAGES.length && s.age >= SPLAT_STAGES[s.stage][0]) {
				const [, sc, a] = SPLAT_STAGES[s.stage++];
				const R = s.r * sc / InkGround.SIZE * P;
				g.save();
				g.translate(((s.x - this.cx) / InkGround.SIZE + .5) * P, ((s.z - this.cz) / InkGround.SIZE + .5) * P);
				g.rotate(s.ang + s.stage * .4);
				g.scale(s.el, 1);
				g.globalAlpha = Math.min(1, a * INK_TUNE.stainDark);
				g.drawImage(stamps[(s.k + s.stage) % 4], -R, -R, 2 * R, 2 * R);
				g.restore();
				this.dirty = true;
			}
			if (s.stage >= SPLAT_STAGES.length) this.splats.splice(i, 1);
		}
		this.fadeT += dt;
		const life = Math.max(1, INK_TUNE.stainLife);
		this.mesh.material.opacity = 1 - smooth$1(.7, 1, this.fadeT / life);
		if (this.fadeT >= life) {
			this.clear();
			return;
		}
		this.upT -= dt;
		if (this.dirty && this.upT <= 0) {
			this.tex.needsUpdate = true;
			this.dirty = false;
			this.upT = 1 / 20;
		}
	}
	dispose() {
		this.tex.dispose();
		this.mesh.material.dispose();
		this.mesh.geometry.dispose();
	}
	clear() {
		this.g.clearRect(0, 0, InkGround.PX, InkGround.PX);
		this.splats = [];
		this.placed = false;
		this.mesh.visible = false;
		this.tex.needsUpdate = true;
	}
};
/** 墨・水しぶき・砂けむり（ワールドの中に置く）。粒はすべて 1 回で、堤防の跡は墨と濡れた跡で 2 回で描く */
var SquidFx = class {
	group = new THREE.Group();
	puffs = [];
	/** 地面の高さ（水しぶきと砂はそこで止まる） */
	floorY = -1e9;
	/** 地面が堤防（落ちた墨が跡になって残る） */
	hard = false;
	stains = [];
	time = 0;
	mesh;
	geo;
	at;
	view = new THREE.Matrix4();
	ground = new InkGround();
	wetStains = stainLayer(true);
	constructor() {
		const geo = new THREE.InstancedBufferGeometry();
		const quad = new THREE.PlaneGeometry(1, 1);
		geo.index = quad.index;
		geo.setAttribute("position", quad.attributes.position);
		geo.setAttribute("uv", quad.attributes.uv);
		const attr = (n) => {
			const a = new THREE.InstancedBufferAttribute(new Float32Array(MAX_PUFFS * n), n);
			a.setUsage(THREE.DynamicDrawUsage);
			return a;
		};
		this.at = {
			aPos: attr(3),
			aSize: attr(1),
			aRot: attr(1),
			aCol: attr(3),
			aAlpha: attr(1),
			aTile: attr(1)
		};
		for (const [k, a] of Object.entries(this.at)) geo.setAttribute(k, a);
		geo.instanceCount = 0;
		this.geo = geo;
		const mat = new THREE.ShaderMaterial({
			uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { map: { value: null } }]),
			vertexShader: PUFF_VS,
			fragmentShader: PUFF_FS,
			transparent: true,
			depthWrite: false,
			fog: true
		});
		mat.uniforms.map.value = puffAtlas();
		this.mesh = new THREE.Mesh(geo, mat);
		this.mesh.frustumCulled = false;
		this.mesh.renderOrder = 5;
		this.mesh.onBeforeRender = (_r, _s, camera) => this.view.copy(camera.matrixWorldInverse);
		this.group.add(this.mesh, this.ground.mesh, this.wetStains.mesh);
	}
	/** 水の中の墨。spread 0 = 粘りのある塊（アオリ：イカほどの大きさの濃い塊が、細い筋を引いてその場に残る）、
	*  1 = 広がる雲（コウイカ：薄めの雲が大きくふくらんで広がる）。
	*  漏斗から吐いた順に 0.3 秒ほどかけて出し（先に出たものほど遠くへ）、流れの筋になる。粒は 3 種類：
	*  濃い芯・まわりの雲・細い筋。水に止められてすぐ遅くなり、ゆっくり渦を巻き、少し沈み、ふくらみながら薄れる */
	ink(at, dir, size, spread) {
		const T = INK_TUNE;
		const blob = spread < .5;
		const n = Math.max(3, Math.round((blob ? 30 : 42) * T.waterAmount));
		const d = dir.clone().normalize();
		size *= T.waterSize;
		const speed = (blob ? .3 : .6) * T.waterSpeed;
		const r = Math.random;
		for (let i = 0; i < n; i++) {
			const u = i / Math.max(1, n - 1);
			const k = r();
			const core = k < (blob ? .3 : .18);
			const wisp = !core && k > (blob ? .65 : .72);
			const v = d.clone().multiplyScalar(speed * (.12 + .88 * (1 - u)) * (.75 + r() * .5));
			const jit = (blob ? .05 : .12) * (wisp ? 2 : 1);
			v.x += (r() - .5) * jit;
			v.y += (r() - .5) * jit;
			v.z += (r() - .5) * jit;
			const tone = core ? [
				.035,
				.026,
				.022
			] : wisp ? [
				.17,
				.115,
				.075
			] : [
				.09,
				.062,
				.045
			];
			const vary = .75 + r() * .5;
			const c = new THREE.Color().setRGB(tone[0] * vary, tone[1] * vary, tone[2] * vary, THREE.SRGBColorSpace);
			const alpha = Math.min(1, (core ? .78 : wisp ? .5 : blob ? .5 : .48) * T.waterDark);
			const s0 = blob ? size * (core ? .3 + r() * .15 : wisp ? .2 + r() * .15 : .35 + r() * .25) : size * (core ? .35 + r() * .15 : wisp ? .3 + r() * .2 : .45 + r() * .35);
			const g = blob ? core ? 1.5 : wisp ? 3 : 2.2 : core ? 3 : wisp ? 6 : 5;
			const life = (blob ? 10 + r() * 5 : 7 + r() * 4) * (wisp ? .75 : 1) * T.waterLife;
			const tile = wisp ? TILE.streak + Math.floor(r() * 2) : TILE.ink + Math.floor(r() * 4);
			const p = this.add(at, v, c, alpha, s0, s0 * (1 + (g - 1) * T.waterSpread), life, .01, 2.4, tile);
			p.age = -u * .3;
			p.grow = blob ? 1.8 : 2.6;
			p.spin = (r() - .5) * (wisp ? .25 : .6);
			p.swirl = (blob ? .035 : .07) * (.6 + r() * .8);
			p.ph = r() * 100;
			p.fadeIn = .06 + r() * .08;
			p.fadeOut = blob ? .45 : .3;
			p.rot = r() * Math.PI * 2;
			p.p.addScaledVector(d, (r() - .3) * size * .15);
		}
	}
	/** 水の外で漏斗から噴く水（と墨） */
	squirt(at, dir, inky, power = 1) {
		const T = INK_TUNE;
		at = at.clone();
		at.y = Math.max(at.y, this.floorY + .008);
		if (inky && this.hard && at.y < this.floorY + .03) this.ground.pool(new THREE.Vector3(at.x, this.floorY, at.z).addScaledVector(dir, .03), .06);
		for (let i = 0; i < 18; i++) {
			const ink = inky && Math.random() < .5 * T.airInk;
			const v = dir.clone().multiplyScalar((1.2 + Math.random() * 1.4) * power * T.airPower * (ink ? .45 : 1));
			const j = ink ? .4 : 1;
			v.x += (Math.random() - .5) * .35 * j;
			v.y += (Math.random() - .5) * .3 * j;
			v.z += (Math.random() - .5) * .35 * j;
			const c = ink ? new THREE.Color(.04, .03, .04) : new THREE.Color(.85, .92, 1);
			const k = (ink ? T.airSize : 1) * (.7 + Math.random() * .6);
			const p = this.add(at, v, c, ink ? .9 : .55, .006 * k, .012 * k, .9, 9.8, .2);
			p.stain = ink ? "ink" : "wet";
		}
	}
	/** 水面を割ったときの水しぶき */
	splash(at, power = 1) {
		for (let i = 0; i < 26; i++) {
			const a = Math.random() * Math.PI * 2;
			const v = new THREE.Vector3(Math.cos(a) * .5, 1.2 + Math.random() * 1.4, Math.sin(a) * .5).multiplyScalar(power);
			this.add(at, v, new THREE.Color(.88, .94, 1), .6, .008, .016, .8, 9.8, .3);
		}
	}
	/** 砂けむり（コウイカが砂に潜る） */
	sand(at, size) {
		for (let i = 0; i < 4; i++) {
			const v = new THREE.Vector3((Math.random() - .5) * .15, .03 + Math.random() * .05, (Math.random() - .5) * .15);
			this.add(at, v, new THREE.Color().setRGB(.72, .65, .5, THREE.SRGBColorSpace), .5, size * .4, size * 1.6, 2 + Math.random(), -.02, 1.5);
		}
	}
	add(at, v, col, alpha, size0, size1, life, grav, drag, tile = TILE.soft) {
		if (this.puffs.length >= MAX_PUFFS) this.puffs.shift();
		const p = {
			p: at.clone(),
			v,
			age: 0,
			life,
			size0,
			size1,
			grav,
			drag,
			alpha,
			floor: this.floorY,
			col,
			tile,
			rot: 0,
			size: size0,
			a: 0,
			depth: 0
		};
		this.puffs.push(p);
		return p;
	}
	update(dt) {
		this.time += dt;
		const T = INK_TUNE;
		for (let i = this.stains.length - 1; i >= 0; i--) {
			const st = this.stains[i];
			st.age += dt;
			if (st.age >= Math.max(1, T.stainLife) * (st.kind === "wet" ? .5 : 1)) this.stains.splice(i, 1);
		}
		this.writeStains();
		this.ground.update(dt);
		const tt = this.time;
		for (let i = this.puffs.length - 1; i >= 0; i--) {
			const p = this.puffs[i];
			p.age += dt;
			if (p.age < 0) continue;
			p.v.multiplyScalar(Math.exp(-p.drag * dt));
			p.v.y -= p.grav * dt;
			const q = p.p;
			if (p.swirl) {
				const w = p.swirl * dt;
				const ph = p.ph ?? 0;
				p.v.x += Math.sin(q.y * 17 + tt * .7 + ph) * w;
				p.v.y += Math.sin(q.z * 15 + tt * .9 + ph * 1.3) * w * .5;
				p.v.z += Math.sin(q.x * 19 + tt * .8 + ph * .7) * w;
			}
			q.addScaledVector(p.v, dt);
			if (q.y < p.floor) {
				const vx = p.v.x;
				const vz = p.v.z;
				q.y = p.floor;
				p.v.set(0, 0, 0);
				if (p.stain && this.hard) {
					this.addStain(q, p.size1, vx, vz, p.stain);
					p.stain = void 0;
					p.age = p.life;
				}
			}
			const t = p.age / p.life;
			p.size = p.size0 + (p.size1 - p.size0) * (1 - Math.exp(-(p.grow ?? 4) * t));
			if (p.spin) p.rot += p.spin * dt;
			const thin = p.grow ? Math.pow(p.size0 / p.size, .55) : 1;
			p.a = p.alpha * thin * smooth$1(0, p.fadeIn ?? 1e-4, p.age) * (1 - smooth$1(p.fadeOut ?? .5, 1, t));
			if (t >= 1) this.puffs.splice(i, 1);
		}
		this.upload();
	}
	/** 出ている粒を、カメラから遠い順に並べて板の並びへ書き込む */
	upload() {
		const cam = this.view.elements;
		const live = [];
		for (const p of this.puffs) {
			if (p.age < 0 || p.a <= .002) continue;
			p.depth = -(cam[2] * p.p.x + cam[6] * p.p.y + cam[10] * p.p.z + cam[14]);
			live.push(p);
		}
		live.sort((a, b) => b.depth - a.depth);
		const A = this.at;
		const pos = A.aPos.array;
		const col = A.aCol.array;
		const size = A.aSize.array;
		const rot = A.aRot.array;
		const alpha = A.aAlpha.array;
		const tile = A.aTile.array;
		live.forEach((p, i) => {
			pos[i * 3] = p.p.x;
			pos[i * 3 + 1] = p.p.y;
			pos[i * 3 + 2] = p.p.z;
			col[i * 3] = p.col.r;
			col[i * 3 + 1] = p.col.g;
			col[i * 3 + 2] = p.col.b;
			size[i] = p.size;
			rot[i] = p.rot;
			alpha[i] = p.a;
			tile[i] = p.tile;
		});
		if (live.length > 0) for (const a of Object.values(A)) {
			a.clearUpdateRanges();
			a.addUpdateRange(0, live.length * a.itemSize);
			a.needsUpdate = true;
		}
		this.geo.instanceCount = live.length;
		this.mesh.visible = live.length > 0;
	}
	clear() {
		this.puffs = [];
		this.upload();
		this.clearStains();
	}
	clearStains() {
		this.stains = [];
		this.writeStains();
		this.ground.clear();
	}
	/** 堤防の跡：墨は地面に敷いた 1 枚の絵へ描き重ねる（InkGround）。
	*  水は、コンクリートが濡れて少し暗くなった跡（墨の半分の時間で乾く）。飛んできた向きへ少し伸び、残る秒数の終わりに薄れて消える */
	addStain(at, size, vx, vz, kind) {
		if (kind === "ink") {
			this.ground.drop(at, size, vx, vz);
			return;
		}
		const T = INK_TUNE;
		const wet = kind === "wet";
		const sp = Math.hypot(vx, vz);
		const w = size * 2.6 * (wet ? 1.3 : T.stainSize) * (.7 + Math.random() * .6);
		const len = w * (1 + Math.min(1.6, sp * .7));
		const p = new THREE.Vector3(at.x, at.y + (wet ? 4e-4 : 6e-4), at.z);
		if (sp > 1e-4) p.add(new THREE.Vector3(vx, 0, vz).multiplyScalar((len - w) * .4 / sp));
		this.stains.push({
			p,
			yaw: sp > 1e-4 ? Math.atan2(-vz, vx) : Math.random() * Math.PI * 2,
			size: w,
			len,
			age: 0,
			kind
		});
		if (this.stains.filter((s) => s.kind === kind).length > MAX_STAINS) this.stains.splice(this.stains.findIndex((s) => s.kind === kind), 1);
	}
	sm = new THREE.Matrix4();
	sq = new THREE.Quaternion();
	ss = new THREE.Vector3();
	up = new THREE.Vector3(0, 1, 0);
	writeStains() {
		const T = INK_TUNE;
		const n = {
			ink: 0,
			wet: 0
		};
		const L = this.wetStains;
		for (const st of this.stains) {
			const i = n[st.kind]++;
			const life = Math.max(1, T.stainLife) * (st.kind === "wet" ? .5 : 1);
			const k = .55 + .45 * (1 - Math.exp(-st.age / .25));
			this.sq.setFromAxisAngle(this.up, st.yaw);
			this.ss.set(st.len * k, 1, st.size * k);
			L.mesh.setMatrixAt(i, this.sm.compose(st.p, this.sq, this.ss));
			const a = st.kind === "wet" ? .18 : Math.min(1, .85 * T.stainDark);
			L.alpha.setX(i, a * smooth$1(0, .05, st.age) * (1 - smooth$1(.6, 1, st.age / life)));
		}
		const had = L.mesh.count;
		L.mesh.count = n.wet;
		L.mesh.visible = n.wet > 0;
		if (n.wet === 0) return;
		L.mesh.instanceMatrix.clearUpdateRanges();
		L.mesh.instanceMatrix.addUpdateRange(0, Math.max(n.wet, had) * 16);
		L.mesh.instanceMatrix.needsUpdate = true;
		L.alpha.clearUpdateRanges();
		L.alpha.addUpdateRange(0, Math.max(n.wet, had));
		L.alpha.needsUpdate = true;
	}
	/** もう使わない（場面から外し、GPU の入れ物と絵を放す。粒の絵と跡の絵は共通なので残す） */
	dispose() {
		this.puffs = [];
		this.stains = [];
		this.group.removeFromParent();
		this.geo.dispose();
		this.mesh.material.dispose();
		this.ground.dispose();
		this.wetStains.mesh.geometry.dispose();
		this.wetStains.mesh.material.dispose();
		this.wetStains.mesh.dispose();
	}
};
/** 形の細かさ。MS 胴の前後の輪の数・MA 胴のまわり・FU ひれの前後・FV ひれの幅の点・HR 頭の前後・
*  ARM_N 腕の節・TENT_N 触腕の節・TUBE_M 腕のまわり・EYE 目の球の分け方・FUN 漏斗のまわり */
var RES = {
	full: {
		MS: 46,
		MA: 36,
		FU: 34,
		FV: 7,
		HR: 22,
		ARM_N: 20,
		TENT_N: 28,
		TUBE_M: 8,
		EYE: [28, 18],
		FUN: 14
	},
	lite: {
		MS: 14,
		MA: 12,
		FU: 14,
		FV: 3,
		HR: 6,
		ARM_N: 7,
		TENT_N: 8,
		TUBE_M: 4,
		EYE: [10, 6],
		FUN: 6
	}
};
var Squid = class {
	sp;
	ml;
	look;
	form;
	/** ワールドに置く入れ物（位置と向きは behavior が決める） */
	root = new THREE.Group();
	head = new THREE.Group();
	pose = { ...NEUTRAL };
	target = { ...NEUTRAL };
	/** behavior が直接決める（近づけない）もの */
	direct = /* @__PURE__ */ new Set();
	/** 触腕を伸ばす先（胴の座標） */
	tentTarget = new THREE.Vector3();
	hold = null;
	/** 地面の高さ（ワールド）。決めると、腕・触腕・ひれがその下へもぐらない（陸に置いたとき、海底） */
	ground = null;
	uniforms;
	pupilU = { value: .6 };
	time = 0;
	/** 色のゆらぎ：今の演出（茶色の斑点・白っぽく抜ける）と、その経過・長さ、次までの秒 */
	ep = null;
	epAge = 0;
	epLen = 0;
	epT = 2 + Math.random() * 8;
	finPhase = 0;
	breathPhase = 0;
	/** 休んでいる形で作る（写真の貼り方を決めるとき） */
	resting = false;
	mantleGeo;
	finGeo = [];
	arms = [];
	tents = [];
	eyes = [];
	funnel;
	funnelMesh;
	funnelLen;
	/** 漏斗のもとの形（曲げる前）と、曲げたあとの口の位置・向き（漏斗の座標）、曲がりの遅れ */
	funBase;
	funTip = new THREE.Vector3();
	funDir = new THREE.Vector3(0, 0, 1);
	funPrev = NaN;
	funLag = 0;
	funSeed = Math.random() * 10;
	gBody = new THREE.Vector3();
	gHead = new THREE.Vector3();
	/** 描く形：体（胴・頭・腕・触腕・漏斗・ひれ・甲の針をまとめた 1 つ）と目（両目で 1 つ）。部品ごとに描くと 1 匹 17〜18 回描くので、まとめて 2 回にする */
	meshes = [];
	/** 部品ごとの形（形の計算に使うだけで描かない。毎フレーム、胴の座標へ直して meshes へ写す。軽い版はここから形を集める） */
	parts = [];
	/** 体と目の材質 */
	bodyMaterial;
	eyeMaterial;
	bodySegs = [];
	eyeSegs = [];
	mtx = new THREE.Matrix4();
	nmx = new THREE.Matrix3();
	/** 毎フレーム使い回す入れ物（作り捨てると Quest でメモリの片付けが増えて引っかかる） */
	mInv = new THREE.Matrix4();
	kW = new THREE.Vector3();
	hh = {
		a: new THREE.Vector3(),
		b: new THREE.Vector3(),
		r: 0
	};
	fv = {
		root: new THREE.Vector3(),
		ahead: new THREE.Vector3(),
		N: new THREE.Vector3(),
		D: new THREE.Vector3(),
		P: new THREE.Vector3()
	};
	finPts = [];
	sa = {
		T: new THREE.Vector3(),
		R: new THREE.Vector3(),
		B: new THREE.Vector3(),
		tmp: new THREE.Vector3(),
		radial: new THREE.Vector3(),
		axis: new THREE.Vector3(),
		line: new THREE.Vector3(),
		xAxis: new THREE.Vector3(1, 0, 0),
		pinchDir: new THREE.Vector3(),
		tipP: new THREE.Vector3(),
		tipB: new THREE.Vector3()
	};
	st = {
		goal: new THREE.Vector3(),
		rest: new THREE.Vector3(),
		dir: new THREE.Vector3(),
		tmp: new THREE.Vector3(),
		radial: new THREE.Vector3(),
		base: new THREE.Vector3(),
		off: new THREE.Vector3(),
		side: new THREE.Vector3(),
		up: new THREE.Vector3(0, 1, 0)
	};
	/** 胴のまわりの角ごとの cos・sin（毎回同じなので 1 回だけ） */
	phiTab = null;
	/** 形を計算し直すのを何フレームに 1 回にするか（遠くのイカは 2〜3 にして軽くする。位置と向きは毎フレーム動く） */
	every = 1;
	tick = 0;
	lag = 0;
	/** 形の細かさ（full：ふつう、lite：軽い版の元） */
	res;
	constructor(id, look = null, detail = "full") {
		const res = this.res = RES[detail];
		const { MS, MA, FU, FV, ARM_N, TENT_N, TUBE_M } = res;
		const sp = this.sp = SQUIDS[id];
		const ml = this.ml = sp.ml;
		this.look = look;
		const F = this.form = formOf(sp, look?.shape ?? null);
		this.uniforms = makeSkinUniforms(sp, look);
		this.uniforms.uDashS.value.set(F.headLen / ml, F.mlen / ml);
		const skin = this.bodyMaterial = skinMaterial(this.uniforms, {
			side: THREE.DoubleSide,
			transparent: true
		});
		skin.forceSinglePass = true;
		const finMat = skin;
		const inner = skin;
		if (detail === "lite") this.uniforms.uClear.value = 0;
		this.mantleGeo = gridGeometry(MS, MA + 1);
		this.add(new THREE.Mesh(this.mantleGeo, inner), this.root);
		for (let f = 0; f < 2; f++) {
			const g = gridGeometry(FU, FV);
			this.finGeo.push(g);
			const m = new THREE.Mesh(g, finMat);
			m.renderOrder = 1;
			this.add(m, this.root);
		}
		if (F.spine > 0) {
			const c = new THREE.ConeGeometry(.008 * ml, F.spine * 1.3, 8);
			c.rotateX(-Math.PI / 2);
			addPhotoAttrs(c);
			const cs = new Float32Array(c.attributes.position.count * 4);
			for (let i = 3; i < cs.length; i += 4) cs[i] = PART.spine;
			c.setAttribute("aSkin", new THREE.BufferAttribute(cs, 4));
			const spine = new THREE.Mesh(c, skin);
			spine.position.set(0, 0, -F.mlen - F.spine * .45);
			spine.updateMatrix();
			this.add(spine, this.root);
		}
		this.root.add(this.head);
		this.add(new THREE.Mesh(this.headGeometry(), skin), this.head);
		this.eyeMaterial = eyeMaterial(sp, look, this.pupilU, this.uniforms.uParts);
		for (const side of [1, -1]) {
			const eg = new THREE.SphereGeometry(F.eye.R, res.EYE[0], res.EYE[1]);
			const ep = eg.attributes.position;
			const ea = new Float32Array(ep.count * 4);
			for (let i = 0; i < ep.count; i++) {
				ea[i * 4] = ep.getX(i);
				ea[i * 4 + 1] = ep.getY(i);
				ea[i * 4 + 2] = ep.getZ(i);
				ea[i * 4 + 3] = side;
			}
			eg.setAttribute("aEye", new THREE.BufferAttribute(ea, 4));
			const e = new THREE.Mesh(eg, this.eyeMaterial);
			e.position.set(side * F.eye.x, F.eye.y, F.eye.z);
			e.rotation.order = "YXZ";
			e.userData.side = side;
			this.eyes.push(e);
			this.add(e, this.head);
		}
		const rnd = (i) => Math.sin(i * 12.9898) * 43758.5453 - Math.floor(Math.sin(i * 12.9898) * 43758.5453);
		const D = look?.shape.dorsal;
		const strip = F.strip;
		const tracks = look?.shape.armTracks;
		const trackOf = (side, k) => {
			if (!tracks || !D) return null;
			const mine = tracks.tracks.filter((t) => (t.y[0] - D.yc) * side > 0).sort((a, b) => Math.abs(a.y[0] - D.yc) - Math.abs(b.y[0] - D.yc));
			return mine.length ? mine[Math.min(k, mine.length - 1)] : null;
		};
		const stripUv = (tr, sig, ang) => {
			if (!tr || !tracks || !D) return [0, 0];
			const px = sample$1(tracks.x, sig);
			const py = sample$1(tr.y, sig) + Math.sin(ang) * tr.hw * .75 * (1 - .5 * sig);
			return [px / D.w, 1 - py / D.h];
		};
		for (let k = 0; k < 4; k++) for (const side of [1, -1]) {
			const tube = new Tube(ARM_N, TUBE_M);
			const tr = trackOf(side, k);
			if (strip) tube.setPhoto((sig, ang) => stripUv(tr, sig, ang));
			const mesh = new THREE.Mesh(tube.geo, skin);
			mesh.frustumCulled = false;
			mesh.renderOrder = 1;
			this.add(mesh, this.head);
			const psi = Math.PI / 2 - side * (Math.PI / 8 + k * Math.PI / 4);
			this.arms.push({
				k,
				side,
				psi,
				len: F.arms[k],
				phase: rnd(k * 2 + (side > 0 ? 0 : 1)) * 6.28,
				tube,
				mesh,
				pts: Array.from({ length: ARM_N }, () => new THREE.Vector3())
			});
		}
		for (const side of [1, -1]) {
			const tube = new Tube(TENT_N, TUBE_M);
			const tr = trackOf(side, 1);
			if (strip) tube.setPhoto((sig, ang) => stripUv(tr, Math.min(1, sig * .9), ang));
			const mesh = new THREE.Mesh(tube.geo, skin);
			mesh.frustumCulled = false;
			mesh.renderOrder = 1;
			this.add(mesh, this.head);
			this.tents.push({
				side,
				psi: Math.PI / 2 - side * (Math.PI * .75),
				tube,
				mesh,
				pts: Array.from({ length: TENT_N }, () => new THREE.Vector3()),
				tip: new THREE.Vector3()
			});
		}
		this.funnel = new THREE.Group();
		this.funnel.position.set(0, -F.hb(.05) * .82, -.02 * ml);
		const fl = this.funnelLen = .12 * ml;
		const rb = F.hw(.05) * .34;
		const fg = new THREE.CylinderGeometry(rb * .45, rb, fl, res.FUN, res.FUN > 8 ? 7 : 2, true);
		fg.rotateX(Math.PI / 2);
		fg.translate(0, 0, fl / 2);
		this.funBase = {
			pos: fg.attributes.position.array.slice(),
			nrm: fg.attributes.normal.array.slice()
		};
		this.funTip.set(0, 0, fl);
		const fp = fg.attributes.position;
		const fs = new Float32Array(fp.count * 4);
		for (let i = 0; i < fp.count; i++) {
			fs[i * 4] = fp.getZ(i) / ml;
			fs[i * 4 + 1] = Math.atan2(fp.getY(i), fp.getX(i)) * .03;
			fs[i * 4 + 2] = -.8;
			fs[i * 4 + 3] = PART.funnel;
		}
		fg.setAttribute("aSkin", new THREE.BufferAttribute(fs, 4));
		addPhotoAttrs(fg);
		this.funnelMesh = new THREE.Mesh(fg, inner);
		this.root.add(this.funnel);
		this.add(this.funnelMesh, this.funnel);
		this.resting = true;
		this.update(0);
		this.resting = false;
		if (look) {
			const hf = sp.heightFix;
			bakePhoto(this.mantleGeo, look.shape, hf);
			for (const g of this.finGeo) bakePhoto(g, look.shape, hf, void 0, true);
			bakePhoto(this.funnelMesh.geometry, look.shape, hf, this.funnel.matrix.clone().multiply(this.funnelMesh.matrix));
			const headMesh = this.head.children[0];
			bakePhoto(headMesh.geometry, look.shape, hf);
		}
		this.buildMerged();
		this.update(0);
	}
	/** 部品（描かない。形の計算用） */
	add(m, parent) {
		parent.add(m);
		m.visible = false;
		this.parts.push(m);
	}
	/** 部品をまとめた体と目を作る（写真の貼り方はここで写す。形・法線・皮の座標は毎フレーム sync で写す） */
	buildMerged() {
		const partOf = (m) => m.geometry.attributes.aSkin.getW(0);
		const RANK = [
			0,
			3,
			4,
			5,
			6,
			1,
			2
		];
		const body = this.parts.filter((m) => !m.geometry.attributes.aEye).sort((a, b) => RANK[partOf(a)] - RANK[partOf(b)]);
		const eyes = this.parts.filter((m) => m.geometry.attributes.aEye);
		const F = this.form;
		const R = F.mlen + F.spine * 1.3 + F.headLen + Math.max(this.armMax, this.tentReach) + .02 * this.ml;
		const make = (list, attrs, isBody, mat) => {
			const segs = [];
			let n = 0;
			for (const m of list) {
				const c = m.geometry.attributes.position.count;
				const p = isBody ? partOf(m) : -1;
				segs.push({
					mesh: m,
					off: n,
					n: c,
					ident: p === PART.mantle || p === PART.fin,
					dyn: p === PART.mantle || p === PART.fin || p === PART.arm || p === PART.tentacle
				});
				n += c;
			}
			const g = new THREE.BufferGeometry();
			for (const a of attrs) {
				const it = list[0].geometry.attributes[a].itemSize;
				const arr = new Float32Array(n * it);
				for (const sg of segs) arr.set(sg.mesh.geometry.attributes[a].array, sg.off * it);
				const ba = new THREE.BufferAttribute(arr, it);
				if (a === "position" || a === "normal" || a === "aSkin") ba.setUsage(THREE.DynamicDrawUsage);
				g.setAttribute(a, ba);
			}
			const idx = [];
			for (const sg of segs) {
				const ix = sg.mesh.geometry.index;
				for (let i = 0; i < ix.count; i++) idx.push(ix.getX(i) + sg.off);
			}
			g.setIndex(idx);
			g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), R);
			const mesh = new THREE.Mesh(g, mat);
			this.root.add(mesh);
			this.meshes.push(mesh);
			return segs;
		};
		this.bodySegs = make(body, [
			"position",
			"normal",
			"aSkin",
			"aUvT",
			"aUvB",
			"aUvS",
			"aW"
		], true, this.bodyMaterial);
		this.eyeSegs = make(eyes, [
			"position",
			"normal",
			"aEye"
		], false, this.eyeMaterial);
	}
	/** もう使わない（場面から外し、GPU の入れ物と材質を放す。写真の絵は種類ごとに共通なので残す） */
	dispose() {
		this.root.removeFromParent();
		for (const m of [...this.parts, ...this.meshes]) m.geometry.dispose();
		this.bodyMaterial.dispose();
		this.eyeMaterial.dispose();
	}
	/** obj の行列を胴（root）の座標まで掛ける */
	toRoot(o, out) {
		out.copy(o.matrix);
		for (let p = o.parent; p && p !== this.root; p = p.parent) out.premultiply(p.matrix);
		return out;
	}
	/** 部品の形を、まとめた体と目へ写す（胴の座標へ直す） */
	sync() {
		for (const [segs, mesh] of [[this.bodySegs, this.meshes[0]], [this.eyeSegs, this.meshes[1]]]) {
			const A = mesh.geometry.attributes;
			const P = A.position.array;
			const N = A.normal.array;
			const S = A.aSkin ? A.aSkin.array : null;
			for (const sg of segs) {
				const src = sg.mesh.geometry.attributes;
				const sp = src.position.array;
				const sn = src.normal.array;
				if (sg.ident) {
					P.set(sp, sg.off * 3);
					N.set(sn, sg.off * 3);
				} else {
					const e = this.toRoot(sg.mesh, this.mtx).elements;
					const q = this.nmx.getNormalMatrix(this.mtx).elements;
					for (let i = 0, o = sg.off * 3; i < sg.n * 3; i += 3, o += 3) {
						const x = sp[i];
						const y = sp[i + 1];
						const z = sp[i + 2];
						P[o] = e[0] * x + e[4] * y + e[8] * z + e[12];
						P[o + 1] = e[1] * x + e[5] * y + e[9] * z + e[13];
						P[o + 2] = e[2] * x + e[6] * y + e[10] * z + e[14];
						const a = sn[i];
						const b = sn[i + 1];
						const c = sn[i + 2];
						const nx = q[0] * a + q[3] * b + q[6] * c;
						const ny = q[1] * a + q[4] * b + q[7] * c;
						const nz = q[2] * a + q[5] * b + q[8] * c;
						const l = 1 / (Math.sqrt(nx * nx + ny * ny + nz * nz) || 1);
						N[o] = nx * l;
						N[o + 1] = ny * l;
						N[o + 2] = nz * l;
					}
				}
				if (sg.dyn && S) S.set(src.aSkin.array, sg.off * 4);
			}
			A.position.needsUpdate = true;
			A.normal.needsUpdate = true;
			if (S) A.aSkin.needsUpdate = true;
		}
	}
	get triangles() {
		let n = 0;
		for (const m of this.meshes) n += (m.geometry.index ? m.geometry.index.count : m.geometry.attributes.position.count) / 3;
		return Math.round(n);
	}
	/** 胴の前の縁から腕の根元までの長さ（m）。抱く筒やエギの位置の目安 */
	get armBaseZ() {
		return this.form.headLen;
	}
	/** いちばん長い腕（m） */
	get armMax() {
		return Math.max(...this.form.arms);
	}
	/** 触腕を伸ばせる長さ（m） */
	get tentReach() {
		return this.sp.tentMax * this.ml;
	}
	/** 胴の模型の長さ（m） */
	get mantleLen() {
		return this.form.mlen;
	}
	/** ひれのある所（胴の前の縁 0 〜 後ろの端 1） */
	get finRange() {
		return [this.form.fin0, this.form.fin1];
	}
	/** お腹の下の端（胴の座標の y、いちばん低い所） */
	get bellyDepth() {
		let d = 0;
		for (let i = 0; i <= 10; i++) d = Math.max(d, this.form.bot(i / 10));
		return d;
	}
	/** 胴の半幅のいちばん広い所 */
	get halfWidth() {
		let d = 0;
		for (let i = 0; i <= 10; i++) d = Math.max(d, this.form.a(i / 10));
		return d;
	}
	/** 胴の点（s 0〜1 前→後ろ、断面の角 phi）。縮み・息・地面でつぶれるのを入れる */
	mantlePoint(s, phi, out) {
		const { sp, form: F, pose } = this;
		const sc = Math.min(1, Math.max(0, s));
		let a = F.a(sc);
		const sn = Math.sin(phi);
		let b = sn >= 0 ? F.top(sc) : F.bot(sc);
		const squeezeAt = 1 - .45 * smooth$1(.6, 1, s);
		const breath = this.resting ? 0 : .025 * pose.breathe * Math.sin(this.breathPhase);
		const m = this.resting ? 0 : pose.mantle;
		const dorsal = sn > 0 ? 1 + (sp.dorsalSqueeze - 1) * sn : 1;
		a *= 1 + (m + breath) * squeezeAt * dorsal;
		b *= 1 + (m + breath) * squeezeAt * (sn > 0 ? dorsal : 1);
		if (!this.resting && pose.flat > 0) {
			b *= 1 - .32 * pose.flat;
			a *= 1 + .12 * pose.flat;
		}
		if (s < 0) {
			const t = -s / .035;
			a += (F.hw(0) * .97 - a) * t;
			b += ((sn >= 0 ? F.ht(0) : F.hb(0)) * .97 - b) * t;
		}
		out.set(a * Math.cos(phi), b * sn, -s * F.mlen);
		return out;
	}
	headGeometry() {
		const { HR, MA } = this.res;
		const { form: F, ml } = this;
		const g = gridGeometry(HR + 1, MA + 1, true);
		const pos = g.attributes.position.array;
		const skin = g.attributes.aSkin.array;
		const L = F.headLen;
		for (let i = 0; i <= HR; i++) {
			const h = -.15 + 1.15 * i / HR;
			const close = i === HR ? .05 : 1;
			for (let j = 0; j <= MA; j++) {
				const phi = phiAt(j, MA);
				const sn = Math.sin(phi);
				const k = (i * (MA + 1) + j) * 3;
				pos[k] = F.hw(h) * close * Math.cos(phi);
				pos[k + 1] = (sn >= 0 ? F.ht(h) : F.hb(h)) * close * sn;
				pos[k + 2] = h * L + (i === HR ? .01 * ml : 0);
				const q = (i * (MA + 1) + j) * 4;
				skin[q] = -h * L / ml;
				skin[q + 1] = j / MA * Math.PI * 2 * F.hw(.4) / ml;
				skin[q + 2] = sn;
				skin[q + 3] = PART.head;
			}
		}
		g.computeVertexNormals();
		return g;
	}
	/** 触腕の掌部の先（ワールド） */
	tentTip(i, out) {
		return out.copy(this.tents[i].tip).applyMatrix4(this.head.matrixWorld);
	}
	/** 両方の触腕の掌部の真ん中（胴の座標） */
	clubCenter(out) {
		out.copy(this.tents[0].tip).add(this.tents[1].tip).multiplyScalar(.5);
		return out.applyMatrix4(this.head.matrix);
	}
	/** 漏斗の口（ワールド）と噴く向き（ワールド） */
	funnelOut(pos, dir) {
		this.funnel.updateWorldMatrix(true, false);
		this.funnelMesh.updateMatrix();
		pos.copy(this.funTip).applyMatrix4(this.funnelMesh.matrix).applyMatrix4(this.funnel.matrixWorld);
		dir.copy(this.funDir).applyMatrix4(this.mInv.makeScale(1, this.funnelMesh.scale.y, 1)).transformDirection(this.funnel.matrixWorld);
	}
	/** 漏斗をやわらかい管にする（もとの形を毎回曲げ直す。休んでいる形・写真の貼り方を決める形は曲げない）：
	*  - 前（腕の方）へたたむほど 3 割まで短く縮め、先を頭の中へ反らす（口が頭の下から出て、切り口が見えないように）
	*  - 向きを変えると、先が遅れてついてくる（ばねで戻る）。ふだんも少したわみ、左右にゆれる
	*  - 口の開き（funnelOpen）は先ほど大きく変わり、根元はあまり変わらない */
	bendFunnel(aim, open, dt) {
		const g = this.funnelMesh.geometry;
		const P = g.attributes.position.array;
		const N = g.attributes.normal.array;
		const { pos: bp, nrm: bn } = this.funBase;
		const fl = this.funnelLen;
		let B = 0;
		let sway = 0;
		let lenK = 1;
		if (!this.resting) {
			const fold = 1 - smooth$1(.25, 1.1, aim);
			lenK = 1 - .3 * fold;
			if (dt > 0) {
				const v = Number.isNaN(this.funPrev) ? 0 : (aim - this.funPrev) / dt;
				const goal = THREE.MathUtils.clamp(v * .12, -.6, .6);
				this.funLag += (goal - this.funLag) * (1 - Math.exp(-6 * dt));
			}
			this.funPrev = aim;
			const t = this.time + this.funSeed;
			B = .65 * fold + this.funLag + .07 * Math.sin(t * 1.9) + .035 * Math.sin(t * 4.3);
			sway = .1 * Math.sin(t * 1.3) + .05 * Math.sin(t * 3.1 + 1);
		}
		const L = lenK * fl;
		const arc = (u, out) => {
			const phi = B * u;
			if (Math.abs(B) < 1e-4) out.set(0, 0, L * u);
			else out.set(0, L / B * (1 - Math.cos(phi)), L / B * Math.sin(phi));
			out.x = sway * fl * u * u;
			return phi;
		};
		const c = this.funTip;
		for (let i = 0; i < bp.length; i += 3) {
			const u = Math.min(1, Math.max(0, bp[i + 2] / fl));
			const phi = arc(u, c);
			const cs = Math.cos(phi);
			const sn = Math.sin(phi);
			const rk = 1 + (open - 1) * (.35 + .65 * u);
			const x = bp[i] * rk;
			const y = bp[i + 1] * rk;
			P[i] = c.x + x;
			P[i + 1] = c.y + y * cs;
			P[i + 2] = c.z - y * sn;
			const ny = bn[i + 1];
			const nz = bn[i + 2];
			N[i] = bn[i];
			N[i + 1] = ny * cs + nz * sn;
			N[i + 2] = -ny * sn + nz * cs;
		}
		const phi = arc(1, c);
		this.funDir.set(2 * sway / lenK, Math.sin(phi), Math.cos(phi)).normalize();
	}
	setParts(on) {
		this.uniforms.uParts.value = on ? 1 : 0;
	}
	setMale(on) {
		this.uniforms.uMale.value = on ? 1 : 0;
	}
	/** 写真を貼る／描いた模様にする（写真があるときだけ） */
	setPhoto(on) {
		this.uniforms.uPhoto.value = on && this.look ? 1 : 0;
	}
	update(dt) {
		if (this.every > 1 && dt > 0) {
			this.lag += dt;
			if (++this.tick < this.every) return;
			this.tick = 0;
			dt = this.lag;
			this.lag = 0;
		}
		const { sp, pose, target } = this;
		this.time += dt;
		for (const key of Object.keys(target)) {
			if (this.direct.has(key)) {
				pose[key] = target[key];
				continue;
			}
			const r = RATE[key] ?? 4;
			pose[key] += (target[key] - pose[key]) * (1 - Math.exp(-r * dt));
		}
		this.finPhase += Math.PI * 2 * sp.finFreq * pose.finFreq * dt;
		this.breathPhase += Math.PI * 2 * .8 * dt;
		this.root.updateMatrixWorld(true);
		this.gBody.set(0, -1, 0).transformDirection(this.mInv.copy(this.root.matrixWorld).invert());
		if (this.resting) this.head.rotation.set(0, 0, 0);
		else this.head.rotation.set(-pose.headPitch, pose.headYaw, 0, "YXZ");
		this.head.updateMatrix();
		this.head.updateMatrixWorld(true);
		this.gHead.set(0, -1, 0).transformDirection(this.mInv.copy(this.head.matrixWorld).invert());
		this.buildMantle();
		this.buildFins();
		this.buildArms();
		this.buildTentacles();
		this.pupilU.value = pose.pupil;
		for (const e of this.eyes) {
			const side = e.userData.side;
			e.rotation.set(-pose.eyePitch, side * (Math.PI / 2 - pose.eyeYaw), 0);
			e.updateMatrix();
		}
		const aim = this.resting ? NEUTRAL.funnelAim : pose.funnelAim;
		this.funnel.rotation.x = aim;
		this.funnel.updateMatrix();
		this.funnelMesh.scale.set(1, .8, 1);
		this.funnelMesh.updateMatrix();
		this.bendFunnel(aim, this.resting ? 1 : .75 + .5 * pose.funnelOpen, dt);
		if (this.meshes.length) this.sync();
		const u = this.uniforms;
		const L = this.resting ? 0 : pose.colorLife * (1 - .8 * pose.flicker) * (1 - pose.pale);
		if (!this.resting && dt > 0) {
			if (this.ep) {
				this.epAge += dt;
				if (this.epAge >= this.epLen) {
					this.ep = null;
					this.epT = 5 + Math.random() * 9;
				}
			} else if ((this.epT -= dt) <= 0) {
				this.ep = Math.random() < .4 ? "brown" : "pale";
				this.epAge = 0;
				this.epLen = this.ep === "brown" ? 2.5 + Math.random() * 2.5 : 2.5 + Math.random() * 2;
			}
		}
		const env = this.ep ? smooth$1(0, this.ep === "pale" ? .35 : .7, this.epAge) * (1 - smooth$1(this.epLen - .9, this.epLen, this.epAge)) : 0;
		const brown = this.ep === "brown" ? env * L : 0;
		const pale = this.ep === "pale" ? env * L : 0;
		u.uDark.value = Math.max(pose.dark, Math.min(.9, pose.dark + .55 * brown)) * (1 - .6 * pale);
		const paleAll = Math.max(pose.pale, .9 * pale);
		u.uPale.value = paleAll;
		let cloud = Math.max(pose.cloud, sp.id === "aori" ? .5 * brown : 0);
		cloud = Math.max(cloud, Math.min(.5, cloud * 4));
		if (sp.id === "aori" && !this.resting) {
			cloud = Math.max(cloud, .5 * Math.min(1, paleAll * 3));
			cloud = Math.max(cloud, .5 * smooth$1(-.9, -.6, Math.sin(this.time * .21 + this.funSeed * 1.7)));
		}
		u.uCloud.value = cloud;
		u.uFlicker.value = Math.max(pose.flicker, .35 * brown);
		u.uTime.value = this.time;
	}
	/** 胴の格子：mantlePoint と同じ計算を、前後の輪ごとに決まる値（太さ・縮み）は輪ごとに 1 回、まわりの角の cos・sin は表から（結果は同じ） */
	buildMantle() {
		const { MS, MA } = this.res;
		const { sp, form: F, ml, pose } = this;
		const pos = this.mantleGeo.attributes.position.array;
		const skin = this.mantleGeo.attributes.aSkin.array;
		const circ = this.halfWidth * .85 * Math.PI * 2 / ml;
		let tab = this.phiTab;
		if (!tab) {
			tab = this.phiTab = {
				cos: new Float64Array(MA + 1),
				sin: new Float64Array(MA + 1)
			};
			for (let j = 0; j <= MA; j++) {
				const phi = phiAt(j, MA);
				tab.cos[j] = Math.cos(phi);
				tab.sin[j] = Math.sin(phi);
			}
		}
		const breath = this.resting ? 0 : .025 * pose.breathe * Math.sin(this.breathPhase);
		const mm = this.resting ? 0 : pose.mantle;
		const flat = !this.resting && pose.flat > 0 ? pose.flat : 0;
		const aC = F.hw(0) * .97;
		const tC = F.ht(0) * .97;
		const bC = F.hb(0) * .97;
		for (let i = 0; i < MS; i++) {
			const t = i / (MS - 1);
			const s = -.035 + 1.035 * (1 - Math.pow(1 - t, 1.35));
			const sc = Math.min(1, Math.max(0, s));
			const a0 = F.a(sc);
			const top0 = F.top(sc);
			const bot0 = F.bot(sc);
			const k = (mm + breath) * (1 - .45 * smooth$1(.6, 1, s));
			const ct = s < 0 ? -s / .035 : 0;
			const z = -s * F.mlen;
			const sk = (s * F.mlen + F.headLen) / ml;
			for (let j = 0; j <= MA; j++) {
				const sn = tab.sin[j];
				const dorsal = sn > 0 ? 1 + (sp.dorsalSqueeze - 1) * sn : 1;
				let a = a0 * (1 + k * dorsal);
				let b = (sn >= 0 ? top0 : bot0) * (1 + k * (sn > 0 ? dorsal : 1));
				if (flat > 0) {
					b *= 1 - .32 * flat;
					a *= 1 + .12 * flat;
				}
				if (s < 0) {
					a += (aC - a) * ct;
					b += ((sn >= 0 ? tC : bC) - b) * ct;
				}
				const kk = (i * (MA + 1) + j) * 3;
				pos[kk] = a * tab.cos[j];
				pos[kk + 1] = b * sn;
				pos[kk + 2] = z;
				const q = (i * (MA + 1) + j) * 4;
				skin[q] = sk;
				skin[q + 1] = j / MA * circ;
				skin[q + 2] = sn;
				skin[q + 3] = PART.mantle;
			}
		}
		this.mantleGeo.attributes.position.needsUpdate = true;
		this.mantleGeo.attributes.aSkin.needsUpdate = true;
		fastNormals(this.mantleGeo);
		const n = this.mantleGeo.attributes.normal.array;
		for (let i = 0; i < MS; i++) {
			const a = i * (MA + 1) * 3;
			const b = (i * (MA + 1) + MA) * 3;
			for (let c = 0; c < 3; c++) n[a + c] = n[b + c] = (n[a + c] + n[b + c]) / 2;
		}
	}
	/** ひれ：胴の横の線に付いたリボン。付け根の向き（胴の輪郭の外向き）から、上下の角を足しながら外へ並べる。
	*  波は前から後ろへ（finDir=1）流れ、−1 で逆、0 で前後の波が打ち消し合う。たたむと胴の丸みに沿って下へ巻く */
	buildFins() {
		const { FU, FV } = this.res;
		const { sp, form: F, ml, pose } = this;
		const rest = this.resting;
		const { root, ahead, N, D, P } = this.fv;
		const amp = rest ? 0 : sp.finAmp * pose.finAmp;
		for (let f = 0; f < 2; f++) {
			const side = f === 0 ? 1 : -1;
			const fwd = (1 + Math.max(-1, Math.min(1, pose.finDir + side * pose.finTurn))) / 2;
			const g = this.finGeo[f];
			const pos = g.attributes.position.array;
			const skin = g.attributes.aSkin.array;
			const phiA = side > 0 ? F.finAt : Math.PI - F.finAt;
			for (let i = 0; i < FU; i++) {
				const u = i / (FU - 1);
				const s = F.fin0 + (F.fin1 - F.fin0) * u;
				this.mantlePoint(s, phiA, root);
				this.mantlePoint(Math.min(1.02, s + .01), phiA, ahead);
				N.set(-(ahead.z - root.z), 0, ahead.x - root.x).multiplyScalar(side);
				if (N.x * side < 0) N.multiplyScalar(-1);
				if (N.lengthSq() < 1e-12) N.set(side, 0, 0);
				N.normalize();
				const w = F.finW(u);
				const env = Math.pow(Math.sin(Math.PI * Math.min(1, Math.max(0, u))), .5);
				const k = 2 * Math.PI * sp.finWaves * u;
				const wave = amp * env * (fwd * Math.sin(this.finPhase - k) + (1 - fwd) * Math.sin(this.finPhase + k));
				const rLocal = Math.max(.02 * ml, F.a(s));
				const lift = rest ? 0 : pose.finLift;
				const fold = rest ? 0 : pose.finFold;
				P.copy(root);
				let along = 0;
				for (let j = 0; j < FV; j++) {
					const v = j / (FV - 1);
					if (j > 0) {
						const step = w / (FV - 1);
						along += step;
						const ang = lift + wave * (.7 + .6 * v) - fold * (.35 + along / (rLocal * 1.08));
						D.copy(N).multiplyScalar(Math.cos(ang));
						D.y += Math.sin(ang);
						P.addScaledVector(D, step);
						if (!rest && pose.sag > 0) P.addScaledVector(this.gBody, pose.sag * step * .55 * v);
					}
					const kk = (i * FV + j) * 3;
					pos[kk] = P.x;
					pos[kk + 1] = P.y;
					pos[kk + 2] = P.z;
					const q = (i * FV + j) * 4;
					skin[q] = (s * F.mlen + F.headLen) / ml;
					skin[q + 1] = along / ml;
					skin[q + 2] = .6;
					skin[q + 3] = PART.fin;
				}
			}
			if (this.ground !== null && !rest) {
				while (this.finPts.length < pos.length / 3) this.finPts.push(new THREE.Vector3());
				const ptsF = this.finPts;
				for (let q = 0; q < pos.length; q += 3) ptsF[q / 3].set(pos[q], pos[q + 1], pos[q + 2]);
				this.keepAbove(ptsF, this.root, .002);
				ptsF.forEach((v, q) => v.toArray(pos, q * 3));
			}
			g.attributes.position.needsUpdate = true;
			g.attributes.aSkin.needsUpdate = true;
			fastNormals(g);
		}
	}
	/** 点（obj の座標）を地面の上へ出す */
	keepAbove(pts, obj, lift) {
		if (this.ground === null || this.resting) return;
		const m = obj.matrixWorld;
		const inv = this.mInv.copy(m).invert();
		const w = this.kW;
		const g = this.ground + lift;
		for (const p of pts) {
			w.copy(p).applyMatrix4(m);
			if (w.y < g) {
				w.y = g;
				p.copy(w.applyMatrix4(inv));
			}
		}
	}
	/** 頭の座標での抱く筒 */
	holdInHead() {
		if (!this.hold) return null;
		const inv = this.mInv.copy(this.head.matrix).invert();
		const h = this.hh;
		h.a.copy(this.hold.a).applyMatrix4(inv);
		h.b.copy(this.hold.b).applyMatrix4(inv);
		h.r = this.hold.r;
		return h;
	}
	/** 腕：20 節の鎖。根元は頭の中から始め（頭の先で腕がいきなり生えて見えない）、根元は隣の腕と触れ合う太さで頭の輪郭にそろえる。
	*  開き（spread）は根元の向きではなく、頭から出た所から少しずつ曲げて付ける（束がつながったまま開く）。
	*  外向き（r）と横（b）の軸のまわりに少しずつ曲げながら先へ進み、重さで垂らし、抱く筒の中に入った点を外へ押し出してから、筒を張る */
	buildArms() {
		const { ARM_N } = this.res;
		const { form: F, ml } = this;
		const pose = this.resting ? NEUTRAL : this.pose;
		const hJ = .8;
		const zA = F.headLen * hJ;
		const Rx = F.hw(hJ);
		const Ry = (F.ht(hJ) + F.hb(hJ)) * .5;
		const buried = F.headLen * .19999999999999996;
		const { T, R, B, tmp, radial, axis, line, xAxis, tipP, tipB } = this.sa;
		const hold = this.holdInHead();
		const t = this.time;
		const pinchDir = this.sa.pinchDir.set(0, 0, 1).applyAxisAngle(xAxis, pose.armPitch * (1 - .6 * pose.wrap) + pose.armDroop * .7);
		const pinch = pose.armPinch * (1 - pose.wrap) * (1 - .7 * pose.armSpread / 1.1);
		for (const arm of this.arms) {
			const { k, psi, len, phase, pts } = arm;
			radial.set(Math.cos(psi), Math.sin(psi), 0);
			const Rp = 1 / Math.sqrt((radial.x / Rx) ** 2 + (radial.y / Ry) ** 2);
			const rBase = Rp * .33;
			pts[0].copy(radial).multiplyScalar(Rp - rBase * .95).setZ(zA);
			const idle = pose.armIdle * (.12 * Math.sin(t * .7 + phase) + .08 * Math.sin(t * 1.9 + phase * 2));
			let spread = pose.armSpread * (1 - pose.armGather) - .06 * pose.armGather + idle * .3;
			if (k === 0) spread += pose.armRaise;
			const flare = k === 2 ? pose.armFlare * pose.armBundle * (1 - pose.wrap) : 0;
			spread += flare * 1.1;
			spread = Math.max(-.5, Math.min(1.3, spread * (1 - pose.wrap) + pose.wrap * .18));
			T.set(0, 0, 1);
			T.applyAxisAngle(tmp.set(1, 0, 0), pose.armPitch * (1 - .6 * pose.wrap));
			R.copy(radial).addScaledVector(T, -radial.dot(T)).normalize();
			B.crossVectors(T, R);
			const curl = (pose.armCurl * (1 - pose.armGather * .8) * (1 - pose.wrap) + (k === 0 ? pose.armRaise * .8 : 0) - pose.wrap * 2.4 + idle) * (1 - pose.armBundle) - flare * 1.5;
			const tip = pose.armTip * (1 - pose.wrap) - pose.wrap * 1.8;
			const total = len + buried;
			const ds = total / (ARM_N - 1);
			const open0 = buried / total;
			const open1 = (buried + len * .25) / total;
			let opened = 0;
			for (let i = 1; i < ARM_N; i++) {
				const along = i / (ARM_N - 1);
				const sig = Math.max(0, (along * total - buried) / len);
				const o = smooth$1(open0, open1, along);
				const kSpread = spread * (o - opened);
				opened = o;
				const kr = kSpread + (curl * (pose.wrap > 0 ? smooth$1(.15, .7, sig) * 1.6 : 1) + tip * 2.2 * smooth$1(.55, 1, sig)) * (ds / len);
				const kt = pose.armWave * 2.2 * Math.sin(Math.PI * 2 * (sig * .9 - t * .55) + phase) * sig * (ds / len);
				rotate(T, R, kr);
				rotate(T, B, kt);
				if (pose.armDroop > .001 && sig > 0) {
					axis.crossVectors(T, this.gHead);
					const sn = axis.length();
					if (sn > 1e-4) {
						const a = Math.min(Math.asin(Math.min(1, sn)), pose.armDroop * 2.4 * (ds / len) * (.4 + .6 * smooth$1(0, .5, sig)));
						axis.multiplyScalar(1 / sn);
						T.applyAxisAngle(axis, a);
						R.applyAxisAngle(axis, a);
					}
				}
				R.addScaledVector(T, -R.dot(T)).normalize();
				B.crossVectors(T, R);
				pts[i].copy(pts[i - 1]).addScaledVector(T, ds);
				if (pose.sag > 0) pts[i].addScaledVector(this.gHead, pose.sag * ds * sig * .9);
			}
			if (pinch > .001) {
				tipP.set(0, 0, zA).addScaledVector(pinchDir, total * .95).addScaledVector(radial, F.armR * .55);
				for (let i = 1; i < ARM_N; i++) {
					const along = i / (ARM_N - 1);
					line.lerpVectors(pts[0], tipP, along).addScaledVector(radial, Math.sin(Math.PI * Math.min(1, along * 1.1)) * Rp * .28);
					pts[i].lerp(line, pinch * smooth$1(0, .3, along));
				}
			}
			const bundle = pose.armBundle * (1 - pose.wrap) * (1 - flare);
			if (bundle > .001) {
				tipB.set(0, 0, zA).addScaledVector(pinchDir, total * .97);
				const ring0 = Rp - rBase * .95;
				for (let i = 1; i < ARM_N; i++) {
					const along = i / (ARM_N - 1);
					const sig = Math.max(0, (along * total - buried) / len);
					const ring = ring0 + (F.armR * (1 - .82 * Math.pow(sig, .9)) * 1.15 - ring0) * smooth$1(0, .3, along);
					line.set(0, 0, zA).lerp(tipB, along).addScaledVector(radial, ring);
					pts[i].lerp(line, bundle * smooth$1(0, .12, along));
				}
			}
			if (hold && pose.wrap > .01) pushOut(pts, hold, F.armR * .7, pose.wrap, ds);
			this.keepAbove(pts, this.head, F.armR * .8);
			const r0 = F.armR * (k === 3 ? 1.1 : k === 0 ? .85 : 1);
			arm.tube.set(pts, (i) => {
				if (i === ARM_N - 1) return 0;
				const sig = Math.max(0, (i / (ARM_N - 1) * total - buried) / len);
				return (rBase + (r0 - rBase) * smooth$1(0, .3, sig)) * (1 - .82 * Math.pow(sig, .9));
			}, () => .85, tmp.copy(radial).multiplyScalar(-1), PART.arm, ml);
		}
	}
	/** 触腕：ふだんは腕の間で縮め（コウイカは隠す）、伸ばすときは掌部を tentTarget へまっすぐ飛ばす */
	buildTentacles() {
		const { TENT_N } = this.res;
		const { sp, form: F, ml } = this;
		const pose = this.resting ? NEUTRAL : this.pose;
		const zA = F.headLen;
		const { rest, dir, tmp, up } = this.st;
		const goal = this.st.goal.copy(this.tentTarget).applyMatrix4(this.mInv.copy(this.head.matrix).invert());
		const hold = this.holdInHead();
		const t = this.time;
		const tentR = F.armR * (sp.tentR / sp.armR);
		const clubR = F.armR * (sp.clubR / sp.armR);
		for (const tn of this.tents) {
			const radial = this.st.radial.set(Math.cos(tn.psi), Math.sin(tn.psi), 0);
			const base = this.st.base.set(F.hw(1) * .4 * radial.x, F.hb(1) * .4 * radial.y, zA - .02 * ml);
			const down = pose.armPitch + pose.armDroop * 1.1;
			const bun = pose.armBundle * (1 - pose.wrap);
			const open = (1 - pose.armPinch * .7) * (1 - bun);
			rest.set(radial.x * .08 * open, radial.y * .08 * open - Math.sin(down), Math.cos(down)).normalize();
			let restLen = sp.tentRest * ml * pose.tentShow;
			restLen += (Math.min(restLen, this.armMax * .6) - restLen) * bun;
			const off = this.st.off.copy(goal).sub(base);
			off.x += tn.side * .012 * ml;
			const want = Math.min(off.length(), sp.tentMax * ml);
			const o = pose.tentOut;
			const len = restLen + (want - restLen) * o;
			dir.copy(rest).lerp(off.normalize(), smooth$1(0, .6, o)).normalize();
			if (len <= .004) {
				tn.tip.copy(base);
				if (!tn.hidden) {
					for (const q of tn.pts) q.copy(base);
					tn.tube.set(tn.pts, () => 0, () => 1, tmp.copy(radial).multiplyScalar(-1), PART.tentacle, ml);
					tn.hidden = true;
				}
				continue;
			}
			tn.hidden = false;
			const side = this.st.side.crossVectors(dir, up).normalize();
			for (let i = 0; i < TENT_N; i++) {
				const sig = i / (TENT_N - 1);
				const p = tn.pts[i].copy(base).addScaledVector(dir, len * sig);
				const wob = (1 - o) * (1 - bun) * .04 * ml * Math.sin(sig * 5 + t * 1.3 + tn.side) * sig;
				p.addScaledVector(side, wob);
				if (pose.sag > 0) p.addScaledVector(this.gHead, pose.sag * len * sig * sig * .5);
			}
			if (hold && pose.wrap > .01) pushOut(tn.pts, hold, tentR, pose.wrap, len / TENT_N);
			this.keepAbove(tn.pts, this.head, tentR);
			tn.tip.copy(tn.pts[TENT_N - 1]);
			const club0 = .74;
			tn.tube.set(tn.pts, (i) => {
				const sig = i / (TENT_N - 1);
				if (i === TENT_N - 1) return 0;
				const c = smooth$1(club0, .82, sig) * (1 - smooth$1(.93, 1, sig) * .6);
				return tentR + (clubR - tentR) * c;
			}, (i) => 1 - .45 * smooth$1(club0, .82, i / (TENT_N - 1)), tmp.copy(radial).multiplyScalar(-1), PART.tentacle, ml);
		}
	}
};
/** T を R の方へ a だけ回す（R も一緒に回す） */
function rotate(T, R, a) {
	if (a === 0) return;
	const c = Math.cos(a);
	const s = Math.sin(a);
	const tx = T.x * c + R.x * s;
	const ty = T.y * c + R.y * s;
	const tz = T.z * c + R.z * s;
	R.set(R.x * c - T.x * s, R.y * c - T.y * s, R.z * c - T.z * s);
	T.set(tx, ty, tz);
}
/** 筒（a〜b、半径 r）の中に入った点を外へ押し出す。抱くときに腕が巻き付いて見える。
*  押し出したあと、節の長さを元の長さへ戻す（腕がのびない） */
var _ab = new THREE.Vector3();
var _c = new THREE.Vector3();
var _d = new THREE.Vector3();
function pushOut(pts, h, rArm, w, ds) {
	const ab = _ab.subVectors(h.b, h.a);
	const L2 = ab.lengthSq();
	const c = _c;
	const d = _d;
	const R = h.r + rArm;
	for (let i = 1; i < pts.length; i++) {
		const p = pts[i];
		d.subVectors(p, pts[i - 1]);
		const l = d.length();
		if (l > 1e-6) p.copy(pts[i - 1]).addScaledVector(d, ds / l);
		const t = Math.min(1, Math.max(0, d.subVectors(p, h.a).dot(ab) / L2));
		c.copy(h.a).addScaledVector(ab, t);
		d.subVectors(p, c);
		const dist = d.length();
		const pull = w * smooth$1(R * 3.2, R, dist);
		const want = dist < R ? R : dist + (R - dist) * pull;
		if (dist > 1e-6) p.copy(c).addScaledVector(d, want / dist);
	}
}
// src/game/squid/squid-behavior.ts
var clamp = (x, a, b) => Math.min(b, Math.max(a, x));
/** 動きで腕を根元から束ねるときの強さ（つまみでは 1 まで。動きでは 0.6 まで） */
var BUNDLE = .6;
var smooth = (a, b, x) => {
	const t = clamp((x - a) / (b - a), 0, 1);
	return t * t * (3 - 2 * t);
};
var angTo = (a, b, k) => {
	let d = b - a;
	while (d > Math.PI) d -= Math.PI * 2;
	while (d < -Math.PI) d += Math.PI * 2;
	return a + d * k;
};
/** 可動域：部品ごとに順に、いっぱいまで動かす（w = −1〜1 の往復） */
var RANGE = [
	{
		label: "外套膜：縮む −25% 〜 ふくらむ +10%",
		dur: 4,
		set: (p, w) => p.mantle = w < 0 ? w * .25 : w * .1
	},
	{
		label: "ひれ：波をいっぱいに（ゆっくり）",
		dur: 4,
		set: (p) => (p.finAmp = 2.2, p.finFreq = .35, p.finDir = 1)
	},
	{
		label: "ひれ：付け根から上下",
		dur: 4,
		set: (p, w) => (p.finAmp = 0, p.finLift = w * .6)
	},
	{
		label: "ひれ：たたむ（胴に巻く）",
		dur: 4,
		set: (p, w) => (p.finAmp = .1, p.finFold = (w + 1) / 2)
	},
	{
		label: "腕：開く 0 〜 1.1 rad",
		dur: 4,
		set: (p, w) => (p.armPinch = 0, p.armSpread = (w + 1) / 2 * 1.1, p.armGather = 0, p.armIdle = 0, p.armCurl = 0, p.armTip = 0)
	},
	{
		label: "腕：外へ反る 〜 内へ巻く",
		dur: 4,
		set: (p, w) => (p.armPinch = 0, p.armSpread = .35, p.armGather = 0, p.armIdle = 0, p.armCurl = w > 0 ? w * 1.5 : w * 2.6, p.armTip = w > 0 ? w * .6 : w * 1.2)
	},
	{
		label: "腕：横に揺らす",
		dur: 4,
		set: (p) => (p.armPinch = 0, p.armWave = 1, p.armSpread = .25, p.armGather = 0)
	},
	{
		label: "腕：I 腕を立てる",
		dur: 4,
		set: (p, w) => (p.armPinch = 0, p.armRaise = (w + 1) / 2 * 1.1)
	},
	{
		label: "腕：束ねる（逃げるとき）",
		dur: 3,
		set: (p, w) => (p.armPinch = 0, p.armGather = (w + 1) / 2, p.armIdle = 0, p.armPitch = 0, p.armCurl = 0, p.armTip = 0)
	},
	{
		label: "腕：下へ・上へ",
		dur: 4,
		set: (p, w) => (p.armPinch = 0, p.armPitch = w * .6)
	},
	{
		label: "腕：先をすぼめる（つぼみの形）",
		dur: 4,
		set: (p, w) => (p.armPinch = (w + 1) / 2, p.armGather = .3)
	},
	{
		label: "腕：だらんと垂らす",
		dur: 4,
		set: (p, w) => (p.armPinch = 0, p.armDroop = (w + 1) / 2, p.armGather = 0)
	},
	{
		label: "触腕：いっぱいに伸ばす（胴長の倍まで）",
		dur: 4,
		set: (p, w) => p.tentOut = (w + 1) / 2
	},
	{
		label: "漏斗：前（腕の方）〜 後ろ（胴の下）",
		dur: 4,
		set: (p, w) => (p.funnelAim = (w + 1) / 2 * 2.6, p.funnelOpen = 1)
	},
	{
		label: "頭：上下・左右",
		dur: 4,
		set: (p, _w, u) => (p.headPitch = Math.sin(u * Math.PI * 4) * .25, p.headYaw = Math.cos(u * Math.PI * 2) * .2)
	},
	{
		label: "目：見回す・瞳の開き",
		dur: 4,
		set: (p, w, u) => (p.eyeYaw = .15 + .5 * Math.sin(u * Math.PI * 4), p.eyePitch = .35 * Math.cos(u * Math.PI * 4), p.pupil = (w + 1) / 2)
	},
	{
		label: "色：濃く 〜 白く抜ける",
		dur: 4,
		set: (p, w) => (p.dark = w > 0 ? .25 + w * .75 : .25 * (1 + w), p.pale = w < 0 ? -w : 0)
	},
	{
		label: "色：流れる雲・ちらつき",
		dur: 4,
		set: (p) => (p.cloud = 1, p.flicker = 1, p.dark = .45)
	}
];
var SquidBrain = class {
	squid;
	fx;
	egi;
	mode = "hover";
	/** いまの段（画面に出す） */
	label = "";
	home = new THREE.Vector3();
	floorY = 0;
	yaw = 0;
	pitch = 0;
	roll = 0;
	vel = new THREE.Vector3();
	/** 釣り人の方（糸を引く先、ワールド） */
	anchor = new THREE.Vector3();
	/** 手で動かすときの姿勢（画面のつまみが書く） */
	manual = { ...NEUTRAL };
	/** エギを抱いている */
	holding = false;
	/** 水の外 */
	inAir = false;
	/** 水面の高さ（水面へ寄せる・吊り上げたとき） */
	surfaceY = 0;
	/** 水面を見せる */
	showSurface = false;
	egiShown = false;
	t = 0;
	phase = "";
	pt = 0;
	jetT = -1;
	jetStr = 0;
	jets = 0;
	nextLook = 0;
	lookYaw = .15;
	lookPitch = 0;
	circle = 0;
	tmp = new THREE.Vector3();
	tmp2 = new THREE.Vector3();
	fwd = new THREE.Vector3();
	egiVel = new THREE.Vector3();
	egiT = 0;
	constructor(squid, fx, egi, home) {
		this.squid = squid;
		this.fx = fx;
		this.egi = egi;
		this.home.copy(home);
		this.anchor.copy(home).add(new THREE.Vector3(0, 3, 6));
		this.surfaceY = home.y + .5;
		squid.direct.add("mantle");
		squid.direct.add("tentOut");
		this.reset();
	}
	get ml() {
		return this.squid.ml;
	}
	/** 向いている方（腕の方、ワールド） */
	forward(out = this.fwd) {
		return out.set(Math.sin(this.yaw) * Math.cos(this.pitch), -Math.sin(this.pitch), Math.cos(this.yaw) * Math.cos(this.pitch));
	}
	reset() {
		this.squid.root.position.copy(this.home);
		this.yaw = 0;
		this.pitch = 0;
		this.roll = 0;
		this.vel.set(0, 0, 0);
		this.release();
		this.fx.clear();
		this.circle = 0;
	}
	setMode(m) {
		const was = this.mode;
		this.mode = m;
		this.t = 0;
		this.pt = 0;
		this.phase = "";
		this.jets = 0;
		this.jetT = -1;
		const sq = this.squid;
		sq.target.tentOut = 0;
		const air = (x) => x === "lifted" || x === "landed";
		const hold = (x) => x === "hooked" || x === "surface" || x === "lifted";
		this.inAir = air(m);
		this.fx.hard = m === "landed";
		this.showSurface = m === "surface" || m === "lifted";
		if (air(was) || was === "bury" || was === "surface" && m !== "lifted" || hold(was) && !hold(m)) this.reset();
		if (!hold(m)) this.release();
		if (m === "attack" || m === "follow" || m === "refuse") this.reset();
		if (hold(m) && !this.holding) this.grabNow();
		if (m === "attack" || m === "refuse") this.placeEgi();
		if (m === "follow") {
			this.placeEgi(.7, .3);
			this.egiT = 0;
		}
		if (m === "lifted") {
			this.pitch = -Math.PI / 2;
			sq.pose.sag = 1;
		}
		sq.ground = m === "landed" ? this.floorY : m === "rest" || m === "bury" ? this.floorY - (m === "bury" ? .03 : 0) : null;
		this.egiShown = m === "attack" || m === "follow" || m === "refuse" || hold(m);
		this.egi.obj.visible = this.egiShown;
	}
	release() {
		this.holding = false;
		this.squid.hold = null;
		this.squid.target.wrap = 0;
	}
	/** エギを抱いた形にすぐする（掛かった・吊るしたから見るとき） */
	grabNow() {
		this.holding = true;
		this.setHold();
		this.squid.pose.wrap = this.squid.target.wrap = 1;
	}
	egiZ() {
		return this.squid.armBaseZ + this.egi.len * .5 - .004;
	}
	setHold() {
		const z0 = this.squid.armBaseZ;
		this.squid.hold = {
			a: new THREE.Vector3(0, 0, z0 + .004),
			b: new THREE.Vector3(0, 0, z0 + this.egi.len * .98),
			r: this.egi.r
		};
	}
	/** エギを、イカの前 0.75m・少し上に置く（沈みながら漂う） */
	placeEgi(ahead = .75, up = .1) {
		const f = this.forward(this.tmp);
		this.egi.obj.position.copy(this.squid.root.position).addScaledVector(f, ahead).add(new THREE.Vector3(.12, up, 0));
		this.egi.obj.rotation.set(.35, this.yaw + 1.2, 0, "YXZ");
		this.egiVel.set(0, -.025, 0);
	}
	/** ジェット：ふくらむ → 縮んで噴く → 吸い直す。噴いた反対へ進む */
	/** 水の外で噴くとき、この回は墨を混ぜるか（INK_TUNE.airEvery 回に 1 回。0 で混ぜない） */
	inkyJet() {
		const n = Math.round(INK_TUNE.airEvery);
		return n > 0 && this.jets % n === 0;
	}
	/** 今すぐ墨を吐く（見るページのボタン）。水の中は墨の雲、水の外は漏斗から墨を噴く */
	spitInk() {
		const sq = this.squid;
		const pos = new THREE.Vector3();
		const dir = new THREE.Vector3();
		sq.funnelOut(pos, dir);
		if (this.inAir) {
			if (this.mode === "landed") dir.y = Math.max(dir.y, .45);
			this.fx.squirt(pos, dir.normalize(), true, 1);
		} else {
			this.jet(.8);
			this.fx.ink(pos, dir, sq.ml * (sq.sp.inkSpread > .5 ? .35 : .55), sq.sp.inkSpread);
		}
	}
	jet(strength) {
		this.jetT = 0;
		this.jetStr = strength;
		this.jets++;
	}
	updateJet(dt) {
		const sq = this.squid;
		const s = this.jetStr * sq.sp.jet;
		if (this.jetT < 0) {
			sq.target.mantle = 0;
			return false;
		}
		const t0 = this.jetT;
		this.jetT += dt;
		const t = this.jetT;
		if (t < .14) sq.target.mantle = .09 * smooth(0, .14, t) * Math.min(1, s + .3);
		else if (t < .27) {
			sq.target.mantle = .09 * Math.min(1, s + .3) - (.09 + .24 * Math.min(1.1, s)) * smooth(.14, .24, t);
			if (t0 < .14) {
				const pos = this.tmp;
				const dir = this.tmp2;
				sq.funnelOut(pos, dir);
				this.vel.addScaledVector(dir, -2.4 * s);
			}
		} else if (t < .75) sq.target.mantle = -(.24 * Math.min(1.1, s)) * (1 - smooth(.27, .75, t));
		else {
			sq.target.mantle = 0;
			this.jetT = -1;
		}
		return this.jetT >= 0 && t < .3;
	}
	/** 向きを dir へ少しずつ回す（k は 1 秒あたり） */
	face(dir, k, dt, maxPitch = .7) {
		if (dir.lengthSq() < 1e-8) return;
		const d = this.tmp2.copy(dir).normalize();
		const yaw = Math.atan2(d.x, d.z);
		const pitch = clamp(-Math.asin(clamp(d.y, -1, 1)), -maxPitch, maxPitch);
		const a = 1 - Math.exp(-k * dt);
		this.yaw = angTo(this.yaw, yaw, a);
		this.pitch += (pitch - this.pitch) * a;
	}
	/** 体を水平に戻す */
	level(dt, k = 1.5) {
		this.pitch += (0 - this.pitch) * (1 - Math.exp(-k * dt));
		this.roll += (0 - this.roll) * (1 - Math.exp(-k * dt));
	}
	/** 目と頭をワールドの点 p の方へ */
	lookAt(p, headK = .3) {
		const sq = this.squid;
		const d = this.tmp.copy(p);
		sq.root.worldToLocal(d);
		d.z -= sq.armBaseZ * .4;
		d.normalize();
		const tg = sq.target;
		tg.eyeYaw = clamp(Math.atan2(d.z, Math.abs(d.x) + 1e-4), -.4, .7);
		tg.eyePitch = clamp(Math.asin(d.y), -.4, .4);
		tg.headYaw = clamp(Math.atan2(d.x, Math.max(.05, d.z)) * headK, -.2, .2);
		tg.headPitch = clamp(Math.asin(d.y) * headK, -.2, .2);
	}
	/** ふだんの目：ときどきあちこちを見る */
	idleLook(dt) {
		this.nextLook -= dt;
		if (this.nextLook < 0) {
			this.nextLook = .8 + Math.random() * 2.2;
			this.lookYaw = -.1 + Math.random() * .6;
			this.lookPitch = (Math.random() - .5) * .4;
		}
		const tg = this.squid.target;
		tg.eyeYaw = this.lookYaw;
		tg.eyePitch = this.lookPitch;
		tg.headYaw = 0;
		tg.headPitch = 0;
	}
	/** 速さを want へ（k は 1 秒あたり） */
	steer(want, k, dt) {
		this.vel.lerp(want, 1 - Math.exp(-k * dt));
	}
	update(dt) {
		const sq = this.squid;
		const tg = sq.target;
		this.t += dt;
		this.pt += dt;
		const p = sq.root.position;
		const t = this.t;
		if (this.mode !== "manual") Object.assign(tg, NEUTRAL, {
			mantle: tg.mantle,
			tentOut: tg.tentOut,
			wrap: this.holding ? 1 : 0
		});
		if (this.mode !== "manual" && ![
			"hover",
			"forward",
			"backward",
			"turn",
			"follow",
			"refuse",
			"attack"
		].includes(this.mode)) tg.armPinch = 0;
		if (sq.sp.id === "kouika") {
			tg.dark = .45;
			tg.tentShow = 0;
			tg.armSpread = .06;
			tg.armGather = .35;
			tg.armPitch = .18;
		}
		let drag = 1.6;
		const ml = this.ml;
		switch (this.mode) {
			case "hover": {
				const pose = this.armPosture(t);
				this.label = "ひれを波打たせて、その場にとどまる（腕：" + pose + "）";
				const drift = this.tmp.set(Math.sin(t * .31) * .04, Math.sin(t * .43) * .02, Math.cos(t * .27) * .03).add(this.home).sub(p);
				this.steer(drift.multiplyScalar(.8), 2, dt);
				this.level(dt);
				this.yaw = angTo(this.yaw, Math.sin(t * .2) * .3, 1 - Math.exp(-.5 * dt));
				this.idleLook(dt);
				break;
			}
			case "forward":
			case "backward": {
				tg.armPinch = .9;
				const back = this.mode === "backward";
				const speed = (sq.sp.id === "aori" ? .16 : .08) * (back ? 1.3 : 1);
				const R = .7;
				this.circle += speed / R * dt;
				const c = this.circle;
				const goal = this.tmp.set(Math.sin(c) * R, Math.sin(c * 2) * .06, -Math.cos(c) * R + R).add(this.home);
				const want = new THREE.Vector3(Math.cos(c) * R, Math.cos(c * 2) * .12, Math.sin(c) * R).normalize().clone().multiplyScalar(speed).add(goal.sub(p).multiplyScalar(1.2));
				this.steer(want, 3, dt);
				this.face(back ? this.vel.clone().negate() : this.vel, 2.5, dt);
				this.roll = (back ? -1 : 1) * .12;
				this.idleLook(dt);
				if (back) {
					this.label = "ひれの波を後ろから前へ、弱いジェットを足して胴の先から進む";
					tg.finDir = -1;
					tg.finAmp = 1.5;
					tg.finFreq = 1.3;
					tg.armGather = .85;
					tg.armSpread = 0;
					tg.armCurl = 0;
					tg.armTip = .1;
					tg.armPitch = .04;
					tg.armWave = .08;
					tg.funnelAim = .05;
					tg.funnelOpen = .6;
					if (this.pt > 1.4) {
						this.pt = 0;
						this.jet(.25);
					}
				} else {
					tg.finDir = 1;
					tg.finAmp = 1.6;
					tg.finFreq = 1.25;
					tg.armGather = .55;
					tg.armPitch = .06;
					tg.funnelAim = 1.6;
					const c16 = t % 16;
					const bun = smooth(2, 3.5, c16) * (1 - smooth(11, 12.5, c16));
					tg.armBundle = BUNDLE * bun;
					tg.armPinch *= 1 - bun;
					tg.armPitch *= 1 - bun;
					tg.armWave *= 1 - bun;
					this.label = "ひれの波を前から後ろへ流して、腕の方へ進む" + (bun > .5 ? "（腕：根元から束ねる）" : "");
				}
				break;
			}
			case "escape": {
				const spec = sq.sp;
				if (t < 2.4) {
					this.label = t < .15 ? "驚いて白く抜ける" : t < .4 ? "墨を吐いて、ひれをたたみ、一気に縮んで噴く" : "胴の先から飛ぶように離れる";
					tg.pale = 1;
					tg.dark = 0;
					tg.pupil = 1;
					tg.eyeYaw = .5;
					tg.finFold = t > .1 ? 1 : 0;
					tg.finAmp = .15;
					tg.armGather = 1;
					tg.armSpread = 0;
					tg.armCurl = 0;
					tg.armTip = 0;
					tg.armPitch = 0;
					tg.armIdle = 0;
					tg.armWave = 0;
					tg.funnelAim = 0;
					tg.funnelOpen = 1;
					if (this.jets === 0 && t > .12) {
						this.jet(1);
						const pos = this.tmp;
						const dir = this.tmp2;
						sq.funnelOut(pos, dir);
						this.fx.ink(pos, dir, ml * (spec.inkSpread > .5 ? .35 : .55), spec.inkSpread);
					} else if (this.jets === 1 && t > .85) this.jet(.75);
					else if (this.jets === 2 && t > 1.55) this.jet(.55);
					this.level(dt, .6);
					drag = 1.3;
				} else {
					this.label = "向きを変えて、ひれで戻る";
					tg.dark = .35;
					const back = this.tmp.copy(this.home).sub(p);
					const d = back.length();
					this.face(back, 1.6, dt);
					tg.finDir = 1;
					tg.finAmp = 1.5;
					tg.finFreq = 1.2;
					tg.armGather = .5;
					this.steer(back.normalize().multiplyScalar(Math.min(.15, d * .6) * smooth(2.4, 3.6, t)), 2, dt);
					if (d < .06 && t > 4) this.setMode("hover");
				}
				break;
			}
			case "attack":
				drag = this.updateAttack(dt);
				break;
			case "hooked": {
				this.label = "糸に引かれ、胴の先の方へジェットで何度も逆らう";
				const toA = this.tmp.copy(this.anchor).sub(p).normalize();
				this.face(toA, 3, dt);
				this.steer(toA.clone().multiplyScalar(.22), 1.2, dt);
				tg.finDir = -1;
				tg.finAmp = 1.8;
				tg.finFreq = 1.7;
				tg.funnelAim = 0;
				tg.funnelOpen = 1;
				tg.dark = .55 + .4 * Math.sin(t * 3.1);
				tg.flicker = 1;
				tg.cloud = sq.sp.id === "aori" ? .5 : 0;
				tg.pupil = 1;
				tg.eyeYaw = .4;
				if (this.pt > .85) {
					this.pt = 0;
					this.jet(.8);
					if (this.jets % 4 === 3) {
						const pos = this.tmp2;
						const dir = new THREE.Vector3();
						sq.funnelOut(pos, dir);
						this.fx.ink(pos.clone(), dir, ml * .3, sq.sp.inkSpread);
					}
				}
				if (p.distanceTo(this.home) > 1.1) {
					p.copy(this.home).addScaledVector(toA, -.3);
					this.vel.set(0, 0, 0);
				}
				drag = 1;
				break;
			}
			case "lifted":
				this.updateLifted(dt);
				break;
			case "rest": {
				const kou = sq.sp.id === "kouika";
				this.label = kou ? "砂の上に腕を下ろして座り、ひれのふちだけ波打たせる" : "海底近くで止まる（アオリは座らない）";
				const y = this.floorY + (kou ? sq.bellyDepth * .95 : .12);
				this.steer(this.tmp.set(this.home.x - p.x, y - p.y, this.home.z - p.z).multiplyScalar(2.5), 3, dt);
				this.level(dt);
				this.idleLook(dt);
				tg.finAmp = kou ? .3 : .45;
				tg.finFreq = kou ? 1.3 : .8;
				tg.finDir = 1;
				tg.breathe = .7;
				if (kou) {
					tg.armPitch = .38;
					tg.armSpread = .16;
					tg.armCurl = .4;
					tg.armTip = .2;
					tg.armGather = .15;
					tg.armIdle = .3;
					tg.dark = .6;
					tg.finLift = .05;
				}
				break;
			}
			case "turn": {
				tg.armPinch = .75;
				const goal = (Math.floor(t / 3.2) % 2 ? -1 : 1) * Math.PI * .5;
				const left = angTo(this.yaw, goal, 1) - this.yaw;
				this.label = "その場で向きを変える（左右のひれで波を逆に流す。目と頭が先に回る）";
				const spin = clamp(left * 1.4, -.9, .9);
				this.yaw += spin * dt;
				tg.finTurn = clamp(left * 1.5, -.9, .9);
				tg.finAmp = 1.2 + .5 * Math.min(1, Math.abs(left));
				tg.finFreq = 1.2;
				tg.headYaw = clamp(left * .25, -.2, .2);
				tg.eyeYaw = .35;
				tg.armWave = .25;
				this.steer(this.tmp.copy(this.home).sub(p).multiplyScalar(.8), 2, dt);
				this.level(dt);
				break;
			}
			case "follow":
				drag = this.updateFollow(dt);
				break;
			case "refuse":
				drag = this.updateRefuse(dt);
				break;
			case "surface":
				drag = this.updateSurface(dt);
				break;
			case "landed":
				this.updateLanded(dt);
				break;
			case "bury":
				drag = this.updateBury(dt);
				break;
			case "range": {
				let u = t % RANGE.reduce((a, r) => a + r.dur, 0);
				let i = 0;
				while (u > RANGE[i].dur) u -= RANGE[i++].dur;
				const step = RANGE[i];
				const ph = u / step.dur;
				const w = Math.sin(ph * Math.PI * 2);
				tg.armIdle = .2;
				tg.finAmp = .2;
				tg.breathe = 0;
				tg.mantle = 0;
				tg.tentOut = 0;
				step.set(tg, w, ph, sq);
				this.label = `${i + 1}/${RANGE.length} ${step.label}`;
				sq.tentTarget.set(0, -.05 * ml, sq.armBaseZ + sq.tentReach * 1.1);
				this.steer(this.tmp.copy(this.home).sub(p).multiplyScalar(2), 4, dt);
				this.level(dt, 3);
				this.yaw = angTo(this.yaw, 0, 1 - Math.exp(-3 * dt));
				break;
			}
			case "manual":
				this.label = "つまみで部品を動かす";
				Object.assign(tg, this.manual);
				sq.tentTarget.set(0, -.05 * ml, sq.armBaseZ + sq.tentReach * 1.1);
				this.steer(this.tmp.copy(this.home).sub(p).multiplyScalar(2), 4, dt);
				this.level(dt, 3);
				this.yaw = angTo(this.yaw, 0, 1 - Math.exp(-3 * dt));
		}
		if (this.mode !== "range" && this.mode !== "manual" && this.mode !== "lifted" && this.mode !== "landed") this.updateJet(dt);
		if (this.mode !== "lifted" && this.mode !== "landed") {
			this.vel.multiplyScalar(Math.exp(-drag * dt * (this.jetT >= 0 ? .5 : 1)));
			p.addScaledVector(this.vel, dt);
			if (this.mode !== "bury") p.y = Math.max(this.floorY + .03, p.y);
		}
		sq.root.rotation.set(this.pitch, this.yaw, this.roll, "YXZ");
		sq.root.updateMatrixWorld(true);
		if (this.holding) {
			const e = this.egi.obj;
			e.position.set(0, 0, this.egiZ()).applyMatrix4(sq.root.matrixWorld);
			e.quaternion.copy(sq.root.quaternion);
		}
	}
	/** エギを抱く：気づく → 腕から近寄る → 間をはかる → 触腕を一瞬で伸ばす → 引き寄せる → 8 本で抱く */
	updateAttack(dt) {
		const sq = this.squid;
		const tg = sq.target;
		const ml = this.ml;
		const kou = sq.sp.id === "kouika";
		const e = this.egi.obj;
		const p = sq.root.position;
		const next = (ph) => {
			this.phase = ph;
			this.pt = 0;
		};
		if (!this.phase) next("notice");
		if (this.phase === "notice" || this.phase === "approach" || this.phase === "aim") {
			this.egiVel.y = -.02;
			e.position.addScaledVector(this.egiVel, dt);
			e.position.x += Math.sin(this.t * 1.7) * .01 * dt;
			e.position.y = Math.max(this.floorY + .15, e.position.y);
		}
		const toE = new THREE.Vector3().subVectors(e.position, p);
		const reach = sq.armBaseZ + sq.armMax * .85 + (kou ? .35 : .55) * ml;
		tg.armIdle = .5;
		switch (this.phase) {
			case "notice":
				this.label = "気づく：目と頭をエギへ、色が濃くなる" + (kou ? "、I 腕を立てる" : "");
				this.face(toE, 2.2, dt);
				this.lookAt(e.position);
				this.steer(new THREE.Vector3(), 3, dt);
				tg.pupil = 1;
				tg.dark = kou ? .6 : .5;
				tg.armRaise = kou ? .75 : 0;
				tg.cloud = kou ? 0 : .35;
				tg.armBundle = BUNDLE;
				if (this.pt > .9) next("approach");
				break;
			case "approach": {
				this.label = "腕から近寄る（ひれで、ゆっくり）";
				this.face(toE, 3, dt);
				this.lookAt(e.position);
				const d = toE.length();
				const want = toE.clone().normalize().multiplyScalar(clamp((d - reach) * 1.5, -.05, kou ? .13 : .22));
				this.steer(want, 2.5, dt);
				tg.finDir = 1;
				tg.finAmp = 1.5;
				tg.finFreq = 1.1;
				tg.armGather = .7;
				tg.armSpread = .04;
				tg.armPitch = 0;
				tg.armCurl = 0;
				tg.armTip = .1;
				tg.armWave = .3;
				tg.armRaise = kou ? .6 : 0;
				tg.dark = kou ? .65 : .6;
				tg.cloud = kou ? 0 : .4;
				tg.pupil = 1;
				tg.armBundle = BUNDLE;
				tg.armWave = .15;
				if (Math.abs(d - reach) < .025 || this.pt > 8) next("aim");
				break;
			}
			case "aim": {
				tg.armPinch = .35;
				this.label = "止まって間をはかる（腕先が揺れる）";
				this.face(toE, 4, dt);
				this.lookAt(e.position, .5);
				const d = toE.length();
				this.steer(toE.clone().normalize().multiplyScalar((d - reach) * 1.5), 3, dt);
				tg.finAmp = 1.2;
				tg.finDir = 1;
				tg.armGather = .75;
				tg.armSpread = .02;
				tg.armPitch = -.02;
				tg.armCurl = 0;
				tg.armWave = .55;
				tg.armRaise = kou ? .4 : 0;
				tg.dark = .75;
				tg.flicker = .4;
				tg.pupil = 1;
				tg.armBundle = BUNDLE;
				tg.armWave = .3;
				if (this.pt > .7) next("strike");
				break;
			}
			case "strike": {
				tg.armPinch = 0;
				this.label = "触腕を一瞬で伸ばす（本物は 20〜40 ms。スローで見る）";
				const dur = kou ? .045 : .035;
				tg.tentOut = smooth(0, dur, this.pt);
				sq.tentTarget.copy(e.position);
				sq.root.worldToLocal(sq.tentTarget);
				this.lookAt(e.position, .5);
				tg.armGather = 0;
				tg.armSpread = .4;
				tg.armCurl = -.2;
				tg.armPitch = -.05;
				tg.dark = .85;
				tg.pupil = 1;
				if (this.pt < dt * 1.5) this.vel.addScaledVector(this.forward(), .2);
				if (this.pt > dur) next("grab");
				break;
			}
			case "grab":
				tg.armPinch = 0;
				this.label = "掌部でつかむ";
				tg.tentOut = 1;
				tg.armGather = 0;
				tg.armSpread = .45;
				tg.armCurl = -.3;
				tg.dark = .9;
				this.lookAt(e.position, .5);
				sq.tentTarget.copy(e.position);
				sq.root.worldToLocal(sq.tentTarget);
				if (this.pt > .06) next("pull");
				break;
			case "pull": {
				tg.armPinch = 0;
				this.label = "触腕を縮めて、腕の所まで引き寄せる";
				const k = smooth(0, .38, this.pt);
				tg.tentOut = 1 - k;
				tg.armGather = 0;
				tg.armSpread = .45 * (1 - k) + .25 * k;
				tg.armCurl = -.3;
				tg.dark = .9;
				tg.flicker = .6;
				const holdP = new THREE.Vector3(0, 0, this.egiZ());
				const club = sq.clubCenter(new THREE.Vector3());
				sq.tentTarget.lerp(holdP, 1 - Math.exp(-dt * 6));
				const at = club.clone().lerp(holdP, k * k);
				e.position.copy(at.applyMatrix4(sq.root.matrixWorld));
				e.quaternion.slerp(sq.root.quaternion, 1 - Math.exp(-dt * 8));
				this.steer(new THREE.Vector3(), 3, dt);
				if (this.pt > .4) {
					this.holding = true;
					this.setHold();
					next("hold");
				}
				break;
			}
			case "hold":
				tg.armPinch = 0;
				this.label = "8 本の腕で抱く（色がちらちら変わる）";
				tg.wrap = 1;
				tg.tentOut = 0;
				tg.dark = .75 + .15 * Math.sin(this.t * 2);
				tg.flicker = 1;
				tg.cloud = kou ? 0 : .5;
				tg.finAmp = 1.3;
				tg.finFreq = 1.2;
				tg.pupil = .9;
				tg.eyeYaw = .45;
				this.steer(new THREE.Vector3(Math.sin(this.t) * .02, 0, 0), 2, dt);
				this.level(dt, .8);
		}
		return 1.6;
	}
	/** エギを追う：エギはしゃくり（0.35 秒で跳ね上がる）と、3 秒かけて沈むのをくり返す。
	*  イカは後ろ下に間を保ってついていき、目と頭で追う。離れすぎたら短いジェットで詰める */
	updateFollow(dt) {
		const sq = this.squid;
		const tg = sq.target;
		const e = this.egi.obj;
		const p = sq.root.position;
		const kou = sq.sp.id === "kouika";
		this.egiT += dt;
		const ct = this.egiT % 3.6;
		const jerk = ct < .35;
		if (jerk) {
			this.egiVel.set(Math.sin(this.egiT * .7) * .12, 1.15 * (1 - ct / .35), 0);
			e.rotation.x += (-.7 - e.rotation.x) * (1 - Math.exp(-12 * dt));
		} else {
			this.egiVel.lerp(this.tmp.set(Math.sin(this.t * 1.3) * .04, -.09, 0), 1 - Math.exp(-3 * dt));
			e.rotation.x += (.4 - e.rotation.x) * (1 - Math.exp(-2 * dt));
		}
		e.position.addScaledVector(this.egiVel, dt);
		e.position.x += (this.home.x + .15 - e.position.x) * (1 - Math.exp(-.3 * dt));
		e.position.z += (this.home.z + .4 - e.position.z) * (1 - Math.exp(-.3 * dt));
		e.position.y = clamp(e.position.y, this.floorY + .25, this.surfaceY - .15);
		const toE = new THREE.Vector3().subVectors(e.position, p);
		const flat = toE.clone().setY(0);
		if (flat.lengthSq() < 1e-6) flat.set(0, 0, 1);
		flat.normalize();
		const keep = (kou ? .38 : .55) + this.armReach() * .5;
		const off = e.position.clone().addScaledVector(flat, -keep).add(new THREE.Vector3(0, -.12, 0)).sub(p);
		this.steer(off.clone().multiplyScalar(1.4).clampLength(0, kou ? .18 : .32), 2.5, dt);
		this.face(toE, 3, dt);
		this.lookAt(e.position, .45);
		this.label = jerk ? "エギが跳ねる：目で追い、間を保ってついていく" : "エギが沈む：後ろ下から間合いを詰める";
		if (jerk && ct < dt * 1.5 && toE.length() > keep + .25) {
			tg.funnelAim = 2.4;
			this.jet(.45);
		} else tg.funnelAim = this.jetT >= 0 ? 2.4 : 1.4;
		tg.finDir = 1;
		tg.finAmp = 1.5;
		tg.finFreq = 1.25;
		tg.armGather = .6;
		tg.armSpread = .05;
		tg.armPitch = .02;
		tg.armWave = .35;
		tg.armRaise = kou ? .35 : 0;
		tg.armBundle = BUNDLE;
		tg.armPinch = .3;
		tg.armWave = .15;
		tg.dark = (kou ? .55 : .45) + .12 * Math.sin(this.t * 1.7);
		tg.cloud = kou ? 0 : .3;
		tg.pupil = .95;
		return 1.6;
	}
	/** 水の外（吊り上げた・陸に置いた）のひれ：ホバリングと同じ波（波 1.5・向き 1・ゆっくり）を基本に、
	*  ときどきゆっくり弱めては（波 0.8 ほど、少し遅く。止めない）戻す。2 つの遅い波をかけて、弱める間隔をそろえない。
	*  水から出て（置かれて）すぐの 3 秒は弱めず、ずっとひれを動かしている。
	*  弱めているあいだは垂れて少したたむ（fold）。返すのは、いまのひれの様子 */
	airFins(t, fold) {
		const tg = this.squid.target;
		const weak = smooth(.15, .7, Math.sin(t * .55) * .6 + Math.sin(t * .23 + 1.3) * .5) * smooth(3, 6, this.t);
		tg.finAmp = NEUTRAL.finAmp * (1 - .45 * weak);
		tg.finFreq = NEUTRAL.finFreq * (1 - .2 * weak);
		tg.finDir = NEUTRAL.finDir;
		tg.finFold = fold * weak;
		return weak > .5 ? "（ひれ：弱めている）" : "（ひれ：ホバリングと同じ波）";
	}
	/** ホバリングの腕の構え（時間で切り替える）：先をすぼめる・だらんと垂らす・少しゆるめる */
	armPosture(t) {
		const tg = this.squid.target;
		const c = t % 22;
		if (c < 10) {
			tg.armPinch = 1;
			tg.armDroop = 0;
			tg.armGather = .3;
			tg.armWave = .08;
			return "先をすぼめる";
		}
		if (c < 17) {
			tg.armPinch = .12;
			tg.armDroop = .85;
			tg.armPitch = .25;
			tg.armGather = 0;
			tg.armSpread = .1;
			tg.armCurl = 0;
			tg.armTip = .15;
			tg.armWave = .12;
			return "だらんと垂らす";
		}
		tg.armPinch = .45;
		tg.armDroop = .2;
		return "少しゆるめる";
	}
	/** 腕の先までの長さ（胴の前の縁から） */
	armReach() {
		return this.squid.armBaseZ + this.squid.armMax;
	}
	/** 見切る：エギへ寄って止まり、迷って（白と濃い色がちらつく）、後ろへ下がり、向きを変えて離れる */
	updateRefuse(dt) {
		const sq = this.squid;
		const tg = sq.target;
		const e = this.egi.obj;
		const p = sq.root.position;
		const kou = sq.sp.id === "kouika";
		const next = (ph) => {
			this.phase = ph;
			this.pt = 0;
		};
		if (!this.phase) next("approach");
		const toE = new THREE.Vector3().subVectors(e.position, p);
		const d = toE.length();
		const stopAt = this.armReach() + (kou ? .3 : .45) * this.ml + .1;
		switch (this.phase) {
			case "approach":
				this.label = "腕からエギへ寄る";
				this.face(toE, 3, dt);
				this.lookAt(e.position);
				this.steer(toE.clone().normalize().multiplyScalar(clamp((d - stopAt) * 1.5, -.05, kou ? .13 : .2)), 2.5, dt);
				tg.finDir = 1;
				tg.finAmp = 1.5;
				tg.armGather = .6;
				tg.armWave = .15;
				tg.armBundle = BUNDLE;
				tg.dark = .5;
				tg.pupil = 1;
				if (Math.abs(d - stopAt) < .03 || this.pt > 7) next("doubt");
				break;
			case "doubt": {
				this.label = "止まって迷う（色が白と濃いのを行き来する）";
				tg.armPinch = .3;
				this.lookAt(e.position, .5);
				this.steer(new THREE.Vector3(), 3, dt);
				const f = Math.sin(this.pt * 7);
				tg.dark = .45 + .3 * f;
				tg.pale = Math.max(0, -f) * .5;
				tg.cloud = kou ? 0 : .8;
				tg.armWave = .55;
				tg.armGather = .45;
				tg.finDir = 1;
				tg.finAmp = 1.2;
				if (this.pt > 1.4) next("back");
				break;
			}
			case "back":
				this.label = "ひれの波を逆にして、後ろへ下がる";
				this.lookAt(e.position, .4);
				this.steer(this.forward(this.tmp).clone().multiplyScalar(-.14), 2.5, dt);
				tg.finDir = -1;
				tg.finAmp = 1.5;
				tg.funnelAim = 0;
				tg.armGather = .8;
				tg.dark = .3;
				tg.pale = .2;
				if (this.pt < dt * 1.5) this.jet(.3);
				if (this.pt > 1.3) next("leave");
				break;
			case "leave": {
				this.label = "向きを変えて離れていく（見切った）";
				const away = toE.clone().setY(0).negate().normalize();
				this.face(away, 2, dt);
				this.steer(this.forward(this.tmp).clone().multiplyScalar(kou ? .08 : .14), 2, dt);
				tg.finDir = 1;
				tg.finAmp = 1.5;
				tg.dark = .25;
				this.idleLook(dt);
				if (this.pt > 3) {
					this.reset();
					this.placeEgi();
					next("approach");
				}
				break;
			}
		}
		return 1.6;
	}
	/** 水面へ寄せる：抱いたエギごと上へ引かれ、胴の先の方（下）へジェットで逆らい、墨も吐く。水面で暴れてから吊り上げる */
	updateSurface(dt) {
		const sq = this.squid;
		const tg = sq.target;
		const p = sq.root.position;
		const next = (ph) => {
			this.phase = ph;
			this.pt = 0;
		};
		if (!this.phase) next("up");
		const above = new THREE.Vector3(this.home.x + .1, this.surfaceY, this.home.z + .15);
		const egiTop = new THREE.Vector3(0, 0, this.egiZ() + this.egi.len * .5).applyMatrix4(sq.root.matrixWorld);
		tg.flicker = 1;
		tg.pupil = 1;
		tg.eyeYaw = .35;
		tg.funnelAim = 0;
		tg.funnelOpen = 1;
		if (this.phase === "up") {
			this.label = "上へ引かれ、胴の先の方（下）へジェットで逆らう。墨も吐く";
			const toA = above.clone().sub(egiTop);
			this.face(toA, 2.5, dt, 1.25);
			const surge = .22 + .1 * Math.max(0, Math.sin(this.t * 2.3));
			this.steer(toA.clone().normalize().multiplyScalar(surge), 2.5, dt);
			tg.finDir = -1;
			tg.finAmp = 1.8;
			tg.finFreq = 1.6;
			tg.dark = .55 + .4 * Math.sin(this.t * 3.4);
			tg.cloud = sq.sp.id === "aori" ? .6 : 0;
			if (this.pt > .9) {
				this.pt = 0;
				this.jet(.12);
				if (this.jets === 2) {
					const pos = new THREE.Vector3();
					const dir = new THREE.Vector3();
					sq.funnelOut(pos, dir);
					this.fx.ink(pos, dir, this.ml * .35, sq.sp.inkSpread);
				}
			}
			if (egiTop.y > this.surfaceY - .02) {
				next("top");
				this.fx.splash(new THREE.Vector3(egiTop.x, this.surfaceY, egiTop.z), .8);
			}
			return 1;
		}
		this.label = "水面で暴れ、漏斗から水を噴く";
		this.face(new THREE.Vector3(0, 1, .3), 2, dt, 1.25);
		this.steer(new THREE.Vector3(0, (this.surfaceY - .02 - egiTop.y) * 2, 0), 3, dt);
		tg.finAmp = 2;
		tg.finFreq = 1.9;
		tg.dark = .5 + .45 * Math.sin(this.t * 4.1);
		tg.pale = Math.max(0, Math.sin(this.t * 2.2) - .5);
		if (this.pt > .25 && this.pt % .6 < dt) {
			this.jet(.6);
			const pos = new THREE.Vector3();
			const dir = new THREE.Vector3();
			sq.funnelOut(pos, dir);
			if (pos.y > this.surfaceY - .05) this.fx.squirt(pos, dir, false, .6);
			this.fx.splash(new THREE.Vector3(p.x, this.surfaceY, p.z), .35);
		}
		if (this.pt > 1.6) this.setMode("lifted");
		return 1.2;
	}
	/** 陸に置いた：自分の重さで平たくなり、ひれと腕がだらりと地面に付く。ときどき水や墨を噴き、色がめまぐるしく変わる */
	updateLanded(dt) {
		const sq = this.squid;
		const tg = sq.target;
		const t = this.t;
		const kou = sq.sp.id === "kouika";
		this.label = "陸に置いた：体が平たくつぶれ、腕が地面に付く。ときどき水や墨を噴き、色がめまぐるしく変わる";
		this.pitch = 0;
		this.roll = .04 * Math.sin(t * .9);
		sq.root.position.set(this.home.x, this.floorY + sq.bellyDepth * (1 - .32 * sq.pose.flat) + .002, this.home.z);
		sq.root.rotation.set(this.pitch, this.yaw, this.roll, "YXZ");
		tg.flat = 1;
		tg.sag = 1;
		this.label += this.airFins(t + 2, 0);
		tg.armSpread = .35;
		tg.armGather = 0;
		tg.armPitch = .1;
		tg.armCurl = .3;
		tg.armTip = .4;
		tg.armWave = .45;
		tg.armIdle = 1.3;
		tg.breathe = 2.3;
		tg.funnelAim = .3;
		tg.funnelOpen = 1;
		tg.dark = .5 + .4 * Math.sin(t * 1.9);
		tg.pale = Math.max(0, Math.sin(t * .8) - .55) * 1.6;
		tg.flicker = 1;
		tg.cloud = kou ? 0 : .7;
		tg.pupil = 1;
		this.idleLook(dt);
		if (this.pt > 2.2 + this.jets % 3 * .8) {
			this.pt = 0;
			this.jet(.5);
			const pos = new THREE.Vector3();
			const dir = new THREE.Vector3();
			sq.funnelOut(pos, dir);
			dir.y = Math.max(dir.y, .45);
			this.fx.squirt(pos, dir.normalize(), this.inkyJet(), 1);
		}
		this.updateJet(dt);
		this.vel.set(0, 0, 0);
	}
	/** 砂に潜る（コウイカ）：砂の上に座り、ひれで砂を巻き上げながら沈み、目と背中だけ出して隠れる。しばらくして出てくる */
	updateBury(dt) {
		const sq = this.squid;
		const tg = sq.target;
		const p = sq.root.position;
		const kou = sq.sp.id === "kouika";
		const next = (ph) => {
			this.phase = ph;
			this.pt = 0;
		};
		if (!this.phase) next("settle");
		const restY = this.floorY + (kou ? sq.bellyDepth * .95 : .12);
		this.level(dt);
		this.yaw = angTo(this.yaw, 0, 1 - Math.exp(-dt));
		tg.armPitch = .42;
		tg.armSpread = .2;
		tg.armCurl = .35;
		tg.armGather = .2;
		tg.armIdle = .2;
		tg.breathe = .6;
		tg.dark = .55;
		if (!kou) {
			this.label = "アオリイカは砂に潜らない（海底近くで止まる）";
			this.steer(this.tmp.set(this.home.x - p.x, restY - p.y, this.home.z - p.z).multiplyScalar(2.5), 3, dt);
			this.idleLook(dt);
			return 1.6;
		}
		const deep = restY - sq.bellyDepth * 1.25;
		const sandAlong = () => {
			for (const side of [1, -1]) {
				const z = -sq.mantleLen * (.15 + Math.random() * .75);
				const at = new THREE.Vector3(side * sq.halfWidth * 1.15, 0, z).applyMatrix4(sq.root.matrixWorld);
				at.y = this.floorY + .01;
				this.fx.sand(at, sq.ml * .25);
			}
		};
		switch (this.phase) {
			case "settle":
				this.label = "砂の上に下りて座る";
				this.steer(this.tmp.set(this.home.x - p.x, restY - p.y, this.home.z - p.z).multiplyScalar(2.5), 3, dt);
				tg.finAmp = .4;
				if (this.pt > 1.6) next("dig");
				break;
			case "dig": {
				this.label = "ひれで砂を巻き上げながら沈む";
				const k = smooth(0, 3, this.pt);
				this.vel.set(0, 0, 0);
				p.set(this.home.x, restY + (deep - restY) * k, this.home.z);
				tg.finAmp = 1.3;
				tg.finFreq = 1.6;
				tg.finLift = -.25;
				tg.finDir = 0;
				tg.dark = .6;
				if (this.pt % .18 < dt) sandAlong();
				if (this.pt > 3.2) next("hidden");
				break;
			}
			case "hidden":
				this.label = "目と背中だけ出して隠れる";
				this.vel.set(0, 0, 0);
				p.set(this.home.x, deep, this.home.z);
				tg.finAmp = 0;
				tg.breathe = .4;
				tg.armIdle = 0;
				tg.dark = .65;
				this.idleLook(dt);
				if (this.pt > 4) next("emerge");
				break;
			case "emerge": {
				this.label = "砂から出てくる";
				const k = smooth(0, 1.4, this.pt);
				this.vel.set(0, 0, 0);
				p.set(this.home.x, deep + (restY + .05 - deep) * k, this.home.z);
				tg.finAmp = 1.1;
				tg.finFreq = 1.4;
				if (this.pt < .6 && this.pt % .15 < dt) sandAlong();
				if (this.pt > 1.8) next("settle");
				break;
			}
		}
		return 1.6;
	}
	/** 吊り上げた：エギに腕で吊り下がり、胴が垂れる。ときどき漏斗から水（と墨）を噴く */
	updateLifted(dt) {
		const sq = this.squid;
		const tg = sq.target;
		const t = this.t;
		this.label = "エギに腕で吊り下がり、胴が垂れる。ときどき漏斗から水や墨を噴く";
		this.pitch = -Math.PI / 2 + .1 * Math.sin(t * 2.1);
		this.yaw = Math.sin(t * .35) * 1.2;
		this.roll = .08 * Math.sin(t * 1.7);
		sq.root.rotation.set(this.pitch, this.yaw, this.roll, "YXZ");
		sq.root.updateMatrixWorld(true);
		const hang = this.tmp.set(this.home.x, this.surfaceY + sq.mantleLen + sq.armBaseZ + this.egi.len + .2, this.home.z);
		const top = new THREE.Vector3(0, 0, this.egiZ() + this.egi.len * .5).applyQuaternion(sq.root.quaternion);
		sq.root.position.copy(hang).sub(top);
		tg.sag = 1;
		this.label += this.airFins(t, .2);
		tg.breathe = 2.2;
		tg.funnelAim = .35;
		tg.funnelOpen = .8;
		tg.dark = .5 + .45 * Math.sin(t * 2.3);
		tg.pale = Math.max(0, Math.sin(t * .7) - .6) * 2;
		tg.flicker = 1;
		tg.cloud = sq.sp.id === "aori" ? .6 : 0;
		tg.pupil = 1;
		tg.eyeYaw = .3;
		if (t % .35 < dt) {
			const tip = new THREE.Vector3(0, 0, -sq.mantleLen * .98).applyMatrix4(sq.root.matrixWorld);
			this.fx.squirt(tip, new THREE.Vector3(0, -1, 0), false, .05);
		}
		const first = this.jets === 0 && t > .25;
		if (first || this.pt > 1.6 + this.jets % 3 * .7) {
			this.pt = 0;
			this.jet(first ? .9 : .6);
			const pos = new THREE.Vector3();
			const dir = new THREE.Vector3();
			sq.funnelOut(pos, dir);
			this.fx.squirt(pos, dir, first ? sq.sp.id === "aori" && INK_TUNE.airEvery > 0 : this.inkyJet(), first ? 1.3 : 1);
		}
		this.updateJet(dt);
		this.vel.set(0, 0, 0);
	}
};
// src/game/squid/egi.ts
var lookP = null;
/** 写真と形を読む（なければ null：描いた簡単なエギ）。url：ファイル名 → 読む URL（イカのキット・ギャラリーが渡す。ふつうは public/egi/） */
function loadEgiLook(url) {
	if (!lookP) {
		const base = "/egi/";
		const at = url ?? ((f) => base + f);
		const loader = new THREE.TextureLoader();
		const tex = async (n) => {
			const t = await loader.loadAsync(at(`${n}.webp`));
			t.colorSpace = THREE.SRGBColorSpace;
			t.anisotropy = 8;
			return t;
		};
		lookP = (async () => {
			try {
				const r = await fetch(at("egi.json"));
				if (!r.ok) return null;
				const shape = await r.json();
				const [side, full, top, topFull] = await Promise.all([
					tex("egi_side"),
					tex("egi_full"),
					tex("egi_top"),
					tex("egi_topfull")
				]);
				return {
					shape,
					side,
					full,
					top,
					topFull
				};
			} catch {
				return null;
			}
		})();
	}
	return lookP;
}
var sample = (arr, t) => {
	const x = Math.min(1, Math.max(0, t)) * (arr.length - 1);
	const i = Math.min(arr.length - 2, Math.floor(x));
	return arr[i] + (arr[i + 1] - arr[i]) * (x - i);
};
/** 横（S）と真上（T）の写真の uv を、休んでいる形の位置から決める。重み：上を向いた面は真上、ほかは横 */
var PHOTO_VS = `
attribute vec2 aUvS; attribute vec2 aUvT; attribute float aWT;
varying vec2 vUvS; varying vec2 vUvT; varying float vWT;
`;
function photoMaterial(params, texS, texT) {
	const m = new THREE.MeshPhysicalMaterial(params);
	m.onBeforeCompile = (sh) => {
		sh.uniforms.uTexS = { value: texS };
		sh.uniforms.uTexT = { value: texT ?? texS };
		sh.vertexShader = PHOTO_VS + sh.vertexShader.replace("#include <begin_vertex>", "#include <begin_vertex>\nvUvS = aUvS; vUvT = aUvT; vWT = aWT;");
		sh.fragmentShader = "uniform sampler2D uTexS; uniform sampler2D uTexT;\nvarying vec2 vUvS; varying vec2 vUvT; varying float vWT;\n" + sh.fragmentShader.replace("#include <color_fragment>", "#include <color_fragment>\ndiffuseColor.rgb = mix(texture2D(uTexS, vUvS).rgb, texture2D(uTexT, vUvT).rgb, vWT);");
	};
	m.customProgramCacheKey = () => "egi-photo";
	return m;
}
function bake(g, sh, topWeight = true) {
	const pos = g.attributes.position;
	const nrm = g.attributes.normal;
	const n = pos.count;
	const S = new Float32Array(n * 2);
	const T = new Float32Array(n * 2);
	const W = new Float32Array(n);
	const { side: ps, top: pt, len } = sh;
	for (let i = 0; i < n; i++) {
		const x = pos.getX(i);
		const y = pos.getY(i);
		const z = pos.getZ(i);
		S[i * 2] = (ps.x0 + (len / 2 - z) * ps.k) / ps.w;
		S[i * 2 + 1] = 1 - (ps.yc - y * ps.k) / ps.h;
		T[i * 2] = (pt.x0 + (len / 2 - z) * pt.k) / pt.w;
		T[i * 2 + 1] = 1 - (pt.yc + x * pt.k) / pt.h;
		const ny = nrm.getY(i);
		W[i] = topWeight ? Math.max(0, ny) ** 2.5 : 0;
	}
	g.setAttribute("aUvS", new THREE.BufferAttribute(S, 2));
	g.setAttribute("aUvT", new THREE.BufferAttribute(T, 2));
	g.setAttribute("aWT", new THREE.BufferAttribute(W, 1));
}
/** 断面が楕円の輪を並べた筒（u 0 頭〜1 尾、z = (0.5 − u)·len）。top・bot は真ん中の線から上・下、w は半幅 */
function loftGeometry(len, rows, cols, at, z0 = .5, z1 = -.5) {
	const pos = [];
	const idx = [];
	for (let i = 0; i <= rows; i++) {
		const u = i / rows;
		const z = (z0 + (z1 - z0) * u) * len;
		const s = at(u);
		const yc = s.y ?? 0;
		for (let j = 0; j <= cols; j++) {
			const a = -Math.PI / 2 + j / cols * Math.PI * 2;
			const sn = Math.sin(a);
			pos.push(s.w * Math.cos(a), yc + (sn >= 0 ? s.top : s.bot) * sn, z);
		}
	}
	for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) {
		const a = i * (cols + 1) + j;
		const b = a + cols + 1;
		idx.push(a, b, a + 1, a + 1, b, b + 1);
	}
	const g = new THREE.BufferGeometry();
	g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
	g.setIndex(idx);
	g.computeVertexNormals();
	return g;
}
/** 羽根の絵：羽軸（左が付け根）と、斜め後ろへのびる細い羽枝。透けた橙で、先ほど薄い */
var featherTex = null;
function featherTexture() {
	if (featherTex) return featherTex;
	const W = 512;
	const H = 192;
	const c = document.createElement("canvas");
	c.width = W;
	c.height = H;
	const g = c.getContext("2d");
	let seed = 7;
	const rnd = () => (seed = seed * 16807 % 2147483647) / 2147483647;
	for (const ang of [
		-.16,
		.02,
		.15
	]) {
		const qx = (t) => 14 + t * 482;
		const qy = (t) => H / 2 + Math.sin(ang) * t * 482 + Math.sin(t * 3) * 4;
		for (let i = 0; i < 700; i++) {
			const t = .05 + .93 * rnd();
			const x = qx(t);
			const y = qy(t);
			const env = Math.sin(Math.PI * Math.min(1, t * 1.1)) ** .7;
			const len = (18 + rnd() * 34) * env;
			const up = rnd() < .5 ? -1 : 1;
			const a = up * (.35 + rnd() * .35);
			g.strokeStyle = `hsla(${18 + rnd() * 14}, 95%, ${50 + rnd() * 14}%, ${.55 + .4 * (1 - t)})`;
			g.lineWidth = 1.1 + rnd() * 1.3;
			g.beginPath();
			g.moveTo(x, y);
			g.quadraticCurveTo(x + len * .6, y + up * len * Math.sin(Math.abs(a)) * .5, x + len * Math.cos(a), y + len * Math.sin(a));
			g.stroke();
		}
		g.strokeStyle = "rgba(255, 190, 150, 0.85)";
		g.lineWidth = 2;
		g.beginPath();
		for (let t = 0; t <= 1; t += .02) (t === 0 ? g.moveTo : g.lineTo).call(g, qx(t), qy(t));
		g.stroke();
	}
	featherTex = new THREE.CanvasTexture(c);
	featherTex.colorSpace = THREE.SRGBColorSpace;
	return featherTex;
}
/** 針：曲線に沿った細い管で、先の 2 割を細めて尖らせる */
function needle(curve, r) {
	const seg = 36;
	const rad = 5;
	const g = new THREE.TubeGeometry(curve, seg, r, rad, false);
	const pos = g.attributes.position;
	const c = new THREE.Vector3();
	const p = new THREE.Vector3();
	for (let i = 0; i <= seg; i++) {
		const t = i / seg;
		const k = t > .8 ? Math.max(.05, (1 - t) / .2) : 1;
		curve.getPointAt(t, c);
		for (let j = 0; j <= rad; j++) {
			const q = i * 6 + j;
			p.fromBufferAttribute(pos, q).sub(c).multiplyScalar(k).add(c);
			pos.setXYZ(q, p.x, p.y, p.z);
		}
	}
	g.computeVertexNormals();
	return g;
}
var EgiModel = class {
	obj = new THREE.Group();
	len;
	/** 胴のいちばん太い所の半径（抱く筒の太さ） */
	r;
	/** 糸を結ぶ輪（アイ）の真ん中（エギの中の位置） */
	eyeLocal = new THREE.Vector3();
	/** 胴の真ん中から、いちばん下（腹・シンカー・カンナ）までの深さ。重りは入れない */
	bottom;
	/** 重りが当たる胴の楕円体（エギの中の位置）：真ん中と半径 */
	hull = {
		c: new THREE.Vector3(),
		h: new THREE.Vector3()
	};
	fins = [];
	time = 0;
	/** 羽根の揺れ 0〜1（沈む・動かすと大きく） */
	flutter = .5;
	/** 重りが止まる地面の高さと、水の中か（重りの沈み方と揺れ方が変わる） */
	floorY = -1e9;
	water = true;
	rig = null;
	/** 胴の形と写真（透かし絵を作るため） */
	bodySrc = null;
	constructor(look) {
		const sh = look?.shape;
		this.len = sh?.len ?? .105;
		if (!sh || !look) {
			this.r = .011;
			this.simple();
		} else this.r = this.build(sh, look);
		const box = new THREE.Box3().setFromObject(this.obj);
		this.bottom = -box.min.y;
	}
	/** 鼻の重り：号（0 で外す。1 号 = 3.75 g） */
	setWeight(go) {
		if (this.rig) this.obj.remove(this.rig.group);
		this.rig = go > 0 ? new NoseRig(go) : null;
		if (this.rig) this.obj.add(this.rig.group);
	}
	get weight() {
		return this.rig;
	}
	build(sh, look) {
		const len = this.len;
		const B = sh.body;
		let r = 0;
		for (let i = 0; i < B.w.length; i++) r = Math.max(r, B.w[i], (B.top[i] + B.bot[i]) / 2);
		const bodyG = loftGeometry(len, 72, 32, (u) => ({
			top: sample(B.top, u),
			bot: sample(B.bot, u),
			w: sample(B.w, u)
		}));
		bake(bodyG, sh);
		bodyG.computeBoundingBox();
		bodyG.boundingBox.getCenter(this.hull.c);
		bodyG.boundingBox.getSize(this.hull.h).multiplyScalar(.5);
		const cloth = photoMaterial({
			roughness: .78,
			metalness: 0,
			sheen: .8,
			sheenRoughness: .45,
			sheenColor: new THREE.Color(1, .75, .5)
		}, look.side, look.top);
		this.add(new THREE.Mesh(bodyG, cloth));
		this.bodySrc = {
			geo: bodyG,
			look
		};
		if (sh.sinker) {
			const sk = sh.sinker;
			const half = Math.min(.0035, r * .35);
			const g = loftGeometry(len, 30, 16, (t) => {
				const topY = sample(sk.top, t) + .002;
				const botY = -sample(sk.bot, t);
				const h = Math.max(4e-4, (topY - botY) / 2);
				const end = Math.sin(Math.PI * Math.min(1, Math.max(0, t))) ** .35;
				return {
					top: h * end,
					bot: h * end,
					w: half * Math.max(.3, end),
					y: (topY + botY) / 2
				};
			}, .5 - sk.u0, .5 - sk.u1);
			bake(g, sh, false);
			const lead = photoMaterial({
				roughness: .42,
				metalness: .55
			}, look.full, null);
			this.add(new THREE.Mesh(g, lead));
		}
		if (sh.eye) {
			const e = sh.eye;
			const z = (.5 - e.u) * len;
			const wAt = sample(B.w, e.u);
			const top = Math.max(1e-4, e.y >= 0 ? sample(B.top, e.u) : sample(B.bot, e.u));
			const xs = wAt * Math.sqrt(Math.max(0, 1 - (e.y / top) ** 2));
			const th = .62;
			const Rs = e.r / Math.sin(th);
			for (const side of [1, -1]) {
				const g = new THREE.SphereGeometry(Rs, 32, 10, 0, Math.PI * 2, 0, th);
				g.translate(0, -Rs * Math.cos(th), 0);
				g.rotateZ(-side * (Math.PI / 2));
				g.translate(side * (xs - 4e-4), e.y, z);
				bake(g, sh, false);
				const m = photoMaterial({
					roughness: .05,
					metalness: 0,
					clearcoat: 1,
					clearcoatRoughness: .03
				}, look.full, null);
				this.add(new THREE.Mesh(g, m));
			}
		}
		const fe = sh.feather;
		if (fe) {
			const fl = Math.max(.015, fe.z0 - fe.z1);
			const fh = Math.max(.008, fe.y1 - fe.y0);
			const rootY = (fe.y0 + fe.y1) / 2 + fh * .12;
			const uRoot = Math.max(0, Math.min(1, fe.u0));
			const wRoot = sample(B.w, uRoot);
			const tex = featherTexture();
			for (const side of [1, -1]) {
				const pivot = new THREE.Group();
				pivot.rotation.order = "YZX";
				pivot.position.set(side * (wRoot + 6e-4), rootY, fe.z0);
				const g = new THREE.PlaneGeometry(fl, fh, 8, 2);
				g.rotateY(Math.PI / 2);
				g.translate(0, 0, -fl / 2);
				const mat = new THREE.MeshStandardMaterial({
					map: tex,
					transparent: true,
					alphaTest: .04,
					roughness: .7,
					side: THREE.DoubleSide,
					depthWrite: false
				});
				const mesh = new THREE.Mesh(g, mat);
				mesh.renderOrder = 2;
				mesh.castShadow = true;
				pivot.add(mesh);
				const bead = new THREE.Mesh(new THREE.SphereGeometry(.0015, 12, 8), new THREE.MeshStandardMaterial({
					color: 14256238,
					roughness: .15,
					transparent: true,
					opacity: .8
				}));
				bead.position.set(side * 6e-4, 0, 0);
				pivot.add(bead);
				pivot.userData.side = side;
				this.obj.add(pivot);
				this.fins.push(pivot);
			}
		}
		this.addKanna(sh.kanna);
		this.addEye(sh);
		return r;
	}
	add(m) {
		m.castShadow = true;
		this.obj.add(m);
	}
	/** カンナ（横の写真から測った寸法、mm。胴の尾の先から後ろへ）：
	*  尾の柄に半透明の管（+3.3〜−1.5）、その後ろに 2 段の針。1 段ごとに、針は軸に沿って筒のように後ろへ並び（半径 2.2）、
	*  後ろの端で外へ鋭く曲がって、頭の方へ反り返り、先は外前を向く（先の半径 10.5）。段の間に金属の台、真ん中に軸 */
	addKanna(k) {
		const sc = this.len / .105;
		const mm = (v) => v * .001 * sc;
		const zt = -this.len / 2;
		const y0 = k?.y ?? 0;
		const metal = [];
		const cyl = (r, z0, z1, seg = 16) => {
			const g = new THREE.CylinderGeometry(mm(r), mm(r), mm(Math.abs(z1 - z0)), seg, 1);
			g.rotateX(Math.PI / 2);
			g.translate(0, y0, zt + mm((z0 + z1) / 2));
			return g;
		};
		metal.push(cyl(1.5, -1.5, -20.2));
		metal.push(cyl(1.8, -10.4, -12.6));
		const tiers = [{
			zf: -1.5,
			zb: -10.4,
			tip: -.7,
			rot: 0
		}, {
			zf: -12.6,
			zb: -20,
			tip: -11,
			rot: Math.PI / 12
		}];
		for (const t of tiers) {
			const path = [
				[2.2, t.zf - t.zb],
				[2.2, (t.zf - t.zb) * .5],
				[2.2, 2],
				[2.35, .7],
				[2.9, -.15],
				[4, -.45],
				[5.3, -.05],
				[7, 1.6],
				[8.7, 4.4],
				[9.9, 7.2],
				[10.5, t.tip - t.zb]
			];
			for (let i = 0; i < 12; i++) {
				const a = t.rot + i / 12 * Math.PI * 2;
				const c = Math.cos(a);
				const sn = Math.sin(a);
				const pts = path.map(([r, dz]) => new THREE.Vector3(c * mm(r), y0 + sn * mm(r), zt + mm(t.zb + dz)));
				metal.push(needle(new THREE.CatmullRomCurve3(pts, false, "centripetal"), mm(.3)));
			}
		}
		this.add(new THREE.Mesh(mergeGeometries(metal), new THREE.MeshStandardMaterial({
			color: 13686234,
			metalness: .95,
			roughness: .2
		})));
		const tube = new THREE.Mesh(cyl(2.6, 3.3, -1.5, 24), new THREE.MeshStandardMaterial({
			color: 15913656,
			roughness: .25,
			transparent: true,
			opacity: .75
		}));
		this.add(tube);
	}
	/** アイ：頭の先（シンカーの前）の、糸を結ぶステンレスの輪 */
	addEye(sh) {
		const len = this.len;
		const sk = sh?.sinker;
		const z = sk ? (.5 - sk.u0) * len + .0015 : len / 2 + .002;
		const y = sk ? -sample(sk.bot, .05) * .6 : -this.r * .3;
		const g = new THREE.TorusGeometry(.0022, 45e-5, 8, 20);
		g.rotateY(Math.PI / 2);
		g.translate(0, y, z);
		this.eyeLocal.set(0, y, z);
		this.add(new THREE.Mesh(g, new THREE.MeshStandardMaterial({
			color: 14212578,
			metalness: .95,
			roughness: .2
		})));
	}
	/** 写真がないときの簡単なエギ */
	simple() {
		const len = this.len;
		const r = this.r;
		const body = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 14), new THREE.MeshStandardMaterial({
			color: 16742958,
			roughness: .75
		}));
		body.scale.set(r, r * 1.15, len / 2);
		this.add(body);
		this.bodySrc = {
			geo: body.geometry.clone().scale(r, r * 1.15, len / 2),
			look: null
		};
		this.hull.h.set(r, r * 1.15, len / 2);
		this.addKanna(null);
		this.addEye(null);
	}
	/**
	* 透かし絵：胴と同じ形・同じ写真の色を、光の当たり方だけ簡単にして描く（水面より後に描くので、水の色に隠れない）。
	* 遠くや水の中でもエギの形と色が分かるように重ねる（ぼかした光の点だと、エギの上に乗って形が見えなくなっていた）。
	* 表の面だけ描く（胴の向こう側は透けない）。uOpacity で濃さ、uTint・uTintK で水の色を混ぜる
	*/
	makeGhost() {
		const src = this.bodySrc;
		const look = src.look;
		const opacity = { value: 0 };
		const tintK = { value: 0 };
		const mat = new THREE.ShaderMaterial({
			uniforms: {
				uTexS: { value: look?.side ?? null },
				uTexT: { value: look?.top ?? null },
				uPhoto: { value: look ? 1 : 0 },
				uBase: { value: new THREE.Color(16742958) },
				uTint: { value: new THREE.Color(2912120) },
				uOpacity: opacity,
				uTintK: tintK
			},
			vertexShader: `
        attribute vec2 aUvS; attribute vec2 aUvT; attribute float aWT;
        varying vec2 vUvS; varying vec2 vUvT; varying float vWT; varying float vUp;
        void main() {
          #ifdef PHOTO
          vUvS = aUvS; vUvT = aUvT; vWT = aWT;
          #endif
          vUp = normalize(mat3(modelMatrix) * normal).y;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
			fragmentShader: `
        uniform sampler2D uTexS; uniform sampler2D uTexT; uniform vec3 uBase; uniform vec3 uTint;
        uniform float uOpacity; uniform float uTintK;
        varying vec2 vUvS; varying vec2 vUvT; varying float vWT; varying float vUp;
        void main() {
          #ifdef PHOTO
          vec3 c = mix(texture2D(uTexS, vUvS).rgb, texture2D(uTexT, vUvT).rgb, vWT);
          #else
          vec3 c = uBase;
          #endif
          // 上から光が当たったように（背中は明るく、腹は少し暗く）
          c *= 0.62 + 0.5 * clamp(vUp * 0.5 + 0.5, 0.0, 1.0);
          c = mix(c, uTint, uTintK);
          gl_FragColor = vec4(c, uOpacity);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
			defines: look ? { PHOTO: "" } : {},
			transparent: true,
			depthWrite: false,
			polygonOffset: true,
			polygonOffsetFactor: -4,
			polygonOffsetUnits: -8
		});
		const mesh = new THREE.Mesh(src.geo, mat);
		mesh.renderOrder = 10;
		mesh.frustumCulled = false;
		return {
			mesh,
			opacity,
			tintK
		};
	}
	/** 羽根を揺らし、鼻の重りを動かす（位置と向きを決めたあとに呼ぶ） */
	update(dt) {
		this.time += dt;
		if (this.rig) {
			this.obj.updateMatrixWorld(true);
			this.rig.step(dt, this);
		}
		for (const f of this.fins) {
			const side = f.userData.side;
			const w = Math.sin(this.time * 11 + side) * .16 + Math.sin(this.time * 4.3 + side * 2) * .07;
			f.rotation.y = -side * (.38 + w * this.flutter);
			f.rotation.z = side * (.7 + .08 * Math.sin(this.time * 7.7) * this.flutter);
		}
	}
};
/** 1 号 = 3.75 g（1 匁） */
var GRAM_PER_GO = 3.75;
/** 鉛 g/cm³ */
var LEAD_DENSITY = 11.34;
var DOWN = new THREE.Vector3(0, -1, 0);
var MM = .001;
/** アイの輪（中心線）の半径と針金の太さ */
var RING_R = .0022;
/** ナス型の輪郭：t 0 上（首）〜1 下、太さ 0〜1。いちばん太いのは 2/3 ほど下、底は丸い */
var nasu = (t) => Math.max(.2 * (1 - t), Math.sin(Math.PI * Math.min(1, t) ** 1.8) ** .5);
/** ナス型の長さ / 太さ */
var NASU_ASPECT = 2.3;
/** いちばん太い所（重さの真ん中とみなす） */
var NASU_WIDE = .68;
/** 鋳物の鉛の小さなへこみ（凹凸と、つやのむらに使う） */
var leadTex = null;
function leadTexture() {
	if (leadTex) return leadTex;
	const S = 256;
	const c = document.createElement("canvas");
	c.width = c.height = S;
	const g = c.getContext("2d");
	g.fillStyle = "#808080";
	g.fillRect(0, 0, S, S);
	let seed = 11;
	const rnd = () => (seed = seed * 16807 % 2147483647) / 2147483647;
	for (let i = 0; i < 520; i++) {
		const x = rnd() * S;
		const y = rnd() * S;
		const r = 3 + rnd() * 10;
		const dark = rnd() < .7;
		for (const ox of [
			-256,
			0,
			S
		]) {
			const gr = g.createRadialGradient(x + ox, y, 0, x + ox, y, r);
			gr.addColorStop(0, dark ? "rgba(30,30,30,0.6)" : "rgba(215,215,215,0.45)");
			gr.addColorStop(1, "rgba(128,128,128,0)");
			g.fillStyle = gr;
			g.beginPath();
			g.arc(x + ox, y, r, 0, Math.PI * 2);
			g.fill();
		}
	}
	leadTex = new THREE.CanvasTexture(c);
	leadTex.wrapS = leadTex.wrapT = THREE.RepeatWrapping;
	return leadTex;
}
/** 鼻の重り。部品はエギの子として置き（エギの中の位置）、揺れはワールドで計算する。
*  鎖の点：0 アイの輪に掛かる所 → 1 スナップの下 → 2 より戻しの下（重りの輪）→ 3 鉛のいちばん太い所 */
var NoseRig = class {
	group = new THREE.Group();
	go;
	gram;
	/** 鉛の長さと太さ（m、輪を除く） */
	leadLen;
	leadDia;
	/** アイの輪から、重りの底までの長さ（m） */
	reach;
	parts = [];
	links;
	nodes;
	ready = false;
	ring = new THREE.Vector3();
	ringPrev = new THREE.Vector3();
	ringN = new THREE.Vector3();
	inv = new THREE.Matrix4();
	c = new THREE.Vector3();
	d = new THREE.Vector3();
	e = new THREE.Vector3();
	n = new THREE.Vector3();
	c2 = new THREE.Vector3();
	constructor(go) {
		this.go = go;
		this.gram = go * GRAM_PER_GO;
		let I = 0;
		const N = 400;
		for (let i = 0; i < N; i++) I += nasu((i + .5) / N) ** 2 / N;
		const V = this.gram / LEAD_DENSITY * 1e3;
		const R = Math.cbrt(V / (2 * Math.PI * NASU_ASPECT * I));
		const Lb = 2 * NASU_ASPECT * R;
		this.leadLen = Lb * MM;
		this.leadDia = 2 * R * MM;
		const steel = new THREE.MeshStandardMaterial({
			color: 13817820,
			metalness: .95,
			roughness: .22
		});
		const nickel = new THREE.MeshStandardMaterial({
			color: 8159366,
			metalness: .92,
			roughness: .28
		});
		const tex = leadTexture();
		const lead = new THREE.MeshStandardMaterial({
			color: new THREE.Color().setRGB(.5, .51, .53, THREE.SRGBColorSpace),
			metalness: .45,
			roughness: 1,
			roughnessMap: tex,
			bumpMap: tex,
			bumpScale: 1.5
		});
		const wire = (pts, r, closed, seg = 48) => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(([x, y, z]) => new THREE.Vector3(x * MM, y * MM, (z ?? 0) * MM)), closed, "centripetal"), seg, r * MM, 6, closed);
		const torus = (r, wr, y, yz) => {
			const g = new THREE.TorusGeometry(r * MM, wr * MM, 8, 24);
			if (yz) g.rotateY(Math.PI / 2);
			g.translate(0, y * MM, 0);
			return g;
		};
		const snapPts = [];
		for (let i = 0; i <= 8; i++) {
			const a = Math.PI * (1 - i / 8);
			snapPts.push([Math.cos(a) * 1, -.22999999999999998 + Math.sin(a) * 1]);
		}
		for (let i = 1; i < 12; i++) {
			const a = -(i / 12) * Math.PI;
			snapPts.push([Math.cos(a) * 1.6, -9.23 + 1.6 + Math.sin(a) * 1.6]);
		}
		const snapG = mergeGeometries([wire(snapPts, .32, true, 72), wire([
			[
				-1.6,
				-7.630000000000001,
				.25
			],
			[
				-1.25,
				-4.73,
				.35
			],
			[
				-.6,
				-1.83,
				.3
			],
			[
				-.2,
				-.9299999999999999,
				.1
			]
		], .3, false, 16)]);
		const L1 = 9.23;
		const barrel = new THREE.LatheGeometry([
			0,
			.25,
			.5,
			.75,
			1
		].map((t) => new THREE.Vector2((.8 + .4 * Math.sin(Math.PI * t)) * MM, -(6.2 - 5 * t) * MM)), 16);
		const swivelG = mergeGeometries([
			torus(1, .3, -.38, true),
			barrel,
			torus(1, .3, -7, false)
		].map((g) => g.toNonIndexed()));
		const L2 = 8;
		const eyeG = torus(1.2, .35, -.55, true);
		const top = 1.4;
		const prof = [];
		for (let i = 0; i <= 40; i++) {
			const t = 1 - i / 40;
			prof.push(new THREE.Vector2(Math.max(1e-5, nasu(t) * R) * MM, -(top + t * Lb) * MM));
		}
		prof.push(new THREE.Vector2(1e-5, -1.25 * MM));
		const leadG = new THREE.LatheGeometry(prof, 28);
		const L3 = top + NASU_WIDE * Lb;
		const snapM = new THREE.Mesh(snapG, steel);
		const swivelM = new THREE.Mesh(swivelG, nickel);
		const sinker = new THREE.Group();
		sinker.add(new THREE.Mesh(eyeG, new THREE.MeshStandardMaterial({
			color: 13218426,
			metalness: .9,
			roughness: .3
		})), new THREE.Mesh(leadG, lead));
		for (const o of [
			snapM,
			swivelM,
			sinker
		]) {
			o.traverse((m) => m.castShadow = true);
			this.group.add(o);
			this.parts.push(o);
		}
		this.links = [
			L1 * MM,
			L2 * MM,
			L3 * MM
		];
		this.reach = (18.63 + Lb) * MM;
		const node = (gram, r, k) => ({
			p: new THREE.Vector3(),
			q: new THREE.Vector3(),
			w: 1 / gram,
			r,
			k
		});
		this.nodes = [
			node(1, 0, 0),
			node(.25, .0012, 25),
			node(.35, .0013, 25),
			node(this.gram, R * MM, 8)
		];
		this.nodes[0].w = 0;
		this.group.visible = false;
	}
	/** 鉛のいちばん太い所（ワールド） */
	get sinkerPos() {
		return this.nodes[3].p;
	}
	/** 鉛が地面に着いているか */
	onFloor(floorY) {
		return this.nodes[3].p.y <= floorY + this.nodes[3].r + 5e-4;
	}
	/** 重りをアイから真下へまっすぐ下げ直す（エギを飛ばしたとき） */
	reset() {
		this.ready = false;
	}
	/** エギと一緒に、揺れをそのまま動かす */
	shift(d) {
		for (const n of this.nodes) {
			n.p.add(d);
			n.q.add(d);
		}
		this.ringPrev.add(d);
	}
	step(dt, egi) {
		const M = egi.obj.matrixWorld;
		const nodes = this.nodes;
		this.ring.copy(egi.eyeLocal).applyMatrix4(M);
		this.ringN.setFromMatrixColumn(M, 0).normalize();
		this.inv.copy(M).invert();
		if (!this.ready || this.ring.distanceTo(this.ringPrev) > .3) {
			this.ringPrev.copy(this.ring);
			nodes[0].p.copy(this.ring);
			nodes[0].p.y -= RING_R;
			for (let i = 1; i < nodes.length; i++) {
				nodes[i].p.copy(nodes[i - 1].p);
				nodes[i].p.y -= this.links[i - 1];
				nodes[i].p.y = Math.max(nodes[i].p.y, egi.floorY + nodes[i].r);
				nodes[i].q.copy(nodes[i].p);
			}
			this.ready = true;
		}
		if (dt > 0) {
			const n = Math.max(1, Math.ceil(dt / (1 / 240)));
			const h = dt / n;
			const g = egi.water ? -8.82 : -9.8;
			const floor = egi.floorY;
			for (let s = 1; s <= n; s++) {
				this.c.lerpVectors(this.ringPrev, this.ring, s / n);
				for (let i = 1; i < nodes.length; i++) {
					const nd = nodes[i];
					const v = this.d.subVectors(nd.p, nd.q);
					v.multiplyScalar(Math.exp(-(egi.water ? nd.k : .3) * h));
					if (nd.p.y <= floor + nd.r + 1e-4) {
						const fr = Math.exp(-25 * h);
						v.x *= fr;
						v.z *= fr;
					}
					nd.q.copy(nd.p);
					nd.p.add(v);
					nd.p.y += g * h * h;
				}
				for (let it = 0; it < 6; it++) {
					this.pin(this.c, nodes[1].p, nodes[0].p);
					for (let i = 0; i < this.links.length; i++) {
						const A = nodes[i];
						const B = nodes[i + 1];
						const d = this.d.subVectors(B.p, A.p);
						const l = d.length();
						if (l < 1e-9) continue;
						const corr = (l - this.links[i]) / (l * (A.w + B.w));
						A.p.addScaledVector(d, corr * A.w);
						B.p.addScaledVector(d, -corr * B.w);
					}
					for (let i = 1; i < nodes.length; i++) {
						const nd = nodes[i];
						if (i >= 2) this.pushOut(nd, egi, M);
						if (nd.p.y < floor + nd.r) {
							nd.p.y = floor + nd.r;
							nd.q.y = nd.p.y;
						}
					}
				}
				this.pin(this.c, nodes[1].p, nodes[0].p);
				for (let i = 0; i < this.links.length; i++) {
					const A = nodes[i];
					const B = nodes[i + 1];
					const d = this.d.subVectors(B.p, A.p);
					const l = d.length();
					if (l < 1e-9) continue;
					B.p.copy(A.p).addScaledVector(d, this.links[i] / l);
					if (B.p.y < floor + B.r) {
						B.p.y = floor + B.r;
						B.q.y = Math.min(B.q.y, B.p.y);
					}
				}
			}
		}
		this.ringPrev.copy(this.ring);
		this.pin(this.ring, nodes[1].p, nodes[0].p);
		this.group.visible = true;
		for (let i = 0; i < this.parts.length; i++) {
			const a = this.d.copy(nodes[i].p).applyMatrix4(this.inv);
			const b = this.e.copy(nodes[i + 1].p).applyMatrix4(this.inv);
			const o = this.parts[i];
			o.position.copy(a);
			o.quaternion.setFromUnitVectors(DOWN, b.sub(a).normalize());
		}
	}
	/** スナップはアイの輪の上を滑って、引かれる側に掛かる */
	pin(c, toward, out) {
		const d = this.e.subVectors(toward, c);
		d.addScaledVector(this.ringN, -d.dot(this.ringN));
		if (d.lengthSq() < 1e-12) d.set(0, -1, 0).addScaledVector(this.ringN, this.ringN.y);
		out.copy(c).addScaledVector(d.normalize(), RING_R);
	}
	/**
	* 胴（楕円体）の中へ入らない：いちばん近い面へ、面に直角に押し出す。押し出した分は勢いにしない（跳ね返らない）。
	* 胴の真ん中から放射状に押し広げると、細長い胴の中に入った点が頭や尾の先まで一気に飛ばされ、重りが暴れていた
	*/
	pushOut(nd, egi, M) {
		const { c, h } = egi.hull;
		const b = this.e.copy(nd.p).applyMatrix4(this.inv).sub(c);
		const hx = h.x + nd.r;
		const hy = h.y + nd.r;
		const hz = h.z * .92 + nd.r;
		const q = Math.sqrt((b.x / hx) ** 2 + (b.y / hy) ** 2 + (b.z / hz) ** 2);
		if (q >= 1) return;
		const n = this.n.set(b.x / (hx * hx), b.y / (hy * hy), b.z / (hz * hz));
		let gl = n.length();
		if (q < .05 || gl < 1e-9) {
			n.set(0, -1, 0);
			gl = 1 / hy;
		} else {
			gl /= q;
			n.normalize();
		}
		const d = Math.min((1 - q) / gl, 2 * hy);
		this.c2.copy(nd.p);
		nd.p.copy(b.addScaledVector(n, d * 1.02).add(c).applyMatrix4(M));
		nd.q.add(this.c2.subVectors(nd.p, this.c2));
	}
};
// src/kit/squid-kit.ts
var SQUID_LIST = [{
	id: "aori",
	ja: "アオリイカ",
	en: "Bigfin reef squid",
	mantleCm: Math.round(SQUIDS.aori.ml * 100)
}, {
	id: "kouika",
	ja: "コウイカ",
	en: "Golden cuttlefish",
	mantleCm: Math.round(SQUIDS.kouika.ml * 100)
}];
var SQUID_MOTIONS = [
	{
		id: "hover",
		ja: "ホバリング",
		en: "Hover",
		noteJa: "ひれを波打たせてその場にとどまる。息で胴がゆっくりふくらみ、腕先をすぼめる・垂らすと構えがときどき変わる。",
		noteEn: "Holds still with waves running along the fins. The mantle breathes and the arms pinch or droop now and then.",
		place: "water"
	},
	{
		id: "forward",
		ja: "前へ泳ぐ",
		en: "Swim forward",
		noteJa: "ひれの波を前から後ろへ流して、腕の方へ進む。ときどき腕を根元から束ねる。",
		noteEn: "Fin waves run head to tail and the squid swims arms first, sometimes bundling its arms.",
		place: "water"
	},
	{
		id: "backward",
		ja: "後ろへ泳ぐ",
		en: "Swim backward",
		noteJa: "ひれの波を逆に流し、漏斗から弱いジェットを足して、胴の先から進む。",
		noteEn: "Fin waves reverse and a gentle jet from the funnel pushes it mantle first.",
		place: "water"
	},
	{
		id: "turn",
		ja: "向きを変える",
		en: "Turn",
		noteJa: "左右のひれで波を逆に流して、その場で回る。目と頭が先に回る。",
		noteEn: "The two fins wave in opposite directions to turn on the spot; eyes and head lead.",
		place: "water"
	},
	{
		id: "escape",
		ja: "逃げる（墨とジェット）",
		en: "Escape (ink and jet)",
		noteJa: "白く抜ける → ふくらむ → ひれをたたんで一気に縮み、墨を吐いて胴の先から飛ぶように離れる。",
		noteEn: "Blanches, inflates, folds the fins and squeezes hard, inks and shoots away mantle first.",
		place: "water"
	},
	{
		id: "follow",
		ja: "エギを追う",
		en: "Follow the lure",
		noteJa: "しゃくって跳ね上がり、沈むエギに、後ろ下から間を保ってついていく。目と頭でエギを追う。",
		noteEn: "Trails a jigged squid lure (egi) from behind and below, tracking it with eyes and head.",
		place: "water"
	},
	{
		id: "refuse",
		ja: "見切る",
		en: "Refuse",
		noteJa: "エギへ寄って止まり、迷って白と濃い色を行き来し、ひれの波を逆にして下がって離れる。",
		noteEn: "Approaches, hesitates flashing pale and dark, then backs off and turns away.",
		place: "water"
	},
	{
		id: "attack",
		ja: "エギを抱く",
		en: "Grab the lure",
		noteJa: "腕から近寄って止まり、触腕を一瞬で伸ばしてつかみ、8 本の腕で抱く。スローで見ると触腕が伸びるのがわかる。",
		noteEn: "Closes in, shoots its two tentacles out in a blink, then wraps all eight arms around the lure. Try slow-mo.",
		place: "water"
	},
	{
		id: "hooked",
		ja: "掛かった",
		en: "Hooked",
		noteJa: "エギごと引かれて、胴の先の方へ何度もジェットで逆らう。墨も吐く。",
		noteEn: "Pulled by the line, it jets backward again and again and inks.",
		place: "water"
	},
	{
		id: "surface",
		ja: "水面へ寄せる",
		en: "At the surface",
		noteJa: "上へ引かれながらジェットで逆らい、水面で暴れて水を噴く。",
		noteEn: "Reeled up, it fights with jets and splashes water at the surface.",
		place: "surface"
	},
	{
		id: "lifted",
		ja: "吊り上げた（水の外）",
		en: "Lifted out",
		noteJa: "エギに腕で吊り下がり、胴とひれが重さで垂れる。水や墨を噴き、色がめまぐるしく変わる。",
		noteEn: "Hangs from the lure by its arms, body sagging. Squirts water and ink while its colour flickers.",
		place: "air"
	},
	{
		id: "landed",
		ja: "陸に置いた",
		en: "On the pier",
		noteJa: "自分の重さで平たくつぶれ、あえぐように息をし、ときどき水や墨を噴く。墨は地面に跡になる。",
		noteEn: "Flattens under its own weight, gasps, and squirts water and ink that stains the ground.",
		place: "land"
	},
	{
		id: "rest",
		ja: "海底で休む",
		en: "Rest on the bottom",
		noteJa: "コウイカは砂の上に腕を下ろして座り、ひれのふちだけ波打たせる。アオリイカは座らず海底近くで止まる。",
		noteEn: "The cuttlefish sits on the sand rippling its fin edges; the reef squid hovers just above.",
		place: "floor"
	},
	{
		id: "bury",
		ja: "砂に潜る",
		en: "Bury in sand",
		noteJa: "ひれで砂を巻き上げながら沈み、目と背中だけ出して隠れ、しばらくして出てくる。",
		noteEn: "Fins kick up sand as it sinks in until only eyes and back show, then comes out again.",
		place: "floor",
		only: "kouika"
	},
	{
		id: "range",
		ja: "可動域",
		en: "Range of motion",
		noteJa: "部品ごとに、動く範囲のいっぱいまで順に動かす（胴・ひれ・腕・触腕・漏斗・目・色）。",
		noteEn: "Moves each part through its full range in turn: mantle, fins, arms, tentacles, funnel, eyes, colour.",
		place: "water"
	}
];
/** 読み込んだ写真と形 */
var looks = /* @__PURE__ */ new Map();
var egiLook = null;
/**
* イカ（とエギ）の写真と形を読む。folder はキットの squid/ と egi/ が入ったフォルダ（例 './'）か、
* 「squid/aori.json」「egi/egi.json」のようなファイル名 → URL を返す関数。
*/
async function loadSquids(folder, ids = ["aori", "kouika"]) {
	const url = typeof folder === "string" ? (f) => folder.replace(/\/?$/, "/") + f : folder;
	const [lk, egi] = await Promise.all([Promise.all(ids.map((id) => loadSquidLook(id, (f) => url(`squid/${f}`)))), loadEgiLook((f) => url(`egi/${f}`))]);
	ids.forEach((id, i) => {
		if (!lk[i]) throw new Error(`squid-kit: could not load squid/${id}.json`);
		looks.set(id, lk[i]);
	});
	egiLook = egi;
}
/**
* 1 匹のイカと、その動き・墨・エギ・糸。object をシーンにそのまま足す（動かしたり大きさを変えたりしない）。
* イカはワールドの座標で home のまわりを泳ぐ（逃げる・追うなどで離れても戻ってくる）。腕の方が前（向き 0 で +Z）。
*/
var SquidActor = class {
	object = new THREE.Group();
	squid;
	fx;
	brain;
	egi;
	/** エギから伸びる糸（エギを使う動きだけ見える） */
	line;
	motion = "hover";
	egiRef;
	prevEgi = new THREE.Vector3();
	tmp = new THREE.Vector3();
	up = new THREE.Vector3();
	constructor(id, opt = {}) {
		if (!looks.has(id)) throw new Error(`squid-kit: call loadSquids() for "${id}" first`);
		this.object.name = `squid-${id}`;
		this.squid = new Squid(id, looks.get(id), opt.detail === "low" ? "lite" : "full");
		this.fx = new SquidFx();
		this.egi = new EgiModel(egiLook);
		const floorY = opt.floorY ?? 0;
		this.egi.floorY = floorY;
		this.egiRef = {
			obj: this.egi.obj,
			len: this.egi.len,
			r: this.egi.r
		};
		this.brain = new SquidBrain(this.squid, this.fx, this.egiRef, opt.home ?? new THREE.Vector3(0, floorY + 1, 0));
		this.brain.floorY = floorY;
		this.fx.floorY = floorY + .005;
		this.line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]), new THREE.LineBasicMaterial({
			color: 15265524,
			transparent: true,
			opacity: .6
		}));
		this.line.frustumCulled = false;
		this.object.add(this.squid.root, this.fx.group, this.egi.obj, this.line);
		this.setMotion("hover");
	}
	get id() {
		return this.squid.sp.id;
	}
	/** 胴の長さ（m） */
	get mantleLength() {
		return this.squid.ml;
	}
	get triangles() {
		return this.squid.triangles;
	}
	/** 海底・水面の高さと、水の外か（ページが床・水面・空を出すのに使う） */
	get floorY() {
		return this.brain.floorY;
	}
	get surfaceY() {
		return this.brain.surfaceY;
	}
	get showSurface() {
		return this.brain.showSurface;
	}
	get inAir() {
		return this.brain.inAir;
	}
	/** いまの段の説明（日本語） */
	get label() {
		return this.brain.label;
	}
	setMotion(m) {
		this.motion = m;
		this.brain.setMode(m);
	}
	/** いつでも墨を吐かせる */
	spitInk() {
		this.brain.spitInk();
	}
	/** 体の真ん中あたり（カメラで追うとき） */
	getCenter(out = new THREE.Vector3()) {
		this.squid.root.updateMatrixWorld();
		return out.set(0, 0, -this.squid.ml * .2).applyMatrix4(this.squid.root.matrixWorld);
	}
	update(dt) {
		const b = this.brain;
		b.update(dt);
		this.squid.update(dt);
		this.fx.update(dt);
		const e = this.egi.obj;
		const v = e.position.distanceTo(this.prevEgi) / Math.max(dt, 1e-4);
		this.prevEgi.copy(e.position);
		this.egi.flutter = Math.min(1.5, .35 + v * 3);
		this.egi.water = !b.inAir;
		this.egi.update(dt);
		e.updateMatrixWorld();
		this.line.visible = b.egiShown;
		if (this.line.visible) {
			const pos = this.line.geometry.attributes.position;
			const head = this.tmp.copy(this.egi.eyeLocal).applyMatrix4(e.matrixWorld);
			const to = b.mode === "hooked" ? b.anchor : this.up.set(head.x, head.y + 4, head.z);
			pos.setXYZ(0, head.x, head.y, head.z);
			pos.setXYZ(1, to.x, to.y, to.z);
			pos.needsUpdate = true;
		}
	}
	dispose() {
		this.object.removeFromParent();
		this.squid.dispose();
		this.fx.dispose();
		this.egi.obj.traverse((o) => {
			if (o instanceof THREE.Mesh) o.geometry.dispose();
		});
		this.line.geometry.dispose();
		this.line.material.dispose();
	}
};
function createSquid(id, opt) {
	return new SquidActor(id, opt);
}
export { SQUID_LIST, SQUID_MOTIONS, SquidActor, createSquid, loadSquids };
