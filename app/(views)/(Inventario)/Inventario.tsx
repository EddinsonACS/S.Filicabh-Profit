import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LoadingScreen from '../../../components/LoadingScreen';
import Filter from '../../../components/Inventory/Filter';
import ListArticle from '../../../components/Inventory/ListArticle';
import FormNewArticle from '../../../components/Inventory/FormNewArticle';
import Actions from '../../../components/Inventory/Actions';
import { ArticleFormData } from '@/utils/schemas/articleSchema';

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

// Estados posibles para modales
type ModalState = 'closed' | 'create' | 'edit' | 'view' | 'delete';

export default function Inventario() {
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalState, setModalState] = useState<ModalState>('closed');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
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
            name: 'Laptop HP 14"',
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
    setModalState('create');
  };

  // Abrir modal para editar artículo
  const editArticle = (article: Article) => {
    setSelectedArticle(article);
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
  const saveArticle = (data: ArticleFormData) => {
    const now = new Date();
    
    if (modalState === 'create') {
      // Crear nuevo artículo
      const newArticle: Article = {
        id: Date.now().toString(), // ID temporal, en una app real vendría del backend
        name: data.name,
        description: data.description || '',
        price: data.price,
        stock: data.stock,
        category: data.category,
        code: data.code || `ART-${Date.now().toString().slice(-6)}`,
        imageUrl: data.imageUrl,
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
            ...data,
            updatedAt: now
          };
        }
        return article;
      });
      
      setArticles(updatedArticles);
    }
    
    setModalState('closed');
    setSelectedArticle(null);
  };

  // Cerrar todos los modales
  const closeAllModals = () => {
    setModalState('closed');
    setSelectedArticle(null);
  };

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
        
        {/* Filtros */}
        <Filter
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          categories={categories}
          currentCategory={currentCategory}
          onCategoryChange={setCurrentCategory}
        />
      </Animated.View>
      
      {/* Lista de artículos */}
      <ListArticle
        articles={filteredArticles}
        onView={viewArticle}
        onEdit={editArticle}
        onDelete={confirmDeleteArticle}
        formatPrice={formatPrice}
        getCategoryName={getCategoryName}
        onCreate={createArticle}
      />
      
      {/* Formulario de crear/editar */}
      <FormNewArticle
        visible={modalState === 'create' || modalState === 'edit'}
        onClose={closeAllModals}
        onSubmit={saveArticle}
        categories={categories}
        initialData={selectedArticle || undefined}
        mode={modalState === 'create' ? 'create' : 'edit'}
      />
      
      {/* Modales de acciones */}
      <Actions
        viewModalVisible={modalState === 'view'}
        deleteModalVisible={modalState === 'delete'}
        selectedArticle={selectedArticle}
        onCloseViewModal={closeAllModals}
        onCloseDeleteModal={closeAllModals}
        onConfirmDelete={deleteArticle}
        onEdit={() => editArticle(selectedArticle!)}
        formatPrice={formatPrice}
        getCategoryName={getCategoryName}
      />
    </View>
  );
}