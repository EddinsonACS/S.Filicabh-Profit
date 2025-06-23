import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export interface FilterOption {
  id: string;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

export interface DateFilter {
  id: string;
  label: string;
  getValue: () => { startDate?: Date; endDate?: Date };
}

export interface FilterState {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  status: 'all' | 'active' | 'inactive';
  dateFilter: string;
  customDateRange?: {
    startDate: string;
    endDate: string;
  };
}

interface DynamicFilterBarProps {
  filterState: FilterState;
  onFilterChange: (newState: FilterState) => void;
  isVisible: boolean;
  onClose: () => void;
  // Theme colors
  buttonColor: string;
  buttonTextColor: string;
  // Options
  sortOptions?: FilterOption[];
  enableStatusFilter?: boolean;
  enableDateFilter?: boolean;
}

const DynamicFilterBar: React.FC<DynamicFilterBarProps> = ({
  filterState,
  onFilterChange,
  isVisible,
  onClose,
  buttonColor,
  buttonTextColor,
  sortOptions = [
    { id: 'nombre', label: 'Nombre', icon: 'text' },
    { id: 'fechaRegistro', label: 'Fecha de registro', icon: 'calendar' },
    { id: 'fechaModificacion', label: 'Fecha de modificación', icon: 'time' }
  ],
  enableStatusFilter = true,
  enableDateFilter = true
}) => {
  const [customStartDate, setCustomStartDate] = useState(
    filterState.customDateRange?.startDate || ''
  );
  const [customEndDate, setCustomEndDate] = useState(
    filterState.customDateRange?.endDate || ''
  );

  const dateFilters: DateFilter[] = [
    {
      id: 'all',
      label: 'Todas las fechas',
      getValue: () => ({})
    },
    {
      id: 'newest',
      label: 'Más recientes primero',
      getValue: () => ({})
    },
    {
      id: 'oldest',
      label: 'Más antiguos primero',
      getValue: () => ({})
    },
    {
      id: 'custom',
      label: 'Rango personalizado',
      getValue: () => ({})
    }
  ];

  const statusOptions = [
    { id: 'all', label: 'Todos', icon: 'list' as const },
    { id: 'active', label: 'Activos', icon: 'checkmark-circle' as const },
    { id: 'inactive', label: 'Inactivos', icon: 'close-circle' as const }
  ];

  const resetFilters = () => {
    onFilterChange({
      sortBy: 'fechaRegistro',
      sortOrder: 'desc',
      status: 'all',
      dateFilter: 'all'
    });
    setCustomStartDate('');
    setCustomEndDate('');
  };

  const handleDateFilterChange = (filterId: string) => {
    let newState = { ...filterState, dateFilter: filterId };

    // Handle sorting based on date filter selection
    if (filterId === 'newest') {
      newState.sortOrder = 'desc';
    } else if (filterId === 'oldest') {
      newState.sortOrder = 'asc';
    } else if (filterId === 'custom' && customStartDate && customEndDate) {
      newState.customDateRange = {
        startDate: customStartDate,
        endDate: customEndDate
      };
    }

    onFilterChange(newState);
  };

  const handleCustomDateApply = () => {
    if (customStartDate && customEndDate) {
      onFilterChange({
        ...filterState,
        dateFilter: 'custom',
        customDateRange: {
          startDate: customStartDate,
          endDate: customEndDate
        }
      });
    }
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
        <View className="flex-1 bg-white">
          {/* Header */}
          <View 
            className="px-4 py-4 border-b border-gray-200"
            style={{ backgroundColor: buttonColor }}
          >
            <View className="flex-row items-center justify-between">
              <Text style={{ color: buttonTextColor }} className="text-xl font-semibold">
                Filtros y ordenamiento
              </Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color={buttonTextColor} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView className="flex-1 p-4">
            {/* Sort Section */}
            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-800 mb-3">Ordenar por</Text>
              {sortOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  onPress={() => {
                    const newSortOrder = filterState.sortBy === option.id && filterState.sortOrder === 'asc' ? 'desc' : 'asc';
                    onFilterChange({
                      ...filterState,
                      sortBy: option.id,
                      sortOrder: newSortOrder
                    });
                  }}
                  className="flex-row items-center justify-between py-3 border-b border-gray-100"
                >
                  <View className="flex-row items-center">
                    {option.icon && (
                      <Ionicons 
                        name={option.icon} 
                        size={20} 
                        color={filterState.sortBy === option.id ? buttonColor : "#6b7280"} 
                      />
                    )}
                    <Text 
                      className={`ml-3 text-base ${
                        filterState.sortBy === option.id ? 'font-semibold' : 'font-normal'
                      }`}
                      style={{ color: filterState.sortBy === option.id ? buttonColor : "#374151" }}
                    >
                      {option.label}
                    </Text>
                  </View>
                  {filterState.sortBy === option.id && (
                    <View className="flex-row items-center">
                      <Ionicons 
                        name={filterState.sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'} 
                        size={20} 
                        color={buttonColor} 
                      />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Status Filter */}
            {enableStatusFilter && (
              <View className="mb-6">
                <Text className="text-lg font-semibold text-gray-800 mb-3">Estado</Text>
                {statusOptions.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    onPress={() => onFilterChange({
                      ...filterState,
                      status: option.id as 'all' | 'active' | 'inactive'
                    })}
                    className="flex-row items-center justify-between py-3 border-b border-gray-100"
                  >
                    <View className="flex-row items-center">
                      <Ionicons 
                        name={option.icon} 
                        size={20} 
                        color={filterState.status === option.id ? buttonColor : "#6b7280"} 
                      />
                      <Text 
                        className={`ml-3 text-base ${
                          filterState.status === option.id ? 'font-semibold' : 'font-normal'
                        }`}
                        style={{ color: filterState.status === option.id ? buttonColor : "#374151" }}
                      >
                        {option.label}
                      </Text>
                    </View>
                    {filterState.status === option.id && (
                      <Ionicons name="checkmark" size={20} color={buttonColor} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Date Filter */}
            {enableDateFilter && (
              <View className="mb-6">
                <Text className="text-lg font-semibold text-gray-800 mb-3">Filtros de fecha</Text>
                {dateFilters.map((filter) => (
                  <TouchableOpacity
                    key={filter.id}
                    onPress={() => handleDateFilterChange(filter.id)}
                    className="flex-row items-center justify-between py-3 border-b border-gray-100"
                  >
                    <View className="flex-row items-center">
                      <Ionicons 
                        name="calendar" 
                        size={20} 
                        color={filterState.dateFilter === filter.id ? buttonColor : "#6b7280"} 
                      />
                      <Text 
                        className={`ml-3 text-base ${
                          filterState.dateFilter === filter.id ? 'font-semibold' : 'font-normal'
                        }`}
                        style={{ color: filterState.dateFilter === filter.id ? buttonColor : "#374151" }}
                      >
                        {filter.label}
                      </Text>
                    </View>
                    {filterState.dateFilter === filter.id && (
                      <Ionicons name="checkmark" size={20} color={buttonColor} />
                    )}
                  </TouchableOpacity>
                ))}

                {/* Custom Date Range */}
                {filterState.dateFilter === 'custom' && (
                  <View className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <Text className="text-sm font-medium text-gray-700 mb-3">Seleccionar rango de fechas</Text>
                    
                    <View className="mb-3">
                      <Text className="text-sm text-gray-600 mb-1">Fecha desde:</Text>
                      <TextInput
                        className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
                        placeholder="YYYY-MM-DD"
                        value={customStartDate}
                        onChangeText={setCustomStartDate}
                        style={{ height: 40 }}
                      />
                    </View>

                    <View className="mb-3">
                      <Text className="text-sm text-gray-600 mb-1">Fecha hasta:</Text>
                      <TextInput
                        className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
                        placeholder="YYYY-MM-DD"
                        value={customEndDate}
                        onChangeText={setCustomEndDate}
                        style={{ height: 40 }}
                      />
                    </View>

                    <TouchableOpacity
                      onPress={handleCustomDateApply}
                      style={{ backgroundColor: buttonColor }}
                      className="py-2 px-4 rounded-lg"
                      disabled={!customStartDate || !customEndDate}
                    >
                      <Text style={{ color: buttonTextColor }} className="text-center font-medium">
                        Aplicar rango
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          <View className="p-4 border-t border-gray-200 mb-4">
            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={resetFilters}
                className="flex-1 py-3 rounded-lg border border-gray-300"
              >
                <Text className="text-center text-gray-700 font-medium">Limpiar filtros</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onClose}
                style={{ backgroundColor: buttonColor }}
                className="flex-1 py-3 rounded-lg"
              >
                <Text style={{ color: buttonTextColor }} className="text-center font-medium">
                  Aplicar filtros
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
  );
};

export default DynamicFilterBar;