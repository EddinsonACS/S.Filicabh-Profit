import { ConfirmationType } from '@/components/common/ConfirmationModal';
import { useState } from 'react';

interface ConfirmationConfig {
  type: ConfirmationType;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  sectionColor?: string;
}

export const useConfirmationModal = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [config, setConfig] = useState<ConfirmationConfig | null>(null);

  const showConfirmation = (confirmationConfig: ConfirmationConfig) => {
    setConfig(confirmationConfig);
    setIsVisible(true);
  };

  const showDeleteConfirmation = (
    entityName: string, 
    itemName: string, 
    onConfirm: () => void, 
    onCancel?: () => void,
    sectionColor?: string
  ) => {
    showConfirmation({
      type: 'warning',
      title: 'Confirmar eliminación',
      message: `¿Estás seguro de que quieres eliminar ${entityName} "${itemName}"? Esta acción no se puede deshacer.`,
      onConfirm,
      onCancel,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      sectionColor
    });
  };

  const handleConfirm = () => {
    config?.onConfirm();
    setIsVisible(false);
    setConfig(null);
  };

  const handleCancel = () => {
    config?.onCancel?.();
    setIsVisible(false);
    setConfig(null);
  };

  return {
    isVisible,
    config,
    showConfirmation,
    showDeleteConfirmation,
    handleConfirm,
    handleCancel
  };
}; 