import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useRef, useState } from "react";
import { Animated, Dimensions, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

const { width } = Dimensions.get("window");

// Contenido
const slides = [
  {
    id: 1,
    title: "Gestión empresarial simplificada",
    description: "Accede a múltiples empresas desde una sola plataforma y gestiona todas tus operaciones comerciales.",
    image: require("../../assets/Onboarding/Empresa.png"),
  },
  {
    id: 2,
    title: "Ventas rápidas y eficientes",
    description: "Realiza ventas de manera ágil con un sistema intuitivo diseñado para optimizar tus transacciones diarias.",
    image: require("../../assets/Onboarding/Ventas.png"),
  },
  {
    id: 3,
    title: "Facturación en segundos",
    description: "Genera facturas electrónicas conforme a la legislación vigente con solo unos clics.",
    image: require("../../assets/Onboarding/Facturacion.png"),
  },
  {
    id: 4,
    title: "Control de pagos integrado",
    description: "Gestiona y rastrea los pagos recibidos con un sistema completo de seguimiento financiero.",
    image: require("../../assets/Onboarding/ControlPago.png"),
  },
  {
    id: 5,
    title: "Reportes y análisis detallados",
    description: "Obtén información valiosa sobre tu negocio con reportes personalizados y análisis en tiempo real.",
    image: require("../../assets/Onboarding/Reporte.png"),
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);
  const slidesRef = useRef<ScrollView>(null);

  // Siguiente diapositiva
  const goToNextSlide = async () => {
    if (currentIndex < slides.length - 1) {
      slidesRef.current?.scrollTo({ x: width * (currentIndex + 1), animated: true });
      setCurrentIndex(currentIndex + 1);
      await AsyncStorage.setItem("not_new","active")
    } else {
      await AsyncStorage.setItem("not_new","active")
      router.replace("/Login");
    }
  };

  // Saltar
  const skipOnboarding = async () => {
    await AsyncStorage.setItem("not_new","active")
    router.replace("/Login");
  };

  // Indicador de progreso
  const renderPagination = () => {
    return (
      <View className="flex-row justify-center mt-8">
        {slides.map((_, i) => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];

          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 20, 8],
            extrapolate: 'clamp',
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={i}
              className="h-2 rounded-full mx-1 bg-blue-800"
              style={{ width: dotWidth, opacity }}
            />
          );
        })}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-[#F9F8FD]">
      <StatusBar style="dark" />

      {/* Saltar */}
      <View className="flex-row justify-end pt-6 px-4">
        <TouchableOpacity onPress={skipOnboarding}>
          <Text className="text-blue-800 font-medium text-base">Saltar</Text>
        </TouchableOpacity>
      </View>

      {/* Carrusel */}
      <Animated.ScrollView
        ref={slidesRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        scrollEventThrottle={16}
        className="flex-1"
      >
        {slides.map((slide, index) => (
          <View key={slide.id} style={{ width }} className="px-5 items-center justify-center">
            <View className="w-full aspect-square items-center justify-center">
              <Image
                source={slide.image}
                className="w-64 h-64"
                resizeMode="contain"
              />
            </View>
            <View className="items-center mb-4 mt-6">
              <Text className="text-blue-900 text-2xl font-bold mb-4 text-center">
                {slide.title}
              </Text>
              <Text className="text-gray-600 text-center text-base px-4">
                {slide.description}
              </Text>
            </View>
          </View>
        ))}
      </Animated.ScrollView>

      {/* Paginación y botón de acción */}
      <View className="items-center pb-10 px-6">
        {renderPagination()}

        <View className="w-full mt-8">
          <TouchableOpacity
            onPress={goToNextSlide}
            className="w-full py-4 bg-blue-800 rounded-xl"
          >
            <Text className="text-white text-lg font-semibold text-center">
              {currentIndex === slides.length - 1 ? "Comenzar ahora" : "Siguiente"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
