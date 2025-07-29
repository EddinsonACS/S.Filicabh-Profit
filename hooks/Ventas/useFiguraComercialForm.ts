import { FiguraComercial } from '@/core/models/Ventas/FiguraComercial';
import { useState } from 'react';
import { useFiguraComercial } from './useFiguraComercial';

export type FiguraComercialTab = 'ficha' | 'financiera';

export interface FiguraComercialFormState {
  // Estados de navegación
  activeTab: FiguraComercialTab;
  viewMode: 'chips' | 'dropdown';
  isDropdownOpen: boolean;
  isSubmitting: boolean;
  
  // Estados condicionales para campos dependientes
  esSucursal: boolean; // Directamente del Swagger
  manejaLimiteCredito: boolean; // Para mostrar campos de crédito
  manejaLimiteDebito: boolean; // Para mostrar campos de débito
}

export interface FiguraComercialSteps {
  id: FiguraComercialTab;
  name: string;
  icon: string;
  description: string;
}

export const figuraComercialSteps: FiguraComercialSteps[] = [
  {
    id: 'ficha',
    name: 'Ficha',
    icon: 'person-outline',
    description: 'Información básica y datos de contacto'
  },
  {
    id: 'financiera',
    name: 'Info. Financiera',
    icon: 'card-outline',
    description: 'Configuración financiera y límites'
  }
];

