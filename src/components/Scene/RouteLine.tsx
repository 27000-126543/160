import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface RouteLineProps {
  points: [number, number, number][];
  color: string;
  isActive: boolean;
  type?: 'escape' | 'helicopter' | 'research';
}

export function RouteLine({ points, color, isActive, type = 'escape' }: RouteLineProps) {
  const lineRef = useRef<THREE.Line>(null);
  const arrowsRef = useRef<THREE.Group>(null);

  const lineGeometry = useMemo(() => {
    const positions = new Float32Array(points.length * 3);
    points.forEach((point, i) => {
      positions[i * 3] = point[0];
      positions[i * 3 + 1] = type === 'helicopter' ? point[1] + 5 : point[1] + 0.1;
      positions[i * 3 + 2] = point[2];
    });
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geometry;
  }, [points, type]);

  const arrowPositions = useMemo(() => {
    const arrows: { position: [number, number, number]; rotation: [number, number, number] }[] = [];
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      const midX = (p1[0] + p2[0]) / 2;
      const midY = type === 'helicopter' ? (p1[1] + p2[1]) / 2 + 5 : (p1[1] + p2[1]) / 2 + 0.1;
      const midZ = (p1[2] + p2[2]) / 2;
      
      const dx = p2[0] - p1[0];
      const dz = p2[2] - p1[2];
      const rotationY = Math.atan2(dx, dz);
      
      arrows.push({
        position: [midX, midY, midZ],
        rotation: [0, rotationY, 0],
      });
    }
    return arrows;
  }, [points, type]);

  useFrame((state) => {
    if (lineRef.current && isActive) {
      const material = lineRef.current.material as THREE.LineDashedMaterial;
      (material as any).dashOffset = -state.clock.elapsedTime * 2;
    }
    if (arrowsRef.current && isActive) {
      arrowsRef.current.visible = isActive;
    }
  });

  if (!isActive) return null;

  return (
    <group>
      <primitive object={new THREE.Line(lineGeometry)} ref={lineRef}>
        <lineDashedMaterial
          color={color}
          linewidth={3}
          dashSize={1}
          gapSize={0.5}
          transparent
          opacity={0.9}
        />
      </primitive>

      <group ref={arrowsRef}>
        {arrowPositions.map((arrow, i) => (
          <mesh
            key={i}
            position={arrow.position}
            rotation={arrow.rotation}
          >
            <coneGeometry args={[0.3, 0.8, 4]} />
            <meshBasicMaterial color={color} transparent opacity={0.9} />
          </mesh>
        ))}
      </group>

      {type === 'helicopter' && (
        <mesh
          position={[
            points[points.length - 1][0],
            points[points.length - 1][1] + 5,
            points[points.length - 1][2]
          ]}
        >
          <pointLight color={color} intensity={2} distance={10} />
        </mesh>
      )}
    </group>
  );
}
