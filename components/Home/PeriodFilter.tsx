import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Platform, TextInput } from 'react-native';
import { Calendar, ChevronDown, CalendarRange } from 'lucide-react-native';
import { PeriodType } from '../../app/(views)/(Home)/Home';

interface PeriodFilterProps {
  selectedPeriod: PeriodType;
  onSelectPeriod: (period: PeriodType) => void;
}

interface PeriodOption {
  id: PeriodType;
  label: string;
}

const PeriodFilter: React.FC<PeriodFilterProps> = ({ selectedPeriod, onSelectPeriod }) => {
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<string>('01/04/2025');
  const [endDate, setEndDate] = useState<string>('30/04/2025');
  const [tempStartDate, setTempStartDate] = useState<string>(startDate);
  const [tempEndDate, setTempEndDate] = useState<string>(endDate);

  const periods: PeriodOption[] = [
    { id: 'week', label: 'Esta semana' },
    { id: 'month', label: 'Este mes' },
    { id: 'year', label: 'Este año' },
    { id: 'custom', label: 'Rango personalizado' }
  ];

  const handleDateSubmit = () => {
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
    onSelectPeriod('custom');
    setModalVisible(false);
  };

  const getPeriodLabel = () => {
    if (selectedPeriod === 'custom') {
      return `${startDate} - ${endDate}`;
    }
    const period = periods.find(p => p.id === selectedPeriod);
    return period ? period.label : 'Seleccionar período';
  };

  return (
    <View className="mb-5">
      <View className="flex-row items-center mb-3">
        <View className="bg-blue-50 p-1.5 rounded-lg mr-2">
          <Calendar size={18} color="#1e3a8a" />
        </View>
        <Text className="text-base font-semibold text-gray-800">Período de análisis</Text>
      </View>

      <View className="flex-row flex-wrap">
        {/* Botones de periodo predefinido */}
        <View className="flex-row mb-3 justify-between w-full">
          {periods.slice(0, 3).map((period) => (
            <TouchableOpacity
              key={period.id}
              onPress={() => onSelectPeriod(period.id)}
              className={`px-4 py-2.5 rounded-xl ${selectedPeriod === period.id
                ? 'bg-blue-100'
                : 'bg-white border border-[#1e3a8a]'
                }`}
              style={{ width: '32%' }}
            >
              <Text
                className={`text-sm font-medium text-center ${selectedPeriod === period.id ? 'text-[#1e3a8a]' : 'text-gray-700'
                  }`}
              >
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Selector de fechas */}
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          className="flex-row justify-between items-center w-full bg-white border border-gray-200 p-3 rounded-xl"
        >
          <View className="flex-row items-center">
            <CalendarRange size={18} color="#1e3a8a" className="mr-2" />
            <Text className="text-gray-700">
              {selectedPeriod === 'custom' ? `${startDate} - ${endDate}` : 'Seleccionar rango de fechas'}
            </Text>
          </View>
          <ChevronDown size={18} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Modal para seleccionar fechas */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-2xl p-5 w-[90%]">
            <Text className="text-lg font-bold text-center mb-4">Seleccionar rango de fechas</Text>

            <View className="mb-4">
              <Text className="text-sm font-medium mb-2">Fecha de inicio</Text>
              <TextInput
                value={tempStartDate}
                onChangeText={setTempStartDate}
                className="border border-gray-300 rounded-lg p-3"
                placeholder="DD/MM/AAAA"
              />
            </View>

            <View className="mb-6">
              <Text className="text-sm font-medium mb-2">Fecha de fin</Text>
              <TextInput
                value={tempEndDate}
                onChangeText={setTempEndDate}
                className="border border-gray-300 rounded-lg p-3"
                placeholder="DD/MM/AAAA"
              />
            </View>

            <View className="flex-row justify-end space-x-3">
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="px-4 py-2 rounded-lg border border-gray-300"
              >
                <Text className="text-gray-700">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDateSubmit}
                className="px-4 py-2 rounded-lg bg-blue-200"
              >
                <Text className="text-[#1e3a8a] font-medium">Aplicar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default PeriodFilter;