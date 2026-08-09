import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateStructure, type GeneratedStructure } from '@/lib/gemini';
import { buildDataPack, structureFunctionId } from '@/lib/datapack';
import { generateConceptImage, reconstruct3DFromImage } from '@/lib/fal';
import { voxelizeGlb } from '@/lib/voxelize';
import { generateItem, type ItemCategory } from '@/lib/item-generation';
import { buildItemDataPack, itemFunctionId } from '@/lib/item-pack';

export const runtime = 'nodejs';
export const maxDuration = 120;

const DAILY_GENERATION_LIMIT = 20;

type ContentType = 'structure' | ItemCategory;
const VALID_CONTENT_TYPES: ContentType[] = ['structure', 'weapon', 'tool', 'item'];

interface GenerationOutcome {
  zipBuffer: Buffer;
  structureName: string;
  functionId: string;
  blockCount: number;
  contentType: ContentType;
  payload: object;
  pipeline: 'image3d' | 'text' | 'item';
  imageBuffer: Buffer | null;
  imageMimeType: string | null;
  glbUrl: string | null;
  splatUrl: string | null;
}

async function generateStructureOutcome(prompt: string): Promise<GenerationOutcome> {
  let structure: GeneratedStructure;
  let pipeline: 'image3d' | 'text' = 'image3d';
  let imageBuffer: Buffer | null = null;
  let imageMimeType: string | null = null;
  let glbUrl: string | null = null;
  let splatUrl: string | null = null;

  try {
    const image = await generateConceptImage(prompt);
    imageBuffer = image.buffer;
    imageMimeType = image.mimeType;

    const reconstruction = await reconstruct3DFromImage(image.url, `Minecraft-style voxel build: ${prompt}`);
    glbUrl = reconstruction.glbUrl;
    splatUrl = reconstruction.splatUrl;

    const glbResponse = await fetch(glbUrl);
    if (!glbResponse.ok) {
      throw new Error(`GLB indirilemedi: ${glbResponse.status}`);
    }
    const glbBuffer = Buffer.from(await glbResponse.arrayBuffer());

    structure = await voxelizeGlb(glbBuffer, prompt.slice(0, 40) || 'minecraft_yapisi');
  } catch (err) {
    console.error('image3d pipeline hatası, metin tabanlı üretime düşülüyor', err);
    pipeline = 'text';
    imageBuffer = null;
    imageMimeType = null;
    glbUrl = null;
    splatUrl = null;
    structure = await generateStructure(prompt);
  }

  const zipBuffer = await buildDataPack(structure);

  return {
    zipBuffer,
    structureName: structure.name,
    functionId: structureFunctionId(structure),
    blockCount: structure.blocks.length,
    contentType: 'structure',
    payload: {},
    pipeline,
    imageBuffer,
    imageMimeType,
    glbUrl,
    splatUrl,
  };
}

async function generateItemOutcome(prompt: string, category: ItemCategory): Promise<GenerationOutcome> {
  let imageBuffer: Buffer | null = null;
  let imageMimeType: string | null = null;

  try {
    const image = await generateConceptImage(prompt);
    imageBuffer = image.buffer;
    imageMimeType = image.mimeType;
  } catch (err) {
    console.error('concept image üretilemedi (item için opsiyonel), atlanıyor', err);
  }

  const item = await generateItem(prompt, category);
  const zipBuffer = await buildItemDataPack(item, category);

  return {
    zipBuffer,
    structureName: item.name,
    functionId: itemFunctionId(item),
    blockCount: 0,
    contentType: category,
    payload: item,
    pipeline: 'item',
    imageBuffer,
    imageMimeType,
    glbUrl: null,
    splatUrl: null,
  };
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Giriş yapmalısın' }, { status: 401 });
  }

  const body = await request.json();
  const prompt = body?.prompt;
  if (typeof prompt !== 'string' || prompt.trim().length < 3) {
    return NextResponse.json({ error: 'Geçerli bir açıklama gir' }, { status: 400 });
  }
  const trimmedPrompt = prompt.trim();

  const contentType: ContentType = VALID_CONTENT_TYPES.includes(body?.contentType) ? body.contentType : 'structure';

  const admin = createAdminClient();

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const { count, error: countError } = await admin
    .from('generations')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', startOfDay.toISOString());

  if (countError) {
    console.error('quota check error', countError);
  } else if ((count ?? 0) >= DAILY_GENERATION_LIMIT) {
    return NextResponse.json(
      { error: `Günlük üretim limitine ulaştın (${DAILY_GENERATION_LIMIT}). Yarın tekrar dene.` },
      { status: 429 },
    );
  }

  let outcome: GenerationOutcome;
  try {
    outcome = contentType === 'structure' ? await generateStructureOutcome(trimmedPrompt) : await generateItemOutcome(trimmedPrompt, contentType);
  } catch (err) {
    console.error('generation error', err);
    return NextResponse.json({ error: 'Üretilemedi, tekrar dener misin?' }, { status: 502 });
  }

  const generationId = crypto.randomUUID();
  const packPath = `${user.id}/${generationId}.zip`;

  const { error: uploadError } = await admin.storage
    .from('generations')
    .upload(packPath, outcome.zipBuffer, { contentType: 'application/zip' });

  if (uploadError) {
    console.error('storage upload error', uploadError);
    return NextResponse.json({ error: 'Dosya kaydedilemedi' }, { status: 500 });
  }

  let imagePath: string | null = null;
  if (outcome.imageBuffer && outcome.imageMimeType) {
    const candidatePath = `${user.id}/${generationId}.png`;
    const { error: imageUploadError } = await admin.storage
      .from('generations')
      .upload(candidatePath, outcome.imageBuffer, { contentType: outcome.imageMimeType });

    if (imageUploadError) {
      console.error('image upload error', imageUploadError);
    } else {
      imagePath = candidatePath;
    }
  }

  const { error: insertError } = await admin.from('generations').insert({
    id: generationId,
    user_id: user.id,
    prompt: trimmedPrompt,
    structure_name: outcome.structureName,
    function_id: outcome.functionId,
    block_count: outcome.blockCount,
    pack_path: packPath,
    image_path: imagePath,
    glb_url: outcome.glbUrl,
    splat_url: outcome.splatUrl,
    pipeline: outcome.pipeline,
    content_type: outcome.contentType,
    payload: outcome.payload,
  });

  if (insertError) {
    console.error('db insert error', insertError);
    return NextResponse.json({ error: 'Kayıt oluşturulamadı' }, { status: 500 });
  }

  return NextResponse.json({ id: generationId, name: outcome.structureName, blockCount: outcome.blockCount });
}
