// components/Inventory/FormModal.tsx
import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform, 
  Image,
  StyleSheet,
  Animated,
  Dimensions,
  Alert
} from 'react-native';
import { FormDataType } from '@/components/Entidades/Inventario/InventoryTypes';
import { Ionicons } from '@expo/vector-icons';
import { inventoryCategories } from '@/components/Entidades/Inventario/EntInventarioData';

interface FormModalProps {
  visible: boolean;
  onClose: () => void;
  formData: FormDataType;
  setFormData: (data: FormDataType) => void;
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
  // Animation values
  const translateY = React.useRef(new Animated.Value(height)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;

  // Handle photo editing
  const [imageUrl, setImageUrl] = useState<string>('');
  
  useEffect(() => {
    if (formData.image) {
      setImageUrl(formData.image);
    }
  }, [formData.image]);

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

  // Get category colors for styling
  const getCategoryColor = (type: string) => {
    const category = inventoryCategories.find(cat => cat.type === type);
    return {
      primary: category?.color || '#581c87',
      light: category?.lightColor || '#f3e8ff'
    };
  };

  const colors = getCategoryColor(selectedCategory);

  // Handle image URL input
  const handleImageUrlChange = (url: string) => {
    setImageUrl(url);
    setFormData({ ...formData, image: url });
  };

  // Basic form fields that all items have
  const renderBasicFields = () => (
    <>
      <View className="mb-4">
        <Text className="text-gray-700 mb-2 font-medium">Nombre</Text>
        <TextInput
          className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800"
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
          placeholder="Ingrese nombre"
        />
      </View>

      <View className="mb-4">
        <Text className="text-gray-700 mb-2 font-medium">Descripción</Text>
        <TextInput
          className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800"
          value={formData.description}
          onChangeText={(text) => setFormData({ ...formData, description: text })}
          placeholder="Ingrese descripción"
          multiline
          numberOfLines={3}
          style={{ height: 100, textAlignVertical: 'top' }}
        />
      </View>

      <View className="mb-4">
        <Text className="text-gray-700 mb-2 font-medium">Código</Text>
        <TextInput
          className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800"
          value={formData.code}
          onChangeText={(text) => setFormData({ ...formData, code: text })}
          placeholder="Ingrese código"
        />
      </View>
    </>
  );

  // Additional fields only for articles
  const renderArticleFields = () => (
    <>
      {/* Image URL field for articles */}
      <View className="mb-4">
        <Text className="text-gray-700 mb-2 font-medium">URL de Imagen</Text>
        <TextInput
          className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800"
          value={imageUrl}
          onChangeText={handleImageUrlChange}
          placeholder="https://ejemplo.com/imagen.jpg"
        />
        
        {imageUrl && (
          <View className="mt-2 rounded-lg overflow-hidden">
            <Image
              source={{ uri: imageUrl }}
              className="w-full h-48 bg-gray-200"
              resizeMode="cover"
              onError={() => {
                Alert.alert("Error", "No se pudo cargar la imagen. Verifique la URL e intente nuevamente.");
                setImageUrl("");
                setFormData({ ...formData, image: undefined });
              }}
            />
          </View>
        )}
      </View>

      <View className="mb-4">
        <Text className="text-gray-700 mb-2 font-medium">Categoría</Text>
        <TextInput
          className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800"
          value={formData.category}
          onChangeText={(text) => setFormData({ ...formData, category: text })}
          placeholder="Seleccione categoría"
        />
      </View>

      <View className="mb-4">
        <Text className="text-gray-700 mb-2 font-medium">Grupo</Text>
        <TextInput
          className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800"
          value={formData.group}
          onChangeText={(text) => setFormData({ ...formData, group: text })}
          placeholder="Seleccione grupo"
        />
      </View>

      <View className="mb-4">
        <Text className="text-gray-700 mb-2 font-medium">Precio</Text>
        <TextInput
          className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800"
          value={formData.price}
          onChangeText={(text) => setFormData({ ...formData, price: text })}
          placeholder="Ingrese precio"
          keyboardType="numeric"
        />
      </View>

      <View className="mb-4">
        <Text className="text-gray-700 mb-2 font-medium">Stock</Text>
        <TextInput
          className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800"
          value={formData.stock}
          onChangeText={(text) => setFormData({ ...formData, stock: text })}
          placeholder="Ingrese stock"
          keyboardType="numeric"
        />
      </View>
    </>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none" // Using our own animation
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
            height: '80%' // Changed to 80% as requested
          }}
        >
          {/* Header with matching style to ItemModal */}
          <View
            style={{ 
              backgroundColor: colors.primary,
              paddingVertical: 24,
              paddingHorizontal: 16,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24
            }}
          >
            <View style={{ position: 'absolute', top: 8, left: 0, right: 0, alignItems: 'center' }}>
              <View style={{ width: 48, height: 4, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 4 }} />
            </View>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>
                {isEditing ? 'Editar' : 'Nuevo'} {/* Changed to just "Editar" as requested */}
              </Text>
              
              <TouchableOpacity
                style={{ 
                  width: 32, 
                  height: 32, 
                  borderRadius: 16, 
                  backgroundColor: 'rgba(255,255,255,0.2)', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}
                onPress={onClose}
              >
                <Ionicons name="close" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1 }}
          >
            <ScrollView style={{ padding: 16 }}>
              {renderBasicFields()}
              
              {selectedCategory === 'article' && renderArticleFields()}

              <View className="mb-4">
                <Text className="text-gray-700 mb-2 font-medium">Estado</Text>
                <View className="flex-row">
                  <TouchableOpacity
                    className={`flex-1 py-3 rounded-l-lg border ${
                      formData.status === 'active' 
                        ? 'bg-green-100 border-green-300' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
                    onPress={() => setFormData({ ...formData, status: 'active' })}
                  >
                    <Text className={`text-center ${
                      formData.status === 'active' 
                        ? 'text-green-900 font-medium' 
                        : 'text-gray-700'
                    }`}>
                      Activo
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className={`flex-1 py-3 rounded-r-lg border ${
                      formData.status === 'inactive' 
                        ? 'bg-red-100 border-red-300' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
                    onPress={() => setFormData({ ...formData, status: 'inactive' })}
                  >
                    <Text className={`text-center ${
                      formData.status === 'inactive' 
                        ? 'text-red-900 font-medium' 
                        : 'text-gray-700'
                    }`}>
                      Inactivo
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              {/* Extra bottom padding for scroll */}
              <View style={{ height: 20 }} />
            </ScrollView>

            <View className="p-4 border-t border-gray-100">
              <TouchableOpacity
                className="bg-purple-600 py-3 rounded-lg"
                onPress={isEditing ? handleUpdate : handleCreate}
              >
                <Text className="text-center text-white font-medium">
                  {isEditing ? 'Actualizar' : 'Guardar'}
                </Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export default FormModal;