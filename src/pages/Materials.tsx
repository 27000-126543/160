import React from 'react';
import { MaterialPanel } from '../components/UI/MaterialPanel';
import useRealTimeData from '../hooks/useRealTimeData';

const Materials: React.FC = () => {
  useRealTimeData();

  return (
    <div className="w-full h-full">
      <MaterialPanel />
    </div>
  );
};

export default Materials;
