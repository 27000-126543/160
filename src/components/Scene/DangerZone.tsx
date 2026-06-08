import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { DANGER_ZONE } from '../../store/personnelStore';

export function DangerZone() {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.2 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
    if (ringRef.current) {
      ringRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  return (
    <group position={DANGER_ZONE.center}>
      <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[DANGER_ZONE.radius, 32]} />
        <meshBasicMaterial 
          color="#FF4757" 
          transparent 
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[DANGER_ZONE.radius - 0.5, DANGER_ZONE.radius, 32]} />
        <meshBasicMaterial 
          color="#FF4757" 
          transparent 
          opacity={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>

      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const x = Math.cos(angle) * (DANGER_ZONE.radius - 2);
        const z = Math.sin(angle) * (DANGER_ZONE.radius - 2);
        return (
          <group key={i} position={[x, 0.5, z]}>
            <mesh rotation={[0, -angle, 0]}>
              <boxGeometry args={[0.3, 1, 0.1]} />
              <meshStandardMaterial color="#FFA502" />
            </mesh>
            <mesh position={[0, 0.7, 0]} rotation={[0, -angle, 0]}>
              <coneGeometry args={[0.2, 0.4, 4]} />
              <meshStandardMaterial color="#FF4757" />
            </mesh>
          </group>
        );
      })}

      <Text
        position={[0, 3, 0]}
        fontSize={1}
        color="#FF4757"
        anchorX="center"
        anchorY="middle"
        renderOrder={100}
      >
        ⚠️ 冰裂隙危险区
      </Text>

      <Text
        position={[0, 2, 0]}
        fontSize={0.5}
        color="#FFA502"
        anchorX="center"
        anchorY="middle"
        renderOrder={100}
      >
        禁止入内 | 半径: {DANGER_ZONE.radius}m
      </Text>

      <pointLight 
        position={[0, 5, 0]} 
        color="#FF4757" 
        intensity={1} 
        distance={20}
      />
    </group>
  );
}
