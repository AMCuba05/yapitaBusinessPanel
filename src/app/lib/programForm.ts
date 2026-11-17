import type {
  EarningMethod,
  Program,
  ProgramMutation,
  ProgramStatus,
  ProgramType,
} from '../types/api.ts';

export interface ProgramFormValues {
  name: string;
  programType: ProgramType;
  earningMethod: EarningMethod;
  status: ProgramStatus;
  spendAmountBs: string;
  awardUnits: string;
  minimumPurchaseBs: string;
  stampCycleSize: string;
  cardColor: string;
  hasExpiration: boolean;
  validFrom: string;
  validUntil: string;
  terms: string;
}

export type ProgramFormErrors = Partial<Record<keyof ProgramFormValues, string>>;

export function createEmptyProgramForm(
  programType: ProgramType = 'points',
): ProgramFormValues {
  return {
    name: '',
    programType,
    earningMethod: 'fixed_per_visit',
    status: programType === 'stamps' ? 'draft' : 'active',
    spendAmountBs: '',
    awardUnits: '1',
    minimumPurchaseBs: '',
    stampCycleSize: programType === 'stamps' ? '10' : '',
    cardColor: '#9333ea',
    hasExpiration: false,
    validFrom: '',
    validUntil: '',
    terms: '',
  };
}

export function minorToBolivianos(value: number | null | undefined): string {
  return value == null ? '' : (value / 100).toFixed(2);
}

export function bolivianosToMinor(value: string): number | undefined {
  const normalized = value.trim().replace(',', '.');
  if (!normalized) return undefined;
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) return Number.NaN;
  const result = Math.round(Number(normalized) * 100);
  return Number.isSafeInteger(result) ? result : Number.NaN;
}

export function programToForm(program: Program): ProgramFormValues {
  const isStamps = program.programType === 'stamps';
  return {
    name: program.name,
    programType: program.programType,
    earningMethod: isStamps ? 'fixed_per_visit' : program.earningMethod,
    status: program.status,
    spendAmountBs: isStamps ? '' : minorToBolivianos(program.spendAmountMinor),
    awardUnits: program.awardUnits == null ? (isStamps ? '1' : '') : String(program.awardUnits),
    minimumPurchaseBs: minorToBolivianos(program.minimumPurchaseMinor),
    stampCycleSize:
      program.stampCycleSize == null ? '' : String(program.stampCycleSize),
    cardColor: program.cardColor ?? '#9333ea',
    hasExpiration: Boolean(program.validFrom || program.validUntil),
    validFrom: program.validFrom?.slice(0, 10) ?? '',
    validUntil: program.validUntil?.slice(0, 10) ?? '',
    terms: program.terms ?? '',
  };
}

function isPositiveInteger(value: string) {
  return /^\d+$/.test(value.trim()) && Number(value) > 0;
}

export function validateProgramForm(form: ProgramFormValues): ProgramFormErrors {
  const errors: ProgramFormErrors = {};
  const name = form.name.trim();
  const terms = form.terms.trim();
  const spendAmountMinor = bolivianosToMinor(form.spendAmountBs);
  const minimumPurchaseMinor = bolivianosToMinor(form.minimumPurchaseBs);

  if (!name) errors.name = 'Ingresa el nombre del programa.';
  else if (name.length > 160) errors.name = 'El nombre puede tener hasta 160 caracteres.';

  if (form.programType === 'points' && form.earningMethod === 'spend_conversion') {
    if (!form.spendAmountBs.trim()) {
      errors.spendAmountBs = 'Ingresa el monto de compra para la conversión.';
    } else if (!Number.isFinite(spendAmountMinor) || spendAmountMinor! <= 0) {
      errors.spendAmountBs = 'Ingresa un importe mayor a Bs 0 con hasta 2 decimales.';
    }
  } else if (
    form.programType === 'points' &&
    form.earningMethod === 'manual' &&
    form.spendAmountBs.trim() &&
    (!Number.isFinite(spendAmountMinor) || spendAmountMinor! <= 0)
  ) {
    errors.spendAmountBs = 'Ingresa un importe mayor a Bs 0 con hasta 2 decimales.';
  }

  const requiresAwardUnits =
    form.programType === 'stamps' || form.earningMethod !== 'manual';
  if (requiresAwardUnits && !form.awardUnits.trim()) {
    errors.awardUnits = 'Ingresa las unidades que recibirá el cliente.';
  } else if (form.awardUnits.trim() && !isPositiveInteger(form.awardUnits)) {
    errors.awardUnits = 'Las unidades deben ser un número entero mayor a 0.';
  }

  if (form.programType === 'stamps') {
    if (!form.stampCycleSize.trim()) {
      errors.stampCycleSize = 'Ingresa la cantidad de sellos del ciclo.';
    } else if (!isPositiveInteger(form.stampCycleSize)) {
      errors.stampCycleSize = 'El ciclo debe ser un número entero mayor a 0.';
    }
  }

  if (
    form.minimumPurchaseBs.trim() &&
    (!Number.isFinite(minimumPurchaseMinor) || minimumPurchaseMinor! <= 0)
  ) {
    errors.minimumPurchaseBs = 'Ingresa un importe mayor a Bs 0 con hasta 2 decimales.';
  }

  if (form.cardColor && !/^#[0-9a-f]{6}$/i.test(form.cardColor)) {
    errors.cardColor = 'Selecciona un color válido.';
  }
  if (form.hasExpiration && form.validFrom && form.validUntil && form.validUntil < form.validFrom) {
    errors.validUntil = 'La fecha de fin no puede ser anterior a la fecha de inicio.';
  }
  if (terms.length > 2000) {
    errors.terms = 'Los términos pueden tener hasta 2000 caracteres.';
  }

  return errors;
}

export function buildProgramMutation(
  assignmentId: string,
  form: ProgramFormValues,
): ProgramMutation {
  const payload: ProgramMutation = {
    assignmentId,
    name: form.name.trim(),
    programType: form.programType,
    earningMethod: form.programType === 'stamps' ? 'fixed_per_visit' : form.earningMethod,
    status: form.status,
  };
  const spendAmountMinor = bolivianosToMinor(form.spendAmountBs);
  const minimumPurchaseMinor = bolivianosToMinor(form.minimumPurchaseBs);

  const includesSpendAmount =
    form.programType === 'points' &&
    (form.earningMethod === 'spend_conversion' || form.earningMethod === 'manual');
  if (form.programType === 'stamps') {
    payload.awardUnits = Number(form.awardUnits);
  }
  if (includesSpendAmount && spendAmountMinor !== undefined) {
    payload.spendAmountMinor = spendAmountMinor;
  }
  if (form.programType === 'points' && (form.earningMethod !== 'manual' || form.awardUnits.trim())) {
    payload.awardUnits = Number(form.awardUnits);
  }
  if (minimumPurchaseMinor !== undefined) {
    payload.minimumPurchaseMinor = minimumPurchaseMinor;
  }
  if (form.programType === 'stamps') {
    payload.stampCycleSize = Number(form.stampCycleSize);
  }
  if (form.cardColor.trim()) payload.cardColor = form.cardColor.trim();
  if (form.hasExpiration && form.validFrom) payload.validFrom = form.validFrom;
  if (form.hasExpiration && form.validUntil) payload.validUntil = form.validUntil;
  if (form.terms.trim()) payload.terms = form.terms.trim();

  return payload;
}
