import { z } from 'zod';

const baseSchema = {
  nombre: z.string().min(1, 'El nombre es requerido'),
  suspendido: z.boolean()
};

const ventasComprasSchema = {
  aplicaVentas: z.boolean(),
  aplicaCompras: z.boolean()
};

const equipoSchema = {
  equipo: z.string().min(1, 'El equipo es requerido')
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
    ...ventasComprasSchema
  }),
  grupo: z.object({
    ...baseSchema,
    ...ventasComprasSchema
  }),
  origen: z.object({
    ...baseSchema,
    ...ventasComprasSchema
  }),
  talla: z.object({
    ...baseSchema,
    ...ventasComprasSchema
  }),
  tipodearticulo: z.object({
    ...baseSchema,
    ...ventasComprasSchema
  }),
  tipodeimpuesto: z.object({
    ...baseSchema,
    ...ventasComprasSchema
  }),
  seccion: z.object({
    ...baseSchema,
    ...ventasComprasSchema
  }),
  unidad: z.object({
    ...baseSchema,
    ...ventasComprasSchema
  })
};

export type InventoryFormData = {
  [K in keyof typeof inventorySchema]: z.infer<typeof inventorySchema[K]>
}; 