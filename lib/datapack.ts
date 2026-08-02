import JSZip from 'jszip';
import type { GeneratedStructure } from './gemini';

function toNamespace(name: string): string {
  const cleaned = name
    .toLowerCase()
    .replace(/[^a-z0-9_.-]/g, '_')
    .replace(/^[^a-z0-9]+/, '');
  return cleaned.length > 0 ? cleaned : 'custom_structure';
}

export async function buildDataPack(structure: GeneratedStructure): Promise<Buffer> {
  const namespace = toNamespace(structure.name);

  const packMcmeta = JSON.stringify(
    {
      pack: {
        pack_format: 84,
        min_format: [80, 0],
        max_format: [92, 0],
        description: `Lovable for Minecraft ile üretildi: ${structure.name}`,
      },
    },
    null,
    2,
  );

  const functionLines = [
    `say ${structure.name} yapısı inşa ediliyor...`,
    ...structure.blocks.map((b) => `setblock ~${b.x} ~${b.y} ~${b.z} ${b.block}`),
    `tellraw @s {"text":"${structure.name} tamamlandı!","color":"green"}`,
  ];

  const zip = new JSZip();
  zip.file('pack.mcmeta', packMcmeta);
  zip.file(`data/${namespace}/function/build.mcfunction`, functionLines.join('\n'));

  return zip.generateAsync({ type: 'nodebuffer' });
}

export function structureFunctionId(structure: GeneratedStructure): string {
  return `${toNamespace(structure.name)}:build`;
}
