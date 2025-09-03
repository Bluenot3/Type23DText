
import React, { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import CrystallineText from './CrystallineText';
import Effects from './Effects';
import type { Mesh } from 'three';

interface SceneProps {
  text: string;
  font: string;
  animation: string;
  ior: number;
  facetDensity: number;
  textDensity: number;
  color: string;
  roughness: number;
  metalness: number;
  thickness: number;
  envPreset: string;
  cascadingText: string;
  bloomIntensity: number;
  chromaticAberrationOffset: number;
  vignetteDarkness: number;
  godRaysIntensity: number;
  noiseIntensity: number;
  dofIntensity: number;
  glitchIntensity: number;
  scanlineIntensity: number;
}

const Scene = React.forwardRef<Mesh, SceneProps>(({ 
  text, font, animation, ior, facetDensity, textDensity,
  color, roughness, metalness, thickness, envPreset,
  cascadingText, bloomIntensity, chromaticAberrationOffset, vignetteDarkness,
  godRaysIntensity, noiseIntensity, dofIntensity, glitchIntensity, scanlineIntensity
}, ref) => {
  const godRaysLightSourceRef = useRef<Mesh>(null!);

  return (
    <Canvas
      shadows
      gl={{ antialias: false, preserveDrawingBuffer: true }} // SMAA will handle anti-aliasing
      camera={{ position: [0, 0, 8], fov: 50 }}
    >
      <color attach="background" args={['#101015']} />
      
      {/* Lights */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#87ceeb" />
      <pointLight position={[-10, -10, -5]} intensity={1} color="#ff8c00" />
      <spotLight 
        position={[0, 15, 0]} 
        intensity={2} 
        angle={0.3} 
        penumbra={1} 
        castShadow 
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      {/* God-rays light source - now invisible */}
      <mesh ref={godRaysLightSourceRef} position={[0, 0, -5]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color="white" visible={false} />
      </mesh>

      <CrystallineText 
        ref={ref}
        text={text}
        font={font}
        animation={animation}
        ior={ior} 
        facetDensity={facetDensity} 
        cascadingText={cascadingText}
        textDensity={textDensity}
        color={color}
        roughness={roughness}
        metalness={metalness}
        thickness={thickness}
      />
      
      <Environment preset={envPreset as any} />
      
      <Effects 
        bloomIntensity={bloomIntensity}
        chromaticAberrationOffset={chromaticAberrationOffset}
        vignetteDarkness={vignetteDarkness}
        godRaysIntensity={godRaysIntensity}
        noiseIntensity={noiseIntensity}
        godRaysLightSourceRef={godRaysLightSourceRef}
        dofIntensity={dofIntensity}
        glitchIntensity={glitchIntensity}
        scanlineIntensity={scanlineIntensity}
      />
      
      <OrbitControls 
        minDistance={3}
        maxDistance={20}
        enablePan={false}
      />
    </Canvas>
  );
});

export default Scene;