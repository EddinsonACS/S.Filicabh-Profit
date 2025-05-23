import { useAcuerdoDePago } from '@/hooks/Ventas/useAcuerdoDePago';
import { useCiudad } from '@/hooks/Ventas/useCiudad';
import { useRegion } from '@/hooks/Ventas/useRegion';
import { usePais } from '@/hooks/Ventas/usePais';
import { useFormaDeEntrega } from '@/hooks/Ventas/useFormaDeEntrega';
import { useTipoPersona } from '@/hooks/Ventas/useTipoPersona';
import { useTipoVendedor } from '@/hooks/Ventas/useTipoVendedor';
import { useVendedor } from '@/hooks/Ventas/useVendedor';
import { useMoneda } from '@/hooks/Ventas/useMoneda';
import { useTasaDeCambio } from '@/hooks/Ventas/useTasaDeCambio';
import { useListaDePrecio } from '@/hooks/Ventas/useListaDePrecio';
import { useSector } from '@/hooks/Ventas/useSector';
import { useRubro } from '@/hooks/Ventas/useRubro';

import { AcuerdoDePago } from '@/core/models/Ventas/AcuerdoDePago';
import { Ciudad } from '@/core/models/Ventas/Ciudad';
import { Region } from '@/core/models/Ventas/Region';
import { Pais } from '@/core/models/Ventas/Pais';
import { FormaDeEntrega } from '@/core/models/Ventas/FormaDeEntrega';
import { TipoPersona } from '@/core/models/Ventas/TipoPersona';
import { TipoVendedor } from '@/core/models/Ventas/TipoVendedor';
import { Vendedor } from '@/core/models/Ventas/Vendedor';
import { Moneda } from '@/core/models/Ventas/Moneda';
import { TasaDeCambio } from '@/core/models/Ventas/TasaDeCambio';
import { ListaDePrecio } from '@/core/models/Ventas/ListaDePrecio';
import { Sector } from '@/core/models/Ventas/Sector';
import { Rubro } from '@/core/models/Ventas/Rubro';

import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { BackHandler, Text, TouchableOpacity, View } from 'react-native';
import { z } from 'zod';

// Import dynamic components
import DynamicCategorySelector from '@/components/Entidades/shared/DynamicCategorySelector';
import DynamicFormModal from '@/components/Entidades/shared/DynamicFormModal';
import DynamicItemList from '@/components/Entidades/shared/DynamicItemList';
import DynamicSearchBar from '@/components/Entidades/shared/DynamicSearchBar';
import DynamicItemModal from '@/components/Entidades/shared/DynamicItemModal';
import DynamicEmptyState from '@/components/Entidades/shared/DynamicEmptyState';
import DynamicLoadingState from '@/components/Entidades/shared/DynamicLoadingState';
import DynamicErrorState from '@/components/Entidades/shared/DynamicErrorState';
import DynamicHeader from '@/components/Entidades/shared/DynamicHeader';
import { themes } from '@/components/Entidades/shared/theme';

// Interfaces auxiliares
interface BaseEntity {
  id: number;
  fechaRegistro?: string;
  usuarioRegistroNombre?: string;
  fechaModificacion?: string;
  usuarioModificacionNombre?: string;
}

interface EntityWithName extends BaseEntity {
  nombre: string;
  suspendido?: boolean;
}

interface EntityWithSuspendido extends BaseEntity {
  suspendido: boolean;
}

const PAGE_SIZE = 10;

const CATEGORIES = [
  { id: 'acuerdodepago', label: 'Acuerdo de Pago', icon: 'document-text' as const },
  { id: 'ciudad', label: 'Ciudad', icon: 'business' as const },
  { id: 'region', label: 'Región', icon: 'map' as const },
  { id: 'pais', label: 'País', icon: 'globe' as const },
  { id: 'formadeentrega', label: 'Forma de Entrega', icon: 'car' as const },
  { id: 'tipopersona', label: 'Tipo de Persona', icon: 'person' as const },
  { id: 'tipovendedor', label: 'Tipo de Vendedor', icon: 'briefcase' as const },
  { id: 'vendedor', label: 'Vendedor', icon: 'person-outline' as const },
  { id: 'moneda', label: 'Moneda', icon: 'cash' as const },
  { id: 'tasadecambio', label: 'Tasa de Cambio', icon: 'swap-horizontal' as const },
  { id: 'listadeprecio', label: 'Lista de Precio', icon: 'pricetag' as const },
  { id: 'sector', label: 'Sector', icon: 'layers' as const },
  { id: 'rubro', label: 'Rubro', icon: 'albums' as const }
];

const CATEGORY_TITLES = {
  acuerdodepago: 'Acuerdo de Pago',
  ciudad: 'Ciudad',
  region: 'Región',
  pais: 'País',
  formadeentrega: 'Forma de Entrega',
  tipopersona: 'Tipo de Persona',
  tipovendedor: 'Tipo de Vendedor',
  vendedor: 'Vendedor',
  moneda: 'Moneda',
  tasadecambio: 'Tasa de Cambio',
  listadeprecio: 'Lista de Precio',
  sector: 'Sector',
  rubro: 'Rubro'
};

