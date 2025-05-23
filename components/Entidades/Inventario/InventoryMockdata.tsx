// InventoryMockData.ts
import { Almacen } from '@/core/models/Inventario/Almacen';

// Función para generar un ID único
const generateId = (): number => {
  return Math.floor(Math.random() * 10000) + 1000;
};

// Función para crear fecha ISO
const createDate = (): string => {
  return new Date().toISOString();
};

// Inventario categories (adaptado al tipo de categorías que estás usando)
export const inventoryCategories = [
    {
    id: 'articulo',
    title: 'Artículos',
    icon: 'pricetag-outline',
    color: '#581c87',
    lightColor: '#f3e8ff',
    type: 'articulo',
  },
  {
    id: 'almacen',
    title: 'Almacén',
    icon: 'home-outline',
    color: '#581c87',
    lightColor: '#f3e8ff',
    type: 'almacen',
  },
  {
    id: 'categoria',
    title: 'Categoría',
    icon: 'folder-outline',
    color: '#581c87',
    lightColor: '#f3e8ff',
    type: 'categoria',
  },
  {
    id: 'grupo',
    title: 'Grupo',
    icon: 'albums-outline',
    color: '#581c87',
    lightColor: '#f3e8ff',
    type: 'grupo',
  },
  {
    id: 'unidad',
    title: 'Unidad',
    icon: 'resize-outline',
    color: '#581c87',
    lightColor: '#f3e8ff',
    type: 'unidad',
  },
  {
    id: 'color',
    title: 'Color',
    icon: 'color-palette-outline',
    color: '#581c87',
    lightColor: '#f3e8ff',
    type: 'color',
  },
  {
    id: 'impuesto',
    title: 'Impuesto',
    icon: 'cash-outline',
    color: '#581c87',
    lightColor: '#f3e8ff',
    type: 'impuesto',
  },
  {
    id: 'origen',
    title: 'Origen',
    icon: 'flag-outline',
    color: '#581c87',
    lightColor: '#f3e8ff',
    type: 'origen',
  }
];

// Datos de prueba para Artículos
const mockArticulos: Almacen[] = [
  {
    id: generateId(),
    nombre: "Laptop HP 15",
    aplicaVentas: true,
    aplicaCompras: true,
    suspendido: false,
    otrosF1: createDate(),
    otrosN1: 425,
    otrosN2: 10,
    equipo: "equipo",
    otrosC1: null,
    otrosC2: null,
    otrosC3: null,
    otrosC4: null,
    otrosT1: null,
    fechaRegistro: createDate(),
    usuarioRegistroNombre: "admin",
    fechaModificacion: createDate(),
    usuarioModificacionNombre: "vendedor1"
  },
  {
    id: generateId(),
    nombre: "Monitor Dell 24\"",
    aplicaVentas: true,
    aplicaCompras: true,
    suspendido: false,
    otrosF1: createDate(),
    otrosN1: 250,
    otrosN2: 22,
    equipo: "equipo",
    otrosC1: null,
    otrosC2: null,
    otrosC3: null,
    otrosC4: null,
    otrosT1: null,
    fechaRegistro: createDate(),
    usuarioRegistroNombre: "admin",
    fechaModificacion: createDate(),
    usuarioModificacionNombre: "admin"
  },
  {
    id: generateId(),
    nombre: "Teclado Mecánico Logitech",
    aplicaVentas: true,
    aplicaCompras: true,
    suspendido: false,
    otrosF1: createDate(),
    otrosN1: 80,
    otrosN2: 35,
    equipo: "equipo",
    otrosC1: null,
    otrosC2: null,
    otrosC3: null,
    otrosC4: null,
    otrosT1: null,
    fechaRegistro: createDate(),
    usuarioRegistroNombre: "bodega1",
    fechaModificacion: createDate(),
    usuarioModificacionNombre: "admin"
  }
];

