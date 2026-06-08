import React from 'react';
import { 
  Bell, 
  Thermometer, 
  Wind, 
  Eye, 
  Moon, 
  Sun,
  Zap
} from 'lucide-react';
import { useWeatherStore } from '../../store/weatherStore';
import { useSceneStore } from '../../store/sceneStore';
import { usePersonnelStore } from '../../store/personnelStore';

const TopBar: React.FC = () => {
  const { currentWeather } = useWeatherStore();
  const { isPolarNight, lightingIntensity, heatingPower, backupGeneratorActive } = useSceneStore();
  const { personnelInDanger } = usePersonnelStore();

  const currentTime = new Date().toLocaleString('zh-CN', {
    timeZone: 'Antarctica/Mawson',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return (
    <div className="h-16 bg-polar-deep/90 backdrop-blur-md border-b border-polar-ice/20 flex items-center justify-between px-6">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          {isPolarNight ? (
            <Moon className="w-5 h-5 text-polar-ice" />
          ) : (
            <Sun className="w-5 h-5 text-warning-orange" />
          )}
          <span className="text-sm text-polar-white/80">
            {isPolarNight ? '极夜模式' : '极昼模式'}
          </span>
        </div>

        <div className="h-6 w-px bg-polar-ice/20" />

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-polar-ice" />
            <span className="text-sm text-polar-white">
              {currentWeather.temperature.toFixed(1)}°C
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Wind className="w-4 h-4 text-polar-ice" />
            <span className="text-sm text-polar-white">
              {currentWeather.windSpeed.toFixed(1)} m/s
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-polar-ice" />
            <span className="text-sm text-polar-white">
              {currentWeather.visibility.toFixed(1)} km
            </span>
          </div>
        </div>

        <div className="h-6 w-px bg-polar-ice/20" />

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-polar-ice animate-pulse" />
            <span className="text-xs text-polar-white/70">
              照明: {(lightingIntensity * 100).toFixed(0)}%
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-safety-green animate-pulse" />
            <span className="text-xs text-polar-white/70">
              供暖: {(heatingPower * 100).toFixed(0)}%
            </span>
          </div>
          {backupGeneratorActive && (
            <div className="flex items-center gap-2 px-2 py-1 rounded bg-warning-orange/20">
              <Zap className="w-4 h-4 text-warning-orange animate-pulse" />
              <span className="text-xs text-warning-orange font-medium">备用发电机运行中</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-polar-white/60 font-mono">{currentTime}</span>
        
        <div className="relative">
          <button className="p-2 rounded-lg hover:bg-polar-ice/10 transition-colors relative">
            <Bell className="w-5 h-5 text-polar-white/80" />
            {(personnelInDanger.length > 0 || currentWeather.temperature < -50) && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-alert-red rounded-full animate-pulse" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
