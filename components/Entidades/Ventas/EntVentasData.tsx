import { CategorySection, SalesItem } from '@/components/Entidades/Ventas/VentasTypes';

// Categorías de ventas y compras
export const salesCategories: CategorySection[] = [
    {
        id: 'commercialFigure',
        title: 'Figura Comercial',
        icon: 'people-outline',
        color: '#15803d',
        lightColor: '#dcfce7',
        type: 'commercialFigure',
        route: '/sales/commercial-figure'
    },
    {
        id: 'paymentAgreement',
        title: 'Acuerdo de Pago',
        icon: 'document-text-outline',
        color: '#15803d',
        lightColor: '#dcfce7',
        type: 'paymentAgreement',
        route: '/sales/payment-agreements'
    },
    {
        id: 'city',
        title: 'Ciudad',
        icon: 'business-outline',
        color: '#15803d',
        lightColor: '#dcfce7',
        type: 'city',
        route: '/sales/cities'
    },
    {
        id: 'region',
        title: 'Región',
        icon: 'map-outline',
        color: '#15803d',
        lightColor: '#dcfce7',
        type: 'region',
        route: '/sales/regions'
    },
    {
        id: 'country',
        title: 'País',
        icon: 'globe-outline',
        color: '#15803d',
        lightColor: '#dcfce7',
        type: 'country',
        route: '/sales/countries'
    },
    {
        id: 'deliveryMethod',
        title: 'Forma De Entrega',
        icon: 'car-outline',
        color: '#15803d',
        lightColor: '#dcfce7',
        type: 'deliveryMethod',
        route: '/sales/delivery-methods'
    },
    {
        id: 'personType',
        title: 'Tipo Persona',
        icon: 'person-outline',
        color: '#15803d',
        lightColor: '#dcfce7',
        type: 'personType',
        route: '/sales/person-types'
    },
    {
        id: 'sellerType',
        title: 'Tipo Vendedor',
        icon: 'briefcase-outline',
        color: '#15803d',
        lightColor: '#dcfce7',
        type: 'sellerType',
        route: '/sales/seller-types'
    },
    {
        id: 'seller',
        title: 'Vendedor',
        icon: 'person-circle-outline',
        color: '#15803d',
        lightColor: '#dcfce7',
        type: 'seller',
        route: '/sales/sellers'
    },
    {
        id: 'currency',
        title: 'Moneda',
        icon: 'cash-outline',
        color: '#15803d',
        lightColor: '#dcfce7',
        type: 'currency',
        route: '/sales/currencies'
    },
    {
        id: 'exchangeRate',
        title: 'Tasa De Cambio',
        icon: 'trending-up-outline',
        color: '#15803d',
        lightColor: '#dcfce7',
        type: 'exchangeRate',
        route: '/sales/exchange-rates'
    },
    {
        id: 'priceList',
        title: 'Lista De Precio',
        icon: 'pricetags-outline',
        color: '#15803d',
        lightColor: '#dcfce7',
        type: 'priceList',
        route: '/sales/price-lists'
    },
    {
        id: 'sector',
        title: 'Sector',
        icon: 'location-outline',
        color: '#15803d',
        lightColor: '#dcfce7',
        type: 'sector',
        route: '/sales/sectors'
    },
    {
        id: 'category',
        title: 'Rubro',
        icon: 'bookmark-outline',
        color: '#15803d',
        lightColor: '#dcfce7',
        type: 'category',
        route: '/sales/categories'
    }
];

// Datos de ejemplo para simular la carga inicial
export const mockData: SalesItem[] = [
    {
        id: '1',
        name: 'Cliente',
        description: 'Comprador habitual de productos',
        code: 'CLI001',
        status: 'active',
        createdAt: '2023-01-15',
        type: 'commercialFigure'
    },
    {
        id: '2',
        name: 'Proveedor',
        description: 'Suministrador de materias primas',
        code: 'PRO002',
        status: 'active',
        createdAt: '2023-02-20',
        type: 'commercialFigure'
    },
    {
        id: '3',
        name: 'Pago a 30 días',
        description: 'Pago a 30 días desde la emisión de factura',
        code: 'PAG001',
        status: 'active',
        createdAt: '2023-03-10',
        type: 'paymentAgreement'
    },
    {
        id: '4',
        name: 'Caracas',
        description: 'Capital de Venezuela',
        code: 'CCS001',
        status: 'active',
        createdAt: '2023-04-05',
        type: 'city'
    },
    {
        id: '5',
        name: 'Región Capital',
        description: 'Incluye Caracas y alrededores',
        code: 'RC001',
        status: 'active',
        createdAt: '2023-05-12',
        type: 'region'
    },
    {
        id: '6',
        name: 'Venezuela',
        description: 'República Bolivariana de Venezuela',
        code: 'VEN001',
        status: 'active',
        createdAt: '2023-06-18',
        type: 'country'
    },
    {
        id: '7',
        name: 'Envío terrestre',
        description: 'Entrega por vía terrestre',
        code: 'ET001',
        status: 'active',
        createdAt: '2023-07-22',
        type: 'deliveryMethod'
    },
    {
        id: '8',
        name: 'Persona natural',
        description: 'Individuo particular',
        code: 'PN001',
        status: 'active',
        createdAt: '2023-08-14',
        type: 'personType'
    },
    {
        id: '9',
        name: 'Vendedor interno',
        description: 'Personal de ventas interno',
        code: 'VI001',
        status: 'active',
        createdAt: '2023-09-05',
        type: 'sellerType'
    },
    {
        id: '10',
        name: 'Juan Pérez',
        description: 'Vendedor principal zona este',
        code: 'JP001',
        status: 'active',
        createdAt: '2023-10-10',
        type: 'seller'
    },
    {
        id: '11',
        name: 'Bolívar',
        description: 'Moneda local venezolana',
        code: 'BS001',
        status: 'active',
        createdAt: '2023-11-15',
        type: 'currency'
    },
    {
        id: '12',
        name: 'Tasa USD 05/2025',
        description: 'Tasa de cambio USD a Bs.',
        code: 'TC001',
        status: 'active',
        createdAt: '2023-12-20',
        type: 'exchangeRate',
        value: '35.75',
        date: '2025-05-01'
    },
    {
        id: '13',
        name: 'Lista precio mayorista',
        description: 'Precios para compras al por mayor',
        code: 'LPM001',
        status: 'active',
        createdAt: '2024-01-25',
        type: 'priceList'
    },
    {
        id: '14',
        name: 'Este',
        description: 'Sector este de la ciudad',
        code: 'SE001',
        status: 'active',
        createdAt: '2024-02-28',
        type: 'sector'
    },
    {
        id: '15',
        name: 'Textiles',
        description: 'Rubro de productos textiles',
        code: 'RUB001',
        status: 'active',
        createdAt: '2024-03-30',
        type: 'category'
    }
];