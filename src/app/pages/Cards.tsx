import { FormEvent, useState } from 'react';
import { Award, Edit, Eye, EyeOff, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAuth } from '../auth/AuthProvider';
import { ProgramPreview } from '../components/MobilePreview';
import { assignmentQuery } from '../lib/api';
import { colorOptions } from '../lib/colorOptions';
import {
  buildProgramMutation,
  createEmptyProgramForm,
  programToForm,
  validateProgramForm,
  type ProgramFormErrors,
  type ProgramFormValues,
} from '../lib/programForm';
import { useBusinessResource } from '../lib/useBusinessResource';
import type { EarningMethod, Program, ProgramStatus, ProgramType } from '../types/api';

const earningMethodLabels: Record<EarningMethod, string> = {
  spend_conversion: 'Conversión por consumo',
  fixed_per_visit: 'Unidades fijas por visita',
  manual: 'Carga manual',
};

const statusLabels: Record<ProgramStatus, string> = {
  draft: 'Borrador',
  active: 'Activo',
  paused: 'Pausado',
  ended: 'Finalizado',
};

function FieldError({ message }: { message?: string }) {
  return message ? <span className="mt-1 block text-xs text-red-600">{message}</span> : null;
}

function formatMoney(minor: number) {
  return (minor / 100).toFixed(2);
}

function earningSummary(program: Program) {
  if (program.earningMethod === 'spend_conversion') {
    return `${program.awardUnits ?? 0} ${program.programType === 'points' ? 'punto(s)' : 'sello(s)'} por cada Bs ${formatMoney(program.spendAmountMinor ?? 0)}`;
  }
  if (program.earningMethod === 'fixed_per_visit') {
    return `${program.awardUnits ?? 0} ${program.programType === 'points' ? 'punto(s)' : 'sello(s)'} por visita`;
  }
  return 'Acreditación manual';
}

interface BusinessBrand {
  logoUrl: string | null;
}

