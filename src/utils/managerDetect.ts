import type { Manager } from '../types/lease';

let nextId = 1;
function uid(): string {
  return `mgr-${Date.now()}-${nextId++}`;
}

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PHONE_RE = /(?:\+?\d[\d\s().-]{6,}\d)/;

/**
 * Attempts to split a raw string into individual manager entries.
 * Handles semicolons, " and ", " & ", and newlines as separators.
 */
function splitEntries(raw: string): string[] {
  return raw
    .split(/[;\n]|(?:\s+and\s+)|(?:\s*&\s*)/)
    .map(s => s.trim())
    .filter(Boolean);
}

/**
 * Extracts a phone number and an email from a single entry string,
 * then treats the remainder as the manager's name.
 */
function parseEntry(entry: string): Pick<Manager, 'name' | 'phone' | 'email'> {
  let remaining = entry;

  const emailMatch = remaining.match(EMAIL_RE);
  const email = emailMatch?.[0];
  if (email) remaining = remaining.replace(email, '');

  const phoneMatch = remaining.match(PHONE_RE);
  const phone = phoneMatch?.[0]?.trim();
  if (phone) remaining = remaining.replace(phone, '');

  // Clean leftover punctuation / separators around the name
  const name = remaining
    .replace(/[,\-|/]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();

  return { name, phone, email };
}

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
export function detectManagers(raw: string): DetectionResult {
  if (!raw || !raw.trim()) {
    return { managers: [], allVerified: false };
  }

  const entries = splitEntries(raw);
  const managers: Manager[] = entries.map(entry => {
    const { name, phone, email } = parseEntry(entry);
    const verified = name.length > 0;
    return { id: uid(), name: name || entry.trim(), phone, email, verified };
  });

  const allVerified = managers.length > 0 && managers.every(m => m.verified);
  return { managers, allVerified };
}
