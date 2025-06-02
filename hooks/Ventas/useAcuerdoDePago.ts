import { AcuerdoDePago } from '@/core/models/Ventas/AcuerdoDePago';
import ListDataResponse from '@/core/response/ListDataResponse';
import { createApiService } from '@/data/api/apiGeneric';
import { endpoints } from '@/utils/const/endpoints';
import { queryClient } from '@/utils/libs/queryClient';
import { useMutation, useQuery, UseQueryOptions } from '@tanstack/react-query';

const apiAcuerdoDePago = createApiService<AcuerdoDePago>();

export const useAcuerdoDePago = () => {

  const useGetAcuerdoDePagoList = (page: number = 1, size: number = 10) => {
    return useQuery<ListDataResponse<AcuerdoDePago>, Error>({
      queryKey: ['acuerdodepago', 'list', page, size],
      queryFn: () => apiAcuerdoDePago.getList(endpoints.sales.acuerdodepago.list, page, size),
      onSettled: (_: ListDataResponse<AcuerdoDePago> | undefined, error: Error | null) => {
        if (error) {
          console.error('Error fetching acuerdo de pago list:', error);
        }
      }
    } as UseQueryOptions<ListDataResponse<AcuerdoDePago>, Error>);
  };

  const useGetAcuerdoDePagoItem = (id: number) => {
    return useQuery<AcuerdoDePago, Error>({
      queryKey: ['acuerdodepago', 'item', id],
      queryFn: () => apiAcuerdoDePago.getOne(endpoints.sales.acuerdodepago.getOne(id)),
      enabled: !!id,
      onSettled: (_: AcuerdoDePago | undefined, error: Error | null) => {
        if (error) {
          console.error('Error fetching acuerdo de pago item:', error);
        }
      }
    } as UseQueryOptions<AcuerdoDePago, Error>);
  };

  const useCreateAcuerdoDePago = () => {
    return useMutation({
      mutationFn: (formData: Partial<AcuerdoDePago>) => {
        if (!formData.nombre) {
          throw new Error('El nombre es requerido');
        }
        if (formData.dias === undefined || formData.dias === null) {
          throw new Error('Los días son requeridos');
        }
        const data: Omit<AcuerdoDePago, 'id' | 'fechaRegistro' | 'usuarioRegistroNombre' | 'fechaModificacion' | 'usuarioModificacionNombre'> = {
          nombre: formData.nombre,
          dias: formData.dias,
          suspendido: formData.suspendido || false,
          otrosF1: new Date().toISOString(),
          otrosN1: 0,
          otrosN2: 0,
          otrosC1: '',
          otrosC2: '',
          otrosC3: '',
          otrosC4: '',
          otrosT1: '',
          usuario: 1,
          equipo: 'equipo'
        };
        return apiAcuerdoDePago.create(endpoints.sales.acuerdodepago.create, data);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['acuerdodepago', 'list'] });
      },
      onError: (error) => {
        console.error('Error creating acuerdo de pago:', error);
      }
    });
  };

  const useUpdateAcuerdoDePago = () => {
    return useMutation({
      mutationFn: ({ id, formData }: { id: number; formData: Partial<AcuerdoDePago> }) => {
        if (!formData.nombre) {
          throw new Error('El nombre es requerido');
        }
        if (formData.dias === undefined || formData.dias === null) {
          throw new Error('Los días son requeridos');
        }
        const data: Partial<AcuerdoDePago> = {
          id: id,
          nombre: formData.nombre,
          dias: formData.dias,
          suspendido: formData.suspendido || false,
          otrosF1: new Date().toISOString(),
          otrosN1: 0,
          otrosN2: 0,
          otrosC1: '',
          otrosC2: '',
          otrosC3: '',
          otrosC4: '',
          otrosT1: '',
          usuario: 1,
          equipo: 'equipo'
        };
        return apiAcuerdoDePago.update(endpoints.sales.acuerdodepago.update(id), data);
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['acuerdodepago', 'list'] });
        queryClient.invalidateQueries({ queryKey: ['acuerdodepago', 'item', variables.id] });
      },
      onError: (error) => {
        console.error('Error updating acuerdo de pago:', error);
      }
    });
  };

  const useDeleteAcuerdoDePago = () => {
    return useMutation({
      mutationFn: (id: number) => apiAcuerdoDePago.delete(endpoints.sales.acuerdodepago.delete(id)),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['acuerdodepago', 'list'] });
      },
      onError: (error) => {
        console.error('Error deleting acuerdo de pago:', error);
      }
    });
  };

  return {
    useGetAcuerdoDePagoList,
    useGetAcuerdoDePagoItem,
    useCreateAcuerdoDePago,
    useUpdateAcuerdoDePago,
    useDeleteAcuerdoDePago
  };
};