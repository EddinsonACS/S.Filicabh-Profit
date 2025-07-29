import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';

interface DropdownOption {
  id: string;
  name: string;
  icon: string;
}

interface DropdownOverlayProps {
  isVisible: boolean;
  onClose: () => void;
  options: DropdownOption[];
  activeOption: string;
  onSelectOption: (optionId: string) => void;
  position: {
    x: number;
    y: number;
    width: number;
  };
  theme: {
    buttonColor: string;
  };
}

const DropdownOverlay: React.FC<DropdownOverlayProps> = ({
  isVisible,
  onClose,
  options,
  activeOption,
  onSelectOption,
  position,
  theme
}) => {
  if (!isVisible || !options || options.length === 0) return null;

  // Filtrar la opción activa para no mostrarla en la lista
  const filteredOptions = options.filter(option => option.id !== activeOption);

  // Si no hay opciones después del filtrado, no mostrar nada
  if (filteredOptions.length === 0) return null;

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={{
          flex: 1,
        }}
        activeOpacity={1}
        onPress={onClose} // Close dropdown on outside tap
      >
        <View
          style={{
            position: 'absolute',
            top: position.y + (Platform.OS === 'ios' ? 44 : 10), // Aumentado el espacio
            left: position.x,
            width: position.width,
            backgroundColor: '#ffffff',
            borderRadius: 8,
            borderWidth: 1,
            borderColor: 'rgba(0,0,0,0.1)',
            maxHeight: 300,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 4,
            zIndex: 10000
          }}
        >
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 8 }}
          >
            {filteredOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: 'rgba(0,0,0,0.05)',
                  backgroundColor: 'transparent'
                }}
                onPress={() => {
                  onSelectOption(option.id);
                  onClose();
                }}
              >
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: 'rgba(0,0,0,0.05)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 10
                  }}
                >
                  <Ionicons
                    name={option.icon as any}
                    size={14}
                    color="rgba(0,0,0,0.6)"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: 'rgba(0,0,0,0.8)',
                      fontWeight: '500',
                      fontSize: 14
                    }}
                  >
                    {option.name}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default DropdownOverlay; 