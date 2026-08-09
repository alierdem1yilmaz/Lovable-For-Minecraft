import fs from 'node:fs';
import path from 'node:path';

const envPath = path.resolve(import.meta.dirname, '../.env.local');
for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
  const match = line.match(/^([A-Z_]+)=(.*)$/);
  if (match) process.env[match[1]] = match[2];
}

const { generateConceptImage, reconstruct3DFromImage } = await import('../lib/fal.ts');
const { voxelizeGlb } = await import('../lib/voxelize.ts');

const PROMPT = 'küçük taş bir gözetleme kulesi, üstünde ahşap bir çatı';

async function main() {
  console.log('--- 1. Kavram görseli (fal-ai/flux/schnell) ---');
  const image = await generateConceptImage(PROMPT, 'structure');
  console.log('OK, bytes:', image.buffer.length);

  console.log('\n--- 2. 3D rekonstrüksiyon (fal-ai/sam-3/3d-objects) ---');
  const reconstruction = await reconstruct3DFromImage(image.url);
  console.log('OK, glbUrl:', reconstruction.glbUrl);

  console.log('\n--- 3. GLB indiriliyor + voxelization ---');
  const glbResponse = await fetch(reconstruction.glbUrl);
  if (!glbResponse.ok) throw new Error(`GLB indirilemedi: ${glbResponse.status}`);
  const glbBuffer = Buffer.from(await glbResponse.arrayBuffer());
  const structure = await voxelizeGlb(glbBuffer, 'stone_watchtower');

  console.log('block count:', structure.blocks.length);
  const uniqueBlocks = new Set(structure.blocks.map((b) => b.block));
  console.log('unique block types:', [...uniqueBlocks]);
  if (uniqueBlocks.size <= 1) {
    throw new Error('Voxelization tek renge düştü — doku decode/UV örneklemesi muhtemelen bozuldu.');
  }

  console.log('\n=== TÜM PIPELINE (görsel + 3D + voxelization) BAŞARILI ===');
}

main().catch((err) => {
  console.error('\n=== HATA ===');
  console.error(err);
  process.exit(1);
});
