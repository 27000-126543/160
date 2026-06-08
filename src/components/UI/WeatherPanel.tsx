import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { Cloud, Wind, Eye, ThermometerSun, Calendar, Map, AlertTriangle, CheckCircle } from 'lucide-react';
import { useWeatherStore } from '../../store/weatherStore';
import { useSceneStore } from '../../store/sceneStore';

export function WeatherPanel() {
  const currentWeather = useWeatherStore(state => state.currentWeather);
  const weatherForecast = useWeatherStore(state => state.weatherForecast);
  const windowSchedules = useWeatherStore(state => state.windowSchedules);
  const selectedSchedule = useWeatherStore(state => state.selectedSchedule);
  const selectSchedule = useWeatherStore(state => state.selectSchedule);
  const isPolarNight = useSceneStore(state => state.isPolarNight);

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

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="glass-panel rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-display font-bold text-polar-ice glow-text">
            气象调度中心
          </h2>
          <div className={`px-3 py-1 rounded-full text-sm ${
            isPolarNight ? 'bg-polar-deep text-polar-ice' : 'bg-polar-ice/20 text-polar-ice'
          }`}>
            {isPolarNight ? '🌙 极夜模式' : '☀️ 极昼模式'}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-polar-deep/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <ThermometerSun size={18} className="text-warning-orange" />
              <span className="text-sm text-polar-white/60">室外温度</span>
            </div>
            <div className={`text-3xl font-bold font-mono ${
              currentWeather.temperature < -50 ? 'text-alert-red' : 'text-polar-white'
            }`}>
              {currentWeather.temperature.toFixed(1)}°C
            </div>
            {currentWeather.temperature < -50 && (
              <div className="text-xs text-alert-red mt-1 flex items-center gap-1">
                <AlertTriangle size={12} /> 极寒预警
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
      </div>
    </div>
  );
}