// Datos de prueba para Categorías
const mockCategorias: Almacen[] = [
  {
    id: generateId(),
    nombre: "Electrónicos",
    aplicaVentas: true,
    aplicaCompras: true,
    suspendido: false,
    otrosF1: createDate(),
    otrosN1: 0,
    otrosN2: 0,
    equipo: "equipo",
    otrosC1: null,
    otrosC2: null,
    otrosC3: null,
    otrosC4: null,
    otrosT1: null,
    fechaRegistro: createDate(),
    usuarioRegistroNombre: "admin",
    fechaModificacion: createDate(),
    usuarioModificacionNombre: "admin"
  },
  {
    id: generateId(),
    nombre: "Periféricos",
    aplicaVentas: true,
    aplicaCompras: true,
    suspendido: false,
    otrosF1: createDate(),
    otrosN1: 0,
    otrosN2: 0,
    equipo: "equipo",
    otrosC1: null,
    otrosC2: null,
    otrosC3: null,
    otrosC4: null,
    otrosT1: null,
    fechaRegistro: createDate(),
    usuarioRegistroNombre: "admin",
    fechaModificacion: createDate(),
    usuarioModificacionNombre: "admin"
  },
  {
    id: generateId(),
    nombre: "Oficina",
    aplicaVentas: true,
    aplicaCompras: true,
    suspendido: false,
    otrosF1: createDate(),
    otrosN1: 0,
    otrosN2: 0,
    equipo: "equipo",
    otrosC1: null,
    otrosC2: null,
    otrosC3: null,
    otrosC4: null,
    otrosT1: null,
    fechaRegistro: createDate(),
    usuarioRegistroNombre: "admin",
    fechaModificacion: createDate(),
    usuarioModificacionNombre: "vendedor1"
  }
];

// Datos de prueba para Grupos
const mockGrupos: Almacen[] = [
  {
    id: generateId(),
    nombre: "Laptops",
    aplicaVentas: true,
    aplicaCompras: true,
    suspendido: false,
    otrosF1: createDate(),
    otrosN1: 0,
    otrosN2: 0,
    equipo: "equipo",
    otrosC1: null,
    otrosC2: null,
    otrosC3: null,
    otrosC4: null,
    otrosT1: null,
    fechaRegistro: createDate(),
    usuarioRegistroNombre: "admin",
    fechaModificacion: createDate(),
    usuarioModificacionNombre: "admin"
  },
  {
    id: generateId(),
    nombre: "Monitores",
    aplicaVentas: true,
    aplicaCompras: true,
    suspendido: false,
    otrosF1: createDate(),
    otrosN1: 0,
    otrosN2: 0,
    equipo: "equipo",
    otrosC1: null,
    otrosC2: null,
    otrosC3: null,
    otrosC4: null,
    otrosT1: null,
    fechaRegistro: createDate(),
    usuarioRegistroNombre: "admin",
    fechaModificacion: createDate(),
    usuarioModificacionNombre: "admin"
  },
  {
    id: generateId(),
    nombre: "Teclados",
    aplicaVentas: true,
    aplicaCompras: true,
    suspendido: false,
    otrosF1: createDate(),
    otrosN1: 0,
    otrosN2: 0,
    equipo: "equipo",
    otrosC1: null,
    otrosC2: null,
    otrosC3: null,
    otrosC4: null,
    otrosT1: null,
    fechaRegistro: createDate(),
    usuarioRegistroNombre: "bodega1",
    fechaModificacion: createDate(),
    usuarioModificacionNombre: "admin"
  }
];

// Datos de prueba para Unidades
const mockUnidades: Almacen[] = [
  {
    id: generateId(),
    nombre: "Unidad",
    aplicaVentas: true,
    aplicaCompras: true,
    suspendido: false,
    otrosF1: createDate(),
    otrosN1: 0,
    otrosN2: 0,
    equipo: "equipo",
    otrosC1: null,
    otrosC2: null,
    otrosC3: null,
    otrosC4: null,
    otrosT1: null,
    fechaRegistro: createDate(),
    usuarioRegistroNombre: "admin",
    fechaModificacion: createDate(),
    usuarioModificacionNombre: "admin"
  },
  {
    id: generateId(),
    nombre: "Caja",
    aplicaVentas: true,
    aplicaCompras: true,
    suspendido: false,
    otrosF1: createDate(),
    otrosN1: 0,
    otrosN2: 0,
    equipo: "equipo",
    otrosC1: null,
    otrosC2: null,
    otrosC3: null,
    otrosC4: null,
    otrosT1: null,
    fechaRegistro: createDate(),
    usuarioRegistroNombre: "admin",
    fechaModificacion: createDate(),
    usuarioModificacionNombre: "admin"
  }
];

