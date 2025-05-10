
'use client';

import type { Dispatch, ReactNode, SetStateAction } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';

interface DashboardContextProps {
  selectedYear: number | undefined;
  setSelectedYear: Dispatch<SetStateAction<number | undefined>>;
  selectedRegion: string | undefined;
  setSelectedRegion: Dispatch<SetStateAction<string | undefined>>;
  availableRegions: string[];
  setAvailableRegions: Dispatch<SetStateAction<string[]>>;
}

const DashboardContext = createContext<DashboardContextProps | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);
  const [selectedRegion, setSelectedRegion] = useState<string | undefined>(undefined);
  const [availableRegions, setAvailableRegions] = useState<string[]>([]);

  useEffect(() => {
    // Set initial year on mount
    if (typeof window !== 'undefined') {
        setSelectedYear(new Date().getFullYear());
    }
  }, []);

  useEffect(() => {
    if (availableRegions.length > 0 && !selectedRegion) {
      setSelectedRegion(availableRegions[0]);
    }
  }, [availableRegions, selectedRegion]);


  return (
    <DashboardContext.Provider value={{ 
      selectedYear, setSelectedYear,
      selectedRegion, setSelectedRegion,
      availableRegions, setAvailableRegions
    }}>
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

