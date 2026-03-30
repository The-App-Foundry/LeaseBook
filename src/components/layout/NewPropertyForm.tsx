import { useState } from 'react';
import styled from 'styled-components';
import { invoke } from '@tauri-apps/api/core';
import { Modal, Button } from '../ui';
import type { Lease, Manager } from '../../types/lease';

interface NewPropertyFormProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (lease: Lease) => void;
}

interface DbLease {
  id: number;
  name: string;
  address: string;
  expiration_date: number | null;
  notes: string | null;
  misc_data: string | null;
}

interface FormState {
  name: string;
  address: string;
  expiration: string;
  managerName: string;
  size: string;
  notes: string;
}

interface FormErrors {
  name?: string;
  address?: string;
}

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
`;

const Label = styled.label`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const Input = styled.input<{ $hasError?: boolean }>`
  border: 1px solid
    ${({ theme, $hasError }) => ($hasError ? theme.colors.danger : theme.colors.border)};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 0.5rem 0.65rem;
  font-size: 0.875rem;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  width: 100%;
  box-sizing: border-box;

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px
      ${({ theme, $hasError }) => ($hasError ? theme.colors.danger : theme.colors.primary)};
  }
`;

const Textarea = styled.textarea`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 0.5rem 0.65rem;
  font-size: 0.875rem;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  width: 100%;
  box-sizing: border-box;
  resize: vertical;
  min-height: 80px;
  font-family: inherit;

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary};
  }
`;

const ErrorMsg = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.danger};
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
`;

const SectionLabel = styled.p`
  margin: 0 0 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${({ theme }) => theme.colors.muted};
`;

/**
 * Converts an ISO date string (YYYY-MM-DD) to a Unix timestamp (seconds).
 * Returns null if the input is empty or invalid.
 */
function dateToUnixTimestamp(dateStr: string): number | null {
  if (!dateStr) return null;
  const ms = Date.parse(dateStr);
  return Number.isNaN(ms) ? null : Math.floor(ms / 1000);
}

/**
 * Converts a Unix timestamp (seconds) to an ISO date string (YYYY-MM-DD).
 */
function unixTimestampToIso(ts: number): string {
  return new Date(ts * 1000).toISOString().split('T')[0];
}

function dbLeaseToFrontend(db: DbLease, managerName?: string): Lease {
  const expirationIso = db.expiration_date ? unixTimestampToIso(db.expiration_date) : '';
  const isExpired = db.expiration_date ? db.expiration_date * 1000 < Date.now() : false;

  const managers: Manager[] = managerName
    ? [{ id: String(db.id), name: managerName, verified: false }]
    : [];

  return {
    status: isExpired ? 'prospect' : 'qualified',
    name: db.name,
    businessAddr: db.address,
    leaseExpiration: expirationIso,
    leaseManager: managerName ?? '',
    managers,
    size: db.misc_data ?? '',
    note: db.notes ?? undefined,
  };
}

const EMPTY_FORM: FormState = {
  name: '',
  address: '',
  expiration: '',
  managerName: '',
  size: '',
  notes: '',
};

export default function NewPropertyForm({
  isOpen,
  onClose,
  onCreated,
}: Readonly<NewPropertyFormProps>) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
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

  function validate(): boolean {
    const next: FormErrors = {};
    if (!form.name.trim()) next.name = 'Property name is required.';
    if (!form.address.trim()) next.address = 'Address is required.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
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

      // Optionally create a manager and link to this lease
      if (form.managerName.trim()) {
        await invoke('new_manager', {
          name: form.managerName.trim(),
          leaseId: dbLease.id,
        });
      }

      const lease = dbLeaseToFrontend(dbLease, form.managerName.trim() || undefined);
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
  }

  function handleClose() {
    if (submitting) return;
    setForm(EMPTY_FORM);
    setErrors({});
    setSubmitError(null);
    onClose();
  }

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
      <Form id="new-property-form" onSubmit={handleSubmit} noValidate>
        <SectionLabel>Property Details</SectionLabel>

        <Field>
          <Label htmlFor="np-name">Property Name *</Label>
          <Input
            id="np-name"
            value={form.name}
            onChange={set('name')}
            placeholder="e.g. Riverfront Plaza"
            $hasError={!!errors.name}
            autoFocus
          />
          {errors.name && <ErrorMsg role="alert">{errors.name}</ErrorMsg>}
        </Field>

        <Field>
          <Label htmlFor="np-address">Address *</Label>
          <Input
            id="np-address"
            value={form.address}
            onChange={set('address')}
            placeholder="123 Main St, City, State"
            $hasError={!!errors.address}
          />
          {errors.address && <ErrorMsg role="alert">{errors.address}</ErrorMsg>}
        </Field>

        <Row>
          <Field>
            <Label htmlFor="np-expiration">Lease Expiration</Label>
            <Input
              id="np-expiration"
              type="date"
              value={form.expiration}
              onChange={set('expiration')}
            />
          </Field>
          <Field>
            <Label htmlFor="np-size">Size</Label>
            <Input
              id="np-size"
              value={form.size}
              onChange={set('size')}
              placeholder="e.g. 2,400 sqft"
            />
          </Field>
        </Row>

        <Field>
          <Label htmlFor="np-manager">Manager Name</Label>
          <Input
            id="np-manager"
            value={form.managerName}
            onChange={set('managerName')}
            placeholder="Full name"
          />
        </Field>

        <Field>
          <Label htmlFor="np-notes">Notes</Label>
          <Textarea
            id="np-notes"
            value={form.notes}
            onChange={set('notes')}
            placeholder="Any additional details…"
          />
        </Field>

        {submitError && <ErrorMsg role="alert">{submitError}</ErrorMsg>}
      </Form>
    </Modal>
  );
}