export const useFiguraComercialForm = (initialData?: Partial<FiguraComercial>) => {
  // Usar el hook base para operaciones CRUD
  const figuraComercialHook = useFiguraComercial();

  // Estados del formulario por pasos
  const [formState, setFormState] = useState<FiguraComercialFormState>({
    activeTab: 'ficha',
    viewMode: 'chips',
    isDropdownOpen: false,
    isSubmitting: false,
    esSucursal: initialData?.esSucursal || false,
    manejaLimiteCredito: initialData ? (initialData.montolimiteCreditoVentas || 0) > 0 : false,
    manejaLimiteDebito: initialData ? (initialData.montolimiteCreditoCompras || 0) > 0 : false,
  });

  // Funciones de navegación
  const setActiveTab = (tab: FiguraComercialTab) => {
    setFormState(prev => ({ ...prev, activeTab: tab }));
  };

  const setViewMode = (mode: 'chips' | 'dropdown') => {
    setFormState(prev => ({ ...prev, viewMode: mode }));
  };

  const toggleDropdown = () => {
    setFormState(prev => ({ ...prev, isDropdownOpen: !prev.isDropdownOpen }));
  };

  const setIsSubmitting = (submitting: boolean) => {
    setFormState(prev => ({ ...prev, isSubmitting: submitting }));
  };

  // Funciones para manejar campos condicionales
  const setEsSucursal = (value: boolean) => {
    setFormState(prev => ({ ...prev, esSucursal: value }));
  };

  const setManejaLimiteCredito = (value: boolean) => {
    setFormState(prev => ({ ...prev, manejaLimiteCredito: value }));
  };

  const setManejaLimiteDebito = (value: boolean) => {
    setFormState(prev => ({ ...prev, manejaLimiteDebito: value }));
  };

  // Función para obtener campos de la pestaña FICHA
  const getFichaFields = (): string[] => {
    return [
      'nombre',
      'idTipoPersona',
      'rif',
      'nit',
      'direccionComercial',
      'direccionEntrega',
      'descripcionFiguraComercial',
      'telefono',
      'email',
      'emailAlterno',
      'personaContacto',
      'esSucursal', // Directamente del Swagger
      'idFiguraComercialCasaMatriz', // Condicional si esSucursal
      'idPais',
      'idCiudad',
      'idRubro',
      'idSector',
      'idVendedor'
    ];
  };

  // Función para obtener campos de la pestaña FINANCIERA
  const getFinancieraFields = (): string[] => {
    return [
      'idAcuerdoDePago',
      'activoVentas',
      'idMonedaLimiteCreditoVentas', // Condicional si manejaLimiteCredito
      'montolimiteCreditoVentas', // Condicional si manejaLimiteCredito
      'activoCompras',
      'idMonedaLimiteCreditoCompras', // Condicional si manejaLimiteDebito
      'montolimiteCreditoCompras', // Condicional si manejaLimiteDebito
      'aplicaRetVentasAuto',
      'aplicaRetComprasAuto',
      'porceRetencionIvaCompra'
    ];
  };

  // Función para obtener campos activos según la pestaña
  const getActiveTabFields = (): string[] => {
    switch (formState.activeTab) {
      case 'ficha':
        return getFichaFields();
      case 'financiera':
        return getFinancieraFields();
      default:
        return getFichaFields();
    }
  };

  // Función para navegar al siguiente paso
  const navigateToNextStep = () => {
    if (formState.activeTab === 'ficha') {
      setActiveTab('financiera');
    }
    // Si está en 'financiera', no hay siguiente paso
  };

  // Función para navegar al paso anterior
  const navigateToPreviousStep = () => {
    if (formState.activeTab === 'financiera') {
      setActiveTab('ficha');
    }
    // Si está en 'ficha', no hay paso anterior
  };

  // Función para validar si se puede mostrar un campo condicional
  const shouldShowConditionalField = (fieldName: string): boolean => {
    switch (fieldName) {
      case 'idFiguraComercialCasaMatriz':
        return formState.esSucursal;
      case 'idMonedaLimiteCreditoVentas':
      case 'montolimiteCreditoVentas':
        return formState.manejaLimiteCredito;
      case 'idMonedaLimiteCreditoCompras':
      case 'montolimiteCreditoCompras':
        return formState.manejaLimiteDebito;
      default:
        return true;
    }
  };

  // Función para procesar datos antes del envío
  const processFormData = (data: any): Partial<FiguraComercial> => {
    const processedData = { ...data };
    
    // Limpiar campos condicionales si no se deben mostrar
    if (!formState.esSucursal) {
      processedData.idFiguraComercialCasaMatriz = 0;
    }

    if (!formState.manejaLimiteCredito) {
      processedData.idMonedaLimiteCreditoVentas = 0;
      processedData.montolimiteCreditoVentas = 0;
    }

    if (!formState.manejaLimiteDebito) {
      processedData.idMonedaLimiteCreditoCompras = 0;
      processedData.montolimiteCreditoCompras = 0;
    }

    // Asegurar que todos los campos del endpoint estén presentes
    const requiredFields = {
      // Campos del sistema (se agregan automáticamente en el hook)
      otrosF1: new Date().toISOString(),
      otrosN1: 0,
      otrosN2: 0,
      otrosC1: '',
      otrosC2: '',
      otrosC3: '',
      otrosC4: '',
      otrosT1: '',
      usuario: 1,
      equipo: 'mobile',
      
      // Campos del formulario
      nombre: processedData.nombre || '',
      rif: processedData.rif || '',
      nit: processedData.nit || '',
      personaContacto: processedData.personaContacto || '',
      telefono: processedData.telefono || '',
      email: processedData.email || '',
      emailAlterno: processedData.emailAlterno || '',
      descripcionFiguraComercial: processedData.descripcionFiguraComercial || '',
      idPais: processedData.idPais || 0,
      idCiudad: processedData.idCiudad || 0,
      idRubro: processedData.idRubro || 0,
      idSector: processedData.idSector || 0,
      idVendedor: processedData.idVendedor || 0,
      idAcuerdoDePago: processedData.idAcuerdoDePago || 0,
      idTipoPersona: processedData.idTipoPersona || 0,
      activoVentas: processedData.activoVentas !== undefined ? processedData.activoVentas : true,
      activoCompras: processedData.activoCompras !== undefined ? processedData.activoCompras : true,
      esSucursal: processedData.esSucursal !== undefined ? processedData.esSucursal : false,
      idFiguraComercialCasaMatriz: processedData.idFiguraComercialCasaMatriz || 0,
      direccionComercial: processedData.direccionComercial || '',
      direccionEntrega: processedData.direccionEntrega || '',
      idMonedaLimiteCreditoVentas: processedData.idMonedaLimiteCreditoVentas || 0,
      montolimiteCreditoVentas: processedData.montolimiteCreditoVentas || 0,
      idMonedaLimiteCreditoCompras: processedData.idMonedaLimiteCreditoCompras || 0,
      montolimiteCreditoCompras: processedData.montolimiteCreditoCompras || 0,
      porceRetencionIvaCompra: processedData.porceRetencionIvaCompra || 0,
      aplicaRetVentasAuto: processedData.aplicaRetVentasAuto !== undefined ? processedData.aplicaRetVentasAuto : false,
      aplicaRetComprasAuto: processedData.aplicaRetComprasAuto !== undefined ? processedData.aplicaRetComprasAuto : false,
      suspendido: processedData.suspendido !== undefined ? processedData.suspendido : false
    };

    return { ...processedData, ...requiredFields };
  };

  // Función para validar pestaña actual
  const validateCurrentTab = (data: any): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    const currentFields = getActiveTabFields();

    if (formState.activeTab === 'ficha') {
      // Validaciones obligatorias para FICHA
      if (!data.nombre?.trim()) errors.push('El nombre es requerido');
      if (!data.rif?.trim()) errors.push('El RIF es requerido');
      if (!data.idTipoPersona || data.idTipoPersona === 0) errors.push('El tipo de persona es requerido');
      
      // Validar casa matriz si es sucursal
      if (formState.esSucursal && (!data.idFiguraComercialCasaMatriz || data.idFiguraComercialCasaMatriz === 0)) {
        errors.push('La casa matriz es requerida cuando es sucursal');
      }
    }

    if (formState.activeTab === 'financiera') {
      // Validaciones para INFORMACIÓN FINANCIERA
      if (!data.idAcuerdoDePago || data.idAcuerdoDePago === 0) {
        errors.push('El acuerdo de pago es requerido');
      }

      // Validar límites de crédito si está habilitado
      if (formState.manejaLimiteCredito) {
        if (!data.idMonedaLimiteCreditoVentas || data.idMonedaLimiteCreditoVentas === 0) {
          errors.push('La moneda de límite de crédito es requerida');
        }
        if (!data.montolimiteCreditoVentas || data.montolimiteCreditoVentas <= 0) {
          errors.push('El monto de límite de crédito debe ser mayor a 0');
        }
      }

      // Validar límites de débito si está habilitado
      if (formState.manejaLimiteDebito) {
        if (!data.idMonedaLimiteCreditoCompras || data.idMonedaLimiteCreditoCompras === 0) {
          errors.push('La moneda de límite de débito es requerida');
        }
        if (!data.montolimiteCreditoCompras || data.montolimiteCreditoCompras <= 0) {
          errors.push('El monto de límite de débito debe ser mayor a 0');
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  return {
    // Estados
    ...formState,
    
    // Funciones de navegación
    setActiveTab,
    setViewMode,
    toggleDropdown,
    setIsSubmitting,
    navigateToNextStep,
    navigateToPreviousStep,
    
    // Funciones para campos condicionales
    setEsSucursal,
    setManejaLimiteCredito,
    setManejaLimiteDebito,
    shouldShowConditionalField,
    
    // Funciones de utilidad
    getFichaFields,
    getFinancieraFields,
    getActiveTabFields,
    processFormData,
    validateCurrentTab,
    
    // Hook base para operaciones CRUD
    ...figuraComercialHook,
    
    // Configuración de pasos
    steps: figuraComercialSteps
  };
};