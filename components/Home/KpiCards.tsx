import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { DollarSign, Users, ShoppingBag, FileText, TrendingUp, TrendingDown } from 'lucide-react-native';
import { PeriodType } from '../../app/(views)/(Home)/Home';

interface KpiCardsProps {
  period: PeriodType;
}

interface KpiData {
  value: number;
  prevValue: number;
  percentChange: number;
  trend: 'up' | 'down';
}

interface KpiItem {
  id: string;
  title: string;
  value: string;
  icon: React.ComponentType<any>;
  gradient: string[];
  iconColor: string;
  textColor: string;
  percentChange: number;
  trend: 'up' | 'down';
}

const KpiCards: React.FC<KpiCardsProps> = ({ period }) => {
  // Datos simulados - Aquí conectarías con tu API real
  const kpiData: Record<string, KpiData> = {
    sales: {
      value: 145000,
      prevValue: 132000,
      percentChange: 9.84,
      trend: 'up'
    },
    newCustomers: {
      value: 28,
      prevValue: 32,
      percentChange: -12.5,
      trend: 'down'
    },
    orders: {
      value: 54,
      prevValue: 48,
      percentChange: 12.5,
      trend: 'up'
    },
    invoices: {
      value: 42,
      prevValue: 39,
      percentChange: 7.69,
      trend: 'up'
    }
  };

  // Formato para números
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('es-ES').format(num);
  };

  // Lista de KPIs a mostrar
  const kpis: KpiItem[] = [
    {
      id: 'sales',
      title: 'Total de Ventas',
      value: `${formatNumber(kpiData.sales.value)}`,
      icon: DollarSign,
      gradient: ['bg-indigo-200', 'border-l-4 border-indigo-500'],
      iconColor: '#000000FF',
      textColor: 'text-indigo-800',
      percentChange: kpiData.sales.percentChange,
      trend: kpiData.sales.trend
    },
    {
      id: 'newCustomers',
      title: 'Nuevos Clientes',
      value: formatNumber(kpiData.newCustomers.value),
      icon: Users,
      gradient: ['bg-purple-200', 'border-l-4 border-purple-500'],
      iconColor: '#000000FF',
      textColor: 'text-purple-800',
      percentChange: kpiData.newCustomers.percentChange,
      trend: kpiData.newCustomers.trend
    },
    {
      id: 'orders',
      title: 'Pedidos Elaborados',
      value: formatNumber(kpiData.orders.value),
      icon: ShoppingBag,
      gradient: ['bg-orange-200', 'border-l-4 border-orange-500'],
      iconColor: '#000000FF',
      textColor: 'text-orange-800',
      percentChange: kpiData.orders.percentChange,
      trend: kpiData.orders.trend
    },
    {
      id: 'invoices',
      title: 'Facturas Emitidas',
      value: formatNumber(kpiData.invoices.value),
      icon: FileText,
      gradient: ['bg-blue-200', 'border-l-4 border-blue-500'],
      iconColor: '#000000FF',
      textColor: 'text-blue-800',
      percentChange: kpiData.invoices.percentChange,
      trend: kpiData.invoices.trend
    }
  ];

  return (
    <View className="mb-6 flex-row flex-wrap justify-between">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        const TrendIcon = kpi.trend === 'up' ? TrendingUp : TrendingDown;

        return (
          <View
            key={kpi.id}
            className={`${kpi.gradient.join(' ')} p-4 rounded-lg shadow-sm w-[48%] mb-4`}
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2
            }}
          >
            <View className="flex-row justify-between items-center mb-3">
              <View className="rounded-full p-1.5 bg-white">
                <Icon size={18} color={kpi.iconColor} />
              </View>
              <View className={`flex-row items-center rounded-full px-2 py-0.5 ${kpi.trend === 'up' ? 'bg-green-400' : 'bg-red-400'
                }`}>
                <TrendIcon size={10} color={kpi.trend === 'up' ? '#1e3a8a' : '#1e3a8a'} />
                <Text className={`text-xs font-medium ml-0.5 ${kpi.trend === 'up' ? 'text-black' : 'text-black'
                  }`}>
                  {kpi.percentChange > 0 ? '+' : ''}{kpi.percentChange}%
                </Text>
              </View>
            </View>

            <Text className="text-gray-800 text-xs mb-1">{kpi.title}</Text>
            <Text className={`text-xl font-bold ${kpi.textColor}`}>{kpi.value}</Text>
          </View>
        );
      })}
    </View>
  );
};

export default KpiCards;