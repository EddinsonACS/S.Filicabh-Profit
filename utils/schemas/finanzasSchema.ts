import { z } from 'zod';

// Validaciones simples - solo verifican que el campo no esté vacío
const nameSchema = z.string({required_error: 'Campo requerido'})
  .min(1, 'Campo requerido');

const addressSchema = z.string({required_error: 'Campo requerido'})
  .min(1, 'Campo requerido');

const accountNumberSchema = z.string({required_error: 'Campo requerido'})
  .min(1, 'Campo requerido');

const phoneSchema = z.string({required_error: 'Campo requerido'})
  .min(1, 'Campo requerido');

const emailSchema = z.string({required_error: 'Campo requerido'})
  .min(1, 'Campo requerido')
  .email('Formato de email inválido');

const sucursalSchema = z.string({required_error: 'Campo requerido'})
  .min(1, 'Campo requerido');

const baseSchema = {
  nombre: nameSchema,
  suspendido: z.boolean()
};

const baseCuentaBancariaSchema = {
    nroCuenta: accountNumberSchema,
    tipoDeCuenta: z.string({required_error: 'Campo requerido'})
      .min(1, 'Campo requerido'),
    codigoMoneda: z.number({required_error: 'Campo requerido'})
      .min(1, 'Campo requerido'),
    codigoBanco: z.number({required_error: 'Campo requerido'})
      .min(1, 'Campo requerido'),
    sucursal: sucursalSchema,
    direccion: addressSchema,
    nombreEjecutivo: nameSchema,
    telefono: phoneSchema,
    email: emailSchema
};

export const finanzasSchema = {
  banco: z.object({
    ...baseSchema,
  }),
  caja: z.object({
    ...baseSchema,
    codigoMoneda: z.number({required_error: 'Campo requerido'})
      .min(1, 'Campo requerido'),
  }),
  cuentaBancaria: z.object({
    ...baseCuentaBancariaSchema,
    suspendido: z.boolean().default(false)
  }),
};

export type FinanzasFormData = {
  [K in keyof typeof finanzasSchema]: z.infer<typeof finanzasSchema[K]>
}; 