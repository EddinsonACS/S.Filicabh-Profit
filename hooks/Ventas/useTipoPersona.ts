import { TipoPersona } from '@/core/models/Ventas/TipoPersona';
import ListDataResponse from '@/core/response/ListDataResponse';
import { createApiService } from '@/data/api/apiGeneric';
import { authStorage } from '@/data/global/authStorage';
import { endpoints } from '@/utils/const/endpoints';
import { queryClient } from '@/utils/libs/queryClient';
import { useMutation, useQuery, UseQueryOptions } from '@tanstack/react-query';
import { Alert } from 'react-native';

const apiTipoPersona = createApiService<TipoPersona>();

export const useTipoPersona = () => {
    const { username } = authStorage();

    const useGetTipoPersonaList = (page: number = 1, size: number = 10) => {
        return useQuery<ListDataResponse<TipoPersona>, Error>({
            queryKey: ['tipopersona', 'list', page, size],
            queryFn: () => apiTipoPersona.getList(endpoints.sales.tipopersona.list, page, size),
            onSettled: (_: ListDataResponse<TipoPersona> | undefined, error: Error | null) => {
                if (error) {
                    Alert.alert(
                        'Error',
                        'No se pudo cargar la lista de tipos de persona. Por favor, intente nuevamente.'
                    );
                    console.error('Error fetching tipo persona list:', error);
                }
            }
        } as UseQueryOptions<ListDataResponse<TipoPersona>, Error>);
    };

    const useGetTipoPersonaItem = (id: number) => {
        return useQuery<TipoPersona, Error>({
            queryKey: ['tipopersona', 'item', id],
            queryFn: () => apiTipoPersona.getOne(endpoints.sales.tipopersona.getOne(id)),
            enabled: !!id,
            onSettled: (_: TipoPersona | undefined, error: Error | null) => {
                if (error) {
                    Alert.alert(
                        'Error',
                        'No se pudo cargar el tipo de persona. Por favor, intente nuevamente.'
                    );
                    console.error('Error fetching tipo persona item:', error);
                }
            }
        } as UseQueryOptions<TipoPersona, Error>);
    };

    const useCreateTipoPersona = () => {
        return useMutation({
            mutationFn: (formData: Partial<TipoPersona>) => {
                if (!formData.nombre) {
                    throw new Error('El nombre es requerido');
                }
                const data: Omit<TipoPersona, 'id' | 'fechaRegistro' | 'usuarioRegistroNombre' | 'fechaModificacion' | 'usuarioModificacionNombre'> = {
                    nombre: formData.nombre,
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
                return apiTipoPersona.create(endpoints.sales.tipopersona.create, data);
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['tipopersona', 'list'] });
                Alert.alert('Éxito', 'Tipo de persona creado correctamente.');
            },
            onError: (error) => {
                Alert.alert('Error', 'No se pudo crear el tipo de persona. Por favor, intente nuevamente.');
                console.error('Error creating tipo persona:', error);
            }
        });
    };

    const useUpdateTipoPersona = () => {
        return useMutation({
            mutationFn: ({ id, formData }: { id: number; formData: Partial<TipoPersona> }) => {
                if (!formData.nombre) {
                    throw new Error('El nombre es requerido');
                }
                const data: Partial<TipoPersona> = {
                    ...formData,
                    id,
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
                return apiTipoPersona.update(endpoints.sales.tipopersona.update(id), data);
            },
            onSuccess: (_, variables) => {
                queryClient.invalidateQueries({ queryKey: ['tipopersona', 'list'] });
                queryClient.invalidateQueries({ queryKey: ['tipopersona', 'item', variables.id] });
                Alert.alert('Éxito', 'Tipo de persona actualizado correctamente.');
            },
            onError: (error) => {
                Alert.alert('Error', 'No se pudo actualizar el tipo de persona. Por favor, intente nuevamente.');
                console.error('Error updating tipo persona:', error);
            }
        });
    };

    const useDeleteTipoPersona = () => {
        return useMutation({
            mutationFn: (id: number) => apiTipoPersona.delete(endpoints.sales.tipopersona.delete(id)),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['tipopersona', 'list'] });
                Alert.alert('Éxito', 'Tipo de persona eliminado correctamente.');
            },
            onError: (error) => {
                Alert.alert('Error', 'No se pudo eliminar el tipo de persona. Por favor, intente nuevamente.');
                console.error('Error deleting tipo persona:', error);
            }
        });
    };

    return {
        useGetTipoPersonaList,
        useGetTipoPersonaItem,
        useCreateTipoPersona,
        useUpdateTipoPersona,
        useDeleteTipoPersona
    };
};