# Fish Kit

写真から作った魚の 3D モデルと、泳ぐ・暴れる・跳ねるなどの動き（three.js 用）です。CC0 1.0 で、改変・再配布・商用利用が自由です。
使い方は、この README をあなたの AI エージェントに読ませて「このプロジェクトに魚を泳がせて」と頼んでください。

Photo-based 3D fish models with swimming and fighting motion for three.js. CC0 1.0 (public domain).

three.js is a separate library (MIT License, © three.js authors) and is not covered by CC0. It is embedded only in `example.html`; `fish-kit.js` imports your own copy. See `LICENSE.txt`.

| | |
|---|---|
| `example.html` | Double-click to view every fish and motion. |
| `fish/` | Models: `<name>.glb` (~5,000 triangles), `<name>_lo.glb` (~700, for distance), and head photos `<name>_head.webp` / `_cover.webp` used when the mouth and gill covers open. |
| `fish-kit.js` | Loads the models and drives the motion (ES module, three.js r187). |
| `making/` | How to make a new fish the same way. |

## Use

Serve your page over http (browsers block module imports from `file://`).

```html
<script type="importmap">
  { "imports": {
      "three": "https://cdn.jsdelivr.net/npm/three@0.187.0/build/three.module.js",
      "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.187.0/examples/jsm/" } }
</script>
<script type="module">
  import * as THREE from 'three';
  import { loadFish, createFish } from './fish-kit.js';

  // ...renderer, scene, camera and lights...
  await loadFish('./fish/', ['madai']);   // omit the list to load every fish
  const fish = createFish('madai');       // typical size; createFish('madai', 40) for 40 cm
  scene.add(fish.object);
  fish.setMotion('swim');

  const clock = new THREE.Clock();
  renderer.setAnimationLoop(() => {
    fish.update(clock.getDelta());
    renderer.render(scene, camera);
  });
</script>
```

The fish faces +Z with its back up, centred on the body, in metres. `fish.object.rotation.y = -Math.PI / 2` makes it face left.

## API

- `loadFish(folder, ids?)`: loads the models.
- `createFish(id, lengthCm?)`: returns a fish. Each call makes a new one.
- `fish.object`: the three.js object to add to the scene.
- `fish.update(dt)`: call every frame.
- `fish.setMotion(id)`: changes the motion smoothly.
- `fish.drive = { speed, turnRate }`: makes the body swim at that speed (m/s) and turn rate (rad/s). Moving `fish.object` forward by `fish.currentSpeed` is up to you.
- `fish.getMouth()`: returns the mouth position, for attaching a line.
- `fish.dispose()`: removes the fish.
- `FISH`: the list of fish (id, Japanese / English name, size).
- `MOTIONS`: the list of motions.

Fish ids: `aji` `seabass` `mebaru` `kasago` `saba` `tachiuo` `sawara` `kamasu` `buri` `hiramasa` `kihada` `magochi` `kurodai` `madai` `katakuchi` `isaki` `isaki_young` `onagagure` `kuchibuto` `shibudai`

Motions: `swim` (cruise), `power` (full speed), `turn`, `hover`, `range` (opens mouth, gills and fins), `bite` (head shakes), `hooked` (fighting), `tired` (on its side), `air` (out of the water), `landed` (flopping on the floor).

## Other engines

There are no animation clips. All motion is computed in the shader inside `fish-kit.js`, which you can port. Used without the kit, the glb files are ordinary textured meshes: use alpha clip and double-sided.
