import { Ionicons } from '@expo/vector-icons';
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeIn } from 'react-native-reanimated';
import PatronPinCards from "../../../components/Auth/PatronPinCards";

const TOTAL_PAGES = 2;

export default function MethodAuth() {
  const [currentPage, setCurrentPage] = useState<number>(0);

  const handlePageChange = (): void =>
    setCurrentPage((prev) => (prev === TOTAL_PAGES - 1 ? 0 : prev + 1));

  return (
    <Animated.View
      entering={FadeIn.duration(600)}
      className="flex-1 bg-[#F9F8FD] px-4 py-6"
    >
      {/* Main container */}
      <View className="flex-1 justify-center items-center w-full">
        <PatronPinCards currentPage={currentPage} />
      </View>

      {/* Info text */}
      <View className="w-full px-2 items-center mb-4">
        <Text className="text-gray-800 text-base text-center">
          ¿Prefieres otro método de Autenticación?
        </Text>
      </View>

      {/* Toggle button */}
      <TouchableOpacity
        onPress={handlePageChange}
        className="flex-row justify-center items-center space-x-2 mb-6"
      >
        <Ionicons
          name={currentPage === 0 ? "keypad-outline" : "grid-outline"}
          size={20}
          color="#1e3a8a"
        />
        <Text className="text-blue-800 text-base font-bold">
          {currentPage === 0 ? "Utiliza un Pin" : "Utiliza un Patrón"}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}
