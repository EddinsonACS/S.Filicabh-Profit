import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { TrendingUp, ChevronRight, MoreVertical } from 'lucide-react-native';
import { PeriodType } from '../../app/(views)/(Home)/Home';

interface SalesChartProps {
  period: PeriodType;
}

interface ChartDataSet {
  labels: string[];
  data: number[];
  total: number;
}

type ChartDataRecord = Record<PeriodType, ChartDataSet>;

const SalesChart: React.FC<SalesChartProps> = ({ period }) => {
  const [activeView, setActiveView] = useState<PeriodType>('week');

  // Datos simulados según el período seleccionado
  const chartData: ChartDataRecord = {
    week: {
      labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
      data: [12000, 15000, 9000, 18000, 14000, 11500, 9000],
      total: 88500
    },
    month: {
      labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
      data: [42000, 53000, 49000, 58000],
      total: 202000
    },
    year: {
      labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
      data: [132000, 154000, 129000, 148000, 159000, 163000, 158000, 167000, 172000, 180000, 178000, 193000],
      total: 1933000
    },
    custom: {
      labels: ['Día 1', 'Día 2', 'Día 3', 'Día 4', 'Día 5'],
      data: [18000, 22000, 15000, 19000, 23000],
      total: 97000
    }
  };

  // Usamos el período seleccionado o el view activo
  const viewData = chartData[period] || chartData[activeView];

  // Formato para el total
  const formatTotal = (num: number): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(num);
  };

  const screenWidth = Dimensions.get('window').width - 40;

  const chartConfig = {
    backgroundColor: '#fff',
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
    labelColor: () => '#666',
    propsForDots: { r: '4', strokeWidth: '2', stroke: '#2196F3' },
    propsForBackgroundLines: {
      stroke: '#f0f0f0',
      strokeWidth: 1
    },
    formatYLabel: (value: string) => {
      const num = parseInt(value);
      if (num >= 1000) {
        return `${Math.floor(num / 1000)}k`;
      }
      return value;
    }
  };

  const salesData = {
    labels: viewData.labels,
    datasets: [
      {
        data: viewData.data,
        color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  return (
    <View className="bg-white rounded-2xl p-4 mb-4 shadow-lg">
      <View className="flex-row justify-between items-center mb-4">
        <View className="flex-row items-center">
          <View className="bg-blue-100 p-2 rounded-lg mr-3">
            <TrendingUp size={20} color="#1e3a8a" />
          </View>
          <Text className="text-lg font-semibold">Ventas del período</Text>
        </View>
        <TouchableOpacity>
          <MoreVertical size={20} color="#000000FF" />
        </TouchableOpacity>
      </View>

      <View className="mb-3 flex-row justify-between items-center">
        <View>
          <Text className="text-gray-800 text-sm">Total de ventas</Text>
          <Text className="text-2xl font-bold">{formatTotal(viewData.total)}</Text>
        </View>
        <TouchableOpacity className="flex-row items-center bg-blue-50 px-3 py-2 rounded-lg">
          <Text className="text-[#1e3a8a] font-medium mr-1">Ver detalles</Text>
          <ChevronRight size={16} color="#1e3a8a" />
        </TouchableOpacity>
      </View>

      <LineChart
        data={salesData}
        width={screenWidth}
        height={220}
        chartConfig={chartConfig}
        bezier
        style={{
          borderRadius: 12,
          paddingRight: 0,
          marginVertical: 8
        }}
        fromZero
        withShadow={false}
        withVerticalLabels={true}
        withHorizontalLabels={true}
        withInnerLines={true}
        withOuterLines={false}
      />
    </View>
  );
};

export default SalesChart;