import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
  FadeIn
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type MenuItem = {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
  badge?: number;
};

type SideMenuProps = {
  isVisible: boolean;
  onClose: () => void;
};

// Rutas corregidas para expo-router
const menuItems: MenuItem[] = [
  { name: 'Mi Cuenta', icon: 'person-outline', route: '/(views)/account' },
  { name: 'Configuración', icon: 'settings-outline', route: '/(views)/settings' },
  { name: 'Notificaciones', icon: 'notifications-outline', route: '/(views)/notifications', badge: 3 },
  { name: 'Ayuda', icon: 'help-circle-outline', route: '/(views)/help' },
  { name: 'Informes', icon: 'bar-chart-outline', route: '/(views)/reports' },
];

export default function SideMenu({ isVisible, onClose }: SideMenuProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  // Obtener dimensiones de la pantalla incluyendo áreas como la barra de estado
  const windowDimensions = Dimensions.get('window');
  const screenDimensions = Dimensions.get('screen');
  
  // Calcular altura total para asegurar cobertura completa
  // En algunos dispositivos, especialmente iOS, screen y window pueden ser diferentes
  const fullHeight = Math.max(windowDimensions.height, screenDimensions.height) + 50; // Añadimos un margen extra

  // Valores animados
  const translateX = useSharedValue(-300);
  const overlayOpacity = useSharedValue(0);

  // Controlar animaciones de apertura/cierre
  useEffect(() => {
    if (isVisible) {
      translateX.value = withTiming(0, {
        duration: 250,
        easing: Easing.out(Easing.quad)
      });
      overlayOpacity.value = withTiming(0.5, { duration: 250 });
    } else {
      translateX.value = withTiming(-300, {
        duration: 200,
        easing: Easing.in(Easing.quad)
      });
      overlayOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [isVisible]);

  // Estilos animados
  const menuStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    height: fullHeight,
    top: -insets.top, // Ajuste para compensar el SafeAreaView
    bottom: 0,
    position: 'absolute',
    left: 0,
    width: 300,
    zIndex: 50,
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
    display: overlayOpacity.value === 0 ? 'none' : 'flex',
    position: 'absolute',
    top: -insets.top, // Ajuste para compensar el SafeAreaView
    left: 0,
    right: 0,
    bottom: 0,
    height: fullHeight,
    zIndex: 40,
  }));

  // Navegación
  const navigateTo = (route: string) => {
    onClose();
    router.push(route as any);
  };

  return (
    <>
      {/* Fondo semi-transparente */}
      <Animated.View
        style={overlayStyle}
        className="bg-black"
        pointerEvents={isVisible ? 'auto' : 'none'}
        onTouchStart={onClose}
      />

      {/* Panel lateral */}
      <Animated.View
        style={menuStyle}
        className="bg-gray-100 shadow-xl"
      >
        {/* Cabecera */}
        <View className="bg-blue-800 px-6" style={{ paddingTop: insets.top + 28, paddingBottom: 10 }}>
          <View className="flex-row items-center mb-2">
            <View className="h-14 w-14 rounded-full bg-white/20 items-center justify-center mr-4">
              <Text className="text-white text-lg font-bold">US</Text>
            </View>

            <View>
              <Text className="text-white font-medium">Usuario</Text>
              <Text className="text-blue-100 text-xs">usuario@miempresa.com</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={onClose}
            className="absolute right-4"
            style={{ top: insets.top + 8 }}
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Menú */}
        <ScrollView 
          className="flex-1 pt-2"
          bounces={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 80 }} // Espacio para el botón de cerrar sesión
        >
          {menuItems.map((item, index) => (
            <Animated.View
              key={item.name}
              entering={FadeIn.delay(50 * index).duration(200)}
            >
              <TouchableOpacity
                onPress={() => navigateTo(item.route)}
                className="flex-row items-center py-3.5 px-6"
                activeOpacity={0.7}
              >
                <View className="w-9 h-9 rounded-full bg-white items-center justify-center mr-4">
                  <Ionicons name={item.icon} size={20} color="#1e40af" />
                </View>

                <Text className="text-gray-800 flex-1">{item.name}</Text>

                {item.badge && (
                  <View className="bg-blue-500 rounded-full h-5 min-w-5 px-1 items-center justify-center">
                    <Text className="text-white text-xs font-medium">{item.badge}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>
          ))}
        </ScrollView>

        {/* Pie con botón de cerrar sesión */}
        <View 
          className="px-8 py-4 bg-gray-100 border-t border-gray-200 absolute left-0 right-0 bottom-0" 
          style={{ 
            paddingBottom: insets.bottom > 0 ? insets.bottom + 60 : 70
          }}
        >
          <TouchableOpacity
            onPress={() => navigateTo('/(views)/logout')}
            className="flex-row items-center py-2"
          >
            <Text className="text-red-600 font-medium">Cerrar sesión</Text>
            <View className="w-9 h-9 rounded-full bg-red-100 items-center justify-center ml-2">
              <Ionicons name="log-out-outline" size={20} color="#FE0000FF" />
            </View>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </>
  );
}