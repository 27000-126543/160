import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { Personnel } from '../../types';
import { usePersonnelStore } from '../../store/personnelStore';
import { useSceneStore } from '../../store/sceneStore';

interface PersonnelModelProps {
  personnel: Personnel;
}

export function PersonnelModel({ personnel }: PersonnelModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const selectPersonnel = usePersonnelStore(state => state.selectPersonnel);
  const selectedPersonnel = usePersonnelStore(state => state.selectedPersonnel);
  const isSelected = selectedPersonnel?.id === personnel.id;
  const emergencyActive = useSceneStore(state => state.emergencyActive);

  useFrame((state) => {
    if (groupRef.current) {
      const bounce = Math.sin(state.clock.elapsedTime * 3) * 0.05;
      groupRef.current.position.y = personnel.coords[1] + bounce;
    }
  });

  const handleClick = (e: { stopPropagation: () => void; }) => {
    e.stopPropagation();
    selectPersonnel(isSelected ? null : personnel);
  };

  const bodyColor = personnel.inDangerZone ? '#FF4757' : '#2ED573';
  const headColor = personnel.inDangerZone ? '#FF6B7A' : '#FFE4C4';

  return (
    <group
      ref={groupRef}
      position={personnel.coords}
      onClick={handleClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
      }}
    >
      <mesh position={[0, 0.4, 0]}>
        <capsuleGeometry args={[0.15, 0.4, 4, 8]} />
        <meshStandardMaterial 
          color={bodyColor} 
          emissive={personnel.inDangerZone ? '#FF4757' : '#000000'}
          emissiveIntensity={personnel.inDangerZone ? 0.5 : 0}
        />
      </mesh>

      <mesh position={[0, 0.9, 0]}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial color={headColor} />
      </mesh>

      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.12, 0.15, 0.1, 8]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>

      {personnel.inDangerZone && (
        <mesh position={[0, 1.5, 0]}>
          <pointLight color="#FF4757" intensity={2} distance={5} />
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshBasicMaterial 
            color="#FF4757" 
            transparent 
            opacity={0.8 + Math.sin(Date.now() * 0.01) * 0.2} 
          />
        </mesh>
      )}

      {isSelected && (
        <mesh position={[0, 0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.4, 0.5, 32]} />
          <meshBasicMaterial color="#00D4FF" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
      )}

      <Billboard position={[0, 1.8, 0]}>
        <group>
          <Text
            fontSize={0.3}
            color="#F0F8FF"
            anchorX="center"
            anchorY="middle"
            renderOrder={100}
          >
            {personnel.name}
          </Text>
          <Text
            position={[0, -0.35, 0]}
            fontSize={0.2}
            color="#00D4FF"
            anchorX="center"
            anchorY="middle"
            renderOrder={100}
          >
            {personnel.role}
          </Text>
          <Text
            position={[0, -0.7, 0]}
            fontSize={0.18}
            color={personnel.heartRate > 90 ? '#FF4757' : '#2ED573'}
            anchorX="center"
            anchorY="middle"
            renderOrder={100}
          >
            ❤️ {personnel.heartRate} bpm
          </Text>
          <Text
            position={[0, -1.0, 0]}
            fontSize={0.18}
            color={personnel.bloodOxygen < 95 ? '#FFA502' : '#2ED573'}
            anchorX="center"
            anchorY="middle"
            renderOrder={100}
          >
            🩸 {personnel.bloodOxygen}% SpO2
          </Text>
        </group>
      </Billboard>

      {personnel.inDangerZone && (
        <Billboard position={[0, 2.5, 0]}>
          <Text
            fontSize={0.4}
            color="#FF4757"
            anchorX="center"
            anchorY="middle"
            renderOrder={100}
          >
            ⚠️ 危险区！请立即撤离
          </Text>
        </Billboard>
      )}

      {emergencyActive && (
        <Billboard position={[0, 2.8, 0]}>
          <Text
            fontSize={0.35}
            color="#FFA502"
            anchorX="center"
            anchorY="middle"
            renderOrder={100}
          >
            🔴 紧急疏散中
          </Text>
        </Billboard>
      )}
    </group>
  );
}
