import { NotificationType } from '@/components/common/NotificationSystem';
import { getCurrentSection, getCurrentSectionColor, SectionType } from '@/utils/colorManager';
import { usePathname } from 'expo-router';
import { useCallback, useState } from 'react';

export interface NotificationData {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    sectionColor: string;
    duration?: number;
    isConfirmation?: boolean;
    onConfirm?: () => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
}

export const useNotifications = () => {
    const [notifications, setNotifications] = useState<NotificationData[]>([]);
    const pathname = usePathname();

    // Detectar automáticamente el color de la sección actual usando directamente el colorManager
    const getSectionColor = useCallback((): string => {
        // Usar directamente la función del colorManager que ya maneja todas las subsecciones correctamente
        const color = getCurrentSectionColor(pathname);
        
        // Debug temporal para verificar detección de rutas
        console.log('🎨 NotificationColor Debug:', {
            pathname,
            detectedColor: color,
            section: getCurrentSection(pathname)
        });
        
        return color;
    }, [pathname]);

    // Detectar la sección específica para personalizar mejor las notificaciones
    const getSectionType = useCallback((): SectionType => {
        return getCurrentSection(pathname);
    }, [pathname]);

    const addNotification = useCallback((
        type: NotificationType,
        title: string,
        message: string,
        duration: number = 4000,
        customColor?: string
    ) => {
        const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        const sectionColor = customColor || getSectionColor();
        
        const notification: NotificationData = {
            id,
            type,
            title,
            message,
            sectionColor,
            duration
        };

        setNotifications(prev => [...prev, notification]);

        // Auto remove after duration + animation time if not a confirmation
        if (duration > 0) {
            setTimeout(() => {
                removeNotification(id);
            }, duration + 500);
        }
    }, [getSectionColor]);

    const removeNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
    }, []);

    // Métodos de conveniencia para diferentes tipos de notificaciones
    const showSuccess = useCallback((title: string, message: string, duration?: number) => {
        addNotification('success', title, message, duration || 3000, getSectionColor());
    }, [addNotification, getSectionColor]);

    const showError = useCallback((title: string, message: string, duration?: number) => {
        // Los errores mantienen su color rojo, no usan color de sección
        addNotification('error', title, message, duration || 5000);
    }, [addNotification]);

    const showWarning = useCallback((title: string, message: string, duration?: number) => {
        addNotification('warning', title, message, duration || 4000, getSectionColor());
    }, [addNotification, getSectionColor]);

    const showInfo = useCallback((title: string, message: string, duration?: number) => {
        addNotification('info', title, message, duration || 4000, getSectionColor());
    }, [addNotification, getSectionColor]);

    // Métodos específicos para operaciones CRUD comunes con mejor UX
    const showCreateSuccess = useCallback((entityName: string) => {
        addNotification('success', '¡Creado!', `${entityName} se ha creado correctamente.`, 3000, getSectionColor());
    }, [addNotification, getSectionColor]);

    const showUpdateSuccess = useCallback((entityName: string) => {
        addNotification('success', '¡Actualizado!', `${entityName} se ha actualizado correctamente.`, 3000, getSectionColor());
    }, [addNotification, getSectionColor]);

    const showDeleteSuccess = useCallback((entityName: string) => {
        addNotification('success', '¡Eliminado!', `${entityName} se ha eliminado correctamente.`, 3000, getSectionColor());
    }, [addNotification, getSectionColor]);

    const showCreateError = useCallback((entityName: string) => {
        // Los errores mantienen su color rojo
        addNotification('error', 'Error al crear', `No se pudo crear ${entityName}. Por favor, intente nuevamente.`, 5000);
    }, [addNotification]);

    const showUpdateError = useCallback((entityName: string) => {
        // Los errores mantienen su color rojo
        addNotification('error', 'Error al actualizar', `No se pudo actualizar ${entityName}. Por favor, intente nuevamente.`, 5000);
    }, [addNotification]);

    const showDeleteError = useCallback((entityName: string) => {
        // Los errores mantienen su color rojo
        addNotification('error', 'Error al eliminar', `No se pudo eliminar ${entityName}. Por favor, intente nuevamente.`, 5000);
    }, [addNotification]);

    const showLoadError = useCallback((entityName: string) => {
        // Los errores mantienen su color rojo
        addNotification('error', 'Error al cargar', `No se pudo cargar ${entityName}. Por favor, intente nuevamente.`, 5000);
    }, [addNotification]);

    // Método para mostrar confirmación personalizada usando el color de sección
    const showConfirmation = useCallback((
        title: string,
        message: string,
        onConfirm: () => void,
        onCancel?: () => void,
        confirmText: string = 'Confirmar',
        cancelText: string = 'Cancelar'
    ) => {
        const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        const sectionColor = getSectionColor();
        
        const notification: NotificationData = {
            id,
            type: 'info', // Cambiar de 'warning' a 'info' para usar color de sección
            title,
            message,
            sectionColor,
            duration: 0, // No se auto-oculta
            isConfirmation: true,
            onConfirm,
            onCancel,
            confirmText,
            cancelText
        };

        setNotifications(prev => [...prev, notification]);
    }, [getSectionColor]);

    // Método específico para confirmación de eliminación con mejor UX
    const showDeleteConfirmation = useCallback((
        entityName: string,
        itemName: string,
        onConfirm: () => void,
        onCancel?: () => void
    ) => {
        showConfirmation(
            'Confirmar eliminación',
            `¿Estás seguro de eliminar "${itemName}"?\n\nEsta acción no se puede deshacer.`,
            onConfirm,
            onCancel,
            'Eliminar',
            'Cancelar'
        );
    }, [showConfirmation]);

    // Método para limpiar todas las notificaciones
    const clearAllNotifications = useCallback(() => {
        setNotifications([]);
    }, []);

    return {
        notifications,
        addNotification,
        removeNotification,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        showCreateSuccess,
        showUpdateSuccess,
        showDeleteSuccess,
        showCreateError,
        showUpdateError,
        showDeleteError,
        showLoadError,
        showConfirmation,
        showDeleteConfirmation,
        clearAllNotifications,
        getSectionColor,
        getSectionType
    };
}; 