import { NodeIO, type Material } from '@gltf-transform/core';
import { Jimp } from 'jimp';
import { STRUCTURE_MAX_SIZE, STRUCTURE_MAX_BLOCKS, type GeneratedStructure, type StructureBlock } from './gemini';
import { nearestBlock } from './block-palette';

const GRID_SIZE = STRUCTURE_MAX_SIZE;
const SAMPLE_STEP = 0.35;

type Vec3 = [number, number, number];

interface Triangle {
  a: Vec3;
  b: Vec3;
  c: Vec3;
  color: Vec3;
}

type JimpImage = Awaited<ReturnType<typeof Jimp.read>>;

const textureCache = new WeakMap<Material, Promise<JimpImage | null>>();

// fal.ai'nin döndürdüğü bazı GLB'lerde PNG doku baytlarının sonunda IEND chunk'ından
// sonra birkaç fazladan bayt kalıyor, bu da pngjs'in "unrecognised content at end of
// stream" hatasıyla decode'u reddetmesine yol açıyor. IEND'den sonrasını kırpıyoruz.
function trimPngTrailingBytes(buf: Buffer): Buffer {
  const idx = buf.lastIndexOf(Buffer.from('IEND'));
  if (idx === -1) return buf;
  const end = idx + 4 + 4; // 'IEND' (4 bayt) + CRC (4 bayt)
  return end < buf.length ? buf.subarray(0, end) : buf;
}

async function decodedTexture(material: Material | null): Promise<JimpImage | null> {
  if (!material) return null;

  const cached = textureCache.get(material);
  if (cached) return cached;

  const promise = (async (): Promise<JimpImage | null> => {
    const texture = material.getBaseColorTexture();
    if (!texture) return null;
    const image = texture.getImage();
    if (!image) return null;
    try {
      return await Jimp.read(trimPngTrailingBytes(Buffer.from(image)));
    } catch {
      return null;
    }
  })();

  textureCache.set(material, promise);
  return promise;
}

function materialFactorColor(material: Material | null): Vec3 {
  if (!material) return [200, 200, 200];
  const factor = material.getBaseColorFactor();
  return [Math.round(factor[0] * 255), Math.round(factor[1] * 255), Math.round(factor[2] * 255)];
}

// glTF texture doldurulması tekrarlı (repeat wrap) olduğu için UV'yi [0,1) aralığına sarıyoruz.
function sampleTexture(image: JimpImage, u: number, v: number): Vec3 {
  const width = image.bitmap.width;
  const height = image.bitmap.height;
  const wrappedU = ((u % 1) + 1) % 1;
  const wrappedV = ((v % 1) + 1) % 1;
  const px = Math.min(width - 1, Math.floor(wrappedU * width));
  const py = Math.min(height - 1, Math.floor(wrappedV * height));
  const idx = (py * width + px) * 4;
  const data = image.bitmap.data;
  return [data[idx], data[idx + 1], data[idx + 2]];
}

export async function voxelizeGlb(glbBuffer: Buffer, name: string): Promise<GeneratedStructure> {
  const io = new NodeIO();
  const document = await io.readBinary(new Uint8Array(glbBuffer));
  const root = document.getRoot();

  const triangles: Triangle[] = [];

  for (const mesh of root.listMeshes()) {
    for (const primitive of mesh.listPrimitives()) {
      const position = primitive.getAttribute('POSITION');
      if (!position) continue;

      const posArray = position.getArray();
      if (!posArray) continue;

      const material = primitive.getMaterial();
      const texture = await decodedTexture(material);
      const fallbackColor = materialFactorColor(material);
      const getVertex = (i: number): Vec3 => [posArray[i * 3], posArray[i * 3 + 1], posArray[i * 3 + 2]];

      const uv = primitive.getAttribute('TEXCOORD_0');
      const uvArray = texture ? (uv?.getArray() ?? null) : null;
      const getUV = (i: number): [number, number] => (uvArray ? [uvArray[i * 2], uvArray[i * 2 + 1]] : [0.5, 0.5]);
      const triangleColor = (ia: number, ib: number, ic: number): Vec3 => {
        if (!texture || !uvArray) return fallbackColor;
        const [ua, va] = getUV(ia);
        const [ub, vb] = getUV(ib);
        const [uc, vc] = getUV(ic);
        return sampleTexture(texture, (ua + ub + uc) / 3, (va + vb + vc) / 3);
      };

      const indices = primitive.getIndices();
      const idxArray = indices?.getArray() ?? null;

      if (idxArray) {
        for (let i = 0; i + 2 < idxArray.length; i += 3) {
          const ia = idxArray[i];
          const ib = idxArray[i + 1];
          const ic = idxArray[i + 2];
          triangles.push({ a: getVertex(ia), b: getVertex(ib), c: getVertex(ic), color: triangleColor(ia, ib, ic) });
        }
      } else {
        const count = position.getCount();
        for (let i = 0; i + 2 < count; i += 3) {
          triangles.push({
            a: getVertex(i),
            b: getVertex(i + 1),
            c: getVertex(i + 2),
            color: triangleColor(i, i + 1, i + 2),
          });
        }
      }
    }
  }

  if (triangles.length === 0) {
    throw new Error('GLB içinde geometri bulunamadı');
  }

  const min: Vec3 = [Infinity, Infinity, Infinity];
  const max: Vec3 = [-Infinity, -Infinity, -Infinity];
  for (const t of triangles) {
    for (const v of [t.a, t.b, t.c]) {
      for (let k = 0; k < 3; k++) {
        if (v[k] < min[k]) min[k] = v[k];
        if (v[k] > max[k]) max[k] = v[k];
      }
    }
  }

  const size: Vec3 = [max[0] - min[0], max[1] - min[1], max[2] - min[2]];
  const maxDim = Math.max(size[0], size[1], size[2], 1e-6);
  const scale = (GRID_SIZE - 1) / maxDim;
  const centerX = (min[0] + max[0]) / 2;
  const centerZ = (min[2] + max[2]) / 2;

  const toGrid = (v: Vec3): Vec3 => [
    (v[0] - centerX) * scale + (GRID_SIZE - 1) / 2,
    (v[1] - min[1]) * scale,
    (v[2] - centerZ) * scale + (GRID_SIZE - 1) / 2,
  ];

  const occupied = new Map<string, Vec3>();

  for (const t of triangles) {
    const a = toGrid(t.a);
    const b = toGrid(t.b);
    const c = toGrid(t.c);

    for (let u = 0; u <= 1; u += SAMPLE_STEP) {
      for (let v = 0; v <= 1 - u; v += SAMPLE_STEP) {
        const w = 1 - u - v;
        const px = a[0] * w + b[0] * u + c[0] * v;
        const py = a[1] * w + b[1] * u + c[1] * v;
        const pz = a[2] * w + b[2] * u + c[2] * v;
        const gx = Math.floor(px);
        const gy = Math.floor(py);
        const gz = Math.floor(pz);
        if (gx < 0 || gx >= GRID_SIZE || gy < 0 || gy >= GRID_SIZE || gz < 0 || gz >= GRID_SIZE) continue;
        occupied.set(`${gx},${gy},${gz}`, t.color);
      }
    }
  }

  const blocks: StructureBlock[] = Array.from(occupied.entries())
    .slice(0, STRUCTURE_MAX_BLOCKS)
    .map(([key, color]) => {
      const [x, y, z] = key.split(',').map(Number);
      return { x, y, z, block: nearestBlock(color) };
    });

  if (blocks.length === 0) {
    throw new Error('Voxelization sonucu blok üretilemedi');
  }

  return { name, blocks };
}
