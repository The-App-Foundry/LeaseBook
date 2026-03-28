import { useState } from 'react';
import styled from 'styled-components';
import type { Manager } from '../../types/lease';
import { Button } from '../ui';

interface ManagerFormProps {
  initial?: Manager;
  onSave: (manager: Manager) => void;
  onCancel: () => void;
}

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const Label = styled.label`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const Input = styled.input`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 0.5rem 0.65rem;
  font-size: 0.875rem;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary};
  }
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 0.5rem;
`;

export default function ManagerForm({ initial, onSave, onCancel }: Readonly<ManagerFormProps>) {
  const [name, setName] = useState(initial?.name ?? '');
  const [phone, setPhone] = useState(initial?.phone ?? '');
  const [email, setEmail] = useState(initial?.email ?? '');

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      id: initial?.id ?? `mgr-${Date.now()}`,
      name: name.trim(),
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      verified: true,
    });
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Field>
        <Label htmlFor="mgr-name">Name *</Label>
        <Input
          id="mgr-name"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Full name"
          required
          autoFocus
        />
      </Field>
      <Field>
        <Label htmlFor="mgr-phone">Phone</Label>
        <Input
          id="mgr-phone"
          type="tel"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder="555-123-4567"
        />
      </Field>
      <Field>
        <Label htmlFor="mgr-email">Email</Label>
        <Input
          id="mgr-email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="name@example.com"
        />
      </Field>
      <Actions>
        <Button type="button" $variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{initial ? 'Update' : 'Create'}</Button>
      </Actions>
    </Form>
  );
}
