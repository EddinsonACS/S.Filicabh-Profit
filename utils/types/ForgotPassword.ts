import { z } from "zod";
import { forgotPasswordSchema } from "../schemas/forgotPasswordSchema";

export type ForgotPassword = z.infer<typeof forgotPasswordSchema>;
