
import React, { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import CrystallineText from './CrystallineText';
import Effects from './Effects';
import SurroundingParticles from './SurroundingParticles';
import InteractiveEffects from './InteractiveEffects';
import BackgroundSymbols from './BackgroundSymbols';
import ScannerEffect from './ScannerEffect';
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
  materialDispersion: number;
  sheenEnabled: boolean;
  sheenColor: string;
  sheenRoughness: number;
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
  backgroundSymbolsEnabled: boolean;
  backgroundSymbolCount: number;
  backgroundSymbolSpread: number;
  backgroundSymbolSize: number;
  backgroundSymbolColor: string;
  backgroundLayer2Enabled: boolean;
  backgroundLayer2Count: number;
  backgroundLayer2Spread: number;
  backgroundLayer2Size: number;
  scannerEffectEnabled: boolean;
  scannerColor: string;
  scannerSpeed: number;
  scannerDensity: number;
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
  pixelation: number;
  gridScale: number;
  gridLineWidth: number;
  interactiveEffectsEnabled: boolean;
  interactiveEffectType: string;
  effectColor1: string;
  effectColor2: string;
}

const Scene = React.forwardRef<Group, SceneProps>(({ 
  text, font, textHeight, bevelThickness, bevelSize, animation, ior, facetDensity,
  color, roughness, metalness, thickness, materialDispersion, sheenEnabled, sheenColor, sheenRoughness,
  envPreset, cascadingText, textDensity, textureGlyphSet, textureFallSpeed, textureFadeFactor, particlesEnabled,
  particleCount, particleSize, particleSpread, particleAnimation, particleSpeed, particleGravity,
  backgroundSymbolsEnabled, backgroundSymbolCount, backgroundSymbolSpread, backgroundSymbolSize, backgroundSymbolColor,
  backgroundLayer2Enabled, backgroundLayer2Count, backgroundLayer2Spread, backgroundLayer2Size,
  scannerEffectEnabled, scannerColor, scannerSpeed, scannerDensity,
  light1Color, light1Intensity, light2Color, light2Intensity, bloomIntensity, 
  chromaticAberrationOffset, vignetteDarkness, godRaysIntensity, noiseIntensity, 
  dofIntensity, glitchIntensity, scanlineIntensity, dotScreenIntensity,
  pixelation, gridScale, gridLineWidth,
  interactiveEffectsEnabled, interactiveEffectType, effectColor1, effectColor2
}, ref) => {
  const godRaysLightSourceRef = useRef<Mesh>(null!);

  return (
    <Canvas
      shadows
      gl={{ antialias: false, preserveDrawingBuffer: true }}
      dpr={[1, 2]}
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

      <mesh ref={godRaysLightSourceRef} position={[0, 0, -5]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color="white" visible={false} />
      </mesh>

      {scannerEffectEnabled && (
        <ScannerEffect 
            color={scannerColor}
            speed={scannerSpeed}
            density={scannerDensity}
        />
      )}

      {backgroundLayer2Enabled && (
        <group position={[0, 0, -5]}>
            <BackgroundSymbols 
              count={backgroundLayer2Count}
              spread={backgroundLayer2Spread}
              size={backgroundLayer2Size}
              color={backgroundSymbolColor}
            />
        </group>
      )}

      {backgroundSymbolsEnabled && (
        <BackgroundSymbols 
          count={backgroundSymbolCount}
          spread={backgroundSymbolSpread}
          size={backgroundSymbolSize}
          color={backgroundSymbolColor}
        />
      )}

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
        materialDispersion={materialDispersion}
        sheenEnabled={sheenEnabled}
        sheenColor={sheenColor}
        sheenRoughness={sheenRoughness}
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
      
      {interactiveEffectsEnabled && (
        <InteractiveEffects
            effectType={interactiveEffectType}
            effectColor1={effectColor1}
            effectColor2={effectColor2}
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
        pixelation={pixelation}
        gridScale={gridScale}
        gridLineWidth={gridLineWidth}
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
