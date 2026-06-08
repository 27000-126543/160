import React, { useState, useMemo } from 'react';
import { FileSpreadsheet, Download, Calendar, BarChart3, Users, Zap, AlertTriangle, CheckCircle } from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import * as XLSX from 'xlsx';
import { useBuildingStore } from '../../store/buildingStore';
import { usePersonnelStore } from '../../store/personnelStore';
import { useSceneStore } from '../../store/sceneStore';

interface DailyReport {
  date: string;
  quarter: string;
  buildingEnergy: { [key: string]: number };
  totalEnergy: number;
  taskCompletionRate: number;
  safetyEvents: number;
  personnelHealthRate: number;
  equipmentUptime: number;
}

const quarters = ['2024-Q1', '2024-Q2', '2024-Q3', '2024-Q4', '2025-Q1'];

const ExportPanel: React.FC = () => {
  const [selectedQuarter, setSelectedQuarter] = useState('2025-Q1');
  const { buildings } = useBuildingStore();
  const { personnel } = usePersonnelStore();
  const { activeEmergencies } = useSceneStore();

  const generateReportData = useMemo((): DailyReport[] => {
    const reports: DailyReport[] = [];
    const [year, q] = selectedQuarter.split('-Q');
    const quarterNum = parseInt(q);
    const startMonth = (quarterNum - 1) * 3;
    const daysInQuarter = 90;

    for (let i = 0; i < daysInQuarter; i++) {
      const date = new Date(parseInt(year), startMonth, i + 1);
      const dateStr = date.toISOString().split('T')[0];
      
      const buildingEnergy: { [key: string]: number } = {};
      let totalEnergy = 0;
      
      buildings.forEach(b => {
        const energy = b.energyConsumption + (Math.random() - 0.5) * 50;
        buildingEnergy[b.name] = Math.max(0, energy);
        totalEnergy += buildingEnergy[b.name];
      });

      reports.push({
        date: dateStr,
        quarter: selectedQuarter,
        buildingEnergy,
        totalEnergy,
        taskCompletionRate: 70 + Math.random() * 30,
        safetyEvents: Math.floor(Math.random() * 3),
        personnelHealthRate: 85 + Math.random() * 15,
        equipmentUptime: 92 + Math.random() * 8
      });
    }

    return reports;
  }, [selectedQuarter, buildings]);

  const summaryStats = useMemo(() => {
    if (generateReportData.length === 0) return null;

    const totalEnergy = generateReportData.reduce((sum, r) => sum + r.totalEnergy, 0);
    const avgCompletionRate = generateReportData.reduce((sum, r) => sum + r.taskCompletionRate, 0) / generateReportData.length;
    const totalSafetyEvents = generateReportData.reduce((sum, r) => sum + r.safetyEvents, 0);
    const avgHealthRate = generateReportData.reduce((sum, r) => sum + r.personnelHealthRate, 0) / generateReportData.length;
    const avgUptime = generateReportData.reduce((sum, r) => sum + r.equipmentUptime, 0) / generateReportData.length;

    return {
      totalEnergy,
      avgCompletionRate,
      totalSafetyEvents,
      avgHealthRate,
      avgUptime,
      totalDays: generateReportData.length
    };
  }, [generateReportData]);

  const energyTrendOption = useMemo(() => {
    const dates = generateReportData.map(r => r.date);
    const energyData = generateReportData.map(r => r.totalEnergy);
    
    return {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(10, 25, 41, 0.95)',
        borderColor: 'rgba(0, 212, 255, 0.3)',
        textStyle: { color: '#F0F8FF' }
      },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: dates,
        axisLine: { lineStyle: { color: 'rgba(0, 212, 255, 0.3)' } },
        axisLabel: { color: 'rgba(240, 248, 255, 0.7)', fontSize: 10 }
      },
      yAxis: {
        type: 'value',
        name: '能耗 (kWh)',
        axisLine: { lineStyle: { color: 'rgba(0, 212, 255, 0.3)' } },
        axisLabel: { color: 'rgba(240, 248, 255, 0.7)' },
        splitLine: { lineStyle: { color: 'rgba(0, 212, 255, 0.1)' } }
      },
      series: [{
        data: energyData,
        type: 'line',
        smooth: true,
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(0, 212, 255, 0.4)' },
              { offset: 1, color: 'rgba(0, 212, 255, 0.05)' }
            ]
          }
        },
        lineStyle: { color: '#00D4FF', width: 2 },
        itemStyle: { color: '#00D4FF' }
      }]
    };
  }, [generateReportData]);

  const buildingEnergyOption = useMemo(() => {
    const latestReport = generateReportData[generateReportData.length - 1];
    if (!latestReport) return {};

    const buildingNames = Object.keys(latestReport.buildingEnergy);
    const energyValues = Object.values(latestReport.buildingEnergy);

    return {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(10, 25, 41, 0.95)',
        borderColor: 'rgba(0, 212, 255, 0.3)',
        textStyle: { color: '#F0F8FF' }
      },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: buildingNames,
        axisLine: { lineStyle: { color: 'rgba(0, 212, 255, 0.3)' } },
        axisLabel: { color: 'rgba(240, 248, 255, 0.7)', fontSize: 10 }
      },
      yAxis: {
        type: 'value',
        name: '能耗 (kWh)',
        axisLine: { lineStyle: { color: 'rgba(0, 212, 255, 0.3)' } },
        axisLabel: { color: 'rgba(240, 248, 255, 0.7)' },
        splitLine: { lineStyle: { color: 'rgba(0, 212, 255, 0.1)' } }
      },
      series: [{
        data: energyValues,
        type: 'bar',
        itemStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#00D4FF' },
              { offset: 1, color: 'rgba(0, 212, 255, 0.3)' }
            ]
          },
          borderRadius: [4, 4, 0, 0]
        }
      }]
    };
  }, [generateReportData]);

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    const summaryData = summaryStats ? [
      ['极地科考站运营日报 - 季度汇总'],
      [`季度: ${selectedQuarter}`],
      ['统计日期', new Date().toLocaleDateString('zh-CN')],
      [],
      ['指标', '数值'],
      ['总能耗 (kWh)', summaryStats.totalEnergy.toFixed(2)],
      ['平均任务完成率 (%)', summaryStats.avgCompletionRate.toFixed(2)],
      ['安全事件总数', summaryStats.totalSafetyEvents],
      ['人员健康率 (%)', summaryStats.avgHealthRate.toFixed(2)],
      ['设备正常运行率 (%)', summaryStats.avgUptime.toFixed(2)],
      ['统计天数', summaryStats.totalDays]
    ] : [];

    const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWs, '汇总');

    const dailyHeaders = ['日期', '总能耗(kWh)', '任务完成率(%)', '安全事件数', '人员健康率(%)', '设备正常率(%)'];
    const dailyData = generateReportData.map(r => [
      r.date,
      r.totalEnergy.toFixed(2),
      r.taskCompletionRate.toFixed(2),
      r.safetyEvents,
      r.personnelHealthRate.toFixed(2),
      r.equipmentUptime.toFixed(2)
    ]);
    const dailyWs = XLSX.utils.aoa_to_sheet([dailyHeaders, ...dailyData]);
    XLSX.utils.book_append_sheet(wb, dailyWs, '日报明细');

    const buildingHeaders = ['日期', ...buildings.map(b => b.name + '(kWh)')];
    const buildingData = generateReportData.map(r => [
      r.date,
      ...Object.values(r.buildingEnergy).map(v => v.toFixed(2))
    ]);
    const buildingWs = XLSX.utils.aoa_to_sheet([buildingHeaders, ...buildingData]);
    XLSX.utils.book_append_sheet(wb, buildingWs, '各建筑能耗');

    XLSX.writeFile(wb, `极地科考站运营日报_${selectedQuarter}.xlsx`);
  };

  return (
    <div className="h-full flex flex-col gap-4 p-4 overflow-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileSpreadsheet className="w-6 h-6 text-polar-ice" />
          <h2 className="text-xl font-bold text-polar-white">数据报表导出</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-polar-ice" />
            <select
              value={selectedQuarter}
              onChange={(e) => setSelectedQuarter(e.target.value)}
              className="bg-polar-ice/10 border border-polar-ice/30 rounded-lg px-3 py-2 text-polar-white text-sm focus:outline-none focus:border-polar-ice"
            >
              {quarters.map(q => (
                <option key={q} value={q} className="bg-polar-deep">{q}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-polar-ice to-polar-white text-polar-deep font-semibold rounded-lg hover:shadow-lg hover:shadow-polar-ice/30 transition-all duration-300"
          >
            <Download className="w-4 h-4" />
            导出Excel
          </button>
        </div>
      </div>

      {summaryStats && (
        <div className="grid grid-cols-5 gap-4">
          <div className="glass-panel rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-polar-ice" />
              <span className="text-sm text-polar-white/70">总能耗</span>
            </div>
            <p className="text-2xl font-bold text-polar-white">{(summaryStats.totalEnergy / 1000).toFixed(1)} MWh</p>
          </div>
          <div className="glass-panel rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-5 h-5 text-safety-green" />
              <span className="text-sm text-polar-white/70">任务完成率</span>
            </div>
            <p className="text-2xl font-bold text-safety-green">{summaryStats.avgCompletionRate.toFixed(1)}%</p>
          </div>
          <div className="glass-panel rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-warning-orange" />
              <span className="text-sm text-polar-white/70">安全事件</span>
            </div>
            <p className="text-2xl font-bold text-warning-orange">{summaryStats.totalSafetyEvents} 起</p>
          </div>
          <div className="glass-panel rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-polar-ice" />
              <span className="text-sm text-polar-white/70">人员健康率</span>
            </div>
            <p className="text-2xl font-bold text-polar-white">{summaryStats.avgHealthRate.toFixed(1)}%</p>
          </div>
          <div className="glass-panel rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-safety-green" />
              <span className="text-sm text-polar-white/70">设备正常率</span>
            </div>
            <p className="text-2xl font-bold text-safety-green">{summaryStats.avgUptime.toFixed(1)}%</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
        <div className="glass-panel rounded-xl p-4 flex flex-col">
          <h3 className="text-lg font-semibold text-polar-white mb-4">季度能耗趋势</h3>
          <div className="flex-1 min-h-0">
            <ReactECharts option={energyTrendOption} style={{ height: '100%', width: '100%' }} opts={{ renderer: 'canvas' }} />
          </div>
        </div>
        <div className="glass-panel rounded-xl p-4 flex flex-col">
          <h3 className="text-lg font-semibold text-polar-white mb-4">最新各建筑能耗</h3>
          <div className="flex-1 min-h-0">
            <ReactECharts option={buildingEnergyOption} style={{ height: '100%', width: '100%' }} opts={{ renderer: 'canvas' }} />
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-xl p-4">
        <h3 className="text-lg font-semibold text-polar-white mb-4">日报明细预览</h3>
        <div className="overflow-auto max-h-64">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-polar-ice/20">
                <th className="text-left py-2 px-3 text-polar-ice/70 font-medium">日期</th>
                <th className="text-right py-2 px-3 text-polar-ice/70 font-medium">总能耗</th>
                <th className="text-right py-2 px-3 text-polar-ice/70 font-medium">任务完成率</th>
                <th className="text-right py-2 px-3 text-polar-ice/70 font-medium">安全事件</th>
                <th className="text-right py-2 px-3 text-polar-ice/70 font-medium">健康率</th>
                <th className="text-right py-2 px-3 text-polar-ice/70 font-medium">设备正常率</th>
              </tr>
            </thead>
            <tbody>
              {generateReportData.slice(-10).reverse().map((report, idx) => (
                <tr key={idx} className="border-b border-polar-ice/10 hover:bg-polar-ice/5">
                  <td className="py-2 px-3 text-polar-white">{report.date}</td>
                  <td className="py-2 px-3 text-polar-white text-right">{report.totalEnergy.toFixed(1)} kWh</td>
                  <td className="py-2 px-3 text-right">
                    <span className={report.taskCompletionRate >= 85 ? 'text-safety-green' : 'text-warning-orange'}>
                      {report.taskCompletionRate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right">
                    <span className={report.safetyEvents > 0 ? 'text-alert-red' : 'text-safety-green'}>
                      {report.safetyEvents}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right text-safety-green">{report.personnelHealthRate.toFixed(1)}%</td>
                  <td className="py-2 px-3 text-right text-safety-green">{report.equipmentUptime.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExportPanel;
