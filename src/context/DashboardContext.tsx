
'use client';

import type { Dispatch, ReactNode, SetStateAction } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';

interface DashboardContextProps {
  selectedYear: number | undefined;
  setSelectedYear: Dispatch<SetStateAction<number | undefined>>;
  // Add other shared states here as needed, e.g.:
  // selectedRegion: string | undefined;
  // setSelectedRegion: Dispatch<SetStateAction<string | undefined>>;
  // activeLayers: Record<string, boolean>;
  // setActiveLayers: Dispatch<SetStateAction<Record<string, boolean>>>;
}

const DashboardContext = createContext<DashboardContextProps | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);

  useEffect(() => {
    // Set initial year on mount
    if (typeof window !== 'undefined') {
        setSelectedYear(new Date().getFullYear());
    }
  }, []);


  return (
    <DashboardContext.Provider value={{ selectedYear, setSelectedYear }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboardContext() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboardContext must be used within a DashboardProvider');
  }
  return context;
}
