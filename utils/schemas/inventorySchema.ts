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
  codigoCategoria: z.number({required_error: 'Debe seleccionar una categoría'})
};

const codigoGrupoSchema = {
  codigoGrupo: z.number({required_error: 'Debe seleccionar un grupo'})
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
    nombre: z.string({required_error: 'El nombre es requerido'}),
    descripcion: z.string({required_error: 'La descripción es requerida'}),
    codigoArticulo: z.string({required_error: 'El código de artículo es requerido'}),
    codigoModelo: z.string({required_error: 'El código de modelo es requerido'}),
    codigoBarra: z.string({required_error: 'El código de barra es requerido'}),
    codigoGrupo: z.number({required_error: 'Debe seleccionar un grupo'}),
    codigoColor: z.number({required_error: 'Debe seleccionar un color'}),
    codigoTalla: z.number({required_error: 'Debe seleccionar una talla'}),
    codigoTipoArticulo: z.number({required_error: 'Debe seleccionar un tipo de artículo'}),
    codigoImpuesto: z.number({required_error: 'Debe seleccionar un impuesto'}),
    presentaciones: z.number({required_error: 'Debe seleccionar una presentación'}),
    peso: z.number({required_error: 'El peso es requerido'}),
    volumen: z.number({required_error: 'El volumen es requerido'}),
    metroCubico: z.number({required_error: 'El metro cúbico es requerido'}),
    pie: z.number({required_error: 'El pie es requerido'}),
    manejaLote: z.boolean().optional(),
    manejaSerial: z.boolean().optional(),
    poseeGarantia: z.boolean().optional(),
    descripcionGarantia: z.string({required_error: 'La descripción de la garantía es requerida'}),
    manejaPuntoMinimo: z.boolean().optional(),
    puntoMinimo: z.number({required_error: 'El punto mínimo es requerido'}),
    manejaPuntoMaximo: z.boolean().optional(),
    puntoMaximo: z.number({required_error: 'El punto máximo es requerido'}),
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