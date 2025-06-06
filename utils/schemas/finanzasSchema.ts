import { z } from 'zod';

const baseSchema = {
  nombre: z.string({required_error: 'El nombre es requerido'}).min(1, 'El nombre es requerido'),
  suspendido: z.boolean()
};

const baseCuentaBancariaSchema = {
    nroCuenta: z.string({required_error: 'El número de cuenta es requerido'}),
    tipoDeCuenta: z.string({required_error: 'El tipo de cuenta es requerido'}),
    codigoMoneda: z.number({required_error: 'El código de moneda es requerido'}),
    codigoBanco: z.number({required_error: 'El código de banco es requerido'}),
    sucursal: z.string({required_error: 'La sucursal es requerida'}),
    direccion: z.string({required_error: 'La dirección es requerida'}),
    nombreEjecutivo: z.string({required_error: 'El nombre del ejecutivo es requerido'}),
    telefono: z.string({required_error: 'El teléfono es requerido'}),
    email: z.string({required_error: 'El email es requerido'}).email('El email no es válido')
};

export const finanzasSchema = {
  banco: z.object({
    ...baseSchema,
  }),
  caja: z.object({
    ...baseSchema,
    codigoMoneda: z.number({required_error: 'La moneda es requerida'}).min(1, 'La moneda es requerida'),
  }),
  cuentaBancaria: z.object({
    ...baseCuentaBancariaSchema,
    suspendido: z.boolean().default(false)
  }),
};

export type FinanzasFormData = {
  [K in keyof typeof finanzasSchema]: z.infer<typeof finanzasSchema[K]>
}; 