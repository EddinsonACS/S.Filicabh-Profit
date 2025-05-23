import { FormaDeEntrega } from '@/core/models/Ventas/FormaDeEntrega';
import ListDataResponse from '@/core/response/ListDataResponse';
import { createApiService } from '@/data/api/apiGeneric';
import { authStorage } from '@/data/global/authStorage';
import { endpoints } from '@/utils/const/endpoints';
import { queryClient } from '@/utils/libs/queryClient';
import { useMutation, useQuery, UseQueryOptions } from '@tanstack/react-query';
import { Alert } from 'react-native';

const apiFormaDeEntrega = createApiService<FormaDeEntrega>();

export const useFormaDeEntrega = () => {
    const { username } = authStorage();

    const useGetFormaDeEntregaList = (page: number = 1, size: number = 10) => {
        return useQuery<ListDataResponse<FormaDeEntrega>, Error>({
            queryKey: ['formadeentrega', 'list', page, size],
            queryFn: () => apiFormaDeEntrega.getList(endpoints.sales.formadeentrega.list, page, size),
            onSettled: (_: ListDataResponse<FormaDeEntrega> | undefined, error: Error | null) => {
                if (error) {
                    Alert.alert(
                        'Error',
                        'No se pudo cargar la lista de formas de entrega. Por favor, intente nuevamente.'
                    );
                    console.error('Error fetching forma de entrega list:', error);
                }
            }
        } as UseQueryOptions<ListDataResponse<FormaDeEntrega>, Error>);
    };

    const useGetFormaDeEntregaItem = (id: number) => {
        return useQuery<FormaDeEntrega, Error>({
            queryKey: ['formadeentrega', 'item', id],
            queryFn: () => apiFormaDeEntrega.getOne(endpoints.sales.formadeentrega.getOne(id)),
            enabled: !!id,
            onSettled: (_: FormaDeEntrega | undefined, error: Error | null) => {
                if (error) {
                    Alert.alert(
                        'Error',
                        'No se pudo cargar la forma de entrega. Por favor, intente nuevamente.'
                    );
                    console.error('Error fetching forma de entrega item:', error);
                }
            }
        } as UseQueryOptions<FormaDeEntrega, Error>);
    };

    const useCreateFormaDeEntrega = () => {
        return useMutation({
            mutationFn: (formData: Partial<FormaDeEntrega>) => {
                if (!formData.nombre) {
                    throw new Error('El nombre es requerido');
                }
                const data: Omit<FormaDeEntrega, 'id' | 'fechaRegistro' | 'usuarioRegistroNombre' | 'fechaModificacion' | 'usuarioModificacionNombre'> = {
                    nombre: formData.nombre,
                    aplicaDespachoTransporte: formData.aplicaDespachoTransporte || false,
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
                return apiFormaDeEntrega.create(endpoints.sales.formadeentrega.create, data);
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['formadeentrega', 'list'] });
                Alert.alert('Éxito', 'Forma de entrega creada correctamente.');
            },
            onError: (error) => {
                Alert.alert('Error', 'No se pudo crear la forma de entrega. Por favor, intente nuevamente.');
                console.error('Error creating forma de entrega:', error);
            }
        });
    };

    const useUpdateFormaDeEntrega = () => {
        return useMutation({
            mutationFn: ({ id, formData }: { id: number; formData: Partial<FormaDeEntrega> }) => {
                if (!formData.nombre) {
                    throw new Error('El nombre es requerido');
                }
                const data: Partial<FormaDeEntrega> = {
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
                return apiFormaDeEntrega.update(endpoints.sales.formadeentrega.update(id), data);
            },
            onSuccess: (_, variables) => {
                queryClient.invalidateQueries({ queryKey: ['formadeentrega', 'list'] });
                queryClient.invalidateQueries({ queryKey: ['formadeentrega', 'item', variables.id] });
                Alert.alert('Éxito', 'Forma de entrega actualizada correctamente.');
            },
            onError: (error) => {
                Alert.alert('Error', 'No se pudo actualizar la forma de entrega. Por favor, intente nuevamente.');
                console.error('Error updating forma de entrega:', error);
            }
        });
    };

    const useDeleteFormaDeEntrega = () => {
        return useMutation({
            mutationFn: (id: number) => apiFormaDeEntrega.delete(endpoints.sales.formadeentrega.delete(id)),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['formadeentrega', 'list'] });
                Alert.alert('Éxito', 'Forma de entrega eliminada correctamente.');
            },
            onError: (error) => {
                Alert.alert('Error', 'No se pudo eliminar la forma de entrega. Por favor, intente nuevamente.');
                console.error('Error deleting forma de entrega:', error);
            }
        });
    };

    return {
        useGetFormaDeEntregaList,
        useGetFormaDeEntregaItem,
        useCreateFormaDeEntrega,
        useUpdateFormaDeEntrega,
        useDeleteFormaDeEntrega
    };
};