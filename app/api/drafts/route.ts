import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

const VALID_CONTENT_TYPES = ['structure', 'weapon', 'tool', 'item'];
const VALID_PLATFORMS = ['java', 'bedrock'];

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Giriş yapmalısın' }, { status: 401 });
  }

  const body = await request.json();
  const prompt = typeof body?.prompt === 'string' ? body.prompt.trim() : '';
  if (prompt.length === 0) {
    return NextResponse.json({ error: 'Kaydedilecek bir şey yok' }, { status: 400 });
  }

  const contentType = VALID_CONTENT_TYPES.includes(body?.contentType) ? body.contentType : 'structure';
  const platform = VALID_PLATFORMS.includes(body?.platform) ? body.platform : 'java';
  const behavior = typeof body?.behavior === 'string' && body.behavior.trim().length > 0 ? body.behavior.trim() : null;
  const existingId = typeof body?.id === 'string' ? body.id : null;

  const admin = createAdminClient();

  if (existingId) {
    const { data, error } = await admin
      .from('drafts')
      .update({ content_type: contentType, prompt, behavior, platform })
      .eq('id', existingId)
      .eq('user_id', user.id)
      .select('id')
      .single();

    if (error) {
      console.error('draft update error', error);
      return NextResponse.json({ error: 'Taslak güncellenemedi' }, { status: 500 });
    }

    return NextResponse.json({ id: data.id });
  }

  const { data, error } = await admin
    .from('drafts')
    .insert({
      user_id: user.id,
      content_type: contentType,
      prompt,
      behavior,
      platform,
    })
    .select('id')
    .single();

  if (error) {
    console.error('draft insert error', error);
    return NextResponse.json({ error: 'Taslak kaydedilemedi' }, { status: 500 });
  }

  return NextResponse.json({ id: data.id });
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Giriş yapmalısın' }, { status: 401 });
  }

  const id = request.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'id gerekli' }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin.from('drafts').delete().eq('id', id).eq('user_id', user.id);

  if (error) {
    console.error('draft delete error', error);
    return NextResponse.json({ error: 'Taslak silinemedi' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
