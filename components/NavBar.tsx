import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

type NavBarProps = {
  onMenuPress?: () => void;
}

/**
 * Componente NavBar simplificado y estable
 */
export default function NavBar({ onMenuPress }: NavBarProps) {
  const router = useRouter();

  // Tabs simplificados
  const tabs = [
    { name: 'Inicio', icon: 'home-outline', route: '/Home' },
    { name: 'Ventas', icon: 'cart-outline', route: '/Ventas' },
    { name: 'Inventario', icon: 'bag-handle-outline', route: '/Inventario' },
    { name: 'Menú', icon: 'menu-outline', isMenu: true },
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

  return (
    <View style={{
      flexDirection: 'row',
      borderTopWidth: 1,
      borderTopColor: '#ddd',
      paddingTop: 8,
      paddingBottom: 8,
      backgroundColor: '#F9F8FD'
    }}>
      {tabs.map((tab, index) => (
        <TouchableOpacity
          key={tab.name}
          style={{ flex: 1, alignItems: 'center', paddingVertical: 4 }}
          onPress={() => handleNavigation(tab)}
        >
          <Ionicons
            name={tab.icon as any}
            size={24}
            color={index === 0 ? '#1e3a8a' : '#666'}
          />
          <Text style={{
            fontSize: 12,
            marginTop: 4,
            color: index === 0 ? '#1e3a8a' : '#666',
            fontWeight: index === 0 ? 'bold' : 'normal'
          }}>
            {tab.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}