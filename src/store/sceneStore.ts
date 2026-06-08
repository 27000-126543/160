import { create } from 'zustand';
import { SceneState, EmergencyType, Emergency, EscapeRoute } from '../types';

const emergencyConfigs: Record<EmergencyType, Omit<Emergency, 'id' | 'createdAt'>> = {
  blizzard: {
    type: 'blizzard',
    name: '暴雪预警',
    status: 'active',
    level: 'high',
    description: '强暴风雪即将来临，请立即撤离至避难舱',
  },
  avalanche: {
    type: 'avalanche',
    name: '冰崩预警',
    status: 'active',
    level: 'critical',
    description: '监测到冰裂活动，有冰崩风险，请立即疏散',
  },
  equipment_failure: {
    type: 'equipment_failure',
    name: '设备故障',
    status: 'active',
    level: 'medium',
    description: '主供电系统故障，备用发电机已启动',
  },
  medical: {
    type: 'medical',
    name: '医疗紧急事件',
    status: 'active',
    level: 'high',
    description: '队员出现冻伤症状，需要紧急医疗处置',
  },
};

const initialEscapeRoutes: EscapeRoute[] = [
  {
    id: 'route-1',
    name: '主楼疏散路线',
    path: [
      [0, 0, 0],
      [3, 0, 3],
      [6, 0, 6],
      [0, 0, -8],
    ],
    color: '#2ED573',
    isActive: false,
  },
  {
    id: 'route-2',
    name: '钻探点疏散路线',
    path: [
      [-20, 0, 15],
      [-15, 0, 10],
      [-8, 0, 5],
      [0, 0, -8],
    ],
    color: '#2ED573',
    isActive: false,
  },
  {
    id: 'route-3',
    name: '气象站疏散路线',
    path: [
      [15, 0, 10],
      [10, 0, 5],
      [5, 0, 0],
      [0, 0, -8],
    ],
    color: '#2ED573',
    isActive: false,
  },
];

const helicopterRoute: [number, number, number][] = [
  [0, 0, 25],
  [5, 5, 25],
  [10, 10, 30],
  [15, 15, 35],
  [20, 20, 40],
];

export const useSceneStore = create<SceneState>((set, get) => ({
  isPolarNight: false,
  lightingIntensity: 0.8,
  heatingPower: 0.5,
  backupGeneratorActive: false,
  emergencyActive: false,
  currentEmergency: null,
  activeEmergencies: [],
  escapeRoutes: initialEscapeRoutes,
  helicopterRoute: null,
  cameraTarget: [0, 10, 20],
  
  togglePolarNight: () => {
    set((state) => ({
      isPolarNight: !state.isPolarNight,
      lightingIntensity: !state.isPolarNight ? 0.3 : 0.8,
      heatingPower: !state.isPolarNight ? 0.8 : 0.5,
    }));
  },
  
  updateEnvironmentalControls: () => {
    const { isPolarNight, lightingIntensity, heatingPower } = get();
    
    set((state) => {
      const targetLighting = isPolarNight ? 0.2 : 0.7;
      const targetHeating = isPolarNight ? 0.9 : 0.5;
      
      const newLighting = lightingIntensity + (targetLighting - lightingIntensity) * 0.05;
      const newHeating = heatingPower + (targetHeating - heatingPower) * 0.05;
      
      return {
        lightingIntensity: Math.round(newLighting * 100) / 100,
        heatingPower: Math.round(newHeating * 100) / 100,
      };
    });
  },
  
  triggerEmergency: (type: EmergencyType) => {
    const emergency: Emergency = {
      ...emergencyConfigs[type],
      id: `emergency-${Date.now()}`,
      createdAt: new Date(),
    };
    
    set((state) => ({
      emergencyActive: true,
      currentEmergency: emergency,
      activeEmergencies: [...state.activeEmergencies, emergency],
      helicopterRoute: helicopterRoute,
      escapeRoutes: initialEscapeRoutes.map(route => ({ ...route, isActive: true })),
    }));
  },
  
  resolveEmergency: () => {
    set({
      emergencyActive: false,
      currentEmergency: null,
      activeEmergencies: [],
      helicopterRoute: null,
      escapeRoutes: initialEscapeRoutes.map(route => ({ ...route, isActive: false })),
    });
  },
  
  setCameraTarget: (target: [number, number, number]) => {
    set({ cameraTarget: target });
  },
  
  toggleEscapeRoutes: (active: boolean) => {
    set((state) => ({
      escapeRoutes: state.escapeRoutes.map(route => ({ ...route, isActive: active })),
      helicopterRoute: active ? helicopterRoute : null,
    }));
  },
}));
