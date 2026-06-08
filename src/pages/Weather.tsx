import React from 'react';
import { WeatherPanel } from '../components/UI/WeatherPanel';
import useRealTimeData from '../hooks/useRealTimeData';

const Weather: React.FC = () => {
  useRealTimeData();

  return (
    <div className="w-full h-full">
      <WeatherPanel />
    </div>
  );
};

export default Weather;
