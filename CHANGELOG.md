- 2026-09-21 チャッピー: SKY FOLDのフラクタル構造が薄すぎたため、fold密度とコントラストを上げて雲状の自己相似構造を読めるよう調整(prototypes/sky-fold.html)
- 2026-09-21 チャッピー: SKY FOLDをiPhone向けに再軽量化。fold回数・内部解像度・精度を落とし、重い二重計算と後段の空背景上書きを削減(prototypes/sky-fold.html)
- 2026-09-21 チャッピー: SKY FOLDを参考元のフラクタルGLSL構造へ再設計。元コードの99×19 foldをiPhone向け72×15へ最適化し、空と雲の色調を再構成(prototypes/sky-fold.html)\n- 2026-09-21 チャッピー: SKY FOLDの雲層を大幅に厚く再調整。画面内に実際の雲塊が現れる高度範囲へ修正し、雲密度・空洞・陰影を強化。前版の「ほぼ青空」状態を修正(prototypes/sky-fold.html)\n- 2026-09-21 チャッピー: SKY FOLDを再設計。単純な雲塊合成から軽量ボリューメトリック雲へ変更し、雲の体積・陰影・遠景・上空の薄雲・右下の光を再構成。参考画像のような「空を埋める雲」を狙う(prototypes/sky-fold.html)\n- 2026-09-21 チャッピー: SKY FOLDの高DPI描画を改善。iPhoneのdevicePixelRatioに合わせて内部解像度を最大2倍へ拡張し、低解像度由来のブロック状表示を解消(prototypes/sky-fold.html)\n- 2026-09-21 チャッピー: SKY FOLDの雲生成を全面再構築。四角いノイズセルを廃し、丸い雲塊を重ねるメタボール風構造＋軽量FBMで積雲らしい形状へ変更。背景の空・雲海・光も維持(prototypes/sky-fold.html)\n- 2026-09-21 チャッピー: SKY FOLDの内部描画解像度を0.72倍から1.0倍へ戻し、iPhoneで発生した大きなブロック状表示を修正。軽量化した2D雲シェーダー構成は維持(prototypes/sky-fold.html)\n- 2026-09-21 チャッピー: SKY FOLDをiPhone向けに大幅軽量化。レイマーチングを廃し2D多層雲シェーダーへ変更、内部描画解像度も抑えてGPU負荷を削減(prototypes/sky-fold.html)\n- 2026-09-21 チャッピー: SKY FOLDを雲の塊が読めるボリューメトリック雲景へ改修。積雲・雲海・巻雲・太陽光の背景を追加し、雲の自己相似とタッチ変形を強化(prototypes/sky-fold.html)\n- 2026-09-21 チャッピー: SKY FOLDを新規制作。空間そのものを5階層で折り畳み、触れた場所を次の空の法則として恒久的に引き継ぐWebGL2試作を追加(prototypes/sky-fold.html)
- 2026-09-21 チャッピー: standalone起動時のステータスバーをblack-translucentへ戻し、作品をステータスバー裏まで広げる全画面表示を復元。×ボタンの下げ位置は維持(index.html)
- 2026-09-21 チャッピー: standalone表示のステータスバーを不透明な黒に変更してガラス感を抑え、作品領域を維持したまま閉じる×ボタンをステータスバー下からさらに20px下げた(index.html)
- 2026-09-21 チャッピー: ART PLAYGROUNDをiPhoneのホーム画面Webアプリとして起動した際、CURRENT作品を自動で全画面モーダル表示するPWA/standalone対応を追加。viewport-fitとblack-translucentを使い、作品をステータスバー直下まで可能な限り広げる(manifest.webmanifest, index.html)
- 2026-09-21 チャッピー: MIRROR FRACTUREのキャンバスを固定フルブリード化し、実際のキャンバス表示領域から描画解像度を取得するよう修正(art-v75-mirror-split.html)
- 2026-09-21 チャッピー: MIRROR PRESSURE / MIRROR DESCENTを直前の互換性修正前へ復元。iPhone/iPad両方で表示される採用時の描画状態を優先し、今回のiPad対策は取り消した(art-v73-mirror-pressure.html, art-v74-mirror-descent.html)

