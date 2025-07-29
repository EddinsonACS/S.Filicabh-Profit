import { z } from "zod";

const baseSchema = {
  nombre: z
    .string({ required_error: "El nombre es requerido" })
    .min(1, "El nombre es requerido"),
  suspendido: z.boolean(),
};

const ventasComprasSchema = {
  aplicaVentas: z.boolean(),
  aplicaCompras: z.boolean(),
};

const manejaInventarioSchema = {
  manejaInventario: z.boolean(),
};

export const inventorySchema = {
  almacen: z.object({
    ...baseSchema,
    ...ventasComprasSchema,
  }),
  articulo: z.object({
    nombre: z
      .string({ required_error: "El nombre es requerido" })
      .min(1, "El nombre es requerido"),
    descripcion: z.string().nullable().optional(),
    codigo: z.string().nullable().optional(),
    codigoArticulo: z.string().nullable().optional(),
    codigoModelo: z.string().nullable().optional(),
    codigoBarra: z.string().nullable().optional(),
    idGrupo: z
      .number({ required_error: "Debe seleccionar un grupo" })
      .min(1, "Debe seleccionar un grupo válido"),
    idColor: z.number().nullable().optional(),
    idTalla: z.number().nullable().optional(),
    idTipoArticulo: z
      .number({ required_error: "Debe seleccionar un tipo de artículo" })
      .min(1, "Debe seleccionar un tipo de artículo válido"),
    idImpuesto: z
      .number({ required_error: "Debe seleccionar un impuesto" })
      .min(1, "Debe seleccionar un impuesto válido"),
    presentaciones: z.array(z.any()).optional(),
    peso: z.number().nullable().optional(),
    precio: z
      .number({ required_error: "El precio es requerido" })
      .min(0, "El precio debe ser mayor o igual a 0"),
    stockActual: z
      .number({ required_error: "El stock es requerido" })
      .min(0, "El stock debe ser mayor o igual a 0"),
    volumen: z.number().nullable().optional(),
    metroCubico: z.number().nullable().optional(),
    pie: z.number().nullable().optional(),
    manejaLote: z.boolean().nullable().optional(),
    manejaSerial: z.boolean().nullable().optional(),
    poseeGarantia: z.boolean().nullable().optional(),
    descripcionGarantia: z.string().nullable().optional(),
    manejaPuntoMinimo: z.boolean().nullable().optional(),
    puntoMinimo: z
      .number({ required_error: "El punto mínimo es requerido" })
      .min(0, "El punto mínimo debe ser mayor o igual a 0"),
    manejaPuntoMaximo: z.boolean().nullable().optional(),
    puntoMaximo: z
      .number({ required_error: "El punto máximo es requerido" })
      .min(0, "El punto máximo debe ser mayor o igual a 0"),
    suspendido: z.boolean().nullable().optional(),
  }),
  categoria: z.object({
    ...baseSchema,
  }),
  color: z.object({
    ...baseSchema,
  }),
  grupo: z.object({
    ...baseSchema,
    idCategoria: z
      .number({ required_error: "Debe seleccionar una categoría" })
      .min(1, "Debe seleccionar una categoría válida"),
  }),
  origen: z.object({
    ...baseSchema,
  }),
  talla: z.object({
    ...baseSchema,
  }),
  tipodearticulo: z.object({
    ...baseSchema,
    ...manejaInventarioSchema,
  }),
  tipodeimpuesto: z.object({
    ...baseSchema,
  }),
  seccion: z.object({
    ...baseSchema,
    idGrupo: z
      .number({ required_error: "Debe seleccionar un grupo" })
      .min(1, "Debe seleccionar un grupo válido"),
  }),
  presentacion: z.object({
    ...baseSchema,
  }),
};

export type InventoryFormData = {
  [K in keyof typeof inventorySchema]: z.infer<(typeof inventorySchema)[K]>;
};
