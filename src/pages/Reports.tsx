import React from 'react';
import ExportPanel from '../components/UI/ExportPanel';
import useRealTimeData from '../hooks/useRealTimeData';

const Reports: React.FC = () => {
  useRealTimeData();

  return (
    <div className="w-full h-full">
      <ExportPanel />
    </div>
  );
};

export default Reports;
