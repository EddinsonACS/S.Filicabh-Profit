import { AcuerdoDePago } from '@/core/models/Ventas/AcuerdoDePago';
import ListDataResponse from '@/core/response/ListDataResponse';
import { createApiService } from '@/data/api/apiGeneric';
import { authStorage } from '@/data/global/authStorage';
import { endpoints } from '@/utils/const/endpoints';
import { queryClient } from '@/utils/libs/queryClient';
import { useMutation, useQuery, UseQueryOptions } from '@tanstack/react-query';
import { Alert } from 'react-native';

const apiAcuerdoDePago = createApiService<AcuerdoDePago>();

export const useAcuerdoDePago = () => {
  const { username } = authStorage();

  const useGetAcuerdoDePagoList = (page: number = 1, size: number = 10) => {
    return useQuery<ListDataResponse<AcuerdoDePago>, Error>({
      queryKey: ['acuerdodepago', 'list', page, size],
      queryFn: () => apiAcuerdoDePago.getList(endpoints.sales.acuerdodepago.list, page, size),
      onSettled: (_: ListDataResponse<AcuerdoDePago> | undefined, error: Error | null) => {
        if (error) {
          Alert.alert(
            'Error',
            'No se pudo cargar la lista de acuerdo de pago. Por favor, intente nuevamente.'
          );
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
          Alert.alert(
            'Error',
            'No se pudo cargar el item del acuerdo de pago. Por favor, intente nuevamente.'
          );
          console.error('Error fetching acuerdo de pago item:', error);
        }
      }
    } as UseQueryOptions<AcuerdoDePago, Error>);
  };

  const useCreateAcuerdoDePago = () => {
    return useMutation({
      mutationFn: (formData: Partial<AcuerdoDePago>) => {
        console.log('Raw form data received:', formData);
        console.log('Username from authStorage:', username); // Debug username

        if (!formData.nombre) {
          throw new Error('El nombre es requerido');
        }

        // Manejo mejorado del usuario
        let usuarioId = 1; // Valor por defecto

        if (username) {
          const parsedUser = parseInt(username);
          if (!isNaN(parsedUser)) {
            usuarioId = parsedUser;
          }
        }

        console.log('Final usuario ID:', usuarioId); // Debug

        const data = {
          nombre: formData.nombre,
          dias: formData.dias || 0,
          suspendido: formData.suspendido || false,
          otrosF1: new Date().toISOString(),
          otrosN1: 0,
          otrosN2: 0,
          otrosC1: "",
          otrosC2: "",
          otrosC3: "",
          otrosC4: "",
          otrosT1: "",
          equipo: "equipo",
          usuario: usuarioId
        };

        console.log('Data being sent to API:', data);
        return apiAcuerdoDePago.create(endpoints.sales.acuerdodepago.create, data);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['acuerdodepago', 'list'] });
        Alert.alert('Éxito', 'Item de acuerdo de pago creado correctamente.');
      },
      onError: (error) => {
        console.error('Full error object:', error);
        // Mostrar más detalles del error
        if (error.response?.data) {
          console.error('Error response data:', error.response.data);
        }
        Alert.alert('Error', 'No se pudo crear el item de acuerdo de pago. Por favor, intente nuevamente.');
      }
    });
  };

  const useUpdateAcuerdoDePago = () => {
    return useMutation({
      mutationFn: ({ id, formData }: { id: number; formData: Partial<AcuerdoDePago> }) => {
        if (!formData.nombre) {
          throw new Error('El nombre es requerido');
        }

        let usuarioId = 1;
        if (username) {
          const parsedUser = parseInt(username);
          if (!isNaN(parsedUser)) {
            usuarioId = parsedUser;
          }
        }

        const data = {
          id,
          nombre: formData.nombre,
          dias: formData.dias || 0,
          suspendido: formData.suspendido || false,
          otrosF1: new Date().toISOString(),
          otrosN1: 0,
          otrosN2: 0,
          otrosC1: "",
          otrosC2: "",
          otrosC3: "",
          otrosC4: "",
          otrosT1: "",
          equipo: "equipo",
          usuario: usuarioId
        };

        return apiAcuerdoDePago.update(endpoints.sales.acuerdodepago.update(id), data);
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['acuerdodepago', 'list'] });
        queryClient.invalidateQueries({ queryKey: ['acuerdodepago', 'item', variables.id] });
        Alert.alert('Éxito', 'Item de acuerdo de pago actualizado correctamente.');
      },
      onError: (error) => {
        console.error('Update error:', error);
        if (error.response?.data) {
          console.error('Update error response data:', error.response.data);
        }
        Alert.alert('Error', 'No se pudo actualizar el item de acuerdo de pago. Por favor, intente nuevamente.');
      }
    });
  };

  const useDeleteAcuerdoDePago = () => {
    return useMutation({
      mutationFn: (id: number) => apiAcuerdoDePago.delete(endpoints.sales.acuerdodepago.delete(id)),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['acuerdodepago', 'list'] });
        Alert.alert('Éxito', 'Item de acuerdo de pago eliminado correctamente.');
      },
      onError: (error) => {
        Alert.alert('Error', 'No se pudo eliminar el item de acuerdo de pago. Por favor, intente nuevamente.');
        console.error('Error deleting acuerdo de pago item:', error);
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