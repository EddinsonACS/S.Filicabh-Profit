import { Articulo } from "@/core/models/Inventario/Articulo";
import ListDataResponse from "@/core/response/ListDataResponse";
import { createApiService } from "@/data/api/apiGeneric";
import { endpoints } from "@/utils/const/endpoints";
import { queryClient } from "@/utils/libs/queryClient";
import { useMutation, useQuery, UseQueryOptions } from "@tanstack/react-query";

const apiArticulo = createApiService<Articulo>();

export const useArticulo = () => {
  const useGetArticuloList = (page: number = 1, size: number = 10) => {
    return useQuery<ListDataResponse<Articulo>, Error>({
      queryKey: ["articulo", "list", page, size],
      queryFn: () =>
        apiArticulo.getList(endpoints.inventory.articulo.list, page, size),
      onSettled: (
        _: ListDataResponse<Articulo> | undefined,
        error: Error | null,
      ) => {
        if (error) {
          console.error("Error fetching articulo list:", error);
        }
      },
    } as UseQueryOptions<ListDataResponse<Articulo>, Error>);
  };

  const useGetArticuloItem = (id: number) => {
    return useQuery<Articulo, Error>({
      queryKey: ["articulo", "item", id],
      queryFn: () =>
        apiArticulo.getOne(endpoints.inventory.articulo.getOne(id)),
      enabled: !!id,
      onSettled: (_: Articulo | undefined, error: Error | null) => {
        if (error) {
          console.error("Error fetching articulo item:", error);
        }
      },
    } as UseQueryOptions<Articulo, Error>);
  };

  const useCreateArticulo = () => {
    return useMutation({
      mutationFn: (formData: Partial<Articulo>) => {
        // Asegurar que presentaciones sea un array de enteros
        let presentacionesArray: number[] = [];
        if (formData.presentaciones) {
          if (Array.isArray(formData.presentaciones)) {
            presentacionesArray = formData.presentaciones
              .map((p) => Number(p))
              .filter((p) => p > 0);
          } else {
            const num = Number(formData.presentaciones);
            if (num > 0) {
              presentacionesArray = [num];
            }
          }
        }

        const data = {
          ...formData,
          otrosF1: new Date().toISOString(),
          otrosN1: Number(formData.otrosN1) || 0,
          otrosN2: Number(formData.otrosN2) || 0,
          otrosC1: formData.otrosC1 || "",
          otrosC2: formData.otrosC2 || "",
          otrosC3: formData.otrosC3 || "",
          otrosC4: formData.otrosC4 || "",
          otrosT1: formData.otrosT1 || "",
          usuario: 0,
          equipo: "equipo",
        };
        console.log("Data al crear un aritculo:", data);

        return apiArticulo.create(endpoints.inventory.articulo.create, data);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["articulo", "list"] });
      },
      onError: (error: any) => {
        console.error("Error creating articulo:", error);
        console.error("Error response:", error.response?.data);
        console.error("Error status:", error.response?.status);
      },
    });
  };

  const useUpdateArticulo = () => {
    return useMutation({
      mutationFn: ({
        id,
        formData,
      }: {
        id: number;
        formData: Partial<Articulo>;
      }) => {
        console.log('DATA PARA EL UPDATE:', formData, id);

        // Asegurar que los campos numéricos sean números
        const data: Partial<Articulo> = {
          ...formData,
          id,
          otrosF1: new Date().toISOString(),
          otrosN1: Number(formData.otrosN1) || 0,
          otrosN2: Number(formData.otrosN2) || 0,
          otrosC1: formData.otrosC1 || "",
          otrosC2: formData.otrosC2 || "",
          otrosC3: formData.otrosC3 || "",
          otrosC4: formData.otrosC4 || "",
          otrosT1: formData.otrosT1 || "",
          equipo: "equipo",
        };

        console.log("Datos formateados para actualización:", data);
        return apiArticulo.update(
          endpoints.inventory.articulo.update(id),
          data,
        );
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ["articulo", "list"] });
        queryClient.invalidateQueries({
          queryKey: ["articulo", "item", variables.id],
        });
      },
      onError: (error: any) => {
        console.error("Error updating articulo:", error.response);
      },
    });
  };

  const useDeleteArticulo = () => {
    return useMutation({
      mutationFn: (id: number) =>
        apiArticulo.delete(endpoints.inventory.articulo.delete(id)),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["articulo", "list"] });
      },
      onError: (error) => {
        console.error("Error deleting articulo:", error);
      },
    });
  };

  return {
    useGetArticuloList,
    useGetArticuloItem,
    useCreateArticulo,
    useUpdateArticulo,
    useDeleteArticulo,
  };
};
