import { View, Text, FlatList, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';


const salesData = {
  labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
  datasets: [
    {
      data: [12000, 15000, 9000, 18000, 14000, 11500, 9000],
      color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
      strokeWidth: 2,
    },
  ],
};

const chartConfig = {
  backgroundColor: '#fff',
  backgroundGradientFrom: '#fff',
  backgroundGradientTo: '#fff',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
  labelColor: () => '#666',
  propsForDots: { r: '4', strokeWidth: '2', stroke: '#2196F3' },
};

export default function SalesChart() {
  const screenWidth = Dimensions.get('window').width - 32;

  return (
    <View className="bg-white rounded-2xl p-4 mb-4 shadow-lg">
      <Text className="text-lg font-semibold mb-2">Ventas del período</Text>
      <LineChart
        data={salesData}
        width={screenWidth}
        height={220}
        chartConfig={chartConfig}
        bezier
        style={{ borderRadius: 12 }}
        fromZero
      />
    </View>
  );
}
