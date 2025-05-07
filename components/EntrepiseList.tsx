import { enterpriseSchema } from "@/utils/schemas/selectEntrepiseSchema";
import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';
import LoadingScreen from "../components/LoadingScreen";
import { useEnterpriseList } from "../hooks/Enterprise/useEntrepiseList";
import { enterpriseStore } from "@/data/global/entrepiseStore";
import { useRouter } from "expo-router";
import { useSelectEnterprise } from "@/hooks/Enterprise/useSelectEnterprise";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";

export default function EntrepiseList() {
  const router = useRouter()
  const { isLoading, error, data, isError } = useEnterpriseList();
  const { setListEnterprise, setSelectedEnterprise } = enterpriseStore()
  const [isPending, setIsPending] = useState(false)
  const { mutate } = useSelectEnterprise()

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(enterpriseSchema),
    defaultValues: {
      enterpriseId: '',
    },
  });

  const onSubmit = async ({ enterpriseId }: { enterpriseId: string }) => {
    setIsPending(true)
    if (data) {
      setListEnterprise(data.data)
    }
    const enterprise = data?.data.find((e) => enterpriseId == e.codigo)
    mutate(enterpriseId, {
      onSuccess: async (response) => {
        await AsyncStorage.setItem("authToken", response.token)
        if (enterprise) {
          setSelectedEnterprise(enterprise)
        }
        router.replace('/Home')
      },
      onError: (err) => {
        console.log(err)
      }
    })
  }


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
            {isPending ? (
              <View className="items-center justify-center">
                <ActivityIndicator color="white" size="small" />
              </View>
            ) : (
              <Text className="text-white text-center font-semibold">
                Continuar
              </Text>
            )}
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
