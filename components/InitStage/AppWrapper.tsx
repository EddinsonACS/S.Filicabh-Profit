import { Ionicons } from "@expo/vector-icons";
import { usePathname } from 'expo-router';
import React, { ReactNode, useEffect, useRef } from 'react';
import { Animated, Easing, TouchableOpacity, View } from 'react-native';
import { getCurrentSectionColor, SECTION_COLORS } from '../../utils/colorManager';
import { isPublicRoute } from '../navigation';
import { useAppContext } from './AppContext';
import NavBar from './NavBar';
import SideMenu from './SideMenu';

interface AppWrapperProps {
  children: ReactNode;
}

export default function AppWrapper({ children }: AppWrapperProps) {
  const { isSideMenuOpen, toggleSideMenu, closeSideMenu, currentEntitySection } = useAppContext();
  const pathname = usePathname();

  // Animation values
  const translateX = useRef(new Animated.Value(-300)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const menuWidth = 288;
  const isPublic = isPublicRoute(pathname);

  // Control animation SideMenu
  useEffect(() => {
    if (isSideMenuOpen) {
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
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: -menuWidth,
          duration: 350,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isSideMenuOpen]);

  useEffect(() => {
    if (isSideMenuOpen) {
      closeSideMenu();
    }
  }, [pathname]);

  useEffect(() => {
    return () => {
      if (isSideMenuOpen) {
        closeSideMenu();
      }
    };
  }, []);

  if (isPublic) {
    return <>{children}</>;
  }

  // Active section color usando el sistema centralizado
  const getActiveColor = () => {
    // Si estamos en entidades y hay una sección específica seleccionada, usar esa
    if (pathname.includes('/Entidades') && currentEntitySection) {
      return SECTION_COLORS[currentEntitySection];
    }
    // Sino, usar el sistema de detección automática
    return getCurrentSectionColor(pathname);
  };
  
  const activeColor = getActiveColor();

  return (
    <View className="flex-1 bg-[#F9F8FD] relative">
      {/* opacity effect */}
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
      {/* Animated SideMenu */}
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
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 2,
          zIndex: 10
        }}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between">

          {/* Menu Button */}
          <TouchableOpacity
            onPress={toggleSideMenu}
            className="w-10 h-10 bg-white rounded-xl items-center justify-center border border-gray-600"
            activeOpacity={0.7}
          >
            <Ionicons name="menu-outline" size={25} color={activeColor} />
          </TouchableOpacity>

          {/* Notifications Button */}
          {/* <TouchableOpacity
            className="w-10 h-10 bg-white rounded-xl items-center justify-center border border-gray-300"
            activeOpacity={0.7}
            style={{ borderColor: activeColor, borderWidth: 1 }}
          >
            <View className="relative">
              <Ionicons name="notifications-outline" size={22} color={activeColor} />
              <View className="absolute -top-1 -right-1 w-2 h-2 bg-red-600 rounded-full" />
            </View>
          </TouchableOpacity> */}
        </View>
      </View>

      {/* Content */}
      <View className="flex-1">
        {children}
      </View>

      {/* NavBar */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-[#F9F8FD]"
        style={{
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