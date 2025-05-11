import { useMutation } from "@tanstack/react-query";
import { logout } from "@/data/api/auth/logout";

export const useLogout = () => {
  return useMutation({
    mutationFn: logout,
  })
}
