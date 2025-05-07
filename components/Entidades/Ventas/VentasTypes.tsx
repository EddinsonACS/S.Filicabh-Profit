export interface SalesItem {
  id: string;
  name: string;
  description?: string;
  code?: string;
  value?: string;
  date?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  type: 'commercialFigure' | 'paymentAgreement' | 'city' | 'region' | 'country' | 'deliveryMethod' |
  'personType' | 'sellerType' | 'seller' | 'currency' | 'exchangeRate' | 'priceList' | 'sector' | 'category';
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
  name: string;
  description: string;
  code: string;
  value: string;
  date: string;
  status: 'active' | 'inactive';
}