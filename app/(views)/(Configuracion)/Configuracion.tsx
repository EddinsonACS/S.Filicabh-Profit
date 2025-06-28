import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { usePathname, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useAppContext } from '../../../components/InitStage/AppContext';
import { authStorage } from '../../../data/global/authStorage';
import { getCurrentSectionColor, isRouteActive, SECTION_COLORS } from '../../../utils/colorManager';

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
  disabled?: boolean;
};

export default function Configuracion() {
  const router = useRouter();
  const currentPath = usePathname();
  const { currentEntitySection } = useAppContext();
  const [expandedMainItem, setExpandedMainItem] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const { username } = authStorage();

  const menuItems: MenuItem[] = [
    { name: 'Mi Cuenta', icon: 'person-outline', route: '/', disabled: true },
    { name: 'Entidades', icon: 'business-outline', route: '/Entidades' },
    { name: 'Informes', icon: 'bar-chart-outline', route: '/', disabled: true },
    { name: 'Ayuda', icon: 'help-circle-outline', route: '/', disabled: true },
    { name: 'Cerrar sesión', icon: 'log-out-outline', route: '/Login' },
  ];

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets[0].uri) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const isActive = (route?: string): boolean => {
    if (!route) return false;
    return isRouteActive(currentPath, route);
  };

  const getActiveColor = (): string => {
    if (currentPath.includes('/Entidades') && currentEntitySection) {
      return SECTION_COLORS[currentEntitySection];
    }
    return getCurrentSectionColor(currentPath);
  };

  const navigateTo = async (route: string) => {
    try {
      if (route === '/Login') {
        await AsyncStorage.removeItem("authToken");
      }
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

  const getItemStyles = (item: MenuItem) => {
    const active = isActive(item.route);
    const sectionColor = getActiveColor();

    return {
      icon: item.name === 'Cerrar sesión' ? '#dc2626' : sectionColor,
      bg: item.name === 'Cerrar sesión' ? '#fee2e2' : (active ? `${sectionColor}20` : 'bg-gray-200'),
      text: item.name === 'Cerrar sesión' ? '#dc2626' : (active ? sectionColor : '#1f2937'),
      weight: active ? 'font-bold' : 'font-normal'
    };
  };

  // Función para obtener las iniciales del usuario
  const getUserInitials = () => {
    if (!username) return 'US';
    
    const words = username.split(' ');
    if (words.length > 1) {
      // Si hay más de una palabra, tomar la primera letra de las dos primeras palabras
      return (words[0][0] + words[1][0]).toUpperCase();
    } else {
      // Si es una sola palabra, tomar las dos primeras letras
      return username.slice(0, 2).toUpperCase();
    }
  };

  return (
    <View className="flex-1 bg-[#F9F8FD]">
      {/* Cabecera con gradiente */}
      <LinearGradient
        colors={[getActiveColor(), `${getActiveColor()}CC`, `${getActiveColor()}90`]}
        className="pt-8 pb-12 px-5"
      >
        <View className="items-center">
          <TouchableOpacity
            onPress={pickImage}
            className="relative mb-3"
          >
            <View 
              className="w-28 h-28 rounded-full items-center justify-center"
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 5
              }}
            >
              {profileImage ? (
                <Image
                  source={{ uri: profileImage }}
                  className="w-28 h-28 rounded-full"
                  style={{ borderWidth: 3, borderColor: 'rgba(255, 255, 255, 0.5)' }}
                />
              ) : (
                <Text className="text-white text-2xl font-bold">{getUserInitials()}</Text>
              )}
            </View>
            <View 
              className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-white items-center justify-center"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 3
              }}
            >
              <Ionicons name="camera" size={16} color={getActiveColor()} />
            </View>
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">{username || 'Usuario'}</Text>
        </View>
      </LinearGradient>

      {/* Lista de opciones con efecto elevado */}
      <View 
        className="flex-1 -mt-6 rounded-t-3xl bg-white px-4"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 5
        }}
      >
        <ScrollView className="flex-1 pt-4">
          {menuItems.map((item) => {
            const styles = getItemStyles(item);
            return (
              <View key={item.name} className="mb-2">
                <TouchableOpacity
                  className="flex-row items-center py-3 px-4 rounded-xl"
                  style={{ 
                    backgroundColor: styles.bg,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: item.name === 'Cerrar sesión' ? 0 : 2
                  }}
                  onPress={() => {
                    if (!item.disabled && item.route) {
                      navigateTo(item.route);
                    }
                  }}
                >
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center mr-4"
                    style={{ 
                      backgroundColor: item.name === 'Cerrar sesión' ? '#fee2e2' : 'white',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 3,
                      elevation: item.name === 'Cerrar sesión' ? 0 : 1
                    }}
                  >
                    <Ionicons name={item.icon} size={20} color={styles.icon} />
                  </View>
                  <Text
                    className={`text-base flex-1 ${styles.weight}`}
                    style={{ color: styles.text }}
                  >
                    {item.name}
                  </Text>
                  {item.name !== 'Cerrar sesión' && (
                    <Ionicons name="chevron-forward" size={20} color={styles.icon} />
                  )}
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
} 