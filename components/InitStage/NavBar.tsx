import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

type NavBarProps = {
  onMenuPress?: () => void;
}

export default function NavBar({ onMenuPress }: NavBarProps) {
  const router = useRouter();
  const currentPath = usePathname();

  // Tabs with section colors
  const tabs = [
    { name: 'Inicio', icon: 'home-outline', route: '/Home', color: '#1e3a8a' },
    { name: 'Ventas', icon: 'cart-outline', route: '/Ventas', color: '#007C2DFF' },
    { name: 'Inventario', icon: 'bag-handle-outline', route: '/Inventario', color: '#7c3aed' },
    { name: 'Entidades', icon: 'menu-outline', route: '/Entidades', color: '#1e3a8a'},
  ];

  // Manejar la navegación de forma segura
  const handleNavigation = (tab: any) => {
    try {
      if (tab.isMenu && onMenuPress) {
        onMenuPress();
      } else if (tab.route) {
        router.push(tab.route);
      }
    } catch (error) {
      console.log('Error de navegación:', error);
    }
  };

  // Verificar si el tab está activo
  const isActive = (tab: any) => {
    if (tab.isMenu) return false;
    return currentPath === tab.route;
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
        return (
          <TouchableOpacity
            key={tab.name}
            style={{ flex: 1, alignItems: 'center', paddingVertical: 4 }}
            onPress={() => handleNavigation(tab)}
          >
            <Ionicons
              name={tab.icon as any}
              size={24}
              color={active ? tab.color : '#666'}
            />
            <Text style={{
              fontSize: 12,
              marginTop: 4,
              color: active ? tab.color : '#666',
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