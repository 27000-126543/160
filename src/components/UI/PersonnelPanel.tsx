import { useMemo } from 'react';
import { Users, Heart, Activity, AlertTriangle, MapPin, X } from 'lucide-react';
import { usePersonnelStore } from '../../store/personnelStore';
import { useSceneStore } from '../../store/sceneStore';

interface PersonnelPanelProps {
  onClose?: () => void;
}

export function PersonnelPanel({ onClose }: PersonnelPanelProps) {
  const personnel = usePersonnelStore(state => state.personnel);
  const selectedPersonnel = usePersonnelStore(state => state.selectedPersonnel);
  const selectPersonnel = usePersonnelStore(state => state.selectPersonnel);
  const setCameraTarget = useSceneStore(state => state.setCameraTarget);
  const emergencyActive = useSceneStore(state => state.emergencyActive);

  const dangerPersonnel = useMemo(() => {
    return personnel.filter(p => p.inDangerZone);
  }, [personnel]);

  const handleFocus = (person: any) => {
    setCameraTarget(person.coords);
    selectPersonnel(person);
  };

  const getHealthColor = (heartRate: number, bloodOxygen: number) => {
    if (heartRate > 90 || bloodOxygen < 95) return 'text-alert-red';
    if (heartRate > 80 || bloodOxygen < 97) return 'text-warning-orange';
    return 'text-safety-green';
  };

  return (
    <div className="w-80 glass-panel rounded-lg overflow-hidden">
      <div className="p-4 border-b border-polar-ice/20 flex items-center justify-between">
        <h3 className="font-display font-bold text-polar-ice flex items-center gap-2">
          <Users size={18} />
          人员监控
        </h3>
        <div className="flex items-center gap-3">
          <span className="text-sm text-polar-white/60">
            {personnel.length} 人
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-polar-ice/20 text-polar-white/60 hover:text-polar-white transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {dangerPersonnel.length > 0 && (
        <div className="bg-alert-red/20 border-b border-alert-red/30 p-3">
          <div className="flex items-center gap-2 text-alert-red">
            <AlertTriangle size={16} className="animate-pulse" />
            <span className="text-sm font-medium">
              {dangerPersonnel.length} 人进入危险区！
            </span>
          </div>
          <div className="mt-2 text-xs text-alert-red/80">
            {dangerPersonnel.map(p => p.name).join('、')}
          </div>
        </div>
      )}

      {emergencyActive && (
        <div className="bg-warning-orange/20 border-b border-warning-orange/30 p-3">
          <div className="flex items-center gap-2 text-warning-orange">
            <Activity size={16} className="animate-pulse" />
            <span className="text-sm font-medium">紧急疏散中...</span>
          </div>
        </div>
      )}

      <div className="max-h-96 overflow-y-auto p-2 space-y-2">
        {personnel.map((person) => (
          <div
            key={person.id}
            className={`p-3 rounded-lg cursor-pointer transition-all ${
              selectedPersonnel?.id === person.id
                ? 'bg-polar-ice/20 border border-polar-ice/50'
                : 'bg-polar-deep/50 hover:bg-polar-deep/70 border border-transparent'
            } ${person.inDangerZone ? 'alert-glow border-alert-red/50' : ''}`}
            onClick={() => handleFocus(person)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-polar-white">{person.name}</span>
                  {person.inDangerZone && (
                    <span className="text-xs bg-alert-red/30 text-alert-red px-2 py-0.5 rounded animate-blink">
                      危险
                    </span>
                  )}
                </div>
                <div className="text-xs text-polar-white/50 mt-1">{person.role}</div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleFocus(person);
                }}
                className="p-1.5 rounded bg-polar-ice/10 hover:bg-polar-ice/20 text-polar-ice transition-colors"
                title="定位"
              >
                <MapPin size={14} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3">
              <div className="flex items-center gap-2">
                <Heart 
                  size={14} 
                  className={getHealthColor(person.heartRate, person.bloodOxygen)} 
                />
                <span className={`text-sm font-mono ${getHealthColor(person.heartRate, person.bloodOxygen)}`}>
                  {person.heartRate} bpm
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Activity 
                  size={14} 
                  className={getHealthColor(person.heartRate, person.bloodOxygen)} 
                />
                <span className={`text-sm font-mono ${getHealthColor(person.heartRate, person.bloodOxygen)}`}>
                  {person.bloodOxygen}%
                </span>
              </div>
            </div>

            <div className="mt-2 h-1.5 bg-polar-deep rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${
                  person.heartRate > 90 ? 'bg-alert-red' : 'bg-safety-green'
                }`}
                style={{ width: `${Math.min(100, person.heartRate)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
