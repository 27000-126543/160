import { create } from 'zustand';
import { AuthState, User, UserRole } from '../types';

export type { UserRole };

const mockUsers: Record<UserRole, User> = {
  operator: {
    id: '1',
    name: '张操作员',
    role: 'operator',
    faceData: 'face_data_001',
    lastLogin: new Date(),
  },
  leader: {
    id: '2',
    name: '李队长',
    role: 'leader',
    faceData: 'face_data_002',
    lastLogin: new Date(),
  },
  headquarters: {
    id: '3',
    name: '王总指挥',
    role: 'headquarters',
    faceData: 'face_data_003',
    lastLogin: new Date(),
  },
};

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  login: (role: UserRole) => {
    const user = { ...mockUsers[role], lastLogin: new Date() };
    set({ isAuthenticated: true, user });
  },
  logout: () => {
    set({ isAuthenticated: false, user: null });
  },
}));
