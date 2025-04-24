import { z } from "zod";

export const enterpriseSchema = z.object({
  enterpriseId: z.string().min(1, 'Debes seleccionar una empresa'),
});