- 2026-09-21 チャッピー: MIRROR PRESSURE / MIRROR DESCENTのタッチ判定を再修正。固定8枠を維持しつつ分岐を使わずactive係数で無効枠を処理する方式に変更し、iPhoneのタッチ反応を戻しながらiPadのWebGL不安定要因をさらに減らした(art-v73-mirror-pressure.html, art-v74-mirror-descent.html)

- 2026-09-21 チャッピー: MIRROR PRESSURE / MIRROR DESCENTのiPadタッチ時描画消失対策。タッチ点の有効判定を固定ループ化し、WebGL2の動的分岐とuniform n依存を除去して、iPhoneでの見た目・8点仕様を維持したままiPad側の不安定要因を減らした(art-v73-mirror-pressure.html, art-v74-mirror-descent.html)

- 2026-09-21 チャッピー: MIRROR PRESSURE / MIRROR DESCENTを採用時の状態へ復元。タッチ変形の後付け安定化とリセット時の時間位相初期化を取り消し、採用時の挙動へ戻した(art-v73-mirror-pressure.html, art-v74-mirror-descent.html)

- 2026-09-21 チャッピー: MIRROR PRESSURE / MIRROR DESCENTのリセットボタンでタッチ回数だけでなく時間位相も初期化するよう修正。リセット後は初期状態から再スタート(art-v73-mirror-pressure.html, art-v74-mirror-descent.html)

- 2026-09-21 チャッピー: MIRROR PRESSURE / MIRROR DESCENTのタッチ時に画面が消える可能性がある不安定なタッチ計算を修正。タッチ寿命を明示化し、変形量を制限してiOS/WebGL2での数値暴走を抑制(art-v73-mirror-pressure.html, art-v74-mirror-descent.html)

- 2026-09-21 チャッピー: 次候補比較用にORGANISM / TOPOLOGY / MEMBRANE / VOIDの4試作を新規制作。LATTICEは既存試作を再確認し、5方向を比較できる状態にした(prototypes/organism.html, prototypes/topology.html, prototypes/membrane.html, prototypes/lattice.html, prototypes/void.html)

- 2026-09-21 チャッピー: MIRROR FOLDを新規制作。鏡面を動かすのではなく空間そのものを6階層で折り畳み、折り目の奥へ縮小した世界を連続的に畳み込む試作を追加(prototypes/mirror-fold.html)

- 2026-09-21 チャッピー: ギャラリーLOG内で重複していたMIRROR PRESSUREを1件整理。CURRENTからLOGへ移した1件を残し、同一作品の二重表示を解消(index.html)

- 2026-09-21 チャッピー: MIRROR INVERTを新規制作。鏡面の内側と外側が4階層で反転し続け、8分割の大構造を保ちながらタッチした場所を反転の中心として法則を変える試作を追加(prototypes/mirror-invert.html)

- 2026-09-21 チャッピー: MIRROR FRACTUREをCURRENTへ変更。MIRROR PRESSUREをLOG先頭へ移動し、Published worksの先頭をMIRROR FRACTUREに更新(art-v75-mirror-split.html, art-v73-mirror-pressure.html, index.html)

- 2026-09-21 チャッピー: MIRROR SPLITをMIRROR FRACTUREとしてart-v75へ採用・昇格。ルート作品化し、ギャラリーLOGとPublished worksへ追加(art-v75-mirror-split.html, index.html)

- 2026-09-21 チャッピー: MIRROR SPLITのWebGL2シェーダーでループ内変数のスコープエラーが発生して描画されない不具合を修正(prototypes/mirror-split.html)

- 2026-09-21 チャッピー: MIRROR SPLITを再構築。細かなノイズ状パターンを廃し、8→16→32→64→128の鏡面分裂が画面全体で読める大きな幾何構造へ変更(prototypes/mirror-split.html)

