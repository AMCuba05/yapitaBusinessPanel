import assert from 'node:assert/strict';
import test from 'node:test';
import type { Program } from '../types/api.ts';
import {
  bolivianosToMinor,
  buildProgramMutation,
  createEmptyProgramForm,
  minorToBolivianos,
  programToForm,
  validateProgramForm,
} from './programForm.ts';

test('convierte bolivianos y centavos sin perder decimales', () => {
  assert.equal(bolivianosToMinor('10,00'), 1000);
  assert.equal(bolivianosToMinor('25.50'), 2550);
  assert.equal(minorToBolivianos(2550), '25.50');
  assert.equal(bolivianosToMinor(''), undefined);
  assert.equal(Number.isNaN(bolivianosToMinor('1.234')), true);
});

test('crea el payload de conversión por consumo con importes en centavos', () => {
  const form = {
    ...createEmptyProgramForm('points'),
    name: ' Club Yapita ',
    earningMethod: 'spend_conversion' as const,
    spendAmountBs: '10,00',
    awardUnits: '1',
    minimumPurchaseBs: '25,50',
    hasExpiration: true,
    validFrom: '2026-09-25',
    validUntil: '2027-09-25',
    terms: ' Obtén puntos. ',
  };

  assert.deepEqual(buildProgramMutation('assignment-id', form), {
    assignmentId: 'assignment-id',
    name: 'Club Yapita',
    programType: 'points',
    earningMethod: 'spend_conversion',
    status: 'active',
    spendAmountMinor: 1000,
    awardUnits: 1,
    minimumPurchaseMinor: 2550,
    cardColor: '#9333ea',
    validFrom: '2026-09-25',
    validUntil: '2027-09-25',
    terms: 'Obtén puntos.',
  });
});

test('omite campos ocultos y strings opcionales vacíos', () => {
  const form = {
    ...createEmptyProgramForm('points'),
    name: 'Puntos por visita',
    earningMethod: 'fixed_per_visit' as const,
    spendAmountBs: '10.00',
    awardUnits: '5',
    cardColor: '',
  };

  const payload = buildProgramMutation('assignment-id', form);
  assert.equal(payload.awardUnits, 5);
  assert.equal('spendAmountMinor' in payload, false);
  assert.equal('stampCycleSize' in payload, false);
  assert.equal('minimumPurchaseMinor' in payload, false);
  assert.equal('cardColor' in payload, false);
  assert.equal('validFrom' in payload, false);
  assert.equal('validUntil' in payload, false);
  assert.equal('terms' in payload, false);
});

test('manual permite omitir importes y unidades', () => {
  const form = {
    ...createEmptyProgramForm('points'),
    name: 'Carga manual',
    earningMethod: 'manual' as const,
    awardUnits: '',
  };

  assert.deepEqual(validateProgramForm(form), {});
  const payload = buildProgramMutation('assignment-id', form);
  assert.equal('spendAmountMinor' in payload, false);
  assert.equal('awardUnits' in payload, false);
});

test('puntos solo envía fechas cuando el check de expiración está activo', () => {
  const withoutExpiration = {
    ...createEmptyProgramForm('points'),
    name: 'Sin vencimiento',
    validFrom: '2026-09-25',
    validUntil: '2027-09-25',
  };
  const payloadWithoutExpiration = buildProgramMutation('assignment-id', withoutExpiration);
  assert.equal('validFrom' in payloadWithoutExpiration, false);
  assert.equal('validUntil' in payloadWithoutExpiration, false);

  const payloadWithExpiration = buildProgramMutation('assignment-id', {
    ...withoutExpiration,
    hasExpiration: true,
  });
  assert.equal(payloadWithExpiration.validFrom, '2026-09-25');
  assert.equal(payloadWithExpiration.validUntil, '2027-09-25');
});

