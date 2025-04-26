import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';

type SideMenuProps = {
  isVisible: boolean;
  onClose: () => void;
};

/**
 * SideMenu simplificado y estable sin animaciones complejas
 */
export default function SideMenu({ isVisible, onClose }: SideMenuProps) {
  const router = useRouter();

  // Si no es visible, no renderizar nada
  if (!isVisible) return null;

  // Menú items simplificados
  const menuItems = [
    { name: 'Mi Cuenta', icon: 'person-outline', route: '/account' },
    { name: 'Configuración', icon: 'settings-outline', route: '/settings' },
    { name: 'Notificaciones', icon: 'notifications-outline', route: '/notifications' },
    { name: 'Ayuda', icon: 'help-circle-outline', route: '/help' },
    { name: 'Informes', icon: 'bar-chart-outline', route: '/reports' },
  ];

  // Navegación segura
  const navigateTo = (route: string) => {
    try {
      onClose();
      setTimeout(() => {
        router.push(route as never);
      }, 100);
    } catch (error) {
      console.log('Error de navegación:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Overlay para cerrar el menú */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      {/* Panel del menú */}
      <View style={styles.menuPanel}>
        {/* Cabecera */}
        <View style={styles.header}>
          <View style={styles.profileContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>US</Text>
            </View>
            <View>
              <Text style={styles.username}>Usuario</Text>
              <Text style={styles.email}>usuario@miempresa.com</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Lista de opciones */}
        <ScrollView style={styles.menuList}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.name}
              style={styles.menuItem}
              onPress={() => navigateTo(item.route)}
            >
              <View style={styles.iconContainer}>
                <Ionicons name={item.icon as any} size={20} color="#1e40af" />
              </View>
              <Text style={styles.menuItemText}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Pie - Cerrar sesión */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => navigateTo('/Login')}
          >
            <Text style={styles.logoutText}>Cerrar sesión</Text>
            <View style={styles.logoutIcon}>
              <Ionicons name="log-out-outline" size={20} color="#dc2626" />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  menuPanel: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 280,
    backgroundColor: '#F9F8FD',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    backgroundColor: '#0B34A5FF',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 15,
    paddingHorizontal: 20,
    position: 'relative',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  username: {
    color: 'white',
    fontWeight: '500',
    fontSize: 16,
  },
  email: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    right: 20,
  },
  menuList: {
    flex: 1,
    paddingTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  menuItemText: {
    color: '#334155',
    fontSize: 16,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    marginBottom: Platform.OS === 'ios' ? 30 : 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  logoutText: {
    color: '#dc2626',
    fontWeight: '500',
    fontSize: 16,
    marginRight: 10,
  },
  logoutIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
  },
});