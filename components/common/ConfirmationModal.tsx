import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Modal,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export type ConfirmationType = 'success' | 'error' | 'warning' | 'info';

interface ConfirmationModalProps {
  visible: boolean;
  type: ConfirmationType;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  sectionColor?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  type,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  sectionColor = '#1e3a8a'
}) => {
  const getTypeConfig = () => {
    const baseConfigs = {
      success: { icon: 'checkmark-circle', bgColor: '#16a34a', iconBg: '#dcfce7' },
      error: { icon: 'close-circle', bgColor: '#dc2626', iconBg: '#fef2f2' },
      warning: { icon: 'warning', bgColor: '#d97706', iconBg: '#f3f4f6' },
      info: { icon: 'information-circle', bgColor: '#2563eb', iconBg: '#dbeafe' }
    };

    // Para warning, usar el color de sección si se proporciona
    if (type === 'warning' && sectionColor) {
      return {
        ...baseConfigs[type],
        bgColor: sectionColor,
        borderColor: sectionColor
      };
    }

    return {
      ...baseConfigs[type],
      bgColor: sectionColor || baseConfigs[type].bgColor,
      borderColor: sectionColor || baseConfigs[type].bgColor
    };
  };

  const typeConfig = getTypeConfig();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View 
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 20,
          zIndex: 1500
        }}
      >
        <TouchableOpacity
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
          }}
          activeOpacity={1}
          onPress={onCancel}
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
                  name={typeConfig.icon as any} 
                  size={24} 
                  color={typeConfig.bgColor} 
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

            {/* Botones de confirmación */}
            <View style={{
              flexDirection: 'row',
              gap: 12
            }}>
              <TouchableOpacity
                onPress={onCancel}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  paddingHorizontal: 20,
                  borderRadius: 10,
                  borderWidth: 1.5,
                  borderColor: '#d1d5db',
                  backgroundColor: 'white',
                  alignItems: 'center'
                }}
              >
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: '#6b7280'
                }}>
                  {cancelText}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={onConfirm}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  paddingHorizontal: 20,
                  borderRadius: 10,
                  backgroundColor: typeConfig.bgColor,
                  alignItems: 'center'
                }}
              >
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: 'white'
                }}>
                  {confirmText}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ConfirmationModal; 