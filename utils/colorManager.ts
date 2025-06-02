export interface SectionColors {
  home: string;
  sales: string;
  inventory: string;
  entities: string;
  finance: string;
}

export const SECTION_COLORS: SectionColors = {
  home: '#1e3a8a',
  sales: '#177245',
  inventory: '#4b0082',
  entities: '#1e3a8a',
  finance: '#1e3a8a',
};

export type SectionType = 'home' | 'sales' | 'inventory' | 'entities' | 'finance';

/**
 * Determina la sección activa basada en la ruta actual
 * @param currentPath - La ruta actual de la aplicación
 * @returns El tipo de sección activa
 */
export const getCurrentSection = (currentPath: string): SectionType => {
  // Detectar rutas directas PRIMERO (más específicas)
  if (currentPath.startsWith('/Ventas') || currentPath.includes('/Ventas/')) {
    return 'sales';
  }
  if (currentPath.startsWith('/Inventario') || currentPath.includes('/Inventario/')) {
    return 'inventory';
  }
  if (currentPath.startsWith('/Home') || currentPath.includes('/Home/')) {
    return 'home';
  }
  
  // Luego detectar subsecciones de entidades - Mejorando la detección
  if (currentPath.includes('/Entidades') || currentPath.includes('Entidades')) {
    // Si estamos en entidades pero en una subsección específica
    if (currentPath.includes('EntVentas') || 
        currentPath.includes('sales') || 
        currentPath.includes('/entities/sales') ||
        currentPath.includes('ventas')) {
      return 'sales';
    }
    if (currentPath.includes('EntInventario') || 
        currentPath.includes('inventory') ||
        currentPath.includes('/entities/inventory') ||
        currentPath.includes('inventario')) {
      return 'inventory';
    }
    if (currentPath.includes('EntFinanzas') || 
        currentPath.includes('finance') ||
        currentPath.includes('/entities/finance') ||
        currentPath.includes('finanzas')) {
      return 'finance';
    }
    // Si estamos en entidades principal
    return 'entities';
  }
  
  // Por defecto, home
  return 'home';
};

/**
 * Determina la sección activa basada en el estado de navegación local de Entidades
 * Esta función es para uso interno de los componentes de Entidades
 * @param selectedTab - El tab seleccionado en el componente Entidades 
 * @param currentPath - La ruta actual de la aplicación
 * @returns El tipo de sección activa
 */
export const getCurrentSectionFromTab = (selectedTab: string, currentPath: string): SectionType => {
  // Si estamos en una subsección específica dentro de entidades
  if (currentPath.includes('/Entidades')) {
    if (selectedTab === 'sales' || currentPath.includes('EntVentas')) {
      return 'sales';
    }
    if (selectedTab === 'inventory' || currentPath.includes('EntInventario')) {
      return 'inventory';
    }
    if (selectedTab === 'finance' || currentPath.includes('EntFinanzas')) {
      return 'finance';
    }
  }
  
  // Fallback al sistema principal
  return getCurrentSection(currentPath);
};

/**
 * Obtiene el color de la sección actual
 * @param currentPath - La ruta actual de la aplicación
 * @returns El color hexadecimal de la sección
 */
export const getCurrentSectionColor = (currentPath: string): string => {
  const section = getCurrentSection(currentPath);
  const color = SECTION_COLORS[section];
  
  // Debug temporal
  console.log('🎨 ColorManager Debug:', {
    currentPath,
    detectedSection: section,
    assignedColor: color
  });
  
  return color;
};

/**
 * Obtiene el color de la sección basado en el tab seleccionado
 * @param selectedTab - El tab seleccionado 
 * @param currentPath - La ruta actual de la aplicación
 * @returns El color hexadecimal de la sección
 */
export const getCurrentSectionColorFromTab = (selectedTab: string, currentPath: string): string => {
  const section = getCurrentSectionFromTab(selectedTab, currentPath);
  return SECTION_COLORS[section];
};

/**
 * Verifica si una ruta específica está activa
 * @param currentPath - La ruta actual
 * @param targetRoute - La ruta objetivo a verificar
 * @returns true si la ruta está activa
 */
export const isRouteActive = (currentPath: string, targetRoute: string): boolean => {
  // Para rutas exactas
  if (currentPath === targetRoute) return true;
  
  // Para rutas que empiezan con el target (sub-rutas)
  if (currentPath.startsWith(targetRoute + '/')) return true;
  
  return false;
};

/**
 * Verifica si un tab del navbar debe estar deshabilitado
 * @param tabName - El nombre del tab
 * @returns true si el tab debe estar deshabilitado
 */
export const isTabDisabled = (tabName: string): boolean => {
  const disabledTabs = ['Ventas', 'Inventario'];
  return disabledTabs.includes(tabName);
};

/**
 * Determina si estamos en una subsección de entidades que debe cambiar el color del header/sidebar
 * @param currentPath - La ruta actual de la aplicación
 * @returns true si estamos en una subsección que debe cambiar colores
 */
export const isInEntitySubsection = (currentPath: string): boolean => {
  return currentPath.includes('/Entidades') && (
    currentPath.includes('EntVentas') ||
    currentPath.includes('EntInventario') ||
    currentPath.includes('EntFinanzas')
  );
}; 