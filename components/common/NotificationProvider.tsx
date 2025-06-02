import { NotificationProvider, useNotificationContext } from '@/contexts/NotificationContext';
import React, { ReactNode } from 'react';
import NotificationSystem from './NotificationSystem';

interface AppNotificationProviderProps {
    children: ReactNode;
}

const NotificationSystemWrapper: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { notifications, removeNotification } = useNotificationContext();

    return (
        <>
            {children}
            <NotificationSystem 
                notifications={notifications}
                onDismiss={removeNotification}
            />
        </>
    );
};

export const AppNotificationProvider: React.FC<AppNotificationProviderProps> = ({ children }) => {
    return (
        <NotificationProvider>
            <NotificationSystemWrapper>
                {children}
            </NotificationSystemWrapper>
        </NotificationProvider>
    );
}; 