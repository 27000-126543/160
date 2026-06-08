import React from 'react';
import { 
  Bell, 
  Thermometer, 
  Wind, 
  Eye, 
  Moon, 
  Sun,
  Zap,
  AlertTriangle,
  Lightbulb,
  Flame,
  SunDim,
  Fuel,
  Utensils,
  Pill
} from 'lucide-react';
import { useWeatherStore } from '../../store/weatherStore';
import { useSceneStore } from '../../store/sceneStore';
import { usePersonnelStore } from '../../store/personnelStore';
import { useMaterialStore } from '../../store/materialStore';

const TopBar: React.FC = () => {
  const { currentWeather } = useWeatherStore();
  const { isPolarNight, lightingIntensity, heatingPower, backupGeneratorActive } = useSceneStore();
  const { personnelInDanger } = usePersonnelStore();
  const { materials } = useMaterialStore();

  const currentTime = new Date().toLocaleString('zh-CN', {
    timeZone: 'Antarctica/Mawson',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const isExtremeCold = currentWeather.temperature < -50;
  const lightIntensityPercent = Math.round(currentWeather.lightIntensity * 100);

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'fuel': return <Fuel size={12} />;
      case 'food': return <Utensils size={12} />;
      case 'medicine': return <Pill size={12} />;
      default: return null;
    }
  };

  const getMaterialLabel = (type: string) => {
    switch (type) {
      case 'fuel': return '油料';
      case 'food': return '食品';
      case 'medicine': return '药品';
      default: return '物资';
    }
  };

  return (
    <div className="bg-polar-deep/90 backdrop-blur-md border-b border-polar-ice/20">
      <div className="h-16 flex items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            {isPolarNight ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-polar-ice/20 border border-polar-ice/40">
                <Moon className="w-5 h-5 text-polar-ice" />
                <span className="text-sm font-medium text-polar-ice">极夜模式</span>
                <span className="text-xs text-polar-ice/70">光照 {lightIntensityPercent}%</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-warning-orange/20 border border-warning-orange/40">
                <Sun className="w-5 h-5 text-warning-orange" />
                <span className="text-sm font-medium text-warning-orange">极昼模式</span>
                <span className="text-xs text-warning-orange/70">光照 {lightIntensityPercent}%</span>
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-polar-ice/20" />

          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
              isExtremeCold 
                ? 'bg-alert-red/20 border border-alert-red/50' 
                : 'bg-polar-ice/10'
            }`}>
              <Thermometer className={`w-4 h-4 ${isExtremeCold ? 'text-alert-red animate-pulse' : 'text-polar-ice'}`} />
              <span className={`text-sm font-mono font-semibold ${isExtremeCold ? 'text-alert-red' : 'text-polar-white'}`}>
                {currentWeather.temperature.toFixed(1)}°C
              </span>
              {isExtremeCold && (
                <span className="text-xs text-alert-red flex items-center gap-1">
                  <AlertTriangle size={12} className="animate-pulse" /> 
                  极寒预警
                </span>
              )}
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
            <div className={`flex items-center gap-2 px-2 py-1 rounded-lg ${
              isPolarNight ? 'bg-polar-ice/20' : 'bg-warning-orange/10'
            }`}>
              <Lightbulb className={`w-4 h-4 ${isPolarNight ? 'text-polar-ice' : 'text-warning-orange'} animate-pulse`} />
              <span className="text-xs text-polar-white/70">
                照明: {(lightingIntensity * 100).toFixed(0)}%
              </span>
            </div>
            <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-safety-green/10">
              <Flame className="w-4 h-4 text-safety-green animate-pulse" />
              <span className="text-xs text-polar-white/70">
                供暖: {(heatingPower * 100).toFixed(0)}%
              </span>
            </div>
            {backupGeneratorActive && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-alert-red/20 border border-alert-red/50 animate-pulse">
                <Zap className="w-4 h-4 text-alert-red" />
                <span className="text-xs font-semibold text-alert-red">备用发电机运行中 · 极寒供电</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-polar-white/60 font-mono">{currentTime}</span>
          
          <div className="relative">
            <button className="p-2 rounded-lg hover:bg-polar-ice/10 transition-colors relative">
              <Bell className="w-5 h-5 text-polar-white/80" />
              {(personnelInDanger.length > 0 || isExtremeCold || backupGeneratorActive) && (
                <span className="absolute top-1 right-1 w-3 h-3 bg-alert-red rounded-full animate-ping" />
              )}
              {(personnelInDanger.length > 0 || isExtremeCold || backupGeneratorActive) && (
                <span className="absolute top-1 right-1 w-3 h-3 bg-alert-red rounded-full" />
              )}
            </button>
            
            {(personnelInDanger.length > 0 || isExtremeCold || backupGeneratorActive) && (
              <div className="absolute top-full right-0 mt-2 w-72 bg-polar-deep/98 backdrop-blur-md border border-alert-red/30 rounded-lg p-3 shadow-xl z-50">
                <div className="text-sm font-medium text-alert-red mb-2 flex items-center gap-2">
                  <AlertTriangle size={14} />
                  活跃告警
                </div>
                <div className="space-y-2">
                  {personnelInDanger.length > 0 && (
                    <div className="text-xs text-alert-red flex items-center gap-2 p-2 bg-alert-red/10 rounded">
                      <Users size={12} />
                      {personnelInDanger.length} 名队员处于危险区域
                    </div>
                  )}
                  {isExtremeCold && (
                    <div className="text-xs text-alert-red flex items-center gap-2 p-2 bg-alert-red/10 rounded">
                      <Thermometer size={12} />
                      极寒天气，温度 {currentWeather.temperature.toFixed(1)}°C
                    </div>
                  )}
                  {backupGeneratorActive && (
                    <div className="text-xs text-warning-orange flex items-center gap-2 p-2 bg-warning-orange/10 rounded">
                      <Zap size={12} />
                      备用发电机已启动
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="h-9 border-t border-polar-ice/10 bg-polar-deep/50 flex items-center justify-center gap-8 px-6">
        <div className="text-xs text-polar-white/60 flex items-center gap-2">
          <span>物资状态：</span>
          {materials.map((material) => (
            <div 
              key={material.id}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded ${
                material.lowStockAlert 
                  ? 'bg-warning-orange/10 text-warning-orange' 
                  : 'bg-polar-ice/10 text-polar-white/80'
              }`}
            >
              {getMaterialIcon(material.type)}
              <span>{getMaterialLabel(material.type)}</span>
              <span className={`font-mono font-semibold ${
                material.lowStockAlert ? 'text-warning-orange' : 'text-polar-ice'
              }`}>
                {material.daysRemaining}天
              </span>
              {material.lowStockAlert && (
                <AlertTriangle size={10} className="text-warning-orange" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

function Users(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export default TopBar;
