import { useState } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import type { Manager } from '../../types/lease';
import Modal from '../ui/Modal';
import { Button } from '../ui';
import ManagerForm from './ManagerForm';

interface LeaseManagersModalProps {
  isOpen: boolean;
  onClose: () => void;
  managers: Manager[];
  onUpdate: (managers: Manager[]) => void;
}

const LeaseManagersModal = ({
  isOpen,
  onClose,
  managers,
  onUpdate,
}: Readonly<LeaseManagersModalProps>) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const handleSave = (updated: Manager) => {
    if (editingId) {
      onUpdate(managers.map(m => (m.id === editingId ? updated : m)));
      setEditingId(null);
    } else {
      onUpdate([...managers, updated]);
      setIsAdding(false);
    }
  };

  const handleDelete = (id: string) => {
    onUpdate(managers.filter(m => m.id !== id));
  };

  const handleClose = () => {
    setEditingId(null);
    setIsAdding(false);
    onClose();
  };

  const editingManager = editingId ? managers.find(m => m.id === editingId) : undefined;

  // Show form when editing or adding
  if (editingId && editingManager) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title="Edit Lease Manager">
        <ManagerForm
          initial={editingManager}
          onSave={handleSave}
          onCancel={() => setEditingId(null)}
        />
      </Modal>
    );
  }

  if (isAdding) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title="Add Lease Manager">
        <ManagerForm onSave={handleSave} onCancel={() => setIsAdding(false)} />
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Lease Managers"
      footer={
        <Button onClick={() => setIsAdding(true)}>
          <Plus size={15} /> Add
        </Button>
      }
    >
      {managers.length === 0 ? (
        <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#6b7280', padding: '1rem 0', margin: 0 }}>
          No lease managers yet.
        </p>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {managers.map(m => (
            <li
              key={m.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.6rem 0.75rem',
                border: '1px solid var(--lb-border)',
                borderRadius: 'var(--lb-radius-md)',
                background: 'var(--lb-surface)',
              }}
            >
              <span
                style={{
                  flex: 1,
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: m.verified ? 'var(--lb-text)' : 'var(--lb-danger)',
                }}
              >
                {m.name}
              </span>
              {m.phone && (
                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{m.phone}</span>
              )}
              {m.email && (
                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{m.email}</span>
              )}
              <button
                className="lb-icon-btn"
                onClick={() => setEditingId(m.id)}
                aria-label={`Edit ${m.name}`}
              >
                <Pencil size={14} />
              </button>
              <button
                className="lb-icon-btn"
                onClick={() => handleDelete(m.id)}
                aria-label={`Delete ${m.name}`}
              >
                <Trash2 size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
};

export default LeaseManagersModal;
