// FIX: Add a triple-slash directive to help TypeScript resolve React Three Fiber's custom JSX elements.
/// <reference types="@react-three/fiber" />

import React, { useRef, useLayoutEffect, useImperativeHandle } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text3D, Center } from '@react-three/drei';
import { useCascadingTextTexture } from '../hooks/useCascadingTextTexture';
import { Mesh, MeshPhysicalMaterial, Group, Box3, Vector3, MathUtils } from 'three';

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
  const outerGroupRef = useRef<Group>(null!);
  const animationGroupRef = useRef<Group>(null!);
  const textGroupRef = useRef<Group>(null!);
  const materialRef = useRef<MeshPhysicalMaterial | null>(null);
  const targetScale = useRef(1);

  useImperativeHandle(ref, () => outerGroupRef.current!, []);
  const texture = useCascadingTextTexture(cascadingText, textDensity, textureGlyphSet, textureFallSpeed, textureFadeFactor);

  useLayoutEffect(() => {
    // Reset animation group state when animation changes
    if (animationGroupRef.current) {
        animationGroupRef.current.position.set(0, 0, 0);
        animationGroupRef.current.rotation.set(0, 0, 0);
        animationGroupRef.current.scale.set(1, 1, 1);
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
      
      // Calculate the size and set the target scale for adaptive resizing
      const box = new Box3().setFromObject(textGroupRef.current);
      const size = box.getSize(new Vector3());
      
      const desiredMaxWidth = 7.5; // Empirically chosen value to fit camera view
      if (size.x > 0) {
        targetScale.current = Math.min(1.0, desiredMaxWidth / size.x);
      } else {
        targetScale.current = 1.0; // Reset if there's no text
      }
    }
  }, [text, font, height, facetDensity, bevelThickness, bevelSize]);

  useFrame(({ clock }, delta) => {
    if (materialRef.current && materialRef.current.map) {
        materialRef.current.map.offset.x += delta * 0.01;
        materialRef.current.map.offset.y -= delta * 0.005;
    }
    
    // Lerp the outer group's scale towards the target scale for smooth resizing
    if (outerGroupRef.current) {
        const currentScale = outerGroupRef.current.scale.x;
        const newScale = MathUtils.lerp(currentScale, targetScale.current, 0.1);
        outerGroupRef.current.scale.setScalar(newScale);
    }

    if (animationGroupRef.current) {
      const t = clock.getElapsedTime();
      switch (animation) {
        case 'Float':
          animationGroupRef.current.rotation.y += delta * 0.1;
          animationGroupRef.current.position.y = Math.sin(t * 0.7) * 0.2;
          break;
        case 'Spin':
          animationGroupRef.current.rotation.y += delta * 0.3;
          break;
        case 'Pulse':
          const scale = 1 + Math.sin(t * 1.5) * 0.05;
          animationGroupRef.current.scale.set(scale, scale, scale);
          animationGroupRef.current.rotation.y += delta * 0.05;
          break;
        case 'Wobble':
          animationGroupRef.current.rotation.x = Math.sin(t * 1.5) * 0.1;
          animationGroupRef.current.rotation.y = Math.cos(t * 1.2) * 0.1;
          animationGroupRef.current.rotation.z = Math.sin(t * 1.8) * 0.1;
          break;
        case 'Wave':
          animationGroupRef.current.position.y = Math.sin(t * 2) * 0.3;
          animationGroupRef.current.rotation.x = Math.sin(t * 1.5) * 0.2;
          break;
        case 'Static':
        default:
          break;
      }
    }
  });

  return (
    <group ref={outerGroupRef}>
      <group ref={animationGroupRef}>
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
    </group>
  );
});

export default CrystallineText;