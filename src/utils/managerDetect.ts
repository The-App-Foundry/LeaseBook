import type { Manager } from '../types/lease';

let nextId = 1;
const uid = (): number => nextId++;

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PHONE_RE = /(?:\+?\d[\d\s().-]{6,}\d)/;

/**
 * Attempts to split a raw string into individual manager entries.
 * Handles semicolons, " and ", " & ", and newlines as separators.
 */
const splitEntries = (raw: string): string[] =>
  raw
    .split(/[;\n]|(?:\s+and\s+)|(?:\s*&\s*)/)
    .map(s => s.trim())
    .filter(Boolean);

/**
 * Extracts a phone number and an email from a single entry string,
 * then treats the remainder as the manager's name.
 */
const parseEntry = (entry: string): { name: string; phone?: string; email?: string } => {
  let remaining = entry;

  const emailMatch = EMAIL_RE.exec(remaining);
  const email = emailMatch?.[0];
  if (email) remaining = remaining.replace(email, '');

  const phoneMatch = PHONE_RE.exec(remaining);
  const phone = phoneMatch?.[0]?.trim();
  if (phone) remaining = remaining.replace(phone, '');

  // Clean leftover punctuation / separators around the name
  const name = remaining
    .replaceAll(/[,\-|/]+/g, ' ')
    .replaceAll(/\s{2,}/g, ' ')
    .trim();

  return { name, phone, email };
};

export interface DetectionResult {
  managers: Manager[];
  /** true when every manager has at least a non-empty name */
  allVerified: boolean;
}

/**
 * Auto-detect manager data from a raw cell value.
 *
 * Supported patterns:
 *  - Single name: "Jane Doe"
 *  - Multiple names: "Jane Doe; John Smith" or "Jane Doe and John Smith"
 *  - Name + phone: "Jane Doe 555-123-4567"
 *  - Name + phone + email: "Jane Doe 555-123-4567 jane@acme.com"
 *  - Name + email: "Jane Doe jane@acme.com"
 */
export const detectManagers = (raw: string): DetectionResult => {
  if (!raw?.trim()) {
    return { managers: [], allVerified: false };
  }

  const entries = splitEntries(raw);
  const managers: Manager[] = entries.map(entry => {
    const { name, phone, email } = parseEntry(entry);
    const verified = name.length > 0;
    // isPrimary is a property of the leases_managers join row, which does not
    // exist yet at detection time — the backend's backfill/insert decides it.
    return {
      id: uid(),
      name: name || entry.trim(),
      phoneNumbers: phone ? [phone] : [],
      email,
      verified,
      isPrimary: false,
    };
  });

  const allVerified = managers.length > 0 && managers.every(m => m.verified);
  return { managers, allVerified };
};
