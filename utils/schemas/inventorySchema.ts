import { z } from 'zod';

const baseSchema = {
  nombre: z.string({required_error: 'El nombre es requerido'}).min(1, 'El nombre es requerido'),
  suspendido: z.boolean()
};

const ventasComprasSchema = {
  aplicaVentas: z.boolean(),
  aplicaCompras: z.boolean()
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
    descripcion: z.string({required_error: 'La descripción es requerida'}).min(1, 'La descripción es requerida'),
    codigo: z.string().optional(),
    codigoArticulo: z.string().optional(),
    codigoModelo: z.string().optional(),
    codigoBarra: z.string().optional(),
    idGrupo: z.number({required_error: 'Debe seleccionar un grupo'}).min(1, 'Debe seleccionar un grupo válido'),
    idColor: z.number().optional(),
    idTalla: z.number().optional(),
    idTipoArticulo: z.number({required_error: 'Debe seleccionar un tipo de artículo'}).min(1, 'Debe seleccionar un tipo de artículo válido'),
    idImpuesto: z.number({required_error: 'Debe seleccionar un impuesto'}).min(1, 'Debe seleccionar un impuesto válido'),
    presentaciones: z.union([z.number(), z.array(z.number())]).optional(),
    peso: z.number().optional(),
    volumen: z.number().optional(),
    metroCubico: z.number().optional(),
    pie: z.number().optional(),
    manejaLote: z.boolean().optional(),
    manejaSerial: z.boolean().optional(),
    poseeGarantia: z.boolean().optional(),
    descripcionGarantia: z.string().optional(),
    manejaPuntoMinimo: z.boolean().optional(),
    puntoMinimo: z.number().optional(),
    manejaPuntoMaximo: z.boolean().optional(),
    puntoMaximo: z.number().optional(),
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
    idCategoria: z.number({required_error: 'Debe seleccionar una categoría'}).min(1, 'Debe seleccionar una categoría válida')
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
    idGrupo: z.number({required_error: 'Debe seleccionar un grupo'}).min(1, 'Debe seleccionar un grupo válido')
  }),
  presentacion: z.object({
    ...baseSchema,
  })
};

export type InventoryFormData = {
  [K in keyof typeof inventorySchema]: z.infer<typeof inventorySchema[K]>
}; 