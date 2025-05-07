import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { articleSchema, ArticleFormData } from '@/utils/schemas/articleSchema';

type Article = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  code: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
};

type Category = {
  id: string;
  name: string;
};

type FormNewArticleProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: ArticleFormData) => void;
  categories: Category[];
  initialData?: Article;
  mode: 'create' | 'edit';
};

export default function FormNewArticle({
  visible,
  onClose,
  onSubmit,
  categories,
  initialData,
  mode,
}: FormNewArticleProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
    defaultValues: initialData || {
      name: '',
      description: '',
      price: 0,
      stock: 0,
      category: '',
      code: '',
      imageUrl: '',
    },
  });

  React.useEffect(() => {
    if (initialData) {
      reset(initialData);
    } else {
      reset({
        name: '',
        description: '',
        price: 0,
        stock: 0,
        category: '',
        code: '',
        imageUrl: '',
      });
    }
  }, [initialData, reset, visible]);

  const handleFormSubmit = (data: ArticleFormData) => {
    onSubmit(data);
    reset();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View className="flex-1 bg-black/50 justify-center items-center p-4">
        <Animated.View
          entering={FadeInDown.duration(300)}
          className="bg-white w-full max-w-sm rounded-2xl overflow-hidden"
        >
          {/* Cabecera del modal */}
          <View className="bg-purple-900 px-5 py-4">
            <Text className="text-white text-lg font-bold">
              {mode === 'create' ? 'Crear nuevo artículo' : 'Editar artículo'}
            </Text>
          </View>
          
          <ScrollView className="px-5 py-4 max-h-[600px]">
            {/* Formulario */}
            <View className="mb-4">
              <Text className="text-gray-700 mb-1">Nombre*</Text>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    className="bg-gray-100 rounded-lg px-4 py-3"
                    value={value}
                    onChangeText={onChange}
                    placeholder="Nombre del artículo"
                  />
                )}
              />
              {errors.name && (
                <Text className="text-red-500 text-sm mt-1">{errors.name.message}</Text>
              )}
            </View>
            
            <View className="mb-4">
              <Text className="text-gray-700 mb-1">Descripción</Text>
              <Controller
                control={control}
                name="description"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    className="bg-gray-100 rounded-lg px-4 py-3"
                    value={value}
                    onChangeText={onChange}
                    placeholder="Descripción detallada"
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                )}
              />
            </View>
            
            <View className="flex-row mb-4">
              <View className="flex-1 mr-2">
                <Text className="text-gray-700 mb-1">Precio*</Text>
                <Controller
                  control={control}
                  name="price"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      className="bg-gray-100 rounded-lg px-4 py-3"
                      value={value?.toString()}
                      onChangeText={(text) => {
                        const numericValue = text.replace(/[^0-9]/g, '');
                        onChange(numericValue ? parseInt(numericValue) : 0);
                      }}
                      placeholder="0"
                      keyboardType="numeric"
                    />
                  )}
                />
                {errors.price && (
                  <Text className="text-red-500 text-sm mt-1">{errors.price.message}</Text>
                )}
              </View>
              
              <View className="flex-1">
                <Text className="text-gray-700 mb-1">Stock*</Text>
                <Controller
                  control={control}
                  name="stock"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      className="bg-gray-100 rounded-lg px-4 py-3"
                      value={value?.toString()}
                      onChangeText={(text) => {
                        const numericValue = text.replace(/[^0-9]/g, '');
                        onChange(numericValue ? parseInt(numericValue) : 0);
                      }}
                      placeholder="0"
                      keyboardType="numeric"
                    />
                  )}
                />
                {errors.stock && (
                  <Text className="text-red-500 text-sm mt-1">{errors.stock.message}</Text>
                )}
              </View>
            </View>
            
            <View className="mb-4">
              <Text className="text-gray-700 mb-1">Categoría*</Text>
              <Controller
                control={control}
                name="category"
                render={({ field: { onChange, value } }) => (
                  <View className="bg-gray-100 rounded-lg p-1">
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {categories.filter(cat => cat.id !== 'all').map((category) => (
                        <TouchableOpacity
                          key={category.id}
                          className={`px-3 py-2 mr-1 rounded-lg ${
                            value === category.id ? 'bg-purple-800' : 'bg-transparent'
                          }`}
                          onPress={() => onChange(category.id)}
                        >
                          <Text
                            className={
                              value === category.id ? 'text-white' : 'text-gray-700'
                            }
                          >
                            {category.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              />
              {errors.category && (
                <Text className="text-red-500 text-sm mt-1">{errors.category.message}</Text>
              )}
            </View>
            
            <View className="mb-4">
              <Text className="text-gray-700 mb-1">Código</Text>
              <Controller
                control={control}
                name="code"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    className="bg-gray-100 rounded-lg px-4 py-3"
                    value={value}
                    onChangeText={onChange}
                    placeholder="Código único del artículo"
                  />
                )}
              />
              {mode === 'create' && (
                <Text className="text-xs text-gray-500 mt-1">
                  Se generará automáticamente si lo dejas en blanco
                </Text>
              )}
            </View>
            
            <View className="mb-4">
              <Text className="text-gray-700 mb-1">URL de imagen (opcional)</Text>
              <Controller
                control={control}
                name="imageUrl"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    className="bg-gray-100 rounded-lg px-4 py-3"
                    value={value}
                    onChangeText={onChange}
                    placeholder="https://..."
                  />
                )}
              />
              {errors.imageUrl && (
                <Text className="text-red-500 text-sm mt-1">{errors.imageUrl.message}</Text>
              )}
            </View>
            
            {/* Botones de acción */}
            <View className="flex-row mt-4">
              <TouchableOpacity
                className="flex-1 mr-2 bg-purple-900 py-3 rounded-lg"
                onPress={handleSubmit(handleFormSubmit)}
              >
                <Text className="text-white font-medium text-center">Guardar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className="flex-1 bg-gray-200 py-3 rounded-lg"
                onPress={onClose}
              >
                <Text className="text-gray-800 font-medium text-center">Cancelar</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}
