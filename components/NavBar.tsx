import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

const AnimatedTouch = Animated.createAnimatedComponent(TouchableOpacity);

type TabItem = {
  name: string;
  iconOutline: keyof typeof Ionicons.glyphMap;
  iconFilled: keyof typeof Ionicons.glyphMap;
  route: string;
};

// Rutas corregidas para expo-router con íconos específicos para cada estado
const tabs: TabItem[] = [
  { name: 'Inicio', iconOutline: 'home-outline', iconFilled: 'home', route: '/Home' },
  { name: 'Ventas', iconOutline: 'cart-outline', iconFilled: 'cart', route: '/Ventas' },
  { name: 'Inventario', iconOutline: 'bag-handle-outline', iconFilled: 'bag-handle', route: '/Inventario' },
  { name: 'Otro', iconOutline: 'folder-outline', iconFilled: 'folder', route: '/Otro' },
];

export default function NavBar() {
  const router = useRouter();
  const currentPath = usePathname() || '';

  // Manejar errores en la navegación
  const navigateTo = (route: string) => {
    try {
      router.push(route as any);
    } catch (error) {
      console.log('Error navigating to:', route, error);
    }
  };

  return (
    <View className="bg-[#F9F8FD] border-t border-gray-300">
      <View className="flex-row pt-2 px-4 mb-2">
        {tabs.map((tab, index) => {
          // Verificar primero si currentPath es null o undefined
          const isActive = currentPath ? currentPath.includes(tab.route) : false;

          return (
            <AnimatedTouch
              key={tab.name}
              onPress={() => navigateTo(tab.route)}
              className="flex-1 py-1 items-center"
              activeOpacity={0.7}
              entering={FadeIn.delay(index * 100).duration(200)}
            >
              <View className="items-center justify-center">
                <Animated.View
                  style={{
                    transform: [{ scale: isActive ? 1.4 : 0.9 }],
                  }}
                >
                  <Ionicons
                    name={isActive ? tab.iconFilled : tab.iconOutline}
                    size={24}
                    color={isActive ? '#0C2576FF' : '#878A90FF'}
                  />
                </Animated.View>
                <Text
                  className={`text-xs mt-1 ${isActive ? 'text-blue-800 font-medium' : 'text-gray-600'}`}
                >
                  {tab.name}
                </Text>
              </View>
            </AnimatedTouch>
          );
        })}
      </View>
    </View>
  );
}