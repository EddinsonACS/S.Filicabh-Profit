import { enterpriseSchema } from "@/utils/schemas/selectEntrepiseSchema";
import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';
import LoadingScreen from "../components/LoadingScreen";
import { useEnterpriseList } from "../hooks/useEntrepiseList";
import { enterpriseStore } from "@/data/global/entrepiseStore";
import { useRouter } from "expo-router";

export default function EntrepiseList() {
  const router = useRouter()
  const { isLoading, error, data, isError } = useEnterpriseList();
  const { setListEnterprise, setSelectedEnterprise } = enterpriseStore()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(enterpriseSchema),
    defaultValues: {
      enterpriseId: '',
    },
  });

  const onSubmit = () => {
    setIsSubmitting(true)
    console.log("bello")
    setIsSubmitting(false)
    router.replace("/Home")
  }

  useEffect(() => {
    if (!isLoading && data?.data.length && data?.data?.length > 0) {
      setListEnterprise(data.data)
    }

    if (!isLoading && data?.data.length == 1) {
      setSelectedEnterprise(data.data[0])
      router.replace("/Home")
    }

  }, [data, isLoading])

  if (isLoading) {
    return <LoadingScreen message="Cargando empresas disponibles" />;
  }

  if (isError) {
    console.error('Error al cargar empresas:', error);
    return (
      <View className="flex-1 justify-center items-center p-6">
        <View className="bg-red-50 p-5 rounded-xl border border-red-200 items-center">
          <Ionicons name="alert-circle-outline" size={40} color="#ef4444" />
          <Text className="text-red-600 text-center mt-3 text-base">{error.message}</Text>
          <TouchableOpacity
            className="mt-4 bg-blue-800 py-3 px-4 rounded-xl"
            onPress={() => window.location.reload()}
          >
            <Text className="text-white font-medium">Reintentar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (isSubmitting) {
    return <LoadingScreen message="Configurando tu espacio de trabajo" />;
  }

  return (
    <View className="flex-1 w-full bg-[#F9F8FD]">
      {/* Header */}
      <Animated.View
        entering={SlideInUp.duration(500)}
        className="pt-4 pb-4 bg-blue-800"
      >
        <Text className="text-white text-2xl font-bold mb-2 text-center">
          Selecciona tu empresa
        </Text>
        <Text className="text-blue-100 text-base text-center">
          Elige la empresa con la que deseas trabajar
        </Text>
      </Animated.View>

      {/* Main content */}
      <ScrollView className="flex-1 px-4 pt-8">
        {isError && (
          <Animated.View
            entering={FadeIn.duration(300)}
            className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl"
          >
            <Text className="text-red-600 text-center">{error}</Text>
          </Animated.View>
        )}

        <Animated.View
          entering={FadeIn.delay(300).duration(500)}
          className="mb-8"
        >
          <Text className="text-gray-700 font-semibold mb-4">Empresa</Text>
          <Controller
            control={control}
            name="enterpriseId"
            render={({ field: { onChange, value } }) => (
              <View className="rounded-xl overflow-hidden border border-gray-200">
                {data?.data?.map((enterprise) => (
                  <TouchableOpacity
                    key={enterprise.codigo}
                    className={`p-4 border-b border-gray-200 ${value === enterprise.codigo ? 'bg-blue-50' : 'bg-white'
                      }`}
                    onPress={() => {
                      onChange(enterprise.codigo);
                    }}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <Text className="text-lg font-medium text-gray-800">
                          {enterprise.nombre}
                        </Text>
                      </View>
                      {value === enterprise.codigo && (
                        <Ionicons name="checkmark-circle" size={24} color="#1e3a8a" />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          />
          {errors.enterpriseId && (
            <Text className="text-red-500 text-sm mt-2 ml-1">
              {errors.enterpriseId.message}
            </Text>
          )}
        </Animated.View>

        <Animated.View
          entering={FadeIn.delay(600).duration(500)}
          className="mb-10"
        >
          <TouchableOpacity
            className="w-full bg-blue-800 py-4 rounded-xl"
            onPress={handleSubmit(onSubmit)}
          >
            <Text className="text-white text-center font-semibold">
              Continuar
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
