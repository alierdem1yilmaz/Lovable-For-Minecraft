import { fal } from '@fal-ai/client';

fal.config({ credentials: process.env.FAL_KEY });

export interface Reconstruction3D {
  glbUrl: string;
  splatUrl: string;
}

export interface GeneratedConceptImage {
  url: string;
  buffer: Buffer;
  mimeType: string;
}

interface Sam3ObjectsOutput {
  gaussian_splat?: { url: string };
  model_glb?: { url: string };
}

interface FluxSchnellOutput {
  images?: { url: string; content_type?: string }[];
}

export async function generateConceptImage(prompt: string): Promise<GeneratedConceptImage> {
  const result = await fal.subscribe('fal-ai/flux/schnell', {
    input: {
      prompt: `Minecraft tarzı, blok görünümlü, düz renkli, basit gölgelendirmeli bir yapının kavram sanatı: ${prompt}`,
      image_size: 'square_hd',
      num_images: 1,
      output_format: 'png',
    },
    logs: false,
  });

  const data = result.data as FluxSchnellOutput;
  const image = data.images?.[0];

  if (!image?.url) {
    throw new Error('fal.ai görsel üretemedi');
  }

  const response = await fetch(image.url);
  if (!response.ok) {
    throw new Error(`Üretilen görsel indirilemedi: ${response.status}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const mimeType = image.content_type ?? response.headers.get('content-type') ?? 'image/png';

  return { url: image.url, buffer, mimeType };
}

export async function reconstruct3DFromImage(imageUrl: string, promptHint: string): Promise<Reconstruction3D> {
  const result = await fal.subscribe('fal-ai/sam-3/3d-objects', {
    input: {
      image_url: imageUrl,
      prompt: promptHint,
      export_textured_glb: true,
    },
    logs: false,
  });

  const data = result.data as Sam3ObjectsOutput;

  if (!data.model_glb?.url || !data.gaussian_splat?.url) {
    throw new Error('fal.ai 3D rekonstrüksiyon çıktısı eksik');
  }

  return {
    glbUrl: data.model_glb.url,
    splatUrl: data.gaussian_splat.url,
  };
}
