import type { ReactNode } from 'react';

import { create } from 'zustand';

import type { UIComponentSize } from '@/types/ui';

type ModalDescriptor = {
  title?: ReactNode;
  size?: UIComponentSize;
  className?: string;
  children?: ReactNode;

  confirmText?: ReactNode;
  cancelText?: ReactNode;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
  hideCancel?: boolean;
  confirmDisabled?: boolean;
  confirmLoading?: boolean;
};

type GlobalModalState = {
  isOpen: boolean;
  props: ModalDescriptor;
  openModal: (props: ModalDescriptor) => void;
  closeModal: () => void;
  reset: () => void;
};

export const useGlobalModalStore = create<GlobalModalState>((set, get) => ({
  isOpen: false,
  props: {},
  openModal: (props) => set({ isOpen: true, props }),
  closeModal: () => {
    set({ isOpen: false });
    get().reset();
  },
  reset: () => set({ props: {} }),
}));
