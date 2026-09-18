# CHANGELOG — ART PLAYGROUND 更新履歴

**作業を始める前に必ず読むこと。作業が終わったら、下の「履歴」の一番上に1行追記すること。**
(クロード・チャッピー共通。チャッピーはGitHubへ直接反映できる操作もあるため、可能な操作は自分で実行する)

書式: `- YYYY-MM-DD 誰が: 何をした(対象ファイル)`
新しいものほど上。1作業1行、短く。古くなったら月ごとに数行へまとめてよい。
(2026/09/06以前の詳しい経緯は `ART_PLAYGROUND_HISTORY.md` にある)

- 2026-09-18 チャッピー: 参考動画の金属リボン彫刻を再構成したBRONZE KNOT / BRONZE FOLD / BRONZE HELIXを新規制作(prototypes/bronze-knot.html, prototypes/bronze-fold.html, prototypes/bronze-helix.html)
- 2026-09-18 チャッピー: BRONZE系3作を平たい金属リボン構造へ全面改修。円筒・節状の見た目を廃し、幅広の連続帯と面反射を主役にした(prototypes/bronze-knot.html, prototypes/bronze-fold.html, prototypes/bronze-helix.html)
---

## 現在の状態(変わったら書き換える)

- CURRENT: TIDE MARK(`art-v71-tide-mark.html`)
- LOG先頭: TAR CEILING(`art-v68-tar-ceiling.html`)
- 作業ルール: `AGENTS.md`(ギャラリー追加の手順と命名ルールは13章)
- 運用メモ: `NOTES.md`(GitHub操作は可能性を確認してから実行)

---

## 履歴

