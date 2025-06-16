import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';

export type ErrorType = 'error' | 'warning' | 'info';

interface ErrorModalProps {
  visible: boolean;
  type?: ErrorType;
  title: string;
  message: string;
  onClose: () => void;
  buttonText?: string;
  sectionColor?: string;
}

const ErrorModal: React.FC<ErrorModalProps> = ({
  visible,
  type = 'error',
  title,
  message,
  onClose,
  buttonText = 'Entendido',
  sectionColor = '#ef4444'
}) => {
  const getTypeConfig = () => {
    switch (type) {
      case 'error':
        return {
          icon: 'close-circle' as const,
          iconColor: '#ef4444',
          bgColor: '#ef4444',
          iconBg: '#fef2f2',
          borderColor: '#ef4444'
        };
      case 'warning':
        return {
          icon: 'warning' as const,
          iconColor: sectionColor,
          bgColor: sectionColor,
          iconBg: '#f9fafb',
          borderColor: sectionColor
        };
      case 'info':
        return {
          icon: 'information-circle' as const,
          iconColor: sectionColor,
          bgColor: sectionColor,
          iconBg: '#f0f9ff',
          borderColor: sectionColor
        };
      default:
        return {
          icon: 'close-circle' as const,
          iconColor: '#ef4444',
          bgColor: '#ef4444',
          iconBg: '#fef2f2',
          borderColor: '#ef4444'
        };
    }
  };

  const typeConfig = getTypeConfig();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View 
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 20,
          zIndex: 2000 // Mayor z-index que otros modales
        }}
      >
        {/* Fondo tocable para cerrar */}
        <TouchableOpacity
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
          }}
          activeOpacity={1}
          onPress={onClose}
        />

        <View 
          style={{ 
            backgroundColor: 'white',
            borderRadius: 16,
            borderLeftWidth: 4,
            borderLeftColor: typeConfig.borderColor,
            overflow: 'hidden',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 12,
            width: '100%',
            maxWidth: 400
          }}
        >
          <View style={{ padding: 24 }}>
            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'flex-start',
              marginBottom: 20
            }}>
              {/* Ícono */}
              <View 
                style={{ 
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 16,
                  backgroundColor: typeConfig.iconBg
                }}
              >
                <Ionicons 
                  name={typeConfig.icon} 
                  size={24} 
                  color={typeConfig.iconColor} 
                />
              </View>

              {/* Contenido */}
              <View style={{ flex: 1 }}>
                <Text 
                  style={{ 
                    fontSize: 18,
                    fontWeight: '600',
                    marginBottom: 8,
                    color: typeConfig.bgColor
                  }}
                >
                  {title}
                </Text>
                <Text style={{ 
                  fontSize: 16,
                  color: '#6b7280',
                  lineHeight: 24
                }}>
                  {message}
                </Text>
              </View>
            </View>

            {/* Botón de acción */}
            <TouchableOpacity
              onPress={onClose}
              style={{
                paddingVertical: 12,
                paddingHorizontal: 20,
                borderRadius: 10,
                backgroundColor: typeConfig.bgColor,
                alignItems: 'center'
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: 'white'
                }}
              >
                {buttonText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ErrorModal; 