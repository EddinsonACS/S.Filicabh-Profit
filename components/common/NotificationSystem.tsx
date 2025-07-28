import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { Dimensions, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface NotificationProps {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    sectionColor?: string;
    duration?: number;
    isConfirmation?: boolean;
    onConfirm?: () => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
    onDismiss: (id: string) => void;
}

const { width, height } = Dimensions.get('window');

const Notification: React.FC<NotificationProps> = ({
    id,
    type,
    title,
    message,
    sectionColor = '#1e3a8a',
    duration = 4000,
    isConfirmation,
    onConfirm,
    onCancel,
    confirmText,
    cancelText,
    onDismiss
}) => {
    const translateY = useSharedValue(100);
    const opacity = useSharedValue(0);
    const scale = useSharedValue(0.95);

    const getTypeConfig = () => {
        // Helper function to darken a color
        const darkenColor = (color: string, percent: number = 20) => {
            // Convert hex to RGB
            const hex = color.replace('#', '');
            const r = parseInt(hex.substr(0, 2), 16);
            const g = parseInt(hex.substr(2, 2), 16);
            const b = parseInt(hex.substr(4, 2), 16);
            
            // Darken each component
            const darkenedR = Math.max(0, Math.floor(r * (100 - percent) / 100));
            const darkenedG = Math.max(0, Math.floor(g * (100 - percent) / 100));
            const darkenedB = Math.max(0, Math.floor(b * (100 - percent) / 100));
            
            // Convert back to hex
            return `#${darkenedR.toString(16).padStart(2, '0')}${darkenedG.toString(16).padStart(2, '0')}${darkenedB.toString(16).padStart(2, '0')}`;
        };

        // Helper function to lighten a color for background
        const lightenColor = (color: string, opacity: number = 0.1) => {
            return `${color}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`;
        };

        switch (type) {
            case 'success':
                return {
                    icon: 'checkmark-circle' as const,
                    bgColor: sectionColor,
                    lightBg: lightenColor(sectionColor, 0.1),
                    borderColor: darkenColor(sectionColor, 10),
                    iconBg: lightenColor(sectionColor, 0.2)
                };
            case 'error':
                const errorColor = '#ef4444';
                return {
                    icon: 'close-circle' as const,
                    bgColor: errorColor,
                    lightBg: lightenColor(errorColor, 0.1),
                    borderColor: darkenColor(errorColor, 10),
                    iconBg: lightenColor(errorColor, 0.2)
                };
            case 'warning':
                return {
                    icon: 'warning' as const,
                    bgColor: sectionColor,
                    lightBg: lightenColor(sectionColor, 0.1),
                    borderColor: darkenColor(sectionColor, 10),
                    iconBg: lightenColor(sectionColor, 0.2)
                };
            case 'info':
                return {
                    icon: 'information-circle' as const,
                    bgColor: sectionColor,
                    lightBg: lightenColor(sectionColor, 0.1),
                    borderColor: darkenColor(sectionColor, 10),
                    iconBg: lightenColor(sectionColor, 0.2)
                };
            default:
                return {
                    icon: 'information-circle' as const,
                    bgColor: sectionColor,
                    lightBg: lightenColor(sectionColor, 0.1),
                    borderColor: darkenColor(sectionColor, 10),
                    iconBg: lightenColor(sectionColor, 0.2)
                };
        }
    };

    const typeConfig = getTypeConfig();

    useEffect(() => {
        console.log('🔔 Notification useEffect - animando entrada:', { id, title, type });
        
        // Animación de entrada desde abajo
        translateY.value = withSpring(0, { damping: 15, stiffness: 100 });
        opacity.value = withTiming(1, { duration: 300 });
        scale.value = withSpring(1, { damping: 12, stiffness: 100 });

        // Auto dismiss solo si no es confirmación
        if (!isConfirmation && duration > 0) {
            console.log('🔔 Configurando auto-dismiss para:', id, 'en', duration, 'ms');
            const timer = setTimeout(() => {
                handleDismiss();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [isConfirmation, duration]);

    const handleDismiss = () => {
        translateY.value = withTiming(100, { duration: 300 });
        opacity.value = withTiming(0, { duration: 300 });
        scale.value = withTiming(0.95, { duration: 300 });

        setTimeout(() => {
            runOnJS(onDismiss)(id);
        }, 300);
    };

    const handleConfirm = () => {
        onConfirm?.();
        handleDismiss();
    };

    const handleCancel = () => {
        onCancel?.();
        handleDismiss();
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: translateY.value },
            { scale: scale.value }
        ],
        opacity: opacity.value,
    }));

    // Debug logs removidos - notificaciones funcionando
    
    return (
        <Animated.View 
            style={[
                animatedStyle,
            ]}
        >
            <View 
                style={{ 
                    backgroundColor: 'white',
                    borderRadius: 16,
                    borderLeftWidth: 4,
                    borderLeftColor: typeConfig.borderColor,
                    overflow: 'hidden',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 999999, // Elevation muy alto para Android
                    zIndex: 999999, // Z-index muy alto
                    marginHorizontal: 16,
                    marginBottom: 8
                }}
            >
                <TouchableOpacity 
                    onPress={!isConfirmation ? handleDismiss : undefined}
                    activeOpacity={isConfirmation ? 1 : 0.9}
                    style={{ padding: 16 }}
                >
                    <View style={{ 
                        flexDirection: 'row', 
                        alignItems: 'flex-start' 
                    }}>
                        {/* Ícono */}
                        <View 
                            style={{ 
                                width: 40,
                                height: 40,
                                borderRadius: 20,
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: 12,
                                marginTop: 2,
                                backgroundColor: typeConfig.iconBg
                            }}
                        >
                            <Ionicons 
                                name={typeConfig.icon} 
                                size={20} 
                                color={typeConfig.bgColor} 
                            />
                        </View>

                        {/* Contenido */}
                        <View style={{ flex: 1, paddingRight: 8 }}>
                            <Text 
                                style={{ 
                                    fontSize: 16,
                                    fontWeight: '600',
                                    marginBottom: 4,
                                    color: typeConfig.bgColor
                                }}
                            >
                                {title}
                            </Text>
                            <Text style={{ 
                                fontSize: 14,
                                color: '#6b7280',
                                lineHeight: 20,
                                marginBottom: isConfirmation ? 16 : 0
                            }}>
                                {message}
                            </Text>

                            {/* Botones de confirmación */}
                            {isConfirmation && (
                                <View style={{
                                    flexDirection: 'row',
                                    gap: 12,
                                    marginTop: 12
                                }}>
                                    <TouchableOpacity
                                        onPress={handleCancel}
                                        style={{
                                            flex: 1,
                                            paddingVertical: 10,
                                            paddingHorizontal: 16,
                                            borderRadius: 8,
                                            borderWidth: 1.5,
                                            borderColor: '#d1d5db',
                                            backgroundColor: 'white',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <Text style={{
                                            fontSize: 14,
                                            fontWeight: '600',
                                            color: '#6b7280'
                                        }}>
                                            {cancelText || 'Cancelar'}
                                        </Text>
                                    </TouchableOpacity>
                                    
                                    <TouchableOpacity
                                        onPress={handleConfirm}
                                        style={{
                                            flex: 1,
                                            paddingVertical: 10,
                                            paddingHorizontal: 16,
                                            borderRadius: 8,
                                            backgroundColor: typeConfig.bgColor,
                                            alignItems: 'center'
                                        }}
                                    >
                                        <Text style={{
                                            fontSize: 14,
                                            fontWeight: '600',
                                            color: 'white'
                                        }}>
                                            {confirmText || 'Confirmar'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>

                        {/* Botón de cerrar para notificaciones no-confirmación */}
                        {!isConfirmation && (
                            <TouchableOpacity
                                onPress={handleDismiss}
                                style={{
                                    padding: 4,
                                }}
                            >
                                <Ionicons 
                                    name="close" 
                                    size={18} 
                                    color="#9ca3af" 
                                />
                            </TouchableOpacity>
                        )}
                    </View>
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
};

interface NotificationSystemProps {
    notifications: NotificationProps[];
    onDismiss: (id: string) => void;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({ 
    notifications, 
    onDismiss 
}) => {
    // Debug logs removidos - notificaciones funcionando
    
    return (
        <View 
            pointerEvents="box-none" 
            style={{ 
                position: 'absolute', 
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 999999, // Z-index muy alto
                elevation: 999999, // Para Android
                justifyContent: 'flex-end',
                paddingBottom: 100, // Más padding para evitar solapamiento
            }}
        >
            {notifications.map((notification, index) => (
                    <View
                        key={notification.id}
                        style={{
                            zIndex: 999999 + index,
                            elevation: 999999 + index, // Para Android
                        }}
                    >
                        <Notification
                            {...notification}
                            onDismiss={onDismiss}
                        />
                    </View>
            ))}
        </View>
    );
};

export default NotificationSystem; 