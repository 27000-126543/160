import { useState } from 'react';
import { AlertTriangle, Snowflake, Mountain, Wrench, Heart, Siren, CheckCircle, X, MapPin, Shield } from 'lucide-react';
import { useSceneStore } from '../../store/sceneStore';
import { useAuthStore } from '../../store/authStore';
import { EmergencyType } from '../../types';

export function EmergencyPanel() {
  const emergencyActive = useSceneStore(state => state.emergencyActive);
  const currentEmergency = useSceneStore(state => state.currentEmergency);
  const triggerEmergency = useSceneStore(state => state.triggerEmergency);
  const resolveEmergency = useSceneStore(state => state.resolveEmergency);
  const toggleEscapeRoutes = useSceneStore(state => state.toggleEscapeRoutes);
  const escapeRoutes = useSceneStore(state => state.escapeRoutes);
  const user = useAuthStore(state => state.user);
  const [confirmTrigger, setConfirmTrigger] = useState(false);
  const [selectedType, setSelectedType] = useState<EmergencyType | null>(null);

  const emergencyTypes: { type: EmergencyType; name: string; icon: any; color: string; description: string }[] = [
    { type: 'blizzard', name: '暴雪预警', icon: Snowflake, color: 'text-polar-ice', description: '强暴风雪即将来临' },
    { type: 'avalanche', name: '冰崩预警', icon: Mountain, color: 'text-alert-red', description: '监测到冰裂活动' },
    { type: 'equipment_failure', name: '设备故障', icon: Wrench, color: 'text-warning-orange', description: '关键设备故障' },
    { type: 'medical', name: '医疗紧急事件', icon: Heart, color: 'text-alert-red', description: '队员需要紧急医疗' },
  ];

  const handleTriggerEmergency = (type: EmergencyType) => {
    if (user?.role === 'operator') {
      alert('您没有权限启动应急响应，请联系队长或总部');
      return;
    }
    setSelectedType(type);
    setConfirmTrigger(true);
  };

  const confirmAndTrigger = () => {
    if (selectedType) {
      triggerEmergency(selectedType);
      toggleEscapeRoutes(true);
    }
    setConfirmTrigger(false);
    setSelectedType(null);
  };

  const handleResolve = () => {
    resolveEmergency();
    toggleEscapeRoutes(false);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-safety-green/20 text-safety-green';
      case 'medium': return 'bg-warning-orange/20 text-warning-orange';
      case 'high': return 'bg-alert-red/20 text-alert-red';
      case 'critical': return 'bg-alert-red text-white animate-pulse';
      default: return 'bg-polar-ice/20 text-polar-ice';
    }
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case 'low': return '低级';
      case 'medium': return '中级';
      case 'high': return '高级';
      case 'critical': return '危急';
      default: return '未知';
    }
  };

  const activeRoutes = escapeRoutes.filter(r => r.isActive);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="glass-panel rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-display font-bold text-polar-ice glow-text flex items-center gap-2">
            <Siren size={24} />
            应急指挥中心
          </h2>
          {emergencyActive && (
            <div className="px-4 py-2 bg-alert-red rounded-full text-white animate-pulse flex items-center gap-2">
              <AlertTriangle size={16} />
              应急响应中
            </div>
          )}
        </div>

        {emergencyActive && currentEmergency && (
          <div className="mb-6 bg-alert-red/10 border border-alert-red/30 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${getLevelColor(currentEmergency.level)}`}>
                  {(() => {
                    const emergencyConfig = emergencyTypes.find(e => e.type === currentEmergency.type);
                    const Icon = emergencyConfig?.icon || AlertTriangle;
                    return <Icon size={24} />;
                  })()}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-polar-white">{currentEmergency.name}</h3>
                    <span className={`px-2 py-0.5 rounded text-xs ${getLevelColor(currentEmergency.level)}`}>
                      {getLevelText(currentEmergency.level)}
                    </span>
                  </div>
                  <p className="text-polar-white/70 mt-1">{currentEmergency.description}</p>
                  <p className="text-sm text-polar-white/50 mt-2">
                    触发时间: {currentEmergency.createdAt.toLocaleString('zh-CN')}
                  </p>
                </div>
              </div>
              {user?.role !== 'operator' && (
                <button
                  onClick={handleResolve}
                  className="px-4 py-2 bg-safety-green/20 hover:bg-safety-green/30 text-safety-green rounded-lg transition-colors flex items-center gap-2"
                >
                  <CheckCircle size={18} />
                  解除应急
                </button>
              )}
            </div>

            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="bg-polar-deep/50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm text-polar-white/60 mb-1">
                  <MapPin size={14} />
                  逃生路线
                </div>
                <div className="text-2xl font-bold text-safety-green">
                  {activeRoutes.length} 条
                </div>
                <div className="text-xs text-safety-green/70">已激活</div>
              </div>
              <div className="bg-polar-deep/50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm text-polar-white/60 mb-1">
                  <Shield size={14} />
                  避难舱
                </div>
                <div className="text-2xl font-bold text-polar-ice">
                  指挥中心
                </div>
                <div className="text-xs text-polar-ice/70">集合点</div>
              </div>
              <div className="bg-polar-deep/50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm text-polar-white/60 mb-1">
                  <Siren size={14} />
                  直升机
                </div>
                <div className="text-2xl font-bold text-polar-ice">
                  备飞中
                </div>
                <div className="text-xs text-polar-ice/70">救援待命</div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-safety-green/10 border border-safety-green/30 rounded-lg">
              <div className="flex items-center gap-2 text-safety-green">
                <CheckCircle size={16} />
                <span className="text-sm font-medium">
                  疏散指令已发送至所有队员，请立即前往指挥中心避难舱集合
                </span>
              </div>
            </div>
          </div>
        )}

        {!emergencyActive && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-polar-white mb-4 flex items-center gap-2">
              <AlertTriangle size={14} className="text-warning-orange" />
              启动应急响应
            </h3>
            <div className="grid grid-cols-4 gap-4">
              {emergencyTypes.map((emergency) => {
                const Icon = emergency.icon;
                return (
                  <button
                    key={emergency.type}
                    onClick={() => handleTriggerEmergency(emergency.type)}
                    className="bg-polar-deep/50 hover:bg-polar-deep/70 border border-polar-ice/10 hover:border-polar-ice/30 rounded-lg p-4 transition-all text-left group"
                    disabled={user?.role === 'operator'}
                  >
                    <div className={`p-3 rounded-lg ${emergency.color} bg-opacity-20 mb-3 w-fit group-hover:scale-110 transition-transform`}>
                      <Icon size={24} />
                    </div>
                    <div className="font-medium text-polar-white">{emergency.name}</div>
                    <div className="text-xs text-polar-white/50 mt-1">{emergency.description}</div>
                    {user?.role === 'operator' && (
                      <div className="text-xs text-warning-orange mt-2">无权限操作</div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div>
          <h3 className="text-sm font-medium text-polar-white mb-4 flex items-center gap-2">
            <MapPin size={14} className="text-safety-green" />
            逃生路线
          </h3>
          <div className="space-y-2">
            {escapeRoutes.map((route) => (
              <div
                key={route.id}
                className={`p-4 rounded-lg border transition-all ${
                  route.isActive
                    ? 'bg-safety-green/10 border-safety-green/30'
                    : 'bg-polar-deep/50 border-polar-ice/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: route.color }}
                    />
                    <span className="font-medium text-polar-white">{route.name}</span>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    route.isActive
                      ? 'bg-safety-green/20 text-safety-green'
                      : 'bg-polar-white/10 text-polar-white/50'
                  }`}>
                    {route.isActive ? '已激活' : '待命'}
                  </span>
                </div>
                <div className="mt-2 text-xs text-polar-white/50">
                  路径点: {route.path.length} 个 | 终点: 指挥中心避难舱
                </div>
              </div>
            ))}
          </div>
        </div>

        {confirmTrigger && selectedType && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="glass-panel rounded-lg p-6 w-96 max-w-[90vw]">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 rounded-lg bg-alert-red/20 text-alert-red">
                  <AlertTriangle size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-polar-white mb-1">
                    确认启动应急响应
                  </h3>
                  <p className="text-polar-white/70 text-sm">
                    即将启动 "{emergencyTypes.find(e => e.type === selectedType)?.name}" 应急响应，
                    这将触发全员疏散、显示逃生路线、直升机备飞。
                  </p>
                </div>
              </div>
              <div className="bg-warning-orange/10 border border-warning-orange/30 rounded-lg p-3 mb-6">
                <p className="text-sm text-warning-orange flex items-center gap-2">
                  <AlertTriangle size={14} />
                  此操作将向所有队员发送紧急疏散指令！
                </p>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setConfirmTrigger(false);
                    setSelectedType(null);
                  }}
                  className="px-4 py-2 bg-polar-white/10 hover:bg-polar-white/20 text-polar-white rounded-lg transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={confirmAndTrigger}
                  className="px-4 py-2 bg-alert-red hover:bg-alert-red/80 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <Siren size={18} />
                  确认启动
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
