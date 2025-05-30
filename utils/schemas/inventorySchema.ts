import { z } from 'zod';

const baseSchema = {
  nombre: z.string().min(1, 'El nombre es requerido'),
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
    ...baseSchema,
    ...ventasComprasSchema
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