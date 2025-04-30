import ListEnterpriseResponse from "@/core/response/ListEnterpriseResponse";
import { endpoints } from "@/utils/const/endpoints";
import { api } from "@/utils/libs/api";

export const getEnterpriseList = async (): Promise<ListEnterpriseResponse> => {
  const { data } = await api.get(endpoints.enterpriseList)
  return data
}
