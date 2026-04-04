import { useState } from 'react';
import type { Manager } from '../../types/lease';
import { Button } from '../ui';

interface ManagerFormProps {
  initial?: Manager;
  onSave: (manager: Manager) => void;
  onCancel: () => void;
}

const ManagerForm = ({ initial, onSave, onCancel }: Readonly<ManagerFormProps>) => {
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
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <label htmlFor="mgr-name" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
          Name *
        </label>
        <input
          id="mgr-name"
          className="lb-form-input"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Full name"
          required
          autoFocus
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <label htmlFor="mgr-phone" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
          Phone
        </label>
        <input
          id="mgr-phone"
          type="tel"
          className="lb-form-input"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder="555-123-4567"
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <label htmlFor="mgr-email" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
          Email
        </label>
        <input
          id="mgr-email"
          type="email"
          className="lb-form-input"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="name@example.com"
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.5rem' }}>
        <Button type="button" $variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{initial ? 'Update' : 'Create'}</Button>
      </div>
    </form>
  );
};

export default ManagerForm;
