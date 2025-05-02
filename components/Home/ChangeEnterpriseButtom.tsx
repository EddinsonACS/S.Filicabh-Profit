import { Building2, ChevronRight } from "lucide-react-native";
import { TouchableOpacity, View, Text } from "react-native";

interface ChangeEnterpriseButtomProps {
  handleChangeEnterprise: () => void
}

export default function ChangeEnterpriseButtom({ handleChangeEnterprise }: ChangeEnterpriseButtomProps) {
  return (
    <TouchableOpacity
      onPress={handleChangeEnterprise}
      className="bg-white rounded-xl p-2 shadow-sm flex-row justify-between items-center mb-4 mt-2"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2
      }}
    >
      <View className="flex-row items-center">
        <View className="bg-blue-50 p-2 rounded-lg mr-3">
          <Building2 size={22} color="#1e3a8a" />
        </View>
        <View>
          <Text className="text-sm text-gray-800">Empresa actual</Text>
          <Text className="text-lg font-bold text-black">Empresa Principal</Text>
        </View>
      </View>
      <View className="flex-row items-center">
        <View className="bg-blue-500 rounded-full w-6 h-6 items-center justify-center mr-2">
          <Text className="text-white text-xs font-bold">3</Text>
        </View>
        <ChevronRight size={20} color="#000000" />
      </View>
    </TouchableOpacity>

  )
}
