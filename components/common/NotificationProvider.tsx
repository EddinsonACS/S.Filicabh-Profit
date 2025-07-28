import { NotificationProvider, useNotificationContext } from '@/contexts/NotificationContext';
import React, { ReactNode } from 'react';
import { View } from 'react-native';
import NotificationSystem from './NotificationSystem';

interface AppNotificationProviderProps {
    children: ReactNode;
}

const NotificationSystemWrapper: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { notifications, removeNotification } = useNotificationContext();
    
    // Debug logs removidos - notificaciones funcionando

    return (
        <View style={{ flex: 1 }}>
            {children}
            <NotificationSystem 
                notifications={notifications}
                onDismiss={removeNotification}
            />
        </View>
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