- 2026-09-18 クロード: TIDE MARKをCURRENTに変更。それまでのCURRENTだったTAR CEILINGはLOG先頭へ移動、Published works先頭もTIDE MARKに(index.html)
- 2026-09-18 クロード: TIDE MARKを採用。art-v71として昇格し(ap-kit.jsの相対パスをルート用に修正)、ギャラリーLOG先頭とPublished worksに追加。表示名はTIDE MARK(名前はクロードに一任)(art-v71-tide-mark.html, index.html)
- 2026-09-18 クロード: TIDE MARKの法則をおっちゃんの案「タッチで溶ける」に変更。触れた場所は溶けて二度と戻らず、溶けた所は①色を束ねていられず虹が幅いっぱいに広がる②彩度を失って淡い灰へ濁る③自分の重みで垂れ下がる④柔らかくなって次はもっと簡単に引き伸ばせる。触り続けると虹はその場所から順に失われ、最後は色の分かれ目のないただの淡い場だけが残る。実装は距離を割るspreadを位置ごとに変える形(prototypes/tide-mark.html)
- 2026-09-18 クロード: TIDE MARKの滑らかさとタッチ感を改善。①淡い部分に約10pxおきの色の段(バンディング)が出ていた原因は、256段のLUTを段のまま読んでいたこと→前後の値を混ぜた連続サンプリング+4x4ベイヤーディザで段を粒に散らし、バッファ解像度も上げた(検証で段数8→188に細分化、負荷2.5ms/frame)。②タッチが気持ち悪かった原因は、掴んだ瞬間になぎさが指の位置へ瞬間移動する実装だったこと→指を「近くの質点を引っ張る力」として効かせる方式に変更し、引けば伸び・素早く動かせばしなり・離せば揺れて戻るようにした。離した時に残る消えない跡は引いた量の34%だけにして、数回で形が崩壊しないよう配分(prototypes/tide-mark.html)
- 2026-09-18 クロード: TIDE MARKを参考動画に寄せて描画方式ごと作り直し。細い帯を線で描く方式では「平らな背景に帯が浮く」絵にしかならなかったので、各ピクセルでなぎさからの符号つき距離を求め、それを色ランプに通して画面全体を塗る方式(低解像度バッファ→拡大補間)に変更。座標系も回転させ、なぎさが好きな角度の斜めに走れるようにした(前のy=f(x)方式では立った角度が作れなかった)。弧はsin(πs)の一本弓にして両端を画面のふちに固定し、ゆっくり呼吸して反り返る。ロープ物理と消えない跡の法則はそのまま(prototypes/tide-mark.html)
- 2026-09-18 クロード: TIDE MARKが「動きが面白くない」とのフィードバックを受けて触り心地を作り直し。なぎさを質点の鎖(ロープ)として物理的に持たせ、触るとゴムのように追従して揺れ、離すとバネで弾んでから落ち着くようにした。永久の傷(marks)はバネの目標値そのものを動かす形にしたので、傷が増えるたびにその場所がボヨンと揺れる。触ってない時も水面のような小さなさざ波が常に流れるようにして、静止画っぽさを減らした(prototypes/tide-mark.html)
- 2026-09-18 クロード: TIDE MARKの色がマゼンタ/シアンのはずが青/緑に見える不具合を修正。原因はオフスクリーン合成後にctx.filter='blur()'でぼかしていたこと(半透明の重なりをぼかすと色相がずれるiOS Safariの既知症状)。filterをやめ、同じ曲線を太く薄い層→細く濃い層と複数回ストロークする方式(疑似グロー)に変更。合わせてシアン/金の色相オフセットも色相環上の実距離で計算し直した(prototypes/tide-mark.html)
- 2026-09-18 クロード: TIDE MARKを再修正。①縦縞のモアレの原因は帯を1px単位のラスタ画像で敷き詰めていて継ぎ目が二重に重なっていたこと→曲線パスのストローク+オフスクリーンぼかしに方式変更で解消。②うねりすぎて参考動画と違う見た目だった原因は正弦波の第2高調波の周波数が高すぎたこと→単一のゆるい弧+ごく小さな副うねりに変更(prototypes/tide-mark.html)
- 2026-09-18 クロード: TIDE MARKの帯がほぼ白飛びして見える不具合を修正。原因は帯を'screen'合成で明るいパステル背景に重ねていたこと(screenは暗い背景で光らせる用途で、明るい背景では色がほぼ消える)。source-overに変更し、きらめきの白丸も帯の色に寄せて控えめにした(prototypes/tide-mark.html)
- 2026-09-18 クロード: おっちゃん提供のX投稿動画(虹色の帯が斜めに走るグラデーション)を参考にTIDE MARKを新規制作。暖色/寒色を分ける虹色のなぎさが一本走り、なぞった場所でなぎさが押し出されて満ち引きの跡になる。跡は消えず、なぞるほど岸の形が積み重なって変わっていく(prototypes/tide-mark.html)
- 2026-09-18 クロード: ネオン看板のNEON SIGNを制作。4文字×16本のネオン管で今言える言葉を表示し、触れた管は焼き切れて二度と点かない。看板は残った管で綴れる別の言葉に切り替わり、管が減るほど言える言葉が減って最後は何も言えなくなる(prototypes/neon-sign.html)
- 2026-09-18 クロード: ネオン管モチーフのNEON ONE PATHを制作。管の網のうち電気が通るのは常に一本道だけで、交点に触れるとスイッチが切り替わり経路が変わる。電気の通らない管は冷えてやがて切れ、二度と点かないため、触るほど網が痩せて最後に一本道だけが残る(prototypes/neon-one-path.html)
- 2026-09-18 クロード: 虹色ガラス管の絡み合い(おっちゃん提供画像)を元にトーラス結び目の新作3本を制作。UNKNOT LAW=引いてもほどけず、押さえ続けると管が通り抜けて別の結び目に変わり溝が残る / PRESENCE LAW=触れた所だけが実体になり、触れない所は痩せて消える / CIRCUIT LAW=管を流れる光の順番(配線)が、触れた場所を入口に組み直される(prototypes/knot-unknot.html, prototypes/knot-presence.html, prototypes/knot-circuit.html)
- 2026-09-18 クロード: CRYSTAL STRAINをart-v70として昇格し、ギャラリー表示名をFATIGUE LAWとしてLOG先頭とPublished works(CURRENTの直後)に追加(art-v70-crystal-strain.html, index.html)
- 2026-09-18 しゅん: CRYSTAL STRAINを採用決定
- 2026-09-18 クロード: CRYSTAL FRACTUREとCRYSTAL PRISMを1つの法則に統合したCRYSTAL STRAINを制作。捻るほど格子が歪んで脆くなり、割れるのに必要な力が下がる。歪みきると軽く触れただけで砕け、再結晶時に捻れの総量が新しい相の対称数・分散・色へ変換されて引き継がれる。世代を重ねるほど生まれつき脆くなる(prototypes/crystal-strain.html)
- 2026-09-18 クロード: 結晶モチーフの新作3本を制作(おっちゃん提供のmakeitrad動画が参考)。CRYSTAL AXIS=触った方向が新しい鏡面(対称の軸)になり法則が積み上がる / CRYSTAL FRACTURE=長押しで砕き、離すと別の対称数・別の色で再結晶し割れた跡が世代を越えて残る / CRYSTAL PRISM=なぞると屈折の法則自体が捻れ、戻らず、捻りすぎると相転移する(prototypes/crystal-axis.html, prototypes/crystal-fracture.html, prototypes/crystal-prism.html)
- 2026-09-17 チャッピー: AXIOM FOLDを新規制作。触れるたび局所の座標法則を書き換え、以後の自律変形に恒久的な折り癖として残る作品を追加(prototypes/axiom-fold.html)
- 2026-09-17 クロード: OPAL MARBLEをart-v69として昇格、ギャラリーLOG先頭とPublished works(CURRENTの直後)に追加(art-v69-opal-marble.html, index.html)
- 2026-09-17 しゅん: OPAL MARBLEを採用決定
- 2026-09-17 クロード: OPAL MARBLEの白っぽいモヤモヤ(暗部の周りの雲のような縁と、平らな所の乳白色)を約2/3に減らした(prototypes/opal-marble.html)
- 2026-09-17 クロード: OPAL MARBLEの触り方を根本から作り直し。指=重さとして膜が沈み、虹の同心輪と波紋が出て周りの模様が吸い寄せられる。タップ=ぷるんと跳ね返る・長押し=深く沈む・押したまま動かす=航跡・複数指=波紋の干渉。離すとばねのように揺れて平らに戻る(prototypes/opal-marble.html)
- 2026-09-17 クロード: TAR CEILINGをart-v68として昇格しCURRENTに設定、それまでのCOLOR BREATHをLOG先頭へ移動、Published works先頭に追加(art-v68-tar-ceiling.html, index.html)
- 2026-09-17 しゅん: TAR CEILINGを採用・CURRENTに決定
- 2026-09-17 クロード: HOLO COMPASS・SEVEN SLICEを採用・art-v66/v67として昇格、ギャラリーLOG先頭とPublished worksに追加(art-v66-holo-compass.html, art-v67-seven-slice.html, index.html)
- 2026-09-17 しゅん: HOLO COMPASS(prototypes/holo-thaw.html)とSEVEN SLICE(prototypes/seven-slice.html)を採用決定