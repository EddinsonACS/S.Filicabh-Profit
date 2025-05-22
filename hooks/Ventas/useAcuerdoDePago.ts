import { useMutation, useQuery, UseQueryOptions } from '@tanstack/react-query';
import { AcuerdoDePago } from '@/core/models/AcuerdoDePago';
import { Alert } from 'react-native';
import { queryClient } from '@/utils/libs/queryClient';
import ListDataResponse from '@/core/response/ListDataResponse';
import { acuerdoDePagoApi } from '@/data/api/Ventas/acuerdoDePagoApi';
import { authStorage } from '@/data/global/authStorage';

export const useAcuerdoDePago = () => {
  const { username } = authStorage();

  const useGetAcuerdoDePagoList = (page: number = 1, size: number = 10) => {
    return useQuery<ListDataResponse<AcuerdoDePago>, Error>({
      queryKey: ['acuerdodepago', 'list', page, size],
      queryFn: () => acuerdoDePagoApi.getList(page, size),
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
      queryFn: () => acuerdoDePagoApi.getOne(id),
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
        if (!formData.nombre) {
          throw new Error('El nombre es requerido');
        }
        const data: Omit<AcuerdoDePago, 'id' | 'fechaRegistro' | 'usuarioRegistroNombre' | 'fechaModificacion' | 'usuarioModificacionNombre'> = {
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
          usuario: username ? parseInt(username) : 0
        };
        return acuerdoDePagoApi.create(data);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['acuerdodepago', 'list'] });
        Alert.alert(
          'Éxito',
          'Item de acuerdo de pago creado correctamente.'
        );
      },
      onError: (error) => {
        Alert.alert(
          'Error',
          'No se pudo crear el item de acuerdo de pago. Por favor, intente nuevamente.'
        );
        console.error('Error creating acuerdo de pago item:', error);
      }
    });
  };

  const useUpdateAcuerdoDePago = () => {
    return useMutation({
      mutationFn: ({ id, formData }: { id: number; formData: Partial<AcuerdoDePago> }) => {
        if (!formData.nombre) {
          throw new Error('El nombre es requerido');
        }
        const data: Partial<AcuerdoDePago> = {
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
          usuario: username ? parseInt(username) : 0
        };
        return acuerdoDePagoApi.update(id, data);
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['acuerdodepago', 'list'] });
        queryClient.invalidateQueries({ queryKey: ['acuerdodepago', 'item', variables.id] });
        Alert.alert(
          'Éxito',
          'Item de acuerdo de pago actualizado correctamente.'
        );
      },
      onError: (error) => {
        Alert.alert(
          'Error',
          'No se pudo actualizar el item de acuerdo de pago. Por favor, intente nuevamente.'
        );
        console.error('Error updating acuerdo de pago item:', error);
      }
    });
  };

const useDeleteAcuerdoDePago = () => {
    return useMutation({
      mutationFn: (id: number) => acuerdoDePagoApi.delete(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['acuerdodepago', 'list'] });
        Alert.alert(
          'Éxito',
          'Item de acuerdo de pago eliminado correctamente.'
        );
      },
      onError: (error) => {
        Alert.alert(
          'Error',
          'No se pudo eliminar el item de acuerdo de pago. Por favor, intente nuevamente.'
        );
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