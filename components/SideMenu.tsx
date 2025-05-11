import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { queryClient } from "@/utils/libs/queryClient";

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
  const [expandedMainItem, setExpandedMainItem] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Si no es visible, no renderizar nada
  if (!isVisible) return null;

  const menuItems: MenuItem[] = [
    { name: 'Mi Cuenta', icon: 'person-outline', route: '/account' },
    {
      name: 'Entidades',
      icon: 'business-outline',
      submenu: [
        {
          title: 'Inventario',
          icon: 'cube-outline',
          items: [
            { name: 'Artículos', route: '/entities/inventory/articles' },
            { name: 'Categoría', route: '/entities/inventory/categories' },
            { name: 'Grupo', route: '/entities/inventory/groups' },
            { name: 'Sección', route: '/entities/inventory/sections' },
            { name: 'Unidad', route: '/entities/inventory/units' },
            { name: 'Talla', route: '/entities/inventory/sizes' },
            { name: 'Color', route: '/entities/inventory/colors' },
            { name: 'Tipo De Impuesto', route: '/entities/inventory/tax-types' },
            { name: 'Tipo De Artículo', route: '/entities/inventory/article-types' },
            { name: 'Origen', route: '/entities/inventory/origins' },
            { name: 'Almacén', route: '/entities/inventory/warehouses' },
          ]
        },
        {
          title: 'Ventas y Compras',
          icon: 'cart-outline',
          items: [
            { name: 'Figura Comercial', route: '/entities/sales/commercial-figure' },
            { name: 'Acuerdo de Pago', route: '/entities/sales/payment-agreements' },
            { name: 'Ciudad', route: '/entities/sales/cities' },
            { name: 'Región', route: '/entities/sales/regions' },
            { name: 'País', route: '/entities/sales/countries' },
            { name: 'Forma De Entrega', route: '/entities/sales/delivery-methods' },
            { name: 'Tipo Persona', route: '/entities/sales/person-types' },
            { name: 'Tipo Vendedor', route: '/entities/sales/seller-types' },
            { name: 'Vendedor', route: '/entities/sales/sellers' },
            { name: 'Moneda', route: '/entities/sales/currencies' },
            { name: 'Tasa De Cambio', route: '/entities/sales/exchange-rates' },
            { name: 'Lista De Precio', route: '/entities/sales/price-lists' },
            { name: 'Sector', route: '/entities/sales/sectors' },
            { name: 'Rubro', route: '/entities/sales/categories' },
          ]
        },
        {
          title: 'Finanzas',
          icon: 'cash-outline',
          items: [
            { name: 'Bancos', route: '/entities/finance/banks' },
            { name: 'Cuentas Bancarias', route: '/entities/finance/bank-accounts' },
            { name: 'Cajas', route: '/entities/finance/cash-registers' },
            { name: 'Tarjetas', route: '/entities/finance/cards' },
            { name: 'Formas de Pago', route: '/entities/finance/payment-methods' },
          ]
        }
      ]
    },
    { name: 'Informes', icon: 'bar-chart-outline', route: '/reports' },
    { name: 'Configuración', icon: 'settings-outline', route: '/settings' },
    { name: 'Ayuda', icon: 'help-circle-outline', route: '/help' },
  ];

  const navigateTo = (route: string): void => {
    try {
      onClose();
      setTimeout(() => {
        // Usar cast para compatibilidad con Expo Router
        router.push(route as any);
      }, 100);
    } catch (error) {
      console.log('Error de navegación:', error);
    }
  };

  const closeSession = () => {
    console.log("Cerrando sesión")
  }

  const toggleMainItem = (itemName: string): void => {
    // Si ya está expandido, se cierra, sino se abre y se cierra cualquier otro
    if (expandedMainItem === itemName) {
      setExpandedMainItem(null);
      setExpandedSection(null); // También cerrar cualquier sección abierta
    } else {
      setExpandedMainItem(itemName);
      setExpandedSection(null); // Reset de la sección al cambiar de ítem principal
    }
  };

  const toggleSection = (sectionTitle: string): void => {
    // Si ya está expandido, se cierra, sino se abre y se cierra cualquier otro
    if (expandedSection === sectionTitle) {
      setExpandedSection(null);
    } else {
      setExpandedSection(sectionTitle);
    }
  };

  return (
    <>
      {/* Fondo opaco que cubre toda la pantalla */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        className="absolute top-0 left-0 right-0 bottom-0 bg-black/50 z-40"
      />

      {/* Menú lateral */}
      <View
        className="absolute top-0 left-0 bottom-0 w-72 bg-[#F9F8FD] z-50"
      // Eliminadas las sombras
      >
        {/* Cabecera */}
        <View className={`bg-[#1e3a8a] pt-10 pb-6 px-5 relative`}>
          <View className="flex-row items-center">
            <View className="w-12 h-12 rounded-full bg-white/20 items-center justify-center mr-4">
              <Text className="text-white text-lg font-bold">US</Text>
            </View>
            <View>
              <Text className="text-white font-medium text-base">Usuario</Text>
              <Text className="text-white/70 text-xs">usuario@miempresa.com</Text>
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
          {menuItems.map((item) => (
            <View key={item.name} className="mb-1">
              {/* Ítem principal */}
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
                <View className="w-10 h-10 rounded-full bg-gray-200 items-center justify-center mr-4">
                  <Ionicons name={item.icon} size={20} color="#1e3a8a" />
                </View>
                <Text className="text-gray-800 text-base flex-1">{item.name}</Text>
                {item.submenu && (
                  expandedMainItem === item.name ?
                    <Ionicons name="chevron-up" size={18} color="#1e3a8a" /> :
                    <Ionicons name="chevron-down" size={18} color="#1e3a8a" />
                )}
              </TouchableOpacity>
              {/* Submenús con acordeón */}
              {item.submenu && expandedMainItem === item.name && (
                <View className="bg-gray-50">
                  {item.submenu.map((section) => (
                    <View key={section.title} className="border-l-4 border-[#1e3a8a] mx-2 my-1">
                      {/* Título de sección */}
                      <TouchableOpacity
                        className="flex-row items-center py-2 px-3 bg-gray-300 rounded-tr-md rounded-br-md pl-8"
                        onPress={() => toggleSection(section.title)}
                      >
                        <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center mr-2">
                          <Ionicons name={section.icon} size={16} color="#1e3a8a" />
                        </View>
                        <Text className="text-[#1e3a8a] font-light text-sm flex-1">{section.title}</Text>
                        {expandedSection === section.title ?
                          <Ionicons name="chevron-up" size={16} color="#1e3a8a" /> :
                          <Ionicons name="chevron-down" size={16} color="#1e3a8a" />
                        }
                      </TouchableOpacity>
                      {/* Elementos de la sección */}
                      {expandedSection === section.title && (
                        <View className="bg-[#F9F8FD] rounded-br-md ml-2">
                          {section.items.map((subItem) => (
                            <TouchableOpacity
                              key={subItem.name}
                              className="py-3 px-4 flex-row items-center ml-7 border-l border-[#1e3a8a]"
                              onPress={() => navigateTo(subItem.route)}
                            >
                              <View className="w-2 h-2 rounded-full bg-[#1e3a8a] mr-4" />
                              <Text className="text-gray-700 text-sm">{subItem.name}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </ScrollView>
        {/* Pie - Cerrar sesión */}
        <View className="p-5 border-t border-gray-200">
          <TouchableOpacity
            className="flex-row items-center py-2"
            onPress={() => closeSession()}
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
