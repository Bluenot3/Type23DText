import React, { useState, Suspense, useRef } from 'react';
import Scene from './components/Scene';
import Controls from './components/Controls';
import ExportPage from './components/ExportPage';
// FIX: The scene ref now points to a Group instead of a Mesh.
import type { Group } from 'three';

export const FONT_LIST = {
  'Helvetica Bold': 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/fonts/helvetiker_bold.typeface.json',
  'Gentilis Bold': 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/fonts/gentilis_bold.typeface.json',
  'Optimer Bold': 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/fonts/optimer_bold.typeface.json',
  'Droid Sans Mono': 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/fonts/droid/droid_sans_mono_regular.typeface.json',
};

export const ENV_LIST = ['city', 'sunset', 'dawn', 'night', 'warehouse', 'forest', 'apartment', 'studio', 'lobby'];

export const ANIMATION_LIST = ['Static', 'Float', 'Spin', 'Pulse', 'Wobble', 'Wave'];
export const PARTICLE_ANIMATION_LIST = ['Static', 'Orbit', 'Random Drift', 'Sparks'];

export const TEXTURE_GLYPH_PRESETS = {
  'Default': '0123456789{}[]()</>|&*^%$#@!+=-_',
  'Binary': '01',
  'Matrix': 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン',
  'Hex': '0123456789ABCDEF',
};

export const MATERIAL_PRESETS = {
  'Custom': {},
  'Crystal': { color: '#ffffff', roughness: 0.0, metalness: 0.02, thickness: 1.5, ior: 1.3 },
  'Ice': { color: '#a0d8ef', roughness: 0.1, metalness: 0.0, thickness: 2.5, ior: 1.31 },
  'Water': { color: '#d4f1f9', roughness: 0.1, metalness: 0.0, thickness: 4.0, ior: 1.33 },
  'Gold': { color: '#ffd700', roughness: 0.2, metalness: 0.8, thickness: 0.5, ior: 1.5 },
  'Obsidian': { color: '#151515', roughness: 0.25, metalness: 0.1, thickness: 2.0, ior: 1.5 },
  'Holographic': { color: '#ff00ff', roughness: 0.0, metalness: 0.5, thickness: 1.0, ior: 2.4 },
};

