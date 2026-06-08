import React, { useState } from 'react';
import { Scene3D } from '../components/Scene/Scene3D';
import { BuildingDetail } from '../components/UI/BuildingDetail';
import { PersonnelPanel } from '../components/UI/PersonnelPanel';
import { useBuildingStore } from '../store/buildingStore';
import useRealTimeData from '../hooks/useRealTimeData';

const Dashboard: React.FC = () => {
  useRealTimeData();
  const { selectedBuilding } = useBuildingStore();
  const [showPersonnelPanel, setShowPersonnelPanel] = useState(true);

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

      {!showPersonnelPanel && (
        <button
          onClick={() => setShowPersonnelPanel(true)}
          className="absolute top-4 left-4 px-4 py-2 glass-panel rounded-lg text-polar-ice hover:bg-polar-ice/20 transition-colors z-10"
        >
          显示人员监控
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
