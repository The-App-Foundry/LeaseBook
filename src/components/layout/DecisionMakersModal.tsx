import { useState } from 'react';
import styled from 'styled-components';
import { Pencil, Trash2, Plus } from 'lucide-react';
import type { Manager } from '../../types/lease';
import Modal from '../ui/Modal';
import { Button } from '../ui';
import ManagerForm from './ManagerForm';

interface DecisionMakersModalProps {
  isOpen: boolean;
  onClose: () => void;
  managers: Manager[];
  onUpdate: (managers: Manager[]) => void;
}

const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Row = styled.li`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.surface};
`;

const NameText = styled.span<{ $verified: boolean }>`
  flex: 1;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ $verified, theme }) => ($verified ? theme.colors.text : theme.colors.danger)};
`;

const Detail = styled.span`
  font-size: 0.75rem;
  color: #6b7280;
`;

const IconBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  padding: 0;
  border: none;
  background: transparent;
  border-radius: ${({ theme }) => theme.radii.sm};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  transition: background 150ms ease;

  &:hover {
    background: ${({ theme }) => theme.colors.muted};
  }
`;

const EmptyState = styled.p`
  text-align: center;
  font-size: 0.85rem;
  color: #6b7280;
  padding: 1rem 0;
`;

export default function DecisionMakersModal({
  isOpen,
  onClose,
  managers,
  onUpdate,
}: Readonly<DecisionMakersModalProps>) {
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
      <Modal isOpen={isOpen} onClose={handleClose} title="Edit Decision Maker">
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
      <Modal isOpen={isOpen} onClose={handleClose} title="Add Decision Maker">
        <ManagerForm onSave={handleSave} onCancel={() => setIsAdding(false)} />
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Decision Makers"
      footer={
        <Button onClick={() => setIsAdding(true)}>
          <Plus size={15} /> Add
        </Button>
      }
    >
      {managers.length === 0 ? (
        <EmptyState>No decision makers yet.</EmptyState>
      ) : (
        <List>
          {managers.map(m => (
            <Row key={m.id}>
              <NameText $verified={m.verified}>{m.name}</NameText>
              {m.phone && <Detail>{m.phone}</Detail>}
              {m.email && <Detail>{m.email}</Detail>}
              <IconBtn onClick={() => setEditingId(m.id)} aria-label={`Edit ${m.name}`}>
                <Pencil size={14} />
              </IconBtn>
              <IconBtn onClick={() => handleDelete(m.id)} aria-label={`Delete ${m.name}`}>
                <Trash2 size={14} />
              </IconBtn>
            </Row>
          ))}
        </List>
      )}
    </Modal>
  );
}
