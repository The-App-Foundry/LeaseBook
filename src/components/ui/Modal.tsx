import { ReactNode } from 'react';
import { Modal as BsModal } from 'react-bootstrap';
import './Modal.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children?: ReactNode;
  /** Optional footer content — typically action buttons (Cancel / Save). */
  footer?: ReactNode;
}

const Modal = ({ isOpen, onClose, title, children, footer }: Readonly<ModalProps>) => (
  <BsModal show={isOpen} onHide={onClose} centered keyboard>
    <BsModal.Header closeButton>
      <BsModal.Title className="lb-modal-title">{title}</BsModal.Title>
    </BsModal.Header>

    <BsModal.Body>{children}</BsModal.Body>

    {footer && <BsModal.Footer>{footer}</BsModal.Footer>}
  </BsModal>
);

export default Modal;
