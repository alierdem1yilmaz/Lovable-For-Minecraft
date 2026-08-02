import JSZip from 'jszip';
import { buildDataPack, structureFunctionId } from '../lib/datapack.ts';
import type { GeneratedStructure } from '../lib/gemini.ts';

const structure: GeneratedStructure = {
  name: 'Stone Watchtower!',
  blocks: [
    { x: 0, y: 0, z: 0, block: 'minecraft:stone_bricks' },
    { x: 1, y: 0, z: 0, block: 'minecraft:stone_bricks' },
    { x: 0, y: 1, z: 0, block: 'minecraft:cobblestone' },
    { x: 0, y: 2, z: 0, block: 'minecraft:oak_planks' },
  ],
};

const buffer = await buildDataPack(structure);
console.log('zip byte length:', buffer.length);
console.log('function id:', structureFunctionId(structure));

const zip = await JSZip.loadAsync(buffer);
console.log('\n--- files in zip ---');
Object.keys(zip.files).forEach((f) => console.log(f));

console.log('\n--- pack.mcmeta ---');
console.log(await zip.file('pack.mcmeta')!.async('string'));

console.log('\n--- build.mcfunction ---');
const funcPath = Object.keys(zip.files).find((f) => f.endsWith('.mcfunction'))!;
console.log(await zip.file(funcPath)!.async('string'));
