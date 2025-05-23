import { Caja } from '@/core/models/Finanzas/Caja';
import ListDataResponse from '@/core/response/ListDataResponse';
import { createApiService } from '@/data/api/apiGeneric';
import { endpoints } from '@/utils/const/endpoints';
import { queryClient } from '@/utils/libs/queryClient';
import { useMutation, useQuery, UseQueryOptions } from '@tanstack/react-query';
import { Alert } from 'react-native';

const apiCaja = createApiService<Caja>();

export const useCaja = () => {
  const useGetCajaList = (page: number = 1, size: number = 10) => {
    return useQuery<ListDataResponse<Caja>, Error>({
      queryKey: ['caja', 'list', page, size],
      queryFn: () => apiCaja.getList(endpoints.finanzas.caja.list, page, size),
      onSettled: (_: ListDataResponse<Caja> | undefined, error: Error | null) => {
        if (error) {
          Alert.alert(
            'Error',
            'No se pudo cargar la lista de cajas. Por favor, intente nuevamente.'
          );
          console.error('Error fetching caja list:', error);
        }
      }
    } as UseQueryOptions<ListDataResponse<Caja>, Error>);
  };

  const useGetCajaItem = (id: number) => {
    return useQuery<Caja, Error>({
      queryKey: ['caja', 'item', id],
      queryFn: () => apiCaja.getOne(endpoints.finanzas.caja.getOne(id)),
      enabled: !!id,
      onSettled: (_: Caja | undefined, error: Error | null) => {
        if (error) {
          Alert.alert(
            'Error',
            'No se pudo cargar el item de caja. Por favor, intente nuevamente.'
          );
          console.error('Error fetching caja item:', error);
        }
      }
    } as UseQueryOptions<Caja, Error>);
  };

  const useCreateCaja = () => {
    return useMutation({
      mutationFn: (formData: Partial<Caja>) => {
        if (!formData.nombre) {
          throw new Error('El nombre es requerido');
        }
        if (!formData.codigoMoneda) {
          throw new Error('La moneda es requerida');
        }
        const data: Omit<Caja, 'id' | 'fechaRegistro' | 'usuarioRegistroNombre' | 'fechaModificacion' | 'usuarioModificacionNombre' | 'usuario'> = {
          nombre: formData.nombre,
          suspendido: formData.suspendido || false,
          otrosF1: new Date().toISOString(),
          otrosN1: 0,
          otrosN2: 0,
          otrosC1: null,
          otrosC2: null,
          otrosC3: null,
          otrosC4: null,
          otrosT1: null,
          equipo: "equipo",
          codigoMoneda: Number(formData.codigoMoneda)
        };
        return apiCaja.create(endpoints.finanzas.caja.create, data);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['caja', 'list'] });
        Alert.alert(
          'Éxito',
          'Item de caja creado correctamente.'
        );
      },
      onError: (error) => {
        Alert.alert(
          'Error',
          'No se pudo crear el item de caja. Por favor, intente nuevamente.'
        );
        console.error('Error creating caja item:', error);
      }
    });
  };

  const useUpdateCaja = () => {
    return useMutation({
      mutationFn: ({ id, formData }: { id: number; formData: Partial<Caja> }) => {
        if (!formData.nombre) {
          throw new Error('El nombre es requerido');
        }
        const data: Partial<Caja> = {
          id: id,
          nombre: formData.nombre,
          suspendido: formData.suspendido || false,
          otrosF1: new Date().toISOString(),
          otrosN1: 0,
          otrosN2: 0,
          otrosC1: null,
          otrosC2: null,
          otrosC3: null,
          otrosC4: null,
          otrosT1: null,
          equipo: "equipo",
          codigoMoneda: formData.codigoMoneda || 0
        };
        return apiCaja.update(endpoints.finanzas.caja.update(id), data);
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['caja', 'list'] });
        queryClient.invalidateQueries({ queryKey: ['caja', 'item', variables.id] });
        Alert.alert(
          'Éxito',
          'Item de caja actualizado correctamente.'
        );
      },
      onError: (error) => {
        Alert.alert(
          'Error',
          'No se pudo actualizar el item de caja. Por favor, intente nuevamente.'
        );
        console.error('Error updating caja item:', error);
      }
    });
  };

  const useDeleteCaja = () => {
    return useMutation({
      mutationFn: (id: number) => apiCaja.delete(endpoints.finanzas.caja.delete(id)),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['caja', 'list'] });
        Alert.alert(
          'Éxito',
          'Item de caja eliminado correctamente.'
        );
      },
      onError: (error) => {
        Alert.alert(
          'Error',
          'No se pudo eliminar el item de caja. Por favor, intente nuevamente.'
        );
        console.error('Error deleting caja item:', error);
      }
    });
  };

  return {
    useGetCajaList,
    useGetCajaItem,
    useCreateCaja,
    useUpdateCaja,
    useDeleteCaja
  };
}; 