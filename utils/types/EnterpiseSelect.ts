import { enterpriseSchema } from "../schemas/selectEntrepiseSchema";
import { z } from "zod";

export type EnterpriseSelect = z.infer<typeof enterpriseSchema>;
