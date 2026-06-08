import React from 'react';
import { Users, Building2, AlertTriangle, Package, CheckCircle, XCircle } from 'lucide-react';
import { useBuildingStore } from '../../store/buildingStore';
import { usePersonnelStore } from '../../store/personnelStore';
import { useMaterialStore } from '../../store/materialStore';
import { useSceneStore } from '../../store/sceneStore';

const StatusBar: React.FC = () => {
  const { buildings } = useBuildingStore();
  const { personnel, personnelInDanger } = usePersonnelStore();
  const { lowStockMaterials, pendingRequests } = useMaterialStore();
  const { activeEmergencies } = useSceneStore();

  const normalBuildings = buildings.filter(b => b.equipmentStatus === 'normal').length;
  const warningBuildings = buildings.filter(b => b.equipmentStatus === 'warning').length;
  const errorBuildings = buildings.filter(b => b.equipmentStatus === 'error').length;

  const healthyPersonnel = personnel.filter(p => 
    p.heartRate >= 60 && p.heartRate <= 90 && p.bloodOxygen >= 95
  ).length;

  return (
    <div className="h-10 bg-polar-deep/90 backdrop-blur-md border-t border-polar-ice/20 flex items-center justify-between px-6">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-polar-ice" />
          <span className="text-xs text-polar-white/70">建筑状态:</span>
          <div className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-safety-green" />
            <span className="text-xs text-safety-green">{normalBuildings}</span>
          </div>
          {warningBuildings > 0 && (
            <div className="flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-warning-orange" />
              <span className="text-xs text-warning-orange">{warningBuildings}</span>
            </div>
          )}
          {errorBuildings > 0 && (
            <div className="flex items-center gap-1">
              <XCircle className="w-3 h-3 text-alert-red" />
              <span className="text-xs text-alert-red">{errorBuildings}</span>
            </div>
          )}
        </div>

        <div className="h-4 w-px bg-polar-ice/20" />

        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-polar-ice" />
          <span className="text-xs text-polar-white/70">人员状态:</span>
          <span className="text-xs text-safety-green">{healthyPersonnel}/{personnel.length} 健康</span>
          {personnelInDanger.length > 0 && (
            <span className="text-xs text-alert-red animate-pulse">
              {personnelInDanger.length} 人在危险区!
            </span>
          )}
        </div>

        <div className="h-4 w-px bg-polar-ice/20" />

        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-polar-ice" />
          <span className="text-xs text-polar-white/70">物资状态:</span>
          {lowStockMaterials.length > 0 ? (
            <span className="text-xs text-warning-orange animate-pulse">
              {lowStockMaterials.length} 种库存不足
            </span>
          ) : (
            <span className="text-xs text-safety-green">库存充足</span>
          )}
          {pendingRequests.length > 0 && (
            <span className="text-xs text-polar-ice">
              ({pendingRequests.length} 待审批)
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {activeEmergencies.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-1 rounded bg-alert-red/20 animate-pulse">
            <AlertTriangle className="w-4 h-4 text-alert-red" />
            <span className="text-xs text-alert-red font-medium">
              {activeEmergencies.length} 个应急事件进行中
            </span>
          </div>
        )}
        <span className="text-xs text-polar-white/50">
          系统运行正常 · v1.0.0
        </span>
      </div>
    </div>
  );
};

export default StatusBar;
