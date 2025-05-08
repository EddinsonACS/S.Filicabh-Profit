import { create } from 'zustand';

interface EnterpriseStore {
    username: string;
    setUsername: (username: string) => void;
}

export const authStorage = create<EnterpriseStore>((set) => ({
    username: '',
    setUsername: (username) => set({ username })
}));