- 2026-09-21 チャッピー: MIRROR SPLITを新規制作。8分割の鏡面が8→16→32→64へ自己相似に裂け続け、タッチした場所が次の分裂法則を局所的に変える試作を追加(prototypes/mirror-split.html)

- 2026-09-21 チャッピー: MIRROR DESCENTをart-v74として採用・昇格。中心へ沈み続ける構造をルート作品化し、ギャラリーLOGとPublished worksへ追加(art-v74-mirror-descent.html, index.html)

- 2026-09-21 チャッピー: MIRROR PRESSUREを中心へ沈み続ける構造へ改造。半径方向の連続的な内向き移流を追加し、8分割の鏡面構造と極彩色は維持(prototypes/mirror-pressure.html)

- 2026-09-21 チャッピー: MIRROR PRESSUREをCURRENTへ変更。TIDE MARKをLOG先頭へ移動し、Published worksの先頭をMIRROR PRESSUREに更新(art-v73-mirror-pressure.html, index.html)

- 2026-09-21 チャッピー: MIRROR PRESSUREをart-v73として採用・昇格。極彩色の圧力場をルート作品として追加し、ギャラリーLOGとPublished worksへ登録(art-v73-mirror-pressure.html, index.html)

- 2026-09-21 チャッピー: MIRROR PRESSURE系のネオン色彩比較用にNEON CYAN MAGENTA / ELECTRIC RAINBOW / NEON PRISMの3試作を追加(prototypes/neon-cyan-magenta.html, prototypes/electric-rainbow.html, prototypes/neon-prism.html)

- 2026-09-21 チャッピー: MIRROR PRESSUREの暗部を持ち上げ、極彩色の中間〜高輝度を増加。構造と動きは維持したまま、画面全体の発光感を強化(prototypes/mirror-pressure.html)

# CHANGELOG — ART PLAYGROUND 更新履歴

- 2026-09-21 チャッピー: MIRROR PRESSUREの1画面あたりの色彩密度を増強。スペクトル分割を細かくし、複数スケールの色相変化を重ねて一画面内により多くの色が現れるよう調整(prototypes/mirror-pressure.html)

- 2026-09-21 チャッピー: MIRROR PRESSUREを直前の極彩色版へ戻し、オーロラ風の色彩処理を取り消し(prototypes/mirror-pressure.html)

- 2026-09-21 チャッピー: MIRROR PRESSUREの極彩色を硬い虹色パターンから柔らかな発光帯へ再設計。揺らぐスペクトル幕と重なる光の帯でオーロラ的な色彩感を追加(prototypes/mirror-pressure.html)

- 2026-09-21 チャッピー: MIRROR PRESSUREの色彩を極彩色へ再調整。彩度を大幅に引き上げ、虹色の空間変化と白いスペクトルハイライトを強化(prototypes/mirror-pressure.html)

- 2026-09-21 チャッピー: MIRROR PRESSUREを直前の状態へ戻し、中心から外側への放射波変更を取り消し(prototypes/mirror-pressure.html)

- 2026-09-21 チャッピー: MIRROR PRESSUREの運動方向を見直し、回転的な時間変化を抑えて中心から外側へ伝播する放射波を主動力に変更(prototypes/mirror-pressure.html)

- 2026-09-21 チャッピー: MIRROR PRESSUREのタッチ変形を時間減衰式に変更。押した瞬間は強く歪み、約1周期で自然に元の形へ戻るよう調整(prototypes/mirror-pressure.html)

- 2026-09-21 チャッピー: MIRROR PRESSUREのタッチ処理を再修正。画面座標の段階で局所収縮を発生させ、タッチ位置に明確な歪みと発光変化が出るよう強化(prototypes/mirror-pressure.html)

- 2026-09-21 チャッピー: MIRROR PRESSUREは見た目を維持したまま描画負荷を軽量化し、タッチ変形を対称座標へ正しく適用して効果を強化(prototypes/mirror-pressure.html)

