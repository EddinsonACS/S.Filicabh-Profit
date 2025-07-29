import { useAcuerdoDePago } from '@/hooks/Ventas/useAcuerdoDePago';
import { useCiudad } from '@/hooks/Ventas/useCiudad';
import { useFiguraComercial } from '@/hooks/Ventas/useFiguraComercial';
import { useFormaDeEntrega } from '@/hooks/Ventas/useFormaDeEntrega';
import { useListaDePrecio } from '@/hooks/Ventas/useListaDePrecio';
import { useMoneda } from '@/hooks/Ventas/useMoneda';
import { usePais } from '@/hooks/Ventas/usePais';
import { useRegion } from '@/hooks/Ventas/useRegion';
import { useRubro } from '@/hooks/Ventas/useRubro';
import { useSector } from '@/hooks/Ventas/useSector';
import { useTasaDeCambio } from '@/hooks/Ventas/useTasaDeCambio';
import { useTipoPersona } from '@/hooks/Ventas/useTipoPersona';
import { useTipoVendedor } from '@/hooks/Ventas/useTipoVendedor';
import { useVendedor } from '@/hooks/Ventas/useVendedor';

import { AcuerdoDePago } from '@/core/models/Ventas/AcuerdoDePago';
import { Ciudad } from '@/core/models/Ventas/Ciudad';
import { FiguraComercial } from '@/core/models/Ventas/FiguraComercial';
import { FormaDeEntrega } from '@/core/models/Ventas/FormaDeEntrega';
import { ListaDePrecio } from '@/core/models/Ventas/ListaDePrecio';
import { Moneda } from '@/core/models/Ventas/Moneda';
import { Pais } from '@/core/models/Ventas/Pais';
import { Region } from '@/core/models/Ventas/Region';
import { Rubro } from '@/core/models/Ventas/Rubro';
import { Sector } from '@/core/models/Ventas/Sector';
import { TasaDeCambio } from '@/core/models/Ventas/TasaDeCambio';
import { TipoPersona } from '@/core/models/Ventas/TipoPersona';
import { TipoVendedor } from '@/core/models/Ventas/TipoVendedor';
import { Vendedor } from '@/core/models/Ventas/Vendedor';

import { useNavigation } from '@react-navigation/native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler, View } from 'react-native';

