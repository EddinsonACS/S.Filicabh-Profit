import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import PeriodFilter from '@/components/Home/PeriodFilter';
import KpiCards from '@/components/Home/KpiCards';
import SalesChart from '@/components/Home/SalesChart';
import TopProductList from '@/components/Home/TopProductList';
import { enterpriseStore } from '@/data/global/entrepiseStore';
import ChangeEnterpriseButtom from '@/components/Home/ChangeEnterpriseButtom';

// Definir los tipos de períodos aceptados
export type PeriodType = 'week' | 'month' | 'year' | 'custom';

export default function HomeScreen() {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('week');
  const { listEnterprise } = enterpriseStore()

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
        <View className='my-1'>
          {listEnterprise.length > 1 && <ChangeEnterpriseButtom handleChangeEnterprise={handleChangeEnterprise} />}
        </View>

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
