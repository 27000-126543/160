import { create } from 'zustand';
import { Material, MaterialState, MaterialType, PurchaseRequest, Approval, ApprovalStatus, UserRole } from '../types';

const initialMaterials: Material[] = [
  {
    id: 'fuel',
    type: 'fuel',
    name: '航空煤油',
    currentStock: 85000,
    dailyConsumption: 1000,
    daysRemaining: 85,
    lowStockAlert: true,
    unit: 'L',
  },
  {
    id: 'food',
    type: 'food',
    name: '食品储备',
    currentStock: 12000,
    dailyConsumption: 120,
    daysRemaining: 100,
    lowStockAlert: false,
    unit: 'kg',
  },
  {
    id: 'medicine',
    type: 'medicine',
    name: '医疗物资',
    currentStock: 500,
    dailyConsumption: 2,
    daysRemaining: 250,
    lowStockAlert: false,
    unit: '箱',
  },
];

const generateInitialRequests = (): PurchaseRequest[] => {
  const now = new Date();
  
  return [
    {
      id: 'req-001',
      materialId: 'fuel',
      materialName: '航空煤油',
      quantity: 50000,
      unit: 'L',
      status: 'pending',
      createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      approvals: [
        {
          id: 'app-001-1',
          requestId: 'req-001',
          approverRole: 'leader',
          status: 'pending',
          approvedAt: null,
          comment: '',
        },
        {
          id: 'app-001-2',
          requestId: 'req-001',
          approverRole: 'headquarters',
          status: 'pending',
          approvedAt: null,
          comment: '',
        },
      ],
    },
  ];
};

export const useMaterialStore = create<MaterialState>((set, get) => ({
  materials: initialMaterials,
  lowStockMaterials: initialMaterials.filter(m => m.lowStockAlert),
  pendingRequests: generateInitialRequests().filter(r => r.status === 'pending'),
  purchaseRequests: generateInitialRequests(),
  selectedRequest: null,
  
  updateMaterialData: () => {
    set((state) => {
      const updatedMaterials = state.materials.map((material) => {
        const consumption = material.dailyConsumption * (0.95 + Math.random() * 0.1);
        const newStock = Math.max(0, material.currentStock - consumption / 24 / 60);
        const daysRemaining = Math.floor(newStock / material.dailyConsumption);
        
        return {
          ...material,
          currentStock: Math.round(newStock * 10) / 10,
          daysRemaining,
          lowStockAlert: daysRemaining < 90,
        };
      });

      return {
        materials: updatedMaterials,
        lowStockMaterials: updatedMaterials.filter(m => m.lowStockAlert),
        pendingRequests: state.purchaseRequests.filter(r => r.status === 'pending'),
      };
    });
  },
  
  createPurchaseRequest: (materialId: string, quantity: number) => {
    const state = get();
    const material = state.materials.find(m => m.id === materialId);
    
    if (!material) return;
    
    const newRequest: PurchaseRequest = {
      id: `req-${Date.now()}`,
      materialId,
      materialName: material.name,
      quantity,
      unit: material.unit,
      status: 'pending',
      createdAt: new Date(),
      approvals: [
        {
          id: `app-${Date.now()}-1`,
          requestId: `req-${Date.now()}`,
          approverRole: 'leader',
          status: 'pending',
          approvedAt: null,
          comment: '',
        },
        {
          id: `app-${Date.now()}-2`,
          requestId: `req-${Date.now()}`,
          approverRole: 'headquarters',
          status: 'pending',
          approvedAt: null,
          comment: '',
        },
      ],
    };
    
    set((state) => ({
      purchaseRequests: [...state.purchaseRequests, newRequest],
    }));
  },
  
  approveRequest: (requestId: string, role: UserRole, comment: string) => {
    set((state) => {
      const updatedRequests = state.purchaseRequests.map((request) => {
        if (request.id !== requestId) return request;
        
        const updatedApprovals = request.approvals.map((approval) => {
          if (approval.approverRole !== role) return approval;
          return {
            ...approval,
            status: 'approved' as const,
            approvedAt: new Date(),
            comment,
          };
        });
        
        const allApproved = updatedApprovals.every(a => a.status === 'approved');
        
        return {
          ...request,
          approvals: updatedApprovals,
          status: (allApproved ? 'approved' : 'pending') as ApprovalStatus,
        };
      });
      
      return { purchaseRequests: updatedRequests };
    });
  },
  
  rejectRequest: (requestId: string, role: UserRole, comment: string) => {
    set((state) => {
      const updatedRequests = state.purchaseRequests.map((request) => {
        if (request.id !== requestId) return request;
        
        const updatedApprovals = request.approvals.map((approval) => {
          if (approval.approverRole !== role) return approval;
          return {
            ...approval,
            status: 'rejected' as const,
            approvedAt: new Date(),
            comment,
          };
        });
        
        return {
          ...request,
          approvals: updatedApprovals,
          status: 'rejected' as ApprovalStatus,
        };
      });
      
      return { purchaseRequests: updatedRequests };
    });
  },
  
  selectRequest: (request) => set({ selectedRequest: request }),
}));
