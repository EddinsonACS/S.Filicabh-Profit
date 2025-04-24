import { create } from 'zustand';

interface Enterprise {
  id: string;
  name: string;
  description?: string;
  balance?: number;
}

interface EnterpriseStore {
  selectedEnterprise: Enterprise | null;
  showLateral: boolean;
  setShowLateral: (value:boolean) => void;
  setSelectedEnterprise: (enterprise: Enterprise) => void;
}

export const enterpriseStore = create<EnterpriseStore>((set) => ({
  selectedEnterprise: null,
  showLateral: false,
  setShowLateral: (value) => set({ showLateral: value}),
  setSelectedEnterprise: (enterprise) => set({ selectedEnterprise: enterprise }),
}));
