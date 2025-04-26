import { Ionicons } from '@expo/vector-icons';
import { usePathname } from 'expo-router';
import React, { ReactNode, useEffect } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { isPublicRoute } from './navigation';
import { useAppContext } from './AppContext';
import NavBar from './NavBar';
import SideMenu from './SideMenu';

interface AppWrapperProps {
    children: ReactNode;
}

export default function AppWrapper({ children }: AppWrapperProps) {
    const { isSideMenuOpen, toggleSideMenu, closeSideMenu } = useAppContext();
    const pathname = usePathname();

    // Verificar si la ruta actual es pública 
    const isPublic = isPublicRoute(pathname);

    // Cerrar menú cuando cambia la ruta para prevenir memory leaks
    useEffect(() => {
        if (isSideMenuOpen) {
            closeSideMenu();
        }
    }, [pathname]);

    // Cleanup al desmontar el componente
    useEffect(() => {
        return () => {
            if (isSideMenuOpen) {
                closeSideMenu();
            }
        };
    }, []);

    // No mostrar navegación en rutas públicas
    if (isPublic) {
        return <>{children}</>;
    }

    return (
        <View className="flex-1 bg-[#F9F8FD] relative">
            {/* SideMenu */}
            <SideMenu isVisible={isSideMenuOpen} onClose={closeSideMenu} />

            {/* Contenido principal */}
            <View className="flex-1 pb-16">
                {children}
            </View>

            {/* Botón flotante de menú */}
            <TouchableOpacity
                onPress={toggleSideMenu}
                className="absolute top-4 left-4 w-10 h-10 bg-white rounded-full items-center justify-center z-10 shadow-md"
            >
                <Ionicons name="menu-outline" size={22} color="#1e3a8a" />
            </TouchableOpacity>

            {/* NavBar al final */}
            <View className="absolute bottom-0 left-0 right-0 bg-[#F9F8FD]">
                <NavBar onMenuPress={toggleSideMenu} />
            </View>
        </View>
    );
}