// Configuración de campos de formulario por entidad
const FORM_FIELDS = {
  acuerdodepago: [
    {
      name: 'nombre',
      label: 'Nombre',
      type: 'text' as const,
      required: true,
      placeholder: 'Nombre del acuerdo de pago',
      description: 'Ingrese el nombre del acuerdo de pago.'
    },
    {
      name: 'dias',
      label: 'Días',
      type: 'number' as const,
      required: true,
      placeholder: 'Días del acuerdo de pago',
      description: 'Ingrese los días del acuerdo de pago.'
    },
    {
      name: 'suspendido',
      label: 'Suspendido',
      type: 'switch' as const,
      required: false,
      description: 'Indica si el acuerdo de pago está suspendido.'
    }
  ],
  ciudad: [
    {
      name: 'nombre',
      label: 'Nombre',
      type: 'text' as const,
      required: true,
      placeholder: 'Nombre de la ciudad',
      description: 'Ingrese el nombre de la ciudad.'
    },
    {
      name: 'codigoRegion',
      label: 'Región',
      type: 'select' as const,
      required: true,
      placeholder: 'Seleccione una región',
      description: 'Seleccione la región a la que pertenece la ciudad.',
      options: [],
      optionLabel: 'nombre',
      optionValue: 'id'
    },
    {
      name: 'suspendido',
      label: 'Suspendido',
      type: 'switch' as const,
      required: false,
      description: 'Indica si la ciudad está suspendida.'
    }
  ],
  region: [
    {
      name: 'nombre',
      label: 'Nombre',
      type: 'text' as const,
      required: true,
      placeholder: 'Nombre de la región',
      description: 'Ingrese el nombre de la región.'
    },
    {
      name: 'suspendido',
      label: 'Suspendido',
      type: 'switch' as const,
      required: false,
      description: 'Indica si la región está suspendida.'
    }
  ],
  pais: [
    {
      name: 'codigo',
      label: 'Código',
      type: 'text' as const,
      required: true,
      placeholder: 'Código del país',
      description: 'Ingrese el código del país.'
    },
    {
      name: 'nombre',
      label: 'Nombre',
      type: 'text' as const,
      required: true,
      placeholder: 'Nombre del país',
      description: 'Ingrese el nombre del país.'
    },
    {
      name: 'suspendido',
      label: 'Suspendido',
      type: 'switch' as const,
      required: false,
      description: 'Indica si el país está suspendido.'
    }
  ],
  formadeentrega: [
    {
      name: 'nombre',
      label: 'Nombre',
      type: 'text' as const,
      required: true,
      placeholder: 'Nombre de la forma de entrega',
      description: 'Ingrese el nombre de la forma de entrega.'
    },
    {
      name: 'aplicaDespachoTransporte',
      label: 'Aplica Despacho Transporte',
      type: 'switch' as const,
      required: false,
      description: 'Indica si aplica despacho y transporte.'
    },
    {
      name: 'suspendido',
      label: 'Suspendido',
      type: 'switch' as const,
      required: false,
      description: 'Indica si la forma de entrega está suspendida.'
    }
  ],
  tipopersona: [
    {
      name: 'nombre',
      label: 'Nombre',
      type: 'text' as const,
      required: true,
      placeholder: 'Nombre del tipo de persona',
      description: 'Ingrese el nombre del tipo de persona.'
    },
    {
      name: 'suspendido',
      label: 'Suspendido',
      type: 'switch' as const,
      required: false,
      description: 'Indica si el tipo de persona está suspendido.'
    }
  ],
  tipovendedor: [
    {
      name: 'nombre',
      label: 'Nombre',
      type: 'text' as const,
      required: true,
      placeholder: 'Nombre del tipo de vendedor',
      description: 'Ingrese el nombre del tipo de vendedor.'
    },
    {
      name: 'suspendido',
      label: 'Suspendido',
      type: 'switch' as const,
      required: false,
      description: 'Indica si el tipo de vendedor está suspendido.'
    }
  ],
  vendedor: [
  {
    name: 'nombre',
    label: 'Nombre',
    type: 'text' as const,
    required: true,
    placeholder: 'Nombre del vendedor',
    description: 'Ingrese el nombre del vendedor.'
  },
  {
    name: 'direccion',
    label: 'Dirección',
    type: 'text' as const,
    required: false,
    placeholder: 'Dirección del vendedor',
    description: 'Ingrese la dirección del vendedor.'
  },
  {
    name: 'telefono',
    label: 'Teléfono',
    type: 'text' as const,
    required: false,
    placeholder: 'Teléfono del vendedor',
    description: 'Ingrese el teléfono del vendedor.'
  },
  {
    name: 'email',
    label: 'Email',
    type: 'text' as const,
    required: false,
    placeholder: 'Email del vendedor',
    description: 'Ingrese el email del vendedor.'
  },
  {
    name: 'esVendedor',
    label: 'Es Vendedor',
    type: 'switch' as const,
    required: false,
    description: 'Indica si es vendedor.'
  },
  {
    name: 'esCobrador',
    label: 'Es Cobrador',
    type: 'switch' as const,
    required: false,
    description: 'Indica si es cobrador.'
  },
  {
    name: 'suspendido',
    label: 'Suspendido',
    type: 'switch' as const,
    required: false,
    description: 'Indica si el vendedor está suspendido.'
  }
],
  moneda: [
    {
      name: 'codigo',
      label: 'Código',
      type: 'text' as const,
      required: true,
      placeholder: 'Código de la moneda',
      description: 'Ingrese el código de la moneda.'
    },
    {
      name: 'nombre',
      label: 'Nombre',
      type: 'text' as const,
      required: true,
      placeholder: 'Nombre de la moneda',
      description: 'Ingrese el nombre de la moneda.'
    },
    {
      name: 'esDividir',
      label: 'Es Dividir',
      type: 'switch' as const,
      required: false,
      description: 'Indica si la moneda es para dividir.'
    },
    {
      name: 'suspendido',
      label: 'Suspendido',
      type: 'switch' as const,
      required: false,
      description: 'Indica si la moneda está suspendida.'
    }
  ],
  tasadecambio: [
    {
      name: 'codigoMoneda',
      label: 'Moneda',
      type: 'select' as const,
      required: true,
      placeholder: 'Seleccione una moneda',
      description: 'Seleccione la moneda para la tasa de cambio.',
      options: [],
      optionLabel: 'nombre',
      optionValue: 'id'
    },
    {
      name: 'fecha',
      label: 'Fecha',
      type: 'text' as const,
      required: true,
      placeholder: 'Fecha de la tasa',
      description: 'Ingrese la fecha de la tasa de cambio.'
    },
    {
      name: 'tasaVenta',
      label: 'Tasa de Venta',
      type: 'number' as const,
      required: true,
      placeholder: 'Tasa de venta',
      description: 'Ingrese la tasa de venta.'
    },
    {
      name: 'tasaCompra',
      label: 'Tasa de Compra',
      type: 'number' as const,
      required: true,
      placeholder: 'Tasa de compra',
      description: 'Ingrese la tasa de compra.'
    }
  ],
  listadeprecio: [
    {
      name: 'nombre',
      label: 'Nombre',
      type: 'text' as const,
      required: true,
      placeholder: 'Nombre de la lista de precio',
      description: 'Ingrese el nombre de la lista de precio.'
    },
    {
      name: 'suspendido',
      label: 'Suspendido',
      type: 'switch' as const,
      required: false,
      description: 'Indica si la lista de precio está suspendida.'
    }
  ],
  sector: [
    {
      name: 'nombre',
      label: 'Nombre',
      type: 'text' as const,
      required: true,
      placeholder: 'Nombre del sector',
      description: 'Ingrese el nombre del sector.'
    },
    {
      name: 'suspendido',
      label: 'Suspendido',
      type: 'switch' as const,
      required: false,
      description: 'Indica si el sector está suspendido.'
    }
  ],
  rubro: [
    {
      name: 'nombre',
      label: 'Nombre',
      type: 'text' as const,
      required: true,
      placeholder: 'Nombre del rubro',
      description: 'Ingrese el nombre del rubro.'
    },
    {
      name: 'codigoListaPrecio',
      label: 'Lista de Precio',
      type: 'select' as const,
      required: true,
      placeholder: 'Seleccione una lista de precio',
      description: 'Seleccione la lista de precio para el rubro.',
      options: [],
      optionLabel: 'nombre',
      optionValue: 'id'
    },
    {
      name: 'suspendido',
      label: 'Suspendido',
      type: 'switch' as const,
      required: false,
      description: 'Indica si el rubro está suspendido.'
    }
  ]
};

