# CHANGELOG — ART PLAYGROUND 更新履歴

**作業を始める前に必ず読むこと。作業が終わったら、下の「履歴」の一番上に1行追記すること。**
(クロード・チャッピー共通。チャッピーはGitHubへ直接反映できる操作もあるため、可能な操作は自分で実行する)

書式: `- YYYY-MM-DD 誰が: 何をした(対象ファイル)`
新しいものほど上。1作業1行、短く。古くなったら月ごとに数行へまとめてよい。
(2026/09/06以前の詳しい経緯は `ART_PLAYGROUND_HISTORY.md` にある)

---

## 現在の状態(変わったら書き換える)

- CURRENT: TAR CEILING(`art-v68-tar-ceiling.html`)
- LOG先頭: OPAL MARBLE(`art-v69-opal-marble.html`)
- 作業ルール: `AGENTS.md`(ギャラリー追加の手順と命名ルールは13章)
- 運用メモ: `NOTES.md`(GitHub操作は可能性を確認してから実行)

---

## 履歴

- 2026-09-17 クロード: OPAL MARBLEをart-v69として昇格、ギャラリーLOG先頭とPublished works(CURRENTの直後)に追加(art-v69-opal-marble.html, index.html)
- 2026-09-17 しゅん: OPAL MARBLEを採用決定
- 2026-09-17 クロード: OPAL MARBLEの白っぽいモヤモヤ(暗部の周りの雲のような縁と、平らな所の乳白色)を約2/3に減らした(prototypes/opal-marble.html)
- 2026-09-17 クロード: OPAL MARBLEの触り方を根本から作り直し。指=重さとして膜が沈み、虹の同心輪と波紋が出て周りの模様が吸い寄せられる。タップ=ぷるんと跳ね返る・長押し=深く沈む・押したまま動かす=航跡・複数指=波紋の干渉。離すとばねのように揺れて平らに戻る(prototypes/opal-marble.html)
- 2026-09-17 クロード: TAR CEILINGをart-v68として昇格しCURRENTに設定、それまでのCOLOR BREATHをLOG先頭へ移動、Published works先頭に追加(art-v68-tar-ceiling.html, index.html)
- 2026-09-17 しゅん: TAR CEILINGを採用・CURRENTに決定
- 2026-09-17 クロード: HOLO COMPASS・SEVEN SLICEを採用・art-v66/v67として昇格、ギャラリーLOG先頭とPublished worksに追加(art-v66-holo-compass.html, art-v67-seven-slice.html, index.html)
- 2026-09-17 しゅん: HOLO COMPASS(prototypes/holo-thaw.html)とSEVEN SLICE(prototypes/seven-slice.html)を採用決定
- 2026-09-17 クロード: TAR CEILINGの起動時の雫と漏れ口の雫を中間の太さに統一(prototypes/tar-ceiling.html)
- 2026-09-17 クロード: OPAL MARBLEの丸い滴をやめ、タップ=渦・長押し=かき混ぜに変更。乱れた模様は数秒で元の流れへ戻り、常時ゆっくり対流するように(prototypes/opal-marble.html)
- 2026-09-17 クロード: SEVEN SLICEの数値表示(HUD)を非表示に(prototypes/seven-slice.html)
- 2026-09-17 クロード: HOLO THAWを全面改修しHOLO COMPASSへ。融解をやめ、面を羅針盤の針とし、ドラッグ=向きを揃える・タップ=衝撃波ではじく・長押し=渦で回す(記憶は消えない)に変更。ファイル名は据え置き(prototypes/holo-thaw.html)
- 2026-09-17 クロード: TAR CEILINGの漏れ口を細い糸状に変更、上限24個に。横になぞると12pxおきに細かい漏れ口が並ぶ(prototypes/tar-ceiling.html)
- 2026-09-17 クロード: OPAL MARBLEを低解像度の流体(速度場+圧力)に改修。ドラッグ後も液がヌルヌル滑り続け、滴は0.4秒かけて広がる。1操作で多数パスを描く重い処理を廃止(prototypes/opal-marble.html)
- 2026-09-17 クロード: SEVEN SLICE新規プロトタイプ追加。7次元格子の断面(de Bruijnの7方向グリッド)を線と交点で描き、ドラッグ=フェイゾンで組み替え、タップ=消えない転位、長押し=残る張力、✦=対称数(次元)変更のWebGL2作品(prototypes/seven-slice.html)
- 2026-09-16 チャッピー: CHROMATIC TIDEを再構成。宇宙空間のような表現を廃し、画面全体を密度の高い多層の生体的な織物として動かす構造へ変更(prototypes/violet-membrane.html)
- 2026-09-16 チャッピー: CHROMATIC TIDEを画面全体へ拡張。水平・垂直の大域的な潮流と多層色彩場を追加し、変化のスケールを全面化(prototypes/violet-membrane.html)
- 2026-09-17 クロード: HOLO THAW新規プロトタイプ追加。3階層の折れ目を持つ凍ったホログラム箔が、触れた熱で溶けて二度と凍らず、温かい間だけ重力で流れて下の箔を溶かしていくWebGL2作品(prototypes/holo-thaw.html)
- 2026-09-17 クロード: TAR CEILING新規プロトタイプ追加。触れた場所が塞がらない漏れ口になり黒いクローム液が垂れ続け、天井が尽きると世界が反転して床が天井になるWebGL2作品(prototypes/tar-ceiling.html)
- 2026-09-17 クロード: OPAL MARBLE新規プロトタイプ追加。虹色の流体マーブルに、タップ=滴・長押し=注ぐ・ドラッグ=櫛で座標写像を恒久的に書き換える墨流し型WebGL2作品(prototypes/opal-marble.html)
- 2026-09-16 チャッピー: CHROMATIC TIDEを再設計。多色パレットの連続遷移、形状の多重変形、内外の流れ、背景光と周回光を強化(prototypes/violet-membrane.html)
- 2026-09-16 チャッピー: CHROMATIC TIDEへ再設計。時間変化を増幅し、周期的な多色パレット変化・呼吸する輪郭・移動する中心・多層背景光と軌道を追加(prototypes/violet-membrane.html)
- 2026-09-16 チャッピー: NOCTURNE FIELDへ再設計。タッチ痕跡を表示せず変化だけを継続させ、藍紫系の配色と多層の背景光を強化(prototypes/violet-membrane.html)
- 2026-09-16 チャッピー: INVERSE GARDENの色彩・背景を再設計し、タッチ痕跡を円形マーカーから光の裂け目へ変更(prototypes/violet-membrane.html)
- 2026-09-16 チャッピー: VIOLET MEMBRANEを発想転換し、触れた場所で「内外」が反転する位相場の作品INVERSE GARDENへ全面再構築(prototypes/violet-membrane.html)
- 2026-09-17 チャッピー: VIOLET MEMBRANEを本格再構築。球体中心の表現を廃し、連続する多層フィラメント膜・中央粒子核・周回軌道・脱出フィラメントで有機的な立体感を強化(prototypes/violet-membrane.html)
- 2026-09-17 チャッピー: VIOLET MEMBRANEを再設計。参照映像の球体化を避け、縦長の有機フィールドと高密度フィラメント、前景ボリューム、周回ノードによる発光構造へ変更(prototypes/violet-membrane.html)
- 2026-09-17 チャッピー: VIOLET MEMBRANEを参照映像寄りの構図へ再設計。球体ではなく縦長の中空膜、前面のドット球、衛星状ノードを分離したWebGL2作品へ改修(prototypes/violet-membrane.html)
- 2026-09-17 チャッピー: VIOLET MEMBRANE新規プロトタイプ追加。WebGL2の有機膜・球面フィラメント・内部軌道・発光ノードを組み合わせ、タッチ位置を恒久的な変形法則として作用させる作品を実装(prototypes/violet-membrane.html)
- 2026-09-17 チャッピー: CHORUS VOID新規プロトタイプ追加。7階層の折り畳み構造と触れた場所を恒久的な折り目として作用させるWebGL作品を実装(prototypes/chorus-void.html)
- 2026-09-17 チャッピー: EVENT HORIZONを再設計。触れた場所が恒久的な重力法則になり、3階層の自己相似変形へ作用するCanvas作品に改修(prototypes/event-horizon.html)
- 2026-09-17 チャッピー: TENFOLD MEMBRANE新規プロトタイプ追加。10本の膜が圧力場で互いに曲げ合う構造を軽量Canvasで実装(prototypes/tenfold-membrane.html)
- 2026-09-16 チャッピー: LIVING FOLDを10本の関係性重視へ再設計。描画負荷を抑えつつ位相差・干渉・背景反応を強化(prototypes/living-fold.html)
- 2026-09-16 チャッピー: LIVING FOLDを10本化したままiPhone向けに描画点数・DPR・発光処理を軽量化(prototypes/living-fold.html)
- 2026-09-16 チャッピー: LIVING FOLDを10本の液体リボンへ拡張。各リボンに位相差と個別変形を与え、密度を上げた(prototypes/living-fold.html)
- 2026-09-16 チャッピー: LIVING FOLD プロトタイプ追加。3本の液体リボンが互いの形態を侵食しながら変形する構造と多層背景を実装(prototypes/living-fold.html)
- 2026-09-16 チャッピー: PRISMATIC ENTANGLEMENTを再構成。2D Canvasで表示安定性を優先し、画面内に収まる三重の液体リボンと多層発光背景を実装(prototypes/prismatic-entanglement.html)
- 2026-09-16 チャッピー: LIQUID ENTANGLEMENT プロトタイプ追加。画面内に収まる閉じた液体立体構造と動く多層背景を実装(prototypes/liquid-entanglement.html)
- 2026-09-16 チャッピー: FLUX WEAVE プロトタイプ追加。球体ではなく二重に絡むトーラス状の立体構造をレイマーチングで実装(prototypes/flux-weave.html)
- 2026-09-16 チャッピー: MORPHIC LOOP プロトタイプ追加。変形する閉ループ立体メッシュと反射シェーディングで構成(prototypes/morphic-loop.html)
- 2026-09-16 チャッピー: LIQUID INVERSION プロトタイプ追加。滑らかな液体球に移動する深い陥没と反射色の変化を組み込んだWebGL作品(prototypes/liquid-inversion.html)
- 2026-09-16 チャッピー: LIQUID PEARL V2 プロトタイプ追加。クローム膜・反射色・ゆっくりした形状変化をWebGLで実装(prototypes/liquid-pearl-v2.html)
- 2026-09-16 クロード: ENCIRCLE を採用・art-v65として昇格、ギャラリーLOG先頭に追加(art-v65-encircle.html, index.html)
- 2026-09-16 チャッピー: LIQUID KNOTを立体的な液体チューブ表現へ全面改修(prototypes/liquid-knot.html)
- 2026-09-16 クロード: LIQUID LAW の配色を滑らかなグラデーション3種(✦で切替)にし、背景もグラデ+ハローに(prototypes/liquid-law.html)
- 2026-09-16 チャッピー: LIQUID KNOT プロトタイプ追加(prototypes/liquid-knot.html)
- 2026-09-16 クロード: チャッピーがindex.htmlへ直接push可能に変更(従来は出力してしゅんが手動反映)。AGENTS.md 13章更新
- 2026-09-16 クロード: LIQUID LAW を全面書き直し。法を大円の帯として実装し直した(prototypes/liquid-law.html)
- 2026-09-16 クロード: Published works欄にRGB MEMBRANEが抜けていた不整合を修正(index.html)
- 2026-09-16 クロード: LIQUID LAW プロトタイプ追加(触れた場所に亀裂が残るクロム球, prototypes/liquid-law.html)
- 2026-09-16 チャッピー: 採用済みCURRENTのap-kit.js参照パスを修正(archive/adopted/spiral-spectrum-200-v9.html)
- 2026-09-16 チャッピー: CURRENTの旧参照先を復旧用ラッパーで接続( prototypes/spiral-spectrum-200-v9.html )
- 2026-09-16 チャッピー: GitHub操作は実行可能性を確認してから自分で実行する運用ルールを追加(NOTES.md)
- 2026-09-16 チャッピー: 採用済み2作品をarchive/adoptedへ移動(archive/adopted/)
- 2026-09-16 クロード: CHANGELOG.md を新設。作業前に読む・作業後に追記するルールをAGENTS.md 0章に追加
- 2026-09-16 クロード: CURRENTの表示名を「COLOR BREATH」に決定。表示名の決め方をAGENTS.md 13章に追記
- 2026-09-16 クロード: V9をCURRENTに設定、それまでのCHROMATIC FOLDをLOG先頭へ移動(index.html)
- 2026-09-16 クロード: チャッピーも採用作品をindex.htmlに追加できるようにルール変更(AGENTS.md 0・2・11・13章)
- 2026-09-16 しゅん: SPIRAL SPECTRUM 200 V9 を採用決定
- 2026-09-16 チャッピー(しゅん反映): SPIRAL SPECTRUM 200 の試作 V2〜V9、DUAL/BREATHING SPECTRUM 200 を追加(prototypes/)
