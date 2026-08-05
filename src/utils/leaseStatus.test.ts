import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RULESET, daysUntil, getExpirationMeta } from './leaseStatus';
import { createLease, isoInDays, usInDays } from '../test/filterGridValue';
import type { Stage } from '../types/lease';

/**
 * A fixed clock is mandatory here. Offsets computed from the real `Date.now()`
 * pass today and fail at a DST transition or a year boundary, and the 30/99
 * band edges are exactly where that shows up.
 *
 * Only `Date` is faked: leaving timers real keeps this file consistent with the
 * component suites, which need `userEvent` to resolve.
 */
const FIXED_NOW = new Date('2026-07-24T12:34:56.000Z');

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(FIXED_NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('daysUntil', () => {
  it.each([-400, -30, -1, 0, 1, 29, 30, 99, 100, 365])(
    'returns %i for an ISO date that many days out',
    days => {
      expect(daysUntil(createLease({ leaseExpiration: isoInDays(days) }))).toBe(days);
    },
  );

  it.each([-1, 0, 29, 30, 99, 100])(
    'parses MM/DD/YYYY and YYYY-MM-DD to the same count (%i days)',
    days => {
      const iso = daysUntil(createLease({ leaseExpiration: isoInDays(days) }));
      const us = daysUntil(createLease({ leaseExpiration: usInDays(days) }));

      expect(us).toBe(days);
      expect(us).toBe(iso);
    },
  );

  it('is unaffected by the time of day', () => {
    const expiration = isoInDays(30);

    // Local midnight of the faked day, and one millisecond before the next.
    // Built from local fields so the assertion holds in every timezone.
    const localMidnight = new Date(
      FIXED_NOW.getFullYear(),
      FIXED_NOW.getMonth(),
      FIXED_NOW.getDate(),
    ).getTime();

    vi.setSystemTime(new Date(localMidnight));
    expect(daysUntil(createLease({ leaseExpiration: expiration }))).toBe(30);

    vi.setSystemTime(new Date(localMidnight + 86_400_000 - 1));
    expect(daysUntil(createLease({ leaseExpiration: expiration }))).toBe(30);
  });

  it.each([
    ['undefined', undefined],
    ['empty string', ''],
    ['a bare dash placeholder', '-'],
    ['whitespace only', '   '],
    ['unparseable text', 'not a date at all'],
  ])('returns null for %s', (_label, expiration) => {
    expect(daysUntil(createLease({ leaseExpiration: expiration }))).toBeNull();
  });

  it('accepts a full ISO timestamp, not just YYYY-MM-DD', () => {
    expect(daysUntil(createLease({ leaseExpiration: `${isoInDays(45)}T09:15:00Z` }))).toBe(45);
  });
});

describe('getExpirationMeta — day-count bands', () => {
  const NEAR = RULESET.bands.near;
  const FAR = RULESET.bands.far;
  const OPP = RULESET.bands.opp;

  // The whole point of this table is the `<` at OPP_MAX_DAYS and the `<=` at
  // NEAR_MAX_DAYS. Both edges are pinned from either side.
  it.each([
    [-400, 'OPP', true, OPP],
    [-1, 'OPP', true, OPP],
    [0, 'OPP', true, OPP],
    [29, 'OPP', true, OPP],
    [30, '30 days', false, NEAR],
    [31, '31 days', false, NEAR],
    [98, '98 days', false, NEAR],
    [99, '99 days', false, NEAR],
    [100, '100 days', false, FAR],
    [365, '365 days', false, FAR],
  ] as const)('%i days out renders %s', (days, tag, isPill, rule) => {
    const meta = getExpirationMeta(createLease({ leaseExpiration: isoInDays(days) }));

    expect(meta.tag).toBe(tag);
    expect(meta.isPill).toBe(isPill);
    expect(meta.tagBg).toBe(rule.tagBg);
    expect(meta.tagColor).toBe(rule.tagColor);
    expect(meta.dateColor).toBe(rule.dateColor);
    expect(meta.rowBg).toBe(rule.rowBg);
    expect(meta.rowBorder).toBe(rule.rowBorder);
  });

  it('treats an already-expired lease as the hottest opportunity, not a stale one', () => {
    const expired = getExpirationMeta(createLease({ leaseExpiration: isoInDays(-90) }));
    const imminent = getExpirationMeta(createLease({ leaseExpiration: isoInDays(3) }));

    expect(expired.tag).toBe('OPP');
    expect(expired).toEqual(imminent);
  });

  it('honours the declared thresholds rather than hardcoded 30/99', () => {
    expect(RULESET.OPP_MAX_DAYS).toBe(30);
    expect(RULESET.NEAR_MAX_DAYS).toBe(99);

    const atOpp = getExpirationMeta(
      createLease({ leaseExpiration: isoInDays(RULESET.OPP_MAX_DAYS - 1) }),
    );
    const atNear = getExpirationMeta(
      createLease({ leaseExpiration: isoInDays(RULESET.NEAR_MAX_DAYS) }),
    );
    const pastNear = getExpirationMeta(
      createLease({ leaseExpiration: isoInDays(RULESET.NEAR_MAX_DAYS + 1) }),
    );

    expect(atOpp.tag).toBe('OPP');
    expect(atNear.tag).toBe(`${RULESET.NEAR_MAX_DAYS} days`);
    expect(pastNear.tag).toBe(`${RULESET.NEAR_MAX_DAYS + 1} days`);
  });
});

describe('getExpirationMeta — terminal stages short-circuit', () => {
  // Each of these day offsets would otherwise land in a different band; a
  // won/lost lease must never leak a day count regardless.
  const DAY_OFFSETS = [-400, -1, 0, 5, 29, 30, 99, 100, 365];

  it.each(DAY_OFFSETS)('stage "won" renders RENEWED even %i days out', days => {
    const meta = getExpirationMeta(
      createLease({ stage: 'won', leaseExpiration: isoInDays(days) }),
    );

    expect(meta.tag).toBe('RENEWED');
    expect(meta.isPill).toBe(true);
    expect(meta.tagBg).toBe(RULESET.stageOverrides.won.tagBg);
    expect(meta.rowBg).toBe(RULESET.stageOverrides.won.rowBg);
  });

  it.each(DAY_OFFSETS)('stage "lost" renders LOST even %i days out', days => {
    const meta = getExpirationMeta(
      createLease({ stage: 'lost', leaseExpiration: isoInDays(days) }),
    );

    expect(meta.tag).toBe('LOST');
    expect(meta.isPill).toBe(true);
    expect(meta.tagBg).toBe(RULESET.stageOverrides.lost.tagBg);
    expect(meta.rowBg).toBe(RULESET.stageOverrides.lost.rowBg);
  });

  it('short-circuits before the no-expiration fallback too', () => {
    expect(getExpirationMeta(createLease({ stage: 'won', leaseExpiration: undefined })).tag).toBe(
      'RENEWED',
    );
    expect(getExpirationMeta(createLease({ stage: 'lost', leaseExpiration: '-' })).tag).toBe(
      'LOST',
    );
  });

  it.each(['new', 'contacted', 'qualified', 'negotiating'] as const satisfies readonly Stage[])(
    'stage "%s" does NOT short-circuit — the day count still wins',
    stage => {
      expect(getExpirationMeta(createLease({ stage, leaseExpiration: isoInDays(5) })).tag).toBe(
        'OPP',
      );
      expect(getExpirationMeta(createLease({ stage, leaseExpiration: isoInDays(60) })).tag).toBe(
        '60 days',
      );
    },
  );
});

describe('getExpirationMeta — no expiration on record', () => {
  it.each([
    ['undefined', undefined],
    ['empty string', ''],
    ['the dash the context writes for a null date', '-'],
    ['unparseable text', 'sometime next spring'],
  ])('renders the em-dash placeholder for %s', (_label, expiration) => {
    const meta = getExpirationMeta(createLease({ leaseExpiration: expiration }));

    // Em dash (U+2014), not the ASCII hyphen the context stores in
    // `leaseExpiration`. These are different characters on purpose.
    expect(meta.tag).toBe('—');
    expect(meta.isPill).toBe(false);
    expect(meta.tagBg).toBe(RULESET.noExpiration.tagBg);
    expect(meta.tagColor).toBe(RULESET.noExpiration.tagColor);
    expect(meta.rowBg).toBe('transparent');
    expect(meta.rowBorder).toBe('transparent');
  });

  it('never renders "null days"', () => {
    expect(getExpirationMeta(createLease({ leaseExpiration: undefined })).tag).not.toContain(
      'null',
    );
  });
});