- 2026-09-21 チャッピー: CHROMATIC FOLDを根本から再制作。反復計算を軽量化し、4点までの強い局所変形と空間的な極彩色領域を持つ構造へ変更(prototypes/chromatic-fold.html)

- 2026-09-21 チャッピー: CHROMATIC FOLDとMIRROR PRESSUREを調整。構造は維持し、空間ごとに色相が変わる極彩色パレットへ変更、タッチ位置の局所変形を強化(prototypes/chromatic-fold.html, prototypes/mirror-pressure.html)

- 2026-09-21 チャッピー: 前3作を作り直し、画面全体を使うWebGL2試作を3本追加。大きな折り面のCHROMATIC FOLD、対称面が圧力で歪むMIRROR PRESSURE、格子が溶けて位相を変えるMOLTEN LATTICEを制作(prototypes/chromatic-fold.html, prototypes/mirror-pressure.html, prototypes/molten-lattice.html)

- 2026-09-21 チャッピー: OPAL系と被らない3方向の試作を追加。色の地殻がずれるCOLOR TECTONIC、触れた場所が呼吸中心になるSPECTRAL ORGAN、無彩色の構造が触れるほど色を獲得するPRISM COLLAPSEを制作(prototypes/color-tectonic.html, prototypes/spectral-organ.html, prototypes/prism-collapse.html)

- 2026-09-21 チャッピー: OPAL ABYSSの形状・動き・タッチ法則は維持し、色だけを極彩色の高彩度スペクトルへ変更(prototypes/opal-abyss.html)
- 2026-09-21 チャッピー: OPAL ABYSSとOPAL INTERFERENCEを直前のWebGL2版へ差し戻し、今回の再設計を撤回(prototypes/opal-abyss.html, prototypes/opal-interference.html)

- 2026-09-21 チャッピー: OPAL GROWTHをCanvas2Dベースへ再構築して描画安定化。OPAL ABYSSはタッチ位置から深度・歪みが増幅する構造へ、OPAL INTERFERENCEは暗い背景と多層スペクトル干渉へ再設計(prototypes/opal-growth.html, prototypes/opal-abyss.html, prototypes/opal-interference.html)

- 2026-09-21 チャッピー: OPAL GROWTH / ABYSS / INTERFERENCEのWebGL2描画不具合を修正。GLSL改行エスケープと配列uniformの取得を修正(prototypes/opal-growth.html, prototypes/opal-abyss.html, prototypes/opal-interference.html)

- 2026-09-21 チャッピー: OPAL MARBLE改良案を3本追加。成長する鉱物、深部へ沈むオパール、光学干渉する結晶の別実装をprototypes/に追加(prototypes/opal-growth.html, prototypes/opal-abyss.html, prototypes/opal-interference.html)

- 2026-09-21 チャッピー: 判定結果に基づき、prototypes/ の不要試作123作品を削除。採用原型・ギャラリー参照作品は保持し、判定画面と一覧資料も更新(prototypes/)

- 2026-09-21 チャッピー: prototypes/index.html に判定結果の書き出し(削除候補ファイル名をコピー)を追加(prototypes/index.html)

- 2026-09-21 チャッピー: prototypes/index.html に作品ごとの「残す／削除候補／未判定」判定、件数集計、検索・絞り込み、実作品プレビューを追加(prototypes/index.html)

- 2026-09-21 チャッピー: prototypes/ を全170ファイル一覧化し、シリーズ・主要試作・単発試作・エンジン/資料・小型整理候補を見える化(prototypes/README.md)

- 2026-09-21 チャッピー: 作品の全画面閲覧をD1へ記録し、作品別・直近30日・日別のアクセス集計APIを追加。過去の閲覧履歴はこの仕組みでは復元せず、2026-09-21以降を蓄積(worker.js, wrangler.toml)

