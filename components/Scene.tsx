import React, { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import CrystallineText from './CrystallineText';
import Effects from './Effects';
import SurroundingParticles from './SurroundingParticles';
// FIX: The forwarded ref now points to a Group instead of a Mesh.
import type { Mesh, Group } from 'three';

interface SceneProps {
  text: string;
  font: string;
  textHeight: number;
  bevelThickness: number;
  bevelSize: number;
  animation: string;
  ior: number;
  facetDensity: number;
  color: string;
  roughness: number;
  metalness: number;
  thickness: number;
  cascadingText: string;
  textDensity: number;
  textureGlyphSet: string;
  textureFallSpeed: number;
  textureFadeFactor: number;
  particlesEnabled: boolean;
  particleCount: number;
  particleSize: number;
  particleSpread: number;
  particleAnimation: string;
  particleSpeed: number;
  particleGravity: number;
  light1Color: string;
  light1Intensity: number;
  light2Color: string;
  light2Intensity: number;
  envPreset: string;
  bloomIntensity: number;
  chromaticAberrationOffset: number;
  vignetteDarkness: number;
  godRaysIntensity: number;
  noiseIntensity: number;
  dofIntensity: number;
  glitchIntensity: number;
  scanlineIntensity: number;
  dotScreenIntensity: number;
}

// FIX: The forwarded ref now points to a Group instead of a Mesh.
const Scene = React.forwardRef<Group, SceneProps>(({ 
  text, font, textHeight, bevelThickness, bevelSize, animation, ior, facetDensity,
  color, roughness, metalness, thickness, envPreset, cascadingText, textDensity,
  textureGlyphSet, textureFallSpeed, textureFadeFactor, particlesEnabled, particleCount,
  particleSize, particleSpread, particleAnimation, particleSpeed, particleGravity,
  light1Color, light1Intensity, light2Color, light2Intensity, bloomIntensity, 
  chromaticAberrationOffset, vignetteDarkness, godRaysIntensity, noiseIntensity, 
  dofIntensity, glitchIntensity, scanlineIntensity, dotScreenIntensity
}, ref) => {
  const godRaysLightSourceRef = useRef<Mesh>(null!);

  return (
    <Canvas
      shadows
      gl={{ antialias: false, preserveDrawingBuffer: true }} // SMAA will handle anti-aliasing in Effects
      dpr={[1, 2]} // Use device pixel ratio, up to 2x, for sharper rendering on high-res screens
      camera={{ position: [0, 0, 8], fov: 50 }}
    >
      <color attach="background" args={['#101015']} />
      
      {/* Lights */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={light1Intensity} color={light1Color} />
      <pointLight position={[-10, -10, -5]} intensity={light2Intensity} color={light2Color} />
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
        height={textHeight}
        bevelThickness={bevelThickness}
        bevelSize={bevelSize}
        animation={animation}
        ior={ior} 
        facetDensity={facetDensity} 
        cascadingText={cascadingText}
        textDensity={textDensity}
        textureGlyphSet={textureGlyphSet}
        textureFallSpeed={textureFallSpeed}
        textureFadeFactor={textureFadeFactor}
        color={color}
        roughness={roughness}
        metalness={metalness}
        thickness={thickness}
      />

      {particlesEnabled && (
        <SurroundingParticles 
          count={particleCount}
          size={particleSize}
          spread={particleSpread}
          animation={particleAnimation}
          speed={particleSpeed}
          gravity={particleGravity}
        />
      )}
      
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
        dotScreenIntensity={dotScreenIntensity}
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
