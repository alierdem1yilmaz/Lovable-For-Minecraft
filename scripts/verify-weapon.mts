import fs from 'node:fs';
import path from 'node:path';
import JSZip from 'jszip';

const envPath = path.resolve(import.meta.dirname, '../.env.local');
for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
  const match = line.match(/^([A-Z_]+)=(.*)$/);
  if (match) process.env[match[1]] = match[2];
}

const { generateItem } = await import('../lib/item-generation.ts');
const { buildItemDataPack, itemFunctionId } = await import('../lib/item-pack.ts');
const { generateConceptImage } = await import('../lib/fal.ts');
const { buildBedrockItemPack } = await import('../lib/bedrock-item-pack.ts');

const PROMPT = 'ejderha ateşinde dövülmüş, alev saçan bir kılıç';
const BEHAVIOR = 'vurduğu hedef birkaç saniye alevlensin ve geriye savrulsun';

async function printZip(label: string, buf: Buffer) {
  console.log(`\n=== ${label} (${buf.length} bytes) ===`);
  const zip = await JSZip.loadAsync(buf);
  for (const name of Object.keys(zip.files).sort()) {
    const entry = zip.files[name];
    if (entry.dir) {
      console.log(`[dir]  ${name}`);
      continue;
    }
    const content = await entry.async('nodebuffer');
    console.log(`[file] ${name} (${content.length} bytes)`);
    if (name.endsWith('.json')) {
      try {
        JSON.parse(content.toString('utf-8'));
        console.log('       -> valid JSON');
        console.log(
          content
            .toString('utf-8')
            .split('\n')
            .map((l) => `       ${l}`)
            .join('\n'),
        );
      } catch (e) {
        console.log('       -> INVALID JSON:', (e as Error).message);
      }
    }
    if (name.endsWith('.mcfunction')) {
      console.log('       ---');
      console.log(
        content
          .toString('utf-8')
          .split('\n')
          .map((l) => `       ${l}`)
          .join('\n'),
      );
      console.log('       ---');
    }
    if (name.endsWith('.png')) {
      const isPng = content.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
      console.log('       -> valid PNG signature:', isPng);
    }
  }
}

async function main() {
  console.log('--- Gemini ile silah üretiliyor ---');
  const item = await generateItem(PROMPT, 'weapon', BEHAVIOR);
  console.log(JSON.stringify(item, null, 2));

  console.log('\n--- Java data pack ---');
  const javaZip = await buildItemDataPack(item, 'weapon');
  await printZip('Java data pack', javaZip);
  console.log('functionId:', itemFunctionId(item));

  console.log('\n--- fal.ai kavram görseli üretiliyor ---');
  const image = await generateConceptImage(PROMPT, 'weapon');
  console.log('mimeType:', image.mimeType, 'bytes:', image.buffer.length);
  fs.writeFileSync(path.resolve(import.meta.dirname, 'verify-weapon-icon.png'), image.buffer);

  console.log('\n--- Bedrock add-on ---');
  const bedrockZip = await buildBedrockItemPack(item, 'weapon', image.buffer);
  await printZip('Bedrock add-on', bedrockZip);
}

main().catch((err) => {
  console.error('HATA:', err);
  process.exit(1);
});
