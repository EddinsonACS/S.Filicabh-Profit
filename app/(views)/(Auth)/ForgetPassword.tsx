import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from "expo-router";
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Keyboard, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { BounceIn, Easing, FadeIn, interpolateColor, SlideInRight, useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { ForgotPassword } from '@/utils/types/ForgotPassword';
import { forgotPasswordSchema } from '@/utils/schemas/forgotPasswordSchema';


const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function ForgetPassword() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  // Valores animados
  const logoScale = useSharedValue(0.8);
  const buttonProgress = useSharedValue(0);
  const errorShake = useSharedValue(0);
  const formPosition = useSharedValue(-30);
  const formOpacity = useSharedValue(0);

  // Configuración del formulario
  const { control, handleSubmit, formState: { errors }, watch } = useForm<ForgotPassword>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const email = watch('email');
  const isFormFilled = email.length > 0;

  // Efecto para detectar el teclado
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Animación inicial
  useEffect(() => {
    logoScale.value = withTiming(1, {
      duration: 800,
      easing: Easing.elastic(1.2)
    });

    formPosition.value = withTiming(0, {
      duration: 600,
      easing: Easing.out(Easing.quad)
    });

    formOpacity.value = withTiming(1, {
      duration: 800
    });
  }, []);

  // Estilos animados
  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }]
  }));

  const formAnimatedStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateX: formPosition.value }]
  }));

  const errorAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: errorShake.value }]
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      buttonProgress.value,
      [0, 0.5, 1],
      ['#1e3a8a', '#1e4caf', '#1e3a8a']
    );

    return {
      backgroundColor
    };
  });

  // Función para manejar el envío del formulario
  const onSubmit = async (data: ForgotPassword) => {
    try {
      setError(null);
      setSuccess(null);
      setIsLoading(true);

      // Iniciar animación de carga
      buttonProgress.value = withTiming(0.5, {
        duration: 300,
        easing: Easing.inOut(Easing.ease)
      });

      // Simulación de llamada a la API
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Completar animación de carga
      buttonProgress.value = withTiming(1, {
        duration: 300,
        easing: Easing.inOut(Easing.ease)
      });

      setSuccess(`Hemos enviado un enlace de recuperación a ${data.email}`);

    } catch (err) {
      // Animación de error
      setError('No pudimos procesar tu solicitud. Intenta nuevamente.');
      errorShake.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );

      // Resetear la animación del botón
      buttonProgress.value = withTiming(0, { duration: 300 });
    } finally {
      setIsLoading(false);
    }
  };

  // Volver
  const handleGoBack = () => {
    router.back();
  };

  return (
    <Pressable onPress={Keyboard.dismiss} className="flex-1 w-full bg-[#F9F8FD]">
      {/* Decoraciones de fondo */}
      <View className="absolute -right-20 -bottom-20 w-64 h-64 rounded-full bg-blue-200 opacity-20 z-0" />
      <View className="absolute -left-20 -top-20 w-48 h-48 rounded-full bg-blue-400 opacity-20 z-0" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 w-full z-10"
      >
        <View className="flex-1 justify-center px-6 py-6 bg-transparent">
          {/* Botón Volver */}
          <TouchableOpacity
            onPress={handleGoBack}
            className="absolute top-6 left-6 z-20"
          >
            <Ionicons name="arrow-back" size={28} color="#1e3a8a" />
          </TouchableOpacity>

          {/* Logo */}
          <Animated.View
            style={logoAnimatedStyle}
            className="items-center mb-10"
          >
            <View className="w-20 h-20 bg-blue-800 rounded-3xl items-center justify-center mb-6 shadow-lg">
              <Ionicons name="lock-open-outline" size={36} color="#FFFFFF" />
            </View>
            <Text className="text-3xl font-bold text-blue-800 mb-2 text-center">Recupera tu acceso</Text>
            <Text className="text-gray-600 text-center px-8">
              Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña
            </Text>
          </Animated.View>

          {/* Formulario */}
          <Animated.View style={formAnimatedStyle} className="w-full">
            {/* Mensaje de error */}
            {error && (
              <Animated.View
                style={errorAnimatedStyle}
                entering={FadeIn.duration(300)}
                className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl"
              >
                <Text className="text-red-600 text-center">{error}</Text>
              </Animated.View>
            )}

            {/* Mensaje de éxito */}
            {success && (
              <Animated.View
                entering={FadeIn.duration(300)}
                className="mb-5 p-4 bg-green-50 border border-green-200 rounded-xl"
              >
                <Text className="text-green-600 text-center">{success}</Text>
              </Animated.View>
            )}

            <View className="space-y-5">
              {/* Email*/}
              <Animated.View entering={SlideInRight.delay(200).duration(400)}>
                <Text className="text-sm font-semibold text-gray-700 mb-2">Email</Text>
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, value } }) => (
                    <View className="relative">
                      <Animated.View className="absolute left-4 top-3.5">
                        <Ionicons name="mail-outline" size={20} color="#4B5563" />
                      </Animated.View>
                      <TextInput
                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-xl border border-gray-200 text-gray-800"
                        placeholder="tu@email.com"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={value}
                        onChangeText={onChange}
                        placeholderTextColor="#9CA3AF"
                      />
                    </View>
                  )}
                />
                {errors.email && (
                  <Animated.Text
                    entering={FadeIn}
                    className="text-red-500 text-sm mt-1 ml-1"
                  >
                    {errors.email.message}
                  </Animated.Text>
                )}
              </Animated.View>

              {/* Enviar */}
              <Animated.View
                entering={BounceIn.delay(300).duration(600)}
                className="mt-4"
              >
                <AnimatedTouchable
                  style={buttonAnimatedStyle}
                  className={`w-full py-4 rounded-xl overflow-hidden mt-2 ${isFormFilled ? '' : 'opacity-70'}`}
                  onPress={handleSubmit(onSubmit)}
                  disabled={isLoading || !isFormFilled}
                  activeOpacity={0.9}
                >
                  {isLoading ? (
                    <View className="items-center justify-center">
                      <ActivityIndicator color="white" size="small" />
                    </View>
                  ) : (
                    <Text className="text-white text-center font-semibold">
                      Enviar enlace de recuperación
                    </Text>
                  )}
                </AnimatedTouchable>
              </Animated.View>
            </View>
          </Animated.View>

          {/* Contactanos */}
          <Animated.View
            entering={FadeIn.delay(400).duration(500)}
            className="mt-8 flex-row justify-center"
          >
            <Text className="text-gray-600">¿Tienes algún problema? </Text>
            <TouchableOpacity>
              <Text className="text-blue-600 font-medium">Contáctanos</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </Pressable>
  );
}
