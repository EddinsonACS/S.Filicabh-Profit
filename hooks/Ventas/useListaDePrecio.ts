import { ListaDePrecio } from '@/core/models/Ventas/ListaDePrecio';
import ListDataResponse from '@/core/response/ListDataResponse';
import { createApiService } from '@/data/api/apiGeneric';
import { authStorage } from '@/data/global/authStorage';
import { endpoints } from '@/utils/const/endpoints';
import { queryClient } from '@/utils/libs/queryClient';
import { useMutation, useQuery, UseQueryOptions } from '@tanstack/react-query';

const apiListaDePrecio = createApiService<ListaDePrecio>();

export const useListaDePrecio = () => {
    const { username } = authStorage();

    const useGetListaDePrecioList = (page: number = 1, size: number = 10) => {
        return useQuery<ListDataResponse<ListaDePrecio>, Error>({
            queryKey: ['listadeprecio', 'list', page, size],
            queryFn: () => apiListaDePrecio.getList(endpoints.sales.listadeprecio.list, page, size),
            onSettled: (_: ListDataResponse<ListaDePrecio> | undefined, error: Error | null) => {
                if (error) {
                    console.error('Error fetching lista de precio list:', error);
                }
            }
        } as UseQueryOptions<ListDataResponse<ListaDePrecio>, Error>);
    };

    const useGetListaDePrecioItem = (id: number) => {
        return useQuery<ListaDePrecio, Error>({
            queryKey: ['listadeprecio', 'item', id],
            queryFn: () => apiListaDePrecio.getOne(endpoints.sales.listadeprecio.getOne(id)),
            enabled: !!id,
            onSettled: (_: ListaDePrecio | undefined, error: Error | null) => {
                if (error) {
                    console.error('Error fetching lista de precio item:', error);
                }
            }
        } as UseQueryOptions<ListaDePrecio, Error>);
    };

    const useCreateListaDePrecio = () => {
        return useMutation({
            mutationFn: (formData: Partial<ListaDePrecio>) => {
                if (!formData.nombre) {
                    throw new Error('El nombre es requerido');
                }
                const data: Omit<ListaDePrecio, 'id' | 'fechaRegistro' | 'usuarioRegistroNombre' | 'fechaModificacion' | 'usuarioModificacionNombre'> = {
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
                return apiListaDePrecio.create(endpoints.sales.listadeprecio.create, data);
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['listadeprecio', 'list'] });
            },
            onError: (error) => {
                console.error('Error creating lista de precio:', error);
            }
        });
    };

    const useUpdateListaDePrecio = () => {
        return useMutation({
            mutationFn: ({ id, formData }: { id: number; formData: Partial<ListaDePrecio> }) => {
                if (!formData.nombre) {
                    throw new Error('El nombre es requerido');
                }
                const data: Partial<ListaDePrecio> = {
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
                return apiListaDePrecio.update(endpoints.sales.listadeprecio.update(id), data);
            },
            onSuccess: (_, variables) => {
                queryClient.invalidateQueries({ queryKey: ['listadeprecio', 'list'] });
                queryClient.invalidateQueries({ queryKey: ['listadeprecio', 'item', variables.id] });
            },
            onError: (error) => {
                console.error('Error updating lista de precio:', error);
            }
        });
    };

    const useDeleteListaDePrecio = () => {
        return useMutation({
            mutationFn: (id: number) => apiListaDePrecio.delete(endpoints.sales.listadeprecio.delete(id)),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['listadeprecio', 'list'] });
            },
            onError: (error) => {
                console.error('Error deleting lista de precio:', error);
            }
        });
    };

    return {
        useGetListaDePrecioList,
        useGetListaDePrecioItem,
        useCreateListaDePrecio,
        useUpdateListaDePrecio,
        useDeleteListaDePrecio
    };
};