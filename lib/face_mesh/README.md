# lib/face_mesh

MediaPipe Face Mesh (legacy JS solution) — `@mediapipe/face_mesh@0.4.1633559619`, Apache-2.0.
npmから取得したファイルをそのまま置いたもの(編集しない)。`prototypes/gaze-law.html` がインカメラの顔・虹彩検出に使う。

- SIMD版のwasmだけを置いている(SIMD非対応の古いブラウザでは検出が始まらず、作品はマウス/タッチ操作のまま動く)。
- 映像の処理はすべて端末内。外部へは送らない(外部CDNも使わない)。
