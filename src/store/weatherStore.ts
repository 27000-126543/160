import { create } from 'zustand';
import { Weather, WeatherState, WindowSchedule } from '../types';

const generateForecast = (): Weather[] => {
  const forecast: Weather[] = [];
  const now = new Date();
  
  for (let i = 0; i < 24; i++) {
    const timestamp = new Date(now.getTime() + i * 60 * 60 * 1000);
    const hourOfDay = (timestamp.getHours() + i) % 24;
    const isNight = hourOfDay < 6 || hourOfDay > 20;
    
    forecast.push({
      id: `forecast-${i}`,
      timestamp,
      temperature: -40 + Math.random() * 20,
      windSpeed: 5 + Math.random() * 25,
      visibility: Math.random() > 0.3 ? 5 + Math.random() * 10 : 0.5 + Math.random() * 2,
      isPolarNight: isNight,
      lightIntensity: isNight ? 0.1 : 0.3 + Math.random() * 0.7,
    });
  }
  
  return forecast;
};

const initialForecast = generateForecast();

const calculateWindows = (forecast: Weather[]): WindowSchedule[] => {
  const windows: WindowSchedule[] = [];
  let currentWindow: Partial<WindowSchedule> | null = null;
  let windowId = 0;
  
  forecast.forEach((weather, index) => {
    const isGoodWeather = 
      weather.temperature > -35 &&
      weather.windSpeed < 15 &&
      weather.visibility > 3;
    
    if (isGoodWeather && !currentWindow) {
      currentWindow = {
        id: `window-${windowId++}`,
        startTime: weather.timestamp,
        routePath: [
          [0, 0, 0],
          [10, 0, 8],
          [15, 0, 15],
          [-10, 0, 18],
          [-20, 0, 15],
        ],
      };
    }
    
    if (isGoodWeather && currentWindow) {
      currentWindow.endTime = weather.timestamp;
    }
    
    if (!isGoodWeather && currentWindow && currentWindow.startTime && currentWindow.endTime) {
      const durationMs = currentWindow.endTime.getTime() - currentWindow.startTime.getTime();
      const durationHours = durationMs / (1000 * 60 * 60);
      
      windows.push({
        ...currentWindow,
        durationHours,
        status: durationHours >= 3 ? 'available' : 'insufficient',
        endTime: currentWindow.endTime,
        startTime: currentWindow.startTime,
      } as WindowSchedule);
      
      currentWindow = null;
    }
  });
  
  if (currentWindow && currentWindow.startTime && currentWindow.endTime) {
    const durationMs = currentWindow.endTime.getTime() - currentWindow.startTime.getTime();
    const durationHours = durationMs / (1000 * 60 * 60);
    
    windows.push({
      ...currentWindow,
      durationHours,
      status: durationHours >= 3 ? 'available' : 'insufficient',
      endTime: currentWindow.endTime,
      startTime: currentWindow.startTime,
    } as WindowSchedule);
  }
  
  return windows;
};

export const useWeatherStore = create<WeatherState>((set, get) => ({
  currentWeather: {
    id: 'current',
    timestamp: new Date(),
    temperature: -52,
    windSpeed: 8,
    visibility: 6.5,
    isPolarNight: false,
    lightIntensity: 0.6,
  },
  weatherForecast: initialForecast,
  windowSchedules: calculateWindows(initialForecast),
  selectedSchedule: null,
  
  updateWeatherData: () => {
    set((state) => {
      const newWeather = {
        ...state.currentWeather,
        temperature: Math.round((state.currentWeather.temperature + (Math.random() - 0.5) * 5) * 10) / 10,
        windSpeed: Math.max(0, Math.round((state.currentWeather.windSpeed + (Math.random() - 0.5) * 3) * 10) / 10),
        visibility: Math.max(0.1, Math.round((state.currentWeather.visibility + (Math.random() - 0.5) * 2) * 10) / 10),
        lightIntensity: Math.max(0, Math.min(1, state.currentWeather.lightIntensity + (Math.random() - 0.5) * 0.1)),
        timestamp: new Date(),
      };
      
      const newForecast = [...state.weatherForecast];
      newForecast.shift();
      newForecast.push({
        id: `forecast-${Date.now()}`,
        timestamp: new Date(state.weatherForecast[state.weatherForecast.length - 1].timestamp.getTime() + 60 * 60 * 1000),
        temperature: -40 + Math.random() * 20,
        windSpeed: 5 + Math.random() * 25,
        visibility: Math.random() > 0.3 ? 5 + Math.random() * 10 : 0.5 + Math.random() * 2,
        isPolarNight: Math.random() > 0.5,
        lightIntensity: Math.random() > 0.5 ? 0.1 : 0.3 + Math.random() * 0.7,
      });
      
      return {
        currentWeather: newWeather,
        weatherForecast: newForecast,
      };
    });
  },
  
  calculateWindows: () => {
    const state = get();
    const windows = calculateWindows(state.weatherForecast);
    set({ windowSchedules: windows });
  },
  
  selectSchedule: (schedule) => set({ selectedSchedule: schedule }),
}));
