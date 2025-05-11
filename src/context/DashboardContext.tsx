'use client';

import type { Dispatch, ReactNode, SetStateAction } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';

const diseases = ['Malaria', 'Dengue', 'Diarrhoea'] as const;
export type Disease = typeof diseases[number];

export interface StlDataPoint { date: string; original: number; trend: number; seasonal: number; residual: number; }
export interface ForecastDataPoint { date: string; actual: number | null; forecast: number | null; confidence: [number, number] | null; confidenceLower?: number | null; confidenceUpper?: number | null; }
export interface AnomalyDataPoint { date: string; value: number; isAnomaly: boolean; }
export interface RegionMetadataItem { latitude: number; longitude: number; country: string; }
export interface KpiDataItem {
  outbreakProbability: number;
  r0Estimate: number;
  casesNextMonth: number;
  affectedPopulation: number;
}
export interface WeatherCondition {
  value: number;
  unit: string;
  forecast?: string;
  forecast_24h_prob?: number;
  description?: string;
  comfort_level?: string;
  source: string;
}
export interface WeatherDataItem {
  temperature: WeatherCondition;
  rainfall: WeatherCondition;
  humidity: WeatherCondition;
}

export type RegionDiseaseData<T> = Record<string, Record<Disease, T[]>>;
export type RegionKpiData = Record<string, Record<Disease, KpiDataItem>>;
export type RegionMetadata = Record<string, RegionMetadataItem>;
export type RegionWeatherData = Record<string, WeatherDataItem>;

interface DashboardContextProps {
  selectedYear: number | undefined;
  setSelectedYear: Dispatch<SetStateAction<number | undefined>>;
  selectedRegion: string | undefined;
  setSelectedRegion: Dispatch<SetStateAction<string | undefined>>;
  availableRegions: string[];
  setAvailableRegions: Dispatch<SetStateAction<string[]>>;
  selectedDisease: Disease | undefined;
  setSelectedDisease: Dispatch<SetStateAction<Disease | undefined>>;
  availableDiseases: readonly Disease[];
  stlData: RegionDiseaseData<StlDataPoint> | null;
  forecastData: RegionDiseaseData<ForecastDataPoint> | null;
  anomalyData: RegionDiseaseData<AnomalyDataPoint> | null;
  regionMetadata: RegionMetadata | null;
  kpiData: RegionKpiData | null;
  weatherData: RegionWeatherData | null;
  dataLoading: boolean;
  dataError: string | null;
}

