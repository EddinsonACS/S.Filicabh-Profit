import { z } from 'zod';

// Types
export type CategoryId = 'acuerdodepago' | 'ciudad' | 'region' | 'pais' | 'formadeentrega' | 'tipopersona' | 'tipovendedor' | 'vendedor' | 'moneda' | 'tasadecambio' | 'listadeprecio' | 'sector' | 'rubro' | 'figuracomercial';

// Categories configuration
export const CATEGORIES = [
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
  { id: 'figuracomercial', label: 'Figura Comercial', icon: 'people' as const }
];

export const CATEGORY_TITLES: Record<CategoryId, string> = {
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

// Default values for each entity
export const DEFAULT_VALUES: Record<CategoryId, any> = {
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
    telefono: 0,
    esVendedor: false,
    esCobrador: false,
    codigoRegion: 0,
    codigoTipoVendedor: 0,
    codigoListaPrecio: 0,
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
    codigoListaPrecio: 0,
    suspendido: false
  },
  figuracomercial: {
    email: '',
    emailAlterno: '',
    codigoPais: 0,
    codigoCiudad: 0,
    codigoRubro: 0,
    codigoSector: 0,
    codigoVendedor: 0,
    codigoAcuerdoDePago: 0,
    codigoTipoPersona: 0,
    activoVentas: true,
    activoCompras: true,
    esCasaMatriz: false,
    aplicaRetVentasAuto: false,
    aplicaRetComprasAuto: false,
    suspendido: false
  }
};

