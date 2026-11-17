export interface BusinessAssignment {
  id: string;
  role: string;
  jobTitle: string | null;
  status: string;
  business: {
    id: string;
    publicCode: string;
    displayName: string;
    slug: string;
    status: string;
  };
  locations: Array<{
    id: string;
    publicCode: string;
    name: string;
    status: string;
  }>;
}

export interface BusinessSession {
  id: string;
  publicCode: string;
  fullName: string;
  email: string | null;
  status: string;
  assignments: BusinessAssignment[];
}

export type ProgramType = 'points' | 'stamps';
export type EarningMethod = 'spend_conversion' | 'fixed_per_visit' | 'manual';
export type ProgramStatus = 'draft' | 'active' | 'paused' | 'ended';

export interface Program {
  id: string;
  name: string;
  programType: ProgramType;
  earningMethod: EarningMethod;
  status: ProgramStatus;
  spendAmountMinor: number | null;
  awardUnits: number | null;
  minimumPurchaseMinor: number | null;
  stampCycleSize: number | null;
  cardColor: string | null;
  validFrom: string | null;
  validUntil: string | null;
  terms: string | null;
  members: number;
  reward: {
    title: string;
    icon: string | null;
    requiredUnits: number;
  } | null;
}

export interface ProgramMutation {
  assignmentId: string;
  name: string;
  programType: ProgramType;
  earningMethod: EarningMethod;
  status: ProgramStatus;
  spendAmountMinor?: number;
  awardUnits?: number;
  minimumPurchaseMinor?: number;
  stampCycleSize?: number;
  cardColor?: string;
  validFrom?: string;
  validUntil?: string;
  terms?: string;
}

export interface Reward {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  rewardType: string;
  status: string;
  repeatable: boolean;
  stockQuantity: number | null;
  redemptions: number;
  costs: Array<{
    programId: string;
    programName: string;
    unitType: 'points' | 'stamps';
    requiredUnits: number;
  }>;
}

export interface Promotion {
  id: string;
  title: string;
  description: string | null;
  promotionType: string;
  channel: string;
  status: string;
  discountAmountMinor: number | null;
  discountPercent: number | null;
  displayColor: string | null;
  validFrom: string | null;
  validUntil: string | null;
  redemptions: number;
  bonus: {
    programId: string;
    programName: string;
    unitType: 'points' | 'stamps';
    mode: 'fixed' | 'multiplier';
    units: number | null;
    multiplier: number | null;
  } | null;
}
