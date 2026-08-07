import { FormEvent, useState } from 'react';
import { Edit, Eye, EyeOff, Gift, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { assignmentQuery } from '../lib/api';
import { useBusinessResource } from '../lib/useBusinessResource';
import type { Program, Reward } from '../types/api';
import { RewardPreview } from '../components/MobilePreview';

export default function Rewards() {
  const { assignment, request } = useAuth();
  const rewardsResource = useBusinessResource<Reward[]>('/business/rewards', []);
  const programsResource = useBusinessResource<Program[]>('/business/programs', []);
  const [editing, setEditing] = useState<Reward | null>(null);
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', description: '', icon: '🎁', rewardType: 'product', programId: '', requiredUnits: 100, stock: '' });
  const selectedProgram = programsResource.data.find((program) => program.id === form.programId);

  function open(reward?: Reward) {
    const cost = reward?.costs[0];
    setEditing(reward ?? null);
    setForm({
      title: reward?.title ?? '',
      description: reward?.description ?? '',
      icon: reward?.icon ?? '🎁',
      rewardType: reward?.rewardType ?? 'product',
      programId: cost?.programId ?? programsResource.data[0]?.id ?? '',
      requiredUnits: cost?.requiredUnits ?? 100,
      stock: reward?.stockQuantity == null ? '' : String(reward.stockQuantity),
    });
    setShow(true);
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!assignment || !form.programId) return;
    setError(null);
    try {
      await request(`/business/rewards${editing ? `/${editing.id}` : ''}`, {
        method: editing ? 'PATCH' : 'POST',
        body: JSON.stringify({
          assignmentId: assignment.id,
          title: form.title,
          description: form.description,
          icon: form.icon,
          rewardType: form.rewardType,
          status: editing?.status ?? 'active',
          stockQuantity: form.stock === '' ? undefined : Number(form.stock),
          costs: [{ programId: form.programId, requiredUnits: form.requiredUnits }],
        }),
      });
      setShow(false);
      await rewardsResource.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No se pudo guardar.');
    }
  }

  async function status(reward: Reward) {
    if (!assignment) return;
    await request(`/business/rewards/${reward.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ assignmentId: assignment.id, status: reward.status === 'active' ? 'paused' : 'active' }),
    });
    await rewardsResource.refresh();
  }

  async function archive(reward: Reward) {
    if (!assignment || !confirm(`¿Archivar ${reward.title}?`)) return;
    await request(`/business/rewards/${reward.id}?${assignmentQuery(assignment.id)}`, { method: 'DELETE' });
    await rewardsResource.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-3xl">Recompensas</h1><p className="mt-2 text-gray-600">Define costos independientes en puntos o sellos.</p></div>
        <button disabled={!programsResource.data.length} onClick={() => open()} className="flex gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg disabled:opacity-50"><Plus className="w-5 h-5" />Nueva recompensa</button>
      </div>
      {(error || rewardsResource.error) && <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">{error || rewardsResource.error}</div>}
      {!programsResource.loading && !programsResource.data.length && <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">Crea primero un programa de puntos o sellos.</div>}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rewardsResource.data.map((reward) => (
          <article key={reward.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between"><div className="text-4xl">{reward.icon || '🎁'}</div><span className="text-xs bg-gray-100 px-2 py-1 rounded h-fit">{reward.status}</span></div>
            <h2 className="text-lg mt-4">{reward.title}</h2><p className="text-sm text-gray-600 mt-1 min-h-10">{reward.description}</p>
            <div className="mt-4 space-y-1 text-sm">
              {reward.costs.map((cost) => <p key={cost.programId}>{cost.requiredUnits} {cost.unitType === 'points' ? 'puntos' : 'sellos'} · {cost.programName}</p>)}
              <p className="text-gray-500">{reward.redemptions} canjes · stock {reward.stockQuantity ?? 'ilimitado'}</p>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => void status(reward)} className="p-2 border rounded">{reward.status === 'active' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
              <button onClick={() => open(reward)} className="p-2 border rounded"><Edit className="w-4 h-4" /></button>
              <button onClick={() => void archive(reward)} className="p-2 border rounded text-red-600"><Trash2 className="w-4 h-4" /></button>
            </div>
          </article>
        ))}
      </div>
      {show && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4">
          <form onSubmit={save} className="mx-auto my-4 w-full max-w-5xl rounded-xl bg-white p-6">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_370px]">
              <div className="space-y-4">
                <h2 className="text-xl flex gap-2"><Gift />{editing ? 'Editar recompensa' : 'Nueva recompensa'}</h2>
                <div className="grid grid-cols-[80px_1fr] gap-3"><input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="border rounded-lg px-3 py-2 text-center" aria-label="Icono de la recompensa" /><input required placeholder="Nombre" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="border rounded-lg px-3 py-2" /></div>
                <textarea placeholder="Descripción" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border rounded-lg px-3 py-2" />
                <select value={form.rewardType} onChange={(e) => setForm({ ...form, rewardType: e.target.value })} className="w-full border rounded-lg px-3 py-2"><option value="product">Producto</option><option value="discount">Descuento</option><option value="service">Servicio</option><option value="gift">Regalo</option></select>
                <select required value={form.programId} onChange={(e) => setForm({ ...form, programId: e.target.value })} className="w-full border rounded-lg px-3 py-2">{programsResource.data.map((program) => <option key={program.id} value={program.id}>{program.name} ({program.programType === 'points' ? 'puntos' : 'sellos'})</option>)}</select>
                <div className="grid grid-cols-2 gap-3"><label className="text-sm">Costo<input type="number" min={1} value={form.requiredUnits} onChange={(e) => setForm({ ...form, requiredUnits: Number(e.target.value) })} className="mt-1 w-full border rounded-lg px-3 py-2" /></label><label className="text-sm">Stock (vacío = ilimitado)<input type="number" min={0} value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="mt-1 w-full border rounded-lg px-3 py-2" /></label></div>
              </div>
              <RewardPreview
                title={form.title}
                description={form.description}
                icon={form.icon}
                requiredUnits={form.requiredUnits}
                programName={selectedProgram?.name ?? ''}
                programType={selectedProgram?.programType ?? 'points'}
                color={selectedProgram?.cardColor ?? '#9333ea'}
              />
            </div>
            <div className="mt-6 flex justify-end gap-3 border-t pt-4"><button type="button" onClick={() => setShow(false)} className="px-4 py-2 border rounded-lg">Cancelar</button><button className="px-4 py-2 bg-purple-600 text-white rounded-lg">Guardar</button></div>
          </form>
        </div>
      )}
    </div>
  );
}
