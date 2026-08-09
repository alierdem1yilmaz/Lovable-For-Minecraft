import JSZip from 'jszip';
import type { GeneratedStructure } from './gemini';
import { toNamespace, buildPackMcmeta, buildFunctionId } from './pack/common';

export async function buildDataPack(structure: GeneratedStructure): Promise<Buffer> {
  const namespace = toNamespace(structure.name);
  const packMcmeta = buildPackMcmeta(`Lovable for Minecraft ile üretildi: ${structure.name}`);

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
  return buildFunctionId(structure.name, 'build');
}
