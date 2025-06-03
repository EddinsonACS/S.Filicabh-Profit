import { z } from 'zod';

const baseSchema = {
  nombre: z.string({required_error: 'El nombre es requerido'}).min(1, 'El nombre es requerido'),
  suspendido: z.boolean()
};

const ventasComprasSchema = {
  aplicaVentas: z.boolean(),
  aplicaCompras: z.boolean()
};

const codigoCategoriaSchema = {
  codigoCategoria: z.number().min(1, 'Debe seleccionar una categoría')
};

const codigoGrupoSchema = {
  codigoGrupo: z.number({required_error: 'Debe seleccionar un grupo'}).min(1, 'Debe seleccionar un grupo')
};

const manejaInventarioSchema = {
  manejaInventario: z.boolean()
};

export const inventorySchema = {
  almacen: z.object({
    ...baseSchema,
    ...ventasComprasSchema
  }),
  articulo: z.object({
    nombre: z.string({required_error: 'El nombre es requerido'}).min(1, 'El nombre es requerido'),
    descripcion: z.string({required_error: 'La descripción es requerida'}).optional(),
    codigoArticulo: z.string({required_error: 'El código de artículo es requerido'}).optional(),
    codigoModelo: z.string({required_error: 'El código de modelo es requerido'}).optional(),
    codigoBarra: z.string({required_error: 'El código de barra es requerido'}).optional(),
    codigoGrupo: z.number({required_error: 'Debe seleccionar un grupo'}).optional(),
    codigoColor: z.number({required_error: 'Debe seleccionar un color'}).optional(),
    codigoTalla: z.number({required_error: 'Debe seleccionar una talla'}).optional(),
    codigoTipoArticulo: z.number({required_error: 'Debe seleccionar un tipo de artículo'}).optional(),
    codigoImpuesto: z.number({required_error: 'Debe seleccionar un impuesto'}).optional(),
    peso: z.number({required_error: 'El peso es requerido'}).optional(),
    volumen: z.number({required_error: 'El volumen es requerido'}).optional(),
    metroCubico: z.number({required_error: 'El metro cúbico es requerido'}).optional(),
    pie: z.number({required_error: 'El pie es requerido'}).optional(),
    manejaLote: z.boolean().optional(),
    manejaSerial: z.boolean().optional(),
    poseeGarantia: z.boolean().optional(),
    descripcionGarantia: z.string({required_error: 'La descripción de la garantía es requerida'}).optional(),
    manejaPuntoMinimo: z.boolean().optional(),
    puntoMinimo: z.number({required_error: 'El punto mínimo es requerido'}).optional(),
    manejaPuntoMaximo: z.boolean().optional(),
    puntoMaximo: z.number({required_error: 'El punto máximo es requerido'}).optional(),
    suspendido: z.boolean().optional(),
  }),
  categoria: z.object({
    ...baseSchema,
  }),
  color: z.object({
    ...baseSchema,
  }),
  grupo: z.object({
    ...baseSchema,
    ...codigoCategoriaSchema
  }),
  origen: z.object({
    ...baseSchema,
  }),
  talla: z.object({
    ...baseSchema,
  }),
  tipodearticulo: z.object({
    ...baseSchema,
    ...manejaInventarioSchema
  }),
  tipodeimpuesto: z.object({
    ...baseSchema,
  }),
  seccion: z.object({
    ...baseSchema,
    ...codigoGrupoSchema
  }),
  unidad: z.object({
    ...baseSchema,
  })
};

export type InventoryFormData = {
  [K in keyof typeof inventorySchema]: z.infer<typeof inventorySchema[K]>
}; 