// Import dynamic components
import DynamicCategorySelector from '@/components/Entidades/shared/DynamicCategorySelector';
import DynamicEmptyState from '@/components/Entidades/shared/DynamicEmptyState';
import DynamicErrorState from '@/components/Entidades/shared/DynamicErrorState';
import DynamicFilterBar, { FilterState } from '@/components/Entidades/shared/DynamicFilterBar';
import DynamicFormModal from '@/components/Entidades/shared/DynamicFormModal';
import DynamicHeader from '@/components/Entidades/shared/DynamicHeader';
import DynamicItemList from '@/components/Entidades/shared/DynamicItemList';
import DynamicItemModal, { DynamicItemModalRef } from '@/components/Entidades/shared/DynamicItemModal';
import DynamicLoadingState from '@/components/Entidades/shared/DynamicLoadingState';
import DynamicSearchBar from '@/components/Entidades/shared/DynamicSearchBar';
import { themes } from '@/components/Entidades/shared/theme';
import ItemArticle from '@/components/Entidades/Ventas/ItemArticle';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { applyFilters } from '@/utils/helpers/filterUtils';
import { ventasSchema } from '@/utils/schemas/ventasSchema';
import { useQueryClient } from '@tanstack/react-query';

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
  { id: 'rubro', label: 'Rubro', icon: 'albums' as const },
  { id: 'figuracomercial', label: 'Figura Comercial', icon: 'people' as const } // Added icon: 'people' as a placeholder, adjust if needed
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
  rubro: 'Rubro',
  figuracomercial: 'Figura Comercial'
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
      name: 'idRegion',
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
      required: true,
      placeholder: 'Teléfono del vendedor',
      description: 'Ingrese el teléfono del vendedor.'
    },
    {
      name: 'email',
      label: 'Email',
      type: 'text' as const,
      required: true,
      placeholder: 'Email del vendedor',
      description: 'Ingrese el email del vendedor.'
    },
    {
      name: 'idTipoVendedor',
      label: 'Tipo de Vendedor',
      type: 'select' as const,
      required: true,
      placeholder: 'Seleccione un tipo de vendedor',
      description: 'Seleccione el tipo de vendedor.',
      options: [],
      optionLabel: 'nombre',
      optionValue: 'id'
    },
    {
      name: 'idRegion',
      label: 'Región',
      type: 'select' as const,
      required: true,
      placeholder: 'Seleccione una región',
      description: 'Seleccione la región del vendedor.',
      options: [],
      optionLabel: 'nombre',
      optionValue: 'id'
    },
    {
      name: 'idListaPrecio',
      label: 'Lista de Precio',
      type: 'select' as const,
      required: true,
      placeholder: 'Seleccione una lista de precio',
      description: 'Seleccione la lista de precio del vendedor.',
      options: [],
      optionLabel: 'nombre',
      optionValue: 'id'
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
      name: 'fecha',
      label: 'Fecha',
      type: 'date' as const,
      required: true,
      placeholder: 'Seleccione la fecha',
      description: 'Seleccione la fecha para la tasa de cambio.'
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
    },
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
      name: 'idListaPrecio',
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
  ],
  figuracomercial: [
    { name: 'nombre', label: 'Nombre', type: 'text' as const, required: true, placeholder: 'Nombre de la figura comercial', description: 'Ingrese el nombre completo o razón social.' },
    { name: 'rif', label: 'RIF', type: 'text' as const, required: true, placeholder: 'Ej: J-12345678-9', description: 'Registro de Información Fiscal.' },
    { name: 'nit', label: 'NIT', type: 'text' as const, placeholder: 'NIT (si aplica)', description: 'Número de Identificación Tributaria.', required: true },
    { name: 'personaContacto', label: 'Persona Contacto', type: 'text' as const, placeholder: 'Nombre del contacto principal', description: 'Persona a contactar en la empresa.', required: true },
    { name: 'telefono', label: 'Teléfono', type: 'text' as const, placeholder: 'Ej: 04121234567', description: 'Número de teléfono principal.', required: true },
    { name: 'email', label: 'Email Principal', type: 'text' as const, placeholder: 'correo@ejemplo.com', description: 'Dirección de correo electrónico principal.', required: true },
    { name: 'emailAlterno', label: 'Email Alterno', type: 'text' as const, placeholder: 'correo.alterno@ejemplo.com', description: 'Dirección de correo electrónico alternativa.', required: true },
    { name: 'descripcionFiguraComercial', label: 'Descripción', type: 'text' as const, placeholder: 'Descripción adicional', description: 'Notas o descripción relevante sobre la figura comercial.', required: false },
    { name: 'idPais', label: 'País', type: 'select' as const, required: true, placeholder: 'Seleccione un país', description: 'País de la figura comercial.', optionsData: [], optionLabel: 'nombre', optionValue: 'id' },
    { name: 'idCiudad', label: 'Ciudad', type: 'select' as const, required: true, placeholder: 'Seleccione una ciudad', description: 'Ciudad de la figura comercial.', optionsData: [], optionLabel: 'nombre', optionValue: 'id' },
    { name: 'idRubro', label: 'Rubro', type: 'select' as const, required: true, placeholder: 'Seleccione un rubro', description: 'Rubro principal de la figura comercial.', optionsData: [], optionLabel: 'nombre', optionValue: 'id' },
    { name: 'idSector', label: 'Sector', type: 'select' as const, required: true, placeholder: 'Seleccione un sector', description: 'Sector de la figura comercial.', optionsData: [], optionLabel: 'nombre', optionValue: 'id' },
    { name: 'idVendedor', label: 'Vendedor Asignado', type: 'select' as const, required: true, placeholder: 'Seleccione un vendedor', description: 'Vendedor asignado a esta figura comercial.', optionsData: [], optionLabel: 'nombre', optionValue: 'id' },
    { name: 'idAcuerdoDePago', label: 'Acuerdo de Pago', type: 'select' as const, required: true, placeholder: 'Seleccione acuerdo', description: 'Acuerdo de pago predeterminado.', optionsData: [], optionLabel: 'nombre', optionValue: 'id' },
    { name: 'idTipoPersona', label: 'Tipo de Persona', type: 'select' as const, required: true, placeholder: 'Seleccione tipo persona', description: 'Clasificación del tipo de persona.', optionsData: [], optionLabel: 'nombre', optionValue: 'id' },
    { name: 'activoVentas', label: 'Activo para Ventas', type: 'switch' as const, description: 'Indica si está activo para transacciones de ventas.', required: false },
    { name: 'activoCompras', label: 'Activo para Compras', type: 'switch' as const, description: 'Indica si está activo para transacciones de compras.', required: false },
    { name: 'esCasaMatriz', label: 'Es Sucursal', type: 'switch' as const, description: 'Indica si esta figura es una sucursal (si no, es una casa matriz).', required: false },
    { name: 'codigoFiguraComercialCasaMatriz', label: 'Casa Matriz (Si aplica)', type: 'select' as const, placeholder: 'Seleccione casa matriz', description: 'Figura comercial que es la casa matriz (si esta es una sucursal).', optionsData: [], optionLabel: 'nombre', optionValue: 'id', required: false },
    { name: 'direccionComercial', label: 'Dirección Comercial', type: 'text' as const, placeholder: 'Dirección comercial completa', description: 'Dirección fiscal o comercial.', required: true },
    { name: 'direccionEntrega', label: 'Dirección de Entrega', type: 'text' as const, placeholder: 'Dirección para entregas', description: 'Dirección predeterminada para envío de mercancía.', required: true },
    { name: 'codigoMonedaLimiteCreditoVentas', label: 'Moneda Límite Crédito (Ventas)', type: 'select' as const, required: true, placeholder: 'Seleccione moneda', description: 'Moneda para el límite de crédito en ventas.', optionsData: [], optionLabel: 'codigo', optionValue: 'codigo' },
    { name: 'montolimiteCreditoVentas', label: 'Monto Límite Crédito (Ventas)', type: 'number' as const, required: true, placeholder: '0.00', description: 'Monto del límite de crédito para ventas.' },
    { name: 'codigoMonedaLimiteCreditoCompras', label: 'Moneda Límite Crédito (Compras)', type: 'select' as const, required: true, placeholder: 'Seleccione moneda', description: 'Moneda para el límite de crédito en compras.', optionsData: [], optionLabel: 'codigo', optionValue: 'codigo' },
    { name: 'montolimiteCreditoCompras', label: 'Monto Límite Crédito (Compras)', type: 'number' as const, required: true, placeholder: '0.00', description: 'Monto del límite de crédito para compras.' },
    { name: 'porceRetencionIva', label: '% Retención IVA', type: 'number' as const, placeholder: '0.00', description: 'Porcentaje de retención de IVA aplicable.', required: false },
    { name: 'aplicaRetVentasAuto', label: 'Aplica Ret. Ventas Auto.', type: 'switch' as const, description: 'Aplicar retenciones automáticamente en ventas.', required: false },
    { name: 'aplicaRetComprasAuto', label: 'Aplica Ret. Compras Auto.', type: 'switch' as const, description: 'Aplicar retenciones automáticamente en compras.', required: false },
    { name: 'suspendido', label: 'Suspendido', type: 'switch' as const, description: 'Indica si la figura comercial está suspendida.', required: false }
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
    idRegion: 0,
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
    telefono: 0,
    esVendedor: false,
    esCobrador: false,
    idRegion: 0,
    idTipoVendedor: 0,
    idListaPrecio: 0,
    suspendido: false
  },
  moneda: {
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
    suspendido: false
  },
  sector: {
    suspendido: false
  },
  rubro: {
    idListaPrecio: 0,
    suspendido: false
  },
  figuracomercial: {
    email: '',
    emailAlterno: '',
    idPais: 0,
    idCiudad: 0,
    idRubro: 0,
    idSector: 0,
    idVendedor: 0,
    idAcuerdoDePago: 0,
    idTipoPersona: 0,
    activoVentas: true,
    activoCompras: true,
    esCasaMatriz: false,
    aplicaRetVentasAuto: false,
    aplicaRetComprasAuto: false,
    suspendido: false
  }
};

