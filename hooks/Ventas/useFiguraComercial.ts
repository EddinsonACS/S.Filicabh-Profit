import { FiguraComercial } from '@/core/models/Ventas/FiguraComercial';
import ListDataResponse from '@/core/response/ListDataResponse';
import { createApiService } from '@/data/api/apiGeneric';
import { endpoints } from '@/utils/const/endpoints';
import { queryClient } from '@/utils/libs/queryClient';
import { useMutation, useQuery, UseQueryOptions } from '@tanstack/react-query';

const apiFiguraComercial = createApiService<FiguraComercial>();

export const useFiguraComercial = () => {

  const useGetFiguraComercialList = (page: number = 1, size: number = 10) => {
    return useQuery<ListDataResponse<FiguraComercial>, Error>({
      queryKey: ['figuraComercial', 'list', page, size],
      queryFn: () => apiFiguraComercial.getList(endpoints.sales.figuraComercial.list, page, size),
      onSettled: (_: ListDataResponse<FiguraComercial> | undefined, error: Error | null) => {
        if (error) {
          console.error('Error fetching figuraComercial list:', error);
        }
      }
    } as UseQueryOptions<ListDataResponse<FiguraComercial>, Error>);
  };

  const useGetFiguraComercialItem = (id: number) => {
    return useQuery<FiguraComercial, Error>({
      queryKey: ['figuraComercial', 'item', id],
      queryFn: () => apiFiguraComercial.getOne(endpoints.sales.figuraComercial.getOne(id)),
      enabled: !!id,
      onSettled: (_: FiguraComercial | undefined, error: Error | null) => {
        if (error) {
          console.error('Error fetching figuraComercial item:', error);
        }
      }
    } as UseQueryOptions<FiguraComercial, Error>);
  };

  const useCreateFiguraComercial = () => {
    return useMutation({
      mutationFn: (formData: Partial<FiguraComercial>) => {
        if (!formData.nombre) {
          throw new Error('El nombre es requerido');
        }
        if (!formData.rif) {
          throw new Error('El RIF es requerido');
        }
        
        // Ensure all required fields for FiguraComercial are present or have defaults
        const data: Omit<FiguraComercial, 'id'> = {
          // Campos del sistema
          otrosF1: new Date().toISOString(),
          otrosN1: 0,
          otrosN2: 0,
          otrosC1: '',
          otrosC2: '',
          otrosC3: '',
          otrosC4: '',
          otrosT1: '',
          usuario: 1,
          equipo: 'mobile',
          
          // Campos del formulario
          nombre: formData.nombre,
          rif: formData.rif,
          nit: formData.nit || '',
          personaContacto: formData.personaContacto || '',
          telefono: formData.telefono || '',
          email: formData.email || '',
          emailAlterno: formData.emailAlterno || '',
          descripcionFiguraComercial: formData.descripcionFiguraComercial || '',
          idPais: formData.idPais || 0,
          idCiudad: formData.idCiudad || 0,
          idRubro: formData.idRubro || 0,
          idSector: formData.idSector || 0,
          idVendedor: formData.idVendedor || 0,
          idAcuerdoDePago: formData.idAcuerdoDePago || 0,
          idTipoPersona: formData.idTipoPersona || 0,
          activoVentas: formData.activoVentas !== undefined ? formData.activoVentas : true,
          activoCompras: formData.activoCompras !== undefined ? formData.activoCompras : true,
          esSucursal: formData.esSucursal !== undefined ? formData.esSucursal : false,
          idFiguraComercialCasaMatriz: formData.idFiguraComercialCasaMatriz || 0,
          direccionComercial: formData.direccionComercial || '',
          direccionEntrega: formData.direccionEntrega || '',
          idMonedaLimiteCreditoVentas: formData.idMonedaLimiteCreditoVentas || 0,
          montolimiteCreditoVentas: formData.montolimiteCreditoVentas || 0,
          idMonedaLimiteCreditoCompras: formData.idMonedaLimiteCreditoCompras || 0,
          montolimiteCreditoCompras: formData.montolimiteCreditoCompras || 0,
          porceRetencionIvaCompra: formData.porceRetencionIvaCompra || 0,
          aplicaRetVentasAuto: formData.aplicaRetVentasAuto !== undefined ? formData.aplicaRetVentasAuto : false,
          aplicaRetComprasAuto: formData.aplicaRetComprasAuto !== undefined ? formData.aplicaRetComprasAuto : false,
          suspendido: formData.suspendido !== undefined ? formData.suspendido : false
        };
        
        console.log('📊 Datos completos para crear figura comercial:', data);
        return apiFiguraComercial.create(endpoints.sales.figuraComercial.create, data);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['figuraComercial', 'list'] });
      },
      onError: (error) => {
        console.error('Error creating figuraComercial:', error);
      }
    });
  };

  const useUpdateFiguraComercial = () => {
    return useMutation({
      mutationFn: ({ id, formData }: { id: number; formData: Partial<FiguraComercial> }) => {
        if (!formData.nombre) {
          throw new Error('El nombre es requerido');
        }
        if (!formData.rif) {
          throw new Error('El RIF es requerido');
        }
        const data: Partial<FiguraComercial> = {
          id: id,
          ...formData // Spread the rest of the formData
        };
        // Ensure fields that should not be partial are handled or have defaults if necessary
        // For example, if 'usuario' or 'equipo' must always be sent on update:
        // data.usuario = formData.usuario || 1;
        // data.equipo = formData.equipo || 'equipo';
        // data.otrosF1 = formData.otrosF1 || new Date().toISOString();

        return apiFiguraComercial.update(endpoints.sales.figuraComercial.update(id), data);
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['figuraComercial', 'list'] });
        queryClient.invalidateQueries({ queryKey: ['figuraComercial', 'item', variables.id] });
      },
      onError: (error) => {
        console.error('Error updating figuraComercial:', error);
      }
    });
  };

  const useDeleteFiguraComercial = () => {
    return useMutation({
      mutationFn: (id: number) => apiFiguraComercial.delete(endpoints.sales.figuraComercial.delete(id)),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['figuraComercial', 'list'] });
      },
      onError: (error) => {
        console.error('Error deleting figuraComercial:', error);
      }
    });
  };

  return {
    useGetFiguraComercialList,
    useGetFiguraComercialItem,
    useCreateFiguraComercial,
    useUpdateFiguraComercial,
    useDeleteFiguraComercial
  };
};