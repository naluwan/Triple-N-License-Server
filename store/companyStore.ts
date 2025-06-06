import { create } from 'zustand';

export interface Fingerprint {
  value: string;
  registeredAt: string;
  status: 'active' | 'revoked';
}

export interface Company {
  _id: string;
  companyId: string;
  name: string;
  deployKey: string;
  fingerprints: Fingerprint[];
  active: boolean;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

interface CompanyState {
  companies: Company[];
  setCompanies: (companies: Company[]) => void;
  editCompany: (company: Company) => void;
}

const useCompanyStore = create<CompanyState>((set) => ({
  companies: [],
  setCompanies: (companies) => set({ companies }),
  editCompany: (company) =>
    set((state) => ({
      companies: state.companies.map((c) => (c._id === company._id ? company : c)),
    })),
}));

export default useCompanyStore;
