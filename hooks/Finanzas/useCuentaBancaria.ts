import CuentaBancaria from '@/core/models/Finanzas/CuentaBancaria';
import ListDataResponse from '@/core/response/ListDataResponse';
import { createApiService } from '@/data/api/apiGeneric';
import { endpoints } from '@/utils/const/endpoints';
import { queryClient } from '@/utils/libs/queryClient';
import { useMutation, useQuery, UseQueryOptions } from '@tanstack/react-query';

const apiCuentaBancaria = createApiService<CuentaBancaria>();

export const useCuentaBancaria = () => {
  const useGetCuentaBancariaList = (page: number = 1, size: number = 10) => {
    return useQuery<ListDataResponse<CuentaBancaria>, Error>({
      queryKey: ['cuentaBancaria', 'list', page, size],
      queryFn: () => apiCuentaBancaria.getList(endpoints.finanzas.cuentaBancaria.list, page, size),
      onSettled: (_: ListDataResponse<CuentaBancaria> | undefined, error: Error | null) => {
        if (error) {
          console.error('Error fetching cuentaBancaria list:', error);
        }
      }
    } as UseQueryOptions<ListDataResponse<CuentaBancaria>, Error>);
  };

  const useGetCuentaBancariaItem = (id: number) => {
    return useQuery<CuentaBancaria, Error>({
      queryKey: ['cuentaBancaria', 'item', id],
      queryFn: () => apiCuentaBancaria.getOne(endpoints.finanzas.cuentaBancaria.getOne(id)),
      enabled: !!id,
      onSettled: (_: CuentaBancaria | undefined, error: Error | null) => {
        if (error) {
          console.error('Error fetching cuentaBancaria item:', error);
        }
      }
    } as UseQueryOptions<CuentaBancaria, Error>);
  };

  const useCreateCuentaBancaria = () => {
    return useMutation({
      mutationFn: (formData: Partial<CuentaBancaria>) => {
        // Solo validar campos requeridos
        if (!formData.nroCuenta || formData.nroCuenta.trim().length === 0) {
          throw new Error('El número de cuenta es requerido');
        }
        if (!formData.tipoDeCuenta || formData.tipoDeCuenta.trim().length === 0) {
          throw new Error('El tipo de cuenta es requerido');
        }
        if (!formData.codigoMoneda || formData.codigoMoneda === 0) {
          throw new Error('La moneda es requerida');
        }
        if (!formData.codigoBanco || formData.codigoBanco === 0) {
          throw new Error('El banco es requerido');
        }
        if (!formData.sucursal || formData.sucursal.trim().length === 0) {
          throw new Error('La sucursal es requerida');
        }
        if (!formData.direccion || formData.direccion.trim().length === 0) {
          throw new Error('La dirección es requerida');
        }
        if (!formData.nombreEjecutivo || formData.nombreEjecutivo.trim().length === 0) {
          throw new Error('El nombre del ejecutivo es requerido');
        }
        if (!formData.telefono || formData.telefono.trim().length === 0) {
          throw new Error('El teléfono es requerido');
        }
        if (!formData.email || formData.email.trim().length === 0) {
          throw new Error('El email es requerido');
        }

        const data: Omit<CuentaBancaria, 'id' | 'fechaRegistro' | 'usuarioRegistroNombre' | 'fechaModificacion' | 'usuarioModificacionNombre' | 'usuario'> = {
          nroCuenta: formData.nroCuenta.trim(),
          tipoDeCuenta: formData.tipoDeCuenta.trim(),
          codigoMoneda: Number(formData.codigoMoneda),
          codigoBanco: Number(formData.codigoBanco),
          sucursal: formData.sucursal.trim(),
          direccion: formData.direccion.trim(),
          nombreEjecutivo: formData.nombreEjecutivo.trim(),
          telefono: formData.telefono.trim(),
          email: formData.email.trim().toLowerCase(),
          suspendido: formData.suspendido || false,
          otrosF1: new Date().toISOString(),
          otrosN1: 0,
          otrosN2: 0,
          otrosC1: '',
          otrosC2: '',
          otrosC3: '',
          otrosC4: '',
          otrosT1: '',
          equipo: "equipo",
          fechaApertura: new Date().toISOString(),
        };
        return apiCuentaBancaria.create(endpoints.finanzas.cuentaBancaria.create, data);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['cuentaBancaria', 'list'] });
        // Notificación manejada desde el componente
      },
      onError: (error) => {
        console.error('Error creating cuentaBancaria item:', error);
        // Notificación de error manejada desde el componente
      }
    });
  };

  const useUpdateCuentaBancaria = () => {
    return useMutation({
      mutationFn: ({ id, formData }: { id: number; formData: Partial<CuentaBancaria> }) => {
        // Solo validar campos requeridos
        if (!formData.nroCuenta || formData.nroCuenta.trim().length === 0) {
          throw new Error('El número de cuenta es requerido');
        }
        if (!formData.tipoDeCuenta || formData.tipoDeCuenta.trim().length === 0) {
          throw new Error('El tipo de cuenta es requerido');
        }
        if (!formData.codigoMoneda || formData.codigoMoneda === 0) {
          throw new Error('La moneda es requerida');
        }
        if (!formData.codigoBanco || formData.codigoBanco === 0) {
          throw new Error('El banco es requerido');
        }
        if (!formData.sucursal || formData.sucursal.trim().length === 0) {
          throw new Error('La sucursal es requerida');
        }
        if (!formData.direccion || formData.direccion.trim().length === 0) {
          throw new Error('La dirección es requerida');
        }
        if (!formData.nombreEjecutivo || formData.nombreEjecutivo.trim().length === 0) {
          throw new Error('El nombre del ejecutivo es requerido');
        }
        if (!formData.telefono || formData.telefono.trim().length === 0) {
          throw new Error('El teléfono es requerido');
        }
        if (!formData.email || formData.email.trim().length === 0) {
          throw new Error('El email es requerido');
        }

        const data: Partial<CuentaBancaria> = {
          id: id,
          nroCuenta: formData.nroCuenta.trim(),
          tipoDeCuenta: formData.tipoDeCuenta.trim(),
          codigoMoneda: Number(formData.codigoMoneda),
          codigoBanco: Number(formData.codigoBanco),
          sucursal: formData.sucursal.trim(),
          direccion: formData.direccion.trim(),
          nombreEjecutivo: formData.nombreEjecutivo.trim(),
          telefono: formData.telefono.trim(),
          email: formData.email.trim().toLowerCase(),
          suspendido: formData.suspendido || false,
          otrosF1: new Date().toISOString(),
          otrosN1: 0,
          otrosN2: 0,
          otrosC1: formData.otrosC1 || '',
          otrosC2: formData.otrosC2 || '',
          otrosC3: formData.otrosC3 || '',
          otrosC4: formData.otrosC4 || '',
          otrosT1: formData.otrosT1 || '',
          equipo: "equipo"
        };
        return apiCuentaBancaria.update(endpoints.finanzas.cuentaBancaria.update(id), data);
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['cuentaBancaria', 'list'] });
        queryClient.invalidateQueries({ queryKey: ['cuentaBancaria', 'item', variables.id] });
        // Notificación manejada desde el componente
      },
      onError: (error) => {
        console.error('Error updating cuentaBancaria item:', error);
        // Notificación de error manejada desde el componente
      }
    });
  };

  const useDeleteCuentaBancaria = () => {
    return useMutation({
      mutationFn: (id: number) => apiCuentaBancaria.delete(endpoints.finanzas.cuentaBancaria.delete(id)),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['cuentaBancaria', 'list'] });
        // Notificación manejada desde el componente
      },
      onError: (error) => {
        console.error('Error deleting cuentaBancaria item:', error);
        // Notificación de error manejada desde el componente
      }
    });
  };

  return {
    useGetCuentaBancariaList,
    useGetCuentaBancariaItem,
    useCreateCuentaBancaria,
    useUpdateCuentaBancaria,
    useDeleteCuentaBancaria
  };
}; 