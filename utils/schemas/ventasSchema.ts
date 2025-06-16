import { z } from 'zod';

// Validaciones simples - solo verifican que el campo no esté vacío
const nameSchema = z.string({required_error: 'Campo requerido'})
  .min(1, 'Campo requerido');

const codeSchema = z.string({required_error: 'Campo requerido'})
  .min(1, 'Campo requerido');

const addressSchema = z.string({required_error: 'Campo requerido'})
  .min(1, 'Campo requerido');

const phoneSchema = z.string({required_error: 'Campo requerido'})
  .min(1, 'Campo requerido');

const emailSchema = z.string({required_error: 'Campo requerido'})
  .min(1, 'Campo requerido')
  .email('Formato de email inválido');

const rifSchema = z.string({required_error: 'Campo requerido'})
  .min(1, 'Campo requerido');

const nitSchema = z.string({required_error: 'Campo requerido'})
  .min(1, 'Campo requerido');

const descriptionSchema = z.string({required_error: 'Campo requerido'})
  .min(1, 'Campo requerido');

const dateSchema = z.string({required_error: 'Campo requerido'})
  .min(1, 'Campo requerido');

// Esquema base común
const baseSchema = {
  nombre: nameSchema,
  suspendido: z.boolean()
};

export const ventasSchema = {
  acuerdodepago: z.object({
    ...baseSchema,
    dias: z.number({required_error: 'Campo requerido'})
      .min(0, 'Los días deben ser mayor o igual a 0'),
  }),
  
  ciudad: z.object({
    ...baseSchema,
    codigoRegion: z.number({required_error: 'Campo requerido'})
      .min(1, 'Campo requerido'),
  }),
  
  region: z.object({
    ...baseSchema,
  }),
  
  pais: z.object({
    codigo: codeSchema,
    nombre: nameSchema,
    suspendido: z.boolean()
  }),
  
  formadeentrega: z.object({
    ...baseSchema,
    aplicaDespachoTransporte: z.boolean(),
  }),
  
  tipopersona: z.object({
    ...baseSchema,
  }),
  
  tipovendedor: z.object({
    ...baseSchema,
  }),
  
  vendedor: z.object({
    nombre: nameSchema,
    direccion: addressSchema.optional(),
    telefono: phoneSchema.optional(),
    email: emailSchema,
    esVendedor: z.boolean(),
    esCobrador: z.boolean(),
    codigoRegion: z.number({required_error: 'Campo requerido'}),
    codigoTipoVendedor: z.number({required_error: 'Campo requerido'}),
    codigoListaPrecio: z.number({required_error: 'Campo requerido'}),
    suspendido: z.boolean()
  }),
  
  moneda: z.object({
    codigo: codeSchema,
    nombre: nameSchema,
    esDividir: z.boolean(),
    suspendido: z.boolean()
  }),
  
  tasadecambio: z.object({
    codigoMoneda: z.number({required_error: 'Campo requerido'})
      .min(1, 'Campo requerido'),
    fecha: dateSchema,
    tasaVenta: z.number({required_error: 'Campo requerido'})
      .min(0, 'La tasa debe ser mayor o igual a 0'),
    tasaCompra: z.number({required_error: 'Campo requerido'})
      .min(0, 'La tasa debe ser mayor o igual a 0')
  }),
  
  listadeprecio: z.object({
    ...baseSchema,
  }),
  
  sector: z.object({
    ...baseSchema,
  }),
  
  rubro: z.object({
    ...baseSchema,
    codigoListaPrecio: z.number({required_error: 'Campo requerido'})
      .min(1, 'Campo requerido'),
  }),
  
  figuracomercial: z.object({
    nombre: nameSchema,
    rif: rifSchema,
    nit: nitSchema,
    personaContacto: nameSchema,
    telefono: phoneSchema,
    email: emailSchema,
    emailAlterno: emailSchema,
    descripcionFiguraComercial: descriptionSchema,
    codigoPais: z.number({required_error: 'Campo requerido'})
      .min(1, 'Campo requerido'),
    codigoCiudad: z.number({required_error: 'Campo requerido'})
      .min(1, 'Campo requerido'),
    codigoRubro: z.number({required_error: 'Campo requerido'})
      .min(1, 'Campo requerido'),
    codigoSector: z.number({required_error: 'Campo requerido'})
      .min(1, 'Campo requerido'),
    codigoVendedor: z.number({required_error: 'Campo requerido'})
      .min(1, 'Campo requerido'),
    codigoAcuerdoDePago: z.number({required_error: 'Campo requerido'})
      .min(1, 'Campo requerido'),
    codigoTipoPersona: z.number({required_error: 'Campo requerido'})
      .min(1, 'Campo requerido'),
    activoVentas: z.boolean(),
    activoCompras: z.boolean(),
    esCasaMatriz: z.boolean(),
    codigoFiguraComercialCasaMatriz: z.number({required_error: 'Campo requerido'}),
    direccionComercial: addressSchema,
    direccionEntrega: addressSchema,
    codigoMonedaLimiteCreditoVentas: z.string({required_error: 'Campo requerido'})
      .min(1, 'Campo requerido'),
    montolimiteCreditoVentas: z.number({required_error: 'Campo requerido'}),
    codigoMonedaLimiteCreditoCompras: z.string({required_error: 'Campo requerido'})
      .min(1, 'Campo requerido'),
    montolimiteCreditoCompras: z.number({required_error: 'Campo requerido'}),
    porceRetencionIva: z.number({required_error: 'Campo requerido'})
      .min(0, 'El porcentaje debe ser >= 0')
      .max(100, 'El porcentaje debe ser <= 100'),
    aplicaRetVentasAuto: z.boolean(),
    aplicaRetComprasAuto: z.boolean(),
    suspendido: z.boolean()
  })
}; 