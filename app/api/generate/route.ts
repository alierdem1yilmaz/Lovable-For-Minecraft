import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateStructure } from '@/lib/gemini';
import { buildDataPack, structureFunctionId } from '@/lib/datapack';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Giriş yapmalısın' }, { status: 401 });
  }

  const { prompt } = await request.json();
  if (typeof prompt !== 'string' || prompt.trim().length < 3) {
    return NextResponse.json({ error: 'Geçerli bir açıklama gir' }, { status: 400 });
  }

  let structure;
  try {
    structure = await generateStructure(prompt.trim());
  } catch (err) {
    console.error('generateStructure error', err);
    return NextResponse.json({ error: 'Yapı üretilemedi, tekrar dener misin?' }, { status: 502 });
  }

  const zipBuffer = await buildDataPack(structure);

  const admin = createAdminClient();
  const generationId = crypto.randomUUID();
  const packPath = `${user.id}/${generationId}.zip`;

  const { error: uploadError } = await admin.storage
    .from('generations')
    .upload(packPath, zipBuffer, { contentType: 'application/zip' });

  if (uploadError) {
    console.error('storage upload error', uploadError);
    return NextResponse.json({ error: 'Dosya kaydedilemedi' }, { status: 500 });
  }

  const { error: insertError } = await admin.from('generations').insert({
    id: generationId,
    user_id: user.id,
    prompt: prompt.trim(),
    structure_name: structure.name,
    function_id: structureFunctionId(structure),
    block_count: structure.blocks.length,
    pack_path: packPath,
    image_path: null,
  });

  if (insertError) {
    console.error('db insert error', insertError);
    return NextResponse.json({ error: 'Kayıt oluşturulamadı' }, { status: 500 });
  }

  return NextResponse.json({ id: generationId, name: structure.name, blockCount: structure.blocks.length });
}
