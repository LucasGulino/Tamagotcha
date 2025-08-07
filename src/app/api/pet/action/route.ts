import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const EFFECTS = {
  FEED: { hunger:+20, energy:+0,  mood:+5,  xp:+5,  cooldown:60 },
  PLAY: { hunger:-5,  energy:-10, mood:+20, xp:+10, cooldown:90 },
  HEAL: { hunger:+0,  energy:+10, mood:+10, xp:+8,  cooldown:120 },
} as const;

const clamp = (n:number) => Math.max(0, Math.min(100, n));

export async function POST(req: Request) {
  const { action } = await req.json();
  const e = (EFFECTS as any)[action];
  if (!e) return NextResponse.json({ error: 'bad action' }, { status: 400 });

  // dev: operate on the most recently created pet
  const { data: pet, error } = await supabaseAdmin
    .from('pets').select('*')
    .order('created_at', { ascending: false }).limit(1).maybeSingle();

  if (!pet) return NextResponse.json({ error: 'no pet' }, { status: 404 });

  const now = Date.now();
  const last = pet.last_action_at ? new Date(pet.last_action_at).getTime() : 0;
  if (now - last < e.cooldown * 1000) {
    return NextResponse.json({ error: 'cooldown' }, { status: 429 });
  }

  const updated = {
    hunger: clamp(pet.hunger + e.hunger),
    energy: clamp(pet.energy + e.energy),
    mood:   clamp(pet.mood   + e.mood),
    xp:     pet.xp + e.xp,
    last_action_at: new Date().toISOString()
  };

  const { error: upErr } = await supabaseAdmin
    .from('pets').update(updated).eq('id', pet.id);
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

  await supabaseAdmin.from('pet_actions').insert({
    pet_id: pet.id, action,
    delta_hunger: e.hunger, delta_energy: e.energy, delta_mood: e.mood, delta_xp: e.xp
  });

  return NextResponse.json({ ok: true, pet: { ...pet, ...updated } });
}
