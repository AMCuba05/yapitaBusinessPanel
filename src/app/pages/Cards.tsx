import { FormEvent, useState } from 'react';
import { Award, Edit, Eye, EyeOff, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { assignmentQuery } from '../lib/api';
import { useBusinessResource } from '../lib/useBusinessResource';
import type { Program } from '../types/api';
import { ProgramPreview } from '../components/MobilePreview';

interface ProgramForm {
  name: string;
  programType: 'points' | 'stamps';
  goal: number;
  awardUnits: number;
  minimumPurchaseBs: string;
  validUntil: string;
  terms: string;
  cardColor: string;
}

const blank: ProgramForm = {
  name: '',
  programType: 'points',
  goal: 10,
  awardUnits: 1,
  minimumPurchaseBs: '',
  validUntil: '',
  terms: '',
  cardColor: '#9333ea',
};

const cardColorOptions = [
  { value: '#9333ea', label: 'Morado Yapita' },
  { value: '#7c3aed', label: 'Violeta' },
  { value: '#4f46e5', label: 'Índigo' },
  { value: '#2563eb', label: 'Azul' },
  { value: '#1e3a8a', label: 'Azul marino' },
  { value: '#0891b2', label: 'Celeste' },
  { value: '#0f766e', label: 'Turquesa' },
  { value: '#059669', label: 'Verde' },
  { value: '#166534', label: 'Verde bosque' },
  { value: '#4d7c0f', label: 'Verde oliva' },
  { value: '#d97706', label: 'Ámbar' },
  { value: '#ea580c', label: 'Naranja' },
  { value: '#dc2626', label: 'Rojo' },
  { value: '#be123c', label: 'Coral' },
  { value: '#881337', label: 'Borgoña' },
  { value: '#db2777', label: 'Rosa' },
  { value: '#78350f', label: 'Café' },
  { value: '#334155', label: 'Gris azulado' },
  { value: '#6b7280', label: 'Gris neutro' },
] as const;

export default function Cards() {
  const { assignment, request } = useAuth();
  const { data: programs, loading, error, refresh } = useBusinessResource<Program[]>('/business/programs', []);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState<Program | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const hasPointsProgram = programs.some(
    (program) => program.programType === 'points',
  );
  const hasStampsProgram = programs.some(
    (program) => program.programType === 'stamps',
  );
  const reachedProgramLimit = hasPointsProgram && hasStampsProgram;

  function open(program?: Program) {
    setEditing(program ?? null);
    setForm(program ? {
      name: program.name,
      programType: program.programType,
      goal: program.programType === 'stamps' ? program.stampCycleSize ?? 10 : program.reward?.requiredUnits ?? 100,
      awardUnits: program.awardUnits ?? 1,
      minimumPurchaseBs:
        program.minimumPurchaseMinor === null
          ? ''
          : String(program.minimumPurchaseMinor / 100),
      validUntil: program.validUntil?.slice(0, 10) ?? '',
      terms: program.terms ?? '',
      cardColor: program.cardColor ?? '#9333ea',
    } : {
      ...blank,
      programType: hasPointsProgram ? 'stamps' : 'points',
    });
    setShowModal(true);
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!assignment) return;
    setSaving(true);
    setActionError(null);
    try {
      const body = {
        assignmentId: assignment.id,
        name: form.name,
        programType: form.programType,
        earningMethod: 'fixed_per_visit',
        awardUnits: form.awardUnits,
        minimumPurchaseMinor:
          form.minimumPurchaseBs === ''
            ? null
            : Math.round(Number(form.minimumPurchaseBs) * 100),
        validUntil: form.validUntil || null,
        stampCycleSize: form.programType === 'stamps' ? form.goal : undefined,
        terms: form.terms,
        cardColor: form.cardColor,
        status: editing?.status ?? 'active',
      };
      await request(`/business/programs${editing ? `/${editing.id}` : ''}`, {
        method: editing ? 'PATCH' : 'POST',
        body: JSON.stringify(body),
      });
      setShowModal(false);
      await refresh();
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : 'No se pudo guardar.');
    } finally {
      setSaving(false);
    }
  }

  async function toggle(program: Program) {
    if (!assignment) return;
    await request(`/business/programs/${program.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        assignmentId: assignment.id,
        status: program.status === 'active' ? 'paused' : 'active',
      }),
    });
    await refresh();
  }

  async function archive(program: Program) {
    if (!assignment || !confirm(`¿Archivar ${program.name}?`)) return;
    await request(`/business/programs/${program.id}?${assignmentQuery(assignment.id)}`, { method: 'DELETE' });
    await refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl">Tarjetas de fidelización</h1><p className="mt-2 text-gray-600">Programas reales de puntos y sellos.</p></div>
        <button
          disabled={reachedProgramLimit}
          title={reachedProgramLimit ? 'Ya existe una tarjeta de cada tipo' : undefined}
          onClick={() => open()}
          className="flex gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-5 h-5" />
          Nueva tarjeta
        </button>
      </div>
      <div className="bg-purple-50 border border-purple-200 text-purple-800 p-4 rounded-lg text-sm">
        Por el momento cada comercio puede tener una tarjeta de puntos y una
        tarjeta de sellos. Archiva una tarjeta para crear otra del mismo tipo.
      </div>
      {(error || actionError) && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">{error || actionError}</div>}
      {loading && <p className="text-gray-500">Cargando programas…</p>}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {programs.map((program) => (
          <article key={program.id} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="h-44 p-6 text-white flex flex-col justify-between" style={{ backgroundColor: program.cardColor ?? '#9333ea' }}>
              <div className="flex justify-between"><h2 className="text-lg">{program.name}</h2><span className="text-xs bg-white/20 px-2 py-1 rounded">{program.status}</span></div>
              <div className="bg-white/10 p-3 rounded-lg flex justify-between">
                <div><p className="text-xs">{program.programType === 'points' ? 'Programa de puntos' : `${program.stampCycleSize} sellos por ciclo`}</p><p>{program.reward?.icon ?? '🎁'} {program.reward?.title ?? 'Sin recompensa vinculada'}</p></div>
                <Award className="w-7 h-7" />
              </div>
            </div>
            <div className="p-5">
              <p className="text-sm text-gray-600 min-h-10">{program.terms || 'Sin descripción'}</p>
              <p className="text-sm mt-3">{program.members} miembros</p>
              <p className="text-sm text-gray-500 mt-1">
                {program.minimumPurchaseMinor === null
                  ? 'Sin compra mínima'
                  : `Compra mínima: Bs ${(program.minimumPurchaseMinor / 100).toFixed(2)}`}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {program.validUntil
                  ? `Vence: ${new Date(`${program.validUntil.slice(0, 10)}T12:00:00`).toLocaleDateString('es-BO')}`
                  : 'Sin vencimiento'}
              </p>
              <div className="flex gap-2 mt-4">
                <button onClick={() => void toggle(program)} className="p-2 border rounded">{program.status === 'active' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                <button onClick={() => open(program)} className="p-2 border rounded"><Edit className="w-4 h-4" /></button>
                <button onClick={() => void archive(program)} className="p-2 border rounded text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </article>
        ))}
      </div>
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4">
          <form onSubmit={save} className="mx-auto my-4 w-full max-w-5xl rounded-xl bg-white p-6">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_370px]">
              <div className="space-y-4">
                <h2 className="text-xl">{editing ? 'Editar programa' : 'Nuevo programa'}</h2>
                <input required placeholder="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border rounded-lg px-3 py-2" />
                <select value={form.programType} disabled={Boolean(editing)} onChange={(e) => setForm({ ...form, programType: e.target.value as 'points' | 'stamps' })} className="w-full border rounded-lg px-3 py-2">
                  <option value="points" disabled={!editing && hasPointsProgram}>Puntos</option>
                  <option value="stamps" disabled={!editing && hasStampsProgram}>Sellos</option>
                </select>
                {form.programType === 'stamps' && <label className="block text-sm">Sellos por ciclo<input type="number" min={1} value={form.goal} onChange={(e) => setForm({ ...form, goal: Number(e.target.value) })} className="mt-1 w-full border rounded-lg px-3 py-2" /></label>}
                <label className="block text-sm">Unidades por visita<input type="number" min={1} value={form.awardUnits} onChange={(e) => setForm({ ...form, awardUnits: Number(e.target.value) })} className="mt-1 w-full border rounded-lg px-3 py-2" /></label>
                <label className="block text-sm">
                  Compra mínima (Bs)
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.minimumPurchaseBs}
                    onChange={(e) => setForm({ ...form, minimumPurchaseBs: e.target.value })}
                    placeholder="Vacío = sin mínimo"
                    className="mt-1 w-full border rounded-lg px-3 py-2"
                  />
                  <span className="block mt-1 text-xs text-gray-500">
                    Se aplica antes de acreditar puntos o sellos.
                  </span>
                </label>
                <label className="block text-sm">
                  Fecha de vencimiento
                  <input
                    type="date"
                    value={form.validUntil}
                    onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
                    className="mt-1 w-full border rounded-lg px-3 py-2"
                  />
                  <span className="block mt-1 text-xs text-gray-500">
                    Vacío significa que el programa no tiene vencimiento.
                  </span>
                </label>
                <textarea placeholder="Descripción o términos" value={form.terms} onChange={(e) => setForm({ ...form, terms: e.target.value })} className="w-full border rounded-lg px-3 py-2" />
                <label className="block text-sm">
                  Color de la tarjeta
                  <div className="mt-1 flex items-center gap-3">
                    <span
                      className="h-9 w-9 shrink-0 rounded-lg border border-black/10 shadow-sm"
                      style={{ backgroundColor: form.cardColor }}
                      aria-hidden="true"
                    />
                    <select
                      value={form.cardColor}
                      onChange={(e) => setForm({ ...form, cardColor: e.target.value })}
                      className="w-full rounded-lg border px-3 py-2"
                    >
                      {!cardColorOptions.some((option) => option.value === form.cardColor) && (
                        <option value={form.cardColor}>Color anterior</option>
                      )}
                      {cardColorOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <span className="mt-1 block text-xs text-gray-500">
                    Elige uno de los colores disponibles para mantener buena legibilidad en la app.
                  </span>
                </label>
              </div>
              <ProgramPreview
                businessName={assignment?.business.displayName ?? ''}
                name={form.name}
                programType={form.programType}
                goal={form.goal}
                color={form.cardColor}
                minimumPurchaseBs={form.minimumPurchaseBs}
                validUntil={form.validUntil}
              />
            </div>
            <div className="mt-6 flex justify-end gap-3 border-t pt-4"><button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg">Cancelar</button><button disabled={saving} className="px-4 py-2 bg-purple-600 text-white rounded-lg">{saving ? 'Guardando…' : 'Guardar'}</button></div>
          </form>
        </div>
      )}
    </div>
  );
}