export default function Cards() {
  const { assignment, request } = useAuth();
  const navigate = useNavigate();
  const { data: programs, loading, error, refresh } = useBusinessResource<Program[]>('/business/programs', []);
  const { data: businessBrand } = useBusinessResource<BusinessBrand>('/business/profile', { logoUrl: null });
  const [form, setForm] = useState<ProgramFormValues>(() => createEmptyProgramForm());
  const [formErrors, setFormErrors] = useState<ProgramFormErrors>({});
  const [editing, setEditing] = useState<Program | null>(null);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [createdStampProgram, setCreatedStampProgram] = useState<Program | null>(null);

  function update<K extends keyof ProgramFormValues>(key: K, value: ProgramFormValues[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setFormErrors((current) => ({ ...current, [key]: undefined }));
  }

  const availableProgramTypes = (['points', 'stamps'] as const).filter(
    (type) => !programs.some((program) => program.programType === type),
  );

  function startCreate(programType: ProgramType) {
    setEditing(null);
    setForm(createEmptyProgramForm(programType));
    setFormErrors({});
    setActionError(null);
    setShowTypeModal(false);
    setShowModal(true);
  }

  function openEdit(program: Program) {
    setEditing(program);
    setForm(programToForm(program));
    setFormErrors({});
    setActionError(null);
    setShowModal(true);
  }

  function close() {
    if (saving) return;
    setShowModal(false);
    setFormErrors({});
    setActionError(null);
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!assignment || saving) return;

    const errors = validateProgramForm(form);
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      setActionError('Revisa los campos marcados antes de guardar.');
      return;
    }

    setSaving(true);
    setActionError(null);
    try {
      const savedProgram = await request<Program>(`/business/programs${editing ? `/${editing.id}` : ''}`, {
        method: editing ? 'PATCH' : 'POST',
        body: JSON.stringify(buildProgramMutation(assignment.id, form)),
      });
      setShowModal(false);
      await refresh();
      if (!editing && form.programType === 'stamps' && savedProgram?.id) {
        setCreatedStampProgram(savedProgram);
      }
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : 'No se pudo guardar el programa.');
    } finally {
      setSaving(false);
    }
  }

  async function toggle(program: Program) {
    if (!assignment) return;
    setActionError(null);
    try {
      await request(`/business/programs/${program.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ assignmentId: assignment.id, status: program.status === 'active' ? 'paused' : 'active' }),
      });
      await refresh();
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : 'No se pudo cambiar el estado.');
    }
  }

  async function archive(program: Program) {
    if (!assignment || !confirm(`¿Archivar ${program.name}?`)) return;
    setActionError(null);
    try {
      await request(`/business/programs/${program.id}?${assignmentQuery(assignment.id)}`, { method: 'DELETE' });
      await refresh();
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : 'No se pudo archivar el programa.');
    }
  }

  const showsSpendAmount =
    form.programType === 'points' &&
    (form.earningMethod === 'spend_conversion' || form.earningMethod === 'manual');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div><h1 className="text-3xl">Tarjetas de fidelización</h1><p className="mt-2 text-gray-600">Programas reales de puntos y sellos.</p></div>
        <button
          disabled={loading || availableProgramTypes.length === 0}
          title={availableProgramTypes.length === 0 ? 'Ya existe una tarjeta de puntos y una de sellos' : undefined}
          onClick={() => setShowTypeModal(true)}
          className="flex shrink-0 gap-2 rounded-lg bg-purple-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="w-5 h-5" />Nueva tarjeta
        </button>
      </div>
      {(error || (!showModal && actionError)) && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error || actionError}</div>}
      {loading && <p className="text-gray-500">Cargando programas…</p>}
      {!loading && !programs.length && <div className="rounded-lg border border-gray-200 bg-white p-6 text-gray-600">Aún no hay programas de fidelidad.</div>}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {programs.map((program) => (
          <article key={program.id} className="overflow-hidden rounded-lg bg-white shadow">
            <div className="flex h-44 flex-col justify-between p-6 text-white" style={{ backgroundColor: program.cardColor ?? '#9333ea' }}>
              <div className="flex justify-between gap-3"><h2 className="text-lg">{program.name}</h2><span className="h-fit rounded bg-white/20 px-2 py-1 text-xs">{statusLabels[program.status]}</span></div>
              <div className="flex justify-between rounded-lg bg-white/10 p-3">
                <div><p className="text-xs">{program.programType === 'points' ? 'Programa de puntos' : `${program.stampCycleSize ?? 0} sellos por ciclo`}</p><p>{program.reward?.icon ?? '🎁'} {program.reward?.title ?? 'Sin recompensa vinculada'}</p></div>
                {businessBrand.logoUrl ? <img src={businessBrand.logoUrl} alt="" className="h-9 w-9 rounded-lg bg-white object-cover" /> : <Award className="w-7 h-7" />}
              </div>
            </div>
            <div className="p-5">
              <p className="min-h-10 text-sm text-gray-600">{program.terms || 'Sin términos'}</p>
              <dl className="mt-4 space-y-2 text-sm">
                <div><dt className="text-gray-500">Método</dt><dd>{earningMethodLabels[program.earningMethod]}</dd></div>
                <div><dt className="text-gray-500">Acreditación</dt><dd>{earningSummary(program)}</dd></div>
                <div><dt className="text-gray-500">Compra mínima</dt><dd>{program.minimumPurchaseMinor == null ? 'Sin mínimo' : `Bs ${formatMoney(program.minimumPurchaseMinor)}`}</dd></div>
                <div><dt className="text-gray-500">Vigencia</dt><dd>{program.validFrom ? `Desde ${program.validFrom.slice(0, 10)}` : 'Sin fecha de inicio'} · {program.validUntil ? `hasta ${program.validUntil.slice(0, 10)}` : 'sin fecha de fin'}</dd></div>
                <div><dt className="text-gray-500">Miembros</dt><dd>{program.members}</dd></div>
              </dl>
              <div className="mt-4 flex gap-2">
                {program.status !== 'ended' && <button aria-label={program.status === 'active' ? 'Pausar programa' : 'Activar programa'} onClick={() => void toggle(program)} className="rounded border p-2">{program.status === 'active' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>}
                <button aria-label="Editar programa" onClick={() => openEdit(program)} className="rounded border p-2"><Edit className="w-4 h-4" /></button>
                <button aria-label="Archivar programa" onClick={() => void archive(program)} className="rounded border p-2 text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {showTypeModal && (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/50 p-4">
          <div role="dialog" aria-modal="true" aria-labelledby="program-type-title" className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <h2 id="program-type-title" className="text-xl">Elige el tipo de tarjeta</h2>
            <p className="mt-2 text-sm text-gray-600">Solo puedes tener una tarjeta de puntos y una tarjeta de sellos.</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {availableProgramTypes.includes('points') && (
                <button type="button" onClick={() => startCreate('points')} className="rounded-xl border border-gray-200 p-5 text-left transition hover:border-purple-500 hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <span className="text-2xl" aria-hidden="true">⭐</span>
                  <span className="mt-3 block font-semibold">Tarjeta de puntos</span>
                  <span className="mt-1 block text-sm text-gray-600">Acumula puntos por consumo, visita o carga manual.</span>
                </button>
              )}
              {availableProgramTypes.includes('stamps') && (
                <button type="button" onClick={() => startCreate('stamps')} className="rounded-xl border border-gray-200 p-5 text-left transition hover:border-purple-500 hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <span className="text-2xl" aria-hidden="true">🎟️</span>
                  <span className="mt-3 block font-semibold">Tarjeta de sellos</span>
                  <span className="mt-1 block text-sm text-gray-600">Completa un ciclo de sellos para obtener recompensas.</span>
                </button>
              )}
            </div>
            <div className="mt-6 flex justify-end border-t pt-4">
              <button type="button" onClick={() => setShowTypeModal(false)} className="rounded-lg border px-4 py-2">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4">
          <form onSubmit={save} noValidate className="mx-auto my-4 w-full max-w-5xl rounded-xl bg-white p-6">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_370px]">
              <div className="space-y-4">
                <h2 className="text-xl">{editing ? `Editar tarjeta de ${form.programType === 'stamps' ? 'sellos' : 'puntos'}` : `Nueva tarjeta de ${form.programType === 'stamps' ? 'sellos' : 'puntos'}`}</h2>
                {actionError && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{actionError}</div>}

                <label className="block text-sm">
                  Nombre <span className="text-red-600">*</span>
                  <input maxLength={160} value={form.name} onChange={(event) => update('name', event.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2" aria-invalid={Boolean(formErrors.name)} />
                  <FieldError message={formErrors.name} />
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm">
                    Tipo de programa <span className="text-red-600">*</span>
                    <select disabled value={form.programType} className="mt-1 w-full cursor-not-allowed rounded-lg border bg-gray-100 px-3 py-2 text-gray-600"><option value="points">Puntos</option><option value="stamps">Sellos</option></select>
                  </label>
                  <label className="block text-sm">
                    Estado <span className="text-red-600">*</span>
                    <select value={form.status} onChange={(event) => update('status', event.target.value as ProgramStatus)} className="mt-1 w-full rounded-lg border px-3 py-2"><option value="draft">Borrador</option><option value="active">Activo</option><option value="paused">Pausado</option><option value="ended">Finalizado</option></select>
                    {form.status === 'draft' && <button type="button" onClick={() => update('status', 'active')} className="mt-2 text-xs font-medium text-purple-700 hover:underline">Publicar y activar al guardar</button>}
                  </label>
                </div>

                {form.programType === 'points' ? (
                  <>
                    <label className="block text-sm">
                      Método de acreditación <span className="text-red-600">*</span>
                      <select value={form.earningMethod} onChange={(event) => update('earningMethod', event.target.value as EarningMethod)} className="mt-1 w-full rounded-lg border px-3 py-2"><option value="spend_conversion">Conversión por consumo</option><option value="fixed_per_visit">Unidades fijas por visita</option><option value="manual">Carga manual</option></select>
                    </label>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {showsSpendAmount && (
                        <label className="block text-sm">
                          Importe de compra (Bs) {form.earningMethod === 'spend_conversion' && <span className="text-red-600">*</span>}
                          <input inputMode="decimal" placeholder="10,00" value={form.spendAmountBs} onChange={(event) => update('spendAmountBs', event.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2" aria-invalid={Boolean(formErrors.spendAmountBs)} />
                          <FieldError message={formErrors.spendAmountBs} />
                        </label>
                      )}
                      <label className="block text-sm">
                        Unidades otorgadas {form.earningMethod !== 'manual' && <span className="text-red-600">*</span>}
                        <input type="number" min="1" step="1" value={form.awardUnits} onChange={(event) => update('awardUnits', event.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2" aria-invalid={Boolean(formErrors.awardUnits)} />
                        <FieldError message={formErrors.awardUnits} />
                      </label>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 text-sm text-purple-900">
                      <p className="font-medium">Acumulación por visita</p>
                      <p className="mt-1 text-purple-700">Los sellos se otorgan exclusivamente por cada visita.</p>
                    </div>
                    <label className="block text-sm">
                      Sellos otorgados por visita <span className="text-red-600">*</span>
                      <input type="number" min="1" step="1" value={form.awardUnits} onChange={(event) => update('awardUnits', event.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2" aria-invalid={Boolean(formErrors.awardUnits)} />
                      <FieldError message={formErrors.awardUnits} />
                    </label>
                  </div>
                )}

                {form.programType === 'stamps' && (
                  <label className="block text-sm">
                    Sellos por ciclo <span className="text-red-600">*</span>
                    <input type="number" min="1" step="1" value={form.stampCycleSize} onChange={(event) => update('stampCycleSize', event.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2" aria-invalid={Boolean(formErrors.stampCycleSize)} />
                    <FieldError message={formErrors.stampCycleSize} />
                  </label>
                )}

                <label className="block text-sm">
                  Compra mínima (Bs)
                  <input inputMode="decimal" placeholder="25,50 (opcional)" value={form.minimumPurchaseBs} onChange={(event) => update('minimumPurchaseBs', event.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2" aria-invalid={Boolean(formErrors.minimumPurchaseBs)} />
                  <FieldError message={formErrors.minimumPurchaseBs} />
                </label>

                <label className="flex items-center gap-3 rounded-lg border p-3 text-sm">
                  <input
                    type="checkbox"
                    checked={form.hasExpiration}
                    onChange={(event) => update('hasExpiration', event.target.checked)}
                    className="h-4 w-4 accent-purple-600"
                  />
                  Esta tarjeta tiene fecha de expiración
                </label>

                {form.hasExpiration && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block text-sm">Fecha de inicio<input type="date" value={form.validFrom} onChange={(event) => update('validFrom', event.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2" /></label>
                    <label className="block text-sm">Fecha de expiración<input type="date" value={form.validUntil} onChange={(event) => update('validUntil', event.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2" aria-invalid={Boolean(formErrors.validUntil)} /><FieldError message={formErrors.validUntil} /></label>
                  </div>
                )}

                <label className="block text-sm">
                  Términos
                  <textarea maxLength={2000} rows={4} value={form.terms} onChange={(event) => update('terms', event.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2" aria-invalid={Boolean(formErrors.terms)} />
                  <span className="mt-1 flex justify-between text-xs text-gray-500"><span>Opcional</span><span>{form.terms.length}/2000</span></span>
                  <FieldError message={formErrors.terms} />
                </label>

                <label className="block text-sm">
                  Color de la tarjeta
                  <div className="mt-1 flex items-center gap-3">
                    <span className="h-9 w-9 shrink-0 rounded-lg border border-black/10 shadow-sm" style={{ backgroundColor: form.cardColor }} aria-hidden="true" />
                    <select value={form.cardColor} onChange={(event) => update('cardColor', event.target.value)} className="w-full rounded-lg border px-3 py-2">
                      {!colorOptions.some((option) => option.value === form.cardColor) && <option value={form.cardColor}>Color anterior</option>}
                      {colorOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                  </div>
                  <FieldError message={formErrors.cardColor} />
                </label>
              </div>

              <ProgramPreview
                businessName={assignment?.business.displayName ?? ''}
                businessLogoUrl={businessBrand.logoUrl ?? undefined}
                name={form.name}
                programType={form.programType}
                goal={Number(form.stampCycleSize) || 1}
                color={form.cardColor}
                minimumPurchaseBs={form.minimumPurchaseBs}
                validUntil={form.hasExpiration ? form.validUntil : ''}
                earningMethod={form.earningMethod}
                spendAmountBs={form.spendAmountBs}
                awardUnits={form.awardUnits}
              />
            </div>
            <div className="mt-6 flex justify-end gap-3 border-t pt-4"><button type="button" disabled={saving} onClick={close} className="rounded-lg border px-4 py-2 disabled:opacity-50">Cancelar</button><button disabled={saving} className="rounded-lg bg-purple-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50">{saving ? 'Guardando…' : 'Guardar'}</button></div>
          </form>
        </div>
      )}

      {createdStampProgram && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <div role="dialog" aria-modal="true" aria-labelledby="reward-next-step-title" className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-green-100 text-2xl" aria-hidden="true">✓</div>
            <h2 id="reward-next-step-title" className="mt-4 text-xl">Tarjeta de sellos creada</h2>
            <p className="mt-2 text-sm text-gray-600">La tarjeta “{createdStampProgram.name}” no crea una recompensa automáticamente. Puedes configurar ahora el beneficio que recibirá el cliente al completar el ciclo.</p>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setCreatedStampProgram(null)} className="rounded-lg border px-4 py-2">Ahora no</button>
              <button
                type="button"
                onClick={() => navigate(`/rewards?programId=${encodeURIComponent(createdStampProgram.id)}&requiredUnits=${createdStampProgram.stampCycleSize ?? 1}`)}
                className="rounded-lg bg-purple-600 px-4 py-2 text-white"
              >
                Configurar recompensa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
