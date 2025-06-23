import { TipoVendedor } from '@/core/models/Ventas/TipoVendedor';
import ListDataResponse from '@/core/response/ListDataResponse';
import { createApiService } from '@/data/api/apiGeneric';
import { authStorage } from '@/data/global/authStorage';
import { endpoints } from '@/utils/const/endpoints';
import { queryClient } from '@/utils/libs/queryClient';
import { useMutation, useQuery, UseQueryOptions } from '@tanstack/react-query';

const apiTipoVendedor = createApiService<TipoVendedor>();

export const useTipoVendedor = () => {
    const { username } = authStorage();

    const useGetTipoVendedorList = (page: number = 1, size: number = 10) => {
        return useQuery<ListDataResponse<TipoVendedor>, Error>({
            queryKey: ['tipovendedor', 'list', page, size],
            queryFn: () => apiTipoVendedor.getList(endpoints.sales.tipovendedor.list, page, size),
            onSettled: (_: ListDataResponse<TipoVendedor> | undefined, error: Error | null) => {
                if (error) {
                    console.error('Error fetching tipo vendedor list:', error);
                }
            }
        } as UseQueryOptions<ListDataResponse<TipoVendedor>, Error>);
    };

    const useGetTipoVendedorItem = (id: number) => {
        return useQuery<TipoVendedor, Error>({
            queryKey: ['tipovendedor', 'item', id],
            queryFn: () => apiTipoVendedor.getOne(endpoints.sales.tipovendedor.getOne(id)),
            enabled: !!id,
            onSettled: (_: TipoVendedor | undefined, error: Error | null) => {
                if (error) {
                    console.error('Error fetching tipo vendedor item:', error);
                }
            }
        } as UseQueryOptions<TipoVendedor, Error>);
    };

    const useCreateTipoVendedor = () => {
        return useMutation({
            mutationFn: (formData: Partial<TipoVendedor>) => {
                if (!formData.nombre) {
                    throw new Error('El nombre es requerido');
                }
                const data: Omit<TipoVendedor, 'id' | 'fechaRegistro' | 'usuarioRegistroNombre' | 'fechaModificacion' | 'usuarioModificacionNombre'> = {
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
                    usuario: username ? (parseInt(username) || 1) : 1
                };
                return apiTipoVendedor.create(endpoints.sales.tipovendedor.create, data);
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['tipovendedor', 'list'] });
            },
            onError: (error) => {
                console.error('Error creating tipo vendedor:', error);
            }
        });
    };

    const useUpdateTipoVendedor = () => {
        return useMutation({
            mutationFn: ({ id, formData }: { id: number; formData: Partial<TipoVendedor> }) => {
                if (!formData.nombre) {
                    throw new Error('El nombre es requerido');
                }
                const data: Partial<TipoVendedor> = {
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
                return apiTipoVendedor.update(endpoints.sales.tipovendedor.update(id), data);
            },
            onSuccess: (_, variables) => {
                queryClient.invalidateQueries({ queryKey: ['tipovendedor', 'list'] });
                queryClient.invalidateQueries({ queryKey: ['tipovendedor', 'item', variables.id] });
            },
            onError: (error) => {
                console.error('Error updating tipo vendedor:', error);
            }
        });
    };

    const useDeleteTipoVendedor = () => {
        return useMutation({
            mutationFn: (id: number) => apiTipoVendedor.delete(endpoints.sales.tipovendedor.delete(id)),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['tipovendedor', 'list'] });
            },
            onError: (error) => {
                console.error('Error deleting tipo vendedor:', error);
            }
        });
    };

    return {
        useGetTipoVendedorList,
        useGetTipoVendedorItem,
        useCreateTipoVendedor,
        useUpdateTipoVendedor,
        useDeleteTipoVendedor
    };
};