const DashboardContext = createContext<DashboardContextProps | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [selectedYear, setSelectedYear] = useState<number | undefined>(new Date().getFullYear());
  const [selectedRegion, setSelectedRegion] = useState<string | undefined>(undefined);
  const [availableRegions, setAvailableRegions] = useState<string[]>([]);
  const [selectedDisease, setSelectedDisease] = useState<Disease | undefined>(undefined);

  const [stlData, setStlData] = useState<RegionDiseaseData<StlDataPoint> | null>(null);
  const [forecastData, setForecastData] = useState<RegionDiseaseData<ForecastDataPoint> | null>(null);
  const [anomalyData, setAnomalyData] = useState<RegionDiseaseData<AnomalyDataPoint> | null>(null);
  const [regionMetadata, setRegionMetadata] = useState<RegionMetadata | null>(null);
  const [kpiData, setKpiData] = useState<RegionKpiData | null>(null);
  const [weatherData, setWeatherData] = useState<RegionWeatherData | null>(null);
  const [dataLoading, setDataLoading] = useState<boolean>(true);
  const [dataError, setDataError] = useState<string | null>(null);

  const availableDiseases = diseases;

  useEffect(() => {
    // Set initial year on mount
    setSelectedYear(2023);
  }, []);

  useEffect(() => {
    async function fetchData() {
      setDataLoading(true);
      setDataError(null);
      try {
        const [
          stlResponse,
          forecastResponse,
          anomalyResponse,
          regionMetaResponse,
          kpiResponse,
          // CHANGED: removed weatherResponse from Promise.all()
        ] = await Promise.all([
          fetch('/data/stl-decomposition-data.json'),
          fetch('/data/time-series-forecast-data.json'),
          fetch('/data/anomaly-detection-data.json'),
          fetch('/data/region-metadata.json'),
          fetch('/data/kpi-data.json'),
          // CHANGED: no fetch('/data/weather-data.json')
        ]);

        if (!stlResponse.ok) throw new Error(`Failed to fetch STL data: ${stlResponse.statusText}`);
        if (!forecastResponse.ok) throw new Error(`Failed to fetch forecast data: ${forecastResponse.statusText}`);
        if (!anomalyResponse.ok) throw new Error(`Failed to fetch anomaly data: ${anomalyResponse.statusText}`);
        if (!regionMetaResponse.ok) throw new Error(`Failed to fetch region metadata: ${regionMetaResponse.statusText}`);
        if (!kpiResponse.ok) throw new Error(`Failed to fetch KPI data: ${kpiResponse.statusText}`);

        const stlJson: RegionDiseaseData<StlDataPoint> = await stlResponse.json();
        const forecastJson: RegionDiseaseData<ForecastDataPoint> = await forecastResponse.json();
        const anomalyJson: RegionDiseaseData<AnomalyDataPoint> = await anomalyResponse.json();
        const regionMetaJson: RegionMetadata = await regionMetaResponse.json();
        const kpiJson: RegionKpiData = await kpiResponse.json();

        setStlData(stlJson);

        const processedForecastJson: RegionDiseaseData<ForecastDataPoint> = {};
        for (const region in forecastJson) {
          processedForecastJson[region] = {} as Record<Disease, ForecastDataPoint[]>;
          for (const disease in forecastJson[region]) {
            processedForecastJson[region][disease as Disease] = forecastJson[region][disease as Disease].map((item: any) => ({
              ...item,
              confidenceLower: item.confidence ? item.confidence[0] : null,
              confidenceUpper: item.confidence ? item.confidence[1] : null,
            }));
          }
        }
        setForecastData(processedForecastJson);
        setAnomalyData(anomalyJson);
        setRegionMetadata(regionMetaJson);
        setKpiData(kpiJson);
        // CHANGED: weatherData is now populated in its own effect

        const regions = Object.keys(regionMetaJson);
        setAvailableRegions(regions);
        if (regions.length > 0 && !selectedRegion) {
          setSelectedRegion(regions[0]);
        }

      } catch (error) {
        console.error("Failed to load data:", error);
        setDataError(error instanceof Error ? error.message : "An unknown error occurred while fetching data.");
      } finally {
        setDataLoading(false);
      }
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- ADDED: fetch current + forecast + daily max/min for the three cards ---
  useEffect(() => {
    if (!regionMetadata || !selectedRegion) return;

    setDataLoading(true);
    setDataError(null);

    const { latitude, longitude } = regionMetadata[selectedRegion];
    const url = `https://api.open-meteo.com/v1/forecast`
      + `?latitude=${latitude}&longitude=${longitude}`
      + `&current=temperature_2m,rain,relative_humidity_2m`
      + `&hourly=temperature_2m,rain,relative_humidity_2m`      // ADDED: hourly arrays for forecast
      + `&daily=temperature_2m_max,temperature_2m_min`;        // ADDED: daily max/min

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
      })
      .then(data => {
        const c = data.current;
        const h = data.hourly;
        const d = data.daily;

        // pick 1-hour-ahead forecast from hourly arrays
        const tempForecast = h.temperature_2m[1];
        const rainForecast = h.rain[1];
        const humidityForecast = h.relative_humidity_2m[1];

        // today’s daily max/min
        const maxTemp = d.temperature_2m_max[0];
        const minTemp = d.temperature_2m_min[0];

        setWeatherData({
          [selectedRegion]: {
            temperature: {
              value: c.temperature_2m,
              unit: '°C',
              description: `Min: ${minTemp}°C, Max: ${maxTemp}°C`,          // ADDED
              forecast: `${tempForecast}°C in 1h`,                          // ADDED
              source: 'Open-Meteo'
            },
            rainfall: {
              value: c.rain,
              unit: 'mm/h',
              forecast: `${rainForecast} mm/h in 1h`,                       // ADDED
              source: 'Open-Meteo'
            },
            humidity: {
              value: c.relative_humidity_2m,
              unit: '%',
              forecast: `${humidityForecast}% in 1h`,                       // ADDED
              source: 'Open-Meteo'
            }
          }
        });
      })
      .catch(err => {
        console.error(err);
        setDataError(err.message);
      })
      .finally(() => setDataLoading(false));
  }, [regionMetadata, selectedRegion]);
  // --- end of ADDED effect ---

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
      availableDiseases,
      stlData, forecastData, anomalyData, regionMetadata, kpiData, weatherData,
      dataLoading, dataError
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