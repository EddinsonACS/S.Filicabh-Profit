import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { getCurrentSectionColor, isRouteActive, isTabDisabled, SECTION_COLORS } from '../../utils/colorManager';
import { useAppContext } from './AppContext';

type NavBarProps = {
  onMenuPress?: () => void;
}

export default function NavBar({ onMenuPress }: NavBarProps) {
  const router = useRouter();
  const currentPath = usePathname();
  const { currentEntitySection } = useAppContext();

  // Tabs with section colors
  const tabs = [
    { name: 'Inicio', icon: 'home-outline', route: '/Home', color: '#1e3a8a' },
    { name: 'Ventas', icon: 'cart-outline', route: '/Ventas', color: '#007C2DFF' },
    { name: 'Inventario', icon: 'bag-handle-outline', route: '/Inventario', color: '#7c3aed' },
    { name: 'Configuración', icon: 'settings-outline', route: '/Configuracion', color: '#1e3a8a'},
  ];

  // Obtener el color activo usando el sistema centralizado
  const getActiveColor = (): string => {
    if (currentPath.includes('/Entidades') && currentEntitySection) {
      return SECTION_COLORS[currentEntitySection];
    }
    return getCurrentSectionColor(currentPath);
  };

  // Manejar la navegación de forma segura
  const handleNavigation = (tab: any) => {
    try {
      if (isTabDisabled(tab.name)) {
        return;
      }
      router.push(tab.route);
    } catch (error) {
      console.log('Error de navegación:', error);
    }
  };

  // Verificar si el tab está activo
  const isActive = (tab: any) => {
    return isRouteActive(currentPath, tab.route);
  };

  return (
    <View style={{
      flexDirection: 'row',
      borderTopWidth: 1,
      borderTopColor: '#ddd',
      paddingTop: 8,
      paddingBottom: 8,
    }}>
      {tabs.map((tab) => {
        const active = isActive(tab);
        const disabled = isTabDisabled(tab.name);
        
        return (
          <TouchableOpacity
            key={tab.name}
            style={{ 
              flex: 1, 
              alignItems: 'center', 
              paddingVertical: 4,
              opacity: disabled ? 0.4 : 1
            }}
            onPress={() => handleNavigation(tab)}
            disabled={disabled}
          >
            <Ionicons
              name={tab.icon as any}
              size={24}
              color={active ? getActiveColor() : '#666'}
            />
            <Text style={{
              fontSize: 12,
              marginTop: 4,
              color: active ? getActiveColor() : '#666',
              fontWeight: active ? 'bold' : 'normal'
            }}>
              {tab.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}