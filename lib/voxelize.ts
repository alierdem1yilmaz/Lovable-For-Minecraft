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

const materialColorCache = new WeakMap<Material, Promise<Vec3>>();

async function materialAverageColor(material: Material | null): Promise<Vec3> {
  if (!material) return [200, 200, 200];

  const cached = materialColorCache.get(material);
  if (cached) return cached;

  const promise = (async (): Promise<Vec3> => {
    const texture = material.getBaseColorTexture();
    const factor = material.getBaseColorFactor();

    if (texture) {
      const image = texture.getImage();
      if (image) {
        try {
          const jimpImage = await Jimp.read(Buffer.from(image));
          jimpImage.resize({ w: 1, h: 1 });
          const [r, g, b] = jimpImage.bitmap.data;
          return [r, g, b];
        } catch {
          // Doku okunamazsa base color factor'e düş.
        }
      }
    }

    return [Math.round(factor[0] * 255), Math.round(factor[1] * 255), Math.round(factor[2] * 255)];
  })();

  materialColorCache.set(material, promise);
  return promise;
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

      const color = await materialAverageColor(primitive.getMaterial());
      const getVertex = (i: number): Vec3 => [posArray[i * 3], posArray[i * 3 + 1], posArray[i * 3 + 2]];

      const indices = primitive.getIndices();
      const idxArray = indices?.getArray() ?? null;

      if (idxArray) {
        for (let i = 0; i + 2 < idxArray.length; i += 3) {
          triangles.push({
            a: getVertex(idxArray[i]),
            b: getVertex(idxArray[i + 1]),
            c: getVertex(idxArray[i + 2]),
            color,
          });
        }
      } else {
        const count = position.getCount();
        for (let i = 0; i + 2 < count; i += 3) {
          triangles.push({ a: getVertex(i), b: getVertex(i + 1), c: getVertex(i + 2), color });
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
