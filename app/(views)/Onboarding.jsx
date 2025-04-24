import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { TailwindProvider } from "tailwindcss-react-native";

export default function OnboardingScreen() {
  const [currentPage, setCurrentPage] = useState(0);
  const router = useRouter();
  const TOTAL_PAGES = 3;

  const handleSkip = () => router.replace("/(Home)");
  
  const handleNext = () => {
    if (currentPage === TOTAL_PAGES - 1) {
      router.replace("/(Home)");
    } else {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const getPageContent = () => {
    switch (currentPage) {
      case 0:
        return {
          title: "Bienvenido a la App",
          description: "Descubre todas las funcionalidades que tenemos para ti."
        };
      case 1:
        return {
          title: "Gestiona tu salud",
          description: "Conecta con profesionales de la salud de manera sencilla."
        };
      case 2:
        return {
          title: "¡Estás listo!",
          description: "Comienza a disfrutar de todos nuestros servicios."
        };
      default:
        return { title: "", description: "" };
    }
  };

  const content = getPageContent();

  return (
    <TailwindProvider platform="native">
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 bg-background px-4 py-6 justify-between">
          {/* Contenido simple */}
          <View className="flex-1 justify-center items-center">
            <Text className="text-2xl font-bold text-primary mb-4">{content.title}</Text>
            <Text className="text-center text-gray-600 text-lg mb-8">{content.description}</Text>
            
            {/* Indicadores de página */}
            <View className="flex-row justify-center items-center w-full mt-8">
              {Array.from({ length: TOTAL_PAGES }, (_, index) => (
                <View
                  key={index}
                  className={`w-3 h-3 rounded-full mx-1 ${
                    currentPage === index ? "bg-primary" : "bg-secondary"
                  }`}
                />
              ))}
            </View>
          </View>

          {/* Botones de navegación */}
          <View className="w-full px-2 mb-8">
            <TouchableOpacity
              onPress={handleNext}
              className="w-full py-3 bg-primary rounded-md mb-3"
            >
              <Text className="text-white text-base font-bold text-center">
                {currentPage === TOTAL_PAGES - 1 ? "Comenzar" : "Siguiente"}
              </Text>
            </TouchableOpacity>
            
            {currentPage !== TOTAL_PAGES - 1 && (
              <TouchableOpacity
                onPress={handleSkip}
                className="w-full py-3 bg-transparent border border-primary rounded-md"
              >
                <Text className="text-primary text-base font-bold text-center">
                  Omitir
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </SafeAreaView>
    </TailwindProvider>
  );
}