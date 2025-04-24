import { z } from "zod";

export const loginSchema = z.object({
  username: z.string({ required_error: "Requerido" }),
  password: z.string({ required_error: "Requerido" }).min(5, 'La contraseña debe tener al menos 5 caracteres'),
});

