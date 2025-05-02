import { usePathname } from 'expo-router';
import React, { ReactNode, useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, TouchableOpacity, View } from 'react-native';
import { useAppContext } from './AppContext';
import NavBar from './NavBar';
import { isPublicRoute } from './navigation';
import SideMenu from './SideMenu';
import Header from './Header';

interface AppWrapperProps {
  children: ReactNode;
}

export default function AppWrapper({ children }: AppWrapperProps) {
  const { isSideMenuOpen, toggleSideMenu, closeSideMenu } = useAppContext();
  const pathname = usePathname();
  // Valores para animación
  const translateX = useRef(new Animated.Value(-300)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const menuWidth = 288;
  const { width: screenWidth } = Dimensions.get('window');

  // Verificar si la ruta actual es pública
  const isPublic = isPublicRoute(pathname);

  // Función para manejar notificaciones
  const handleNotifications = () => {
    // Aquí puedes implementar la lógica para mostrar notificaciones
    console.log('Mostrar notificaciones');
  };

  // Controlar la animación cuando cambia el estado del menú
  useEffect(() => {
    if (isSideMenuOpen) {
      // Abrir menú con animación
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: 350,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Cerrar menú con animación
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: -menuWidth,
          duration: 300,
          easing: Easing.out(Easing.back(1)),
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isSideMenuOpen]);

  // Cerrar menú cuando cambia la ruta para prevenir memory leaks
  useEffect(() => {
    if (isSideMenuOpen) {
      closeSideMenu();
    }
  }, [pathname]);

  // Cleanup al desmontar el componente
  useEffect(() => {
    return () => {
      if (isSideMenuOpen) {
        closeSideMenu();
      }
    };
  }, []);

  // No mostrar navegación en rutas públicas
  if (isPublic) {
    return <>{children}</>;
  }

  return (
    <View className="flex-1 bg-[#F9F8FD] relative">
      {/* Overlay con efecto de opacidad */}
      {isSideMenuOpen && (
        <Animated.View
          style={{
            opacity: overlayOpacity,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 40
          }}
        >
          <TouchableOpacity
            style={{ width: '100%', height: '100%' }}
            activeOpacity={1}
            onPress={closeSideMenu}
          />
        </Animated.View>
      )}

      {/* SideMenu animado */}
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: menuWidth,
          transform: [{ translateX }],
          zIndex: 50,
        }}
      >
        <SideMenu isVisible={isSideMenuOpen} onClose={closeSideMenu} />
      </Animated.View>

      {/* AppBar */}
      <View
        className="bg-[#F9F8FD] pt-2 pb-2 px-4"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 2,
          zIndex: 10
        }}
      >
        <Header toggleSideMenu={toggleSideMenu} handleNotifications={handleNotifications} />
      </View>

      {/* Contenido principal */}
      <View className="flex-1">
        {children}
      </View>

      {/* NavBar */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-[#F9F8FD]"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 2,
          zIndex: 10
        }}
      >
        <NavBar onMenuPress={toggleSideMenu} />
      </View>
    </View>
  );
}
