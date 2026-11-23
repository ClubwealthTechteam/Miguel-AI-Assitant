import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, prune, weld, simplify, textureCompress, quantize } from '@gltf-transform/functions';
import { MeshoptSimplifier } from 'meshoptimizer';
import sharp from 'sharp'; import fs from 'fs';
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS); await MeshoptSimplifier.ready;
for (const [n, r, e, tex] of [['potted_plant_02', .08, .06, 512], ['potted_plant_04', .25, .05, 256], ['SchoolChair_01', .25, .02, 256]]) {
  const doc = await io.read(`../dl/ph/${n}/${n}.gltf`);
  await doc.transform(dedup(), weld({ tolerance: .001 }), simplify({ simplifier: MeshoptSimplifier, ratio: r, error: e }), textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [tex, tex], quality: 78 }), prune(), quantize());
  await io.write(`../office/office3d/${n}.glb`, doc); console.log(n, fs.statSync(`../office/office3d/${n}.glb`).size);
}
