import { useState } from 'react';
import { X } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import { Modal, Button } from '../ui';
import type { Lease, Manager } from '../../types/lease';
import ManagerForm from './ManagerForm';

interface PropertyFormProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (lease: Lease) => void;
  data?: Lease;
}

interface DbLease {
  id: number;
  name: string;
  address: string;
  size: number;
  expiration_date: number | null;
  notes: string | null;
  misc_data: string | null;
}

interface FormState {
  name: string;
  address: string;
  expiration: string;
  size: string;
  notes: string;
}

interface FormErrors {
  name?: string;
  address?: string;
}

/**
 * Converts an ISO date string (YYYY-MM-DD) to a Unix timestamp (seconds).
 * Returns null if the input is empty or invalid.
 */
const dateToUnixTimestamp = (dateStr: string): number | null => {
  const trimmed = dateStr.trim();
  if (!trimmed) return null;

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const ms = Date.UTC(year, month - 1, day);
  const parsed = new Date(ms);

  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    return null;
  }

  return Math.floor(ms / 1000);
};

/**
 * Converts a Unix timestamp (seconds) to an ISO date string (YYYY-MM-DD).
 * Returns an empty string for invalid timestamps.
 */
const unixTimestampToIso = (ts: number): string => {
  if (!Number.isFinite(ts)) return '';

  const date = new Date(ts * 1000);
  if (Number.isNaN(date.getTime())) return '';

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const dbLeaseToFrontend = (db: DbLease, managers: Manager[]): Lease => {
  const expirationIso = db.expiration_date ? unixTimestampToIso(db.expiration_date) : '';
  const isExpired = db.expiration_date ? db.expiration_date * 1000 < Date.now() : false;

  return {
    status: isExpired ? 'prospect' : 'qualified',
    name: db.name,
    businessAddr: db.address,
    leaseExpiration: expirationIso,
    leaseManager: managers[0]?.name ?? '',
    managers,
    size: db.size ?? 0,
    note: db.notes ?? undefined,
  };
};

const EMPTY_FORM: FormState = {
  name: '',
  address: '',
  expiration: '',
  size: '',
  notes: '',
};

const PropertyForm = ({ isOpen, onClose, onCreated }: Readonly<PropertyFormProps>) => {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [showManagerForm, setShowManagerForm] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const set =
    (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm(prev => ({ ...prev, [field]: e.target.value }));
      if (errors[field as keyof FormErrors]) {
        setErrors(prev => ({ ...prev, [field]: undefined }));
      }
    };

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!form.name.trim()) next.name = 'Property name is required.';
    if (!form.address.trim()) next.address = 'Address is required.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleManagerSave = (manager: Manager): void => {
    setManagers(prev => [...prev, manager]);
    setShowManagerForm(false);
  };

  const handleManagerRemove = (id: string): void => {
    setManagers(prev => prev.filter(m => m.id !== id));
  };

  const handleSubmit = async (): Promise<void> => {
    if (!validate()) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const expirationDate = dateToUnixTimestamp(form.expiration);

      const dbLease = await invoke<DbLease>('new_lease', {
        name: form.name.trim(),
        address: form.address.trim(),
        expirationDate,
        notes: form.notes.trim() || null,
        size: form.size.trim() || null,
      });

      // Create each manager and link to this lease
      for (const manager of managers) {
        await invoke('new_manager', {
          name: manager.name,
          leaseId: dbLease.id,
        });
      }

      const lease = dbLeaseToFrontend(dbLease, managers);
      onCreated(lease);
      setForm(EMPTY_FORM);
      onClose();
    } catch (err) {
      setSubmitError(
        typeof err === 'string' ? err : 'Failed to create property. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = (): void => {
    if (submitting) return;
    setForm(EMPTY_FORM);
    setManagers([]);
    setShowManagerForm(false);
    setErrors({});
    setSubmitError(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="New Property"
      footer={
        <>
          <Button type="button" $variant="outline" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" form="new-property-form" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create Property'}
          </Button>
        </>
      }
    >
      <form
        id="new-property-form"
        action={handleSubmit}
        noValidate
        style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}
      >
        <p className="lb-section-label">Property Details</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <label htmlFor="np-name" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
            Property Name *
          </label>
          <input
            id="np-name"
            className={`lb-form-input${errors.name ? ' error' : ''}`}
            value={form.name}
            onChange={set('name')}
            placeholder="e.g. Riverfront Plaza"
            autoFocus
          />
          {errors.name && (
            <span className="lb-error-msg" role="alert">
              {errors.name}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <label htmlFor="np-address" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
            Address *
          </label>
          <input
            id="np-address"
            className={`lb-form-input${errors.address ? ' error' : ''}`}
            value={form.address}
            onChange={set('address')}
            placeholder="123 Main St, City, State"
          />
          {errors.address && (
            <span className="lb-error-msg" role="alert">
              {errors.address}
            </span>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <label htmlFor="np-expiration" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
              Lease Expiration
            </label>
            <input
              id="np-expiration"
              type="date"
              className="lb-form-input"
              value={form.expiration}
              onChange={set('expiration')}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <label htmlFor="np-size" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
              Size
            </label>
            <input
              id="np-size"
              className="lb-form-input"
              value={form.size}
              onChange={set('size')}
              placeholder="e.g. 2,400 sqft"
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 600 }}>Managers</p>
          {managers.length > 0 && (
            <ul
              style={{
                listStyle: 'none',
                margin: '0 0 0.5rem',
                padding: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem',
              }}
            >
              {managers.map(m => (
                <li
                  key={m.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.4rem 0.65rem',
                    borderRadius: 'var(--lb-radius-md)',
                    background: 'var(--lb-surface)',
                    border: '1px solid var(--lb-border)',
                    fontSize: '0.875rem',
                  }}
                >
                  {m.name}
                  <button
                    type="button"
                    aria-label={`Remove ${m.name}`}
                    onClick={() => handleManagerRemove(m.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--lb-muted)',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      lineHeight: 1,
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLButtonElement).style.color = 'var(--lb-danger)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.color = 'var(--lb-muted)';
                    }}
                  >
                    <X style={{ height: 14, width: 14 }} />
                  </button>
                </li>
              ))}
            </ul>
          )}
          {showManagerForm ? (
            <div
              style={{
                border: '1px solid var(--lb-border)',
                borderRadius: 'var(--lb-radius-md)',
                padding: '1rem',
                background: 'var(--lb-surface)',
              }}
            >
              <ManagerForm
                onSave={handleManagerSave}
                onCancel={() => setShowManagerForm(false)}
              />
            </div>
          ) : (
            <Button type="button" $variant="outline" onClick={() => setShowManagerForm(true)}>
              + Add Manager
            </Button>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <label htmlFor="np-notes" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
            Notes
          </label>
          <textarea
            id="np-notes"
            className="lb-form-textarea"
            value={form.notes}
            onChange={set('notes')}
            placeholder="Any additional details…"
          />
        </div>

        {submitError && (
          <span className="lb-error-msg" role="alert">
            {submitError}
          </span>
        )}
      </form>
    </Modal>
  );
};

export default PropertyForm;
