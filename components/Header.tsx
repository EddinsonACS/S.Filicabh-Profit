import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, View } from "react-native";

interface HeaderProps {
  toggleSideMenu: () => void,
  handleNotifications: () => void
}

export default function Header({ toggleSideMenu, handleNotifications }: HeaderProps) {
  return (
    <View className="flex-row items-center justify-between">
      {/* Botón de menú */}
      <TouchableOpacity
        onPress={toggleSideMenu}
        className="w-10 h-10 bg-white rounded-xl items-center justify-center border border-gray-300"
        activeOpacity={0.7}
      >
        <Ionicons name="menu-outline" size={22} color="#1e3a8a" />
      </TouchableOpacity>
      {/* 
      <TouchableOpacity
        onPress={handleNotifications}
        className="w-10 h-10 bg-white rounded-xl items-center justify-center border border-gray-300"
        activeOpacity={0.7}
      >
        <View className="relative">
          <Ionicons name="notifications-outline" size={22} color="#1e3a8a" />
          <View className="absolute -top-1 -right-1 w-2 h-2 bg-red-600 rounded-full" />
        </View>
      </TouchableOpacity>
      */}
    </View>

  )
}
