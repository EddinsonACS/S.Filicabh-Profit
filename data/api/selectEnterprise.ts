import { Enterprise } from "@/core/models/Enterpise";
import ListEnterpriseResponse from "@/core/response/ListEnterpriseResponse";
import { endpoints } from "@/utils/const/endpoints";
import { api } from "@/utils/libs/api";

export const selectEnterprise = async (codigoEmpresa: Enterprise['codigo']): Promise<ListEnterpriseResponse> => {
  const { data } = await api.post(endpoints["select-enterprise"], { codigoEmpresa })
  return data
}
