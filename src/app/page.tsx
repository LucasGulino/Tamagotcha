'use client';
import { useState } from 'react';

export default function Home() {
  const [pet, setPet] = useState<any>(null);
  const [msg, setMsg] = useState<string>('');

  const seed = async () => {
    const r = await fetch('/api/dev/seed', { method: 'POST' });
    const j = await r.json();
    setMsg(JSON.stringify(j));
  };

  const load = async () => {
    const r = await fetch('/api/pet/get');
    const j = await r.json();
    if (j.pet) setPet(j.pet); else setMsg(j.error || 'no pet');
  };

  const act = async (action: 'FEED'|'PLAY'|'HEAL') => {
    const r = await fetch('/api/pet/action', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ action })
    });
    const j = await r.json();
    if (j.pet) setPet(j.pet); else setMsg(j.error || 'error');
  };

  return (
    <main className="p-6 max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Tamagotcha (dev)</h1>

      <div className="flex gap-2">
        <button className="px-3 py-2 bg-black text-white rounded" onClick={seed}>
          Créer user + pet (dev)
        </button>
        <button className="px-3 py-2 border rounded" onClick={load}>
          Charger pet
        </button>
      </div>

      {pet && (
        <div className="space-y-2 border rounded p-4">
          <div>Hunger: {pet.hunger}</div>
          <div>Energy: {pet.energy}</div>
          <div>Mood: {pet.mood}</div>
          <div>XP: {pet.xp}</div>

          <div className="flex gap-2 mt-2">
            <button className="px-3 py-2" onClick={()=>act('FEED')}>Feed</button>
            <button className="px-3 py-2" onClick={()=>act('PLAY')}>Play</button>
            <button className="px-3 py-2" onClick={()=>act('HEAL')}>Heal</button>
          </div>
        </div>
      )}

      {msg && <pre className="text-sm text-gray-600">{msg}</pre>}
    </main>
  );
}
