import React, { useRef, useLayoutEffect, useImperativeHandle } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text3D, Center } from '@react-three/drei';
import { useCascadingTextTexture } from '../hooks/useCascadingTextTexture';
import { Mesh, MeshPhysicalMaterial, Group } from 'three';

interface CrystallineTextProps {
  text: string;
  font: string;
  height: number;
  bevelThickness: number;
  bevelSize: number;
  animation: string;
  ior: number;
  facetDensity: number;
  cascadingText: string;
  textDensity: number;
  textureGlyphSet: string;
  textureFallSpeed: number;
  textureFadeFactor: number;
  color: string;
  roughness: number;
  metalness: number;
  thickness: number;
  materialDispersion: number;
  sheenEnabled: boolean;
  sheenColor: string;
  sheenRoughness: number;
}

const CrystallineText = React.forwardRef<Group, CrystallineTextProps>(({ 
  text, font, height, bevelThickness, bevelSize, animation, ior, facetDensity, cascadingText, textDensity, 
  textureGlyphSet, textureFallSpeed, textureFadeFactor, color, roughness, metalness, thickness,
  materialDispersion, sheenEnabled, sheenColor, sheenRoughness
}, ref) => {
  const groupRef = useRef<Group>(null!);
  const textGroupRef = useRef<Group>(null!);
  const materialRef = useRef<MeshPhysicalMaterial | null>(null);

  useImperativeHandle(ref, () => groupRef.current!, []);
  const texture = useCascadingTextTexture(cascadingText, textDensity, textureGlyphSet, textureFallSpeed, textureFadeFactor);

  useLayoutEffect(() => {
    if (groupRef.current) {
        groupRef.current.position.set(0, 0, 0);
        groupRef.current.rotation.set(0, 0, 0);
        groupRef.current.scale.set(1, 1, 1);
    }
  }, [animation]);

  useLayoutEffect(() => {
    if (textGroupRef.current) {
      textGroupRef.current.traverse(child => {
        if (child instanceof Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          if (child.material instanceof MeshPhysicalMaterial) {
            materialRef.current = child.material;
          }
        }
      });
    }
  }, [text, font, height, facetDensity, bevelThickness, bevelSize]);

  useFrame(({ clock }, delta) => {
    if (materialRef.current && materialRef.current.map) {
        materialRef.current.map.offset.x += delta * 0.01;
        materialRef.current.map.offset.y -= delta * 0.005;
    }

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
        case 'Wobble':
          groupRef.current.rotation.x = Math.sin(t * 1.5) * 0.1;
          groupRef.current.rotation.y = Math.cos(t * 1.2) * 0.1;
          groupRef.current.rotation.z = Math.sin(t * 1.8) * 0.1;
          break;
        case 'Wave':
          groupRef.current.position.y = Math.sin(t * 2) * 0.3;
          groupRef.current.rotation.x = Math.sin(t * 1.5) * 0.2;
          break;
        case 'Static':
        default:
          break;
      }
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <Center>
        <Text3D
          // FIX: Cast ref to 'any' to bypass incorrect type definition from the library.
          // The Text3D component returns a Group, but its ref is typed as a Mesh.
          ref={textGroupRef as any}
          key={`${font}-${text}`}
          font={font}
          size={3}
          height={height}
          curveSegments={Math.round(facetDensity)}
          bevelEnabled
          bevelThickness={bevelThickness}
          bevelSize={bevelSize}
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
            // New Advanced Material Properties
            iridescence={materialDispersion > 0 ? 1 : 0}
            iridescenceIOR={1 + materialDispersion * 1.3}
            iridescenceThicknessRange={[0, 1400 * materialDispersion]}
            sheen={sheenEnabled ? 0.8 : 0}
            sheenColor={sheenColor}
            sheenRoughness={sheenRoughness}
          />
        </Text3D>
      </Center>
    </group>
  );
});

export default CrystallineText;
