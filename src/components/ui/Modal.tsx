import { useEffect, useRef } from 'react';

import { AnimatePresence, motion } from 'motion/react';
import { createPortal } from 'react-dom';

import type { UIComponentSize } from '@/types/ui';
import Button from '@components/ui/Button';
import useClickOutside from '@hooks/useClickOutside';
import { cn } from '@utils/cn';

type ModalProps = {
  open: boolean;
  onClose: () => void;

  title?: React.ReactNode;
  size?: UIComponentSize;
  className?: string;
  children?: React.ReactNode;

  confirmText?: React.ReactNode;
  cancelText?: React.ReactNode;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
  hideCancel?: boolean;
  confirmDisabled?: boolean;
  confirmLoading?: boolean;
};

function getSizeClass(size: ModalProps['size']) {
  switch (size) {
    case 'sm':
      return 'max-w-sm';
    case 'md':
      return 'max-w-md';
    case 'lg':
      return 'max-w-lg';
    default:
      return 'max-w-lg';
  }
}

function Modal({
  open,
  onClose,
  title,
  size,
  className,
  children,
  confirmText = '확인',
  cancelText = '취소',
  onConfirm,
  onCancel,
  hideCancel = false,
  confirmDisabled = false,
  confirmLoading = false,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const confirmBtnRef = useRef<HTMLButtonElement>(null!);
  const titleIdRef = useRef(
    `modal-title-${Math.random().toString(36).slice(2)}`,
  );

  // 스크롤 락
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // 외부 클릭 감지
  useClickOutside({
    enabled: open,
    refs: [panelRef],
    onClickOutside: () => onClose(),
  });

  // 포털 대상 보장
  const portalTarget = typeof window !== 'undefined' ? document.body : null;
  if (!portalTarget) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          ref={overlayRef}
          className={`fixed inset-0 z-[1000] grid place-items-center bg-black/40`}
          aria-hidden={false}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            role='dialog'
            aria-modal='true'
            aria-labelledby={title ? titleIdRef.current : undefined}
            ref={panelRef}
            tabIndex={-1}
            className={cn(
              'w-[92vw] rounded-2xl bg-white p-6 shadow-xl outline-none',
              getSizeClass(size),
              className,
            )}
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 16, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          >
            {title && (
              <h2
                id={titleIdRef.current}
                className='text-lg leading-6 font-semibold'
              >
                {title}
              </h2>
            )}

            <div className={`mt-2 ${title ? 'pt-1' : ''}`}>{children}</div>

            <div className='mt-6 flex items-center justify-end gap-2'>
              {!hideCancel && (
                <Button variant='ghost' onClick={onCancel ?? onClose}>
                  {cancelText}
                </Button>
              )}
              <Button
                ref={confirmBtnRef}
                onClick={onConfirm}
                disabled={confirmDisabled || confirmLoading}
              >
                {confirmLoading ? '처리 중…' : confirmText}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    portalTarget,
  );
}

export default Modal;
