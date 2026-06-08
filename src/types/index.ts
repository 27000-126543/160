export type UserRole = 'operator' | 'leader' | 'headquarters';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  faceData: string;
  lastLogin: Date;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  login: (role: UserRole) => void;
  logout: () => void;
}

export type BuildingType = 'main' | 'weather' | 'drilling' | 'warehouse' | 'power' | 'helipad' | 'command';

export interface Building {
  id: string;
  name: string;
  type: BuildingType;
  temperature: number;
  humidity: number;
  energyConsumption: number;
  equipmentStatus: 'normal' | 'warning' | 'error';
  position: [number, number, number];
}

export interface EnergyDataPoint {
  timestamp: Date;
  value: number;
}

export interface FaultRecord {
  id: string;
  buildingId: string;
  timestamp: Date;
  description: string;
  status: 'resolved' | 'pending' | 'processing';
}

export interface BuildingState {
  buildings: Building[];
  selectedBuilding: Building | null;
  energyHistory: Record<string, EnergyDataPoint[]>;
  faultRecords: Record<string, FaultRecord[]>;
  updateBuildingData: () => void;
  selectBuilding: (building: Building | null) => void;
  getEnergyHistory: (buildingId: string) => EnergyDataPoint[];
  getFaultRecords: (buildingId: string) => FaultRecord[];
}

export interface Personnel {
  id: string;
  name: string;
  role: string;
  heartRate: number;
  bloodOxygen: number;
  inDangerZone: boolean;
  coords: [number, number, number];
}

export interface VitalSigns {
  id: string;
  personnelId: string;
  timestamp: Date;
  heartRate: number;
  bloodOxygen: number;
}

export interface PersonnelState {
  personnel: Personnel[];
  selectedPersonnel: Personnel | null;
  personnelInDanger: Personnel[];
  vitalSignsHistory: Record<string, VitalSigns[]>;
  updatePersonnelData: () => void;
  selectPersonnel: (personnel: Personnel | null) => void;
  checkDangerZones: () => void;
}

export interface Weather {
  id: string;
  timestamp: Date;
  temperature: number;
  windSpeed: number;
  visibility: number;
  isPolarNight: boolean;
  lightIntensity: number;
}

export interface WindowSchedule {
  id: string;
  startTime: Date;
  endTime: Date;
  durationHours: number;
  status: 'available' | 'insufficient' | 'cancelled';
  routePath: [number, number, number][];
}

export interface WeatherState {
  currentWeather: Weather;
  weatherForecast: Weather[];
  windowSchedules: WindowSchedule[];
  selectedSchedule: WindowSchedule | null;
  updateWeatherData: () => void;
  calculateWindows: () => void;
  selectSchedule: (schedule: WindowSchedule | null) => void;
}

export type MaterialType = 'fuel' | 'food' | 'medicine';

export interface Material {
  id: string;
  type: MaterialType;
  name: string;
  currentStock: number;
  dailyConsumption: number;
  daysRemaining: number;
  lowStockAlert: boolean;
  unit: string;
}

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface PurchaseRequest {
  id: string;
  materialId: string;
  materialName: string;
  quantity: number;
  unit: string;
  status: ApprovalStatus;
  createdAt: Date;
  approvals: Approval[];
}

export interface Approval {
  id: string;
  requestId: string;
  approverRole: UserRole;
  status: ApprovalStatus;
  approvedAt: Date | null;
  comment: string;
}

export interface MaterialState {
  materials: Material[];
  lowStockMaterials: Material[];
  pendingRequests: PurchaseRequest[];
  purchaseRequests: PurchaseRequest[];
  selectedRequest: PurchaseRequest | null;
  updateMaterialData: () => void;
  createPurchaseRequest: (materialId: string, quantity: number) => void;
  approveRequest: (requestId: string, role: UserRole, comment: string) => void;
  rejectRequest: (requestId: string, role: UserRole, comment: string) => void;
  selectRequest: (request: PurchaseRequest | null) => void;
}

export type EmergencyType = 'blizzard' | 'avalanche' | 'equipment_failure' | 'medical';
export type EmergencyStatus = 'active' | 'resolved' | 'standby';

export interface Emergency {
  id: string;
  type: EmergencyType;
  name: string;
  status: EmergencyStatus;
  level: 'low' | 'medium' | 'high' | 'critical';
  createdAt: Date;
  description: string;
}

export interface EscapeRoute {
  id: string;
  name: string;
  path: [number, number, number][];
  color: string;
  isActive: boolean;
}

export interface SceneState {
  isPolarNight: boolean;
  lightingIntensity: number;
  heatingPower: number;
  backupGeneratorActive: boolean;
  emergencyActive: boolean;
  currentEmergency: Emergency | null;
  activeEmergencies: Emergency[];
  escapeRoutes: EscapeRoute[];
  helicopterRoute: [number, number, number][] | null;
  cameraTarget: [number, number, number];
  togglePolarNight: () => void;
  updateEnvironmentalControls: () => void;
  triggerEmergency: (type: EmergencyType) => void;
  resolveEmergency: () => void;
  setCameraTarget: (target: [number, number, number]) => void;
  toggleEscapeRoutes: (active: boolean) => void;
}

export interface DailyReport {
  date: string;
  buildingEnergy: {
    buildingName: string;
    totalEnergy: number;
    peakEnergy: number;
    avgTemperature: number;
  }[];
  taskCompletion: {
    taskName: string;
    planned: number;
    completed: number;
    rate: number;
  }[];
  safetyEvents: {
    time: string;
    type: string;
    description: string;
    status: string;
  }[];
  personnelStats: {
    totalPersonnel: number;
    avgHeartRate: number;
    avgBloodOxygen: number;
    dangerZoneIncidents: number;
  };
  materialStats: {
    type: string;
    daysRemaining: number;
    stockStatus: string;
  }[];
  weatherStats: {
    avgTemperature: number;
    maxWindSpeed: number;
    minVisibility: number;
    operationWindowHours: number;
  };
}
