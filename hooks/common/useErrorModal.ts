import { ErrorType } from '@/components/common/ErrorModal';
import { useCallback, useState } from 'react';

interface ErrorConfig {
  type: ErrorType;
  title: string;
  message: string;
  buttonText?: string;
  sectionColor?: string;
}

export const useErrorModal = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [config, setConfig] = useState<ErrorConfig | null>(null);

  const showError = useCallback((
    title: string,
    message: string,
    buttonText: string = 'Entendido',
    sectionColor?: string
  ) => {
    setConfig({
      type: 'error',
      title,
      message,
      buttonText,
      sectionColor
    });
    setIsVisible(true);
  }, []);

  const showWarning = useCallback((
    title: string,
    message: string,
    buttonText: string = 'Entendido',
    sectionColor?: string
  ) => {
    setConfig({
      type: 'warning',
      title,
      message,
      buttonText,
      sectionColor
    });
    setIsVisible(true);
  }, []);

  const showInfo = useCallback((
    title: string,
    message: string,
    buttonText: string = 'Entendido',
    sectionColor?: string
  ) => {
    setConfig({
      type: 'info',
      title,
      message,
      buttonText,
      sectionColor
    });
    setIsVisible(true);
  }, []);

  const hideError = useCallback(() => {
    setIsVisible(false);
    // Limpiar config después de la animación
    setTimeout(() => {
      setConfig(null);
    }, 300);
  }, []);

  // Método de conveniencia para errores de eliminación
  const showDeleteError = useCallback((
    entityName: string,
    errorMessage?: string,
    sectionColor?: string
  ) => {
    const defaultMessage = `No se pudo eliminar ${entityName}. Por favor, intente nuevamente.`;
    showError(
      'Error al eliminar',
      errorMessage || defaultMessage,
      'Entendido',
      sectionColor
    );
  }, [showError]);

  // Método de conveniencia para errores de creación
  const showCreateError = useCallback((
    entityName: string,
    errorMessage?: string,
    sectionColor?: string
  ) => {
    const defaultMessage = `No se pudo crear ${entityName}. Por favor, intente nuevamente.`;
    showError(
      'Error al crear',
      errorMessage || defaultMessage,
      'Entendido',
      sectionColor
    );
  }, [showError]);

  // Método de conveniencia para errores de actualización
  const showUpdateError = useCallback((
    entityName: string,
    errorMessage?: string,
    sectionColor?: string
  ) => {
    const defaultMessage = `No se pudo actualizar ${entityName}. Por favor, intente nuevamente.`;
    showError(
      'Error al actualizar',
      errorMessage || defaultMessage,
      'Entendido',
      sectionColor
    );
  }, [showError]);

  return {
    isVisible,
    config,
    showError,
    showWarning,
    showInfo,
    showDeleteError,
    showCreateError,
    showUpdateError,
    hideError
  };
}; 