import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useRef } from 'react';
import { Modal, PanResponder, Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Platform, ScrollView, Switch, Dimensions, Animated } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { Ionicons } from '@expo/vector-icons';

interface DynamicFormModalProps {
  visible: boolean;
  onClose: () => void;
  isEditing: boolean;
  currentItem: any;
  handleCreate: (data: any) => void;
  handleUpdate: (data: any) => void;
  selectedCategory: string;
  schema: z.ZodType<any>;
  defaultValues: Record<string, any>;
  categoryTitles: Record<string, string>;
  formFields: Array<{
    name: string;
    label: string;
    type: 'text' | 'number' | 'switch';
    placeholder?: string;
    required?: boolean;
    description?: string;
  }>;
  headerColor: string;
  headerTextColor: string;
  buttonColor: string;
  buttonTextColor: string;
  switchActiveColor: string;
  switchInactiveColor: string;
}

const { height } = Dimensions.get('window');

const DynamicFormModal: React.FC<DynamicFormModalProps> = ({
  visible,
  onClose,
  isEditing,
  currentItem,
  handleCreate,
  handleUpdate,
  selectedCategory,
  schema,
  defaultValues,
  categoryTitles,
  formFields,
  headerColor,
  headerTextColor,
  buttonColor,
  buttonTextColor,
  switchActiveColor,
  switchInactiveColor
}) => {
  const translateY = useRef(new Animated.Value(height)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  const { control, handleSubmit, reset, formState: { errors, isDirty, isValid } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: isEditing && currentItem ? currentItem : defaultValues
  });

  useEffect(() => {
    if (visible) {
      if (isEditing && currentItem) {
        reset(currentItem);
      } else {
        reset(defaultValues);
      }
    }
  }, [visible, isEditing, currentItem, defaultValues, reset]);

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

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (_, gestureState) => gestureState.y0 < 50,
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 10 && gestureState.y0 < 50,
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

  const onSubmit = (data: any) => {
    if (isEditing) {
      handleUpdate(data);
    } else {
      handleCreate(data);
    }
    reset();
    onClose();
  };

  // Separar campos de texto/número y switches
  const textFields = formFields.filter(f => f.type === 'text' || f.type === 'number');
  const switchFields = formFields.filter(f => f.type === 'switch');

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View
        style={[
          {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            opacity
          }
        ]}
      >
        <TouchableOpacity
          style={{ flex: 1 }}
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
          <View
            style={{ backgroundColor: headerColor }}
            className="p-4 rounded-xl"
            {...panResponder.panHandlers}
          >
            <View className="absolute top-3 left-0 right-0 flex items-center">
              <View className="w-12 h-1 bg-gray-300 rounded-full" />
            </View>
            <Text style={{ color: headerTextColor }} className="text-xl text-center font-bold mt-1">
              {isEditing ? 'Editar' : 'Nuevo'} {categoryTitles[selectedCategory]}
            </Text>
          </View>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            className="flex-1"
            keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
          >
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
              {/* Campos de texto y número */}
              {textFields.map((field) => (
                <View key={field.name} className="mb-4">
                  <View className="flex-row mb-1">
                    <Text className="text-sm font-medium text-gray-700">{field.label}</Text>
                    {field.required && <Text className="text-red-600">*</Text>}
                  </View>
                  <Controller
                    control={control}
                    name={field.name}
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        className={`w-full px-4 py-3 bg-gray-50 rounded-lg border ${
                          errors[field.name] ? 'border-red-500' : 'border-gray-200'
                        }`}
                        placeholder={field.placeholder}
                        value={String(value || '')}
                        onChangeText={(text) => {
                          const newValue = field.type === 'number' ? parseFloat(text) || 0 : text;
                          onChange(newValue);
                        }}
                        keyboardType={field.type === 'number' ? 'numeric' : 'default'}
                      />
                    )}
                  />
                  {field.description && (
                    <Text className="text-gray-500 text-xs mt-1">{field.description}</Text>
                  )}
                  {errors[field.name] && (
                    <Text className="text-red-500 text-sm mt-1">
                      {errors[field.name]?.message as string}
                    </Text>
                  )}
                </View>
              ))}

              {/* Tarjeta de switches */}
              {switchFields.length > 0 && (
                <View className="bg-gray-50 rounded-lg p-4 mb-4">
                  <Text className="text-gray-800 font-medium mb-3">Configuración general</Text>
                  {switchFields.map((field, idx) => (
                    <View key={field.name} className={`flex-row justify-between items-center py-2 ${idx < switchFields.length - 1 ? 'border-b border-gray-300' : ''}`}>
                      <View>
                        <Text className="text-gray-700 font-medium">{field.label}</Text>
                        {field.description && (
                          <Text className="text-gray-500 text-xs">{field.description}</Text>
                        )}
                      </View>
                      <Controller
                        control={control}
                        name={field.name}
                        render={({ field: { onChange, value } }) => (
                          <Switch
                            value={value}
                            onValueChange={onChange}
                            trackColor={{ false: '#d1d5db', true: switchActiveColor }}
                            thumbColor={value ? switchInactiveColor : '#f4f3f4'}
                          />
                        )}
                      />
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>

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
                  style={{ backgroundColor: buttonColor }}
                  className={`flex-1 py-3 rounded-lg ml-2 flex-row justify-center items-center`}
                  onPress={handleSubmit(onSubmit)}
                  disabled={!isValid || !isDirty}
                >
                  <Ionicons name="save-outline" size={18} color={buttonTextColor} />
                  <Text style={{ color: buttonTextColor }} className="font-medium ml-2">
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

export default DynamicFormModal; 