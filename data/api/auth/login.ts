import { api } from "../../../utils/libs/api";
import { endpoints } from "../../../utils/const/endpoints";
import LoginResponse from "@/core/response/LoginResponse";
import { LoginFormData } from "@/utils/types/LoginFormData";

export const login = async (body: LoginFormData): Promise<LoginResponse> => {
  const { data } = await api.post(endpoints.login, body)
  return data
}
