import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { X, Thermometer, Droplets, Zap, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useBuildingStore } from '../../store/buildingStore';
import { useSceneStore } from '../../store/sceneStore';

export function BuildingDetail() {
  const selectedBuilding = useBuildingStore(state => state.selectedBuilding);
  const selectBuilding = useBuildingStore(state => state.selectBuilding);
  const getEnergyHistory = useBuildingStore(state => state.getEnergyHistory);
  const getFaultRecords = useBuildingStore(state => state.getFaultRecords);
  const backupGeneratorActive = useSceneStore(state => state.backupGeneratorActive);
  const setCameraTarget = useSceneStore(state => state.setCameraTarget);

  const energyHistory = useMemo(() => {
    if (!selectedBuilding) return [];
    return getEnergyHistory(selectedBuilding.id);
  }, [selectedBuilding, getEnergyHistory]);

  const faultRecords = useMemo(() => {
    if (!selectedBuilding) return [];
    return getFaultRecords(selectedBuilding.id);
  }, [selectedBuilding, getFaultRecords]);

  const energyChartOption = useMemo(() => {
    const data = energyHistory.map(d => ({
      time: d.timestamp.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      value: d.value,
    }));

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(10, 25, 41, 0.9)',
        borderColor: '#00D4FF',
        textStyle: { color: '#F0F8FF' },
        formatter: (params: any) => {
          const param = params[0];
          return `${param.name}<br/>能耗: <strong>${param.value}</strong> kW`;
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: data.map(d => d.time),
        axisLine: { lineStyle: { color: 'rgba(0, 212, 255, 0.3)' } },
        axisLabel: { color: '#F0F8FF', fontSize: 10 },
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: 'rgba(0, 212, 255, 0.3)' } },
        axisLabel: { color: '#F0F8FF', fontSize: 10 },
        splitLine: { lineStyle: { color: 'rgba(0, 212, 255, 0.1)' } },
      },
      series: [
        {
          name: '能耗',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          data: data.map(d => d.value),
          lineStyle: {
            color: '#00D4FF',
            width: 2,
            shadowColor: '#00D4FF',
            shadowBlur: 10,
          },
          itemStyle: {
            color: '#00D4FF',
            borderColor: '#F0F8FF',
            borderWidth: 2,
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(0, 212, 255, 0.4)' },
                { offset: 1, color: 'rgba(0, 212, 255, 0.0)' },
              ],
            },
          },
        },
      ],
    };
  }, [energyHistory]);

  if (!selectedBuilding) return null;

  const handleClose = () => {
    selectBuilding(null);
  };

  const handleFocus = () => {
    setCameraTarget(selectedBuilding.position);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'normal':
        return <span className="flex items-center gap-1 text-safety-green"><CheckCircle size={14} /> 正常</span>;
      case 'warning':
        return <span className="flex items-center gap-1 text-warning-orange"><AlertTriangle size={14} /> 警告</span>;
      case 'error':
        return <span className="flex items-center gap-1 text-alert-red"><X size={14} /> 故障</span>;
      default:
        return <span className="text-polar-white">未知</span>;
    }
  };

  const getFaultStatusBadge = (status: string) => {
    switch (status) {
      case 'resolved':
        return <span className="px-2 py-1 rounded text-xs bg-safety-green/20 text-safety-green">已解决</span>;
      case 'processing':
        return <span className="px-2 py-1 rounded text-xs bg-warning-orange/20 text-warning-orange">处理中</span>;
      case 'pending':
        return <span className="px-2 py-1 rounded text-xs bg-alert-red/20 text-alert-red">待处理</span>;
      default:
        return <span className="text-polar-white">{status}</span>;
    }
  };

  return (
    <div className="fixed top-20 right-4 w-96 glass-panel rounded-lg z-50 animate-in fade-in slide-in-from-right-5 duration-300">
      <div className="flex items-center justify-between p-4 border-b border-polar-ice/20">
        <div>
          <h3 className="text-lg font-display font-bold text-polar-ice glow-text">
            {selectedBuilding.name}
          </h3>
          <div className="text-sm text-polar-white/60 mt-1">
            {getStatusBadge(selectedBuilding.equipmentStatus)}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleFocus}
            className="p-2 rounded-lg bg-polar-ice/10 hover:bg-polar-ice/20 text-polar-ice transition-colors"
            title="聚焦建筑"
          >
            <Zap size={18} />
          </button>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg bg-alert-red/10 hover:bg-alert-red/20 text-alert-red transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-polar-deep/50 rounded-lg p-3 text-center">
            <Thermometer size={20} className="mx-auto mb-1 text-polar-ice" />
            <div className="text-xl font-bold text-polar-white">
              {selectedBuilding.temperature.toFixed(1)}°C
            </div>
            <div className="text-xs text-polar-white/50">温度</div>
          </div>
          <div className="bg-polar-deep/50 rounded-lg p-3 text-center">
            <Droplets size={20} className="mx-auto mb-1 text-polar-ice" />
            <div className="text-xl font-bold text-polar-white">
              {selectedBuilding.humidity.toFixed(0)}%
            </div>
            <div className="text-xs text-polar-white/50">湿度</div>
          </div>
          <div className="bg-polar-deep/50 rounded-lg p-3 text-center">
            <Zap size={20} className="mx-auto mb-1 text-polar-ice" />
            <div className="text-xl font-bold text-polar-white">
              {selectedBuilding.energyConsumption.toFixed(0)}
            </div>
            <div className="text-xs text-polar-white/50">能耗 kW</div>
          </div>
        </div>

        {backupGeneratorActive && selectedBuilding.type === 'power' && (
          <div className="bg-warning-orange/20 border border-warning-orange/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-warning-orange">
              <AlertTriangle size={16} />
              <span className="text-sm font-medium">备用发电机已启动</span>
            </div>
          </div>
        )}

        <div>
          <h4 className="text-sm font-medium text-polar-white mb-3 flex items-center gap-2">
            <Zap size={14} className="text-polar-ice" />
            近24小时能耗曲线
          </h4>
          <div className="h-48">
            <ReactECharts
              option={energyChartOption}
              style={{ height: '100%', width: '100%' }}
              opts={{ renderer: 'canvas' }}
            />
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-polar-white mb-3 flex items-center gap-2">
            <AlertTriangle size={14} className="text-warning-orange" />
            故障记录
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {faultRecords.length === 0 ? (
              <div className="text-center py-4 text-polar-white/50 text-sm">
                暂无故障记录
              </div>
            ) : (
              faultRecords.map((record) => (
                <div
                  key={record.id}
                  className="bg-polar-deep/50 rounded-lg p-3 border border-polar-ice/10"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-polar-white">{record.description}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-polar-white/50">
                        <Clock size={12} />
                        {record.timestamp.toLocaleString('zh-CN')}
                      </div>
                    </div>
                    {getFaultStatusBadge(record.status)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
