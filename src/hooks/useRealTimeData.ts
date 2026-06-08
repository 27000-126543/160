import { useEffect, useRef } from 'react';
import { useBuildingStore } from '../store/buildingStore';
import { usePersonnelStore } from '../store/personnelStore';
import { useWeatherStore } from '../store/weatherStore';
import { useMaterialStore } from '../store/materialStore';
import { useSceneStore } from '../store/sceneStore';

const LIGHT_THRESHOLD_LOW = 0.2;
const LIGHT_THRESHOLD_HIGH = 0.35;
const TEMP_THRESHOLD_LOW = -50;
const TEMP_THRESHOLD_HIGH = -45;

const useRealTimeData = () => {
  const updateBuildingData = useBuildingStore(state => state.updateBuildingData);
  const updatePersonnelData = usePersonnelStore(state => state.updatePersonnelData);
  const checkDangerZones = usePersonnelStore(state => state.checkDangerZones);
  const updateWeatherData = useWeatherStore(state => state.updateWeatherData);
  const calculateWindows = useWeatherStore(state => state.calculateWindows);
  const updateMaterialData = useMaterialStore(state => state.updateMaterialData);
  const autoGenerateLowStockRequests = useMaterialStore(state => state.autoGenerateLowStockRequests);
  const updateProcurementStatus = useMaterialStore(state => state.updateProcurementStatus);
  const updateEnvironmentalControls = useSceneStore(state => state.updateEnvironmentalControls);
  const addEnvironmentalEvent = useSceneStore(state => state.addEnvironmentalEvent);
  const addEnvironmentTimelineData = useSceneStore(state => state.addEnvironmentTimelineData);
  const currentWeather = useWeatherStore(state => state.currentWeather);
  const backupGeneratorActive = useSceneStore(state => state.backupGeneratorActive);
  const isPolarNight = useSceneStore(state => state.isPolarNight);
  const lightingIntensity = useSceneStore(state => state.lightingIntensity);
  const heatingPower = useSceneStore(state => state.heatingPower);

  const prevLightIntensity = useRef(currentWeather.lightIntensity);
  const prevTemperature = useRef(currentWeather.temperature);
  const timelineLastUpdate = useRef(0);

  useEffect(() => {
    const currentLight = currentWeather.lightIntensity;
    const prevLight = prevLightIntensity.current;

    if (prevLight >= LIGHT_THRESHOLD_LOW && currentLight < LIGHT_THRESHOLD_LOW && !isPolarNight) {
      useSceneStore.setState({ 
        isPolarNight: true,
        lightingIntensity: 0.2,
        heatingPower: 0.9
      });
      addEnvironmentalEvent(
        'polar_night_start',
        currentLight,
        `光照强度低于${LIGHT_THRESHOLD_LOW * 100}%，进入极夜模式`
      );
    } else if (prevLight <= LIGHT_THRESHOLD_HIGH && currentLight > LIGHT_THRESHOLD_HIGH && isPolarNight) {
      useSceneStore.setState({ 
        isPolarNight: false,
        lightingIntensity: 0.8,
        heatingPower: 0.5
      });
      addEnvironmentalEvent(
        'polar_night_end',
        currentLight,
        `光照强度高于${LIGHT_THRESHOLD_HIGH * 100}%，解除极夜模式`
      );
    }

    prevLightIntensity.current = currentLight;
  }, [currentWeather.lightIntensity, isPolarNight, addEnvironmentalEvent]);

  useEffect(() => {
    const currentTemp = currentWeather.temperature;
    const prevTemp = prevTemperature.current;

    if (prevTemp >= TEMP_THRESHOLD_LOW && currentTemp < TEMP_THRESHOLD_LOW && !backupGeneratorActive) {
      useSceneStore.setState({ backupGeneratorActive: true });
      addEnvironmentalEvent(
        'generator_start',
        currentTemp,
        `温度低于${TEMP_THRESHOLD_LOW}°C，启动备用发电机`
      );
      addEnvironmentalEvent(
        'extreme_cold_start',
        currentTemp,
        `极寒预警启动，当前温度${currentTemp.toFixed(1)}°C`
      );
    } else if (prevTemp <= TEMP_THRESHOLD_HIGH && currentTemp > TEMP_THRESHOLD_HIGH && backupGeneratorActive) {
      useSceneStore.setState({ backupGeneratorActive: false });
      addEnvironmentalEvent(
        'generator_end',
        currentTemp,
        `温度回升至${TEMP_THRESHOLD_HIGH}°C以上，关闭备用发电机`
      );
      addEnvironmentalEvent(
        'extreme_cold_end',
        currentTemp,
        `极寒预警解除，当前温度${currentTemp.toFixed(1)}°C`
      );
    }

    prevTemperature.current = currentTemp;
  }, [currentWeather.temperature, backupGeneratorActive, addEnvironmentalEvent]);

  useEffect(() => {
    const buildingInterval = setInterval(() => {
      updateBuildingData();
    }, 2000);

    const personnelInterval = setInterval(() => {
      updatePersonnelData();
      checkDangerZones();
    }, 1000);

    const weatherInterval = setInterval(() => {
      updateWeatherData();
      calculateWindows();
    }, 5000);

    const materialInterval = setInterval(() => {
      updateMaterialData();
      autoGenerateLowStockRequests();
      updateProcurementStatus();
    }, 10000);

    const environmentInterval = setInterval(() => {
      updateEnvironmentalControls();
    }, 500);

    const timelineInterval = setInterval(() => {
      const now = Date.now();
      if (now - timelineLastUpdate.current >= 60000) {
        addEnvironmentTimelineData({
          temperature: currentWeather.temperature,
          lightIntensity: currentWeather.lightIntensity,
          lightingPower: lightingIntensity,
          heatingPower: heatingPower,
          generatorActive: backupGeneratorActive,
        });
        timelineLastUpdate.current = now;
      }
    }, 10000);

    return () => {
      clearInterval(buildingInterval);
      clearInterval(personnelInterval);
      clearInterval(weatherInterval);
      clearInterval(materialInterval);
      clearInterval(environmentInterval);
      clearInterval(timelineInterval);
    };
  }, [updateBuildingData, updatePersonnelData, checkDangerZones, updateWeatherData, calculateWindows, updateMaterialData, autoGenerateLowStockRequests, updateProcurementStatus, updateEnvironmentalControls, addEnvironmentTimelineData, currentWeather.temperature, currentWeather.lightIntensity, lightingIntensity, heatingPower, backupGeneratorActive]);
};

export default useRealTimeData;
