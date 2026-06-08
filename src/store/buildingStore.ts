import { create } from 'zustand';
import { Building, BuildingState, BuildingType, EnergyDataPoint, FaultRecord } from '../types';

const initialBuildings: Building[] = [
  {
    id: 'main',
    name: '科考站主楼',
    type: 'main',
    temperature: 22,
    humidity: 45,
    energyConsumption: 125,
    equipmentStatus: 'normal',
    position: [0, 0, 0],
  },
  {
    id: 'weather',
    name: '气象观测场',
    type: 'weather',
    temperature: 18,
    humidity: 50,
    energyConsumption: 45,
    equipmentStatus: 'normal',
    position: [15, 0, 10],
  },
  {
    id: 'drilling',
    name: '冰盖钻探点',
    type: 'drilling',
    temperature: -10,
    humidity: 60,
    energyConsumption: 200,
    equipmentStatus: 'warning',
    position: [-20, 0, 15],
  },
  {
    id: 'warehouse',
    name: '物资仓库',
    type: 'warehouse',
    temperature: 5,
    humidity: 55,
    energyConsumption: 35,
    equipmentStatus: 'normal',
    position: [12, 0, -15],
  },
  {
    id: 'power',
    name: '发电站',
    type: 'power',
    temperature: 35,
    humidity: 30,
    energyConsumption: 0,
    equipmentStatus: 'normal',
    position: [-15, 0, -12],
  },
  {
    id: 'helipad',
    name: '直升机停机坪',
    type: 'helipad',
    temperature: -15,
    humidity: 40,
    energyConsumption: 15,
    equipmentStatus: 'normal',
    position: [0, 0, 25],
  },
  {
    id: 'command',
    name: '指挥中心',
    type: 'command',
    temperature: 24,
    humidity: 42,
    energyConsumption: 180,
    equipmentStatus: 'normal',
    position: [0, 0, -8],
  },
];

const generateEnergyHistory = (buildingId: string): EnergyDataPoint[] => {
  const history: EnergyDataPoint[] = [];
  const now = new Date();
  let baseValue = initialBuildings.find(b => b.id === buildingId)?.energyConsumption || 100;
  
  for (let i = 23; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
    const variation = (Math.random() - 0.5) * 40;
    history.push({
      timestamp,
      value: Math.max(10, baseValue + variation),
    });
  }
  return history;
};

const generateFaultRecords = (buildingId: string): FaultRecord[] => {
  const records: FaultRecord[] = [];
  const now = new Date();
  
  if (buildingId === 'drilling') {
    records.push({
      id: `fault-${buildingId}-1`,
      buildingId,
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      description: '钻头温度过高，需要冷却',
      status: 'processing',
    });
    records.push({
      id: `fault-${buildingId}-2`,
      buildingId,
      timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      description: '液压系统压力波动',
      status: 'resolved',
    });
  }
  
  return records;
};

const initialEnergyHistory: Record<string, EnergyDataPoint[]> = {};
const initialFaultRecords: Record<string, FaultRecord[]> = {};

initialBuildings.forEach(building => {
  initialEnergyHistory[building.id] = generateEnergyHistory(building.id);
  initialFaultRecords[building.id] = generateFaultRecords(building.id);
});

export const useBuildingStore = create<BuildingState>((set, get) => ({
  buildings: initialBuildings,
  selectedBuilding: null,
  energyHistory: initialEnergyHistory,
  faultRecords: initialFaultRecords,
  
  updateBuildingData: () => {
    set((state) => ({
      buildings: state.buildings.map((building) => {
        const tempVariation = (Math.random() - 0.5) * 3;
        const humidityVariation = (Math.random() - 0.5) * 5;
        const energyVariation = (Math.random() - 0.5) * 15;
        
        return {
          ...building,
          temperature: Math.round((building.temperature + tempVariation) * 10) / 10,
          humidity: Math.round((building.humidity + humidityVariation) * 10) / 10,
          energyConsumption: Math.max(5, Math.round((building.energyConsumption + energyVariation) * 10) / 10),
        };
      }),
    }));
    
    const state = get();
    const now = new Date();
    const newEnergyHistory = { ...state.energyHistory };
    
    state.buildings.forEach((building) => {
      const history = [...newEnergyHistory[building.id]];
      if (history.length > 23) {
        history.shift();
      }
      history.push({
        timestamp: now,
        value: building.energyConsumption,
      });
      newEnergyHistory[building.id] = history;
    });
    
    set({ energyHistory: newEnergyHistory });
  },
  
  selectBuilding: (building) => set({ selectedBuilding: building }),
  
  getEnergyHistory: (buildingId) => {
    const state = get();
    return state.energyHistory[buildingId] || [];
  },
  
  getFaultRecords: (buildingId) => {
    const state = get();
    return state.faultRecords[buildingId] || [];
  },
}));
