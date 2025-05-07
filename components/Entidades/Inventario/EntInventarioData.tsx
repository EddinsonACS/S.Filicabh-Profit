// data/mockData.ts
import { InventoryItem, CategorySection } from '@/components/Entidades/Inventario/InventoryTypes';

// Inventory categories
export const inventoryCategories: CategorySection[] = [
  {
    id: 'article',
    title: 'Artículos',
    icon: 'pricetag-outline',
    color: '#581c87',
    lightColor: '#f3e8ff',
    type: 'article',
    route: '/inventory/articles'
  },
  {
    id: 'category',
    title: 'Categoría',
    icon: 'folder-outline',
    color: '#581c87',
    lightColor: '#f3e8ff',
    type: 'category',
    route: '/inventory/categories'
  },
  {
    id: 'group',
    title: 'Grupo',
    icon: 'albums-outline',
    color: '#581c87',
    lightColor: '#f3e8ff',
    type: 'group',
    route: '/inventory/groups'
  },
  {
    id: 'section',
    title: 'Sección',
    icon: 'grid-outline',
    color: '#581c87',
    lightColor: '#f3e8ff',
    type: 'section',
    route: '/inventory/sections'
  },
  {
    id: 'unit',
    title: 'Unidad',
    icon: 'resize-outline',
    color: '#581c87',
    lightColor: '#f3e8ff',
    type: 'unit',
    route: '/inventory/units'
  },
  {
    id: 'size',
    title: 'Talla',
    icon: 'shirt-outline',
    color: '#581c87',
    lightColor: '#f3e8ff',
    type: 'size',
    route: '/inventory/sizes'
  },
  {
    id: 'color',
    title: 'Color',
    icon: 'color-palette-outline',
    color: '#581c87',
    lightColor: '#f3e8ff',
    type: 'color',
    route: '/inventory/colors'
  },
  {
    id: 'taxType',
    title: 'Tipo De Impuesto',
    icon: 'cash-outline',
    color: '#581c87',
    lightColor: '#f3e8ff',
    type: 'taxType',
    route: '/inventory/tax-types'
  },
  {
    id: 'articleType',
    title: 'Tipo De Artículo',
    icon: 'list-outline',
    color: '#581c87',
    lightColor: '#f3e8ff',
    type: 'articleType',
    route: '/inventory/article-types'
  },
  {
    id: 'origin',
    title: 'Origen',
    icon: 'flag-outline',
    color: '#581c87',
    lightColor: '#f3e8ff',
    type: 'origin',
    route: '/inventory/origins'
  },
  {
    id: 'warehouse',
    title: 'Almacén',
    icon: 'home-outline',
    color: '#581c87',
    lightColor: '#f3e8ff',
    type: 'warehouse',
    route: '/inventory/warehouses'
  }
];

// Mock data for inventory items
export const mockData: InventoryItem[] = [
  {
    id: '1',
    name: 'Camisa Casual',
    description: 'Camisa manga larga casual para hombre',
    code: 'CC001',
    category: 'Ropa',
    group: 'Camisas',
    section: 'Hombre',
    unit: 'Unidad',
    size: 'M',
    color: 'Azul',
    taxType: 'IVA 16%',
    articleType: 'Producto Terminado',
    origin: 'Nacional',
    warehouse: 'Almacén Central',
    price: 25.99,
    stock: 50,
    image: 'https://placehold.co/100x100/blue/white?text=Camisa',
    status: 'active',
    createdAt: '2023-01-15',
    type: 'article'
  },
  {
    id: '2',
    name: 'Pantalón Formal',
    description: 'Pantalón formal para hombre',
    code: 'PF002',
    category: 'Ropa',
    group: 'Pantalones',
    section: 'Hombre',
    unit: 'Unidad',
    size: '32',
    color: 'Negro',
    taxType: 'IVA 16%',
    articleType: 'Producto Terminado',
    origin: 'Importado',
    warehouse: 'Almacén Central',
    price: 35.99,
    stock: 30,
    image: 'https://placehold.co/100x100/black/white?text=Pantalon',
    status: 'active',
    createdAt: '2023-02-20',
    type: 'article'
  },
  {
    id: '3',
    name: 'Ropa',
    description: 'Categoría para prendas de vestir',
    code: 'CAT001',
    status: 'active',
    createdAt: '2023-03-10',
    type: 'category'
  },
  {
    id: '4',
    name: 'Camisas',
    description: 'Grupo de productos tipo camisa',
    code: 'GRP001',
    status: 'active',
    createdAt: '2023-04-05',
    type: 'group'
  },
  {
    id: '5',
    name: 'Hombre',
    description: 'Sección para productos masculinos',
    code: 'SEC001',
    status: 'active',
    createdAt: '2023-05-12',
    type: 'section'
  },
  {
    id: '6',
    name: 'Unidad',
    description: 'Unidad estándar de medida',
    code: 'UNI001',
    status: 'active',
    createdAt: '2023-06-18',
    type: 'unit'
  },
  {
    id: '7',
    name: 'M',
    description: 'Talla mediana para ropa',
    code: 'TM001',
    status: 'active',
    createdAt: '2023-07-22',
    type: 'size'
  },
  {
    id: '8',
    name: 'Azul',
    description: 'Color azul estándar',
    code: 'COL001',
    status: 'active',
    createdAt: '2023-08-14',
    type: 'color'
  },
  {
    id: '9',
    name: 'IVA 16%',
    description: 'Impuesto al valor agregado estándar',
    code: 'IMP001',
    status: 'active',
    createdAt: '2023-09-05',
    type: 'taxType'
  },
  {
    id: '10',
    name: 'Producto Terminado',
    description: 'Artículo listo para venta',
    code: 'TIPART001',
    status: 'active',
    createdAt: '2023-10-10',
    type: 'articleType'
  },
  {
    id: '11',
    name: 'Nacional',
    description: 'Origen nacional',
    code: 'ORG001',
    status: 'active',
    createdAt: '2023-11-15',
    type: 'origin'
  },
  {
    id: '12',
    name: 'Almacén Central',
    description: 'Almacén principal de productos',
    code: 'ALM001',
    status: 'active',
    createdAt: '2023-12-20',
    type: 'warehouse'
  }
];