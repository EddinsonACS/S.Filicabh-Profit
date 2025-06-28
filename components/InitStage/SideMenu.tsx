import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePathname, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { getCurrentSectionColor, isRouteActive, SECTION_COLORS } from '../../utils/colorManager';
import { useAppContext } from './AppContext';

type SideMenuProps = {
  isVisible: boolean;
  onClose: () => void;
};

type SubMenuItem = {
  name: string;
  route: string;
};

type SectionType = {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  items: SubMenuItem[];
};

type MenuItem = {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  route?: string;
  submenu?: SectionType[];
};

export default function SideMenu({ isVisible, onClose }: SideMenuProps) {
  const router = useRouter();
  const currentPath = usePathname();
  const { currentEntitySection } = useAppContext();
  const [expandedMainItem, setExpandedMainItem] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Si no es visible, no renderizar nada
  if (!isVisible) return null;

  const menuItems: MenuItem[] = [
    { name: 'Mi Cuenta', icon: 'person-outline', route: '/' },
    { name: 'Entidades', icon: 'business-outline', route: '/Entidades' },
    { name: 'Informes', icon: 'bar-chart-outline', route: '/' },
    { name: 'Configuración', icon: 'settings-outline', route: '/' },
    { name: 'Ayuda', icon: 'help-circle-outline', route: '/' },
  ];

  // Check if a menu item is active
  const isActive = (route?: string): boolean => {
    if (!route) return false;
    return isRouteActive(currentPath, route);
  };

  // Obtener el color activo usando el sistema centralizado
  const getActiveColor = (): string => {
    // Si estamos en entidades y hay una sección específica seleccionada, usar esa
    if (currentPath.includes('/Entidades') && currentEntitySection) {
      return SECTION_COLORS[currentEntitySection];
    }
    // Sino, usar el sistema de detección automática
    return getCurrentSectionColor(currentPath);
  };

  const navigateTo = async (route: string) => {
    try {
      onClose();
      await AsyncStorage.removeItem("authToken")
      router.push(route as any);
    } catch (error) {
      console.log('Error de navegación:', error);
    }
  };

  const toggleMainItem = (itemName: string): void => {
    if (expandedMainItem === itemName) {
      setExpandedMainItem(null);
      setExpandedSection(null);
    } else {
      setExpandedMainItem(itemName);
      setExpandedSection(null)
    }
  };

  const toggleSection = (sectionTitle: string): void => {
    if (expandedSection === sectionTitle) {
      setExpandedSection(null);
    } else {
      setExpandedSection(sectionTitle);
    }
  };

  // Get active status color styles
  const getItemStyles = (item: MenuItem) => {
    const active = isActive(item.route);
    const sectionColor = getActiveColor();
    return {
      icon: sectionColor,
      bg: active ? `${sectionColor}20` : 'bg-gray-200',
      text: active ? sectionColor : '#1f2937',
      weight: active ? 'font-bold' : 'font-normal'
    };
  };

  return (
    <>
      {/* Fondo opaco */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        className="absolute top-0 left-0 right-0 bottom-0 bg-black/50 z-40"
      />

      {/* Menú lateral */}
      <View
        className="absolute top-0 left-0 bottom-0 w-72 bg-[#F9F8FD] z-50"
      >
        {/* Cabecera */}
        <View
          className="pt-10 pb-6 px-5 relative"
          style={{ backgroundColor: getActiveColor() }}
        >
          <View className="flex-row items-center">
            <View className="w-12 h-12 rounded-full bg-white/20 items-center justify-center mr-4">
              <Text className="text-white text-lg font-bold">US</Text>
            </View>
            <View>
              <Text className="text-white font-semibold text-lg">Usuario</Text>
            </View>
          </View>
          <TouchableOpacity
            className="absolute top-5 right-5"
            style={{ top: Platform.OS === 'ios' ? 16 : 20 }}
            onPress={onClose}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Lista de opciones */}
        <ScrollView className="flex-1 bg-[#F9F8FD] pt-2">
          {menuItems.map((item) => {
            const styles = getItemStyles(item);
            return (
              <View key={item.name} className="mb-1">
                <TouchableOpacity
                  className="flex-row items-center py-3 px-5 bg-[#F9F8FD]"
                  onPress={() => {
                    if (item.submenu) {
                      toggleMainItem(item.name);
                    } else if (item.route) {
                      navigateTo(item.route);
                    }
                  }}
                >
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center mr-4"
                    style={{ backgroundColor: styles.bg }}
                  >
                    <Ionicons name={item.icon} size={20} color={styles.icon} />
                  </View>
                  <Text
                    className={`text-gray-800 text-base flex-1 ${styles.weight}`}
                    style={{ color: styles.text }}
                  >
                    {item.name}
                  </Text>
                  {item.submenu && (
                    expandedMainItem === item.name ?
                      <Ionicons name="chevron-up" size={18} color={styles.icon} /> :
                      <Ionicons name="chevron-down" size={18} color={styles.icon} />
                  )}
                </TouchableOpacity>
                {item.submenu && expandedMainItem === item.name && (
                  <View className="bg-red-600">
                    {item.submenu.map((section) => (
                      <View key={section.title} className="border-l-4 mx-2 my-1" style={{ borderColor: getActiveColor() }}>

                        {/* Elementos de la sección */}
                        {expandedSection === section.title && (
                          <View className="bg-[#F9F8FD] rounded-br-md ml-2">
                            {section.items.map((subItem) => {
                              const isSubItemActive = isActive(subItem.route);
                              return (
                                <TouchableOpacity
                                  key={subItem.name}
                                  className="py-3 px-4 flex-row items-center ml-7 border-l"
                                  style={{ borderColor: getActiveColor() }}
                                  onPress={() => navigateTo(subItem.route)}
                                >
                                  <View
                                    className="w-2 h-2 rounded-full mr-4"
                                    style={{ backgroundColor: isSubItemActive ? getActiveColor() : '#d1d5db' }}
                                  />
                                  <Text
                                    className={`text-sm ${isSubItemActive ? 'font-bold' : 'font-normal'}`}
                                    style={{ color: isSubItemActive ? getActiveColor() : '#4b5563' }}
                                  >
                                    {subItem.name}
                                  </Text>
                                </TouchableOpacity>
                              );
                            })}
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>

        {/* Cerrar sesión */}
        <View className="p-5 border-t border-gray-600">
          <TouchableOpacity
            className="flex-row items-center py-2"
            onPress={() => navigateTo('/Login')}
          >
            <Text className="text-red-600 font-medium text-base mr-2">Cerrar sesión</Text>
            <View className="w-9 h-9 rounded-full bg-red-100 items-center justify-center">
              <Ionicons name="log-out-outline" size={20} color="#dc2626" />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}
