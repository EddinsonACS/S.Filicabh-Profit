import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, FlatList, TextInput, Modal, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, SlideInUp, FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LoadingScreen from '../../../components/LoadingScreen';

// Tipos para artículos
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

// Estados posibles para modales de CRUD
type ModalState = 'closed' | 'create' | 'edit' | 'view' | 'delete';

export default function Inventario() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalState, setModalState] = useState<ModalState>('closed');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [formData, setFormData] = useState<Partial<Article>>({});
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);

  // Categorías de artículos
  const categories = [
    { id: 'all', name: 'Todos' },
    { id: 'electronics', name: 'Electrónica' },
    { id: 'furniture', name: 'Muebles' },
    { id: 'clothing', name: 'Ropa' },
    { id: 'food', name: 'Alimentos' },
    { id: 'office', name: 'Oficina' }
  ];

  // Cargar datos iniciales
  useEffect(() => {
    const fetchArticles = async () => {
      // Simulamos carga de datos del backend
      setTimeout(() => {
        // Datos de ejemplo
        const mockArticles: Article[] = [
          {
            id: '1',
            name: 'Laptop HP 15"',
            description: 'Laptop HP 15 pulgadas, 8GB RAM, 256GB SSD',
            price: 125000,
            stock: 15,
            category: 'electronics',
            code: 'LPT-001',
            imageUrl: 'https://via.placeholder.com/100',
            createdAt: new Date(2024, 2, 15),
            updatedAt: new Date(2024, 3, 1)
          },
          {
            id: '2',
            name: 'Escritorio de oficina',
            description: 'Escritorio de madera para oficina, 120x60cm',
            price: 45000,
            stock: 8,
            category: 'furniture',
            code: 'ESC-002',
            imageUrl: 'https://via.placeholder.com/100',
            createdAt: new Date(2024, 1, 20),
            updatedAt: new Date(2024, 1, 20)
          },
          {
            id: '3',
            name: 'Monitor Samsung 27"',
            description: 'Monitor Samsung 27 pulgadas, Full HD, HDMI',
            price: 65000,
            stock: 12,
            category: 'electronics',
            code: 'MON-003',
            imageUrl: 'https://via.placeholder.com/100',
            createdAt: new Date(2024, 2, 10),
            updatedAt: new Date(2024, 2, 10)
          },
          {
            id: '4',
            name: 'Silla ergonómica',
            description: 'Silla de oficina ergonómica con soporte lumbar',
            price: 35000,
            stock: 20,
            category: 'furniture',
            code: 'SIL-004',
            imageUrl: 'https://via.placeholder.com/100',
            createdAt: new Date(2024, 0, 5),
            updatedAt: new Date(2024, 0, 5)
          },
          {
            id: '5',
            name: 'Teclado inalámbrico',
            description: 'Teclado inalámbrico Bluetooth, compatible con múltiples dispositivos',
            price: 15000,
            stock: 25,
            category: 'electronics',
            code: 'TEC-005',
            imageUrl: 'https://via.placeholder.com/100',
            createdAt: new Date(2024, 2, 18),
            updatedAt: new Date(2024, 2, 18)
          },
        ];

        setArticles(mockArticles);
        setFilteredArticles(mockArticles);
        setIsLoading(false);
      }, 1500);
    };

    fetchArticles();
  }, []);

  // Filtrar artículos cuando cambia la búsqueda o categoría
  useEffect(() => {
    let filtered = [...articles];
    
    // Filtrar por categoría si hay una seleccionada
    if (currentCategory && currentCategory !== 'all') {
      filtered = filtered.filter(article => article.category === currentCategory);
    }
    
    // Filtrar por término de búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        article => 
          article.name.toLowerCase().includes(query) ||
          article.description.toLowerCase().includes(query) ||
          article.code.toLowerCase().includes(query)
      );
    }
    
    setFilteredArticles(filtered);
  }, [searchQuery, articles, currentCategory]);

  // Formatear precio
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(price);
  };

  // Obtener nombre de categoría
  const getCategoryName = (categoryId: string): string => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Otra';
  };

  // Abrir modal para ver detalles
  const viewArticle = (article: Article) => {
    setSelectedArticle(article);
    setModalState('view');
  };

  // Abrir modal para crear artículo
  const createArticle = () => {
    setSelectedArticle(null);
    setFormData({});
    setModalState('create');
  };

  // Abrir modal para editar artículo
  const editArticle = (article: Article) => {
    setSelectedArticle(article);
    setFormData({ ...article });
    setModalState('edit');
  };

  // Abrir modal para confirmar eliminación
  const confirmDeleteArticle = (article: Article) => {
    setSelectedArticle(article);
    setModalState('delete');
  };

  // Eliminar artículo
  const deleteArticle = () => {
    if (!selectedArticle) return;
    
    // En una app real, aquí iría la llamada a la API para eliminar
    const updatedArticles = articles.filter(article => article.id !== selectedArticle.id);
    setArticles(updatedArticles);
    setFilteredArticles(updatedArticles);
    setModalState('closed');
    setSelectedArticle(null);
  };

  // Guardar artículo (crear o editar)
  const saveArticle = () => {
    if (!formData.name || !formData.price || !formData.stock || !formData.category) {
      Alert.alert('Error', 'Por favor complete todos los campos obligatorios');
      return;
    }
    
    // En una app real, aquí iría la validación completa y llamada a API
    
    const now = new Date();
    
    if (modalState === 'create') {
      // Crear nuevo artículo
      const newArticle: Article = {
        id: Date.now().toString(), // ID temporal, en una app real vendría del backend
        name: formData.name || '',
        description: formData.description || '',
        price: formData.price || 0,
        stock: formData.stock || 0,
        category: formData.category || 'other',
        code: formData.code || `ART-${Date.now().toString().slice(-6)}`,
        imageUrl: formData.imageUrl,
        createdAt: now,
        updatedAt: now
      };
      
      setArticles([newArticle, ...articles]);
    } else if (modalState === 'edit' && selectedArticle) {
      // Actualizar artículo existente
      const updatedArticles = articles.map(article => {
        if (article.id === selectedArticle.id) {
          return {
            ...article,
            ...formData,
            updatedAt: now
          };
        }
        return article;
      });
      
      setArticles(updatedArticles);
    }
    
    setModalState('closed');
    setSelectedArticle(null);
    setFormData({});
  };

  // Actualizar campo del formulario
  const updateFormField = (field: keyof Article, value: any) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  // Renderizar elemento de artículo
  const renderArticleItem = ({ item }: { item: Article }) => (
    <Animated.View
      entering={FadeIn.duration(300)}
      className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-200"
    >
      <View className="flex-row">
        {/* Imagen del artículo (si existe) */}
        <View className="mr-3">
          <View className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden items-center justify-center">
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} className="w-full h-full" />
            ) : (
              <Ionicons name="cube-outline" size={28} color="#9ca3af" />
            )}
          </View>
          <View className="absolute top-0 right-0 bg-blue-100 rounded-full px-1.5 py-0.5">
            <Text className="text-xs text-blue-800 font-medium">{item.stock}</Text>
          </View>
        </View>
        
        {/* Información del artículo */}
        <View className="flex-1">
          <Text className="text-gray-800 font-semibold">{item.name}</Text>
          <Text className="text-gray-600 text-xs mt-1" numberOfLines={2}>{item.description}</Text>
          
          <View className="flex-row mt-2 items-center">
            <Text className="text-blue-800 font-bold">{formatPrice(item.price)}</Text>
            <View className="bg-gray-100 rounded-full px-2 py-0.5 ml-2">
              <Text className="text-xs text-gray-600">{getCategoryName(item.category)}</Text>
            </View>
            <Text className="text-xs text-gray-500 ml-auto">{item.code}</Text>
          </View>
        </View>
      </View>
      
      {/* Acciones para el artículo */}
      <View className="flex-row mt-3 pt-3 border-t border-gray-100 justify-end">
        <TouchableOpacity
          className="mr-4"
          onPress={() => viewArticle(item)}
        >
          <Ionicons name="eye-outline" size={20} color="#1e40af" />
        </TouchableOpacity>
        
        <TouchableOpacity
          className="mr-4"
          onPress={() => editArticle(item)}
        >
          <Ionicons name="create-outline" size={20} color="#059669" />
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => confirmDeleteArticle(item)}
        >
          <Ionicons name="trash-outline" size={20} color="#dc2626" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  if (isLoading) {
    return <LoadingScreen message="Cargando inventario" />;
  }

  return (
    <View className="flex-1 bg-gray-100">
      {/* Cabecera */}
      <Animated.View
        entering={FadeIn.duration(400)}
        className="bg-blue-800 pt-4 pb-5 px-4"
      >
        <Text className="text-white text-2xl font-bold mb-4">Inventario</Text>
        
        {/* Buscador */}
        <View className="bg-blue-700 rounded-xl flex-row items-center p-3">
          <Ionicons name="search-outline" size={20} color="#93c5fd" />
          <TextInput
            className="flex-1 text-white ml-2"
            placeholder="Buscar artículo..."
            placeholderTextColor="#93c5fd"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle-outline" size={20} color="#93c5fd" />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
      
      {/* Categorías horizontales */}
      <Animated.View
        entering={SlideInUp.duration(400).delay(100)}
        className="py-3"
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              className={`px-4 py-2 mr-2 rounded-full border ${
                currentCategory === category.id || (category.id === 'all' && !currentCategory)
                  ? 'bg-blue-800 border-blue-800'
                  : 'bg-white border-gray-300'
              }`}
              onPress={() => setCurrentCategory(category.id === 'all' ? null : category.id)}
            >
              <Text
                className={
                  currentCategory === category.id || (category.id === 'all' && !currentCategory)
                    ? 'text-white'
                    : 'text-gray-700'
                }
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>
      
      {/* Lista de artículos y botón flotante */}
      <View className="flex-1 px-4">
        {filteredArticles.length > 0 ? (
          <FlatList
            data={filteredArticles}
            renderItem={renderArticleItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        ) : (
          <Animated.View
            entering={FadeIn.duration(300)}
            className="flex-1 items-center justify-center"
          >
            <Ionicons name="search" size={48} color="#d1d5db" />
            <Text className="text-gray-500 mt-4 text-center">
              No se encontraron artículos que coincidan con tu búsqueda
            </Text>
          </Animated.View>
        )}
        
        {/* Botón flotante para agregar */}
        <TouchableOpacity
          className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-blue-800 items-center justify-center shadow-lg"
          style={{ elevation: 5 }}
          onPress={createArticle}
        >
          <Ionicons name="add" size={30} color="white" />
        </TouchableOpacity>
      </View>
      
      {/* Modal para ver detalles */}
      <Modal
        visible={modalState === 'view'}
        transparent
        animationType="fade"
        onRequestClose={() => setModalState('closed')}
      >
        <View className="flex-1 bg-black/50 justify-center items-center p-4">
          <Animated.View
            entering={SlideInUp.duration(300)}
            className="bg-white w-full max-w-sm rounded-2xl overflow-hidden"
          >
            {/* Cabecera del modal */}
            <View className="bg-blue-800 px-5 py-4">
              <Text className="text-white text-lg font-bold">Detalles del artículo</Text>
            </View>
            
            {selectedArticle && (
              <ScrollView className="px-5 py-4 max-h-[500px]">
                {/* Imagen del artículo */}
                <View className="items-center mb-4">
                  <View className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden items-center justify-center">
                    {selectedArticle.imageUrl ? (
                      <Image source={{ uri: selectedArticle.imageUrl }} className="w-full h-full" />
                    ) : (
                      <Ionicons name="cube-outline" size={48} color="#9ca3af" />
                    )}
                  </View>
                </View>
                
                {/* Información del artículo */}
                <View className="mb-4">
                  <Text className="text-gray-800 text-xl font-bold">{selectedArticle.name}</Text>
                  <Text className="text-gray-600 mt-1">{selectedArticle.description}</Text>
                </View>
                
                <View className="flex-row justify-between mb-3">
                  <Text className="text-gray-600">Código:</Text>
                  <Text className="text-gray-800 font-medium">{selectedArticle.code}</Text>
                </View>
                
                <View className="flex-row justify-between mb-3">
                  <Text className="text-gray-600">Precio:</Text>
                  <Text className="text-gray-800 font-bold">{formatPrice(selectedArticle.price)}</Text>
                </View>
                
                <View className="flex-row justify-between mb-3">
                  <Text className="text-gray-600">Categoría:</Text>
                  <Text className="text-gray-800">{getCategoryName(selectedArticle.category)}</Text>
                </View>
                
                <View className="flex-row justify-between mb-3">
                  <Text className="text-gray-600">Stock disponible:</Text>
                  <View className="bg-blue-100 rounded-full px-2 py-0.5">
                    <Text className="text-blue-800 font-medium">{selectedArticle.stock} unidades</Text>
                  </View>
                </View>
                
                <View className="flex-row justify-between mb-3">
                  <Text className="text-gray-600">Creado:</Text>
                  <Text className="text-gray-800">{selectedArticle.createdAt.toLocaleDateString()}</Text>
                </View>
                
                <View className="flex-row justify-between mb-3">
                  <Text className="text-gray-600">Actualizado:</Text>
                  <Text className="text-gray-800">{selectedArticle.updatedAt.toLocaleDateString()}</Text>
                </View>
                
                {/* Acciones */}
                <View className="flex-row mt-5 pt-4 border-t border-gray-200">
                  <TouchableOpacity
                    className="flex-1 mr-2 bg-blue-100 py-3 rounded-lg"
                    onPress={() => {
                      setModalState('closed');
                      setTimeout(() => editArticle(selectedArticle), 300);
                    }}
                  >
                    <Text className="text-blue-800 font-medium text-center">Editar</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    className="flex-1 bg-gray-200 py-3 rounded-lg"
                    onPress={() => setModalState('closed')}
                  >
                    <Text className="text-gray-800 font-medium text-center">Cerrar</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </Animated.View>
        </View>
      </Modal>
      
      {/* Modal para crear/editar artículo */}
      <Modal
        visible={modalState === 'create' || modalState === 'edit'}
        transparent
        animationType="fade"
        onRequestClose={() => setModalState('closed')}
      >
        <View className="flex-1 bg-black/50 justify-center items-center p-4">
          <Animated.View
            entering={SlideInUp.duration(300)}
            className="bg-white w-full max-w-sm rounded-2xl overflow-hidden"
          >
            {/* Cabecera del modal */}
            <View className="bg-blue-800 px-5 py-4">
              <Text className="text-white text-lg font-bold">
                {modalState === 'create' ? 'Crear nuevo artículo' : 'Editar artículo'}
              </Text>
            </View>
            
            <ScrollView className="px-5 py-4 max-h-[500px]">
              {/* Formulario */}
              <View className="mb-4">
                <Text className="text-gray-700 mb-1">Nombre*</Text>
                <TextInput
                  className="bg-gray-100 rounded-lg px-4 py-3"
                  value={formData.name || ''}
                  onChangeText={(text) => updateFormField('name', text)}
                  placeholder="Nombre del artículo"
                />
              </View>
              
              <View className="mb-4">
                <Text className="text-gray-700 mb-1">Descripción</Text>
                <TextInput
                  className="bg-gray-100 rounded-lg px-4 py-3"
                  value={formData.description || ''}
                  onChangeText={(text) => updateFormField('description', text)}
                  placeholder="Descripción detallada"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
              
              <View className="flex-row mb-4">
                <View className="flex-1 mr-2">
                  <Text className="text-gray-700 mb-1">Precio*</Text>
                  <TextInput
                    className="bg-gray-100 rounded-lg px-4 py-3"
                    value={formData.price?.toString() || ''}
                    onChangeText={(text) => {
                      const numericValue = text.replace(/[^0-9]/g, '');
                      updateFormField('price', numericValue ? parseInt(numericValue) : undefined);
                    }}
                    placeholder="0"
                    keyboardType="numeric"
                  />
                </View>
                
                <View className="flex-1">
                  <Text className="text-gray-700 mb-1">Stock*</Text>
                  <TextInput
                    className="bg-gray-100 rounded-lg px-4 py-3"
                    value={formData.stock?.toString() || ''}
                    onChangeText={(text) => {
                      const numericValue = text.replace(/[^0-9]/g, '');
                      updateFormField('stock', numericValue ? parseInt(numericValue) : undefined);
                    }}
                    placeholder="0"
                    keyboardType="numeric"
                  />
                </View>
              </View>
              
              <View className="mb-4">
                <Text className="text-gray-700 mb-1">Categoría*</Text>
                <View className="bg-gray-100 rounded-lg p-1">
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {categories.filter(cat => cat.id !== 'all').map((category) => (
                      <TouchableOpacity
                        key={category.id}
                        className={`px-3 py-2 mr-1 rounded-lg ${
                          formData.category === category.id ? 'bg-blue-800' : 'bg-transparent'
                        }`}
                        onPress={() => updateFormField('category', category.id)}
                      >
                        <Text
                          className={
                            formData.category === category.id ? 'text-white' : 'text-gray-700'
                          }
                        >
                          {category.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
              
              <View className="mb-4">
                <Text className="text-gray-700 mb-1">Código</Text>
                <TextInput
                  className="bg-gray-100 rounded-lg px-4 py-3"
                  value={formData.code || ''}
                  onChangeText={(text) => updateFormField('code', text)}
                  placeholder="Código único del artículo"
                />
                {modalState === 'create' && (
                  <Text className="text-xs text-gray-500 mt-1">
                    Se generará automáticamente si lo dejas en blanco
                  </Text>
                )}
              </View>
              
              <View className="mb-4">
                <Text className="text-gray-700 mb-1">URL de imagen (opcional)</Text>
                <TextInput
                  className="bg-gray-100 rounded-lg px-4 py-3"
                  value={formData.imageUrl || ''}
                  onChangeText={(text) => updateFormField('imageUrl', text)}
                  placeholder="https://..."
                />
              </View>
              
              {/* Botones de acción */}
              <View className="flex-row mt-4">
                <TouchableOpacity
                  className="flex-1 mr-2 bg-blue-800 py-3 rounded-lg"
                  onPress={saveArticle}
                >
                  <Text className="text-white font-medium text-center">Guardar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  className="flex-1 bg-gray-200 py-3 rounded-lg"
                  onPress={() => setModalState('closed')}
                >
                  <Text className="text-gray-800 font-medium text-center">Cancelar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
      
      {/* Modal para confirmar eliminación */}
      <Modal
        visible={modalState === 'delete'}
        transparent
        animationType="fade"
        onRequestClose={() => setModalState('closed')}
      >
        <View className="flex-1 bg-black/50 justify-center items-center p-4">
          <Animated.View
            entering={FadeInDown.duration(300)}
            className="bg-white w-full max-w-sm rounded-2xl overflow-hidden"
          >
            <View className="p-5">
              <View className="items-center mb-4">
                <View className="w-16 h-16 rounded-full bg-red-100 items-center justify-center mb-3">
                  <Ionicons name="trash-outline" size={32} color="#dc2626" />
                </View>
                <Text className="text-gray-800 text-lg font-bold text-center">
                  ¿Eliminar artículo?
                </Text>
              </View>
              
              {selectedArticle && (
                <Text className="text-gray-600 text-center mb-4">
                  ¿Estás seguro que deseas eliminar "{selectedArticle.name}"? Esta acción no se puede deshacer.
                </Text>
              )}
              
              <View className="flex-row mt-2">
                <TouchableOpacity
                  className="flex-1 mr-2 bg-gray-200 py-3 rounded-lg"
                  onPress={() => setModalState('closed')}
                >
                  <Text className="text-gray-800 font-medium text-center">Cancelar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  className="flex-1 bg-red-600 py-3 rounded-lg"
                  onPress={deleteArticle}
                >
                  <Text className="text-white font-medium text-center">Eliminar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}