- 2026-09-21 クロード: LUMINAを採用。art-v72として昇格し、ギャラリーLOG先頭とPublished works(CURRENTの直後)に追加。参考画像の積層スラブ構図(全幅横帯+全高縦帯の格子/中央下地を3〜7本の縦スラブに分割/4辺別ボケ幅の矩形/screen主体+2割multiply/ブルーム→ビネット→グレイン)はそのままに、ギャラリー用として全画面化・ap-kit.js統合し、「触れた高さで光の層が切れ、切れ目から下がまるごと横へずれる。切れ目は塞がらず、切るほど世界は泳ぐ力を失って最後は動かないガラスの標本になる」という法則を追加(art-v72-lumina.html, index.html)

- 2026-09-21 チャッピー: STATIC LIGHTを参考画像寄りに再構築。大面積の透明矩形、入れ子の光学面、水平/垂直の境界光、暗い周辺光、グレインを強化(prototypes/static-light.html)
- 2026-09-21 チャッピー: STATIC LIGHTを新規制作。参考画像の多層矩形・透過面・色光・微細グレインをCanvas2Dで再構成し、タッチ位置を反射面として記憶する法則を実装(prototypes/static-light.html)

- 2026-09-20 チャッピー: MANDEL LAWを連続ズーム型へ改修。自動で自己相似領域を渡り歩きながら深度を増し、タッチによる局所冪法則の変更も維持(prototypes/mandel-law.html)

- 2026-09-20 チャッピー: MANDEL LAWの描画をCanvas2Dの安定描画方式へ変更し、WebGL2依存による黒画面を回避。マンデルブロ計算と局所冪法則・周期色変化は維持(prototypes/mandel-law.html)

- 2026-09-20 チャッピー: MANDEL LAWを新規制作。WebGL2でマンデルブロ集合を描画し、タッチした場所に局所的な冪法則の変更を恒久的に刻む構造と、周期的な色・呼吸変化を実装(prototypes/mandel-law.html)

- 2026-09-20 チャッピー: CELLULAR BLOOMを参考動画の点描リング＋ロゼット群として根本再構成。大中小3階層の自己相似セル、周期的な格子変形、タッチによる密度・色・開花法則の変更を実装(prototypes/cellular-bloom.html)

- 2026-09-20 クロード: SHOAL LABを新規制作。koi-pond-engine.jsの群れシミュレーションはそのままに、描く生き物と背景だけを差し替えて見比べる実験台。POND(鯉)/ABYSS(深海の発光生物)/FLOCK(夜空の群れ)/CULTURE(顕微鏡の細胞)/NESTED(階層ごとに魚→小魚→オタマジャクシ→微生物と姿が変わる)の5世界を⚙パネルで切替、水の濃さ・ぼけ・光の網・数をスライダーで調整可(値はlocalStorageに保存)(prototypes/shoal-lab.html)

- 2026-09-20 クロード: KOI POND B/Cの鯉が長い棒状に伸びるバグを修正。✦(mutate)で鯉を瞬間移動させた際に体の背骨履歴が旧位置に残っていたのが原因。Koi.place()で背骨を張り直すようにし、あわせて背骨の節間隔を常に体長/11に保つ処理を追加(低フレームレートでも伸びない)(prototypes/koi-pond-engine.js)

- 2026-09-20 クロード: KOI PONDのリアル方向を2案制作して比較用に追加。共通シミュレーションを prototypes/koi-pond-engine.js に分離し、B=Canvas2Dで深度ぼかし・水中の青かぶり・光の網(コースティクス)・深さで動く影(prototypes/koi-pond-b.html)、C=WebGL2で水面の高さ場から法線を作り下の層を屈折させ、コースティクスと鏡面反射を加算(prototypes/koi-pond-c.html)。世界のルール(SHOAL LAW)は初版と同一

- 2026-09-20 クロード: KOI POND (SHOAL LAW) を新規制作。おっちゃん共有の鯉の池アニメを元に、タップ=同世代の鯉が合体して一段大きく / 長押し=餌で半分のスケール2匹に分裂、という群れのスケール法則(4階層・自己相似)として再構成(prototypes/koi-pond.html)。GIFは群れが蓄積するためシームレスループにはならない

