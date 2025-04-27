import { View, Text, ScrollView } from "react-native";
import ItemList from "./ItemList";

const topProducts = [
  { id: '1', name: 'Producto A', units: 45, revenue: 15000 },
  { id: '2', name: 'Producto B', units: 34, revenue: 12800 },
  { id: '3', name: 'Producto C', units: 28, revenue: 9500 },
  { id: '4', name: 'Producto D', units: 22, revenue: 7600 },
  { id: '5', name: 'Producto E', units: 18, revenue: 5400 },
];

export default function TopProductList() {
  return (
    <View className="bg-white rounded-2xl p-4 mb-4 shadow-lg">
      <Text className="text-lg font-semibold mb-2">Top 5 productos más vendidos</Text>
      <ScrollView>
        {topProducts.map((item) => (
          <ItemList item={item} key={item.id} />
        ))}
      </ScrollView>
    </View>
  );
}