// Schemas de validación por entidad
const SCHEMAS = ventasSchema;

type CategoryId = keyof typeof CATEGORY_TITLES;
type ItemUnion = AcuerdoDePago | Ciudad | Region | Pais | FormaDeEntrega | TipoPersona | TipoVendedor | Vendedor | Moneda | TasaDeCambio | ListaDePrecio | Sector | Rubro | FiguraComercial;

const EntVentas: React.FC = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const { showSuccess, showError } = useNotificationContext();
  const queryClient = useQueryClient();

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

  const {
    useGetFiguraComercialList,
    useCreateFiguraComercial,
    useUpdateFiguraComercial,
    useDeleteFiguraComercial
  } = useFiguraComercial();

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

  const createFiguraComercialMutation = useCreateFiguraComercial();
  const updateFiguraComercialMutation = useUpdateFiguraComercial();
  const deleteFiguraComercialMutation = useDeleteFiguraComercial();

  // State management
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewType, setViewType] = useState<'chips' | 'dropdown'>('chips');
  const [formModalVisible, setFormModalVisible] = useState<boolean>(false);
  const [detailModalVisible, setDetailModalVisible] = useState<boolean>(false);
  const [currentItem, setCurrentItem] = useState<ItemUnion | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const { category } = useLocalSearchParams<{ category?: string }>();
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>(
    (category && CATEGORIES.find(cat => cat.id === category)) ? category as CategoryId : 'acuerdodepago'
  );
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [accumulatedItems, setAccumulatedItems] = useState<ItemUnion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [backendFormError, setBackendFormError] = useState<string | null>(null);
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
  const { data: figuraComercialData, isLoading: isLoadingFiguraComercial } = useGetFiguraComercialList(currentPage, PAGE_SIZE);

  // Datos adicionales para selectores
  const { data: regionesData } = useGetRegionList(1, 1000);
  const { data: monedasData } = useGetMonedaList(1, 1000);
  const { data: listasDePrecioData } = useGetListaDePrecioList(1, 1000);
  const { data: tiposVendedorData } = useGetTipoVendedorList(1, 1000);
  const { data: paisesOptionsData } = useGetPaisList(1, 1000);
  const { data: ciudadesOptionsData } = useGetCiudadList(1, 1000);
  const { data: rubrosOptionsData } = useGetRubroList(1, 1000);
  const { data: sectoresOptionsData } = useGetSectorList(1, 1000);
  const { data: vendedoresOptionsData } = useGetVendedorList(1, 1000);
  const { data: acuerdosDePagoOptionsData } = useGetAcuerdoDePagoList(1, 1000);
  const { data: tiposPersonaOptionsData } = useGetTipoPersonaList(1, 1000);
  const { data: figurasComercialesOptionsData } = useGetFiguraComercialList(1, 1000);

  // Update selected category when URL parameter changes
  useEffect(() => {
    if (category && CATEGORIES.find(cat => cat.id === category)) {
      setSelectedCategory(category as CategoryId);
    }
  }, [category]);

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
      case 'figuracomercial':
        currentData = figuraComercialData;
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
  }, [acuerdoDePagoData, ciudadData, regionData, paisData, formaDeEntregaData, tipoPersonaData, tipoVendedorData, vendedorData, monedaData, tasaDeCambioData, listaDePrecioData, sectorData, rubroData, figuraComercialData, currentPage, selectedCategory]);

  const navigateToModules = () => {
    router.replace('/Entidades');
  };

  useEffect(() => {
    const backAction = () => {
      if (formModalVisible) {
        setBackendFormError(null);
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
      case 'figuracomercial': return isLoadingFiguraComercial;
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
    return applyFilters(items as any[], filterState, searchQuery);
  }, [items, filterState, searchQuery]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      setCurrentPage(prev => prev + 1);
    }
  }, [hasMore, isLoading, currentPage]);

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

  // Preparar los campos del formulario según la categoría seleccionada
  const getFormFields = useCallback(() => {
    const fields = FORM_FIELDS[selectedCategory];

    if (selectedCategory === 'ciudad' && regionesData?.data) {
      return fields.map(field => {
        if (field.name === 'idRegion') {
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
        if (field.name === 'idListaPrecio') {
          return {
            ...field,
            options: listasDePrecioData.data
          };
        }
        return field;
      });
    }

    if (selectedCategory === 'vendedor') {
      return fields.map(field => {
        if (field.name === 'codigoTipoVendedor' && tipoVendedorData?.data) {
          return { ...field, options: tipoVendedorData.data };
        }
        if (field.name === 'codigoRegion' && regionesData?.data) {
          return { ...field, options: regionesData.data };
        }
        if (field.name === 'idListaPrecio' && listasDePrecioData?.data) {
          return { ...field, options: listasDePrecioData.data };
        }
        return field;
      });
    }

    if (selectedCategory === 'figuracomercial') {
      return fields.map(field => {
        if (field.name === 'idPais' && paisesOptionsData?.data) {
          return { ...field, options: paisesOptionsData.data };
        }
        if (field.name === 'idCiudad' && ciudadesOptionsData?.data) {
          return { ...field, options: ciudadesOptionsData.data };
        }
        if (field.name === 'idRubro' && rubrosOptionsData?.data) {
          return { ...field, options: rubrosOptionsData.data };
        }
        if (field.name === 'idSector' && sectoresOptionsData?.data) {
          return { ...field, options: sectoresOptionsData.data };
        }
        if (field.name === 'idVendedor' && vendedoresOptionsData?.data) {
          return { ...field, options: vendedoresOptionsData.data };
        }
        if (field.name === 'idAcuerdoDePago' && acuerdosDePagoOptionsData?.data) {
          return { ...field, options: acuerdosDePagoOptionsData.data };
        }
        if (field.name === 'idTipoPersona' && tiposPersonaOptionsData?.data) {
          return { ...field, options: tiposPersonaOptionsData.data };
        }
        if (field.name === 'codigoFiguraComercialCasaMatriz' && figurasComercialesOptionsData?.data) {
          // Filter out the current item if editing, to prevent self-selection as casa matriz
          const filteredFiguras = currentItem && figurasComercialesOptionsData.data
            ? figurasComercialesOptionsData.data.filter(fc => fc.id !== currentItem.id)
            : figurasComercialesOptionsData?.data;
          return { ...field, options: filteredFiguras || [] };
        }
        if ((field.name === 'codigoMonedaLimiteCreditoVentas' || field.name === 'codigoMonedaLimiteCreditoCompras') && monedasData?.data) {
          return { ...field, options: monedasData.data };
        }
        return field;
      });
    }

    return fields;
  }, [selectedCategory, regionesData, monedasData, listasDePrecioData, tiposVendedorData, paisesOptionsData, ciudadesOptionsData, rubrosOptionsData, sectoresOptionsData, vendedoresOptionsData, acuerdosDePagoOptionsData, tiposPersonaOptionsData, figurasComercialesOptionsData, currentItem]);

  const handleCreate = async (formData: any): Promise<boolean> => {
    setBackendFormError(null);
    return new Promise((resolve) => {
      const commonOnSuccess = (createdItem: any, entityType: string) => {
        queryClient.invalidateQueries({ queryKey: [selectedCategory] });
        setAccumulatedItems(prev => [createdItem, ...prev]);
        setCurrentPage(1);
        setHasMore(true);
        showSuccess('¡Éxito!', `${entityType} creado correctamente.`);
        resolve(true);
      };
      const commonOnError = (error: any, entityType: string) => {
        const errorMessage = error.response?.data?.mensaje || error.message || `Error al crear ${entityType.toLowerCase()}`;
        setBackendFormError(errorMessage);
        resolve(false);
      };
      console.log('Creating with data:', formData); // Debug log
      console.log('Selected category:', selectedCategory); // Debug log

      switch (selectedCategory) {
        case 'acuerdodepago':
          createAcuerdoDePagoMutation.mutate(formData, {
            onSuccess: (createdItem) => commonOnSuccess(createdItem, 'Acuerdo de pago'),
            onError: (error: any) => commonOnError(error, 'Acuerdo de pago')
          });
          break;
        case 'ciudad':
          createCiudadMutation.mutate(formData, {
            onSuccess: (createdItem) => commonOnSuccess(createdItem, 'Ciudad'),
            onError: (error: any) => commonOnError(error, 'Ciudad')
          });
          break;
        case 'region':
          createRegionMutation.mutate(formData, {
            onSuccess: (createdItem) => commonOnSuccess(createdItem, 'Región'),
            onError: (error: any) => commonOnError(error, 'Región')
          });
          break;
        case 'pais':
          createPaisMutation.mutate(formData, {
            onSuccess: (createdItem) => commonOnSuccess(createdItem, 'País'),
            onError: (error: any) => commonOnError(error, 'País')
          });
          break;
        case 'formadeentrega':
          createFormaDeEntregaMutation.mutate(formData, {
            onSuccess: (createdItem) => commonOnSuccess(createdItem, 'Forma de entrega'),
            onError: (error: any) => commonOnError(error, 'Forma de entrega')
          });
          break;
        case 'tipopersona':
          createTipoPersonaMutation.mutate(formData, {
            onSuccess: (createdItem) => commonOnSuccess(createdItem, 'Tipo de persona'),
            onError: (error: any) => commonOnError(error, 'Tipo de persona')
          });
          break;
        case 'tipovendedor':
          createTipoVendedorMutation.mutate(formData, {
            onSuccess: (createdItem) => commonOnSuccess(createdItem, 'Tipo de vendedor'),
            onError: (error: any) => commonOnError(error, 'Tipo de vendedor')
          });
          break;
        case 'vendedor':
          createVendedorMutation.mutate(formData, {
            onSuccess: (createdItem) => commonOnSuccess(createdItem, 'Vendedor'),
            onError: (error: any) => commonOnError(error, 'Vendedor')
          });
          break;
        case 'moneda':
          createMonedaMutation.mutate(formData, {
            onSuccess: (createdItem) => commonOnSuccess(createdItem, 'Moneda'),
            onError: (error: any) => commonOnError(error, 'Moneda')
          });
          break;
        case 'tasadecambio':
          createTasaDeCambioMutation.mutate(formData, {
            onSuccess: (createdItem) => commonOnSuccess(createdItem, 'Tasa de cambio'),
            onError: (error: any) => commonOnError(error, 'Tasa de cambio')
          });
          break;
        case 'listadeprecio':
          createListaDePrecioMutation.mutate(formData, {
            onSuccess: (createdItem) => commonOnSuccess(createdItem, 'Lista de precio'),
            onError: (error: any) => commonOnError(error, 'Lista de precio')
          });
          break;
        case 'sector':
          createSectorMutation.mutate(formData, {
            onSuccess: (createdItem) => commonOnSuccess(createdItem, 'Sector'),
            onError: (error: any) => commonOnError(error, 'Sector')
          });
          break;
        case 'rubro':
          createRubroMutation.mutate(formData, {
            onSuccess: (createdItem) => commonOnSuccess(createdItem, 'Rubro'),
            onError: (error: any) => commonOnError(error, 'Rubro')
          });
          break;
        case 'figuracomercial':
          createFiguraComercialMutation.mutate(formData, {
            onSuccess: (createdItem) => commonOnSuccess(createdItem, 'Figura Comercial'),
            onError: (error: any) => commonOnError(error, 'Figura Comercial')
          });
          break;
        default:
          console.warn('Unhandled category for create:', selectedCategory);
          setBackendFormError(`Categoría no manejada para la creación: ${selectedCategory}`);
          resolve(false);
          break;
      }
    });
  };

  const handleUpdate = async (formData: any): Promise<boolean> => {
    setBackendFormError(null);
    return new Promise((resolve) => {
      if (!currentItem) {
        resolve(false);
        return;
      }

      const commonOnSuccess = (updatedItem: any, entityType: string) => {
        queryClient.invalidateQueries({ queryKey: [selectedCategory] });
        setAccumulatedItems(prev =>
          prev.map(item => item.id === currentItem.id ? updatedItem : item)
        );
        showSuccess('¡Actualizado!', `${entityType} actualizado correctamente.`);
        resolve(true);
      };
      const commonOnError = (error: any, entityType: string) => {
        const errorMessage = error.response?.data?.mensaje || error.message || `Error al actualizar ${entityType.toLowerCase()}`;
        setBackendFormError(errorMessage);
        resolve(false);
      };


      switch (selectedCategory) {
        case 'acuerdodepago':
          updateAcuerdoDePagoMutation.mutate({ id: currentItem.id, formData }, {
            onSuccess: (updatedItem) => commonOnSuccess(updatedItem, 'Acuerdo de pago'),
            onError: (error: any) => commonOnError(error, 'Acuerdo de pago')
          });
          break;
        case 'ciudad':
          updateCiudadMutation.mutate({ id: currentItem.id, formData }, {
            onSuccess: (updatedItem) => commonOnSuccess(updatedItem, 'Ciudad'),
            onError: (error: any) => commonOnError(error, 'Ciudad')
          });
          break;
        case 'region':
          updateRegionMutation.mutate({ id: currentItem.id, formData }, {
            onSuccess: (updatedItem) => commonOnSuccess(updatedItem, 'Región'),
            onError: (error: any) => commonOnError(error, 'Región')
          });
          break;
        case 'pais':
          updatePaisMutation.mutate({ id: currentItem.id, formData }, {
            onSuccess: (updatedItem) => commonOnSuccess(updatedItem, 'País'),
            onError: (error: any) => commonOnError(error, 'País')
          });
          break;
        case 'formadeentrega':
          updateFormaDeEntregaMutation.mutate({ id: currentItem.id, formData }, {
            onSuccess: (updatedItem) => commonOnSuccess(updatedItem, 'Forma de entrega'),
            onError: (error: any) => commonOnError(error, 'Forma de entrega')
          });
          break;
        case 'tipopersona':
          updateTipoPersonaMutation.mutate({ id: currentItem.id, formData }, {
            onSuccess: (updatedItem) => commonOnSuccess(updatedItem, 'Tipo de persona'),
            onError: (error: any) => commonOnError(error, 'Tipo de persona')
          });
          break;
        case 'tipovendedor':
          updateTipoVendedorMutation.mutate({ id: currentItem.id, formData }, {
            onSuccess: (updatedItem) => commonOnSuccess(updatedItem, 'Tipo de vendedor'),
            onError: (error: any) => commonOnError(error, 'Tipo de vendedor')
          });
          break;
        case 'vendedor':
          updateVendedorMutation.mutate({ id: currentItem.id, formData }, {
            onSuccess: (updatedItem) => commonOnSuccess(updatedItem, 'Vendedor'),
            onError: (error: any) => commonOnError(error, 'Vendedor')
          });
          break;
        case 'moneda':
          updateMonedaMutation.mutate({ id: currentItem.id, formData }, {
            onSuccess: (updatedItem) => commonOnSuccess(updatedItem, 'Moneda'),
            onError: (error: any) => commonOnError(error, 'Moneda')
          });
          break;
        case 'tasadecambio':
          updateTasaDeCambioMutation.mutate({ id: currentItem.id, formData }, {
            onSuccess: (updatedItem) => commonOnSuccess(updatedItem, 'Tasa de cambio'),
            onError: (error: any) => commonOnError(error, 'Tasa de cambio')
          });
          break;
        case 'listadeprecio':
          updateListaDePrecioMutation.mutate({ id: currentItem.id, formData }, {
            onSuccess: (updatedItem) => commonOnSuccess(updatedItem, 'Lista de precio'),
            onError: (error: any) => commonOnError(error, 'Lista de precio')
          });
          break;
        case 'sector':
          updateSectorMutation.mutate({ id: currentItem.id, formData }, {
            onSuccess: (updatedItem) => commonOnSuccess(updatedItem, 'Sector'),
            onError: (error: any) => commonOnError(error, 'Sector')
          });
          break;
        case 'rubro':
          updateRubroMutation.mutate({ id: currentItem.id, formData }, {
            onSuccess: (updatedItem) => commonOnSuccess(updatedItem, 'Rubro'),
            onError: (error: any) => commonOnError(error, 'Rubro')
          });
          break;
        case 'figuracomercial':
          updateFiguraComercialMutation.mutate({ id: currentItem.id, formData }, {
            onSuccess: (updatedItem) => commonOnSuccess(updatedItem, 'Figura Comercial'),
            onError: (error: any) => commonOnError(error, 'Figura Comercial')
          });
          break;
        default:
          console.warn('Unhandled category for update:', selectedCategory);
          setBackendFormError(`Categoría no manejada para la actualización: ${selectedCategory}`);
          resolve(false);
          break;
      } // End of handleUpdate's switch
    }); // End of new Promise in handleUpdate
  }; // End of handleUpdate function

  const handleDelete = (id: number) => {
    const commonOnSuccess = (entityType: string) => {
      queryClient.invalidateQueries({ queryKey: [selectedCategory] });
      setAccumulatedItems(prev => prev.filter(item => item.id !== id));
      setCurrentPage(1);
      setHasMore(true);
      showSuccess('¡Eliminado!', `${entityType} eliminado correctamente.`);
      // Cerrar el modal después de la eliminación exitosa
      setDetailModalVisible(false);
    };

    const commonOnError = (error: any, entityType: string) => {
      const errorMessage = error.response?.data?.mensaje || error.message || `Error al eliminar ${entityType.toLowerCase()}`;
      // Usar el método optimizado showDeleteError
      itemModalRef.current?.showDeleteError(entityType.toLowerCase(), errorMessage);
    };

    switch (selectedCategory) {
      case 'acuerdodepago':
        deleteAcuerdoDePagoMutation.mutate(id, {
          onSuccess: () => commonOnSuccess('Acuerdo de pago'),
          onError: (err: any) => commonOnError(err, 'Acuerdo de pago'),
        });
        break;
      case 'ciudad':
        deleteCiudadMutation.mutate(id, {
          onSuccess: () => commonOnSuccess('Ciudad'),
          onError: (err: any) => commonOnError(err, 'Ciudad'),
        });
        break;
      case 'region':
        deleteRegionMutation.mutate(id, {
          onSuccess: () => commonOnSuccess('Región'),
          onError: (err: any) => commonOnError(err, 'Región'),
        });
        break;
      case 'pais':
        deletePaisMutation.mutate(id, {
          onSuccess: () => commonOnSuccess('País'),
          onError: (err: any) => commonOnError(err, 'País'),
        });
        break;
      case 'formadeentrega':
        deleteFormaDeEntregaMutation.mutate(id, {
          onSuccess: () => commonOnSuccess('Forma de entrega'),
          onError: (err: any) => commonOnError(err, 'Forma de entrega'),
        });
        break;
      case 'tipopersona':
        deleteTipoPersonaMutation.mutate(id, {
          onSuccess: () => commonOnSuccess('Tipo de persona'),
          onError: (err: any) => commonOnError(err, 'Tipo de persona'),
        });
        break;
      case 'tipovendedor':
        deleteTipoVendedorMutation.mutate(id, {
          onSuccess: () => commonOnSuccess('Tipo de vendedor'),
          onError: (err: any) => commonOnError(err, 'Tipo de vendedor'),
        });
        break;
      case 'vendedor':
        deleteVendedorMutation.mutate(id, {
          onSuccess: () => commonOnSuccess('Vendedor'),
          onError: (err: any) => commonOnError(err, 'Vendedor'),
        });
        break;
      case 'moneda':
        deleteMonedaMutation.mutate(id, {
          onSuccess: () => commonOnSuccess('Moneda'),
          onError: (err: any) => commonOnError(err, 'Moneda'),
        });
        break;
      case 'tasadecambio':
        deleteTasaDeCambioMutation.mutate(id, {
          onSuccess: () => commonOnSuccess('Tasa de cambio'),
          onError: (err: any) => commonOnError(err, 'Tasa de cambio'),
        });
        break;
      case 'listadeprecio':
        deleteListaDePrecioMutation.mutate(id, {
          onSuccess: () => commonOnSuccess('Lista de precio'),
          onError: (err: any) => commonOnError(err, 'Lista de precio'),
        });
        break;
      case 'sector':
        deleteSectorMutation.mutate(id, {
          onSuccess: () => commonOnSuccess('Sector'),
          onError: (err: any) => commonOnError(err, 'Sector'),
        });
        break;
      case 'rubro':
        deleteRubroMutation.mutate(id, {
          onSuccess: () => commonOnSuccess('Rubro'),
          onError: (err: any) => commonOnError(err, 'Rubro'),
        });
        break;
      case 'figuracomercial':
        deleteFiguraComercialMutation.mutate(id, {
          onSuccess: () => commonOnSuccess('Figura Comercial'),
          onError: (err: any) => commonOnError(err, 'Figura Comercial'),
        });
        break;
      default:
        console.warn('Unhandled category for delete:', selectedCategory);
        showError('Error', `Categoría no manejada para la eliminación: ${selectedCategory}`);
        setDetailModalVisible(false);
        break;
    }
  };

  const getSystemFieldsForCategory = (category: string, item: any) => {
    if (!item) return []

    const baseFields = [
      { label: 'ID', value: String(item.id) },
      { label: 'Fecha de Registro', value: item.fechaRegistro ? new Date(item.fechaRegistro).toLocaleDateString() : '' },
      { label: 'Fecha de Modificación', value: item.fechaModificacion ? new Date(item.fechaModificacion).toLocaleDateString() : 'N/A' },
    ];

    const additionalFields = Object.entries(item)
      .filter(([key]) => !['id', 'fechaRegistro', 'fechaModificacion', 'otrosF1', 'otrosN1', 'otrosN2', 'otrosC1', 'otrosC2', 'otrosC3', 'otrosC4', 'otrosT1'].includes(key))
      .map(([key, value]) => ({
        label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim(),
        value: value === null || value === undefined ? 'N/A' : typeof value === 'boolean' ? (value ? 'Sí' : 'No') : String(value)
      }));

    return [...baseFields, ...additionalFields];
  };

  const showItemDetails = (item: ItemUnion) => {
    // Para figura comercial, usar componente con pestañas
    if (selectedCategory === 'figuracomercial') {
      router.push(`/(views)/(Entidades)/FiguraComercialDetalle?id=${item.id}`);
      return;
    }
    
    setCurrentItem(item);
    setDetailModalVisible(true);
  };

  const openEditModal = (item: ItemUnion) => {
    // Para figura comercial, usar componente con pestañas
    if (selectedCategory === 'figuracomercial') {
      router.push(`/(views)/(Entidades)/FiguraComercialForm?id=${item.id}&isEditing=true`);
      return;
    }
    
    setCurrentItem(item);
    setIsEditing(true);
    setFormModalVisible(true);
  };

  const renderItem = ({ item }: { item: ItemUnion }) => {
    return (
      <ItemArticle
        item={item}
        selectedCategory={selectedCategory}
        onPress={showItemDetails}
      />
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
          // Para figura comercial, usar componente con pestañas
          if (selectedCategory === 'figuracomercial') {
            router.push('/(views)/(Entidades)/FiguraComercialForm');
            return;
          }
          
          setCurrentItem(null);
          setIsEditing(false);
          setFormModalVisible(true);
        }}
        onFilterPress={() => setFilterModalVisible(true)}
        placeholder={`Buscar ${CATEGORY_TITLES[selectedCategory].toLowerCase()}...`}
        addButtonText={`Agregar ${CATEGORY_TITLES[selectedCategory]}`}
        buttonColor={themes.sales.buttonColor}
        buttonTextColor={themes.sales.buttonTextColor}
        activeFiltersCount={getActiveFiltersCount()}
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
          <DynamicLoadingState color={themes.sales.buttonColor} />
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

      <DynamicFormModal
        key={`${selectedCategory}-${isEditing ? currentItem?.id || 'edit' : 'create'}`}
        visible={formModalVisible}
        onClose={() => { 
          setFormModalVisible(false); 
          setBackendFormError(null); 
          setCurrentItem(null); 
          setIsEditing(false); 
        }}
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
        backendError={backendFormError}
      />

      <DynamicItemModal
        ref={itemModalRef}
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
        systemFields={currentItem ? getSystemFieldsForCategory(selectedCategory, currentItem) : []}
        headerColor={themes.sales.itemHeaderColor}
        headerTextColor={themes.sales.itemHeaderTextColor}
        badgeColor={themes.sales.badgeColor}
        editButtonColor={themes.sales.editButtonColor}
        editButtonTextColor={themes.sales.editButtonTextColor}
        deleteButtonColor={themes.sales.deleteButtonColor}
        deleteButtonTextColor={themes.sales.deleteButtonTextColor}
        deleteButtonBorderColor={themes.sales.deleteButtonBorderColor}
      />

      <DynamicFilterBar
        filterState={filterState}
        onFilterChange={setFilterState}
        isVisible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        buttonColor={themes.sales.buttonColor}
        buttonTextColor={themes.sales.buttonTextColor}
        sortOptions={[
          { id: 'nombre', label: 'Nombre', icon: 'text' },
          { id: 'codigo', label: 'Código', icon: 'barcode' },
          { id: 'fechaRegistro', label: 'Fecha de registro', icon: 'calendar' },
          { id: 'fechaModificacion', label: 'Fecha de modificación', icon: 'time' }
        ]}
        enableStatusFilter={selectedCategory !== 'tasadecambio'}
        enableDateFilter={true}
      />
    </View>
  );
};

export default EntVentas;