- 2026-09-19 チャッピー: POLAR FOLDを第10構成へ再設計。単純な同心スクエア輪を廃し、強いログ螺旋・内側の丸まり・非対称な半径ワープ・細い下向きシームで一本の連続螺旋として再構成(prototypes/polar-fold.html)

**作業を始める前に必ず読むこと。作業が終わったら、下の「履歴」の一番上に1行追記すること。**
(クロード・チャッピー共通。チャッピーはGitHubへ直接反映できる操作もあるため、可能な操作は自分で実行する)

書式: `- YYYY-MM-DD 誰が: 何をした(対象ファイル)`
新しいものほど上。1作業1行、短く。古くなったら月ごとに数行へまとめてよい。
(2026/09/06以前の詳しい経緯は `ART_PLAYGROUND_HISTORY.md` にある)

- 2026-09-19 チャッピー: POLAR FOLDを第9構成へ根本再設計。左右分割・中央折りを廃し、参考動画を再解析して単一のスクエア・ログポーラー螺旋＋下向きの連続シーム＋大規模ズーム＋面全体の虹色場としてWebGL2で再構成(prototypes/polar-fold.html)

- 2026-09-19 チャッピー: POLAR FOLDを第8構成へ再設計。単一の渦状四角から左右対称の独立した正方形場へ戻し、中央ヒンジへの折り込み・自己相似色面・タッチによる折り癖を強化(prototypes/polar-fold.html)

- 2026-09-19 チャッピー: POLAR FOLDを第7構成へ全面再制作。WebGL2シェーダーへ戻し、L∞正方形距離＋自己相似輪郭＋中央ヒンジ変形＋強いズーム＋面全体のプリズム色場で再構成(prototypes/polar-fold.html)

- 2026-09-19 チャッピー: POLAR FOLDを描画安定版へ修正。WebGL2をやめ2D Canvasへ切り替え、左右の正方形折り＋中央ヒンジ＋大きなズームを確実に描画(prototypes/polar-fold.html)

- 2026-09-19 チャッピー: POLAR FOLDを第6構成へ全面再制作。参考動画を再解析し、左右2領域＋中央ヒンジ＋スクエア・ポーラー変形＋ズームをWebGL2シェーダーで実装(prototypes/polar-fold.html)

- 2026-09-19 チャッピー: POLAR FOLDを第5構成へ全面再制作。波形・自己交差構造を廃し、明快な有機形の虹色膜がゆっくり変形する美観重視の周期構造へ変更(prototypes/polar-fold.html)

- 2026-09-19 チャッピー: POLAR FOLDを第4構成へ再設計。3つの巡回する折り目が膜を押し出し・圧縮・自己交差させ、重なり→色の濃縮→ほどける動きを作る周期構造へ変更(prototypes/polar-fold.html)

- 2026-09-19 チャッピー: POLAR FOLDを画面いっぱいへ拡張。膜の横幅・厚み・折り返し振幅・描画スケールを増やし、画面端で切れるほど大きな構造へ変更(prototypes/polar-fold.html)

- 2026-09-19 チャッピー: POLAR FOLDを第3構成へ再設計。閉じた輪と中央空白を廃し、画面外から画面外へ続く一本の連続膜が折れ・ねじれ・色を圧縮する構造へ変更(prototypes/polar-fold.html)

- 2026-09-19 チャッピー: POLAR FOLDを全面再構築。輪郭線を廃し、画面全体を一枚の折り畳まれた色の膜として計算。内部まで連続して変形する構造へ変更(prototypes/polar-fold.html)

- 2026-09-19 チャッピー: POLAR FOLDを新規制作。参考動画の虹色の折り曲げ境界を、触れた場所が永久的な折り目として自律変形へ継承される空間法則に再構成(prototypes/polar-fold.html)

