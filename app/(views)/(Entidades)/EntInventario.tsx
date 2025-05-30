import { useAlmacen } from '@/hooks/Inventario/useAlmacen';
import { useCategoria } from '@/hooks/Inventario/useCategoria';
import { useGrupo } from '@/hooks/Inventario/useGrupo';
import { useSeccion } from '@/hooks/Inventario/useSeccion';
import { useUnidad } from '@/hooks/Inventario/useUnidad';
import { useTalla } from '@/hooks/Inventario/useTalla';
import { useColor } from '@/hooks/Inventario/useColor';
import { useTipoDeImpuesto } from '@/hooks/Inventario/useTipoDeImpuesto';
import { useTipoDeArticulo } from '@/hooks/Inventario/useTipoDeArticulo';
import { useOrigen } from '@/hooks/Inventario/useOrigen';
import { inventorySchema } from '@/utils/schemas/inventorySchema';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { BackHandler, Text, TouchableOpacity, View } from 'react-native';
import DynamicCategorySelector from '@/components/Entidades/shared/DynamicCategorySelector';
import DynamicSearchBar from '@/components/Entidades/shared/DynamicSearchBar';
import DynamicItemList from '@/components/Entidades/shared/DynamicItemList';
import DynamicFormModal from '@/components/Entidades/shared/DynamicFormModal';
import DynamicItemModal from '@/components/Entidades/shared/DynamicItemModal';
import DynamicHeader from '@/components/Entidades/shared/DynamicHeader';
import { themes } from '@/components/Entidades/shared/theme';
import DynamicEmptyState from '@/components/Entidades/shared/DynamicEmptyState';
import { FORM_FIELDS_INVENTORY } from '@/utils/const/formFields';
import { DEFAULT_VALUES_INVENTORY } from '@/utils/const/defaultValues';
import { ItemArticle } from '@/components/Inventario/ItemArticle';

const PAGE_SIZE = 10;

const CATEGORIES = [
  { id: 'almacen', label: 'Almacén', icon: 'business' as const },
  { id: 'categoria', label: 'Categoría', icon: 'list' as const },
  { id: 'color', label: 'Color', icon: 'color-palette' as const },
  { id: 'grupo', label: 'Grupo', icon: 'people' as const },
  { id: 'origen', label: 'Origen', icon: 'globe' as const },
  { id: 'talla', label: 'Talla', icon: 'resize' as const },
  { id: 'tipodearticulo', label: 'Tipo de Artículo', icon: 'cube-outline' as const },
  { id: 'tipodeimpuesto', label: 'Tipo de Impuesto', icon: 'calculator' as const },
  { id: 'seccion', label: 'Sección', icon: 'layers' as const },
  { id: 'unidad', label: 'Unidad', icon: 'scale' as const }
];

const CATEGORY_TITLES = {
  almacen: 'Almacén',
  categoria: 'Categoría',
  color: 'Color',
  grupo: 'Grupo',
  origen: 'Origen',
  talla: 'Talla',
  tipodearticulo: 'Tipo de Artículo',
  tipodeimpuesto: 'Tipo de Impuesto',
  seccion: 'Sección',
  unidad: 'Unidad'
};

type CategoryId = keyof typeof CATEGORY_TITLES;

