// navigation.ts
export const PUBLIC_ROUTES = [
  'Splash',
  'Onboarding',
  'Entrepise',
  '(Auth)',
  'Login',
  'ForgetPassword',
  'MethodAuth'
];

export const isPublicRoute = (path: string): boolean => {
  if (!path) return false;

  // Mejor manejo de rutas
  const normalizedPath = path.startsWith('/') ? path.substring(1) : path;

  return PUBLIC_ROUTES.some(route => {
    if (route.startsWith('(') && route.endsWith(')')) {
      const groupName = route.substring(1, route.length - 1);
      return normalizedPath.includes(groupName);
    } else if (route === 'index' || route === '') {
      return normalizedPath === '' || normalizedPath === 'index';
    } else {
      return normalizedPath === route || normalizedPath.startsWith(`${route}/`);
    }
  });
};

export const shouldShowNavBar = (path: string): boolean => {
  return !isPublicRoute(path);
};