import React, { createContext, ReactNode, useContext, useState } from 'react';
import { SectionType } from '../../utils/colorManager';

// Tipo para el contexto
interface AppContextProps {
  currentEntitySection: SectionType | null;
  setCurrentEntitySection: (section: SectionType | null) => void;
}

// Contexto con valores por defecto
const AppContext = createContext<AppContextProps>({
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
  const [currentEntitySection, setCurrentEntitySection] = useState<SectionType | null>(null);

  const contextValue = {
    currentEntitySection,
    setCurrentEntitySection,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};