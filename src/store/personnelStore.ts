import { create } from 'zustand';
import { Personnel, PersonnelState, VitalSigns } from '../types';

const DANGER_ZONE_CENTER: [number, number, number] = [-25, 0, 25];
const DANGER_ZONE_RADIUS = 8;

const initialPersonnel: Personnel[] = [
  {
    id: 'p1',
    name: '张伟',
    role: '地质学家',
    heartRate: 72,
    bloodOxygen: 98,
    inDangerZone: false,
    coords: [-10, 0, 8],
  },
  {
    id: 'p2',
    name: '李娜',
    role: '气象学家',
    heartRate: 68,
    bloodOxygen: 99,
    inDangerZone: false,
    coords: [14, 0, 9],
  },
  {
    id: 'p3',
    name: '王强',
    role: '机械工程师',
    heartRate: 85,
    bloodOxygen: 96,
    inDangerZone: false,
    coords: [-18, 0, 12],
  },
  {
    id: 'p4',
    name: '刘芳',
    role: '医生',
    heartRate: 70,
    bloodOxygen: 99,
    inDangerZone: false,
    coords: [2, 0, 2],
  },
  {
    id: 'p5',
    name: '陈明',
    role: '钻井操作员',
    heartRate: 95,
    bloodOxygen: 92,
    inDangerZone: true,
    coords: [-24, 0, 22],
  },
];

const generateVitalSignsHistory = (personnelId: string): VitalSigns[] => {
  const history: VitalSigns[] = [];
  const now = new Date();
  
  for (let i = 11; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 5 * 60 * 1000);
    history.push({
      id: `vs-${personnelId}-${i}`,
      personnelId,
      timestamp,
      heartRate: 60 + Math.floor(Math.random() * 40),
      bloodOxygen: 90 + Math.floor(Math.random() * 10),
    });
  }
  return history;
};

const initialVitalSignsHistory: Record<string, VitalSigns[]> = {};
initialPersonnel.forEach(p => {
  initialVitalSignsHistory[p.id] = generateVitalSignsHistory(p.id);
});

const isInDangerZone = (pos: [number, number, number]): boolean => {
  const dx = pos[0] - DANGER_ZONE_CENTER[0];
  const dy = pos[2] - DANGER_ZONE_CENTER[2];
  return Math.sqrt(dx * dx + dy * dy) < DANGER_ZONE_RADIUS;
};

export const usePersonnelStore = create<PersonnelState>((set, get) => ({
  personnel: initialPersonnel,
  selectedPersonnel: null,
  personnelInDanger: initialPersonnel.filter(p => p.inDangerZone),
  vitalSignsHistory: initialVitalSignsHistory,
  
  updatePersonnelData: () => {
    set((state) => {
      const updatedPersonnel = state.personnel.map((person) => {
        const newPos: [number, number, number] = [
          person.coords[0] + (Math.random() - 0.5) * 2,
          0,
          person.coords[2] + (Math.random() - 0.5) * 2,
        ];
        
        const newHeartRate = Math.max(55, Math.min(120, person.heartRate + (Math.random() - 0.5) * 8));
        const newBloodOxygen = Math.max(85, Math.min(100, person.bloodOxygen + (Math.random() - 0.5) * 3));
        
        return {
          ...person,
          coords: newPos,
          heartRate: Math.round(newHeartRate),
          bloodOxygen: Math.round(newBloodOxygen),
          inDangerZone: isInDangerZone(newPos),
        };
      });

      return {
        personnel: updatedPersonnel,
        personnelInDanger: updatedPersonnel.filter(p => p.inDangerZone),
      };
    });
    
    const state = get();
    const now = new Date();
    const newHistory = { ...state.vitalSignsHistory };
    
    state.personnel.forEach((person) => {
      const history = [...newHistory[person.id]];
      if (history.length > 11) {
        history.shift();
      }
      history.push({
        id: `vs-${person.id}-${Date.now()}`,
        personnelId: person.id,
        timestamp: now,
        heartRate: person.heartRate,
        bloodOxygen: person.bloodOxygen,
      });
      newHistory[person.id] = history;
    });
    
    set({ vitalSignsHistory: newHistory });
  },
  
  selectPersonnel: (personnel) => set({ selectedPersonnel: personnel }),
  
  checkDangerZones: () => {
    set((state) => {
      const updatedPersonnel = state.personnel.map((person) => ({
        ...person,
        inDangerZone: isInDangerZone(person.coords),
      }));
      return {
        personnel: updatedPersonnel,
        personnelInDanger: updatedPersonnel.filter(p => p.inDangerZone),
      };
    });
  },
}));

export const DANGER_ZONE = {
  center: DANGER_ZONE_CENTER,
  radius: DANGER_ZONE_RADIUS,
};
