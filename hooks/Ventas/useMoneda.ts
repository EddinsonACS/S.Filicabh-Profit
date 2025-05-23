import { Moneda } from '@/core/models/Ventas/Moneda';
import ListDataResponse from '@/core/response/ListDataResponse';
import { createApiService } from '@/data/api/apiGeneric';
import { authStorage } from '@/data/global/authStorage';
import { endpoints } from '@/utils/const/endpoints';
import { queryClient } from '@/utils/libs/queryClient';
import { useMutation, useQuery, UseQueryOptions } from '@tanstack/react-query';
import { Alert } from 'react-native';

const apiMoneda = createApiService<Moneda>();

export const useMoneda = () => {
    const { username } = authStorage();

    const useGetMonedaList = (page: number = 1, size: number = 10) => {
        return useQuery<ListDataResponse<Moneda>, Error>({
            queryKey: ['moneda', 'list', page, size],
            queryFn: () => apiMoneda.getList(endpoints.sales.moneda.list, page, size),
            onSettled: (_: ListDataResponse<Moneda> | undefined, error: Error | null) => {
                if (error) {
                    Alert.alert(
                        'Error',
                        'No se pudo cargar la lista de monedas. Por favor, intente nuevamente.'
                    );
                    console.error('Error fetching moneda list:', error);
                }
            }
        } as UseQueryOptions<ListDataResponse<Moneda>, Error>);
    };

    const useGetMonedaItem = (id: number) => {
        return useQuery<Moneda, Error>({
            queryKey: ['moneda', 'item', id],
            queryFn: () => apiMoneda.getOne(endpoints.sales.moneda.getOne(id)),
            enabled: !!id,
            onSettled: (_: Moneda | undefined, error: Error | null) => {
                if (error) {
                    Alert.alert(
                        'Error',
                        'No se pudo cargar la moneda. Por favor, intente nuevamente.'
                    );
                    console.error('Error fetching moneda item:', error);
                }
            }
        } as UseQueryOptions<Moneda, Error>);
    };

    const useCreateMoneda = () => {
        return useMutation({
            mutationFn: (formData: Partial<Moneda>) => {
                if (!formData.nombre) {
                    throw new Error('El nombre es requerido');
                }
                const data: Omit<Moneda, 'id' | 'fechaRegistro' | 'usuarioRegistroNombre' | 'fechaModificacion' | 'usuarioModificacionNombre'> = {
                    codigo: formData.codigo || "",
                    nombre: formData.nombre,
                    esDividir: formData.esDividir || false,
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
                return apiMoneda.create(endpoints.sales.moneda.create, data);
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['moneda', 'list'] });
                Alert.alert('Éxito', 'Moneda creada correctamente.');
            },
            onError: (error) => {
                Alert.alert('Error', 'No se pudo crear la moneda. Por favor, intente nuevamente.');
                console.error('Error creating moneda:', error);
            }
        });
    };

    const useUpdateMoneda = () => {
        return useMutation({
            mutationFn: ({ id, formData }: { id: number; formData: Partial<Moneda> }) => {
                if (!formData.nombre) {
                    throw new Error('El nombre es requerido');
                }
                const data: Partial<Moneda> = {
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
                return apiMoneda.update(endpoints.sales.moneda.update(id), data);
            },
            onSuccess: (_, variables) => {
                queryClient.invalidateQueries({ queryKey: ['moneda', 'list'] });
                queryClient.invalidateQueries({ queryKey: ['moneda', 'item', variables.id] });
                Alert.alert('Éxito', 'Moneda actualizada correctamente.');
            },
            onError: (error) => {
                Alert.alert('Error', 'No se pudo actualizar la moneda. Por favor, intente nuevamente.');
                console.error('Error updating moneda:', error);
            }
        });
    };

    const useDeleteMoneda = () => {
        return useMutation({
            mutationFn: (id: number) => apiMoneda.delete(endpoints.sales.moneda.delete(id)),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['moneda', 'list'] });
                Alert.alert('Éxito', 'Moneda eliminada correctamente.');
            },
            onError: (error) => {
                Alert.alert('Error', 'No se pudo eliminar la moneda. Por favor, intente nuevamente.');
                console.error('Error deleting moneda:', error);
            }
        });
    };

    return {
        useGetMonedaList,
        useGetMonedaItem,
        useCreateMoneda,
        useUpdateMoneda,
        useDeleteMoneda
    };
};