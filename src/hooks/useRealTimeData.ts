import { useEffect } from 'react';
import { useBuildingStore } from '../store/buildingStore';
import { usePersonnelStore } from '../store/personnelStore';
import { useWeatherStore } from '../store/weatherStore';
import { useMaterialStore } from '../store/materialStore';
import { useSceneStore } from '../store/sceneStore';

const useRealTimeData = () => {
  const updateBuildingData = useBuildingStore(state => state.updateBuildingData);
  const updatePersonnelData = usePersonnelStore(state => state.updatePersonnelData);
  const checkDangerZones = usePersonnelStore(state => state.checkDangerZones);
  const updateWeatherData = useWeatherStore(state => state.updateWeatherData);
  const calculateWindows = useWeatherStore(state => state.calculateWindows);
  const updateMaterialData = useMaterialStore(state => state.updateMaterialData);
  const updateEnvironmentalControls = useSceneStore(state => state.updateEnvironmentalControls);
  const currentWeather = useWeatherStore(state => state.currentWeather);
  const backupGeneratorActive = useSceneStore(state => state.backupGeneratorActive);

  useEffect(() => {
    if (currentWeather.temperature < -50 && !backupGeneratorActive) {
      useSceneStore.setState({ backupGeneratorActive: true });
    } else if (currentWeather.temperature >= -45 && backupGeneratorActive) {
      useSceneStore.setState({ backupGeneratorActive: false });
    }
  }, [currentWeather.temperature, backupGeneratorActive]);

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
    }, 10000);

    const environmentInterval = setInterval(() => {
      updateEnvironmentalControls();
    }, 500);

    return () => {
      clearInterval(buildingInterval);
      clearInterval(personnelInterval);
      clearInterval(weatherInterval);
      clearInterval(materialInterval);
      clearInterval(environmentInterval);
    };
  }, [updateBuildingData, updatePersonnelData, checkDangerZones, updateWeatherData, calculateWindows, updateMaterialData, updateEnvironmentalControls]);
};

export default useRealTimeData;