- 2026-09-19 チャッピー: BLACK ORCHIDを再々構築。単一の植物脊椎から不均等な幅広膜器官が展開する非放射・非円形の生体構造へ変更(prototypes/black-orchid.html)

- 2026-09-19 チャッピー: BLACK ORCHIDの描画ループ欠落を修正。requestAnimationFrameによる常時描画を追加(prototypes/black-orchid.html)

- 2026-09-19 チャッピー: BLACK ORCHIDを再構築。円形・放射状のウニ的構造を廃し、6器官の非対称な有機膜と多階層の自己相似フリンジで黒紫の異形植物として再設計(prototypes/black-orchid.html)

- 2026-09-19 チャッピー: BLACK ORCHIDを根本から再構築。花弁・触手の表現を廃し、入れ子膜・放射脈・中央器官による異形生命体として再設計(prototypes/black-orchid.html)

- 2026-09-19 チャッピー: BLACK ORCHIDを200%改修。花ではなく異形生命体として中央器官・多世代フィラメント・自己相似分枝を再構成(prototypes/black-orchid.html)

- 2026-09-19 チャッピー: BLACK ORCHIDを新規制作。黒紫の花弁と自己相似の花芯が呼吸し、タッチが花の対称・カール・色系譜を恒久的に書き換える(prototypes/black-orchid.html)

- 2026-09-18 チャッピー: 参考動画の金属リボン彫刻を再構成したBRONZE KNOT / BRONZE FOLD / BRONZE HELIXを新規制作(prototypes/bronze-knot.html, prototypes/bronze-fold.html, prototypes/bronze-helix.html)
- 2026-09-18 チャッピー: BRONZE系3作を平たい金属リボン構造へ全面改修。円筒・節状の見た目を廃し、幅広の連続帯と面反射を主役にした(prototypes/bronze-knot.html, prototypes/bronze-fold.html, prototypes/bronze-helix.html)
---
---

## 現在の状態(変わったら書き換える)

- CURRENT: MIRROR FRACTURE(`art-v75-mirror-split.html`)
- LOG先頭: MIRROR PRESSURE(`art-v73-mirror-pressure.html`)
- 作業ルール: `AGENTS.md`(ギャラリー追加の手順と命名ルールは13章)
- 表示モード: iPhoneホーム画面から起動するとCURRENT作品を自動表示するstandalone Web App対応済み
- 運用メモ: `NOTES.md`(GitHub操作は可能性を確認してから実行)

---

## 履歴

- 2026-09-19 クロード: CULTIVARが「コンセプトがピンとこない」とのことで、黒い蘭の法則を3方向に作り分け。A=BLEED「黒は色を溜め込んだ状態。触れた花弁が色を噴き出し、色は空中に残って花は灰になる」、B=DESCENT「花の中心には同じ花がある。触ると一段内側へ落ち、潜るほど別の生き物に変質し外へは戻れない」、C=GAZE「見られていると気づくと咲く。指を置いてじっとしている間だけ開き、動かすと閉じる。開ききった花は押し花になって二度と咲かない」。花の幾何と描画は3作共通の prototypes/orchid-engine.js に切り出した(このjsは3作が依存しているので編集時は3作とも要確認)(prototypes/orchid-engine.js, prototypes/orchid-a-bleed.html, prototypes/orchid-b-descent.html, prototypes/orchid-c-gaze.html)
- 2026-09-19 クロード: おっちゃん提供の黒い蘭の写真から CULTIVAR を新規制作。法則は「触れた花弁が次の世代すべての祖先になる」人工選抜(6器官が同じ遺伝子のズレとして育ち、選んだ花弁の形質を花全体が受け継いで咲き直す/長押しで強制変異/世代は戻らず背後に系統の影が残る)。花弁の縁は同じ切れ込み規則を4〜5階層くり返す自己相似フリンジ。チャッピーの prototypes/black-orchid.html とは別法則なので、そちらは触らず別ファイルにした(prototypes/black-orchid-cultivar.html)
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