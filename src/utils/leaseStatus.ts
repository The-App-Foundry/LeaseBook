import type { Lease } from '../types/lease';

/**
 * Single source of truth for lease-expiration badge presentation.
 *
 * Both the card grid (`Property`) and the list view consume
 * {@link getExpirationMeta}. Do not reimplement any of this at a call site —
 * a card and a table row disagreeing on badge text is the exact bug this
 * module exists to prevent.
 */

const MS_PER_DAY = 86_400_000;

/**
 * One presentation rule. `tag: null` means "compute the label at render time"
 * (the day-count bands render `"43 days"` rather than a fixed string).
 */
export interface ExpirationRule {
  tag: string | null;
  tagBg: string;
  tagColor: string;
  dateColor: string;
  /**
   * Background of the whole expiration ROW (the card's date strip), as opposed
   * to {@link ExpirationRule.tagBg}, which colors only the badge.
   */
  rowBg: string;
  /** Border color of the expiration row. Pairs with {@link ExpirationRule.rowBg}. */
  rowBorder: string;
  /** true = render as a filled pill; false = plain text, no chrome. */
  isPill: boolean;
}

/**
 * The complete, editable rule set. Every threshold and every color lives here
 * and nowhere else — this object is the exact shape a future Settings panel
 * mutates.
 */
export interface ExpirationRuleset {
  /** Below this many days remaining, a lease is a hot renewal opportunity. */
  OPP_MAX_DAYS: number;
  /** Upper bound of the "near" band; above it, the "far" band applies. */
  NEAR_MAX_DAYS: number;
  /**
   * Terminal stages. Checked BEFORE any day math — a won/lost lease never
   * shows a day count.
   */
  stageOverrides: Record<'won' | 'lost', ExpirationRule>;
  /** Day-count bands, selected by `daysUntil`. */
  bands: {
    /** `days < OPP_MAX_DAYS` — includes negative days. An already-expired lease is the hottest lead, by design. */
    opp: ExpirationRule;
    /** `OPP_MAX_DAYS <= days <= NEAR_MAX_DAYS` */
    near: ExpirationRule;
    /** `days > NEAR_MAX_DAYS` */
    far: ExpirationRule;
  };
  /** No expiration date on record. */
  noExpiration: ExpirationRule;
}

const TRANSPARENT = 'transparent';

export const RULESET: ExpirationRuleset = {
  OPP_MAX_DAYS: 30,
  NEAR_MAX_DAYS: 99,
  stageOverrides: {
    won: {
      tag: 'RENEWED',
      tagBg: '#0D9488',
      tagColor: '#FFFFFF',
      dateColor: '#0D9488',
      rowBg: '#ECFDF5',
      rowBorder: '#A7F3D0',
      isPill: true,
    },
    lost: {
      tag: 'LOST',
      tagBg: '#94A3B8',
      tagColor: '#FFFFFF',
      dateColor: '#94A3B8',
      rowBg: '#F4F5F7',
      rowBorder: '#E1E3E8',
      isPill: true,
    },
  },
  bands: {
    opp: {
      tag: 'OPP',
      tagBg: '#0D9488',
      tagColor: '#FFFFFF',
      dateColor: '#0D9488',
      rowBg: '#ECFDF5',
      rowBorder: '#A7F3D0',
      isPill: true,
    },
    near: {
      tag: null,
      tagBg: TRANSPARENT,
      tagColor: '#2850C4',
      dateColor: '#2850C4',
      rowBg: '#EEF3FF',
      rowBorder: '#C7D8FB',
      isPill: false,
    },
    far: {
      tag: null,
      tagBg: TRANSPARENT,
      tagColor: '#0F7A55',
      dateColor: '#0F7A55',
      rowBg: '#F4F5F7',
      rowBorder: '#E1E3E8',
      isPill: false,
    },
  },
  noExpiration: {
    tag: '—',
    tagBg: TRANSPARENT,
    tagColor: '#6B7280',
    dateColor: '#6B7280',
    rowBg: TRANSPARENT,
    rowBorder: TRANSPARENT,
    isPill: false,
  },
};

/** Resolved presentation values for one lease's expiration cell. */
export interface ExpirationMeta {
  /** Ready-to-render label: `'RENEWED'`, `'LOST'`, `'OPP'`, `'43 days'` or `'—'`. */
  tag: string;
  tagBg: string;
  tagColor: string;
  dateColor: string;
  /** Background for the card's expiration row. `'transparent'` when unset. */
  rowBg: string;
  /** Border color for the card's expiration row. `'transparent'` when unset. */
  rowBorder: string;
  isPill: boolean;
}

/**
 * `Lease.leaseExpiration` is a *display* string, not a timestamp, and arrives
 * in several shapes: ISO `YYYY-MM-DD` (context), `MM/DD/YYYY` (workbook
 * import), and `''` / `'-'` / `undefined`.
 *
 * Everything is normalised to a UTC-midnight epoch so the 30/99 boundaries do
 * not flip with the viewer's timezone or the time of day.
 */
const toUtcMidnight = (raw: string): number | null => {
  const trimmed = raw.trim();
  if (!trimmed || trimmed === '-') return null;

  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(trimmed);
  if (iso) return Date.UTC(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));

  const us = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(trimmed);
  if (us) return Date.UTC(Number(us[3]), Number(us[1]) - 1, Number(us[2]));

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return null;
  return Date.UTC(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
};

/**
 * Whole days from today until the lease expires.
 *
 * Negative when the lease has already expired. `null` when there is no
 * expiration on record or the stored string is unparseable.
 */
export const daysUntil = (lease: Lease): number | null => {
  if (!lease.leaseExpiration) return null;
  const target = toUtcMidnight(lease.leaseExpiration);
  if (target === null) return null;

  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target - today) / MS_PER_DAY);
};

const resolve = (rule: ExpirationRule, days: number | null): ExpirationMeta => ({
  tag: rule.tag ?? `${days} days`,
  tagBg: rule.tagBg,
  tagColor: rule.tagColor,
  dateColor: rule.dateColor,
  rowBg: rule.rowBg,
  rowBorder: rule.rowBorder,
  isPill: rule.isPill,
});

/**
 * Resolve the expiration badge for a lease.
 *
 * Precedence: terminal stage (`won` / `lost`) short-circuits before any day
 * math, then the day-count bands, then the no-expiration fallback.
 */
export const getExpirationMeta = (lease: Lease): ExpirationMeta => {
  if (lease.stage === 'won') return resolve(RULESET.stageOverrides.won, null);
  if (lease.stage === 'lost') return resolve(RULESET.stageOverrides.lost, null);

  const days = daysUntil(lease);
  if (days === null) return resolve(RULESET.noExpiration, null);
  if (days < RULESET.OPP_MAX_DAYS) return resolve(RULESET.bands.opp, days);
  if (days <= RULESET.NEAR_MAX_DAYS) return resolve(RULESET.bands.near, days);
  return resolve(RULESET.bands.far, days);
};
