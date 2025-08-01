import { ItemArticle } from '@/components/Entidades/Inventario/ItemArticle';
import DynamicCategorySelector from '@/components/Entidades/shared/DynamicCategorySelector';
import DynamicEmptyState from '@/components/Entidades/shared/DynamicEmptyState';
import DynamicFilterBar, { FilterState } from '@/components/Entidades/shared/DynamicFilterBar';
import DynamicFormModal from '@/components/Entidades/shared/DynamicFormModal';
import DynamicHeader from '@/components/Entidades/shared/DynamicHeader';
import DynamicItemList from '@/components/Entidades/shared/DynamicItemList';
import DynamicItemModal, { DynamicItemModalRef } from '@/components/Entidades/shared/DynamicItemModal';
import DynamicLoadingState from '@/components/Entidades/shared/DynamicLoadingState';
import DynamicSearchBar from '@/components/Entidades/shared/DynamicSearchBar';
import FormCompleteProcess from '@/components/Entidades/shared/FormCompleteProcess';
import { themes } from '@/components/Entidades/shared/theme';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { useAlmacen } from '@/hooks/Inventario/useAlmacen';
import { useArticulo } from '@/hooks/Inventario/useArticulo';
import { useArticuloListaDePrecio } from '@/hooks/Inventario/useArticuloListaDePrecio';
import { useCategoria } from '@/hooks/Inventario/useCategoria';
import { useColor } from '@/hooks/Inventario/useColor';
import { useGrupo } from '@/hooks/Inventario/useGrupo';
import { useOrigen } from '@/hooks/Inventario/useOrigen';
import { usePresentacion } from '@/hooks/Inventario/usePresentacion';
import { useSeccion } from '@/hooks/Inventario/useSeccion';
import { useTalla } from '@/hooks/Inventario/useTalla';
import { useTipoDeArticulo } from '@/hooks/Inventario/useTipoDeArticulo';
import { useTipoDeImpuesto } from '@/hooks/Inventario/useTipoDeImpuesto';
import { DEFAULT_VALUES_INVENTORY } from '@/utils/const/defaultValues';
import { FORM_FIELDS_INVENTORY } from '@/utils/const/formFields';
import { applyFilters } from '@/utils/helpers/filterUtils';
import { inventorySchema } from '@/utils/schemas/inventorySchema';
import { useNavigation } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler, View } from 'react-native';

const PAGE_SIZE = 1000; // Load all items at once

const CATEGORIES = [
  { id: 'articulo', label: 'Artículo', icon: 'cube' as const },
  { id: 'almacen', label: 'Almacén', icon: 'business' as const },
  { id: 'presentacion', label: 'Presentación', icon: 'scale' as const },
  { id: 'categoria', label: 'Categoría', icon: 'list' as const },
  { id: 'grupo', label: 'Grupo', icon: 'people' as const },
  { id: 'seccion', label: 'Sección', icon: 'layers' as const },
  { id: 'origen', label: 'Origen', icon: 'globe' as const },
  { id: 'color', label: 'Color', icon: 'color-palette' as const },
  { id: 'talla', label: 'Talla', icon: 'resize' as const },
  { id: 'tipodearticulo', label: 'Tipo de Artículo', icon: 'cube-outline' as const },
  { id: 'tipodeimpuesto', label: 'Tipo de Impuesto', icon: 'calculator' as const },
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
  presentacion: 'Presentación',
  articulo: 'Artículo'
};

type CategoryId = keyof typeof CATEGORY_TITLES | 'articulo';

