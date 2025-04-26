import React, { createContext, ReactNode, useContext, useState } from 'react';

// Tipo para el contexto
interface AppContextProps {
  isSideMenuOpen: boolean;
  toggleSideMenu: () => void;
  closeSideMenu: () => void;
}

// Contexto con valores por defecto
const AppContext = createContext<AppContextProps>({
  isSideMenuOpen: false,
  toggleSideMenu: () => {},
  closeSideMenu: () => {},
});

// Hook personalizado
export const useAppContext = () => useContext(AppContext);

// Proveedor simplificado
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [isSideMenuOpen, setIsSideMenuOpen] = useState<boolean>(false);

  const toggleSideMenu = () => {
    setIsSideMenuOpen(prev => !prev);
  };

  const closeSideMenu = () => {
    setIsSideMenuOpen(false);
  };

  const contextValue = {
    isSideMenuOpen,
    toggleSideMenu,
    closeSideMenu,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};