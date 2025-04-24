import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePathname } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import NavBar from '../components/NavBar';
import SideMenu from '../components/SideMenu';

type AppLayoutProps = {
  children: React.ReactNode;
};

export default function AppLayout({ children }: AppLayoutProps) {
  const [isSideMenuVisible, setSideMenuVisible] = useState(false);
  const pathname = usePathname();

  const toggleSideMenu = () => {
    setSideMenuVisible(!isSideMenuVisible);
  };

  // Determinar si estamos en una pantalla autenticada/post-selección de empresa
  const isAuthenticatedRoute = () => {
    // Rutas donde NO queremos mostrar NavBar y SideMenu
    const publicRoutes = [
      '/Splash',
      '/Onboarding',
      '/Login',
      '/ForgetPassword',
      '/MethodAuth',
      '/Entrepise',
      '/LoadingScreen'
    ];
    
    // Verificar si la ruta actual es una ruta pública
    return !publicRoutes.some(route => pathname.includes(route));
  };

  // Título de la página actual basado en la ruta
  const getPageTitle = () => {
    if (pathname.includes('sales')) return 'Ventas';
    if (pathname.includes('inventory')) return 'Inventario';
    if (pathname.includes('profile')) return 'Perfil';
    if (pathname.includes('account')) return 'Mi Cuenta';
    if (pathname.includes('settings')) return 'Configuración';
    return 'Inicio';
  };

  // Si es una ruta donde no queremos mostrar la barra y menú
  const showHeaderAndNav = isAuthenticatedRoute();

  return (
    <View className="flex-1">
      {/* Cabecera - solo mostrar si estamos en una ruta autenticada */}
      {showHeaderAndNav && (
        <View className="bg-gray-100 border-b border-gray-100 px-4 py-3">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={toggleSideMenu}
                className="w-10 h-10 rounded-lg bg-white items-center justify-center mr-3"
                activeOpacity={0.7}
              >
                <Ionicons name="menu-outline" size={22} color="#082276FF" />
              </TouchableOpacity>

              <Text className="text-lg font-semibold text-gray-800">
                {getPageTitle()}
              </Text>
            </View>

            <View className="flex-row items-center">
              <TouchableOpacity
                className="w-10 h-10 rounded-lg items-center justify-center relative"
                activeOpacity={0.7}
              >
                <Ionicons name="notifications-outline" size={22} color="#082276FF" />
                <View className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Contenido principal */}
      <Animated.View
        entering={FadeIn.duration(250)}
        className="flex-1"
      >
        {children}
      </Animated.View>

      {/* Barra de navegación - solo mostrar si estamos en una ruta autenticada */}
      {showHeaderAndNav && <NavBar />}

      {/* Menú lateral - solo mostrar si estamos en una ruta autenticada */}
      {showHeaderAndNav && (
        <SideMenu
          isVisible={isSideMenuVisible}
          onClose={() => setSideMenuVisible(false)}
        />
      )}
    </View>
  );
}