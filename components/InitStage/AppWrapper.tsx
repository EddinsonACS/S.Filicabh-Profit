import { usePathname } from 'expo-router';
import React, { ReactNode } from 'react';
import { View } from 'react-native';
import { isPublicRoute } from '../navigation';
import NavBar from './NavBar';

interface AppWrapperProps {
  children: ReactNode;
}

export default function AppWrapper({ children }: AppWrapperProps) {
  const pathname = usePathname();
  const isPublic = isPublicRoute(pathname);

  if (isPublic) {
    return <>{children}</>;
  }

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