import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Edges } from '@react-three/drei';
import * as THREE from 'three';
import { Building as BuildingType } from '../../types';
import { useBuildingStore } from '../../store/buildingStore';
import { useSceneStore } from '../../store/sceneStore';

interface BuildingProps {
  building: BuildingType;
}

const getStatusColor = (status: string, isSelected: boolean) => {
  if (isSelected) return '#00D4FF';
  switch (status) {
    case 'normal': return '#2ED573';
    case 'warning': return '#FFA502';
    case 'error': return '#FF4757';
    default: return '#2ED573';
  }
};

const BuildingMaterial = ({ color }: { color: string }) => (
  <meshStandardMaterial 
    color={color} 
    metalness={0.3} 
    roughness={0.7}
  />
);

const getBuildingGeometry = (type: string) => {
  const mainColor = '#4a5c6e';
  const roofColor = '#3a4a5a';
  const accentColor = '#5a6c7e';
  
  switch (type) {
    case 'main':
      return (
        <group>
          <mesh position={[0, 2, 0]}>
            <boxGeometry args={[8, 4, 6]} />
            <BuildingMaterial color={mainColor} />
          </mesh>
          <mesh position={[0, 4.5, 0]}>
            <boxGeometry args={[6, 1, 5]} />
            <BuildingMaterial color={roofColor} />
          </mesh>
          <mesh position={[3, 1, 2.5]}>
            <boxGeometry args={[1, 2, 1]} />
            <BuildingMaterial color={accentColor} />
          </mesh>
        </group>
      );
    case 'command':
      return (
        <group>
          <mesh position={[0, 1.5, 0]}>
            <boxGeometry args={[10, 3, 8]} />
            <BuildingMaterial color={mainColor} />
          </mesh>
          <mesh position={[0, 3.5, 0]}>
            <cylinderGeometry args={[3, 4, 1, 8]} />
            <BuildingMaterial color={roofColor} />
          </mesh>
          <mesh position={[0, 5, 0]}>
            <sphereGeometry args={[1.5, 16, 16]} />
            <meshStandardMaterial color="#00D4FF" metalness={0.8} roughness={0.2} emissive="#00D4FF" emissiveIntensity={0.2} />
          </mesh>
        </group>
      );
    case 'weather':
      return (
        <group>
          <mesh position={[0, 1, 0]}>
            <boxGeometry args={[4, 2, 4]} />
            <BuildingMaterial color={mainColor} />
          </mesh>
          <mesh position={[0, 2.5, 0]}>
            <cylinderGeometry args={[0.2, 0.2, 3, 8]} />
            <BuildingMaterial color={accentColor} />
          </mesh>
          <mesh position={[0, 5, 0]}>
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshStandardMaterial color="#FFA502" emissive="#FFA502" emissiveIntensity={0.3} />
          </mesh>
          <mesh position={[2, 3, 0]} rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[3, 0.1, 0.5]} />
            <BuildingMaterial color="#ffffff" />
          </mesh>
        </group>
      );
    case 'drilling':
      return (
        <group>
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[4, 4, 1, 16]} />
            <BuildingMaterial color={roofColor} />
          </mesh>
          <mesh position={[0, 4, 0]}>
            <cylinderGeometry args={[0.5, 0.8, 6, 8]} />
            <BuildingMaterial color={accentColor} />
          </mesh>
          <mesh position={[2, 2, 0]}>
            <boxGeometry args={[1, 3, 1]} />
            <BuildingMaterial color={mainColor} />
          </mesh>
        </group>
      );
    case 'warehouse':
      return (
        <group>
          <mesh position={[0, 2, 0]}>
            <boxGeometry args={[10, 4, 8]} />
            <BuildingMaterial color={mainColor} />
          </mesh>
          <mesh position={[0, 4.5, 0]}>
            <boxGeometry args={[10.2, 1, 8.2]} />
            <BuildingMaterial color={roofColor} />
          </mesh>
          <mesh position={[-3, 1.5, 3.5]}>
            <boxGeometry args={[2, 3, 1]} />
            <BuildingMaterial color="#6a7c8e" />
          </mesh>
          <mesh position={[3, 1.5, 3.5]}>
            <boxGeometry args={[2, 3, 1]} />
            <BuildingMaterial color="#6a7c8e" />
          </mesh>
        </group>
      );
    case 'power':
      return (
        <group>
          <mesh position={[0, 1.5, 0]}>
            <boxGeometry args={[6, 3, 6]} />
            <BuildingMaterial color={mainColor} />
          </mesh>
          <mesh position={[-2, 4, 0]}>
            <cylinderGeometry args={[0.5, 0.6, 5, 12]} />
            <BuildingMaterial color={accentColor} />
          </mesh>
          <mesh position={[2, 4, 0]}>
            <cylinderGeometry args={[0.5, 0.6, 5, 12]} />
            <BuildingMaterial color={accentColor} />
          </mesh>
          <mesh position={[-2, 6.5, 0]}>
            <cylinderGeometry args={[0.8, 0.5, 0.5, 12]} />
            <BuildingMaterial color="#FF4757" />
          </mesh>
          <mesh position={[2, 6.5, 0]}>
            <cylinderGeometry args={[0.8, 0.5, 0.5, 12]} />
            <BuildingMaterial color="#FF4757" />
          </mesh>
        </group>
      );
    case 'helipad':
      return (
        <group>
          <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[6, 6, 0.2, 32]} />
            <meshStandardMaterial color="#555555" metalness={0.5} roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.21, 0]}>
            <boxGeometry args={[1, 0.02, 4]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0, 0.21, 0]} rotation={[0, Math.PI / 2, 0]}>
            <boxGeometry args={[1, 0.02, 4]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        </group>
      );
    default:
      return (
        <mesh position={[0, 1.5, 0]}>
          <boxGeometry args={[4, 3, 4]} />
          <BuildingMaterial color={mainColor} />
        </mesh>
      );
  }
};

