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

export type ConceptImageSubject = 'structure' | 'weapon' | 'tool' | 'item';

const SUBJECT_NOUNS: Record<Exclude<ConceptImageSubject, 'structure'>, string> = {
  weapon: 'sword weapon',
  tool: 'pickaxe tool',
  item: 'magical trinket item',
};

// Kullanıcının tarifi doğrudan nesne adının yanına, kısıtlardan ÖNCE yerleştiriliyor —
// aksi halde (tarif prompt'un en sonuna eklenince) model "alev saçan" gibi tarif detaylarını
// büyük ölçüde görmezden gelip düz bir obje üretiyordu.
function productPhotoPrompt(noun: string, description: string): string {
  return `Product photography of a single Minecraft ${noun} toy — ${description} — on a seamless white studio background, floating with a soft drop shadow only. Render any effect the description mentions (flames, glow, particles, magical aura, sparks, etc.) directly on the item itself, as part of its design. Nothing else in the frame besides the item, no extra props, no separate objects, no ground surface visible, just white seamless backdrop.`;
}

export async function generateConceptImage(
  prompt: string,
  subject: ConceptImageSubject = 'structure',
): Promise<GeneratedConceptImage> {
  const finalPrompt =
    subject === 'structure'
      ? `Minecraft tarzı, blok görünümlü, düz renkli, basit gölgelendirmeli bir yapının kavram sanatı: ${prompt}`
      : productPhotoPrompt(SUBJECT_NOUNS[subject], prompt);

  const result = await fal.subscribe('fal-ai/flux/schnell', {
    input: {
      prompt: finalPrompt,
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

export async function reconstruct3DFromImage(imageUrl: string, segmentationLabel: string = 'building'): Promise<Reconstruction3D> {
  const result = await fal.subscribe('fal-ai/sam-3/3d-objects', {
    input: {
      image_url: imageUrl,
      // sam-3'ün auto-segmentation adımı burada kısa bir nesne etiketi bekliyor
      // (ör. "building"), tam cümle vermek "Auto-segmentation produced no masks" hatası veriyor.
      prompt: segmentationLabel,
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
