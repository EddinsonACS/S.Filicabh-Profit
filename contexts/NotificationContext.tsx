import { NotificationType } from '@/components/common/NotificationSystem';
import { NotificationData, useNotifications } from '@/hooks/common/useNotifications';
import React, { createContext, ReactNode, useContext } from 'react';

interface NotificationContextType {
    notifications: NotificationData[];
    addNotification: (type: NotificationType, title: string, message: string, duration?: number, customColor?: string) => void;
    removeNotification: (id: string) => void;
    showSuccess: (title: string, message: string, duration?: number) => void;
    showError: (title: string, message: string, duration?: number) => void;
    showWarning: (title: string, message: string, duration?: number) => void;
    showInfo: (title: string, message: string, duration?: number) => void;
    showCreateSuccess: (entityName: string) => void;
    showUpdateSuccess: (entityName: string) => void;
    showDeleteSuccess: (entityName: string) => void;
    showCreateError: (entityName: string) => void;
    showUpdateError: (entityName: string) => void;
    showDeleteError: (entityName: string) => void;
    showLoadError: (entityName: string) => void;
    showConfirmation: (title: string, message: string, onConfirm: () => void, onCancel?: () => void, confirmText?: string, cancelText?: string) => void;
    showDeleteConfirmation: (entityName: string, itemName: string, onConfirm: () => void, onCancel?: () => void) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
    children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const notificationHook = useNotifications();

    return (
        <NotificationContext.Provider value={notificationHook}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotificationContext = (): NotificationContextType => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotificationContext debe ser usado dentro de un NotificationProvider');
    }
    return context;
}; 