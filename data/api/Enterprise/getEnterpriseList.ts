import { Enterprise } from "@/core/models/Enterpise";
import ListDataResponse from "@/core/response/ListDataResponse";
import { endpoints } from "@/utils/const/endpoints";
import { api } from "@/utils/libs/api";

export const getEnterpriseList = async (): Promise<ListDataResponse<Enterprise>> => {
  const { data } = await api.get(endpoints.enterpriseList)
  return data
}
