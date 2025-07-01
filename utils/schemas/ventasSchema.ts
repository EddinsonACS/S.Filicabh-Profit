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

// Esquemas numéricos flexibles que aceptan string o number
const flexibleNumberSchema = z.union([
  z.number(),
  z.string().transform((val) => {
    if (val === '' || val === undefined || val === null) return 0;
    const num = parseFloat(val.replace(',', '.'));
    return isNaN(num) ? 0 : num;
  })
], {required_error: 'Campo requerido'});

const flexibleIntegerSchema = z.union([
  z.number(),
  z.string().transform((val) => {
    if (val === '' || val === undefined || val === null) return 0;
    const num = parseInt(val.replace(/\D/g, ''), 10);
    return isNaN(num) ? 0 : num;
  })
], {required_error: 'Campo requerido'});

// Esquema base común
const baseSchema = {
  nombre: nameSchema,
  suspendido: z.boolean()
};

export const ventasSchema = {
  acuerdodepago: z.object({
    ...baseSchema,
    dias: flexibleIntegerSchema
      .refine((val) => val >= 0, 'Los días deben ser mayor o igual a 0'),
  }),
  
  ciudad: z.object({
    ...baseSchema,
    idRegion: flexibleIntegerSchema
      .refine((val) => val >= 1, 'Campo requerido'),
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
    idRegion: flexibleIntegerSchema,
    idTipoVendedor: flexibleIntegerSchema,
    idListaPrecio: flexibleIntegerSchema,
    suspendido: z.boolean()
  }),
  
  moneda: z.object({
    codigo: codeSchema,
    nombre: nameSchema,
    esDividir: z.boolean(),
    suspendido: z.boolean()
  }),
  
  tasadecambio: z.object({
    idMoneda: flexibleIntegerSchema
      .refine((val) => val >= 1, 'Campo requerido'),
    fecha: dateSchema,
    tasaVenta: flexibleNumberSchema
      .refine((val) => val >= 0, 'La tasa debe ser mayor o igual a 0'),
    tasaCompra: flexibleNumberSchema
      .refine((val) => val >= 0, 'La tasa debe ser mayor o igual a 0')
  }),
  
  listadeprecio: z.object({
    ...baseSchema,
  }),
  
  sector: z.object({
    ...baseSchema,
  }),
  
  rubro: z.object({
    ...baseSchema,
    idListaPrecio: flexibleIntegerSchema
      .refine((val) => val >= 1, 'Campo requerido'),
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
    idPais: flexibleIntegerSchema
      .refine((val) => val >= 1, 'Campo requerido'),
    idCiudad: flexibleIntegerSchema
      .refine((val) => val >= 1, 'Campo requerido'),
    idRubro: flexibleIntegerSchema
      .refine((val) => val >= 1, 'Campo requerido'),
    idSector: flexibleIntegerSchema
      .refine((val) => val >= 1, 'Campo requerido'),
    idVendedor: flexibleIntegerSchema
      .refine((val) => val >= 1, 'Campo requerido'),
    idAcuerdoDePago: flexibleIntegerSchema
      .refine((val) => val >= 1, 'Campo requerido'),
    idTipoPersona: flexibleIntegerSchema
      .refine((val) => val >= 1, 'Campo requerido'),
    activoVentas: z.boolean(),
    activoCompras: z.boolean(),
    esCasaMatriz: z.boolean(),
    codigoFiguraComercialCasaMatriz: flexibleIntegerSchema,
    direccionComercial: addressSchema,
    direccionEntrega: addressSchema,
    codigoMonedaLimiteCreditoVentas: z.string({required_error: 'Campo requerido'})
      .min(1, 'Campo requerido'),
    montolimiteCreditoVentas: flexibleNumberSchema,
    codigoMonedaLimiteCreditoCompras: z.string({required_error: 'Campo requerido'})
      .min(1, 'Campo requerido'),
    montolimiteCreditoCompras: flexibleNumberSchema,
    porceRetencionIva: flexibleNumberSchema
      .refine((val) => val >= 0 && val <= 100, 'El porcentaje debe estar entre 0 y 100'),
    aplicaRetVentasAuto: z.boolean(),
    aplicaRetComprasAuto: z.boolean(),
    suspendido: z.boolean()
  })
}; 