// Valores por defecto por entidad
const DEFAULT_VALUES = {
  acuerdodepago: {
    nombre: '',
    dias: 0,
    suspendido: false
  },
  ciudad: {
    nombre: '',
    codigoRegion: 0,
    suspendido: false
  },
  region: {
    nombre: '',
    suspendido: false
  },
  pais: {
    codigo: '',
    nombre: '',
    suspendido: false
  },
  formadeentrega: {
    nombre: '',
    aplicaDespachoTransporte: false,
    suspendido: false
  },
  tipopersona: {
    nombre: '',
    suspendido: false
  },
  tipovendedor: {
    nombre: '',
    suspendido: false
  },
  vendedor: {
    nombre: '',
    direccion: '',
    telefono: '',
    email: '',
    esVendedor: false,
    esCobrador: false,
    codigoRegion: 0,
    codigoTipoVendedor: 0,
    codigoListaPrecio: 0,
    suspendido: false
  },
  moneda: {
    codigo: '',
    nombre: '',
    esDividir: false,
    suspendido: false
  },
  tasadecambio: {
    codigoMoneda: 0,
    fecha: new Date().toISOString().split('T')[0],
    tasaVenta: 0,
    tasaCompra: 0
  },
  listadeprecio: {
    nombre: '',
    suspendido: false
  },
  sector: {
    nombre: '',
    suspendido: false
  },
  rubro: {
    nombre: '',
    codigoListaPrecio: 0,
    suspendido: false
  }
};

// Schemas de validación por entidad
const SCHEMAS = {
  acuerdodepago: z.object({
    nombre: z.string().min(1, 'El nombre es requerido'),
    dias: z.number().min(0, 'Los días deben ser mayor o igual a 0'),
    suspendido: z.boolean()
  }),
  ciudad: z.object({
    nombre: z.string().min(1, 'El nombre es requerido'),
    codigoRegion: z.number().min(1, 'La región es requerida'),
    suspendido: z.boolean()
  }),
  region: z.object({
    nombre: z.string().min(1, 'El nombre es requerido'),
    suspendido: z.boolean()
  }),
  pais: z.object({
    codigo: z.string().min(1, 'El código es requerido'),
    nombre: z.string().min(1, 'El nombre es requerido'),
    suspendido: z.boolean()
  }),
  formadeentrega: z.object({
    nombre: z.string().min(1, 'El nombre es requerido'),
    aplicaDespachoTransporte: z.boolean(),
    suspendido: z.boolean()
  }),
  tipopersona: z.object({
    nombre: z.string().min(1, 'El nombre es requerido'),
    suspendido: z.boolean()
  }),
  tipovendedor: z.object({
    nombre: z.string().min(1, 'El nombre es requerido'),
    suspendido: z.boolean()
  }),
  vendedor: z.object({
    nombre: z.string().min(1, 'El nombre es requerido'),
    direccion: z.string().optional(),
    telefono: z.string().optional(),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    esVendedor: z.boolean(),
    esCobrador: z.boolean(),
    codigoRegion: z.number().optional(),
    codigoTipoVendedor: z.number().optional(),
    codigoListaPrecio: z.number().optional(),
    suspendido: z.boolean()
  }),
  moneda: z.object({
    codigo: z.string().min(1, 'El código es requerido'),
    nombre: z.string().min(1, 'El nombre es requerido'),
    esDividir: z.boolean(),
    suspendido: z.boolean()
  }),
  tasadecambio: z.object({
    codigoMoneda: z.number().min(1, 'La moneda es requerida'),
    fecha: z.string().min(1, 'La fecha es requerida'),
    tasaVenta: z.number().min(0, 'La tasa de venta debe ser mayor o igual a 0'),
    tasaCompra: z.number().min(0, 'La tasa de compra debe ser mayor o igual a 0')
  }),
  listadeprecio: z.object({
    nombre: z.string().min(1, 'El nombre es requerido'),
    suspendido: z.boolean()
  }),
  sector: z.object({
    nombre: z.string().min(1, 'El nombre es requerido'),
    suspendido: z.boolean()
  }),
  rubro: z.object({
    nombre: z.string().min(1, 'El nombre es requerido'),
    codigoListaPrecio: z.number().min(1, 'La lista de precio es requerida'),
    suspendido: z.boolean()
  })
};

type CategoryId = keyof typeof CATEGORY_TITLES;
type ItemUnion = AcuerdoDePago | Ciudad | Region | Pais | FormaDeEntrega | TipoPersona | TipoVendedor | Vendedor | Moneda | TasaDeCambio | ListaDePrecio | Sector | Rubro;

