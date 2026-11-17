import { Award, CalendarDays, Sparkles, Star, Tag } from 'lucide-react';
import type { EarningMethod, ProgramType } from '../types/api';

interface PreviewShellProps {
  children: React.ReactNode;
  eyebrow: string;
}

function PreviewShell({ children, eyebrow }: PreviewShellProps) {
  return (
    <aside className="rounded-2xl bg-gray-50 border border-gray-200 p-4 lg:sticky lg:top-4">
      <div className="mb-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-purple-600">
          Vista previa
        </p>
        <p className="mt-1 text-xs text-gray-500">{eyebrow}</p>
      </div>
      <div className="mx-auto w-full max-w-[330px] rounded-[32px] border-[7px] border-gray-900 bg-[#0d0f14] p-4 shadow-xl">
        <div className="mx-auto mb-5 h-1.5 w-16 rounded-full bg-gray-700" />
        {children}
      </div>
    </aside>
  );
}

function programLabel(type: ProgramType) {
  return type === 'points' ? 'Puntos' : 'Sellos';
}

export interface ProgramPreviewProps {
  businessName: string;
  businessLogoUrl?: string;
  name: string;
  programType: ProgramType;
  goal: number;
  color: string;
  minimumPurchaseBs: string;
  validUntil: string;
  earningMethod: EarningMethod;
  spendAmountBs: string;
  awardUnits: string;
}

export function ProgramPreview({
  businessName,
  businessLogoUrl,
  name,
  programType,
  goal,
  color,
  minimumPurchaseBs,
  validUntil,
  earningMethod,
  spendAmountBs,
  awardUnits,
}: ProgramPreviewProps) {
  const Icon = programType === 'points' ? Star : Tag;
  const expiration = validUntil
    ? new Date(`${validUntil}T12:00:00`).toLocaleDateString('es-BO')
    : null;
  const earningText = earningMethod === 'spend_conversion'
    ? `${awardUnits || '0'} por cada Bs ${spendAmountBs || '0'}`
    : earningMethod === 'fixed_per_visit'
      ? `${awardUnits || '0'} por visita`
      : 'Acreditación manual';

  return (
    <PreviewShell eyebrow="Así verá el cliente su tarjeta en Yapita">
      <div className="mb-3 flex items-center gap-2 text-white">
        <Icon size={17} style={{ color }} />
        <span className="text-sm font-semibold">{programLabel(programType)}</span>
      </div>

      <div
        className="overflow-hidden rounded-[22px] border"
        style={{ backgroundColor: `${color}22`, borderColor: `${color}66` }}
      >
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div
                className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-xl text-white"
                style={{ backgroundColor: color }}
              >
                {businessLogoUrl ? (
                  <img src={businessLogoUrl} alt="" className="h-full w-full rounded-2xl object-cover" />
                ) : programType === 'points' ? '⭐' : '🎟️'}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {businessName || 'Tu comercio'}
                </p>
                <p className="truncate text-xs text-gray-400">
                  {name || 'Nombre del programa'}
                </p>
                <p className="mt-1 truncate text-[11px] text-gray-500">
                  {earningText}
                </p>
              </div>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-base font-semibold text-white">
                {programType === 'points' ? '0' : `0/${Math.max(1, goal || 1)}`}
              </p>
              <p className="text-[11px] text-gray-400">
                {programType === 'points' ? 'puntos' : 'sellos'}
              </p>
            </div>
          </div>

          {(expiration || minimumPurchaseBs) && (
            <div className="mt-4 space-y-2 border-t border-white/10 pt-3">
              {expiration && (
                <div className="flex items-center gap-2 text-[11px] text-gray-400">
                  <CalendarDays size={13} />
                  <span>Vence: {expiration}</span>
                </div>
              )}
              {minimumPurchaseBs && (
                <div className="flex items-center gap-2 text-[11px] text-gray-400">
                  <Tag size={13} />
                  <span>Compra mínima: Bs {minimumPurchaseBs}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </PreviewShell>
  );
}

export interface RewardPreviewProps {
  title: string;
  description: string;
  icon: string;
  requiredUnits: number;
  programName: string;
  programType: ProgramType;
  color: string;
}

export function RewardPreview({
  title,
  description,
  icon,
  requiredUnits,
  programName,
  programType,
  color,
}: RewardPreviewProps) {
  return (
    <PreviewShell eyebrow="Simulación cuando el cliente alcanza la meta">
      <div className="rounded-[26px] border border-[#232837] bg-[#181a20] p-4">
        <div className="mb-4 flex items-center gap-2 text-white">
          <Sparkles size={18} style={{ color }} />
          <span className="text-sm font-semibold">Todas las recompensas</span>
        </div>

        <div
          className="rounded-[22px] border p-4"
          style={{ backgroundColor: `${color}66`, borderColor: `${color}99` }}
        >
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[14px] bg-white/15 text-2xl">
              {icon || '🎁'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">
                {title || 'Nombre de la recompensa'}
              </p>
              <p className="text-xs text-white/75">
                {Math.max(1, requiredUnits || 1)}{' '}
                {programType === 'points' ? 'puntos' : 'sellos'}
              </p>
            </div>
            <span className="rounded-full bg-white/15 px-3 py-2 text-xs font-semibold text-white">
              Canjear
            </span>
          </div>
        </div>

        <div className="mt-3 flex items-start gap-2 rounded-xl bg-white/5 p-3">
          <Award className="mt-0.5 shrink-0 text-gray-500" size={15} />
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-gray-300">
              {programName || 'Programa seleccionado'}
            </p>
            <p className="mt-0.5 line-clamp-2 text-[11px] text-gray-500">
              {description || 'La descripción se mostrará en el detalle de la recompensa.'}
            </p>
          </div>
        </div>
      </div>
    </PreviewShell>
  );
}
