// Packs the downloaded CC0 models (Poly Haven furniture, Quaternius people) into small .glb files for the 3D office.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, prune, weld, simplify, textureCompress, resample, quantize } from '@gltf-transform/functions';
import { MeshoptSimplifier } from 'meshoptimizer';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const DL = path.resolve('../dl'), OUT = path.resolve('../office/office3d');
fs.mkdirSync(OUT, { recursive: true });
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
await MeshoptSimplifier.ready;

// name: [texture size, simplify ratio (1 = keep)]
const PH = {
  metal_office_desk: [512, .3], SchoolChair_01: [256, .22], mid_century_lounge_chair: [512, .7], modern_arm_chair_01: [512, .6], sofa_02: [512, 1],
  coffee_table_round_01: [512, .7], modern_coffee_table_01: [512, .8], side_table_01: [256, 1],
  potted_plant_02: [512, .07], potted_plant_04: [256, .6], steel_frame_shelves_01: [512, .8], metal_stool_02: [256, .5], modern_ceiling_lamp_01: [256, .7],
  outdoor_table_chair_set_01: [512, .7], CoffeeCart_01: [256, .4], wall_clock: [256, 1],
};
for (const [n, [tex, ratio]] of Object.entries(PH)) {
  const doc = await io.read(path.join(DL, 'ph', n, n + '.gltf'));
  const steps = [dedup(), weld()];
  if (ratio < 1) steps.push(simplify({ simplifier: MeshoptSimplifier, ratio, error: .002 }));
  steps.push(textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [tex, tex], quality: 78 }), prune(), quantize());
  await doc.transform(...steps);
  await io.write(path.join(OUT, n + '.glb'), doc);
  console.log(n, Math.round(fs.statSync(path.join(OUT, n + '.glb')).size / 1024) + 'KB');
}

// People: keep the mesh + skeleton and just one short animation (Idle) for standing poses.
for (const f of fs.readdirSync(path.join(DL, 'umc')).filter((x) => x.endsWith('.gltf'))) {
  const doc = await io.read(path.join(DL, 'umc', f));
  doc.getRoot().listAnimations().forEach((a) => a.dispose());
  await doc.transform(dedup(), weld(), simplify({ simplifier: MeshoptSimplifier, ratio: .45, error: .004 }), prune(), quantize());
  const o = path.join(OUT, 'person_' + f.replace('.gltf', '.glb'));
  await io.write(o, doc);
  console.log(f, Math.round(fs.statSync(o).size / 1024) + 'KB');
}
