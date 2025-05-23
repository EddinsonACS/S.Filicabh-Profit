import { Enterprise } from "@/core/models/Inventario/Enterpise";
import SelectEnterpriseResponse from "@/core/response/SelectEnterpriseResponse";
import { endpoints } from "@/utils/const/endpoints";
import { api } from "@/utils/libs/api";

export const selectEnterprise = async (codigoEmpresa: Enterprise['codigo']): Promise<SelectEnterpriseResponse> => {
  const { data } = await api.post(endpoints["select-enterprise"], { codigoEmpresa })
  return data
}
