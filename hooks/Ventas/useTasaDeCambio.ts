import { TasaDeCambio } from '@/core/models/Ventas/TasaDeCambio';
import ListDataResponse from '@/core/response/ListDataResponse';
import { createApiService } from '@/data/api/apiGeneric';
import { authStorage } from '@/data/global/authStorage';
import { endpoints } from '@/utils/const/endpoints';
import { queryClient } from '@/utils/libs/queryClient';
import { useMutation, useQuery, UseQueryOptions } from '@tanstack/react-query';

const apiTasaDeCambio = createApiService<TasaDeCambio>();

export const useTasaDeCambio = () => {
    const { username } = authStorage();

    const useGetTasaDeCambioList = (page: number = 1, size: number = 10) => {
        return useQuery<ListDataResponse<TasaDeCambio>, Error>({
            queryKey: ['tasadecambio', 'list', page, size],
            queryFn: () => apiTasaDeCambio.getList(endpoints.sales.tasadecambio.list, page, size),
            onSettled: (_: ListDataResponse<TasaDeCambio> | undefined, error: Error | null) => {
                if (error) {
                    console.error('Error fetching tasa de cambio list:', error);
                }
            }
        } as UseQueryOptions<ListDataResponse<TasaDeCambio>, Error>);
    };

    const useGetTasaDeCambioItem = (id: number) => {
        return useQuery<TasaDeCambio, Error>({
            queryKey: ['tasadecambio', 'item', id],
            queryFn: () => apiTasaDeCambio.getOne(endpoints.sales.tasadecambio.getOne(id)),
            enabled: !!id,
            onSettled: (_: TasaDeCambio | undefined, error: Error | null) => {
                if (error) {
                    console.error('Error fetching tasa de cambio item:', error);
                }
            }
        } as UseQueryOptions<TasaDeCambio, Error>);
    };

    const useCreateTasaDeCambio = () => {
        return useMutation({
            mutationFn: (formData: Partial<TasaDeCambio>) => {
                if (!formData.codigoMoneda) {
                    throw new Error('La moneda es requerida');
                }
                const data: Omit<TasaDeCambio, 'id' | 'fechaRegistro' | 'usuarioRegistroNombre' | 'fechaModificacion' | 'usuarioModificacionNombre'> = {
                    codigoMoneda: formData.codigoMoneda,
                    fecha: formData.fecha || new Date().toISOString(),
                    tasaVenta: formData.tasaVenta || 0,
                    tasaCompra: formData.tasaCompra || 0,
                    otrosF1: new Date().toISOString(),
                    otrosN1: 0,
                    otrosN2: 0,
                    otrosC1: "",
                    otrosC2: "",
                    otrosC3: "",
                    otrosC4: "",
                    otrosT1: "",
                    equipo: "equipo",
                    usuario: username ? (parseInt(username) || 1) : 1
                };
                return apiTasaDeCambio.create(endpoints.sales.tasadecambio.create, data);
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['tasadecambio', 'list'] });
            },
            onError: (error) => {
                console.error('Error creating tasa de cambio:', error);
            }
        });
    };

    const useUpdateTasaDeCambio = () => {
        return useMutation({
            mutationFn: ({ id, formData }: { id: number; formData: Partial<TasaDeCambio> }) => {
                if (!formData.codigoMoneda) {
                    throw new Error('La moneda es requerida');
                }
                const data: Partial<TasaDeCambio> = {
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
                    usuario: username ? (parseInt(username) || 1) : 1
                };
                return apiTasaDeCambio.update(endpoints.sales.tasadecambio.update(id), data);
            },
            onSuccess: (_, variables) => {
                queryClient.invalidateQueries({ queryKey: ['tasadecambio', 'list'] });
                queryClient.invalidateQueries({ queryKey: ['tasadecambio', 'item', variables.id] });
            },
            onError: (error) => {
                console.error('Error updating tasa de cambio:', error);
            }
        });
    };

    const useDeleteTasaDeCambio = () => {
        return useMutation({
            mutationFn: (id: number) => apiTasaDeCambio.delete(endpoints.sales.tasadecambio.delete(id)),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['tasadecambio', 'list'] });
            },
            onError: (error) => {
                console.error('Error deleting tasa de cambio:', error);
            }
        });
    };

    return {
        useGetTasaDeCambioList,
        useGetTasaDeCambioItem,
        useCreateTasaDeCambio,
        useUpdateTasaDeCambio,
        useDeleteTasaDeCambio
    };
};