// Validation schemas
export const SCHEMAS: Record<CategoryId, z.ZodSchema> = {
  acuerdodepago: z.object({
    nombre: z.string({required_error: 'El nombre es requerido'}),
    dias: z.number({required_error: 'Los días son requeridos'}).min(0, 'Los días deben ser mayor o igual a 0'),
    suspendido: z.boolean()
  }),
  ciudad: z.object({
    nombre: z.string({required_error: 'El nombre es requerido'}),
    codigoRegion: z.number({required_error: 'La región es requerida'}).min(1, 'La región es requerida'),
    suspendido: z.boolean()
  }),
  region: z.object({
    nombre: z.string({required_error: 'El nombre es requerido'}),
    suspendido: z.boolean()
  }),
  pais: z.object({
    codigo: z.string({required_error: 'El código es requerido'}),
    nombre: z.string({required_error: 'El nombre es requerido'}),
    suspendido: z.boolean()
  }),
  formadeentrega: z.object({
    nombre: z.string({required_error: 'El nombre es requerido'}),
    aplicaDespachoTransporte: z.boolean(),
    suspendido: z.boolean()
  }),
  tipopersona: z.object({
    nombre: z.string({required_error: 'El nombre es requerido'}),
    suspendido: z.boolean()
  }),
  tipovendedor: z.object({
    nombre: z.string({required_error: 'El nombre es requerido'}),
    suspendido: z.boolean()
  }),
  vendedor: z.object({
    nombre: z.string({required_error: 'El nombre es requerido'}),
    direccion: z.string({required_error: 'La dirección es requerida'}).optional(),
    telefono: z.string({required_error: 'El teléfono es requerido'}).optional(),
    email: z.string({required_error: 'El email es requerido'}).email('Email inválido'),
    esVendedor: z.boolean(),
    esCobrador: z.boolean(),
    codigoRegion: z.number({required_error: 'La región es requerida'}),
    codigoTipoVendedor: z.number({required_error: 'El tipo de vendedor es requerido'}),
    codigoListaPrecio: z.number({required_error: 'La lista de precio es requerida'}),
    suspendido: z.boolean()
  }),
  moneda: z.object({
    codigo: z.string({required_error: 'El código es requerido'}),
    nombre: z.string({required_error: 'El nombre es requerido'}),
    esDividir: z.boolean(),
    suspendido: z.boolean()
  }),
  tasadecambio: z.object({
    codigoMoneda: z.number({required_error: 'La moneda es requerida'}).min(1, 'La moneda es requerida'),
    fecha: z.string({required_error: 'La fecha es requerida'}).min(1, 'La fecha es requerida'),
    tasaVenta: z.number({required_error: 'La tasa de venta es requerida'}).min(0, 'La tasa de venta debe ser mayor o igual a 0'),
    tasaCompra: z.number({required_error: 'La tasa de compra es requerida'}).min(0, 'La tasa de compra debe ser mayor o igual a 0')
  }),
  listadeprecio: z.object({
    nombre: z.string({required_error: 'El nombre es requerido'}),
    suspendido: z.boolean()
  }),
  sector: z.object({
    nombre: z.string({required_error: 'El nombre es requerido'}),
    suspendido: z.boolean()
  }),
  rubro: z.object({
    nombre: z.string({required_error: 'El nombre es requerido'}),
    codigoListaPrecio: z.number({required_error: 'La lista de precio es requerida'}).min(1, 'La lista de precio es requerida'),
    suspendido: z.boolean()
  }),
  figuracomercial: z.object({
    nombre: z.string({required_error: 'El nombre es requerido'}),
    rif: z.string({required_error: 'El RIF es requerido'}),
    nit: z.string({required_error: 'El NIT es requerido'}),
    personaContacto: z.string({required_error: 'La persona de contacto es requerida'}),
    telefono: z.string({required_error: 'El teléfono es requerido'}),
    email: z.string({required_error: 'El email es requerido'}).email('Email inválido'), 
    emailAlterno: z.string({required_error: 'El email alterno es requerido'}).email('Email inválido'), 
    descripcionFiguraComercial: z.string({required_error: 'La descripción es requerida'}),
    codigoPais: z.number({required_error: 'El país es requerido'}).min(1, 'El país es requerido'),
    codigoCiudad: z.number({required_error: 'La ciudad es requerida'}).min(1, 'La ciudad es requerida'),
    codigoRubro: z.number({required_error: 'El rubro es requerido'}).min(1, 'El rubro es requerido'),
    codigoSector: z.number({required_error: 'El sector es requerido'}).min(1, 'El sector es requerido'),
    codigoVendedor: z.number({required_error: 'El vendedor es requerido'}).min(1, 'El vendedor es requerido'),
    codigoAcuerdoDePago: z.number({required_error: 'El acuerdo de pago es requerido'}).min(1, 'El acuerdo de pago es requerido'),
    codigoTipoPersona: z.number({required_error: 'El tipo de persona es requerido'}).min(1, 'El tipo de persona es requerido'),
    activoVentas: z.boolean(),
    activoCompras: z.boolean(),
    esCasaMatriz: z.boolean(),
    codigoFiguraComercialCasaMatriz: z.number({required_error: 'La casa matriz es requerida'}),
    direccionComercial: z.string({required_error: 'La dirección comercial es requerida'}),
    direccionEntrega: z.string({required_error: 'La dirección de entrega es requerida'}),
    codigoMonedaLimiteCreditoVentas: z.string({required_error: 'Moneda límite crédito ventas es requerida'}).min(1, 'Moneda límite crédito ventas es requerida'),
    montolimiteCreditoVentas: z.number({required_error: 'Monto límite crédito ventas es requerido'}),
    codigoMonedaLimiteCreditoCompras: z.string({required_error: 'Moneda límite crédito compras es requerida'}).min(1, 'Moneda límite crédito compras es requerida'),
    montolimiteCreditoCompras: z.number({required_error: 'Monto límite crédito compras es requerido'}),
    porceRetencionIva: z.number({required_error: 'Porcentaje retención IVA es requerido'}).min(0, 'Porcentaje retención IVA debe ser >= 0').max(100, 'Porcentaje retención IVA debe ser <= 100'),
    aplicaRetVentasAuto: z.boolean(),
    aplicaRetComprasAuto: z.boolean(),
    suspendido: z.boolean()
  })
}; 