const EntVentas: React.FC = () => {
  const navigation = useNavigation();
  const router = useRouter();

  // Hooks de entidades
  const {
    useGetAcuerdoDePagoList,
    useCreateAcuerdoDePago,
    useUpdateAcuerdoDePago,
    useDeleteAcuerdoDePago
  } = useAcuerdoDePago();

  const {
    useGetCiudadList,
    useCreateCiudad,
    useUpdateCiudad,
    useDeleteCiudad
  } = useCiudad();

  const {
    useGetRegionList,
    useCreateRegion,
    useUpdateRegion,
    useDeleteRegion
  } = useRegion();

  const {
    useGetPaisList,
    useCreatePais,
    useUpdatePais,
    useDeletePais
  } = usePais();

  const {
    useGetFormaDeEntregaList,
    useCreateFormaDeEntrega,
    useUpdateFormaDeEntrega,
    useDeleteFormaDeEntrega
  } = useFormaDeEntrega();

  const {
    useGetTipoPersonaList,
    useCreateTipoPersona,
    useUpdateTipoPersona,
    useDeleteTipoPersona
  } = useTipoPersona();

  const {
    useGetTipoVendedorList,
    useCreateTipoVendedor,
    useUpdateTipoVendedor,
    useDeleteTipoVendedor
  } = useTipoVendedor();

  const {
    useGetVendedorList,
    useCreateVendedor,
    useUpdateVendedor,
    useDeleteVendedor
  } = useVendedor();

  const {
    useGetMonedaList,
    useCreateMoneda,
    useUpdateMoneda,
    useDeleteMoneda
  } = useMoneda();

  const {
    useGetTasaDeCambioList,
    useCreateTasaDeCambio,
    useUpdateTasaDeCambio,
    useDeleteTasaDeCambio
  } = useTasaDeCambio();

  const {
    useGetListaDePrecioList,
    useCreateListaDePrecio,
    useUpdateListaDePrecio,
    useDeleteListaDePrecio
  } = useListaDePrecio();

  const {
    useGetSectorList,
    useCreateSector,
    useUpdateSector,
    useDeleteSector
  } = useSector();

  const {
    useGetRubroList,
    useCreateRubro,
    useUpdateRubro,
    useDeleteRubro
  } = useRubro();

  // MUTACIONES - NIVEL SUPERIOR DEL COMPONENTE
  const createAcuerdoDePagoMutation = useCreateAcuerdoDePago();
  const updateAcuerdoDePagoMutation = useUpdateAcuerdoDePago();
  const deleteAcuerdoDePagoMutation = useDeleteAcuerdoDePago();

  const createCiudadMutation = useCreateCiudad();
  const updateCiudadMutation = useUpdateCiudad();
  const deleteCiudadMutation = useDeleteCiudad();

  const createRegionMutation = useCreateRegion();
  const updateRegionMutation = useUpdateRegion();
  const deleteRegionMutation = useDeleteRegion();

  const createPaisMutation = useCreatePais();
  const updatePaisMutation = useUpdatePais();
  const deletePaisMutation = useDeletePais();

  const createFormaDeEntregaMutation = useCreateFormaDeEntrega();
  const updateFormaDeEntregaMutation = useUpdateFormaDeEntrega();
  const deleteFormaDeEntregaMutation = useDeleteFormaDeEntrega();

  const createTipoPersonaMutation = useCreateTipoPersona();
  const updateTipoPersonaMutation = useUpdateTipoPersona();
  const deleteTipoPersonaMutation = useDeleteTipoPersona();

  const createTipoVendedorMutation = useCreateTipoVendedor();
  const updateTipoVendedorMutation = useUpdateTipoVendedor();
  const deleteTipoVendedorMutation = useDeleteTipoVendedor();

  const createVendedorMutation = useCreateVendedor();
  const updateVendedorMutation = useUpdateVendedor();
  const deleteVendedorMutation = useDeleteVendedor();

  const createMonedaMutation = useCreateMoneda();
  const updateMonedaMutation = useUpdateMoneda();
  const deleteMonedaMutation = useDeleteMoneda();

  const createTasaDeCambioMutation = useCreateTasaDeCambio();
  const updateTasaDeCambioMutation = useUpdateTasaDeCambio();
  const deleteTasaDeCambioMutation = useDeleteTasaDeCambio();

  const createListaDePrecioMutation = useCreateListaDePrecio();
  const updateListaDePrecioMutation = useUpdateListaDePrecio();
  const deleteListaDePrecioMutation = useDeleteListaDePrecio();

  const createSectorMutation = useCreateSector();
  const updateSectorMutation = useUpdateSector();
  const deleteSectorMutation = useDeleteSector();

  const createRubroMutation = useCreateRubro();
  const updateRubroMutation = useUpdateRubro();
  const deleteRubroMutation = useDeleteRubro();

  // State management
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewType, setViewType] = useState<'chips' | 'dropdown'>('chips');
  const [formModalVisible, setFormModalVisible] = useState<boolean>(false);
  const [detailModalVisible, setDetailModalVisible] = useState<boolean>(false);
  const [currentItem, setCurrentItem] = useState<ItemUnion | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('acuerdodepago');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [accumulatedItems, setAccumulatedItems] = useState<ItemUnion[]>([]);
  const [error, setError] = useState<string | null>(null);

  // React Query hooks basados en categoría seleccionada
  const { data: acuerdoDePagoData, isLoading: isLoadingAcuerdoDePago } = useGetAcuerdoDePagoList(currentPage, PAGE_SIZE);
  const { data: ciudadData, isLoading: isLoadingCiudad } = useGetCiudadList(currentPage, PAGE_SIZE);
  const { data: regionData, isLoading: isLoadingRegion } = useGetRegionList(currentPage, PAGE_SIZE);
  const { data: paisData, isLoading: isLoadingPais } = useGetPaisList(currentPage, PAGE_SIZE);
 const { data: formaDeEntregaData, isLoading: isLoadingFormaDeEntrega } = useGetFormaDeEntregaList(currentPage, PAGE_SIZE);
  const { data: tipoPersonaData, isLoading: isLoadingTipoPersona } = useGetTipoPersonaList(currentPage, PAGE_SIZE);
  const { data: tipoVendedorData, isLoading: isLoadingTipoVendedor } = useGetTipoVendedorList(currentPage, PAGE_SIZE);
  const { data: vendedorData, isLoading: isLoadingVendedor } = useGetVendedorList(currentPage, PAGE_SIZE);
  const { data: monedaData, isLoading: isLoadingMoneda } = useGetMonedaList(currentPage, PAGE_SIZE);
  const { data: tasaDeCambioData, isLoading: isLoadingTasaDeCambio } = useGetTasaDeCambioList(currentPage, PAGE_SIZE);
  const { data: listaDePrecioData, isLoading: isLoadingListaDePrecio } = useGetListaDePrecioList(currentPage, PAGE_SIZE);
  const { data: sectorData, isLoading: isLoadingSector } = useGetSectorList(currentPage, PAGE_SIZE);
  const { data: rubroData, isLoading: isLoadingRubro } = useGetRubroList(currentPage, PAGE_SIZE);

  // Datos adicionales para selectores
  const { data: regionesData } = useGetRegionList(1, 1000);
  const { data: monedasData } = useGetMonedaList(1, 1000);
  const { data: listasDePrecioData } = useGetListaDePrecioList(1, 1000);

  // Reset pagination when category changes
  useEffect(() => {
    setCurrentPage(1);
    setHasMore(true);
    setAccumulatedItems([]);
  }, [selectedCategory]);

  // Update hasMore and accumulate items when new data arrives
  useEffect(() => {
    let currentData = null;
    
    switch (selectedCategory) {
      case 'acuerdodepago':
        currentData = acuerdoDePagoData;
        break;
      case 'ciudad':
        currentData = ciudadData;
        break;
      case 'region':
        currentData = regionData;
        break;
      case 'pais':
        currentData = paisData;
        break;
      case 'formadeentrega':
        currentData = formaDeEntregaData;
        break;
      case 'tipopersona':
        currentData = tipoPersonaData;
        break;
      case 'tipovendedor':
        currentData = tipoVendedorData;
        break;
      case 'vendedor':
        currentData = vendedorData;
        break;
      case 'moneda':
        currentData = monedaData;
        break;
      case 'tasadecambio':
        currentData = tasaDeCambioData;
        break;
      case 'listadeprecio':
        currentData = listaDePrecioData;
        break;
      case 'sector':
        currentData = sectorData;
        break;
      case 'rubro':
        currentData = rubroData;
        break;
    }

    if (currentData) {
      const totalPages = Math.ceil(currentData.totalRegistros / PAGE_SIZE);
      setHasMore(currentPage < totalPages);
      
      if (currentPage === 1) {
        setAccumulatedItems(currentData.data);
      } else {
        setAccumulatedItems(prev => {
          const existingIds = new Set(prev.map(item => item.id));
          const newItems = currentData.data.filter(item => !existingIds.has(item.id));
          return [...prev, ...newItems];
        });
      }
    }
  }, [acuerdoDePagoData, ciudadData, regionData, paisData, formaDeEntregaData, tipoPersonaData, tipoVendedorData, vendedorData, monedaData, tasaDeCambioData, listaDePrecioData, sectorData, rubroData, currentPage, selectedCategory]);

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

  const isLoading = (() => {
    switch (selectedCategory) {
      case 'acuerdodepago': return isLoadingAcuerdoDePago;
      case 'ciudad': return isLoadingCiudad;
      case 'region': return isLoadingRegion;
      case 'pais': return isLoadingPais;
      case 'formadeentrega': return isLoadingFormaDeEntrega;
      case 'tipopersona': return isLoadingTipoPersona;
      case 'tipovendedor': return isLoadingTipoVendedor;
      case 'vendedor': return isLoadingVendedor;
      case 'moneda': return isLoadingMoneda;
      case 'tasadecambio': return isLoadingTasaDeCambio;
      case 'listadeprecio': return isLoadingListaDePrecio;
      case 'sector': return isLoadingSector;
      case 'rubro': return isLoadingRubro;
      default: return false;
    }
  })();

  const items = useMemo(() => {
    return accumulatedItems;
  }, [accumulatedItems]);

  // Función auxiliar para obtener el nombre de una entidad
  const getEntityName = (item: ItemUnion): string => {
    if ('nombre' in item && item.nombre) {
      return item.nombre;
    }
    if ('codigo' in item && item.codigo) {
      return item.codigo;
    }
    if (selectedCategory === 'tasadecambio') {
      const tasaItem = item as TasaDeCambio;
      return `Tasa ${tasaItem.codigoMoneda} - ${new Date(tasaItem.fecha).toLocaleDateString()}`;
    }
    return `ID: ${item.id}`;
  };

  // Función auxiliar para obtener el estado suspendido
  const getEntitySuspended = (item: ItemUnion): boolean => {
    if ('suspendido' in item) {
      return item.suspendido || false;
    }
    return false; // TasaDeCambio no tiene suspendido, se considera siempre activa
  };

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const name = getEntityName(item);
      return name.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [items, searchQuery, selectedCategory]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      setCurrentPage(prev => prev + 1);
    }
  }, [hasMore, isLoading]);

  // Preparar los campos del formulario según la categoría seleccionada
  const getFormFields = useCallback(() => {
    const fields = FORM_FIELDS[selectedCategory];
    
    if (selectedCategory === 'ciudad' && regionesData?.data) {
      return fields.map(field => {
        if (field.name === 'codigoRegion') {
          return {
            ...field,
            options: regionesData.data
          };
        }
        return field;
      });
    }

    if (selectedCategory === 'tasadecambio' && monedasData?.data) {
      return fields.map(field => {
        if (field.name === 'codigoMoneda') {
          return {
            ...field,
            options: monedasData.data
          };
        }
        return field;
      });
    }

    if (selectedCategory === 'rubro' && listasDePrecioData?.data) {
      return fields.map(field => {
        if (field.name === 'codigoListaPrecio') {
          return {
            ...field,
            options: listasDePrecioData.data
          };
        }
        return field;
      });
    }
    
    return fields;
  }, [selectedCategory, regionesData, monedasData, listasDePrecioData]);

  const handleCreate = (formData: any) => {
    console.log('Creating with data:', formData); // Debug log
    console.log('Selected category:', selectedCategory); // Debug log

    switch (selectedCategory) {
      case 'acuerdodepago':
        createAcuerdoDePagoMutation.mutate(formData, {
          onSuccess: (createdItem) => {
            console.log('Created successfully:', createdItem); // Debug log
            setAccumulatedItems(prev => [createdItem, ...prev]);
            setCurrentPage(1);
            setHasMore(true);
          },
          onError: (error) => {
            console.error('Error creating:', error); // Debug log
            setCurrentPage(1);
          }
        });
        break;
      case 'ciudad':
        createCiudadMutation.mutate(formData, {
          onSuccess: (createdItem) => {
            setAccumulatedItems(prev => [createdItem, ...prev]);
            setCurrentPage(1);
            setHasMore(true);
          },
          onError: () => setCurrentPage(1)
        });
        break;
      case 'region':
        createRegionMutation.mutate(formData, {
          onSuccess: (createdItem) => {
            setAccumulatedItems(prev => [createdItem, ...prev]);
            setCurrentPage(1);
            setHasMore(true);
          },
          onError: () => setCurrentPage(1)
        });
        break;
      case 'pais':
        createPaisMutation.mutate(formData, {
          onSuccess: (createdItem) => {
            setAccumulatedItems(prev => [createdItem, ...prev]);
            setCurrentPage(1);
            setHasMore(true);
          },
          onError: () => setCurrentPage(1)
        });
        break;
      case 'formadeentrega':
        createFormaDeEntregaMutation.mutate(formData, {
          onSuccess: (createdItem) => {
            setAccumulatedItems(prev => [createdItem, ...prev]);
            setCurrentPage(1);
            setHasMore(true);
          },
          onError: () => setCurrentPage(1)
        });
        break;
      case 'tipopersona':
        createTipoPersonaMutation.mutate(formData, {
          onSuccess: (createdItem) => {
            setAccumulatedItems(prev => [createdItem, ...prev]);
            setCurrentPage(1);
            setHasMore(true);
          },
          onError: () => setCurrentPage(1)
        });
        break;
      case 'tipovendedor':
        createTipoVendedorMutation.mutate(formData, {
          onSuccess: (createdItem) => {
            setAccumulatedItems(prev => [createdItem, ...prev]);
            setCurrentPage(1);
            setHasMore(true);
          },
          onError: () => setCurrentPage(1)
        });
        break;
      case 'vendedor':
        createVendedorMutation.mutate(formData, {
          onSuccess: (createdItem) => {
            setAccumulatedItems(prev => [createdItem, ...prev]);
            setCurrentPage(1);
            setHasMore(true);
          },
          onError: () => setCurrentPage(1)
        });
        break;
      case 'moneda':
        createMonedaMutation.mutate(formData, {
          onSuccess: (createdItem) => {
            setAccumulatedItems(prev => [createdItem, ...prev]);
            setCurrentPage(1);
            setHasMore(true);
          },
          onError: () => setCurrentPage(1)
        });
        break;
      case 'tasadecambio':
        createTasaDeCambioMutation.mutate(formData, {
          onSuccess: (createdItem) => {
            setAccumulatedItems(prev => [createdItem, ...prev]);
            setCurrentPage(1);
            setHasMore(true);
          },
          onError: () => setCurrentPage(1)
        });
        break;
      case 'listadeprecio':
        createListaDePrecioMutation.mutate(formData, {
          onSuccess: (createdItem) => {
            setAccumulatedItems(prev => [createdItem, ...prev]);
            setCurrentPage(1);
            setHasMore(true);
          },
          onError: () => setCurrentPage(1)
        });
        break;
      case 'sector':
        createSectorMutation.mutate(formData, {
          onSuccess: (createdItem) => {
            setAccumulatedItems(prev => [createdItem, ...prev]);
            setCurrentPage(1);
            setHasMore(true);
          },
          onError: () => setCurrentPage(1)
        });
        break;
      case 'rubro':
        createRubroMutation.mutate(formData, {
          onSuccess: (createdItem) => {
            setAccumulatedItems(prev => [createdItem, ...prev]);
            setCurrentPage(1);
            setHasMore(true);
          },
          onError: () => setCurrentPage(1)
        });
        break;
      default:
        console.error('Unknown category:', selectedCategory);
        break;
    }
    setFormModalVisible(false);
  };

  const handleUpdate = (formData: any) => {
    if (!currentItem) return;

    console.log('Updating with data:', formData); // Debug log
    console.log('Current item:', currentItem); // Debug log

    switch (selectedCategory) {
      case 'acuerdodepago':
        updateAcuerdoDePagoMutation.mutate({ id: currentItem.id, formData }, {
          onSuccess: (updatedItem) => {
            setAccumulatedItems(prev => 
              prev.map(item => item.id === currentItem.id ? updatedItem : item)
            );
          },
          onError: () => setCurrentPage(1)
        });
        break;
      case 'ciudad':
        updateCiudadMutation.mutate({ id: currentItem.id, formData }, {
          onSuccess: (updatedItem) => {
            setAccumulatedItems(prev => 
              prev.map(item => item.id === currentItem.id ? updatedItem : item)
            );
          },
          onError: () => setCurrentPage(1)
        });
        break;
      case 'region':
        updateRegionMutation.mutate({ id: currentItem.id, formData }, {
          onSuccess: (updatedItem) => {
            setAccumulatedItems(prev => 
              prev.map(item => item.id === currentItem.id ? updatedItem : item)
            );
          },
          onError: () => setCurrentPage(1)
        });
        break;
      case 'pais':
        updatePaisMutation.mutate({ id: currentItem.id, formData }, {
          onSuccess: (updatedItem) => {
            setAccumulatedItems(prev => 
              prev.map(item => item.id === currentItem.id ? updatedItem : item)
            );
          },
          onError: () => setCurrentPage(1)
        });
        break;
      case 'formadeentrega':
        updateFormaDeEntregaMutation.mutate({ id: currentItem.id, formData }, {
          onSuccess: (updatedItem) => {
            setAccumulatedItems(prev => 
              prev.map(item => item.id === currentItem.id ? updatedItem : item)
            );
          },
          onError: () => setCurrentPage(1)
        });
        break;
      case 'tipopersona':
        updateTipoPersonaMutation.mutate({ id: currentItem.id, formData }, {
          onSuccess: (updatedItem) => {
            setAccumulatedItems(prev => 
              prev.map(item => item.id === currentItem.id ? updatedItem : item)
            );
          },
          onError: () => setCurrentPage(1)
        });
        break;
      case 'tipovendedor':
        updateTipoVendedorMutation.mutate({ id: currentItem.id, formData }, {
          onSuccess: (updatedItem) => {
            setAccumulatedItems(prev => 
              prev.map(item => item.id === currentItem.id ? updatedItem : item)
            );
          },
          onError: () => setCurrentPage(1)
        });
        break;
      case 'vendedor':
        updateVendedorMutation.mutate({ id: currentItem.id, formData }, {
          onSuccess: (updatedItem) => {
            setAccumulatedItems(prev => 
              prev.map(item => item.id === currentItem.id ? updatedItem : item)
            );
          },
          onError: () => setCurrentPage(1)
        });
        break;
      case 'moneda':
        updateMonedaMutation.mutate({ id: currentItem.id, formData }, {
          onSuccess: (updatedItem) => {
            setAccumulatedItems(prev => 
              prev.map(item => item.id === currentItem.id ? updatedItem : item)
            );
          },
          onError: () => setCurrentPage(1)
        });
        break;
      case 'tasadecambio':
        updateTasaDeCambioMutation.mutate({ id: currentItem.id, formData }, {
          onSuccess: (updatedItem) => {
            setAccumulatedItems(prev => 
              prev.map(item => item.id === currentItem.id ? updatedItem : item)
            );
          },
          onError: () => setCurrentPage(1)
        });
        break;
      case 'listadeprecio':
        updateListaDePrecioMutation.mutate({ id: currentItem.id, formData }, {
          onSuccess: (updatedItem) => {
            setAccumulatedItems(prev => 
              prev.map(item => item.id === currentItem.id ? updatedItem : item)
            );
          },
          onError: () => setCurrentPage(1)
        });
        break;
      case 'sector':
        updateSectorMutation.mutate({ id: currentItem.id, formData }, {
          onSuccess: (updatedItem) => {
            setAccumulatedItems(prev => 
              prev.map(item => item.id === currentItem.id ? updatedItem : item)
            );
          },
          onError: () => setCurrentPage(1)
        });
        break;
      case 'rubro':
        updateRubroMutation.mutate({ id: currentItem.id, formData }, {
          onSuccess: (updatedItem) => {
            setAccumulatedItems(prev => 
              prev.map(item => item.id === currentItem.id ? updatedItem : item)
            );
          },
          onError: () => setCurrentPage(1)
        });
        break;
    }

    setFormModalVisible(false);
    setDetailModalVisible(false);
  };

  const handleDelete = (id: number) => {
    switch (selectedCategory) {
      case 'acuerdodepago':
        deleteAcuerdoDePagoMutation.mutate(id, {
          onSuccess: () => {
            setAccumulatedItems(prev => prev.filter(item => item.id !== id));
            setCurrentPage(1);
            setHasMore(true);
          },
          onError: () => setCurrentPage(1)
        });
        break;
      case 'ciudad':
        deleteCiudadMutation.mutate(id, {
          onSuccess: () => {
            setAccumulatedItems(prev => prev.filter(item => item.id !== id));
            setCurrentPage(1);
            setHasMore(true);
          },
          onError: () => setCurrentPage(1)
        });
        break;
      case 'region':
        deleteRegionMutation.mutate(id, {
          onSuccess: () => {
            setAccumulatedItems(prev => prev.filter(item => item.id !== id));
            setCurrentPage(1);
            setHasMore(true);
          },
          onError: () => setCurrentPage(1)
        });
        break;
      case 'pais':
        deletePaisMutation.mutate(id, {
          onSuccess: () => {
            setAccumulatedItems(prev => prev.filter(item => item.id !== id));
            setCurrentPage(1);
            setHasMore(true);
          },
          onError: () => setCurrentPage(1)
        });
        break;
      case 'formadeentrega':
        deleteFormaDeEntregaMutation.mutate(id, {
          onSuccess: () => {
            setAccumulatedItems(prev => prev.filter(item => item.id !== id));
            setCurrentPage(1);
            setHasMore(true);
          },
          onError: () => setCurrentPage(1)
        });
        break;
      case 'tipopersona':
        deleteTipoPersonaMutation.mutate(id, {
          onSuccess: () => {
            setAccumulatedItems(prev => prev.filter(item => item.id !== id));
            setCurrentPage(1);
            setHasMore(true);
          },
          onError: () => setCurrentPage(1)
        });
        break;
      case 'tipovendedor':
        deleteTipoVendedorMutation.mutate(id, {
          onSuccess: () => {
            setAccumulatedItems(prev => prev.filter(item => item.id !== id));
            setCurrentPage(1);
            setHasMore(true);
          },
          onError: () => setCurrentPage(1)
        });
        break;
      case 'vendedor':
        deleteVendedorMutation.mutate(id, {
          onSuccess: () => {
            setAccumulatedItems(prev => prev.filter(item => item.id !== id));
            setCurrentPage(1);
            setHasMore(true);
          },
          onError: () => setCurrentPage(1)
        });
        break;
      case 'moneda':
        deleteMonedaMutation.mutate(id, {
          onSuccess: () => {
            setAccumulatedItems(prev => prev.filter(item => item.id !== id));
            setCurrentPage(1);
            setHasMore(true);
          },
          onError: () => setCurrentPage(1)
        });
        break;
      case 'tasadecambio':
        deleteTasaDeCambioMutation.mutate(id, {
          onSuccess: () => {
            setAccumulatedItems(prev => prev.filter(item => item.id !== id));
            setCurrentPage(1);
            setHasMore(true);
          },
          onError: () => setCurrentPage(1)
        });
        break;
      case 'listadeprecio':
        deleteListaDePrecioMutation.mutate(id, {
          onSuccess: () => {
            setAccumulatedItems(prev => prev.filter(item => item.id !== id));
            setCurrentPage(1);
            setHasMore(true);
          },
          onError: () => setCurrentPage(1)
        });
        break;
      case 'sector':
        deleteSectorMutation.mutate(id, {
          onSuccess: () => {
            setAccumulatedItems(prev => prev.filter(item => item.id !== id));
            setCurrentPage(1);
            setHasMore(true);
          },
          onError: () => setCurrentPage(1)
        });
        break;
      case 'rubro':
        deleteRubroMutation.mutate(id, {
          onSuccess: () => {
            setAccumulatedItems(prev => prev.filter(item => item.id !== id));
            setCurrentPage(1);
            setHasMore(true);
          },
          onError: () => setCurrentPage(1)
        });
        break;
    }
    setDetailModalVisible(false);
  };

  const showItemDetails = (item: ItemUnion) => {
    setCurrentItem(item);
    setDetailModalVisible(true);
  };

  const openEditModal = (item: ItemUnion) => {
    setCurrentItem(item);
    setIsEditing(true);
    setFormModalVisible(true);
  };

  const renderItem = ({ item }: { item: ItemUnion }) => {
    const entityName = getEntityName(item);
    const isSuspended = getEntitySuspended(item);
    
    return (
      <View className="bg-white rounded-xl mt-2 shadow-sm border border-gray-100 overflow-hidden">
        <TouchableOpacity
          onPress={() => showItemDetails(item)}
          activeOpacity={0.7}
        >
          <View className="p-4">
            <View className="mb-2">
              <Text className="text-lg font-semibold text-gray-800" numberOfLines={1}>
                {entityName}
              </Text>
            </View>
            <View className="flex-row justify-between items-center mt-1">
              {selectedCategory === 'acuerdodepago' && (
                <Text className="text-sm text-gray-600">Días: {(item as AcuerdoDePago).dias}</Text>
              )}
              {selectedCategory === 'tasadecambio' && (
                <Text className="text-sm text-gray-600">
                  Venta: {(item as TasaDeCambio).tasaVenta} | Compra: {(item as TasaDeCambio).tasaCompra}
                </Text>
              )}
              {selectedCategory === 'vendedor' && (
                <Text className="text-sm text-gray-600">{(item as Vendedor).email}</Text>
              )}
              {selectedCategory === 'pais' && (
                <Text className="text-sm text-gray-600">Código: {(item as Pais).codigo}</Text>
              )}
              {selectedCategory === 'moneda' && (
                <Text className="text-sm text-gray-600">Código: {(item as Moneda).codigo}</Text>
              )}
              
              {/* Solo mostrar estado para entidades que tienen suspendido */}
              {selectedCategory !== 'tasadecambio' && (
                <View className={`px-2 py-1 rounded-full ${isSuspended
                  ? 'bg-red-100 border border-red-600'
                  : 'bg-green-100 border border-green-600'
                  }`}>
                  <Text className={`text-xs font-medium ${isSuspended
                    ? 'text-red-600'
                    : 'text-green-600'
                    }`}>
                    {isSuspended ? 'Inactivo' : 'Activo'}
                  </Text>
                </View>
              )}
              
              {/* Para TasaDeCambio mostrar fecha en lugar de estado */}
              {selectedCategory === 'tasadecambio' && (
                <View className="px-2 py-1 rounded-full bg-blue-100 border border-blue-600">
                  <Text className="text-xs font-medium text-blue-600">
                    {new Date((item as TasaDeCambio).fecha).toLocaleDateString()}
                  </Text>
                </View>
              )}
            </View>
            <Text className="text-xs text-gray-400 mt-2">
              ID: {item.id} · Creado: {item.fechaRegistro ? new Date(item.fechaRegistro).toLocaleDateString() : 'N/A'}
            </Text>
            {item.usuarioRegistroNombre && (
              <Text className="text-xs text-gray-400">
                Creado por: {item.usuarioRegistroNombre}
              </Text>
            )}
            {item.fechaModificacion && (
              <Text className="text-xs text-gray-400">
                Última modificación: {new Date(item.fechaModificacion).toLocaleDateString()}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      <DynamicHeader
        navigateToModules={navigateToModules}
        viewType={viewType}
        setViewType={setViewType}
        title="Ventas y Compras"
        description="Gestión comercial en Profit Plus"
        backgroundColor={themes.sales.headerColor}
        textColor={themes.sales.headerTextColor}
        lightTextColor={themes.sales.buttonTextColor}
        buttonColor={themes.sales.buttonColor}
        categoryTitle={CATEGORY_TITLES[selectedCategory]}
      />

      <DynamicCategorySelector<CategoryId>
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        viewType={viewType}
        categories={CATEGORIES}
        headerColor={themes.sales.headerColor}
        headerTextColor={themes.sales.headerTextColor}
        buttonColor={themes.sales.buttonColor}
        buttonTextColor={themes.sales.buttonTextColor}
      />

      <DynamicSearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onAddPress={() => {
          setCurrentItem(null);
          setIsEditing(false);
          setFormModalVisible(true);
        }}
        placeholder={`Buscar ${CATEGORY_TITLES[selectedCategory].toLowerCase()}...`}
        addButtonText={`Agregar ${CATEGORY_TITLES[selectedCategory]}`}
        buttonColor={themes.sales.buttonColor}
        buttonTextColor={themes.sales.buttonTextColor}
      />

      <View className="flex-1">
        {error ? (
          <DynamicErrorState
            message={error}
            onRetry={() => {
              setError(null);
              setCurrentPage(1);
              setHasMore(true);
              setAccumulatedItems([]);
            }}
          />
        ) : isLoading && currentPage === 1 ? (
          <DynamicLoadingState />
        ) : (
          <DynamicItemList
            items={filteredItems}
            handleDelete={handleDelete}
            showItemDetails={showItemDetails}
            openEditModal={openEditModal}
            onLoadMore={handleLoadMore}
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

      <DynamicFormModal
        visible={formModalVisible}
        onClose={() => setFormModalVisible(false)}
        isEditing={isEditing}
        currentItem={currentItem}
        handleCreate={handleCreate}
        handleUpdate={handleUpdate}
        selectedCategory={selectedCategory}
       schema={SCHEMAS[selectedCategory]}
        defaultValues={DEFAULT_VALUES[selectedCategory]}
        categoryTitles={CATEGORY_TITLES}
        formFields={getFormFields()}
        headerColor={themes.sales.formHeaderColor}
        headerTextColor={themes.sales.formHeaderTextColor}
        buttonColor={themes.sales.formButtonColor}
        buttonTextColor={themes.sales.formButtonTextColor}
        switchActiveColor={themes.sales.switchActiveColor}
        switchInactiveColor={themes.sales.switchInactiveColor}
      />

      <DynamicItemModal
        visible={detailModalVisible}
        onClose={() => setDetailModalVisible(false)}
        currentItem={currentItem}
        openEditModal={openEditModal}
        handleDelete={handleDelete}
        mainTitleField={{ 
          label: 'Nombre', 
          value: currentItem ? getEntityName(currentItem) : ''
        }}
        badges={[]}
        statusField={{
          value: currentItem ? !getEntitySuspended(currentItem) : false,
          activeText: 'Activo',
          inactiveText: 'Inactivo'
        }}
        systemFields={currentItem ? [
          { label: 'ID', value: String(currentItem.id) },
          { label: 'Fecha de Registro', value: currentItem.fechaRegistro ? new Date(currentItem.fechaRegistro).toLocaleDateString() : 'N/A' },
          { label: 'Usuario Registro', value: currentItem.usuarioRegistroNombre || 'N/A' },
          ...(currentItem.fechaModificacion ? [{ label: 'Última Modificación', value: new Date(currentItem.fechaModificacion).toLocaleDateString() }] : [])
        ] : []}
        headerColor={themes.sales.itemHeaderColor}
        headerTextColor={themes.sales.itemHeaderTextColor}
        badgeColor={themes.sales.badgeColor}
        editButtonColor={themes.sales.editButtonColor}
        editButtonTextColor={themes.sales.editButtonTextColor}
        deleteButtonColor={themes.sales.deleteButtonColor}
        deleteButtonTextColor={themes.sales.deleteButtonTextColor}
      />
    </View>
  );
};

export default EntVentas;