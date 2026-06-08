import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Sky, Stars } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { Building } from './Building';
import { PersonnelModel } from './PersonnelModel';
import { DangerZone } from './DangerZone';
import { RouteLine } from './RouteLine';
import { useBuildingStore } from '../../store/buildingStore';
import { usePersonnelStore } from '../../store/personnelStore';
import { useWeatherStore } from '../../store/weatherStore';
import { useSceneStore } from '../../store/sceneStore';

function SceneLighting() {
  const isPolarNight = useSceneStore(state => state.isPolarNight);
  const lightingIntensity = useSceneStore(state => state.lightingIntensity);
  const heatingPower = useSceneStore(state => state.heatingPower);
  const buildings = useBuildingStore(state => state.buildings);
  const directionalLightRef = useRef<THREE.DirectionalLight>(null);
  const ambientLightRef = useRef<THREE.AmbientLight>(null);

  useFrame((state) => {
    if (directionalLightRef.current) {
      const targetIntensity = isPolarNight ? 0.1 : lightingIntensity;
      directionalLightRef.current.intensity += (targetIntensity - directionalLightRef.current.intensity) * 0.05;
      
      const targetColor = isPolarNight ? new THREE.Color(0xffa500) : new THREE.Color(0xffffff);
      directionalLightRef.current.color.lerp(targetColor, 0.05);
    }
    if (ambientLightRef.current) {
      const targetIntensity = isPolarNight ? 0.2 : 0.5;
      ambientLightRef.current.intensity += (targetIntensity - ambientLightRef.current.intensity) * 0.05;
    }
  });

  return (
    <>
      <ambientLight ref={ambientLightRef} intensity={0.5} color="#87CEEB" />
      <directionalLight
        ref={directionalLightRef}
        position={[30, 40, 30]}
        intensity={lightingIntensity}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={100}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />
      
      {buildings.map((building) => (
        <pointLight
          key={`light-${building.id}`}
          position={[building.position[0], 5, building.position[2]]}
          intensity={isPolarNight ? heatingPower * 2 : 0.5}
          distance={15}
          color={isPolarNight ? '#FFA502' : '#00D4FF'}
        />
      ))}
    </>
  );
}

function Ground() {
  const isPolarNight = useSceneStore(state => state.isPolarNight);
  
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[200, 200, 50, 50]} />
      <meshStandardMaterial 
        color={isPolarNight ? '#1a2a3a' : '#e8f4f8'}
        metalness={0.1}
        roughness={0.8}
      />
    </mesh>
  );
}

function CameraController() {
  const cameraTarget = useSceneStore(state => state.cameraTarget);
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  useFrame(() => {
    if (controlsRef.current) {
      controlsRef.current.target.lerp(new THREE.Vector3(...cameraTarget), 0.05);
      controlsRef.current.update();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      minDistance={10}
      maxDistance={100}
      maxPolarAngle={Math.PI / 2 - 0.1}
      minPolarAngle={Math.PI / 6}
    />
  );
}

function Atmosphere() {
  const isPolarNight = useSceneStore(state => state.isPolarNight);
  
  return (
    <>
      {!isPolarNight ? (
        <Sky
          distance={450000}
          sunPosition={[100, 20, 100]}
          inclination={0.5}
          azimuth={0.25}
        />
      ) : (
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      )}
      <fog attach="fog" args={[isPolarNight ? '#0a1929' : '#c4e0e8', 50, 150]} />
    </>
  );
}

function SceneContent() {
  const buildings = useBuildingStore(state => state.buildings);
  const personnel = usePersonnelStore(state => state.personnel);
  const escapeRoutes = useSceneStore(state => state.escapeRoutes);
  const helicopterRoute = useSceneStore(state => state.helicopterRoute);
  const windowSchedules = useWeatherStore(state => state.windowSchedules);
  const selectedSchedule = useWeatherStore(state => state.selectedSchedule);
  const emergencyActive = useSceneStore(state => state.emergencyActive);

  const activeResearchRoutes = useMemo(() => {
    if (emergencyActive) return [];
    return windowSchedules.filter(w => w.status === 'available' && selectedSchedule?.id === w.id);
  }, [windowSchedules, selectedSchedule, emergencyActive]);

  return (
    <>
      <SceneLighting />
      <Ground />
      <Atmosphere />
      <CameraController />
      
      {buildings.map((building) => (
        <Building key={building.id} building={building} />
      ))}
      
      {personnel.map((person) => (
        <PersonnelModel key={person.id} personnel={person} />
      ))}
      
      <DangerZone />
      
      {escapeRoutes.map((route) => (
        <RouteLine
          key={route.id}
          points={route.path}
          color={route.color}
          isActive={route.isActive}
          type="escape"
        />
      ))}
      
      {helicopterRoute && (
        <RouteLine
          points={helicopterRoute}
          color="#00D4FF"
          isActive={true}
          type="helicopter"
        />
      )}
      
      {activeResearchRoutes.map((schedule) => (
        <RouteLine
          key={schedule.id}
          points={schedule.routePath}
          color="#00D4FF"
          isActive={true}
          type="research"
        />
      ))}
      
      <EffectComposer>
        <Bloom 
          luminanceThreshold={0.2} 
          luminanceSmoothing={0.9} 
          intensity={1.5} 
        />
      </EffectComposer>
    </>
  );
}

export function Scene3D() {
  return (
    <Canvas
      shadows
      camera={{ position: [30, 25, 30], fov: 60 }}
      gl={{ antialias: true, alpha: false }}
      dpr={[1, 2]}
    >
      <SceneContent />
    </Canvas>
  );
}
