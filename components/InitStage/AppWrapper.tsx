import { usePathname } from 'expo-router';
import React, { ReactNode } from 'react';
import { View } from 'react-native';
import { getCurrentSectionColor, SECTION_COLORS } from '../../utils/colorManager';
import { isPublicRoute } from '../navigation';
import { useAppContext } from './AppContext';
import NavBar from './NavBar';

interface AppWrapperProps {
  children: ReactNode;
}

export default function AppWrapper({ children }: AppWrapperProps) {
  const { currentEntitySection } = useAppContext();
  const pathname = usePathname();
  const isPublic = isPublicRoute(pathname);

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

  return (
    <View className="flex-1 bg-[#F9F8FD] relative">
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
        <NavBar />
      </View>
    </View>
  );
}