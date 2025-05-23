import { z } from 'zod';

const baseSchema = {
  nombre: z.string().min(1, 'El nombre es requerido'),
  suspendido: z.boolean()
};

const baseCuentaBancariaSchema = {
    nroCuenta: z.string().min(1, 'El número de cuenta es requerido'),
    tipoDeCuenta: z.string().min(1, 'El tipo de cuenta es requerido'),
    codigoMoneda: z.number().min(1, 'El código de moneda es requerido'),
    codigoBanco: z.number().min(1, 'El código de banco es requerido'),
    sucursal: z.string().min(1, 'La sucursal es requerida'),
    direccion: z.string().min(1, 'La dirección es requerida'),
    nombreEjecutivo: z.string().min(1, 'El nombre del ejecutivo es requerido'),
    telefono: z.string().min(1, 'El teléfono es requerido'),
    email: z.string().email('El email no es válido').min(1, 'El email es requerido')
};

export const finanzasSchema = {
  banco: z.object({
    ...baseSchema,
  }),
  caja: z.object({
    ...baseSchema,
    codigoMoneda: z.number().min(1, 'La moneda es requerida'),
  }),
  cuentaBancaria: z.object({
    ...baseCuentaBancariaSchema,
    suspendido: z.boolean().default(false)
  }),
};

export type FinanzasFormData = {
  [K in keyof typeof finanzasSchema]: z.infer<typeof finanzasSchema[K]>
}; 