import JSZip from 'jszip';
import type { GeneratedStructure } from './gemini';
import { toNamespace } from './pack/common';
import { buildBedrockBehaviorOnlyManifest, bedrockRawtext } from './pack/bedrock-common';

export async function buildBedrockStructurePack(structure: GeneratedStructure): Promise<Buffer> {
  const namespace = toNamespace(structure.name);
  const manifest = buildBedrockBehaviorOnlyManifest(
    `Lovable for Minecraft: ${structure.name}`,
    `Lovable for Minecraft ile üretildi: ${structure.name}`,
  );

  const functionLines = [
    `say ${structure.name} yapısı inşa ediliyor...`,
    ...structure.blocks.map((b) => `setblock ~${b.x} ~${b.y} ~${b.z} ${b.block}`),
    `tellraw @s ${bedrockRawtext(`${structure.name} tamamlandı!`)}`,
  ];

  const zip = new JSZip();
  const root = zip.folder(`${namespace}_behavior`)!;
  root.file('manifest.json', manifest);
  root.file('functions/build.mcfunction', functionLines.join('\n'));

  return zip.generateAsync({ type: 'nodebuffer' });
}

export function bedrockStructureFunctionId(structure: GeneratedStructure): string {
  return `${toNamespace(structure.name)}:build`;
}
