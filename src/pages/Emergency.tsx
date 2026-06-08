import React from 'react';
import { EmergencyPanel } from '../components/UI/EmergencyPanel';
import { Scene3D } from '../components/Scene/Scene3D';
import useRealTimeData from '../hooks/useRealTimeData';

const Emergency: React.FC = () => {
  useRealTimeData();

  return (
    <div className="w-full h-full flex">
      <div className="flex-1">
        <Scene3D />
      </div>
      <div className="w-[480px] border-l border-polar-ice/20 bg-polar-deep/95">
        <EmergencyPanel />
      </div>
    </div>
  );
};

export default Emergency;