test('sellos tradicionales inician como borrador y exigen el tamaño del ciclo', () => {
  const invalid = {
    ...createEmptyProgramForm('stamps'),
    name: 'Tarjeta de sellos',
    stampCycleSize: '',
  };
  assert.equal(invalid.earningMethod, 'fixed_per_visit');
  assert.equal(invalid.status, 'draft');
  assert.equal(validateProgramForm(invalid).stampCycleSize, 'Ingresa la cantidad de sellos del ciclo.');

  const valid = { ...invalid, stampCycleSize: '8' };
  const payload = buildProgramMutation('assignment-id', valid);
  assert.equal(payload.stampCycleSize, 8);
  assert.equal(payload.awardUnits, 1);
  assert.equal('spendAmountMinor' in payload, false);
  assert.equal('validFrom' in payload, false);
  assert.equal('validUntil' in payload, false);
  assert.equal('cardLogoUrl' in payload, false);
});

test('sellos fuerza el método por visita y conserva la cantidad editable', () => {
  const manipulated = {
    ...createEmptyProgramForm('stamps'),
    name: 'Tarjeta manipulada',
    earningMethod: 'spend_conversion' as const,
    spendAmountBs: '20,00',
    awardUnits: '7',
    minimumPurchaseBs: '10',
  };
  const payload = buildProgramMutation('assignment-id', manipulated);
  assert.equal(payload.earningMethod, 'fixed_per_visit');
  assert.equal(payload.awardUnits, 7);
  assert.equal('spendAmountMinor' in payload, false);
  assert.equal(payload.minimumPurchaseMinor, 1000);
});

test('sellos solo envía la vigencia cuando el usuario activa el check', () => {
  const withoutExpiration = {
    ...createEmptyProgramForm('stamps'),
    name: 'Sellos sin vencimiento',
    validFrom: '2026-09-25',
    validUntil: '2027-09-25',
  };
  const payloadWithoutExpiration = buildProgramMutation('assignment-id', withoutExpiration);
  assert.equal('validFrom' in payloadWithoutExpiration, false);
  assert.equal('validUntil' in payloadWithoutExpiration, false);

  const payloadWithExpiration = buildProgramMutation('assignment-id', {
    ...withoutExpiration,
    hasExpiration: true,
  });
  assert.equal(payloadWithExpiration.validFrom, '2026-09-25');
  assert.equal(payloadWithExpiration.validUntil, '2027-09-25');
});

test('valida los requeridos de cada método y los límites de texto', () => {
  const form = {
    ...createEmptyProgramForm(),
    name: 'x'.repeat(161),
    earningMethod: 'spend_conversion' as const,
    spendAmountBs: '',
    awardUnits: '',
    terms: 'x'.repeat(2001),
  };
  const errors = validateProgramForm(form);

  assert.ok(errors.name);
  assert.ok(errors.spendAmountBs);
  assert.ok(errors.awardUnits);
  assert.ok(errors.terms);
});

test('carga todos los valores existentes al editar y los conserva en el payload', () => {
  const program: Program = {
    id: 'program-id',
    name: 'Sellos Café',
    programType: 'stamps',
    earningMethod: 'fixed_per_visit',
    status: 'paused',
    spendAmountMinor: null,
    awardUnits: 2,
    minimumPurchaseMinor: 2550,
    stampCycleSize: 9,
    cardColor: '#2563eb',
    validFrom: '2026-09-25T00:00:00.000Z',
    validUntil: '2027-09-25T00:00:00.000Z',
    terms: 'Términos existentes',
    members: 12,
    reward: null,
  };
  const form = programToForm(program);

  assert.equal(form.spendAmountBs, '');
  assert.equal(form.awardUnits, '2');
  assert.equal(form.minimumPurchaseBs, '25.50');
  assert.equal(form.validFrom, '2026-09-25');
  assert.equal(form.validUntil, '2027-09-25');
  assert.equal(form.hasExpiration, true);
  assert.deepEqual(buildProgramMutation('assignment-id', form), {
    assignmentId: 'assignment-id',
    name: 'Sellos Café',
    programType: 'stamps',
    earningMethod: 'fixed_per_visit',
    status: 'paused',
    awardUnits: 2,
    minimumPurchaseMinor: 2550,
    stampCycleSize: 9,
    cardColor: '#2563eb',
    validFrom: '2026-09-25',
    validUntil: '2027-09-25',
    terms: 'Términos existentes',
  });
});