const App: React.FC = () => {
  // Page state
  const [isExporting, setIsExporting] = useState<boolean>(false);
  // FIX: The scene ref now points to a Group instead of a Mesh.
  const sceneRef = useRef<Group>(null!);

  // Text, Font, Geometry
  const [text, setText] = useState<string>('ZEN');
  const [font, setFont] = useState<string>(FONT_LIST['Helvetica Bold']);
  const [textHeight, setTextHeight] = useState<number>(1);
  const [bevelThickness, setBevelThickness] = useState<number>(0.1);
  const [bevelSize, setBevelSize] = useState<number>(0.05);

  // Animation
  const [animation, setAnimation] = useState<string>('Float');

  // Material
  const [materialPreset, setMaterialPreset] = useState<string>('Water');
  const [ior, setIor] = useState<number>(1.33);
  const [color, setColor] = useState<string>('#d4f1f9');
  const [roughness, setRoughness] = useState<number>(0.1);
  const [metalness, setMetalness] = useState<number>(0.0);
  const [thickness, setThickness] = useState<number>(4.0);
  const [facetDensity, setFacetDensity] = useState<number>(8);

  // Texture Generation
  const [cascadingText, setCascadingText] = useState<string>('CRYSTAL');
  const [textDensity, setTextDensity] = useState<number>(0.3);
  const [textureGlyphPreset, setTextureGlyphPreset] = useState<string>('Default');
  const [textureGlyphSet, setTextureGlyphSet] = useState<string>(TEXTURE_GLYPH_PRESETS['Default']);
  const [textureFallSpeed, setTextureFallSpeed] = useState<number>(1.0);
  const [textureFadeFactor, setTextureFadeFactor] = useState<number>(0.05);

  // Surrounding Particles
  const [particlesEnabled, setParticlesEnabled] = useState<boolean>(true);
  const [particleCount, setParticleCount] = useState<number>(200);
  const [particleSize, setParticleSize] = useState<number>(0.05);
  const [particleSpread, setParticleSpread] = useState<number>(5);
  const [particleAnimation, setParticleAnimation] = useState<string>('Orbit');
  const [particleSpeed, setParticleSpeed] = useState<number>(15.0);
  const [particleGravity, setParticleGravity] = useState<number>(0.5);

  // Lighting
  const [light1Color, setLight1Color] = useState<string>('#87ceeb');
  const [light1Intensity, setLight1Intensity] = useState<number>(1.5);
  const [light2Color, setLight2Color] = useState<string>('#ff8c00');
  const [light2Intensity, setLight2Intensity] = useState<number>(1.0);

  // Environment
  const [envPreset, setEnvPreset] = useState<string>('city');
  
  // Post-processing effects
  const [bloomIntensity, setBloomIntensity] = useState<number>(0.7);
  const [chromaticAberrationOffset, setChromaticAberrationOffset] = useState<number>(0.001);
  const [vignetteDarkness, setVignetteDarkness] = useState<number>(1.1);
  const [godRaysIntensity, setGodRaysIntensity] = useState<number>(0.3);
  const [noiseIntensity, setNoiseIntensity] = useState<number>(0.05);
  const [dofIntensity, setDofIntensity] = useState<number>(0.1);
  const [glitchIntensity, setGlitchIntensity] = useState<number>(0.0);
  const [scanlineIntensity, setScanlineIntensity] = useState<number>(0.0);
  const [dotScreenIntensity, setDotScreenIntensity] = useState<number>(0.0);

  const handleMaterialPresetChange = (presetName: string) => {
    setMaterialPreset(presetName);
    const preset = MATERIAL_PRESETS[presetName as keyof typeof MATERIAL_PRESETS];
    if (preset && 'color' in preset) {
      setColor(preset.color);
      setRoughness(preset.roughness);
      setMetalness(preset.metalness);
      setThickness(preset.thickness);
      setIor(preset.ior);
    }
  };

  const handleTexturePresetChange = (presetName: string) => {
    setTextureGlyphPreset(presetName);
    const glyphs = TEXTURE_GLYPH_PRESETS[presetName as keyof typeof TEXTURE_GLYPH_PRESETS];
    if (glyphs) {
      setTextureGlyphSet(glyphs);
    }
  };

  const settings = {
    text, font, textHeight, bevelThickness, bevelSize, animation, materialPreset,
    ior, color, roughness, metalness, thickness, facetDensity, cascadingText,
    textDensity, textureGlyphPreset, textureGlyphSet, textureFallSpeed, textureFadeFactor,
    particlesEnabled, particleCount, particleSize, particleSpread, particleAnimation,
    particleSpeed, particleGravity,
    light1Color, light1Intensity, light2Color, light2Intensity, envPreset, bloomIntensity,
    chromaticAberrationOffset, vignetteDarkness, godRaysIntensity, noiseIntensity,
    dofIntensity, glitchIntensity, scanlineIntensity, dotScreenIntensity
  };

  return (
    <main className="relative w-screen h-screen antialiased">
      {isExporting ? (
        <ExportPage 
          settings={settings}
          sceneRef={sceneRef}
          onBack={() => setIsExporting(false)}
        />
      ) : (
        <>
          <div className="w-full h-full">
            <Suspense fallback={<Loader />}>
              <Scene 
                ref={sceneRef}
                {...settings}
              />
            </Suspense>
          </div>

          <Controls 
            {...settings}
            setText={setText}
            setFont={setFont}
            setTextHeight={setTextHeight}
            setBevelThickness={setBevelThickness}
            setBevelSize={setBevelSize}
            setAnimation={setAnimation}
            setMaterialPreset={handleMaterialPresetChange}
            setIor={setIor}
            setColor={setColor}
            setRoughness={setRoughness}
            setMetalness={setMetalness}
            setThickness={setThickness}
            setFacetDensity={setFacetDensity}
            setCascadingText={setCascadingText}
            setTextDensity={setTextDensity}
            setTextureGlyphPreset={handleTexturePresetChange}
            setTextureGlyphSet={setTextureGlyphSet}
            setTextureFallSpeed={setTextureFallSpeed}
            setTextureFadeFactor={setTextureFadeFactor}
            setParticlesEnabled={setParticlesEnabled}
            setParticleCount={setParticleCount}
            setParticleSize={setParticleSize}
            setParticleSpread={setParticleSpread}
            setParticleAnimation={setParticleAnimation}
            setParticleSpeed={setParticleSpeed}
            setParticleGravity={setParticleGravity}
            setLight1Color={setLight1Color}
            setLight1Intensity={setLight1Intensity}
            setLight2Color={setLight2Color}
            setLight2Intensity={setLight2Intensity}
            setEnvPreset={setEnvPreset}
            setBloomIntensity={setBloomIntensity}
            setChromaticAberrationOffset={setChromaticAberrationOffset}
            setVignetteDarkness={setVignetteDarkness}
            setGodRaysIntensity={setGodRaysIntensity}
            setNoiseIntensity={setNoiseIntensity}
            setDofIntensity={setDofIntensity}
            setGlitchIntensity={setGlitchIntensity}
            setScanlineIntensity={setScanlineIntensity}
            setDotScreenIntensity={setDotScreenIntensity}
            onExport={() => setIsExporting(true)}
          />
        </>
      )}
    </main>
  );
};

const Loader: React.FC = () => {
  return (
    <div className="w-full h-full flex justify-center items-center bg-gray-900">
      <div className="text-white text-lg font-medium">Loading 3D Scene...</div>
    </div>
  );
};

export default App;
