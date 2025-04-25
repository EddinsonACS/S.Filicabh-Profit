import { useRouter } from "expo-router";
import React, { useState, useEffect } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { BounceIn, FadeIn, useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PinInputProps {
  onPinComplete?: (pin: string) => void;
}

type NumberButtonValue = number | string;

const PinInput: React.FC<PinInputProps> = ({ onPinComplete = () => {} }) => {
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isFirstPin, setIsFirstPin] = useState<boolean>(true);
  const [firstPin, setFirstPin] = useState<string>('');
  const [isPinSuccess, setIsPinSuccess] = useState<boolean>(false);
  const [hasStored, setHasStored] = useState<boolean>(false);
  const pinLength = 4;
  const errorShake = useSharedValue(0);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const storedPin = await AsyncStorage.getItem('user_pin');
        if (storedPin) {
          setFirstPin(storedPin);
          setIsFirstPin(false);
          setHasStored(true);
          setMessage('Ingresa tu PIN');
        } else {
          setMessage('Crea tu PIN');
        }
      } catch (e) {
        console.error('Error leyendo PIN de almacenamiento', e);
      }
    })();
  }, []);

  const shakeError = () => {
    setMessage(isFirstPin ? 'Verifica tu PIN' : 'Ingresa tu PIN');
    setError('PIN incorrecto. Intenta de nuevo');
    setPin('');
    errorShake.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
    setIsPinSuccess(false);
  };

  const handleNumberPress = async (number: number): Promise<void> => {
    if (pin.length >= pinLength) return;
    const newPin = pin + number;
    setPin(newPin);

    if (newPin.length === pinLength) {
      if (isFirstPin && !hasStored) {
        setFirstPin(newPin);
        setIsFirstPin(false);
        setMessage('Verifica tu PIN');
        setError('');
        setPin('');

      } else if (!hasStored) {
        if (newPin === firstPin) {
          try {
            await AsyncStorage.setItem('user_pin', newPin);
            setIsPinSuccess(true);
            onPinComplete(newPin);
            setTimeout(() => router.replace("/Entrepise"), 1000);
          } catch (e) {
            console.error('Error guardando PIN', e);
          }
        } else {
          shakeError();
        }

      } else {
        if (newPin === firstPin) {
          setIsPinSuccess(true);
          onPinComplete(newPin);
          setTimeout(() => router.replace("/Entrepise"), 1000);
        } else {
          shakeError();
        }
      }
    }
  };

  const handleDelete = (): void => setPin(pin.slice(0, -1));
  const errorAnimatedStyle = useAnimatedStyle(() => ({ transform: [{ translateX: errorShake.value }] }));

  const renderPinDots = () => (
    Array(pinLength).fill(0).map((_, index) => (
      <View
        key={index}
        className={`w-4 h-4 rounded-full m-1.5 ${pin.length > index ? 'bg-blue-800' : 'bg-gray-300'}`}
      />
    ))
  );

  const numbers: NumberButtonValue[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, 'delete'];

  const renderNumberButton = (number: NumberButtonValue, index: number) => (
    <TouchableOpacity
      key={index}
      className={`w-[55px] h-[55px] justify-center items-center m-2 rounded-2xl ${
        number === '' ? 'bg-transparent' : 'bg-gray-300'
      }`}
      onPress={() => {
        if (number === 'delete') handleDelete();
        else if (number !== '') handleNumberPress(number as number);
      }}
    >
      {number === 'delete' ? (
        <Ionicons name="backspace-outline" size={24} color="#1e3a8a" />
      ) : (
        <Text className="text-2xl text-blue-800">{number}</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View className="items-center p-5 bg-[#F9F8FD]">
      {!isPinSuccess && <Text className="text-lg text-blue-800 mb-6">{message}</Text>}
      <View className="flex-row mb-8">{renderPinDots()}</View>
      <View className="flex-row flex-wrap w-[280px] justify-center">{numbers.map(renderNumberButton)}</View>
      {isPinSuccess && (
        <Animated.Text entering={BounceIn.duration(400)} className="text-base text-blue-800 mt-4 font-medium">
          Verificación Exitosa
        </Animated.Text>
      )}
      {error && !isPinSuccess && (
        <Animated.View style={errorAnimatedStyle} entering={FadeIn.duration(300)}>
          <Text className="text-base text-red-500 mt-3">{error}</Text>
        </Animated.View>
      )}
    </View>
  );
};

export default PinInput;
