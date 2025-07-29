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
    console.log('🔧 processFormData - Datos originales:', JSON.stringify(data, null, 2));
    console.log('🔧 Estados de límites: manejaLimiteCredito=', formState.manejaLimiteCredito, 'manejaLimiteDebito=', formState.manejaLimiteDebito);
    
    // Limpiar campos condicionales si no se deben mostrar
    if (!formState.esSucursal) {
      console.log('🗑️  Eliminando idFiguraComercialCasaMatriz porque no es sucursal');
      delete processedData.idFiguraComercialCasaMatriz;
    }

    if (!formState.manejaLimiteCredito) {
      // Si no maneja límite de crédito, eliminar campos en lugar de enviar 0
      console.log('🗑️  Eliminando campos de crédito porque manejaLimiteCredito=false');
      delete processedData.idMonedaLimiteCreditoVentas;
      processedData.montolimiteCreditoVentas = 0;
    }

    if (!formState.manejaLimiteDebito) {
      // Si no maneja límite de débito, eliminar campos en lugar de enviar 0
      console.log('🗑️  Eliminando campos de débito porque manejaLimiteDebito=false');
      delete processedData.idMonedaLimiteCreditoCompras;
      processedData.montolimiteCreditoCompras = 0;
    }
    
    // Limpiar montos si no hay moneda válida (casos inconsistentes)
    if (!processedData.idMonedaLimiteCreditoVentas || processedData.idMonedaLimiteCreditoVentas === 0) {
      console.log('🗑️  Eliminando monto de crédito porque no hay moneda válida');
      processedData.montolimiteCreditoVentas = 0;
    }
    
    if (!processedData.idMonedaLimiteCreditoCompras || processedData.idMonedaLimiteCreditoCompras === 0) {
      console.log('🗑️  Eliminando monto de débito porque no hay moneda válida');
      processedData.montolimiteCreditoCompras = 0;
    }
    
    // Validar y limpiar IDs con valor 0 (no válidos)
    if (processedData.idMonedaLimiteCreditoVentas === 0) {
      console.log('🗑️  Eliminando idMonedaLimiteCreditoVentas=0');
      delete processedData.idMonedaLimiteCreditoVentas;
    }
    if (processedData.idMonedaLimiteCreditoCompras === 0) {
      console.log('🗑️  Eliminando idMonedaLimiteCreditoCompras=0');
      delete processedData.idMonedaLimiteCreditoCompras;
    }
    if (processedData.idFiguraComercialCasaMatriz === 0) {
      console.log('🗑️  Eliminando idFiguraComercialCasaMatriz=0');
      delete processedData.idFiguraComercialCasaMatriz;
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
      // Vendedor es opcional - solo incluir si tiene valor válido
      ...(processedData.idVendedor && processedData.idVendedor !== 0 
        ? { idVendedor: processedData.idVendedor } 
        : {}),
      idAcuerdoDePago: processedData.idAcuerdoDePago || 0,
      idTipoPersona: processedData.idTipoPersona || 0,
      activoVentas: processedData.activoVentas !== undefined ? processedData.activoVentas : true,
      activoCompras: processedData.activoCompras !== undefined ? processedData.activoCompras : true,
      esSucursal: processedData.esSucursal !== undefined ? processedData.esSucursal : false,
      // Solo incluir idFiguraComercialCasaMatriz si existe y no es 0
      ...(processedData.idFiguraComercialCasaMatriz && processedData.idFiguraComercialCasaMatriz !== 0 
        ? { idFiguraComercialCasaMatriz: processedData.idFiguraComercialCasaMatriz } 
        : {}),
      direccionComercial: processedData.direccionComercial || '',
      direccionEntrega: processedData.direccionEntrega || '',
      // Solo incluir campos de moneda si existen y no son 0
      ...(processedData.idMonedaLimiteCreditoVentas && processedData.idMonedaLimiteCreditoVentas !== 0 
        ? { idMonedaLimiteCreditoVentas: processedData.idMonedaLimiteCreditoVentas } 
        : {}),
      montolimiteCreditoVentas: processedData.montolimiteCreditoVentas || 0,
      ...(processedData.idMonedaLimiteCreditoCompras && processedData.idMonedaLimiteCreditoCompras !== 0 
        ? { idMonedaLimiteCreditoCompras: processedData.idMonedaLimiteCreditoCompras } 
        : {}),
      montolimiteCreditoCompras: processedData.montolimiteCreditoCompras || 0,
      porceRetencionIvaCompra: processedData.porceRetencionIvaCompra || 0,
      aplicaRetVentasAuto: processedData.aplicaRetVentasAuto !== undefined ? processedData.aplicaRetVentasAuto : false,
      aplicaRetComprasAuto: processedData.aplicaRetComprasAuto !== undefined ? processedData.aplicaRetComprasAuto : false,
      suspendido: processedData.suspendido !== undefined ? processedData.suspendido : false
    };

    // Combinar datos pero sin sobrescribir campos eliminados
    const finalData = { ...requiredFields, ...processedData };
    console.log('✅ processFormData - Datos finales:', JSON.stringify(finalData, null, 2));
    return finalData;
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
      if (!data.idPais || data.idPais === 0) errors.push('El país es requerido');
      if (!data.idCiudad || data.idCiudad === 0) errors.push('La ciudad es requerida');
      if (!data.idRubro || data.idRubro === 0) errors.push('El rubro es requerido');
      if (!data.idSector || data.idSector === 0) errors.push('El sector es requerido');
      if (!data.telefono?.trim()) errors.push('El teléfono es requerido');
      if (!data.email?.trim()) errors.push('El email es requerido');
      if (!data.direccionComercial?.trim()) errors.push('La dirección comercial es requerida');
      
      // Nota: Vendedor NO es requerido según especificaciones
      
      // Validaciones condicionales
      if (formState.esSucursal && (!data.idFiguraComercialCasaMatriz || data.idFiguraComercialCasaMatriz === 0)) {
        errors.push('La casa matriz es requerida cuando es sucursal');
      }
    }

    if (formState.activeTab === 'financiera') {
      // Validaciones obligatorias para INFORMACIÓN FINANCIERA
      if (!data.idAcuerdoDePago || data.idAcuerdoDePago === 0) {
        errors.push('El acuerdo de pago es requerido');
      }

      // Validaciones condicionales solo si están habilitadas
      if (formState.manejaLimiteCredito) {
        if (!data.idMonedaLimiteCreditoVentas || data.idMonedaLimiteCreditoVentas === 0) {
          errors.push('La moneda de límite de crédito es requerida cuando maneja límite de crédito');
        }
        if (!data.montolimiteCreditoVentas || data.montolimiteCreditoVentas <= 0) {
          errors.push('El monto de límite de crédito debe ser mayor a 0 cuando maneja límite de crédito');
        }
      }

      if (formState.manejaLimiteDebito) {
        if (!data.idMonedaLimiteCreditoCompras || data.idMonedaLimiteCreditoCompras === 0) {
          errors.push('La moneda de límite de débito es requerida cuando maneja límite de débito');
        }
        if (!data.montolimiteCreditoCompras || data.montolimiteCreditoCompras <= 0) {
          errors.push('El monto de límite de débito debe ser mayor a 0 cuando maneja límite de débito');
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