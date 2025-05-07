export interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  code?: string;
  category?: string;
  group?: string;
  section?: string;
  unit?: string;
  size?: string;
  color?: string;
  taxType?: string;
  articleType?: string;
  origin?: string;
  warehouse?: string;
  price?: number;
  stock?: number;
  image?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  type: 'article' | 'category' | 'group' | 'section' | 'unit' | 'size' | 'color' | 'taxType' | 'articleType' | 'origin' | 'warehouse';
}

export interface CategorySection {
  id: string;
  title: string;
  icon: any;
  color: string;
  lightColor: string;
  type: string;
  route: string;
}

export interface FormDataType {
  image?: string;
  name: string;
  description: string;
  code: string;
  category: string;
  group: string;
  section: string;
  unit: string;
  size: string;
  color: string;
  taxType: string;
  articleType: string;
  origin: string;
  warehouse: string;
  price: string;
  stock: string;
  status: 'active' | 'inactive';
}