// Datos de prueba para Colores
const mockColores: Almacen[] = [
  {
    id: generateId(),
    nombre: "Negro",
    aplicaVentas: true,
    aplicaCompras: true,
    suspendido: false,
    otrosF1: createDate(),
    otrosN1: 0,
    otrosN2: 0,
    equipo: "equipo",
    otrosC1: null,
    otrosC2: null,
    otrosC3: null,
    otrosC4: null,
    otrosT1: null,
    fechaRegistro: createDate(),
    usuarioRegistroNombre: "admin",
    fechaModificacion: createDate(),
    usuarioModificacionNombre: "admin"
  },
  {
    id: generateId(),
    nombre: "Blanco",
    aplicaVentas: true,
    aplicaCompras: true,
    suspendido: false,
    otrosF1: createDate(),
    otrosN1: 0,
    otrosN2: 0,
    equipo: "equipo",
    otrosC1: null,
    otrosC2: null,
    otrosC3: null,
    otrosC4: null,
    otrosT1: null,
    fechaRegistro: createDate(),
    usuarioRegistroNombre: "admin",
    fechaModificacion: createDate(),
    usuarioModificacionNombre: "admin"
  },
  {
    id: generateId(),
    nombre: "Azul",
    aplicaVentas: true,
    aplicaCompras: true,
    suspendido: false,
    otrosF1: createDate(),
    otrosN1: 0,
    otrosN2: 0,
    equipo: "equipo",
    otrosC1: null,
    otrosC2: null,
    otrosC3: null,
    otrosC4: null,
    otrosT1: null,
    fechaRegistro: createDate(),
    usuarioRegistroNombre: "admin",
    fechaModificacion: createDate(),
    usuarioModificacionNombre: "admin"
  }
];

// Datos de prueba para Impuestos
const mockImpuestos: Almacen[] = [
  {
    id: generateId(),
    nombre: "IVA 16%",
    aplicaVentas: true,
    aplicaCompras: true,
    suspendido: false,
    otrosF1: createDate(),
    otrosN1: 16,
    otrosN2: 0,
    equipo: "equipo",
    otrosC1: null,
    otrosC2: null,
    otrosC3: null,
    otrosC4: null,
    otrosT1: null,
    fechaRegistro: createDate(),
    usuarioRegistroNombre: "admin",
    fechaModificacion: createDate(),
    usuarioModificacionNombre: "admin"
  },
  {
    id: generateId(),
    nombre: "Exento",
    aplicaVentas: true,
    aplicaCompras: true,
    suspendido: false,
    otrosF1: createDate(),
    otrosN1: 0,
    otrosN2: 0,
    equipo: "equipo",
    otrosC1: null,
    otrosC2: null,
    otrosC3: null,
    otrosC4: null,
    otrosT1: null,
    fechaRegistro: createDate(),
    usuarioRegistroNombre: "admin",
    fechaModificacion: createDate(),
    usuarioModificacionNombre: "admin"
  }
];

// Datos de prueba para Orígenes
const mockOrigenes: Almacen[] = [
  {
    id: generateId(),
    nombre: "Nacional",
    aplicaVentas: true,
    aplicaCompras: true,
    suspendido: false,
    otrosF1: createDate(),
    otrosN1: 0,
    otrosN2: 0,
    equipo: "equipo",
    otrosC1: null,
    otrosC2: null,
    otrosC3: null,
    otrosC4: null,
    otrosT1: null,
    fechaRegistro: createDate(),
    usuarioRegistroNombre: "admin",
    fechaModificacion: createDate(),
    usuarioModificacionNombre: "admin"
  },
  {
    id: generateId(),
    nombre: "Importado",
    aplicaVentas: true,
    aplicaCompras: true,
    suspendido: false,
    otrosF1: createDate(),
    otrosN1: 0,
    otrosN2: 0,
    equipo: "equipo",
    otrosC1: null,
    otrosC2: null,
    otrosC3: null,
    otrosC4: null,
    otrosT1: null,
    fechaRegistro: createDate(),
    usuarioRegistroNombre: "admin",
    fechaModificacion: createDate(),
    usuarioModificacionNombre: "admin"
  }
];

// Función para obtener datos de prueba según la categoría
export const getMockDataByCategory = (category: string): Almacen[] => {
  switch (category) {
    case 'articulo':
      return [...mockArticulos];
    case 'categoria':
      return [...mockCategorias];
    case 'grupo':
      return [...mockGrupos];
    case 'unidad':
      return [...mockUnidades];
    case 'color':
      return [...mockColores];
    case 'impuesto':
      return [...mockImpuestos];
    case 'origen':
      return [...mockOrigenes];
    // Para almacén, retornamos un array vacío porque usaremos los datos reales de la API
    case 'almacen':
    default:
      return [];
  }
};