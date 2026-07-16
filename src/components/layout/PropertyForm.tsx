import { ChangeEvent, FC, ReactElement, useEffect, useRef, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import type { Lease, Manager } from '../../types/lease';
import './PropertyForm.css';

interface PropertyFormProps {
  onClose: () => void;
  onCreated: (lease: Lease) => void;
  initial?: Lease;
}

interface DbLease {
  id: number;
  name: string;
  address: string | null;
  size: number | null;
  expiration_date: number | null;
  notes: string | null;
  misc_data: string | null;
}

interface FormErrors {
  name?: string;
  address?: string;
}

const STAGE_OPTIONS = ['New', 'Contacted', 'Qualified', 'Negotiating', 'Won', 'Lost'];

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
  let stat: 'qualified' | 'prospect';
  if (db.name && managers.length > 0 && db.address) {
    stat = 'qualified';
  } else {
    stat = 'prospect';
  }
  return {
    id: db.id,
    status: stat,
    name: db.name,
    businessAddr: db.address ?? undefined,
    leaseExpiration: expirationIso,
    leaseManager: managers[0]?.name ?? '',
    managers,
    size: db.size?.toString() ?? '',
    note: db.notes ?? undefined,
  };
};



// Layout & Styles matching Prototype


const PropertyForm: FC<PropertyFormProps> = ({ initial, onClose, onCreated }): ReactElement => {
  const [name, setName] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [stage, setStage] = useState<string>('New');
  const [size, setSize] = useState<string>('');
  const [decisionMaker, setDecisionMaker] = useState<string>('');
  const [expiration, setExpiration] = useState<string>('');
  const [decisionEmail, setDecisionEmail] = useState<string>('');
  const [decisionPhone, setDecisionPhone] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const editting = !!initial;
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initial) {
      setName(initial.name);
      setAddress(initial.businessAddr ?? '');
      setStage(initial.status === 'qualified' ? 'Qualified' : 'New'); // Map status appropriately
      setSize(initial.size ?? '');
      setExpiration(initial.leaseExpiration ?? '');
      setNotes(initial.note ?? '');

      if (initial.managers && initial.managers.length > 0) {
        const mgr = initial.managers[0];
        setDecisionMaker(mgr.name ?? '');
        setDecisionEmail(mgr.email ?? '');
        setDecisionPhone(mgr.phoneNumbers?.[0] ?? '');
      }
    }
  }, [initial]);

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  const validateOnSubmit = (): boolean => {
    const next: FormErrors = {};
    if (!name.trim()) next.name = 'Company Name is required.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleBlur = (e: ChangeEvent<HTMLInputElement>): void => {
    if (e.target.id === 'f-name' && !name.trim()) {
      setErrors(prev => ({ ...prev, name: 'Company Name is required.' }));
    }
  };

  const handleSubmit = async (): Promise<void> => {
    if (!validateOnSubmit()) return;

    setSubmitting(true);
    setSubmitError(null);

    let expirationDate = dateToUnixTimestamp(expiration);

    try {
      let dbLease: DbLease;
      let finalManagers: Manager[] = [];

      if (editting) {
        dbLease = await invoke<DbLease>('edit_lease', {
          leaseId: initial.id,
          changes: {
            name: name.trim(),
            address: address.trim() || null,
            size: size.trim() || null,
            expirationDate,
            notes: notes.trim() || null,
            lastModified: Date.now(),
          },
        });
        
        if (initial.managers && initial.managers.length > 0) {
          finalManagers = initial.managers; 
        } else if (decisionMaker.trim()) {
          const manager = await invoke<Manager>('new_manager', {
            name: decisionMaker.trim(),
            leaseId: dbLease.id,
          });
          
          if (decisionEmail.trim() || decisionPhone.trim()) {
            await invoke('edit_manager', {
              managerId: manager.id,
              changes: {
                email: decisionEmail.trim() || null,
                phoneNumbers: decisionPhone.trim() ? [decisionPhone.trim()] : null,
                lastModified: Date.now(),
              }
            });
          }

          finalManagers = [{
            id: manager.id,
            name: decisionMaker.trim(),
            email: decisionEmail.trim(),
            phoneNumbers: decisionPhone.trim() ? [decisionPhone.trim()] : [],
            verified: true,
          }];
        }
      } else {
        dbLease = await invoke<DbLease>('new_lease', {
          name: name.trim(),
          address: address.trim() || null,
          expirationDate,
          notes: notes.trim() || null,
          size: size.trim() || null,
        });

        if (decisionMaker.trim()) {
          const manager = await invoke<Manager>('new_manager', {
            name: decisionMaker.trim(),
            leaseId: dbLease.id,
          });

          if (decisionEmail.trim() || decisionPhone.trim()) {
            await invoke('edit_manager', {
              managerId: manager.id,
              changes: {
                email: decisionEmail.trim() || null,
                phoneNumbers: decisionPhone.trim() ? [decisionPhone.trim()] : null,
                lastModified: Date.now(),
              }
            });
          }

          finalManagers = [{
            id: manager.id,
            name: decisionMaker.trim(),
            email: decisionEmail.trim(),
            phoneNumbers: decisionPhone.trim() ? [decisionPhone.trim()] : [],
            verified: true,
          }];
        }
      }

      const lease = dbLeaseToFrontend(dbLease, finalManagers);
      onCreated(lease);
      onClose();
    } catch (err) {
      setSubmitError(
        typeof err === 'string' ? err : 'Failed to save property. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = (): void => {
    if (submitting) return;
    onClose();
  };

  return (
    <div className="lb-form-overlay">
      <form 
        className="lb-form-container"
        onSubmit={e => {
          e.preventDefault();
          handleSubmit();
        }}
        noValidate
      >
        <h2 className="lb-form-title">{editting ? 'Edit Property' : 'New Property'}</h2>

        <div className="lb-form-grid">
          <div className="lb-form-full-width">
            <label htmlFor="f-name" className="lb-form-label">Company Name</label>
            <input
              ref={nameInputRef}
              id="f-name"
              className={`lb-form-input${errors.name ? ' lb-form-input-error' : ''}`}
              value={name}
              onChange={e => {
                setName(e.target.value);
                if (errors.name) setErrors({});
              }}
              onBlur={handleBlur}
            />
            {errors.name && <span className="lb-form-error-msg">{errors.name}</span>}
          </div>
          
          <div className="lb-form-full-width">
            <label htmlFor="f-address" className="lb-form-label">Address</label>
            <input
              id="f-address"
              className="lb-form-input"
              value={address}
              onChange={e => setAddress(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="f-stage" className="lb-form-label">Pipeline Stage</label>
            <select
              id="f-stage"
              className="lb-form-input lb-form-select"
              value={stage}
              onChange={e => setStage(e.target.value)}
            >
              {STAGE_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="f-size" className="lb-form-label">Property Size</label>
            <input
              id="f-size"
              className="lb-form-input"
              placeholder="e.g. 12,500 sq ft"
              value={size}
              onChange={e => setSize(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="f-dm" className="lb-form-label">Decision Maker</label>
            <input
              id="f-dm"
              className="lb-form-input"
              value={decisionMaker}
              onChange={e => setDecisionMaker(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="f-exp" className="lb-form-label">Lease Expiration</label>
            <input
              id="f-exp"
              type="date"
              className="lb-form-input"
              placeholder="e.g. Dec 14, 2025"
              value={expiration}
              onChange={e => {
                setExpiration(e.target.value);
                if (e.target.value) e.target.blur();
              }}
            />
          </div>

          <div>
            <label htmlFor="f-email" className="lb-form-label">Decision Maker Email</label>
            <input
              id="f-email"
              type="email"
              className="lb-form-input"
              value={decisionEmail}
              onChange={e => setDecisionEmail(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="f-phone" className="lb-form-label">Decision Maker Phone</label>
            <input
              id="f-phone"
              type="tel"
              className="lb-form-input"
              value={decisionPhone}
              onChange={e => setDecisionPhone(e.target.value)}
            />
          </div>

          <div className="lb-form-full-width">
            <label htmlFor="f-notes" className="lb-form-label">Notes</label>
            <textarea
              id="f-notes"
              className="lb-form-input lb-form-textarea"
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>
        </div>

        {submitError && (
          <span className="lb-form-submit-error">{submitError}</span>
        )}

        <div className="lb-form-btn-row">
          <button type="button" onClick={handleClose} disabled={submitting} className="lb-form-cancel-btn">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="lb-form-save-btn" style={{ opacity: submitting ? 0.7 : 1 }}>
            {submitting ? 'Saving...' : 'Save Property'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PropertyForm;
