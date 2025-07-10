import { ItemArticle } from '@/components/Entidades/Inventario/ItemArticle';
import DynamicCategorySelector from '@/components/Entidades/shared/DynamicCategorySelector';
import DynamicEmptyState from '@/components/Entidades/shared/DynamicEmptyState';
import DynamicFormModal from '@/components/Entidades/shared/DynamicFormModal';
import FormCompleteProcess from '@/components/Entidades/shared/FormCompleteProcess';
import DynamicHeader from '@/components/Entidades/shared/DynamicHeader';
import DynamicItemList from '@/components/Entidades/shared/DynamicItemList';
import DynamicItemModal, { DynamicItemModalRef } from '@/components/Entidades/shared/DynamicItemModal';
import DynamicLoadingState from '@/components/Entidades/shared/DynamicLoadingState';
import DynamicSearchBar from '@/components/Entidades/shared/DynamicSearchBar';
import DynamicFilterBar, { FilterState } from '@/components/Entidades/shared/DynamicFilterBar';
import { themes } from '@/components/Entidades/shared/theme';
import { applyFilters } from '@/utils/helpers/filterUtils';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { useAlmacen } from '@/hooks/Inventario/useAlmacen';
import { useArticulo } from '@/hooks/Inventario/useArticulo';
import { useCategoria } from '@/hooks/Inventario/useCategoria';
import { useColor } from '@/hooks/Inventario/useColor';
import { useGrupo } from '@/hooks/Inventario/useGrupo';
import { useOrigen } from '@/hooks/Inventario/useOrigen';
import { useSeccion } from '@/hooks/Inventario/useSeccion';
import { useTalla } from '@/hooks/Inventario/useTalla';
import { useTipoDeArticulo } from '@/hooks/Inventario/useTipoDeArticulo';
import { useTipoDeImpuesto } from '@/hooks/Inventario/useTipoDeImpuesto';
import { usePresentacion } from '@/hooks/Inventario/usePresentacion';
import { DEFAULT_VALUES_INVENTORY } from '@/utils/const/defaultValues';
import { FORM_FIELDS_INVENTORY } from '@/utils/const/formFields';
import { inventorySchema } from '@/utils/schemas/inventorySchema';
import { useNavigation } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler, View } from 'react-native';

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
  { id: 'presentacion', label: 'Presentación', icon: 'scale' as const },
  { id: 'articulo', label: 'Artículo', icon: 'cube' as const }
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
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const itemModalRef = useRef<DynamicItemModalRef>(null);
  
  // Filter state
  const [filterState, setFilterState] = useState<FilterState>({
    sortBy: 'fechaRegistro',
    sortOrder: 'desc',
    status: 'all',
    dateFilter: 'all'
  });
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filterState.sortBy !== 'fechaRegistro' || filterState.sortOrder !== 'desc') count++;
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

  // React Query hooks
  const { data: almacenData, isLoading: isLoadingAlmacen } = useGetAlmacenList(currentPage, PAGE_SIZE);
  const { data: categoriaData, isLoading: isLoadingCategoria } = useGetCategoriaList(currentPage, PAGE_SIZE);
  const { data: grupoData, isLoading: isLoadingGrupo } = useGetGrupoList(currentPage, PAGE_SIZE);
  const { data: seccionData, isLoading: isLoadingSeccion } = useGetSeccionList(currentPage, PAGE_SIZE);
  const { data: presentacionData, isLoading: isLoadingPresentacion } = useGetPresentacionList(currentPage, PAGE_SIZE);
  const { data: tallaData, isLoading: isLoadingTalla } = useGetTallaList(currentPage, PAGE_SIZE);
  const { data: colorData, isLoading: isLoadingColor } = useGetColorList(currentPage, PAGE_SIZE);
  const { data: tipoDeImpuestoData, isLoading: isLoadingTipoDeImpuesto } = useGetTipoDeImpuestoList(currentPage, PAGE_SIZE);
  const { data: tipoDeArticuloData, isLoading: isLoadingTipoDeArticulo } = useGetTipoDeArticuloList(currentPage, PAGE_SIZE);
  const { data: origenData, isLoading: isLoadingOrigen } = useGetOrigenList(currentPage, PAGE_SIZE);
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
  const { data: articuloData, isLoading: isLoadingArticulo } = useGetArticuloList(currentPage, PAGE_SIZE);
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
                    selectedCategory === 'presentacion' ? isLoadingPresentacion :
                    selectedCategory === 'talla' ? isLoadingTalla :
                    selectedCategory === 'color' ? isLoadingColor :
                    selectedCategory === 'tipodeimpuesto' ? isLoadingTipoDeImpuesto :
                    selectedCategory === 'tipodearticulo' ? isLoadingTipoDeArticulo :
                    selectedCategory === 'origen' ? isLoadingOrigen :
                    selectedCategory === 'articulo' ? isLoadingArticulo : false;

  const items = useMemo(() => {
    return accumulatedItems;
  }, [accumulatedItems]);

  const filteredItems = useMemo(() => {
    return applyFilters(items, filterState, searchQuery);
  }, [items, filterState, searchQuery]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      setCurrentPage(prev => prev + 1);
    }
  }, [hasMore, isLoading]);

  const handleRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      setCurrentPage(1);
      setHasMore(true);
      
      // Invalidate the query to force a refetch
      await queryClient.invalidateQueries({
        queryKey: [selectedCategory]
      });
    } catch (error) {
      console.error('Error refreshing data:', error);
      showError('Error', 'No se pudo actualizar los datos');
    } finally {
      setRefreshing(false);
    }
  }, [queryClient, selectedCategory]);

  const handleCreate = async (formData: any): Promise<boolean | any> => {
    setBackendFormError(null);
    return new Promise((resolve) => {
      const commonOnSuccess = (createdItem: any, entityName: string) => {
        setAccumulatedItems(prev => [createdItem, ...prev]);
        setCurrentPage(1);
        setHasMore(true);
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
      { label:'Fecha de Modificación',value: item.fechaModificacion ? new Date(item.fechaModificacion).toLocaleDateString() : 'N/A'},
    ];

    const additionalFields = Object.entries(item)
      .filter(([key]) => !['id','fechaRegistro','fechaModificacion','otrosF1','otrosN1','otrosN2','otrosC1','otrosC2','otrosC3','otrosC4','otrosT1','idColor','idGrupo','idImpuesto','idTalla','idTipoArticulo','idTipoImpuesto','presentaciones','fotos',''].includes(key))
      .map(([key, value]) => ({
        label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim(),
        value: value === null || value === undefined ? 'N/A' : typeof value === 'boolean' ? (value ? 'Sí' : 'No') : String(value)
      }));
        
        return [...baseFields,...additionalFields];
  };

  const showItemDetails = (item: any) => {
    if (selectedCategory === 'articulo') {
      router.push(`/(views)/(Entidades)/ArticuloDetalle?id=${item.id}`);
    } else {
      setCurrentItem(item);
      setDetailModalVisible(true);
    }
  };

  const openEditModal = (item: any) => {
    if (selectedCategory === 'articulo') {
      router.push(`/(views)/(Entidades)/ArticuloForm?id=${item.id}&isEditing=true`);
    } else {
      setBackendFormError(null); // Clear backend error when opening for edit
      setCurrentItem(item);
      setIsEditing(true);
      setFormModalVisible(true);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    return (
      <ItemArticle
        dataCategory={categoriasData?.data || []}
        dataGrupo={gruposData?.data || []}
        dataColor={coloresDataArticulo?.data || []}
        dataTalla={tallasDataArticulo?.data || []}
        dataTipoArticulo={tiposArticuloDataArticulo?.data || []}
        dataTipoImpuesto={impuestosDataArticulo?.data || []}
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
          {isLoading && currentPage === 1 ? (
            <DynamicLoadingState color={themes.inventory.buttonColor} />
          ) : (
            <DynamicItemList
              items={filteredItems}
              handleDelete={handleDelete}
              showItemDetails={showItemDetails}
              openEditModal={openEditModal}
              onLoadMore={handleLoadMore}
              onRefresh={handleRefresh}
              refreshing={refreshing}
              selectedCategory={selectedCategory}
              hasMore={hasMore}
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
