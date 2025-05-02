import { Enterprise } from '@/core/models/Enterpise';
import { create } from 'zustand';

interface EnterpriseStore {
  selectedEnterprise: Enterprise | null;
  listEnterprise: Enterprise[];
  setListEnterprise: (listEnterprise: Enterprise[]) => void
  setSelectedEnterprise: (enterprise: Enterprise) => void;
}

export const enterpriseStore = create<EnterpriseStore>((set) => ({
  selectedEnterprise: null,
  listEnterprise: [],
  setListEnterprise: (list) => set({ listEnterprise: list }),
  setSelectedEnterprise: (enterprise) => set({ selectedEnterprise: enterprise }),
}));
