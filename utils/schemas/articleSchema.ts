import { z } from 'zod';

export const articleSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  price: z.number().min(0, 'El precio debe ser mayor o igual a 0'),
  stock: z.number().min(0, 'El stock debe ser mayor o igual a 0'),
  category: z.string().min(1, 'La categoría es requerida'),
  code: z.string().optional(),
  imageUrl: z.string().url('URL de imagen inválida').optional().or(z.literal('')),
});

export type ArticleFormData = z.infer<typeof articleSchema>; 