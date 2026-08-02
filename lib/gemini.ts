import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const STRUCTURE_MAX_SIZE = 10;
export const STRUCTURE_MAX_BLOCKS = 400;

export interface StructureBlock {
  x: number;
  y: number;
  z: number;
  block: string;
}

export interface GeneratedStructure {
  name: string;
  blocks: StructureBlock[];
}

const structureSchema = {
  type: 'OBJECT',
  properties: {
    name: {
      type: 'STRING',
      description: 'Kısa, dosya adı olarak kullanılabilecek İngilizce bir isim (örn. "stone_watchtower")',
    },
    blocks: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          x: { type: 'INTEGER' },
          y: { type: 'INTEGER' },
          z: { type: 'INTEGER' },
          block: {
            type: 'STRING',
            description: 'Geçerli bir vanilla Minecraft Java Edition blok ID\'si, "minecraft:" öneki ile (örn. "minecraft:stone_bricks")',
          },
        },
        required: ['x', 'y', 'z', 'block'],
      },
    },
  },
  required: ['name', 'blocks'],
};

export async function generateStructure(prompt: string): Promise<GeneratedStructure> {
  const response = await ai.models.generateContent({
    model: 'gemini-flash-latest',
    contents: `Sen bir Minecraft Java Edition yapı tasarımcısısın. Kullanıcının tarif ettiği yapıyı
bloklardan oluşan bir 3D yerleşim olarak tasarla.

Kısıtlar:
- Yapı en fazla ${STRUCTURE_MAX_SIZE}x${STRUCTURE_MAX_SIZE}x${STRUCTURE_MAX_SIZE} blokluk bir alana sığmalı (x, y, z değerleri 0 ile ${STRUCTURE_MAX_SIZE - 1} arasında).
- En fazla ${STRUCTURE_MAX_BLOCKS} blok kullan.
- Sadece geçerli vanilla Minecraft Java Edition blok ID'leri kullan ("minecraft:" önekiyle).
- y=0, yapının tabanıdır (zemin seviyesi).

Kullanıcının tarifi: "${prompt}"`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: structureSchema,
    },
  });

  if (!response.text) {
    throw new Error('Gemini boş yanıt döndürdü');
  }

  const parsed = JSON.parse(response.text) as GeneratedStructure;

  parsed.blocks = parsed.blocks
    .filter(
      (b) =>
        Number.isInteger(b.x) &&
        Number.isInteger(b.y) &&
        Number.isInteger(b.z) &&
        b.x >= 0 &&
        b.x < STRUCTURE_MAX_SIZE &&
        b.y >= 0 &&
        b.y < STRUCTURE_MAX_SIZE &&
        b.z >= 0 &&
        b.z < STRUCTURE_MAX_SIZE &&
        typeof b.block === 'string' &&
        b.block.length > 0,
    )
    .map((b) => ({
      ...b,
      block: b.block.includes(':') ? b.block : `minecraft:${b.block}`,
    }))
    .slice(0, STRUCTURE_MAX_BLOCKS);

  if (parsed.blocks.length === 0) {
    throw new Error('Gemini geçerli blok üretmedi');
  }

  return parsed;
}

export interface GeneratedImage {
  base64: string;
  mimeType: string;
}

export async function generateConceptImage(prompt: string): Promise<GeneratedImage> {
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-image',
    contents: `Minecraft tarzı, blok görünümlü bir yapının kavram sanatı: ${prompt}`,
    config: { responseModalities: ['IMAGE'] },
  });

  const parts = response.candidates?.[0]?.content?.parts ?? [];
  const imagePart = parts.find((p) => p.inlineData?.data);

  if (!imagePart?.inlineData?.data) {
    throw new Error('Gemini görsel üretemedi');
  }

  return {
    base64: imagePart.inlineData.data,
    mimeType: imagePart.inlineData.mimeType ?? 'image/png',
  };
}
