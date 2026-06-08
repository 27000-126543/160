import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { Clock, Zap, Moon, Sun, ThermometerSun, Lightbulb, Flame } from 'lucide-react';
import { useSceneStore, getEventLabel, getEventColor } from '../../store/sceneStore';
import { useWeatherStore } from '../../store/weatherStore';

export function EnvironmentTimeline() {
  const environmentTimeline = useSceneStore(state => state.environmentTimeline);
  const environmentalEvents = useSceneStore(state => state.environmentalEvents);
  const isPolarNight = useSceneStore(state => state.isPolarNight);
  const backupGeneratorActive = useSceneStore(state => state.backupGeneratorActive);
  const lightingIntensity = useSceneStore(state => state.lightingIntensity);
  const heatingPower = useSceneStore(state => state.heatingPower);
  const currentWeather = useWeatherStore(state => state.currentWeather);

  const chartOption = useMemo(() => {
    const timeData = environmentTimeline.map(d => 
      d.timestamp.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    );
    
    const tempData = environmentTimeline.map(d => d.temperature);
    const lightData = environmentTimeline.map(d => d.lightIntensity * 100);
    const lightingPowerData = environmentTimeline.map(d => d.lightingPower * 100);
    const heatingPowerData = environmentTimeline.map(d => d.heatingPower * 100);

    const recentEvents = environmentalEvents.slice(-10);
    
    const markPoints = recentEvents.map(event => {
      const eventIndex = environmentTimeline.findIndex(d => 
        d.timestamp.getTime() >= event.timestamp.getTime()
      );
      
      return {
        name: getEventLabel(event.type),
        coord: eventIndex >= 0 ? [eventIndex, event.type.includes('temp') || event.type.includes('cold') || event.type.includes('generator') ? tempData[eventIndex] : lightData[eventIndex]] : [0, 0],
        value: getEventLabel(event.type),
        itemStyle: {
          color: getEventColor(event.type),
        },
        label: {
          show: true,
          formatter: getEventLabel(event.type),
          position: 'top',
          color: getEventColor(event.type),
          fontSize: 10,
          padding: [2, 6],
          backgroundColor: 'rgba(10, 25, 41, 0.9)',
          borderColor: getEventColor(event.type),
          borderWidth: 1,
          borderRadius: 4,
        },
        symbolSize: 12,
        symbol: 'circle',
      };
    });

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(10, 25, 41, 0.95)',
        borderColor: '#00D4FF',
        textStyle: { color: '#F0F8FF', fontSize: 11 },
        axisPointer: {
          type: 'cross',
          lineStyle: { color: 'rgba(0, 212, 255, 0.3)' },
        },
      },
      legend: {
        data: ['温度', '光照', '照明功率', '供暖功率'],
        textStyle: { color: '#F0F8FF', fontSize: 10 },
        top: 0,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '12%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: timeData,
        axisLine: { lineStyle: { color: 'rgba(0, 212, 255, 0.3)' } },
        axisLabel: { color: '#F0F8FF', fontSize: 9, rotate: 45 },
        splitLine: { show: false },
      },
      yAxis: [
        {
          type: 'value',
          name: '温度(°C)',
          position: 'left',
          min: -60,
          max: 0,
          axisLine: { lineStyle: { color: '#FFA502' } },
          axisLabel: { color: '#FFA502', fontSize: 9, formatter: '{value}°' },
          splitLine: { lineStyle: { color: 'rgba(0, 212, 255, 0.1)' } },
        },
        {
          type: 'value',
          name: '功率/光照(%)',
          position: 'right',
          min: 0,
          max: 100,
          axisLine: { lineStyle: { color: '#00D4FF' } },
          axisLabel: { color: '#00D4FF', fontSize: 9, formatter: '{value}%' },
        },
      ],
      series: [
        {
          name: '温度',
          type: 'line',
          smooth: true,
          yAxisIndex: 0,
          data: tempData,
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
          markLine: {
            silent: true,
            symbol: 'none',
            lineStyle: {
              color: '#FF4757',
              type: 'dashed',
              width: 1,
            },
            data: [
              { yAxis: -50, label: { formatter: '极寒阈值 -50°C', color: '#FF4757', fontSize: 9, position: 'end' } },
            ],
          },
          markPoint: {
            data: markPoints.filter(mp => 
              mp.name.includes('极寒') || mp.name.includes('发电机')
            ),
            symbolSize: 10,
          },
        },
        {
          name: '光照',
          type: 'line',
          smooth: true,
          yAxisIndex: 1,
          data: lightData,
          lineStyle: { color: '#00D4FF', width: 2 },
          itemStyle: { color: '#00D4FF' },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(0, 212, 255, 0.2)' },
                { offset: 1, color: 'rgba(0, 212, 255, 0)' },
              ],
            },
          },
          markLine: {
            silent: true,
            symbol: 'none',
            lineStyle: {
              color: '#00D4FF',
              type: 'dashed',
              width: 1,
            },
            data: [
              { yAxis: 20, label: { formatter: '极夜阈值 20%', color: '#00D4FF', fontSize: 9, position: 'end' } },
              { yAxis: 35, label: { formatter: '恢复阈值 35%', color: '#FFA502', fontSize: 9, position: 'end' } },
            ],
          },
          markPoint: {
            data: markPoints.filter(mp => 
              mp.name.includes('极夜')
            ),
            symbolSize: 10,
          },
        },
        {
          name: '照明功率',
          type: 'line',
          smooth: true,
          yAxisIndex: 1,
          data: lightingPowerData,
          lineStyle: { color: '#FFD700', width: 2, type: 'dashed' },
          itemStyle: { color: '#FFD700' },
          showSymbol: false,
        },
        {
          name: '供暖功率',
          type: 'line',
          smooth: true,
          yAxisIndex: 1,
          data: heatingPowerData,
          lineStyle: { color: '#2ED573', width: 2, type: 'dashed' },
          itemStyle: { color: '#2ED573' },
          showSymbol: false,
        },
      ],
      graphic: recentEvents.slice(-5).map((event, index) => ({
        type: 'group',
        left: 10,
        top: 40 + index * 25,
        children: [
          {
            type: 'circle',
            shape: { r: 4 },
            style: { fill: getEventColor(event.type) },
          },
          {
            type: 'text',
            left: 10,
            top: -5,
            style: {
              text: `${event.timestamp.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })} ${getEventLabel(event.type)}`,
              fill: '#F0F8FF',
              fontSize: 10,
            },
          },
        ],
      })),
    };
  }, [environmentTimeline, environmentalEvents]);

  const recentEvents = useMemo(() => {
    return [...environmentalEvents].reverse().slice(0, 5);
  }, [environmentalEvents]);

  return (
    <div className="bg-polar-deep/50 rounded-lg p-4 border border-polar-ice/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-polar-white flex items-center gap-2">
          <Clock size={14} className="text-polar-ice" />
          24小时环境时间线
        </h3>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            {isPolarNight ? <Moon size={12} className="text-polar-ice" /> : <Sun size={12} className="text-warning-orange" />}
            <span className={isPolarNight ? 'text-polar-ice' : 'text-warning-orange'}>
              {isPolarNight ? '极夜模式' : '极昼模式'}
            </span>
          </div>
          {backupGeneratorActive && (
            <div className="flex items-center gap-1 text-warning-orange animate-pulse">
              <Zap size={12} />
              <span>备用发电机运行中</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="bg-polar-deep/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <ThermometerSun size={14} className={currentWeather.temperature < -50 ? 'text-alert-red' : 'text-warning-orange'} />
            <span className="text-xs text-polar-white/50">当前温度</span>
          </div>
          <div className={`text-xl font-bold font-mono ${currentWeather.temperature < -50 ? 'text-alert-red' : 'text-polar-white'}`}>
            {currentWeather.temperature.toFixed(1)}°C
          </div>
        </div>
        <div className="bg-polar-deep/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            {isPolarNight ? <Moon size={14} className="text-polar-ice" /> : <Sun size={14} className="text-warning-orange" />}
            <span className="text-xs text-polar-white/50">光照强度</span>
          </div>
          <div className="text-xl font-bold font-mono text-polar-white">
            {Math.round(currentWeather.lightIntensity * 100)}%
          </div>
        </div>
        <div className="bg-polar-deep/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb size={14} className={isPolarNight ? 'text-polar-ice' : 'text-warning-orange'} />
            <span className="text-xs text-polar-white/50">照明功率</span>
          </div>
          <div className="text-xl font-bold font-mono text-polar-white">
            {Math.round(lightingIntensity * 100)}%
          </div>
        </div>
        <div className="bg-polar-deep/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Flame size={14} className="text-safety-green" />
            <span className="text-xs text-polar-white/50">供暖功率</span>
          </div>
          <div className="text-xl font-bold font-mono text-polar-white">
            {Math.round(heatingPower * 100)}%
          </div>
        </div>
      </div>

      <div className="h-72">
        <ReactECharts
          option={chartOption}
          style={{ height: '100%', width: '100%' }}
          opts={{ renderer: 'canvas' }}
        />
      </div>

      {recentEvents.length > 0 && (
        <div className="mt-4 pt-4 border-t border-polar-ice/10">
          <h4 className="text-xs font-medium text-polar-white/60 mb-3">最近事件</h4>
          <div className="space-y-2">
            {recentEvents.map((event) => (
              <div key={event.id} className="flex items-center gap-3 text-xs">
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: getEventColor(event.type) }}
                />
                <span className="text-polar-white/50 font-mono w-20">
                  {event.timestamp.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span style={{ color: getEventColor(event.type) }} className="font-medium">
                  {getEventLabel(event.type)}
                </span>
                <span className="text-polar-white/40 ml-auto">
                  {event.description}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