const EntInventario: React.FC = () => {
  const [backendFormError, setBackendFormError] = useState<string | null>(null);
  const navigation = useNavigation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { category } = useLocalSearchParams<{ category?: string }>();
  const {
    showCreateSuccess,
    showUpdateSuccess,
    showDeleteSuccess,
    showError
  } = useNotificationContext();
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
    useGetPresentacionList,
    useCreatePresentacion,
    useUpdatePresentacion,
    useDeletePresentacion
  } = usePresentacion();

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

  // Hook para obtener lista de precios (solo para artículos)
  const { useGetArticuloListaDePrecioList } = useArticuloListaDePrecio();


  // State management
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewType, setViewType] = useState<'chips' | 'dropdown'>('chips');
  const [formModalVisible, setFormModalVisible] = useState<boolean>(false);
  const [detailModalVisible, setDetailModalVisible] = useState<boolean>(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('articulo');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [accumulatedItems, setAccumulatedItems] = useState<any[]>([]); // All items from backend
  const [displayedItemsCount, setDisplayedItemsCount] = useState<number>(10); // How many to show
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Debug refreshing state
  useEffect(() => {
    console.log('🔄 Refreshing state changed:', refreshing);
  }, [refreshing]);
  
  const ITEMS_PER_PAGE = 10; // Show 10 items at a time
  const itemModalRef = useRef<DynamicItemModalRef>(null);

  // Filter state
  const [filterState, setFilterState] = useState<FilterState>({
    sortBy: 'fechaModificacion',
    sortOrder: 'desc',
    status: 'all',
    dateFilter: 'all'
  });
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filterState.sortBy !== 'fechaModificacion' || filterState.sortOrder !== 'desc') count++;
    if (filterState.status !== 'all') count++;
    if (filterState.dateFilter !== 'all') count++;
    return count;
  };

  useEffect(() => {
    const backAction = () => {
      if (formModalVisible) {
        setFormModalVisible(false);
        setBackendFormError(null); // Clear backend error when modal is closed by back button
        return true; // Prevent default behavior (exit app)
      }
      return false; // Default behavior
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [formModalVisible]);

  // React Query hooks - Always load page 1 with all items
  const { data: almacenData, isLoading: isLoadingAlmacen } = useGetAlmacenList(1, PAGE_SIZE);
  const { data: categoriaData, isLoading: isLoadingCategoria } = useGetCategoriaList(1, PAGE_SIZE);
  const { data: grupoData, isLoading: isLoadingGrupo } = useGetGrupoList(1, PAGE_SIZE);
  const { data: seccionData, isLoading: isLoadingSeccion } = useGetSeccionList(1, PAGE_SIZE);
  const { data: presentacionData, isLoading: isLoadingPresentacion } = useGetPresentacionList(1, PAGE_SIZE);
  const { data: tallaData, isLoading: isLoadingTalla } = useGetTallaList(1, PAGE_SIZE);
  const { data: colorData, isLoading: isLoadingColor } = useGetColorList(1, PAGE_SIZE);
  const { data: tipoDeImpuestoData, isLoading: isLoadingTipoDeImpuesto } = useGetTipoDeImpuestoList(1, PAGE_SIZE);
  const { data: tipoDeArticuloData, isLoading: isLoadingTipoDeArticulo } = useGetTipoDeArticuloList(1, PAGE_SIZE);
  const { data: origenData, isLoading: isLoadingOrigen } = useGetOrigenList(1, PAGE_SIZE);

  // Lista de precios (solo se carga cuando selectedCategory es 'articulo')
  const { data: articuloListaPreciosData } = useGetArticuloListaDePrecioList(1, 1000);
  // Articulo hooks
  const {
    useGetArticuloList,
    useCreateArticulo,
    useUpdateArticulo,
    useDeleteArticulo
  } = useArticulo();
  const createArticuloMutation = useCreateArticulo();
  const updateArticuloMutation = useUpdateArticulo();
  const deleteArticuloMutation = useDeleteArticulo();
  const { data: articuloData, isLoading: isLoadingArticulo } = useGetArticuloList(1, PAGE_SIZE);
  // Listas para selects de articulo
  const { data: gruposDataArticulo } = useGetGrupoList(1, 1000);
  const { data: coloresDataArticulo } = useGetColorList(1, 1000);
  const { data: tallasDataArticulo } = useGetTallaList(1, 1000);
  const { data: tiposArticuloDataArticulo } = useGetTipoDeArticuloList(1, 1000);
  const { data: impuestosDataArticulo } = useGetTipoDeImpuestoList(1, 1000);
  const { data: presentacionesDataArticulo } = useGetPresentacionList(1, 1000);

  const createAlmacenMutation = useCreateAlmacen();
  const updateAlmacenMutation = useUpdateAlmacen();
  const deleteAlmacenMutation = useDeleteAlmacen();

  const createCategoriaMutation = useCreateCategoria();
  const updateCategoriaMutation = useUpdateCategoria();
  const deleteCategoriaMutation = useDeleteCategoria();

  const createGrupoMutation = useCreateGrupo();
  const updateGrupoMutation = useUpdateGrupo();
  const deleteGrupoMutation = useDeleteGrupo();

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

  const createSeccionMutation = useCreateSeccion();
  const updateSeccionMutation = useUpdateSeccion();
  const deleteSeccionMutation = useDeleteSeccion();

  const createPresentacionMutation = useCreatePresentacion();
  const updatePresentacionMutation = useUpdatePresentacion();
  const deletePresentacionMutation = useDeletePresentacion();

  const { data: categoriasData } = useGetCategoriaList(1, 1000);
  const { data: gruposData } = useGetGrupoList(1, 1000);

  const getFormFields = useCallback(() => {
    const fields = FORM_FIELDS_INVENTORY[selectedCategory];
    if (selectedCategory === 'grupo' && categoriasData?.data) {
      return fields.map(field => {
        if (field.name === 'idCategoria') {
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
        if (field.name === 'idGrupo') {
          return {
            ...field,
            options: gruposData.data
          };
        }
        return field;
      });
    }
    if (selectedCategory === 'articulo') {
      return fields.map(field => {
        if (field.name === 'idGrupo' && gruposDataArticulo?.data) {
          return { ...field, options: gruposDataArticulo.data };
        }
        if (field.name === 'idColor' && coloresDataArticulo?.data) {
          return { ...field, options: coloresDataArticulo.data };
        }
        if (field.name === 'idTalla' && tallasDataArticulo?.data) {
          return { ...field, options: tallasDataArticulo.data };
        }
        if (field.name === 'idTipoArticulo' && tiposArticuloDataArticulo?.data) {
          return { ...field, options: tiposArticuloDataArticulo.data };
        }
        if (field.name === 'idImpuesto' && impuestosDataArticulo?.data) {
          return { ...field, options: impuestosDataArticulo.data };
        }
        if (field.name === 'presentaciones' && presentacionesDataArticulo?.data) {
          return { ...field, options: presentacionesDataArticulo.data };
        }
        return field;
      });
    }
    return fields;
  }, [selectedCategory, categoriasData, gruposData, gruposDataArticulo, coloresDataArticulo, tallasDataArticulo, tiposArticuloDataArticulo, impuestosDataArticulo, presentacionesDataArticulo]);

  useEffect(() => {
    setCurrentPage(1);
    setHasMore(true);
    setAccumulatedItems([]);
    setDisplayedItemsCount(ITEMS_PER_PAGE); // Reset progressive pagination
  }, [selectedCategory, ITEMS_PER_PAGE]);

  // Reset progressive pagination when filters or search change
  useEffect(() => {
    setDisplayedItemsCount(ITEMS_PER_PAGE);
  }, [filterState, searchQuery, ITEMS_PER_PAGE]);

  // Update selected category when URL parameter changes
  useEffect(() => {
    if (category && category !== selectedCategory) {
      setSelectedCategory(category as CategoryId);
    } else if (!category && selectedCategory !== 'articulo') {
      // Reset to default if no category parameter
      setSelectedCategory('articulo');
    }
  }, [category]); // Remove selectedCategory from dependencies to avoid infinite loop

  useEffect(() => {
    const processData = (data: any) => {
      console.log('📊 ProcessData called:', { 
        selectedCategory, 
        dataExists: !!data, 
        dataLength: data?.data?.length
      });
      
      if (!data) {
        return;
      }

      // SIMPLE: Just set all the data from backend, no pagination logic
      const allItems = data.data || [];
      console.log('📊 Setting ALL items from backend:', allItems.length);
      console.log('📊 First 5 items:', allItems.slice(0, 5).map(item => ({ id: item.id, nombre: item.nombre, fechaRegistro: item.fechaRegistro, fechaModificacion: item.fechaModificacion })));
      
      setAccumulatedItems(allItems);
      setHasMore(false); // No more pages needed
      setIsLoadingMore(false);
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
      case 'presentacion':
        processData(presentacionData);
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
      case 'articulo':
        processData(articuloData);
        break;
      default:
        break;
    }
  }, [
    almacenData, categoriaData, grupoData, seccionData, presentacionData,
    tallaData, colorData, tipoDeImpuestoData, tipoDeArticuloData, origenData,
    articuloData,
    selectedCategory
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
          selectedCategory === 'presentacion' ? isLoadingPresentacion :
            selectedCategory === 'talla' ? isLoadingTalla :
              selectedCategory === 'color' ? isLoadingColor :
                selectedCategory === 'tipodeimpuesto' ? isLoadingTipoDeImpuesto :
                  selectedCategory === 'tipodearticulo' ? isLoadingTipoDeArticulo :
                    selectedCategory === 'origen' ? isLoadingOrigen :
                      selectedCategory === 'articulo' ? isLoadingArticulo : false;

  // All items from backend (used for search/filtering)
  const allItems = useMemo(() => {
    return accumulatedItems;
  }, [accumulatedItems]);

  // All filtered items (search/filter applied to ALL data)
  const allFilteredItems = useMemo(() => {
    console.log('🔍 All items count:', allItems.length);
    console.log('🔍 First 3 items:', allItems.slice(0, 3).map(item => ({ id: item.id, nombre: item.nombre, fechaRegistro: item.fechaRegistro, fechaModificacion: item.fechaModificacion })));
    
    // ALWAYS APPLY FILTERS to ALL items - with fechaModificacion desc as default behavior
    console.log('🔍 APPLYING FILTERS to ALL ITEMS - Default: fechaModificacion desc');
    const filtered = applyFilters(allItems, filterState, searchQuery);
    console.log('🔍 Total filtered items count:', filtered.length);
    console.log('🔍 Current filter state:', filterState);
    
    return filtered;
  }, [allItems, filterState, searchQuery]);

  // Items to display (progressive pagination)
  const displayedItems = useMemo(() => {
    const itemsToShow = allFilteredItems.slice(0, displayedItemsCount);
    console.log('📱 Displaying items:', itemsToShow.length, 'of', allFilteredItems.length);
    return itemsToShow;
  }, [allFilteredItems, displayedItemsCount]);

  // Check if there are more items to show
  const hasMoreToShow = useMemo(() => {
    return displayedItemsCount < allFilteredItems.length;
  }, [displayedItemsCount, allFilteredItems.length]);

  const handleLoadMore = useCallback(() => {
    if (hasMoreToShow && !isLoadingMore) {
      console.log('📊 Loading more items...', 'Current:', displayedItemsCount, 'Adding:', ITEMS_PER_PAGE);
      setIsLoadingMore(true);
      
      // Simulate a small delay for better UX
      setTimeout(() => {
        setDisplayedItemsCount(prev => prev + ITEMS_PER_PAGE);
        setIsLoadingMore(false);
      }, 300);
    }
  }, [hasMoreToShow, isLoadingMore, displayedItemsCount, ITEMS_PER_PAGE]);

  const handleRefresh = useCallback(async () => {
    console.log('🔄 Starting refresh...');
    try {
      setRefreshing(true);
      setAccumulatedItems([]);
      setDisplayedItemsCount(ITEMS_PER_PAGE); // Reset to show only first 10
      setIsLoadingMore(false); // Reset loading state

      // Invalidate and remove from cache to force fresh data from backend
      console.log('🔄 Invalidating and removing queries for category:', selectedCategory);
      
      // Remove from cache completely with correct queryKey structure
      queryClient.removeQueries({
        queryKey: [selectedCategory, "list"]
      });
      
      // Invalidate to force refetch
      await queryClient.invalidateQueries({
        queryKey: [selectedCategory, "list"]
      });
      
      // Wait a bit for cache cleanup
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Force explicit refetch from backend
      await queryClient.refetchQueries({
        queryKey: [selectedCategory, "list"],
        type: 'active'
      });
      
      console.log('🔄 Refresh completed successfully');
    } catch (error) {
      console.error('🔄 Error refreshing data:', error);
      showError('Error', 'No se pudo actualizar los datos');
    } finally {
      setRefreshing(false);
      console.log('🔄 Refresh state reset');
    }
  }, [queryClient, selectedCategory, ITEMS_PER_PAGE]);

  const handleCreate = async (formData: any): Promise<boolean | any> => {
    setBackendFormError(null);
    return new Promise((resolve) => {
      const commonOnSuccess = async (createdItem: any, entityName: string) => {
        // Clear items and reset progressive pagination
        setAccumulatedItems([]);
        setDisplayedItemsCount(ITEMS_PER_PAGE);
        
        // Force refresh data to get updated list with new item
        await queryClient.invalidateQueries({
          queryKey: [selectedCategory, "list"]
        });
        
        showCreateSuccess(`el ${entityName.toLowerCase()}`);

        // For Articulo, return the full created item, otherwise return true
        if (selectedCategory === 'articulo') {
          resolve(createdItem);
        } else {
          resolve(true);
        }
      };

      const commonOnError = (error: any, entityType: string) => {
        const errorMessage = error.response?.data?.mensaje || error.message || `Error al crear ${entityType.toLowerCase()}`;
        setBackendFormError(errorMessage);
        resolve(false);
      };

      if (selectedCategory === 'almacen') {
        createAlmacenMutation.mutate(formData, {
          onSuccess: (item) => commonOnSuccess(item, CATEGORY_TITLES.almacen),
          onError: (err) => commonOnError(err, CATEGORY_TITLES.almacen)
        });
      } else if (selectedCategory === 'categoria') {
        createCategoriaMutation.mutate(formData, {
          onSuccess: (item) => commonOnSuccess(item, CATEGORY_TITLES.categoria),
          onError: (err) => commonOnError(err, CATEGORY_TITLES.categoria)
        });
      } else if (selectedCategory === 'grupo') {
        createGrupoMutation.mutate(formData, {
          onSuccess: (item) => commonOnSuccess(item, CATEGORY_TITLES.grupo),
          onError: (err) => commonOnError(err, CATEGORY_TITLES.grupo)
        });
      } else if (selectedCategory === 'seccion') {
        createSeccionMutation.mutate(formData, {
          onSuccess: (item) => commonOnSuccess(item, CATEGORY_TITLES.seccion),
          onError: (err) => commonOnError(err, CATEGORY_TITLES.seccion)
        });
      } else if (selectedCategory === 'presentacion') {
        createPresentacionMutation.mutate(formData, {
          onSuccess: (item) => commonOnSuccess(item, CATEGORY_TITLES.presentacion),
          onError: (err) => commonOnError(err, CATEGORY_TITLES.presentacion)
        });
      } else if (selectedCategory === 'talla') {
        createTallaMutation.mutate(formData, {
          onSuccess: (item) => commonOnSuccess(item, CATEGORY_TITLES.talla),
          onError: (err) => commonOnError(err, CATEGORY_TITLES.talla)
        });
      } else if (selectedCategory === 'color') {
        createColorMutation.mutate(formData, {
          onSuccess: (item) => commonOnSuccess(item, CATEGORY_TITLES.color),
          onError: (err) => commonOnError(err, CATEGORY_TITLES.color)
        });
      } else if (selectedCategory === 'tipodeimpuesto') {
        createTipoDeImpuestoMutation.mutate(formData, {
          onSuccess: (item) => commonOnSuccess(item, CATEGORY_TITLES.tipodeimpuesto),
          onError: (err) => commonOnError(err, CATEGORY_TITLES.tipodeimpuesto)
        });
      } else if (selectedCategory === 'tipodearticulo') {
        createTipoDeArticuloMutation.mutate(formData, {
          onSuccess: (item) => commonOnSuccess(item, CATEGORY_TITLES.tipodearticulo),
          onError: (err) => commonOnError(err, CATEGORY_TITLES.tipodearticulo)
        });
      } else if (selectedCategory === 'origen') {
        createOrigenMutation.mutate(formData, {
          onSuccess: (item) => commonOnSuccess(item, CATEGORY_TITLES.origen),
          onError: (err) => commonOnError(err, CATEGORY_TITLES.origen)
        });
      } else if (selectedCategory === 'articulo') {
        createArticuloMutation.mutate(formData, {
          onSuccess: (item) => commonOnSuccess(item, CATEGORY_TITLES.articulo),
          onError: (err) => commonOnError(err, CATEGORY_TITLES.articulo)
        });
      } else {
        console.error("Categoría no manejada en handleCreate:", selectedCategory);
        setBackendFormError("Error interno: Categoría no reconocida.");
        resolve(false);
      }
    });
  };

  const handleUpdate = async (formData: any): Promise<boolean> => {
    if (!currentItem) {
      setBackendFormError("Error: No hay un ítem seleccionado para actualizar.");
      return Promise.resolve(false);
    }
    setBackendFormError(null);

    return new Promise((resolve) => {
      const commonOnSuccess = (updatedItem: any, entityName: string) => {
        queryClient.invalidateQueries({ queryKey: [selectedCategory, currentItem.id] });
        setAccumulatedItems(prev =>
          prev.map(item => (item.id === currentItem.id ? updatedItem : item))
        );
        showUpdateSuccess(`el ${entityName.toLowerCase()}`);
        resolve(true);
      };

      const commonOnError = (error: any, entityType: string) => {
        const errorMessage = error.response?.data?.mensaje || error.message || `Error al actualizar ${entityType.toLowerCase()}`;
        setBackendFormError(errorMessage);
        resolve(false);
      };

      const mutationData = { id: currentItem.id, formData };

      if (selectedCategory === 'almacen') {
        updateAlmacenMutation.mutate(mutationData, {
          onSuccess: (item) => commonOnSuccess(item, CATEGORY_TITLES.almacen),
          onError: (err) => commonOnError(err, CATEGORY_TITLES.almacen)
        });
      } else if (selectedCategory === 'categoria') {
        updateCategoriaMutation.mutate(mutationData, {
          onSuccess: (item) => commonOnSuccess(item, CATEGORY_TITLES.categoria),
          onError: (err) => commonOnError(err, CATEGORY_TITLES.categoria)
        });
      } else if (selectedCategory === 'grupo') {
        updateGrupoMutation.mutate(mutationData, {
          onSuccess: (item) => commonOnSuccess(item, CATEGORY_TITLES.grupo),
          onError: (err) => commonOnError(err, CATEGORY_TITLES.grupo)
        });
      } else if (selectedCategory === 'seccion') {
        updateSeccionMutation.mutate(mutationData, {
          onSuccess: (item) => commonOnSuccess(item, CATEGORY_TITLES.seccion),
          onError: (err) => commonOnError(err, CATEGORY_TITLES.seccion)
        });
      } else if (selectedCategory === 'presentacion') {
        updatePresentacionMutation.mutate(mutationData, {
          onSuccess: (item) => commonOnSuccess(item, CATEGORY_TITLES.presentacion),
          onError: (err) => commonOnError(err, CATEGORY_TITLES.presentacion)
        });
      } else if (selectedCategory === 'talla') {
        updateTallaMutation.mutate(mutationData, {
          onSuccess: (item) => commonOnSuccess(item, CATEGORY_TITLES.talla),
          onError: (err) => commonOnError(err, CATEGORY_TITLES.talla)
        });
      } else if (selectedCategory === 'color') {
        updateColorMutation.mutate(mutationData, {
          onSuccess: (item) => commonOnSuccess(item, CATEGORY_TITLES.color),
          onError: (err) => commonOnError(err, CATEGORY_TITLES.color)
        });
      } else if (selectedCategory === 'tipodeimpuesto') {
        updateTipoDeImpuestoMutation.mutate(mutationData, {
          onSuccess: (item) => commonOnSuccess(item, CATEGORY_TITLES.tipodeimpuesto),
          onError: (err) => commonOnError(err, CATEGORY_TITLES.tipodeimpuesto)
        });
      } else if (selectedCategory === 'tipodearticulo') {
        updateTipoDeArticuloMutation.mutate(mutationData, {
          onSuccess: (item) => commonOnSuccess(item, CATEGORY_TITLES.tipodearticulo),
          onError: (err) => commonOnError(err, CATEGORY_TITLES.tipodearticulo)
        });
      } else if (selectedCategory === 'origen') {
        updateOrigenMutation.mutate(mutationData, {
          onSuccess: (item) => commonOnSuccess(item, CATEGORY_TITLES.origen),
          onError: (err) => commonOnError(err, CATEGORY_TITLES.origen)
        });
      } else if (selectedCategory === 'articulo') {
        updateArticuloMutation.mutate(mutationData, {
          onSuccess: (item) => commonOnSuccess(item, CATEGORY_TITLES.articulo),
          onError: (err) => commonOnError(err, CATEGORY_TITLES.articulo)
        });
      } else {
        console.error("Categoría no manejada en handleUpdate:", selectedCategory);
        setBackendFormError("Error interno: Categoría no reconocida.");
        resolve(false);
      }
    });
  };

  const handleDelete = (id: number) => {
    // Only handle delete for non-article categories since articles have their own delete handling
    if (selectedCategory === 'articulo') {
      return;
    }

    const commonOnSuccess = (entityName: string) => {
      queryClient.invalidateQueries({ queryKey: [selectedCategory] });
      setAccumulatedItems(prev => prev.filter(item => item.id !== id));
      setCurrentPage(1);
      setHasMore(true);
      showDeleteSuccess(entityName);
      setDetailModalVisible(false);
    };

    const commonOnError = (error: any) => {
      console.log(error.response?.data.mensaje);
      setCurrentPage(1);
      const errorMessage = error.response?.data?.mensaje || error.message || 'Error al eliminar el elemento';
      itemModalRef.current?.showDeleteError('elemento', errorMessage);
    };

    if (selectedCategory === 'almacen') {
      deleteAlmacenMutation.mutate(id, {
        onSuccess: () => commonOnSuccess('el almacén'),
        onError: commonOnError
      });
    } else if (selectedCategory === 'categoria') {
      deleteCategoriaMutation.mutate(id, {
        onSuccess: () => commonOnSuccess('la categoría'),
        onError: commonOnError
      });
    } else if (selectedCategory === 'grupo') {
      deleteGrupoMutation.mutate(id, {
        onSuccess: () => commonOnSuccess('el grupo'),
        onError: commonOnError
      });
    } else if (selectedCategory === 'seccion') {
      deleteSeccionMutation.mutate(id, {
        onSuccess: () => commonOnSuccess('la sección'),
        onError: commonOnError
      });
    } else if (selectedCategory === 'presentacion') {
      deletePresentacionMutation.mutate(id, {
        onSuccess: () => commonOnSuccess('la presentación'),
        onError: commonOnError
      });
    } else if (selectedCategory === 'talla') {
      deleteTallaMutation.mutate(id, {
        onSuccess: () => commonOnSuccess('la talla'),
        onError: commonOnError
      });
    } else if (selectedCategory === 'color') {
      deleteColorMutation.mutate(id, {
        onSuccess: () => commonOnSuccess('el color'),
        onError: commonOnError
      });
    } else if (selectedCategory === 'tipodeimpuesto') {
      deleteTipoDeImpuestoMutation.mutate(id, {
        onSuccess: () => commonOnSuccess('el tipo de impuesto'),
        onError: commonOnError
      });
    } else if (selectedCategory === 'tipodearticulo') {
      deleteTipoDeArticuloMutation.mutate(id, {
        onSuccess: () => commonOnSuccess('el tipo de artículo'),
        onError: commonOnError
      });
    } else if (selectedCategory === 'origen') {
      deleteOrigenMutation.mutate(id, {
        onSuccess: () => commonOnSuccess('el origen'),
        onError: commonOnError
      });
    } else {
      console.warn('Unhandled category for delete:', selectedCategory);
      showError('Error', `Categoría no manejada para la eliminación: ${selectedCategory}`);
      setDetailModalVisible(false);
    }
  };

  const getSystemFieldsForCategory = (item: any) => {
    if (!item) return []

    const baseFields = [
      { label: 'ID', value: String(item.id) },
      { label: 'Fecha de Registro', value: item.fechaRegistro ? new Date(item.fechaRegistro).toLocaleDateString() : '' },
      { label: 'Fecha de Modificación', value: item.fechaModificacion ? new Date(item.fechaModificacion).toLocaleDateString() : 'N/A' },
    ];

    const additionalFields = Object.entries(item)
      .filter(([key]) => !['id', 'fechaRegistro', 'fechaModificacion', 'otrosF1', 'otrosN1', 'otrosN2', 'otrosC1', 'otrosC2', 'otrosC3', 'otrosC4', 'otrosT1', 'idColor', 'idGrupo', 'idImpuesto', 'idTalla', 'idTipoArticulo', 'idTipoImpuesto', 'presentaciones', 'fotos', ''].includes(key))
      .map(([key, value]) => ({
        label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim(),
        value: value === null || value === undefined ? 'N/A' : typeof value === 'boolean' ? (value ? 'Sí' : 'No') : String(value)
      }));

    return [...baseFields, ...additionalFields];
  };

  const showItemDetails = useCallback((item: any) => {
    if (selectedCategory === 'articulo') {
      router.push(`/(views)/(Entidades)/ArticuloDetalle?id=${item.id}`);
    } else {
      setCurrentItem(item);
      setDetailModalVisible(true);
    }
  }, [selectedCategory, router]);

  const openEditModal = useCallback((item: any) => {
    if (selectedCategory === 'articulo') {
      router.push(`/(views)/(Entidades)/ArticuloForm?id=${item.id}&isEditing=true`);
    } else {
      setBackendFormError(null); // Clear backend error when opening for edit
      setCurrentItem(item);
      setIsEditing(true);
      setFormModalVisible(true);
    }
  }, [selectedCategory, router]);

  const renderItem = useCallback(({ item }: { item: any }) => {
    return (
      <ItemArticle
        dataCategory={categoriasData?.data || []}
        dataGrupo={gruposData?.data || []}
        dataColor={coloresDataArticulo?.data || []}
        dataTalla={tallasDataArticulo?.data || []}
        dataTipoArticulo={tiposArticuloDataArticulo?.data || []}
        dataTipoImpuesto={impuestosDataArticulo?.data || []}
        articuloListaPrecios={articuloListaPreciosData?.data || []}
        item={item}
        category={selectedCategory}
        onPress={showItemDetails}
      />
    );
  }, [categoriasData?.data, gruposData?.data, coloresDataArticulo?.data, tallasDataArticulo?.data, tiposArticuloDataArticulo?.data, impuestosDataArticulo?.data, articuloListaPreciosData?.data, selectedCategory, showItemDetails]);

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
        categoryTitle={CATEGORY_TITLES[selectedCategory]}
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
          if (selectedCategory === 'articulo') {
            router.push('/(views)/(Entidades)/ArticuloForm');
          } else {
            setBackendFormError(null);
            setCurrentItem(null);
            setIsEditing(false);
            setFormModalVisible(true);
          }
        }}
        onFilterPress={() => setFilterModalVisible(true)}
        placeholder="Buscar en inventario..."
        addButtonText="Agregar Item"
        buttonColor={themes.inventory.buttonColor}
        buttonTextColor={themes.inventory.buttonTextColor}
        activeFiltersCount={getActiveFiltersCount()}
      />

      <View className="flex-1">
        {(isLoading && allItems.length === 0) ? (
          <DynamicLoadingState color={themes.inventory.buttonColor} />
        ) : (
          <DynamicItemList
            items={displayedItems}
            handleDelete={handleDelete}
            showItemDetails={showItemDetails}
            openEditModal={openEditModal}
            onLoadMore={handleLoadMore}
            onRefresh={handleRefresh}
            refreshing={refreshing}
            selectedCategory={selectedCategory}
            hasMore={hasMoreToShow}
            renderItem={renderItem}
            emptyStateComponent={
              <DynamicEmptyState
                icon="document-text-outline"
                title={`No hay ${CATEGORY_TITLES[selectedCategory].toLowerCase()}s en la lista`}
                subtitle="Agrega un nuevo elemento para comenzar"
              />
            }
            keyExtractor={(item) => item.id.toString()}
          />
        )}
      </View>

      {selectedCategory === 'articulo' ? (
        <FormCompleteProcess
          key={`${selectedCategory}-${isEditing ? currentItem?.id || 'edit' : 'create'}`}
          visible={formModalVisible}
          onClose={() => {
            setFormModalVisible(false);
            setBackendFormError(null);
            setCurrentItem(null);
            setIsEditing(false);
          }}
          backendError={backendFormError}
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
      ) : (
        <DynamicFormModal
          key={`${selectedCategory}-${isEditing ? currentItem?.id || 'edit' : 'create'}`}
          visible={formModalVisible}
          onClose={() => {
            setFormModalVisible(false);
            setBackendFormError(null);
            setCurrentItem(null);
            setIsEditing(false);
          }}
          backendError={backendFormError}
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
      )}

      <DynamicItemModal
        ref={itemModalRef}
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
        systemFields={getSystemFieldsForCategory(currentItem)}
        headerColor={themes.inventory.itemHeaderColor}
        headerTextColor={themes.inventory.itemHeaderTextColor}
        badgeColor={themes.inventory.badgeColor}
        editButtonColor={themes.inventory.editButtonColor}
        editButtonTextColor={themes.inventory.editButtonTextColor}
        deleteButtonColor={themes.inventory.deleteButtonColor}
        deleteButtonTextColor={themes.inventory.deleteButtonTextColor}
        deleteButtonBorderColor={themes.inventory.deleteButtonBorderColor}
      />

      <DynamicFilterBar
        filterState={filterState}
        onFilterChange={setFilterState}
        isVisible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        buttonColor={themes.inventory.buttonColor}
        buttonTextColor={themes.inventory.buttonTextColor}
        sortOptions={[
          { id: 'nombre', label: 'Nombre', icon: 'text' },
          { id: 'fechaRegistro', label: 'Fecha de registro', icon: 'calendar' },
          { id: 'fechaModificacion', label: 'Fecha de modificación', icon: 'time' }
        ]}
        enableStatusFilter={true}
        enableDateFilter={true}
      />
    </View>
  );
};

export default EntInventario;
