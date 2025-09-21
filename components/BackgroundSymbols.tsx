import React, { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Object3D, Color, AdditiveBlending, InstancedMesh, PlaneGeometry, MeshBasicMaterial, InstancedBufferAttribute, DynamicDrawUsage } from 'three';
import { useCharacterAtlas } from '../hooks/useCharacterAtlas';

interface BackgroundSymbolsProps {
  count: number;
  spread: number;
  size: number;
  color: string; // Note: This prop is currently unused to favor the multi-color palette.
}

// A vibrant color palette for the streaks
const VIBRANT_PALETTE = [
  '#00ffff', '#ff00ff', '#00ff00', '#ffff00', '#ff8800', '#8800ff', '#4d94ff',
];
const tempObject = new Object3D();
const tempColor = new Color();


const BackgroundSymbols: React.FC<BackgroundSymbolsProps> = ({ count, spread, size }) => {
  const meshRef = useRef<InstancedMesh>(null!);
  const { viewport } = useThree();
  const { texture, atlasData, charList, tileWidth, tileHeight } = useCharacterAtlas();

  const maxInstances = Math.min(count, 8000);

  const { geometry, uvOffsetAttr, opacityAttr } = useMemo(() => {
    const geom = new PlaneGeometry(1, 1);
    const uvOffset = new InstancedBufferAttribute(new Float32Array(maxInstances * 2), 2);
    uvOffset.setUsage(DynamicDrawUsage);
    const opacity = new InstancedBufferAttribute(new Float32Array(maxInstances), 1);
    opacity.setUsage(DynamicDrawUsage);
    geom.setAttribute('uvOffset', uvOffset);
    geom.setAttribute('instanceOpacity', opacity);
    return { geometry: geom, uvOffsetAttr: uvOffset, opacityAttr: opacity };
  }, [maxInstances]);
  
  // Helper function to initialize or reset a streak with new random properties
  const resetStreak = (streak: any, topBoundary: number) => {
    streak.x = (Math.random() - 0.5) * spread;
    streak.z = (Math.random() - 0.5) * spread * 0.2 - 3;
    streak.y = topBoundary + Math.random() * 10;
    streak.speed = 1.5 + Math.random() * 4;
    streak.color = new Color(VIBRANT_PALETTE[Math.floor(Math.random() * VIBRANT_PALETTE.length)]);
    streak.trailLength = Math.floor(20 + Math.random() * 30); // Longer trails
    streak.randomChars = Array.from({ length: streak.trailLength }, () => charList[Math.floor(Math.random() * charList.length)]);
    
    // Properties for unique, flowing designs
    streak.sineFrequency = Math.random() * 0.5 + 0.1;
    streak.sineAmplitude = Math.random() * 0.5;
    return streak;
  };

  const streaks = useMemo(() => {
    const topBoundary = viewport.height / 2 + 2;
    // Base the number of streaks on the total instance count and average trail length
    const numStreaks = Math.floor(maxInstances / 35); 
    return Array.from({ length: numStreaks }, () => resetStreak({}, topBoundary));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxInstances, spread, viewport.height, charList]);
  
  const material = useMemo(() => {
    const mat = new MeshBasicMaterial({
      map: texture,
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
    });

    mat.onBeforeCompile = (shader) => {
      shader.uniforms.tileDimensions = { value: [tileWidth, tileHeight] };
      
      shader.vertexShader = `
        attribute vec2 uvOffset;
        attribute float instanceOpacity;
        varying vec2 vUvOffset;
        varying float vInstanceOpacity;
        ${shader.vertexShader}
      `.replace(
        '#include <begin_vertex>',
        `
        #include <begin_vertex>
        vUvOffset = uvOffset;
        vInstanceOpacity = instanceOpacity;
        `
      );

      shader.fragmentShader = `
        uniform vec2 tileDimensions;
        varying vec2 vUvOffset;
        varying float vInstanceOpacity;
        ${shader.fragmentShader}
      `
      .replace(
        'vec4 texelColor = texture2D( map, vUv );',
        `
        vec2 finalUv = (vUv * tileDimensions) + vUvOffset;
        vec4 texelColor = texture2D( map, finalUv );
        `
      )
      .replace(
        '#include <opaque_fragment>',
        `
        #include <opaque_fragment>
        diffuseColor.a *= vInstanceOpacity;
        `
      );
    };
    mat.customProgramCacheKey = () => 'digital_rain_material_v3'; 
    return mat;
  }, [texture, tileWidth, tileHeight]);
  

  useFrame((state, delta) => {
    if (!meshRef.current || !atlasData.size) return;

    let instanceIdx = 0;
    const topBoundary = viewport.height / 2 + 2;
    const bottomBoundary = -viewport.height / 2 - 2;

    streaks.forEach(streak => {
      streak.y -= streak.speed * delta;
      
      const trailBottom = streak.y - streak.trailLength * size;
      if (trailBottom < bottomBoundary) {
        resetStreak(streak, topBoundary);
      }
      
      const xPos = streak.x + Math.sin(state.clock.elapsedTime * streak.sineFrequency + streak.y * 0.2) * streak.sineAmplitude;
      
      for(let i = 0; i < streak.trailLength; i++) {
        if (instanceIdx >= maxInstances) break;
        
        const yPos = streak.y - i * size;
        if (yPos > topBoundary || yPos < bottomBoundary) continue;

        const isHead = i === 0;
        
        tempObject.position.set(xPos, yPos, streak.z);
        tempObject.scale.setScalar(size);
        tempObject.updateMatrix();
        meshRef.current.setMatrixAt(instanceIdx, tempObject.matrix);

        const char = streak.randomChars[Math.floor(state.clock.elapsedTime * streak.speed * 2 + i) % streak.randomChars.length];
        const uvData = atlasData.get(char);
        if (uvData) {
          uvOffsetAttr.setXY(instanceIdx, uvData.u, uvData.v);
        }

        // Smoother trail fade-out
        const opacity = isHead ? 1.0 : Math.pow(1.0 - (i / streak.trailLength), 1.5);
        opacityAttr.setX(instanceIdx, opacity);

        meshRef.current.setColorAt(instanceIdx, isHead ? tempColor.set('white') : streak.color);

        instanceIdx++;
      }
    });

    meshRef.current.count = instanceIdx;
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    uvOffsetAttr.needsUpdate = true;
    opacityAttr.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[geometry, material, maxInstances]} />
  );
};

export default BackgroundSymbols;