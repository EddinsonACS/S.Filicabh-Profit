import { View, Text } from "react-native";

interface ItemProps {
  id: string
  name: string
  units: number
  revenue: number
}

export default function ItemList({ item }: { item: ItemProps }) {
  return (
    <View className="flex-row items-center my-2">
      <Text className="text-xl font-bold text-blue-600 w-6">{item.id}</Text>
      <View className="flex ml-3 flex-row items-center w-full justify-between">
        <Text className="text-base font-medium">{item.name}</Text>
        <Text className="text-sm text-gray-500">
          {item.units} unid. • ${item.revenue.toLocaleString()}
        </Text>
      </View>
    </View>
  )
}
