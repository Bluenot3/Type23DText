
import React, { useRef, useLayoutEffect, useImperativeHandle } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text3D } from '@react-three/drei';
import { useCascadingTextTexture } from '../hooks/useCascadingTextTexture';
import type { Mesh } from 'three';

interface CrystallineTextProps {
  text: string;
  font: string;
  animation: string;
  ior: number;
  facetDensity: number;
  cascadingText: string;
  textDensity: number;
  color: string;
  roughness: number;
  metalness: number;
  thickness: number;
}

const CrystallineText = React.forwardRef<Mesh, CrystallineTextProps>(({ 
  text, font, animation, ior, facetDensity, cascadingText, textDensity, color, roughness, metalness, thickness 
}, ref) => {
  const groupRef = useRef<Mesh>(null!);
  useImperativeHandle(ref, () => groupRef.current!, []);
  const texture = useCascadingTextTexture(cascadingText, textDensity);

  useLayoutEffect(() => {
    if (groupRef.current) {
        groupRef.current.position.set(0, 0, 0);
        groupRef.current.rotation.set(0, 0, 0);
        groupRef.current.scale.set(1, 1, 1);
    }
  }, [animation]);

  useFrame(({ clock }, delta) => {
    if (groupRef.current) {
      const t = clock.getElapsedTime();
      switch (animation) {
        case 'Float':
          groupRef.current.rotation.y += delta * 0.1;
          groupRef.current.position.y = Math.sin(t * 0.7) * 0.2;
          break;
        case 'Spin':
          groupRef.current.rotation.y += delta * 0.3;
          break;
        case 'Pulse':
          const scale = 1 + Math.sin(t * 1.5) * 0.05;
          groupRef.current.scale.set(scale, scale, scale);
          groupRef.current.rotation.y += delta * 0.05;
          break;
        case 'Static':
        default:
          break;
      }
    }
  });

  return (
    <mesh ref={groupRef} position={[0, 0, 0]} castShadow receiveShadow>
      <Text3D
        key={`${font}-${text}`}
        font={font}
        size={3}
        height={1}
        curveSegments={Math.round(facetDensity)}
        bevelEnabled
        bevelThickness={0.1}
        bevelSize={0.05}
        bevelSegments={Math.round(facetDensity / 2)}
      >
        {text}
        <meshPhysicalMaterial
          map={texture}
          emissiveMap={texture}
          emissive={"#ffffff"}
          emissiveIntensity={0.5}
          transmission={1.0}
          roughness={roughness}
          thickness={thickness}
          ior={ior}
          specularIntensity={1}
          envMapIntensity={1}
          metalness={metalness}
          color={color}
        />
      </Text3D>
    </mesh>
  );
});

export default CrystallineText;