const EntInventario: React.FC = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const {
    useGetAlmacenList,
    useCreateAlmacen,
    useUpdateAlmacen,
    useDeleteAlmacen
  } = useAlmacen();

  const {
    useGetCategoriaList,
    useCreateCategoria,
    useUpdateCategoria,
    useDeleteCategoria
  } = useCategoria();

  const {
    useGetGrupoList,
    useCreateGrupo,
    useUpdateGrupo,
    useDeleteGrupo
  } = useGrupo();

  const {
    useGetSeccionList,
    useCreateSeccion,
    useUpdateSeccion,
    useDeleteSeccion
  } = useSeccion();

  const {
    useGetUnidadList,
    useCreateUnidad,
    useUpdateUnidad,
    useDeleteUnidad
  } = useUnidad();

  const {
    useGetTallaList,
    useCreateTalla,
    useUpdateTalla,
    useDeleteTalla
  } = useTalla();

  const {
    useGetColorList,
    useCreateColor,
    useUpdateColor,
    useDeleteColor
  } = useColor();

  const {
    useGetTipoDeImpuestoList,
    useCreateTipoDeImpuesto,
    useUpdateTipoDeImpuesto,
    useDeleteTipoDeImpuesto
  } = useTipoDeImpuesto();

  const {
    useGetTipoDeArticuloList,
    useCreateTipoDeArticulo,
    useUpdateTipoDeArticulo,
    useDeleteTipoDeArticulo
  } = useTipoDeArticulo();

  const {
    useGetOrigenList,
    useCreateOrigen,
    useUpdateOrigen,
    useDeleteOrigen
  } = useOrigen();

  // State management
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewType, setViewType] = useState<'chips' | 'dropdown'>('chips');
  const [formModalVisible, setFormModalVisible] = useState<boolean>(false);
  const [detailModalVisible, setDetailModalVisible] = useState<boolean>(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('almacen');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [accumulatedItems, setAccumulatedItems] = useState<any[]>([]);


  // React Query hooks
  const { data: almacenData, isLoading: isLoadingAlmacen } = useGetAlmacenList(currentPage, PAGE_SIZE);
  const { data: categoriaData, isLoading: isLoadingCategoria } = useGetCategoriaList(currentPage, PAGE_SIZE);
  const { data: grupoData, isLoading: isLoadingGrupo } = useGetGrupoList(currentPage, PAGE_SIZE);
  const { data: seccionData, isLoading: isLoadingSeccion } = useGetSeccionList(currentPage, PAGE_SIZE);
  const { data: unidadData, isLoading: isLoadingUnidad } = useGetUnidadList(currentPage, PAGE_SIZE);
  const { data: tallaData, isLoading: isLoadingTalla } = useGetTallaList(currentPage, PAGE_SIZE);
  const { data: colorData, isLoading: isLoadingColor } = useGetColorList(currentPage, PAGE_SIZE);
  const { data: tipoDeImpuestoData, isLoading: isLoadingTipoDeImpuesto } = useGetTipoDeImpuestoList(currentPage, PAGE_SIZE);
  const { data: tipoDeArticuloData, isLoading: isLoadingTipoDeArticulo } = useGetTipoDeArticuloList(currentPage, PAGE_SIZE);
  const { data: origenData, isLoading: isLoadingOrigen } = useGetOrigenList(currentPage, PAGE_SIZE);
  
  const createAlmacenMutation = useCreateAlmacen();
  const updateAlmacenMutation = useUpdateAlmacen();
  const deleteAlmacenMutation = useDeleteAlmacen();
  
  const createCategoriaMutation = useCreateCategoria();
  const updateCategoriaMutation = useUpdateCategoria();
  const deleteCategoriaMutation = useDeleteCategoria();

  const createGrupoMutation = useCreateGrupo();
  const updateGrupoMutation = useUpdateGrupo();
  const deleteGrupoMutation = useDeleteGrupo();

  const createSeccionMutation = useCreateSeccion();
  const updateSeccionMutation = useUpdateSeccion();
  const deleteSeccionMutation = useDeleteSeccion();

  const createUnidadMutation = useCreateUnidad();
  const updateUnidadMutation = useUpdateUnidad();
  const deleteUnidadMutation = useDeleteUnidad();

  const createTallaMutation = useCreateTalla();
  const updateTallaMutation = useUpdateTalla();
  const deleteTallaMutation = useDeleteTalla();

  const createColorMutation = useCreateColor();
  const updateColorMutation = useUpdateColor();
  const deleteColorMutation = useDeleteColor();

  const createTipoDeImpuestoMutation = useCreateTipoDeImpuesto();
  const updateTipoDeImpuestoMutation = useUpdateTipoDeImpuesto();
  const deleteTipoDeImpuestoMutation = useDeleteTipoDeImpuesto();

  const createTipoDeArticuloMutation = useCreateTipoDeArticulo();
  const updateTipoDeArticuloMutation = useUpdateTipoDeArticulo();
  const deleteTipoDeArticuloMutation = useDeleteTipoDeArticulo();

  const createOrigenMutation = useCreateOrigen();
  const updateOrigenMutation = useUpdateOrigen();
  const deleteOrigenMutation = useDeleteOrigen();

  const { data: categoriasData } = useGetCategoriaList(1, 1000);
  const { data: gruposData } = useGetGrupoList(1, 1000);

  const getFormFields = useCallback(() => {
    const fields = FORM_FIELDS_INVENTORY[selectedCategory];
    
    if (selectedCategory === 'grupo' && categoriasData?.data) {
      return fields.map(field => {
        if (field.name === 'codigoCategoria') {
          return {
            ...field,
            options: categoriasData.data
          };
        }
        return field;
      });
    }

    if (selectedCategory === 'seccion' && gruposData?.data) {
      return fields.map(field => {
        if (field.name === 'codigoGrupo') {
          return {
            ...field,
            options: gruposData.data
          };
        }
        return field;
      });
    }
    
    return fields;
  }, [selectedCategory, categoriasData, gruposData]);

  useEffect(() => {
    setCurrentPage(1);
    setHasMore(true);
    setAccumulatedItems([]);
  }, [selectedCategory]);

  useEffect(() => {
    const processData = (data: any) => {
      if (!data) return;
      
      const totalPages = data.totalPaginas;
      setHasMore(currentPage < totalPages);
      
      if (currentPage === 1) {
        setAccumulatedItems(data.data || []);
      } else {
        setAccumulatedItems(prev => {
          if (!data.data || data.data.length === 0) {
            return prev;
          }
          
          const existingIds = new Map(prev.map((item: any) => [item.id, true]));
          
          const newItems = data.data.filter((item: any) => !existingIds.has(item.id));
          
          if (newItems.length === 0) {
            return prev;
          }
          
          return [...prev, ...newItems];
        });
      }
    };


    switch (selectedCategory) {
      case 'almacen':
        processData(almacenData);
        break;
      case 'categoria':
        processData(categoriaData);
        break;
      case 'grupo':
        processData(grupoData);
        break;
      case 'seccion':
        processData(seccionData);
        break;
      case 'unidad':
        processData(unidadData);
        break;
      case 'talla':
        processData(tallaData);
        break;
      case 'color':
        processData(colorData);
        break;
      case 'tipodeimpuesto':
        processData(tipoDeImpuestoData);
        break;
      case 'tipodearticulo':
        processData(tipoDeArticuloData);
        break;
      case 'origen':
        processData(origenData);
        break;
      default:
        break;
    }
  }, [
    almacenData, categoriaData, grupoData, seccionData, unidadData, 
    tallaData, colorData, tipoDeImpuestoData, tipoDeArticuloData, origenData, 
    currentPage, selectedCategory, PAGE_SIZE
  ]);

  const navigateToModules = () => {
    router.replace('/Entidades');
  };

  useEffect(() => {
    const backAction = () => {
      if (formModalVisible) {
        setFormModalVisible(false);
        return true;
      }
      if (detailModalVisible) {
        setDetailModalVisible(false);
        return true;
      }
      navigation.goBack();
      return true;
    };

    const backHandlerSubscription = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandlerSubscription.remove();
  }, [formModalVisible, detailModalVisible, navigation]);

  const isLoading = selectedCategory === 'almacen' ? isLoadingAlmacen : 
                    selectedCategory === 'categoria' ? isLoadingCategoria :
                    selectedCategory === 'grupo' ? isLoadingGrupo :
                    selectedCategory === 'seccion' ? isLoadingSeccion :
                    selectedCategory === 'unidad' ? isLoadingUnidad :
                    selectedCategory === 'talla' ? isLoadingTalla :
                    selectedCategory === 'color' ? isLoadingColor :
                    selectedCategory === 'tipodeimpuesto' ? isLoadingTipoDeImpuesto :
                    selectedCategory === 'tipodearticulo' ? isLoadingTipoDeArticulo :
                    selectedCategory === 'origen' ? isLoadingOrigen : false;

  const items = useMemo(() => {
    return accumulatedItems;
  }, [accumulatedItems]);

  const filteredItems = useMemo(() => {
    return items.filter(item =>
      item.nombre.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [items, searchQuery]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      setCurrentPage(prev => prev + 1);
    }
  }, [hasMore, isLoading, currentPage]);

  const handleCreate = (formData: any) => {
    if (selectedCategory === 'almacen') {
      createAlmacenMutation.mutate(formData, {
        onSuccess: (createdItem) => {
          setAccumulatedItems(prev => [createdItem, ...prev]);
          setCurrentPage(1);
          setHasMore(true);
        },
        onError: () => {
          setCurrentPage(1);
        }
      });
    } else if (selectedCategory === 'categoria') {
      createCategoriaMutation.mutate(formData, {
        onSuccess: (createdItem) => {
          setAccumulatedItems(prev => [createdItem, ...prev]);
          setCurrentPage(1);
          setHasMore(true);
        },
        onError: () => {
          setCurrentPage(1);
        }
      });
    } else if (selectedCategory === 'grupo') {
      createGrupoMutation.mutate(formData, {
        onSuccess: (createdItem) => {
          setAccumulatedItems(prev => [createdItem, ...prev]);
          setCurrentPage(1);
          setHasMore(true);
        },
        onError: () => {
          setCurrentPage(1);
        }
      });
    } else if (selectedCategory === 'seccion') {
      createSeccionMutation.mutate(formData, {
        onSuccess: (createdItem) => {
          setAccumulatedItems(prev => [createdItem, ...prev]);
          setCurrentPage(1);
          setHasMore(true);
        },
        onError: () => {
          setCurrentPage(1);
        }
      });
    } else if (selectedCategory === 'unidad') {
      createUnidadMutation.mutate(formData, {
        onSuccess: (createdItem) => {
          setAccumulatedItems(prev => [createdItem, ...prev]);
          setCurrentPage(1);
          setHasMore(true);
        },
        onError: () => {
          setCurrentPage(1);
        }
      });
    } else if (selectedCategory === 'talla') {
      createTallaMutation.mutate(formData, {
        onSuccess: (createdItem) => {
          setAccumulatedItems(prev => [createdItem, ...prev]);
          setCurrentPage(1);
          setHasMore(true);
        },
        onError: () => {
          setCurrentPage(1);
        }
      });
    } else if (selectedCategory === 'color') {
      createColorMutation.mutate(formData, {
        onSuccess: (createdItem) => {
          setAccumulatedItems(prev => [createdItem, ...prev]);
          setCurrentPage(1);
          setHasMore(true);
        },
        onError: () => {
          setCurrentPage(1);
        }
      });
    } else if (selectedCategory === 'tipodeimpuesto') {
      createTipoDeImpuestoMutation.mutate(formData, {
        onSuccess: (createdItem) => {
          setAccumulatedItems(prev => [createdItem, ...prev]);
          setCurrentPage(1);
          setHasMore(true);
        },
        onError: () => {
          setCurrentPage(1);
        }
      });
    } else if (selectedCategory === 'tipodearticulo') {
      createTipoDeArticuloMutation.mutate(formData, {
        onSuccess: (createdItem) => {
          setAccumulatedItems(prev => [createdItem, ...prev]);
          setCurrentPage(1);
          setHasMore(true);
        },
        onError: () => {
          setCurrentPage(1);
        }
      });
    } else if (selectedCategory === 'origen') {
      createOrigenMutation.mutate(formData, {
        onSuccess: (createdItem) => {
          setAccumulatedItems(prev => [createdItem, ...prev]);
          setCurrentPage(1);
          setHasMore(true);
        },
        onError: () => {
          setCurrentPage(1);
        }
      });
    }
    setFormModalVisible(false);
  };

  const handleUpdate = (formData: any) => {
    if (!currentItem) return;

    if (selectedCategory === 'almacen') {
      updateAlmacenMutation.mutate({ id: currentItem.id, formData }, {
        onSuccess: (updatedItem) => {
          setAccumulatedItems(prev => 
            prev.map(item => item.id === currentItem.id ? updatedItem : item)
          );
        },
        onError: () => {
          setCurrentPage(1);
        }
      });
    } else if (selectedCategory === 'categoria') {
      updateCategoriaMutation.mutate({ id: currentItem.id, formData }, {
        onSuccess: (updatedItem) => {
          setAccumulatedItems(prev => 
            prev.map(item => item.id === currentItem.id ? updatedItem : item)
          );
        },
        onError: () => {
          setCurrentPage(1);
        }
      });
    } else if (selectedCategory === 'grupo') {
      updateGrupoMutation.mutate({ id: currentItem.id, formData }, {
        onSuccess: (updatedItem) => {
          setAccumulatedItems(prev => 
            prev.map(item => item.id === currentItem.id ? updatedItem : item)
          );
        },
        onError: () => {
          setCurrentPage(1);
        }
      });
    } else if (selectedCategory === 'seccion') {
      updateSeccionMutation.mutate({ id: currentItem.id, formData }, {
        onSuccess: (updatedItem) => {
          setAccumulatedItems(prev => 
            prev.map(item => item.id === currentItem.id ? updatedItem : item)
          );
        },
        onError: () => {
          setCurrentPage(1);
        }
      });
    } else if (selectedCategory === 'unidad') {
      updateUnidadMutation.mutate({ id: currentItem.id, formData }, {
        onSuccess: (updatedItem) => {
          setAccumulatedItems(prev => 
            prev.map(item => item.id === currentItem.id ? updatedItem : item)
          );
        },
        onError: () => {
          setCurrentPage(1);
        }
      });
    } else if (selectedCategory === 'talla') {
      updateTallaMutation.mutate({ id: currentItem.id, formData }, {
        onSuccess: (updatedItem) => {
          setAccumulatedItems(prev => 
            prev.map(item => item.id === currentItem.id ? updatedItem : item)
          );
        },
        onError: () => {
          setCurrentPage(1);
        }
      });
    } else if (selectedCategory === 'color') {
      updateColorMutation.mutate({ id: currentItem.id, formData }, {
        onSuccess: (updatedItem) => {
          setAccumulatedItems(prev => 
            prev.map(item => item.id === currentItem.id ? updatedItem : item)
          );
        },
        onError: () => {
          setCurrentPage(1);
        }
      });
    } else if (selectedCategory === 'tipodeimpuesto') {
      updateTipoDeImpuestoMutation.mutate({ id: currentItem.id, formData }, {
        onSuccess: (updatedItem) => {
          setAccumulatedItems(prev => 
            prev.map(item => item.id === currentItem.id ? updatedItem : item)
          );
        },
        onError: () => {
          setCurrentPage(1);
        }
      });
    } else if (selectedCategory === 'tipodearticulo') {
      updateTipoDeArticuloMutation.mutate({ id: currentItem.id, formData }, {
        onSuccess: (updatedItem) => {
          setAccumulatedItems(prev => 
            prev.map(item => item.id === currentItem.id ? updatedItem : item)
          );
        },
        onError: () => {
          setCurrentPage(1);
        }
      });
    } else if (selectedCategory === 'origen') {
      updateOrigenMutation.mutate({ id: currentItem.id, formData }, {
        onSuccess: (updatedItem) => {
          setAccumulatedItems(prev => 
            prev.map(item => item.id === currentItem.id ? updatedItem : item)
          );
        },
        onError: () => {
          setCurrentPage(1);
        }
      });
    }

    setFormModalVisible(false);
    setDetailModalVisible(false);
  };

  const handleDelete = (id: number) => {
    if (selectedCategory === 'almacen') {
      deleteAlmacenMutation.mutate(id, {
        onSuccess: () => {
          setAccumulatedItems(prev => prev.filter(item => item.id !== id));
          setCurrentPage(1);
          setHasMore(true);
        },
        onError: () => {
          setCurrentPage(1);
        }
      });
    } else if (selectedCategory === 'categoria') {
      deleteCategoriaMutation.mutate(id, {
        onSuccess: () => {
          setAccumulatedItems(prev => prev.filter(item => item.id !== id));
          setCurrentPage(1);
          setHasMore(true);
        },
        onError: () => {
          setCurrentPage(1);
        }
      });
    } else if (selectedCategory === 'grupo') {
      deleteGrupoMutation.mutate(id, {
        onSuccess: () => {
          setAccumulatedItems(prev => prev.filter(item => item.id !== id));
          setCurrentPage(1);
          setHasMore(true);
        },
        onError: () => {
          setCurrentPage(1);
        }
      });
    } else if (selectedCategory === 'seccion') {
      deleteSeccionMutation.mutate(id, {
        onSuccess: () => {
          setAccumulatedItems(prev => prev.filter(item => item.id !== id));
          setCurrentPage(1);
          setHasMore(true);
        },
        onError: () => {
          setCurrentPage(1);
        }
      });
    } else if (selectedCategory === 'unidad') {
      deleteUnidadMutation.mutate(id, {
        onSuccess: () => {
          setAccumulatedItems(prev => prev.filter(item => item.id !== id));
          setCurrentPage(1);
          setHasMore(true);
        },
        onError: () => {
          setCurrentPage(1);
        }
      });
    } else if (selectedCategory === 'talla') {
      deleteTallaMutation.mutate(id, {
        onSuccess: () => {
          setAccumulatedItems(prev => prev.filter(item => item.id !== id));
          setCurrentPage(1);
          setHasMore(true);
        },
        onError: () => {
          setCurrentPage(1);
        }
      });
    } else if (selectedCategory === 'color') {
      deleteColorMutation.mutate(id, {
        onSuccess: () => {
          setAccumulatedItems(prev => prev.filter(item => item.id !== id));
          setCurrentPage(1);
          setHasMore(true);
        },
        onError: () => {
          setCurrentPage(1);
        }
      });
    } else if (selectedCategory === 'tipodeimpuesto') {
      deleteTipoDeImpuestoMutation.mutate(id, {
        onSuccess: () => {
          setAccumulatedItems(prev => prev.filter(item => item.id !== id));
          setCurrentPage(1);
          setHasMore(true);
        },
        onError: () => {
          setCurrentPage(1);
        }
      });
    } else if (selectedCategory === 'tipodearticulo') {
      deleteTipoDeArticuloMutation.mutate(id, {
        onSuccess: () => {
          setAccumulatedItems(prev => prev.filter(item => item.id !== id));
          setCurrentPage(1);
          setHasMore(true);
        },
        onError: () => {
          setCurrentPage(1);
        }
      });
    } else if (selectedCategory === 'origen') {
      deleteOrigenMutation.mutate(id, {
        onSuccess: () => {
          setAccumulatedItems(prev => prev.filter(item => item.id !== id));
          setCurrentPage(1);
          setHasMore(true);
        },
        onError: () => {
          setCurrentPage(1);
        }
      });
    }
    setDetailModalVisible(false);
  };

  const showItemDetails = (item: any) => {
    setCurrentItem(item);
    setDetailModalVisible(true);
  };

  const openEditModal = (item: any) => {
    setCurrentItem(item);
    setIsEditing(true);
    setFormModalVisible(true);
  };

  const renderItem = ({ item }: { item: any }) => {
    return (
      <ItemArticle
        dataCategory={categoriasData?.data || []}
        dataGrupo={gruposData?.data || []}
        item={item}
        category={selectedCategory}
        onPress={showItemDetails}
      />
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      <DynamicHeader
        title="Inventario"
        description="Gestión de inventario y productos"
        backgroundColor={themes.inventory.headerColor}
        textColor={themes.inventory.headerTextColor}
        lightTextColor={themes.inventory.buttonTextColor}
        buttonColor={themes.inventory.buttonColor}
        viewType={viewType}
        setViewType={setViewType}
        navigateToModules={navigateToModules}
      />

      <DynamicCategorySelector
        categories={CATEGORIES}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        viewType={viewType}
      />

      <DynamicSearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onAddPress={() => {
          setCurrentItem(null);
          setIsEditing(false);
          setFormModalVisible(true);
        }}
        placeholder="Buscar en inventario..."
        addButtonText="Agregar Item"
        buttonColor={themes.inventory.buttonColor}
        buttonTextColor={themes.inventory.buttonTextColor}
      />

      <DynamicItemList
        items={filteredItems}
        showItemDetails={showItemDetails}
        openEditModal={openEditModal}
        handleDelete={handleDelete}
        onLoadMore={handleLoadMore}
        hasMore={hasMore}
        selectedCategory={selectedCategory}
        renderItem={renderItem}
        emptyStateComponent={
          <DynamicEmptyState
            icon="document-text-outline"
            title="No hay elementos en la lista"
            subtitle="Agrega un nuevo elemento para comenzar"
          />
        }
        keyExtractor={(item) => item.id.toString()}
      />

      <DynamicFormModal
        visible={formModalVisible}
        onClose={() => setFormModalVisible(false)}
        isEditing={isEditing}
        currentItem={currentItem}
        handleCreate={handleCreate}
        handleUpdate={handleUpdate}
        selectedCategory={selectedCategory}
        schema={inventorySchema[selectedCategory]}
        defaultValues={DEFAULT_VALUES_INVENTORY[selectedCategory]}
        categoryTitles={CATEGORY_TITLES}
        formFields={getFormFields()}
        headerColor={themes.inventory.formHeaderColor}
        headerTextColor={themes.inventory.formHeaderTextColor}
        buttonColor={themes.inventory.formButtonColor}
        buttonTextColor={themes.inventory.formButtonTextColor}
        switchActiveColor={themes.inventory.switchActiveColor}
        switchInactiveColor={themes.inventory.switchInactiveColor}
      />

      <DynamicItemModal
        visible={detailModalVisible}
        onClose={() => setDetailModalVisible(false)}
        currentItem={currentItem}
        openEditModal={openEditModal}
        handleDelete={handleDelete}
        mainTitleField={{ label: 'Nombre', value: currentItem?.nombre || '' }}
        badges={[
          {
            label: 'Stock',
            value: currentItem?.otrosN1 ? currentItem.otrosN1 > 0 : false,
            activeIcon: 'ellipse',
            inactiveIcon: 'close-circle',
            color: themes.inventory.badgeColor
          }
        ]}
        statusField={{
          value: currentItem ? !currentItem.suspendido : false,
          activeText: 'Activo',
          inactiveText: 'Inactivo'
        }}
        systemFields={currentItem ? [
          { label: 'ID', value: String(currentItem.id) },
          { label: 'Fecha de Registro', value: currentItem.fechaRegistro ? new Date(currentItem.fechaRegistro).toLocaleDateString() : '' },
          { label: 'Usuario Registro', value: currentItem.usuarioRegistroNombre || '' },
          ...(currentItem.fechaModificacion ? [{ label: 'Última Modificación', value: new Date(currentItem.fechaModificacion).toLocaleDateString() }] : [])
        ] : []}
        headerColor={themes.inventory.itemHeaderColor}
        headerTextColor={themes.inventory.itemHeaderTextColor}
        badgeColor={themes.inventory.badgeColor}
        editButtonColor={themes.inventory.editButtonColor}
        editButtonTextColor={themes.inventory.editButtonTextColor}
        deleteButtonColor={themes.inventory.deleteButtonColor}
        deleteButtonTextColor={themes.inventory.deleteButtonTextColor}
      />
    </View>
  );
};

export default EntInventario;
