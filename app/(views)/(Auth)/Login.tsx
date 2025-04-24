import LoginForm from "@/components/Auth/LoginForm";
import { View } from "react-native";

export default function Login() {
  return (
    <View className="flex-1 justify-center items-center bg-[#F9F8FD]">
      <LoginForm />
    </View>
  )
}
