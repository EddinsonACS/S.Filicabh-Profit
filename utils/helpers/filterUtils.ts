import { FilterState } from '@/components/Entidades/shared/DynamicFilterBar';

export interface EntityWithDates {
  id: number;
  fechaRegistro?: string;
  fechaModificacion?: string;
  suspendido?: boolean;
  [key: string]: any;
}

export const applyFilters = <T extends EntityWithDates>(
  items: T[],
  filterState: FilterState,
  searchQuery: string = ''
): T[] => {
  let filteredItems = [...items];

  // Apply search filter
  if (searchQuery.trim()) {
    filteredItems = filteredItems.filter(item => {
      const searchableFields = ['nombre', 'codigo', 'nroCuenta', 'rif', 'nit', 'email'];
      return searchableFields.some(field => {
        const value = item[field];
        return value && typeof value === 'string' 
          ? value.toLowerCase().includes(searchQuery.toLowerCase())
          : false;
      });
    });
  }

  // Apply status filter
  if (filterState.status !== 'all') {
    filteredItems = filteredItems.filter(item => {
      if (filterState.status === 'active') {
        return !item.suspendido;
      } else if (filterState.status === 'inactive') {
        return item.suspendido;
      }
      return true;
    });
  }

  // Apply custom date range filter
  if (filterState.dateFilter === 'custom') {
    const dateRange = getDateRange(filterState.dateFilter, filterState.customDateRange);
    if (dateRange.startDate || dateRange.endDate) {
      filteredItems = filteredItems.filter(item => {
        const itemDate = getItemDate(item, 'fechaRegistro');
        if (!itemDate) return false;

        if (dateRange.startDate && itemDate < dateRange.startDate) return false;
        if (dateRange.endDate && itemDate > dateRange.endDate) return false;
        return true;
      });
    }
  }

  // Apply sorting (including newest/oldest date filters)
  filteredItems.sort((a, b) => {
    let sortBy = filterState.sortBy;
    let sortOrder = filterState.sortOrder;

    // Override sort settings for date filters
    if (filterState.dateFilter === 'newest') {
      sortBy = 'fechaRegistro';
      sortOrder = 'desc';
    } else if (filterState.dateFilter === 'oldest') {
      sortBy = 'fechaRegistro';
      sortOrder = 'asc';
    }

    const aValue = getSortValue(a, sortBy);
    const bValue = getSortValue(b, sortBy);

    let comparison = 0;
    
    if (aValue < bValue) {
      comparison = -1;
    } else if (aValue > bValue) {
      comparison = 1;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  return filteredItems;
};

const getDateRange = (
  dateFilter: string,
  customRange?: { startDate: string; endDate: string }
): { startDate?: Date; endDate?: Date } => {
  switch (dateFilter) {
    case 'custom':
      if (customRange?.startDate && customRange?.endDate) {
        return {
          startDate: new Date(customRange.startDate),
          endDate: new Date(customRange.endDate + 'T23:59:59')
        };
      }
      return {};
    default:
      return {};
  }
};

const getItemDate = (item: EntityWithDates, sortBy: string): Date | null => {
  let dateString: string | undefined;

  if (sortBy === 'fechaRegistro') {
    dateString = item.fechaRegistro;
  } else if (sortBy === 'fechaModificacion') {
    dateString = item.fechaModificacion;
  } else if (item[sortBy] && typeof item[sortBy] === 'string') {
    // Try to parse any field that might be a date
    dateString = item[sortBy];
  }

  if (!dateString) return null;

  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
};

const getSortValue = (item: EntityWithDates, sortBy: string): any => {
  const value = item[sortBy];

  // Handle dates
  if (sortBy === 'fechaRegistro' || sortBy === 'fechaModificacion') {
    const date = getItemDate(item, sortBy);
    return date || new Date(0); // Default to epoch if no date
  }

  // Handle strings
  if (typeof value === 'string') {
    return value.toLowerCase();
  }

  // Handle numbers
  if (typeof value === 'number') {
    return value;
  }

  // Handle booleans
  if (typeof value === 'boolean') {
    return value ? 1 : 0;
  }

  // Default to string representation
  return String(value || '').toLowerCase();
};