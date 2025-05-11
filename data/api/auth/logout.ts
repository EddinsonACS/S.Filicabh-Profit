import { api } from "../../../utils/libs/api";
import { endpoints } from "../../../utils/const/endpoints";
import LoginResponse from "@/core/response/LoginResponse";

export const logout = async (): Promise<LoginResponse> => {
  const { data } = await api.post(endpoints.logout)
  return data
}
