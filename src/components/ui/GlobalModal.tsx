import Modal from '@components/ui/Modal';
import { useGlobalModalStore } from '@store/modal.store';

function GlobalModal() {
  const { isOpen, props, closeModal } = useGlobalModalStore();

  const handleClose = props.onCancel ?? closeModal;

  return <Modal open={isOpen} onClose={handleClose} {...props} />;
}

export default GlobalModal;
