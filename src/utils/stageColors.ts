/**
 * Canonical pipeline-stage vocabulary and its presentation colors.
 *
 * This module is the SINGLE source of truth for `Stage`. Stage values are
 * lowercase everywhere — DB column, Rust serde, TS types, `activeStage` state
 * and wire payloads. Display-casing happens only at render time, via
 * {@link stageLabel}.
 */

/** The six pipeline stages, lowercase — the canonical wire/DB casing. */
export type Stage = 'new' | 'contacted' | 'qualified' | 'negotiating' | 'won' | 'lost';

/** Presentation attributes for a single stage. */
export interface StageColor {
  /** Background color for the stage dot / avatar. */
  bg: string;
  /** Two-letter abbreviation rendered inside the dot / avatar. */
  abbr: string;
}

/**
 * Stage → presentation map. Keyed by the lowercase canonical stage value so
 * `STAGE_COLORS[lease.stage]` is always a direct, total lookup.
 */
export const STAGE_COLORS: Record<Stage, StageColor> = {
  new: { bg: '#94A3B8', abbr: 'NW' },
  contacted: { bg: '#3B82F6', abbr: 'CN' },
  qualified: { bg: '#10B981', abbr: 'QL' },
  negotiating: { bg: '#F59E0B', abbr: 'NG' },
  won: { bg: '#0D9488', abbr: 'WN' },
  lost: { bg: '#94A3B8', abbr: 'LT' },
};

/**
 * Pipeline order, for iterating filter pills and building stage `<select>`
 * options. Order is meaningful: it mirrors the sales funnel.
 */
export const STAGE_ORDER: Stage[] = [
  'new',
  'contacted',
  'qualified',
  'negotiating',
  'won',
  'lost',
];

const STAGE_SET: ReadonlySet<string> = new Set<string>(STAGE_ORDER);

/**
 * Display-casing helper. `'qualified'` → `'Qualified'`.
 *
 * The ONLY place stage casing changes. Never persist or compare the result.
 */
export const stageLabel = (stage: Stage): string => stage.charAt(0).toUpperCase() + stage.slice(1);

/**
 * Tolerant parser for stage values arriving from outside the type system
 * (DB rows, legacy TitleCase call sites, `localStorage`).
 *
 * Lowercases and trims; anything unrecognised falls back to `'new'` rather
 * than producing an out-of-domain value that would break a `STAGE_COLORS`
 * lookup downstream.
 */
export const parseStage = (value: string): Stage => {
  const normalized = (value ?? '').trim().toLowerCase();
  return STAGE_SET.has(normalized) ? (normalized as Stage) : 'new';
};
