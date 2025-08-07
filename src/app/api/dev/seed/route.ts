import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST() {
  const world_id = `fake-world-${Date.now()}`;

  const { data: user, error: uErr } = await supabaseAdmin
    .from('users_world')
    .insert({ world_id })
    .select()
    .single();
  if (uErr) return NextResponse.json({ error: uErr.message }, { status: 500 });

  const { error: pErr } = await supabaseAdmin
    .from('pets')
    .insert({ owner_id: user.id, name: 'Tamagotcha' });
  if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 });

  return NextResponse.json({ ok: true, world_id });
}
