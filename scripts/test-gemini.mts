import fs from 'node:fs';
import path from 'node:path';

const envPath = path.resolve(import.meta.dirname, '../.env.local');
for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
  const match = line.match(/^([A-Z_]+)=(.*)$/);
  if (match) process.env[match[1]] = match[2];
}

const { generateStructure, generateConceptImage } = await import('../lib/gemini.ts');

async function main() {
  console.log('--- Yapı üretimi test ediliyor ---');
  const structure = await generateStructure('küçük taş bir gözetleme kulesi, üstünde ahşap çatı');
  console.log('name:', structure.name);
  console.log('block count:', structure.blocks.length);
  console.log('sample blocks:', structure.blocks.slice(0, 5));
  const uniqueBlocks = new Set(structure.blocks.map((b) => b.block));
  console.log('unique block types:', [...uniqueBlocks]);

  console.log('\n--- Görsel üretimi test ediliyor ---');
  const image = await generateConceptImage('küçük taş bir gözetleme kulesi, üstünde ahşap çatı');
  console.log('mimeType:', image.mimeType);
  console.log('base64 length:', image.base64.length);
}

main().catch((err) => {
  console.error('HATA:', err);
  process.exit(1);
});
