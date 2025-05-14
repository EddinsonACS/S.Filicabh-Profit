import { SalesItem } from './VentasTypes';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { salesCategories } from './EntVentasData';

interface FormModalProps {
  visible: boolean;
  onClose: () => void;
  formData: {
    name: string;
    description: string;
    code: string;
    status: 'active' | 'inactive';
    value?: string;
    date?: string;
  };
  setFormData: (data: any) => void;
  isEditing: boolean;
  selectedCategory: string;
  handleCreate: () => void;
  handleUpdate: () => void;
}

const { height } = Dimensions.get('window');

const FormModal: React.FC<FormModalProps> = ({
  visible,
  onClose,
  formData,
  setFormData,
  isEditing,
  selectedCategory,
  handleCreate,
  handleUpdate
}) => {
  const translateY = useRef(new Animated.Value(height)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  // Cerrar al deslizar hacia abajo
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (_, gestureState) => {
        return gestureState.y0 < 50;
      },
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 10 && gestureState.y0 < 50;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          onClose();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            friction: 8,
            useNativeDriver: true
          }).start();
        }
      }
    })
  ).current;

  // Manejar animaciones cuando cambia la visibilidad
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: height,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  // Obtener el título correcto según la categoría
  const getCategoryTitle = () => {
    const category = salesCategories.find(cat => cat.type === selectedCategory);
    return category ? category.title : 'Elemento';
  };

  // Obtener color según la categoría
  const getCategoryColor = () => {
    return { primary: '#581c87', light: '#f3e8ff' }; // Purple/morado como el de inventario
  };

  const renderBasicFields = () => (
    <>
      {/* Nombre */}
      <View className="mb-4">
        <View className="flex-row mb-1">
          <Text className="text-sm font-medium text-gray-700">Nombre </Text>
          <Text className="text-red-600">*</Text>
        </View>
        <TextInput
          className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200"
          placeholder="Nombre del elemento"
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
        />
      </View>

      {/* Descripción */}
      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 mb-1">Descripción</Text>
        <TextInput
          className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200"
          placeholder="Descripción del elemento"
          value={formData.description}
          onChangeText={(text) => setFormData({ ...formData, description: text })}
          multiline
          numberOfLines={3}
          style={{ height: 100, textAlignVertical: 'top' }}
        />
      </View>

      {/* Código */}
      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 mb-1">Código</Text>
        <TextInput
          className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200"
          placeholder="Código del elemento"
          value={formData.code}
          onChangeText={(text) => setFormData({ ...formData, code: text })}
        />
      </View>
    </>
  );

  // Campos adicionales para tipos específicos
  const renderExchangeRateFields = () => (
    <>
      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 mb-1">Valor</Text>
        <TextInput
          className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200"
          placeholder="Valor de la tasa"
          value={formData.value}
          onChangeText={(text) => setFormData({ ...formData, value: text })}
          keyboardType="numeric"
        />
      </View>

      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 mb-1">Fecha</Text>
        <TextInput
          className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200"
          placeholder="AAAA-MM-DD"
          value={formData.date}
          onChangeText={(text) => setFormData({ ...formData, date: text })}
        />
      </View>
    </>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: 'rgba(0,0,0,0.5)', opacity }
        ]}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />
        <Animated.View
          style={{
            transform: [{ translateY }],
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'white',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            overflow: 'hidden',
            height: '80%'
          }}
        >
          {/* Header */}
          <View
            className="bg-purple-900 p-4 rounded-xl"
            {...panResponder.panHandlers}
          >
            <View className="absolute top-3 left-0 right-0 flex items-center">
              <View className="w-12 h-1 bg-gray-300 rounded-full" />
            </View>
            <Text className="text-white text-xl text-center font-bold mt-1">
              {isEditing ? 'Editar' : 'Nuevo'} {getCategoryTitle()}
            </Text>
          </View>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            className="flex-1"
            keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
          >
            {/* Content */}
            <ScrollView
              ref={scrollViewRef}
              className="flex-1 px-4 pt-4"
              contentContainerStyle={{ paddingBottom: 100 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={true}
              overScrollMode="always"
              bounces={true}
              alwaysBounceVertical={true}
              scrollEventThrottle={16}
              nestedScrollEnabled={true}
            >
              {renderBasicFields()}

              {selectedCategory === 'exchangeRate' && renderExchangeRateFields()}

              {/* Estado */}
              <View className="bg-gray-50 rounded-lg p-4 mb-4">
                <Text className="text-gray-800 font-medium mb-3">Estado</Text>
                <View className="flex-row justify-between items-center py-2">
                  <View>
                    <Text className="text-gray-700 font-medium">Estado Activo</Text>
                    <Text className="text-gray-500 text-xs">El elemento está disponible para el sistema</Text>
                  </View>
                  <Switch
                    value={formData.status === 'active'}
                    onValueChange={(value) => 
                      setFormData({ 
                        ...formData, 
                        status: value ? 'active' : 'inactive' 
                      })
                    }
                    trackColor={{ false: '#d1d5db', true: '#00FF15FF' }}
                    thumbColor={formData.status === 'active' ? '#10E422FF' : '#f4f3f4'}
                  />
                </View>
              </View>
            </ScrollView>

            {/* Bottom */}
            <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-6 px-8">
              <View className="flex-row mt-1">
                <TouchableOpacity
                  className="flex-1 bg-gray-100 py-3 rounded-lg mr-2 flex-row justify-center items-center"
                  onPress={onClose}
                >
                  <Ionicons name="close-outline" size={18} color="#4b5563" />
                  <Text className="text-gray-800 font-medium ml-2">Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 bg-purple-100 py-3 rounded-lg ml-2 flex-row justify-center items-center"
                  onPress={isEditing ? handleUpdate : handleCreate}
                >
                  <Ionicons name="save-outline" size={18} color="#7e22ce" />
                  <Text className="text-purple-800 font-medium ml-2">
                    {isEditing ? 'Actualizar' : 'Guardar'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export default FormModal;