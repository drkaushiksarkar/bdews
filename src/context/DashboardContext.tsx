
'use client';

import type { Dispatch, ReactNode, SetStateAction } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';

const diseases = ['Malaria', 'Dengue', 'Diarrhoea'] as const;
export type Disease = typeof diseases[number];

interface DashboardContextProps {
  selectedYear: number | undefined;
  setSelectedYear: Dispatch<SetStateAction<number | undefined>>;
  selectedRegion: string | undefined;
  setSelectedRegion: Dispatch<SetStateAction<string | undefined>>;
  availableRegions: string[];
  setAvailableRegions: Dispatch<SetStateAction<string[]>>;
  selectedDisease: Disease | undefined;
  setSelectedDisease: Dispatch<SetStateAction<Disease | undefined>>;
  availableDiseases: readonly Disease[]; // Keep as readonly since it's a fixed list for now
}

const DashboardContext = createContext<DashboardContextProps | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);
  const [selectedRegion, setSelectedRegion] = useState<string | undefined>(undefined);
  const [availableRegions, setAvailableRegions] = useState<string[]>([]);
  const [selectedDisease, setSelectedDisease] = useState<Disease | undefined>(undefined);
  
  const availableDiseases = diseases; // Using the predefined list

  useEffect(() => {
    // Set initial year on mount to a year where data exists
    if (typeof window !== 'undefined') {
        setSelectedYear(2023); // Default to 2023 as dummy data exists for this year
    }
  }, []);

  useEffect(() => {
    if (availableRegions.length > 0 && !selectedRegion) {
      setSelectedRegion(availableRegions[0]);
    }
  }, [availableRegions, selectedRegion, setSelectedRegion]);

  useEffect(() => {
    if (availableDiseases.length > 0 && !selectedDisease) {
      setSelectedDisease(availableDiseases[0]);
    }
  }, [availableDiseases, selectedDisease, setSelectedDisease]);


  return (
    <DashboardContext.Provider value={{ 
      selectedYear, setSelectedYear,
      selectedRegion, setSelectedRegion,
      availableRegions, setAvailableRegions,
      selectedDisease, setSelectedDisease,
      availableDiseases
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

