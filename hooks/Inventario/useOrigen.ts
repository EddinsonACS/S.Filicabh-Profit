import { useMutation, UseQueryOptions } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import ListDataResponse from '@/core/response/ListDataResponse';
import { Alert } from 'react-native';
import { Origen } from '@/core/models/Origen';
import { queryClient } from '@/utils/libs/queryClient';
import { createApiService } from '@/data/api/apiGeneric';
import { endpoints } from '@/utils/const/endpoints';

const origenApiGeneric = createApiService<Origen>();

export const useOrigen   = () => {

  const useGetOrigenList = (page: number = 1, size: number = 10) => {
    return useQuery<ListDataResponse<Origen>, Error>({
      queryKey: ['origen', 'list', page, size],
      queryFn: () => origenApiGeneric.getList(endpoints.inventory.origen.list, page, size),
      onSettled: (_: ListDataResponse<Origen> | undefined, error: Error | null) => {
        if (error) {
          Alert.alert(
            'Error',
            'No se pudo cargar la lista de categorías. Por favor, intente nuevamente.'
          );
        console.error('Error fetching origen list:', error);
        }
      }
    } as UseQueryOptions<ListDataResponse<Origen>, Error>);
  };

  const useGetOrigenItem = (id: number) => {
    return useQuery<Origen, Error>({
      queryKey: ['origen', 'item', id],
      queryFn: () => origenApiGeneric.getOne(endpoints.inventory.origen.getOne(id)),
      enabled: !!id,
      onSettled: (_: Origen | undefined, error: Error | null) => {
        if (error) {
          Alert.alert(
            'Error',
            'No se pudo cargar el color. Por favor, intente nuevamente.'
          );
          console.error('Error fetching origen item:', error);
        }
      }
    } as UseQueryOptions<Origen, Error>);
  };

  const useCreateOrigen = () => {
    return useMutation({
      mutationFn: (formData: Partial<Origen>) => {
        if (!formData.nombre) {
          throw new Error('El nombre es requerido');
        }
        const data: Omit<Origen, 'id' | 'fechaRegistro' | 'usuarioRegistroNombre' | 'fechaModificacion' | 'usuarioModificacionNombre' | 'usuario'> = {
          nombre: formData.nombre,
          suspendido: formData.suspendido || false,
          otrosF1: new Date().toISOString(),
          otrosN1: formData.otrosN1 || 0,
          otrosN2: formData.otrosN2 || 0,
          otrosC1: formData.otrosC1 || null,
          otrosC2: formData.otrosC2 || null,
          otrosC3: formData.otrosC3 || null,
          otrosC4: formData.otrosC4 || null,
          otrosT1: formData.otrosT1 || null,
          equipo: 'equipo',
        };
        return origenApiGeneric.create(endpoints.inventory.origen.create, data);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['origen', 'list'] });
        Alert.alert(
          'Éxito',
          'Origen creada correctamente.'
        );
      },
      onError: (error) => {
        Alert.alert(
          'Error',
          'No se pudo crear el origen. Por favor, intente nuevamente.'
        );
        console.error('Error creating origen:', error);
      }
    });
  };

  const useUpdateOrigen = () => {
    return useMutation({
      mutationFn: ({ id, formData }: { id: number; formData: Partial<Origen> }) => {
        if (!formData.nombre) {
          throw new Error('El nombre es requerido');
        }
        const data: Partial<Origen> = {
          id: id,
          nombre: formData.nombre,
          suspendido: formData.suspendido || false,
          otrosF1: new Date().toISOString(),
          otrosN1: formData.otrosN1 || 0,
          otrosN2: formData.otrosN2 || 0,
          otrosC1: formData.otrosC1 || null,
          otrosC2: formData.otrosC2 || null,
          otrosC3: formData.otrosC3 || null,
          otrosC4: formData.otrosC4 || null,
          otrosT1: formData.otrosT1 || null,
          equipo: 'equipo',
        };
        return origenApiGeneric.update(endpoints.inventory.origen.update(id), data);
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['origen', 'list'] });
        queryClient.invalidateQueries({ queryKey: ['origen', 'item', variables.id] });
        Alert.alert(
          'Éxito',
          'Origen actualizada correctamente.'
        );
      },
      onError: (error) => {
        Alert.alert(
          'Error',
          'No se pudo actualizar el color. Por favor, intente nuevamente.'
        );
        console.error('Error updating origen:', error);
      }
    });
  };

  const useDeleteOrigen = () => {
    return useMutation({
      mutationFn: (id: number) => origenApiGeneric.delete(endpoints.inventory.origen.delete(id)),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['origen', 'list'] });
        Alert.alert(
          'Éxito',
        'Origen eliminada correctamente.'
        );
      },
      onError: (error) => {
        Alert.alert(
          'Error',
          'No se pudo eliminar el color. Por favor, intente nuevamente.'
        );
        console.error('Error deleting origen:', error);
      }
    });
  };

  return {
    useGetOrigenList,
    useGetOrigenItem,
    useCreateOrigen,
    useUpdateOrigen,
    useDeleteOrigen
  };
};