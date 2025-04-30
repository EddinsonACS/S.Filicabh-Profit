import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Building2, ChevronRight } from 'lucide-react-native';
import PeriodFilter from '@/components/Home/PeriodFilter';
import KpiCards from '@/components/Home/KpiCards';
import SalesChart from '@/components/Home/SalesChart';
import TopProductList from '@/components/Home/TopProductList';

// Definir los tipos de períodos aceptados
export type PeriodType = 'week' | 'month' | 'year' | 'custom';

export default function HomeScreen() {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('week');

  const handlePeriodChange = (period: PeriodType): void => {
    setSelectedPeriod(period);
  };

  const handleChangeEnterprise = (): void => {
    // Asegúrate que la ruta 'Enterprise' esté definida en tu router
    router.replace('/(views)/Entrepise' as const);
  };

  return (
    <View className="flex-1 px-4 mb-18 bg-[#F9F8FD]">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 1. Selector de empresa */}
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

        {/* 2. Tarjetas KPI */}
        <KpiCards period={selectedPeriod} />

        {/* 3. Filtro de período */}
        <PeriodFilter
          selectedPeriod={selectedPeriod}
          onSelectPeriod={handlePeriodChange}
        />

        {/* 4. Gráfico de ventas */}
        <SalesChart period={selectedPeriod} />

        {/* 5. Top productos */}
        <TopProductList period={selectedPeriod} />
      </ScrollView>
    </View>
  );
}
