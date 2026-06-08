import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { Cloud, Wind, Eye, ThermometerSun, Calendar, Map, AlertTriangle, CheckCircle, Zap, Flame, Lightbulb, Moon, Sun } from 'lucide-react';
import { useWeatherStore } from '../../store/weatherStore';
import { useSceneStore } from '../../store/sceneStore';
import { EnvironmentTimeline } from './EnvironmentTimeline';

export function WeatherPanel() {
  const currentWeather = useWeatherStore(state => state.currentWeather);
  const weatherForecast = useWeatherStore(state => state.weatherForecast);
  const windowSchedules = useWeatherStore(state => state.windowSchedules);
  const selectedSchedule = useWeatherStore(state => state.selectedSchedule);
  const selectSchedule = useWeatherStore(state => state.selectSchedule);
  const isPolarNight = useSceneStore(state => state.isPolarNight);
  const backupGeneratorActive = useSceneStore(state => state.backupGeneratorActive);
  const lightingIntensity = useSceneStore(state => state.lightingIntensity);
  const heatingPower = useSceneStore(state => state.heatingPower);

  const availableWindows = useMemo(() => {
    return windowSchedules.filter(w => w.status === 'available');
  }, [windowSchedules]);

  const forecastChartOption = useMemo(() => {
    const tempData = weatherForecast.map(w => ({
      time: w.timestamp.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      temp: w.temperature,
      wind: w.windSpeed,
      visibility: w.visibility,
    }));

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(10, 25, 41, 0.9)',
        borderColor: '#00D4FF',
        textStyle: { color: '#F0F8FF' },
      },
      legend: {
        data: ['温度', '风速', '能见度'],
        textStyle: { color: '#F0F8FF', fontSize: 10 },
        top: 0,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '15%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: tempData.map(d => d.time),
        axisLine: { lineStyle: { color: 'rgba(0, 212, 255, 0.3)' } },
        axisLabel: { color: '#F0F8FF', fontSize: 9, rotate: 45 },
      },
      yAxis: [
        {
          type: 'value',
          name: '温度(°C)',
          position: 'left',
          axisLine: { lineStyle: { color: '#FFA502' } },
          axisLabel: { color: '#FFA502', fontSize: 9 },
          splitLine: { lineStyle: { color: 'rgba(0, 212, 255, 0.1)' } },
        },
        {
          type: 'value',
          name: '风速(m/s)/能见度(km)',
          position: 'right',
          axisLine: { lineStyle: { color: '#00D4FF' } },
          axisLabel: { color: '#00D4FF', fontSize: 9 },
        },
      ],
      series: [
        {
          name: '温度',
          type: 'line',
          smooth: true,
          data: tempData.map(d => d.temp),
          lineStyle: { color: '#FFA502', width: 2 },
          itemStyle: { color: '#FFA502' },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(255, 165, 2, 0.3)' },
                { offset: 1, color: 'rgba(255, 165, 2, 0)' },
              ],
            },
          },
        },
        {
          name: '风速',
          type: 'bar',
          yAxisIndex: 1,
          data: tempData.map(d => d.wind),
          itemStyle: { color: '#00D4FF' },
          barWidth: 6,
        },
        {
          name: '能见度',
          type: 'line',
          yAxisIndex: 1,
          smooth: true,
          data: tempData.map(d => d.visibility),
          lineStyle: { color: '#2ED573', width: 2, type: 'dashed' },
          itemStyle: { color: '#2ED573' },
        },
      ],
    };
  }, [weatherForecast]);

  const handleSelectWindow = (schedule: any) => {
    if (selectedSchedule?.id === schedule.id) {
      selectSchedule(null);
    } else {
      selectSchedule(schedule);
    }
  };

  const isExtremeCold = currentWeather.temperature < -50;
  const lightIntensityPercent = Math.round(currentWeather.lightIntensity * 100);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 overflow-auto">
      <div className="glass-panel rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-display font-bold text-polar-ice glow-text">
            气象调度中心
          </h2>
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 ${
              isPolarNight 
                ? 'bg-polar-ice/20 border border-polar-ice/40 text-polar-ice' 
                : 'bg-warning-orange/20 border border-warning-orange/40 text-warning-orange'
            }`}>
              {isPolarNight ? <Moon size={16} /> : <Sun size={16} />}
              {isPolarNight ? '极夜模式' : '极昼模式'}
              <span className="opacity-70">光照 {lightIntensityPercent}%</span>
            </div>
          </div>
        </div>

        {isExtremeCold && (
          <div className="mb-6 p-4 bg-alert-red/10 border-2 border-alert-red/50 rounded-lg animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle size={24} className="text-alert-red" />
                <div>
                  <div className="text-lg font-bold text-alert-red">极寒红色预警</div>
                  <div className="text-sm text-alert-red/80">
                    当前温度 {currentWeather.temperature.toFixed(1)}°C，已低于-50°C阈值
                  </div>
                </div>
              </div>
              {backupGeneratorActive && (
                <div className="flex items-center gap-2 px-4 py-2 bg-alert-red/20 rounded-lg">
                  <Zap size={20} className="text-alert-red" />
                  <span className="text-sm font-semibold text-alert-red">备用发电机已启动</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-polar-deep/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <ThermometerSun size={18} className={isExtremeCold ? 'text-alert-red' : 'text-warning-orange'} />
              <span className="text-sm text-polar-white/60">室外温度</span>
            </div>
            <div className={`text-3xl font-bold font-mono ${
              isExtremeCold ? 'text-alert-red' : 'text-polar-white'
            }`}>
              {currentWeather.temperature.toFixed(1)}°C
            </div>
            {isExtremeCold && (
              <div className="text-xs text-alert-red mt-1 flex items-center gap-1">
                <AlertTriangle size={12} /> 极寒天气，请注意防冻
              </div>
            )}
          </div>

          <div className="bg-polar-deep/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wind size={18} className="text-polar-ice" />
              <span className="text-sm text-polar-white/60">风速</span>
            </div>
            <div className={`text-3xl font-bold font-mono ${
              currentWeather.windSpeed > 15 ? 'text-warning-orange' : 'text-polar-white'
            }`}>
              {currentWeather.windSpeed.toFixed(1)} m/s
            </div>
          </div>

          <div className="bg-polar-deep/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Eye size={18} className="text-safety-green" />
              <span className="text-sm text-polar-white/60">能见度</span>
            </div>
            <div className={`text-3xl font-bold font-mono ${
              currentWeather.visibility < 1 ? 'text-alert-red' : 'text-polar-white'
            }`}>
              {currentWeather.visibility.toFixed(1)} km
            </div>
          </div>

          <div className="bg-polar-deep/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Cloud size={18} className="text-polar-white" />
              <span className="text-sm text-polar-white/60">可用窗口</span>
            </div>
            <div className="text-3xl font-bold font-mono text-polar-ice">
              {availableWindows.length}
            </div>
            <div className="text-xs text-polar-white/50 mt-1">
              共 {windowSchedules.length} 个预报
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-polar-deep/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb size={18} className={isPolarNight ? 'text-polar-ice' : 'text-warning-orange'} />
              <span className="text-sm text-polar-white/60">室内照明</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-3 bg-polar-deep rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${isPolarNight ? 'bg-polar-ice' : 'bg-warning-orange'}`}
                  style={{ width: `${lightingIntensity * 100}%` }}
                />
              </div>
              <span className="text-lg font-bold font-mono text-polar-white">
                {(lightingIntensity * 100).toFixed(0)}%
              </span>
            </div>
            <div className="text-xs text-polar-white/50 mt-2">
              {isPolarNight ? '极夜模式增强照明' : '正常照明模式'} · 色温 {isPolarNight ? '3000K 暖光' : '5500K 自然光'}
            </div>
          </div>

          <div className="bg-polar-deep/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Flame size={18} className="text-safety-green" />
              <span className="text-sm text-polar-white/60">供暖功率</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-3 bg-polar-deep rounded-full overflow-hidden">
                <div 
                  className="h-full bg-safety-green transition-all duration-500"
                  style={{ width: `${heatingPower * 100}%` }}
                />
              </div>
              <span className="text-lg font-bold font-mono text-polar-white">
                {(heatingPower * 100).toFixed(0)}%
              </span>
            </div>
            <div className="text-xs text-polar-white/50 mt-2">
              {isExtremeCold ? '极寒模式最大功率供暖' : isPolarNight ? '极夜增强供暖' : '正常供暖'}
            </div>
          </div>
        </div>

        {backupGeneratorActive && (
          <div className="mb-6 p-4 bg-warning-orange/10 border border-warning-orange/40 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-warning-orange/20 flex items-center justify-center">
                <Zap size={24} className="text-warning-orange animate-pulse" />
              </div>
              <div>
                <div className="font-semibold text-warning-orange">备用发电机运行中</div>
                <div className="text-sm text-warning-orange/70">
                  极寒天气主供电系统负载过高，备用发电机已自动启动保障供电安全
                </div>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-warning-orange animate-ping" />
                <div className="w-2 h-2 rounded-full bg-warning-orange" />
                <span className="text-xs text-warning-orange">运行中</span>
              </div>
            </div>
          </div>
        )}

        <div className="mb-6">
          <h3 className="text-sm font-medium text-polar-white mb-3 flex items-center gap-2">
            <Cloud size={14} className="text-polar-ice" />
            24小时气象预报
          </h3>
          <div className="h-64">
            <ReactECharts
              option={forecastChartOption}
              style={{ height: '100%', width: '100%' }}
              opts={{ renderer: 'canvas' }}
            />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-polar-white mb-3 flex items-center gap-2">
            <Calendar size={14} className="text-polar-ice" />
            野外作业窗口
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {windowSchedules.length === 0 ? (
              <div className="text-center py-8 text-polar-white/50">
                暂无作业窗口
              </div>
            ) : (
              windowSchedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className={`p-4 rounded-lg cursor-pointer transition-all ${
                    selectedSchedule?.id === schedule.id
                      ? 'bg-polar-ice/20 border border-polar-ice/50'
                      : 'bg-polar-deep/50 hover:bg-polar-deep/70 border border-transparent'
                  } ${schedule.status === 'insufficient' ? 'opacity-60' : ''}`}
                  onClick={() => handleSelectWindow(schedule)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-polar-white">
                          {schedule.startTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                          {' - '}
                          {schedule.endTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {schedule.status === 'available' ? (
                          <span className="px-2 py-0.5 rounded text-xs bg-safety-green/20 text-safety-green flex items-center gap-1">
                            <CheckCircle size={10} /> 可用
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-xs bg-alert-red/20 text-alert-red flex items-center gap-1">
                            <AlertTriangle size={10} /> 不足3小时
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-polar-white/50 mt-1">
                        持续时间: {schedule.durationHours.toFixed(1)} 小时
                      </div>
                    </div>
                    {selectedSchedule?.id === schedule.id && (
                      <Map size={18} className="text-polar-ice" />
                    )}
                  </div>
                  {schedule.status === 'insufficient' && (
                    <div className="mt-2 text-xs text-alert-red">
                      ⚠️ 作业窗口不足3小时，任务已自动取消
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-6">
          <EnvironmentTimeline />
        </div>
      </div>
    </div>
  );
}
