import React, { useState } from 'react';
import { Scene3D } from '../components/Scene/Scene3D';
import { BuildingDetail } from '../components/UI/BuildingDetail';
import { PersonnelPanel } from '../components/UI/PersonnelPanel';
import { EnvironmentTimeline } from '../components/UI/EnvironmentTimeline';
import { MaterialStatusPanel } from '../components/UI/MaterialStatusPanel';
import { useBuildingStore } from '../store/buildingStore';
import useRealTimeData from '../hooks/useRealTimeData';
import { BarChart3, X, Package } from 'lucide-react';

const Dashboard: React.FC = () => {
  useRealTimeData();
  const { selectedBuilding } = useBuildingStore();
  const [showPersonnelPanel, setShowPersonnelPanel] = useState(true);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showMaterialStatus, setShowMaterialStatus] = useState(false);

  return (
    <div className="w-full h-full relative overflow-hidden">
      <Scene3D />
      
      {selectedBuilding && (
        <div className="absolute top-4 right-4 w-96 z-10">
          <BuildingDetail />
        </div>
      )}

      {showPersonnelPanel && (
        <div className="absolute top-4 left-4 w-80 z-10">
          <PersonnelPanel onClose={() => setShowPersonnelPanel(false)} />
        </div>
      )}

      {showMaterialStatus && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-96 z-10">
          <MaterialStatusPanel onClose={() => setShowMaterialStatus(false)} />
        </div>
      )}

      {!showPersonnelPanel && (
        <button
          onClick={() => setShowPersonnelPanel(true)}
          className="absolute top-4 left-4 px-4 py-2 glass-panel rounded-lg text-polar-ice hover:bg-polar-ice/20 transition-colors z-10"
        >
          显示人员监控
        </button>
      )}

      {showTimeline && (
        <div className="absolute bottom-20 left-4 right-4 z-10">
          <div className="relative">
            <button
              onClick={() => setShowTimeline(false)}
              className="absolute top-2 right-2 p-1.5 bg-polar-deep/80 hover:bg-polar-deep rounded-lg text-polar-white/60 hover:text-polar-white transition-colors z-20"
            >
              <X size={16} />
            </button>
            <EnvironmentTimeline />
          </div>
        </div>
      )}

      {!showTimeline && (
        <button
          onClick={() => setShowTimeline(true)}
          className="absolute bottom-4 left-4 px-4 py-2 glass-panel rounded-lg text-polar-ice hover:bg-polar-ice/20 transition-colors z-10 flex items-center gap-2"
        >
          <BarChart3 size={16} />
          环境时间线
        </button>
      )}

      {!showMaterialStatus && (
        <button
          onClick={() => setShowMaterialStatus(true)}
          className="absolute bottom-4 left-44 px-4 py-2 glass-panel rounded-lg text-polar-ice hover:bg-polar-ice/20 transition-colors z-10 flex items-center gap-2"
        >
          <Package size={16} />
          物资保障态势
        </button>
      )}

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 glass-panel rounded-lg px-6 py-3 z-10">
        <p className="text-sm text-polar-white/70 text-center">
          鼠标左键拖拽旋转视角 · 滚轮缩放 · 点击建筑查看详情
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
