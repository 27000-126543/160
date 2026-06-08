import { create } from 'zustand';
import { SceneState, EmergencyType, Emergency, EscapeRoute, EventType, EnvironmentalEvent, EnvironmentTimelineData } from '../types';

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

const generateInitialTimeline = (): EnvironmentTimelineData[] => {
  const data: EnvironmentTimelineData[] = [];
  const now = new Date();
  
  for (let i = 24; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
    const hour = timestamp.getHours();
    const isNight = hour < 6 || hour > 20;
    
    data.push({
      timestamp,
      temperature: -40 + Math.random() * 15 - (isNight ? 10 : 0),
      lightIntensity: isNight ? 0.1 + Math.random() * 0.1 : 0.4 + Math.random() * 0.5,
      lightingPower: isNight ? 0.8 + Math.random() * 0.2 : 0.3 + Math.random() * 0.3,
      heatingPower: isNight ? 0.7 + Math.random() * 0.3 : 0.4 + Math.random() * 0.2,
      generatorActive: Math.random() > 0.9,
    });
  }
  
  return data;
};

const generateInitialEvents = (): EnvironmentalEvent[] => {
  const now = new Date();
  return [
    {
      id: 'evt-001',
      type: 'polar_night_start',
      timestamp: new Date(now.getTime() - 12 * 60 * 60 * 1000),
      value: 0.15,
      description: '光照强度低于阈值，进入极夜模式',
    },
    {
      id: 'evt-002',
      type: 'generator_start',
      timestamp: new Date(now.getTime() - 8 * 60 * 60 * 1000),
      value: -52.5,
      description: '温度低于-50°C，备用发电机启动',
    },
  ];
};

export const useSceneStore = create<SceneState>((set, get) => ({
  isPolarNight: false,
  lightingIntensity: 0.8,
  heatingPower: 0.5,
  backupGeneratorActive: false,
  emergencyActive: false,
  currentEmergency: null,
  activeEmergencies: [],
  environmentalEvents: generateInitialEvents(),
  environmentTimeline: generateInitialTimeline(),
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
  
  setPolarNight: (value: boolean) => {
    set({
      isPolarNight: value,
      lightingIntensity: value ? 0.2 : 0.8,
      heatingPower: value ? 0.9 : 0.5,
    });
  },
  
  setBackupGeneratorActive: (value: boolean) => {
    set({ backupGeneratorActive: value });
  },
  
  addEnvironmentalEvent: (type: EventType, value: number, description: string) => {
    const event: EnvironmentalEvent = {
      id: `evt-${Date.now()}`,
      type,
      timestamp: new Date(),
      value,
      description,
    };
    
    set((state) => ({
      environmentalEvents: [...state.environmentalEvents.slice(-49), event],
    }));
  },
  
  addEnvironmentTimelineData: (data: Omit<EnvironmentTimelineData, 'timestamp'>) => {
    const newData: EnvironmentTimelineData = {
      ...data,
      timestamp: new Date(),
    };
    
    set((state) => ({
      environmentTimeline: [...state.environmentTimeline.slice(-24), newData],
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

export const getEventLabel = (type: EventType): string => {
  const labels: Record<EventType, string> = {
    polar_night_start: '进入极夜',
    polar_night_end: '解除极夜',
    generator_start: '启动备用发电机',
    generator_end: '关闭备用发电机',
    extreme_cold_start: '极寒预警启动',
    extreme_cold_end: '极寒预警解除',
  };
  return labels[type];
};

export const getEventColor = (type: EventType): string => {
  const colors: Record<EventType, string> = {
    polar_night_start: '#00D4FF',
    polar_night_end: '#FFA502',
    generator_start: '#FF4757',
    generator_end: '#2ED573',
    extreme_cold_start: '#FF4757',
    extreme_cold_end: '#2ED573',
  };
  return colors[type];
};
