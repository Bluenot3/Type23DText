
import React, { useMemo } from 'react';
import { EffectComposer, Bloom, ChromaticAberration, Vignette, SMAA, GodRays, Noise, DepthOfField, Glitch, Scanline } from '@react-three/postprocessing';
import { Vector2, Mesh } from 'three';
import { BlendFunction, Resolution, KernelSize, GlitchMode } from 'postprocessing';

interface EffectsProps {
  bloomIntensity: number;
  chromaticAberrationOffset: number;
  vignetteDarkness: number;
  godRaysIntensity: number;
  noiseIntensity: number;
  godRaysLightSourceRef: React.RefObject<Mesh>;
  dofIntensity: number;
  glitchIntensity: number;
  scanlineIntensity: number;
}

const Effects: React.FC<EffectsProps> = ({ 
  bloomIntensity, 
  chromaticAberrationOffset, 
  vignetteDarkness,
  godRaysIntensity,
  noiseIntensity,
  godRaysLightSourceRef,
  dofIntensity,
  glitchIntensity,
  scanlineIntensity
}) => {
  const aberrationOffset = useMemo(() => new Vector2(chromaticAberrationOffset, chromaticAberrationOffset), [chromaticAberrationOffset]);
  const glitchStrength = useMemo(() => new Vector2(glitchIntensity, glitchIntensity * 2), [glitchIntensity]);

  return (
    <EffectComposer>
      <Bloom 
        luminanceThreshold={0.2} 
        luminanceSmoothing={0.9} 
        height={300} 
        intensity={bloomIntensity} 
      />
      <ChromaticAberration 
        offset={aberrationOffset} 
      />
      <Vignette 
        eskil={false} 
        offset={0.1} 
        darkness={vignetteDarkness} 
      />
      {godRaysLightSourceRef.current && (
        <GodRays
          sun={godRaysLightSourceRef.current}
          blendFunction={BlendFunction.SCREEN}
          samples={30}
          density={0.97}
          decay={0.97}
          weight={0.6 * godRaysIntensity}
          exposure={0.4 * godRaysIntensity}
          clampMax={1}
          width={Resolution.AUTO_SIZE}
          height={Resolution.AUTO_SIZE}
          kernelSize={KernelSize.SMALL}
          blur={true}
        />
      )}
       <Noise
        premultiply
        blendFunction={BlendFunction.ADD}
        opacity={noiseIntensity}
      />
      <DepthOfField
        focusDistance={0.01 * dofIntensity}
        focalLength={0.2 * dofIntensity}
        bokehScale={4 * dofIntensity}
        height={480}
      />
       <Glitch
        delay={new Vector2(1.5, 3.5)}
        duration={new Vector2(0.2, 0.5)}
        strength={glitchStrength}
        mode={GlitchMode.SPORADIC}
        active={glitchIntensity > 0.0001}
        ratio={0.5}
      />
      <Scanline
        blendFunction={BlendFunction.OVERLAY}
        density={scanlineIntensity * 5}
        opacity={scanlineIntensity * 0.2}
      />
      <SMAA />
    </EffectComposer>
  );
};

export default Effects;
