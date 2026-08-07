import { FormEvent, useState } from 'react';
import { Edit, Eye, EyeOff, Megaphone, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { assignmentQuery } from '../lib/api';
import { useBusinessResource } from '../lib/useBusinessResource';
import type { Program, Promotion } from '../types/api';

export default function Promotions() {
  const { assignment, request } = useAuth();
  const resource = useBusinessResource<Promotion[]>('/business/promotions', []);
  const programs = useBusinessResource<Program[]>('/business/programs', []);
  const [editing, setEditing] = useState<Promotion | null>(null);
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', description: '', kind: 'bonus_units', programId: '', mode: 'fixed', amount: 2, color: '#9333ea', validFrom: '', validUntil: '' });

  function open(promotion?: Promotion) {
    setEditing(promotion ?? null);
    setForm({
      title: promotion?.title ?? '',
      description: promotion?.description ?? '',
      kind: promotion?.promotionType ?? 'bonus_units',
      programId: promotion?.bonus?.programId ?? programs.data[0]?.id ?? '',
      mode: promotion?.bonus?.mode ?? 'fixed',
      amount: promotion?.bonus?.mode === 'multiplier' ? promotion.bonus.multiplier ?? 2 : promotion?.bonus?.units ?? promotion?.discountPercent ?? 2,
      color: promotion?.displayColor ?? '#9333ea',
      validFrom: promotion?.validFrom?.slice(0, 16) ?? '',
      validUntil: promotion?.validUntil?.slice(0, 16) ?? '',
    });
    setShow(true);
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!assignment) return;
    const isBonus = form.kind === 'bonus_units';
    setError(null);
    try {
      await request(`/business/promotions${editing ? `/${editing.id}` : ''}`, {
        method: editing ? 'PATCH' : 'POST',
        body: JSON.stringify({
          assignmentId: assignment.id,
          title: form.title,
          description: form.description,
          promotionType: form.kind,
          channel: 'loyalty',
          status: editing?.status ?? 'active',
          displayColor: form.color,
          validFrom: form.validFrom || undefined,
          validUntil: form.validUntil || undefined,
          discountPercent: form.kind === 'discount_percent' ? form.amount : undefined,
          bonus: isBonus ? {
            programId: form.programId,
            mode: form.mode,
            units: form.mode === 'fixed' ? form.amount : undefined,
            multiplier: form.mode === 'multiplier' ? form.amount : undefined,
          } : undefined,
        }),
      });
      setShow(false);
      await resource.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No se pudo guardar.');
    }
  }

  async function toggle(promotion: Promotion) {
    if (!assignment) return;
    await request(`/business/promotions/${promotion.id}`, { method: 'PATCH', body: JSON.stringify({ assignmentId: assignment.id, status: promotion.status === 'active' ? 'paused' : 'active' }) });
    await resource.refresh();
  }

  async function archive(promotion: Promotion) {
    if (!assignment || !confirm(`¿Archivar ${promotion.title}?`)) return;
    await request(`/business/promotions/${promotion.id}?${assignmentQuery(assignment.id)}`, { method: 'DELETE' });
    await resource.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-3xl">Promociones</h1><p className="mt-2 text-gray-600">Bonos configurables para programas de puntos o sellos.</p></div>
        <button onClick={() => open()} className="flex gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg"><Plus className="w-5 h-5" />Nueva promoción</button>
      </div>
      {(error || resource.error) && <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">{error || resource.error}</div>}
      <div className="space-y-4">
        {resource.data.map((promotion) => (
          <article key={promotion.id} className="bg-white rounded-lg shadow p-6 flex gap-5">
            <div className="w-14 h-14 rounded-lg grid place-items-center text-white shrink-0" style={{ backgroundColor: promotion.displayColor ?? '#9333ea' }}><Megaphone /></div>
            <div className="flex-1">
              <div className="flex justify-between"><div><h2 className="text-lg">{promotion.title}</h2><p className="text-sm text-gray-600">{promotion.description}</p></div><span className="text-xs bg-gray-100 px-2 py-1 rounded h-fit">{promotion.status}</span></div>
              <div className="mt-3 text-sm">
                {promotion.bonus ? <strong>{promotion.bonus.mode === 'fixed' ? `+${promotion.bonus.units}` : `x${promotion.bonus.multiplier}`} {promotion.bonus.unitType === 'points' ? 'puntos' : 'sellos'} · {promotion.bonus.programName}</strong> : promotion.discountPercent != null ? <strong>{promotion.discountPercent}% de descuento</strong> : <span>{promotion.promotionType}</span>}
                <p className="text-gray-500 mt-1">{promotion.redemptions} aplicaciones</p>
              </div>
              <div className="flex gap-2 mt-4"><button onClick={() => void toggle(promotion)} className="p-2 border rounded">{promotion.status === 'active' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button><button onClick={() => open(promotion)} className="p-2 border rounded"><Edit className="w-4 h-4" /></button><button onClick={() => void archive(promotion)} className="p-2 border rounded text-red-600"><Trash2 className="w-4 h-4" /></button></div>
            </div>
          </article>
        ))}
      </div>
      {show && (
        <div className="fixed inset-0 z-50 bg-black/50 grid place-items-center p-4">
          <form onSubmit={save} className="bg-white rounded-xl p-6 w-full max-w-lg space-y-4">
            <h2 className="text-xl">{editing ? 'Editar promoción' : 'Nueva promoción'}</h2>
            <input required placeholder="Título" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full border rounded-lg px-3 py-2" />
            <textarea placeholder="Descripción" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border rounded-lg px-3 py-2" />
            <select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })} className="w-full border rounded-lg px-3 py-2"><option value="bonus_units">Bono de puntos o sellos</option><option value="discount_percent">Descuento porcentual</option><option value="buy_x_get_y">Compra X, recibe Y</option><option value="free_item">Producto gratis</option></select>
            {form.kind === 'bonus_units' && <>
              <select required value={form.programId} onChange={(e) => setForm({ ...form, programId: e.target.value })} className="w-full border rounded-lg px-3 py-2"><option value="">Selecciona programa</option>{programs.data.map((program) => <option key={program.id} value={program.id}>{program.name} · {program.programType === 'points' ? 'puntos' : 'sellos'}</option>)}</select>
              <select value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })} className="w-full border rounded-lg px-3 py-2"><option value="fixed">Cantidad adicional fija</option><option value="multiplier">Multiplicador</option></select>
            </>}
            {(form.kind === 'bonus_units' || form.kind === 'discount_percent') && <label className="block text-sm">{form.mode === 'multiplier' && form.kind === 'bonus_units' ? 'Multiplicador' : 'Cantidad'}<input type="number" min={form.mode === 'multiplier' ? 0.01 : 1} step={form.mode === 'multiplier' ? 0.01 : 1} value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} className="mt-1 w-full border rounded-lg px-3 py-2" /></label>}
            <div className="grid grid-cols-2 gap-3"><label className="text-sm">Inicio<input type="datetime-local" value={form.validFrom} onChange={(e) => setForm({ ...form, validFrom: e.target.value })} className="mt-1 w-full border rounded-lg px-3 py-2" /></label><label className="text-sm">Fin<input type="datetime-local" value={form.validUntil} onChange={(e) => setForm({ ...form, validUntil: e.target.value })} className="mt-1 w-full border rounded-lg px-3 py-2" /></label></div>
            <div className="flex justify-end gap-3"><button type="button" onClick={() => setShow(false)} className="px-4 py-2 border rounded-lg">Cancelar</button><button className="px-4 py-2 bg-purple-600 text-white rounded-lg">Guardar</button></div>
          </form>
        </div>
      )}
    </div>
  );
}
