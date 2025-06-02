import React, { createContext, ReactNode, useContext, useState } from 'react';
import { SectionType } from '../../utils/colorManager';

// Tipo para el contexto
interface AppContextProps {
  isSideMenuOpen: boolean;
  toggleSideMenu: () => void;
  closeSideMenu: () => void;
  currentEntitySection: SectionType | null;
  setCurrentEntitySection: (section: SectionType | null) => void;
}

// Contexto con valores por defecto
const AppContext = createContext<AppContextProps>({
  isSideMenuOpen: false,
  toggleSideMenu: () => { },
  closeSideMenu: () => { },
  currentEntitySection: null,
  setCurrentEntitySection: () => { },
});

// Hook personalizado
export const useAppContext = () => useContext(AppContext);

// Proveedor simplificado
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [isSideMenuOpen, setIsSideMenuOpen] = useState<boolean>(false);
  const [currentEntitySection, setCurrentEntitySection] = useState<SectionType | null>(null);

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
    currentEntitySection,
    setCurrentEntitySection,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};