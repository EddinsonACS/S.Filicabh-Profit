import { z } from 'zod';

export const inventorySchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  aplicaVentas: z.boolean(),
  aplicaCompras: z.boolean(),
  suspendido: z.boolean()
});

export type InventoryFormData = z.infer<typeof inventorySchema>; 