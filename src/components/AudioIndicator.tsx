
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';

interface AudioVisualizerProps {
  isActive: boolean;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ isActive }) => {
  const groupRef = useRef<THREE.Group>(null);
  const sphereRefs = useRef<(THREE.Mesh | null)[]>([]);

  // Create multiple spheres for the audio visualization
  const sphereCount = 12;
  const spheres = useMemo(() => {
    return Array.from({ length: sphereCount }, (_, i) => ({
      id: i,
      angle: (i / sphereCount) * Math.PI * 2,
      radius: 1.5,
      baseScale: 0.1 + (i % 3) * 0.05,
    }));
  }, [sphereCount]);

  useFrame((state) => {
    if (!isActive || !groupRef.current) return;

    const time = state.clock.getElapsedTime();
    
    // Rotate the entire group
    groupRef.current.rotation.y = time * 0.5;

    // Animate individual spheres
    sphereRefs.current.forEach((sphere, i) => {
      if (sphere) {
        const offset = i * 0.2;
        const scale = spheres[i].baseScale + Math.sin(time * 3 + offset) * 0.1;
        sphere.scale.setScalar(scale);
        
        // Pulsing effect
        const intensity = 0.5 + Math.sin(time * 4 + offset) * 0.3;
        if (sphere.material instanceof THREE.MeshStandardMaterial) {
          sphere.material.emissive.setRGB(0.2 * intensity, 0.4 * intensity, 1 * intensity);
        }
      }
    });
  });

  return (
    <group ref={groupRef}>
      {spheres.map((sphereData) => (
        <Sphere
          key={sphereData.id}
          ref={(el) => (sphereRefs.current[sphereData.id] = el)}
          args={[0.2, 16, 16]}
          position={[
            Math.cos(sphereData.angle) * sphereData.radius,
            Math.sin(sphereData.angle * 0.5) * 0.3,
            Math.sin(sphereData.angle) * sphereData.radius,
          ]}
        >
          <meshStandardMaterial 
            color="#007AFF"
            emissive="#001a33"
            roughness={0.2}
            metalness={0.8}
          />
        </Sphere>
      ))}
      
      {/* Central sphere */}
      <Sphere args={[0.3, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          color="#007AFF"
          emissive="#004080"
          roughness={0.1}
          metalness={0.9}
        />
      </Sphere>
    </group>
  );
};

interface AudioIndicatorProps {
  isActive: boolean;
  className?: string;
}

export const AudioIndicator: React.FC<AudioIndicatorProps> = ({ isActive, className = "" }) => {
  return (
    <div className={`w-32 h-32 ${className}`}>
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        <pointLight position={[-10, -10, -10]} intensity={0.3} color="#4A90E2" />
        <AudioVisualizer isActive={isActive} />
      </Canvas>
    </div>
  );
};
