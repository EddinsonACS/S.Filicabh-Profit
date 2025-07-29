import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { usePathname, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    Image,
    ScrollView,
    StatusBar,
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

const { width } = Dimensions.get('window');

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
      icon: item.name === 'Cerrar sesión' ? '#ef4444' : sectionColor,
      bg: item.name === 'Cerrar sesión' ? '#fef2f2' : (active ? `${sectionColor}15` : 'transparent'),
      text: item.name === 'Cerrar sesión' ? '#dc2626' : (active ? sectionColor : '#374151'),
      weight: active ? 'font-semibold' : 'font-medium'
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
    <View className="flex-1 bg-gradient-to-b from-gray-50 to-white">
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Header con gradiente mejorado */}
      <LinearGradient
        colors={[getActiveColor(), `${getActiveColor()}E6`, `${getActiveColor()}CC`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="pt-12 pb-16 px-6"
        style={{
          shadowColor: getActiveColor(),
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
          elevation: 8
        }}
      >
        <View className="items-center">
          <TouchableOpacity
            onPress={pickImage}
            className="relative mb-4"
            activeOpacity={0.8}
          >
            <View 
              className="w-32 h-32 rounded-full items-center justify-center"
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.25)',
                borderWidth: 4,
                borderColor: 'rgba(255, 255, 255, 0.3)',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.15,
                shadowRadius: 16,
                elevation: 8
              }}
            >
              {profileImage ? (
                <Image
                  source={{ uri: profileImage }}
                  className="w-32 h-32 rounded-full"
                  style={{ 
                    borderWidth: 4, 
                    borderColor: 'rgba(255, 255, 255, 0.8)',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 4
                  }}
                />
              ) : (
                <Text className="text-white text-3xl font-bold" style={{ textShadowColor: 'rgba(0, 0, 0, 0.1)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 }}>
                  {getUserInitials()}
                </Text>
              )}
            </View>
            <View 
              className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-white items-center justify-center"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 4,
                elevation: 4,
                borderWidth: 2,
                borderColor: 'rgba(255, 255, 255, 0.8)'
              }}
            >
              <Ionicons name="camera" size={18} color={getActiveColor()} />
            </View>
          </TouchableOpacity>
          
          <Text className="text-white text-2xl font-bold mb-1" style={{ textShadowColor: 'rgba(0, 0, 0, 0.1)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 }}>
            {username || 'Usuario'}
          </Text>
          <Text className="text-white text-base opacity-90">
            Configuración de cuenta
          </Text>
        </View>
      </LinearGradient>

      {/* Contenedor principal con diseño mejorado */}
      <View 
        className="flex-1 -mt-8 rounded-t-3xl bg-white px-6"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 16,
          elevation: 8
        }}
      >
        <ScrollView 
          className="flex-1 pt-6"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* Sección de opciones */}
          <View className="mb-6">
            <Text className="text-gray-600 text-sm font-medium mb-4 ml-1">
              OPCIONES DE CONFIGURACIÓN
            </Text>
            
            {menuItems.map((item, index) => {
              const styles = getItemStyles(item);
              const isLast = index === menuItems.length - 1;
              
              return (
                <View key={item.name} className={`mb-3 ${isLast ? 'mb-0' : ''}`}>
                  <TouchableOpacity
                    className="flex-row items-center py-4 px-5 rounded-2xl"
                    style={{ 
                      backgroundColor: styles.bg,
                      shadowColor: item.name === 'Cerrar sesión' ? '#ef4444' : getActiveColor(),
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: item.name === 'Cerrar sesión' ? 0.1 : 0.08,
                      shadowRadius: 4,
                      elevation: 2
                    }}
                    onPress={() => {
                      if (!item.disabled && item.route) {
                        navigateTo(item.route);
                      }
                    }}
                    activeOpacity={0.7}
                    disabled={item.disabled}
                  >
                    <View
                      className="w-12 h-12 rounded-xl items-center justify-center mr-4"
                      style={{ 
                        backgroundColor: item.name === 'Cerrar sesión' ? '#fef2f2' : 'rgba(255, 255, 255, 0.9)',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.05,
                        shadowRadius: 2,
                        elevation: 1
                      }}
                    >
                      <Ionicons name={item.icon} size={22} color={styles.icon} />
                    </View>
                    
                    <View className="flex-1">
                      <Text
                        className={`text-base ${styles.weight}`}
                        style={{ color: styles.text }}
                      >
                        {item.name}
                      </Text>
                      {item.disabled && (
                        <Text className="text-gray-400 text-sm mt-1">
                          Próximamente
                        </Text>
                      )}
                    </View>
                    
                    {item.name !== 'Cerrar sesión' && !item.disabled && (
                      <View className="w-8 h-8 rounded-full items-center justify-center bg-gray-50">
                        <Ionicons name="chevron-forward" size={16} color={styles.icon} />
                      </View>
                    )}
                    
                    {item.disabled && (
                      <View className="w-8 h-8 rounded-full items-center justify-center bg-gray-100">
                        <Ionicons name="lock-closed" size={16} color="#9ca3af" />
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>

          {/* Información adicional */}
          <View className="bg-gray-50 rounded-2xl p-5 mt-4">
            <View className="flex-row items-center mb-3">
              <View className="w-8 h-8 rounded-lg bg-blue-100 items-center justify-center mr-3">
                <Ionicons name="information-circle" size={18} color="#3b82f6" />
              </View>
              <Text className="text-gray-700 font-medium">Información de la aplicación</Text>
            </View>
            
            <View className="space-y-2">
              <View className="flex-row justify-between">
                <Text className="text-gray-500 text-sm">Versión</Text>
                <Text className="text-gray-700 text-sm font-medium">1.0.0</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-500 text-sm">Última actualización</Text>
                <Text className="text-gray-700 text-sm font-medium">Hoy</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
} 