export function Building({ building }: BuildingProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const selectBuilding = useBuildingStore(state => state.selectBuilding);
  const selectedBuilding = useBuildingStore(state => state.selectedBuilding);
  const isSelected = selectedBuilding?.id === building.id;
  const backupGeneratorActive = useSceneStore(state => state.backupGeneratorActive);
  const isPowerBuilding = building.type === 'power' && backupGeneratorActive;

  useFrame((state) => {
    if (groupRef.current && (isSelected || hovered)) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
  });

  const statusColor = getStatusColor(building.equipmentStatus, isSelected);

  const handleClick = (e: { stopPropagation: () => void; }) => {
    e.stopPropagation();
    selectBuilding(isSelected ? null : building);
  };

  return (
    <group
      ref={groupRef}
      position={building.position}
      onClick={handleClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
    >
      <group>
        {getBuildingGeometry(building.type)}
      </group>
      
      {building.type !== 'helipad' && (
        <Edges threshold={15} scale={1.01}>
          <lineBasicMaterial 
            color={statusColor} 
            transparent 
            opacity={isSelected || hovered ? 1 : 0.6} 
          />
        </Edges>
      )}

      {backupGeneratorActive && (
        <mesh position={[0, 8, 0]}>
          <pointLight color="#FFA502" intensity={2} distance={15} />
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshBasicMaterial color="#FFA502" transparent opacity={0.8} />
        </mesh>
      )}

      <Text
        position={[0, building.type === 'drilling' ? 8 : 6, 0]}
        fontSize={0.8}
        color="#F0F8FF"
        anchorX="center"
        anchorY="middle"
        renderOrder={100}
      >
        {building.name}
      </Text>

      <group position={[0, building.type === 'drilling' ? 9 : 7, 0]}>
        <Text
          fontSize={0.5}
          color={building.temperature < 0 ? '#00D4FF' : '#FFA502'}
          anchorX="center"
          anchorY="middle"
          renderOrder={100}
        >
          {building.temperature.toFixed(1)}°C | {building.humidity.toFixed(0)}%
        </Text>
      </group>

      <group position={[0, building.type === 'drilling' ? 10 : 8, 0]}>
        <Text
          fontSize={0.4}
          color="#00D4FF"
          anchorX="center"
          anchorY="middle"
          renderOrder={100}
        >
          {building.energyConsumption.toFixed(0)} kW
        </Text>
      </group>

      <mesh position={[0, building.type === 'drilling' ? 11 : 9, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshBasicMaterial 
          color={getStatusColor(building.equipmentStatus, false)} 
          transparent 
          opacity={0.9} 
        />
      </mesh>
    </group>
  );
}
