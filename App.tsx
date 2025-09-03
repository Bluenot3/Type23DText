
import React, { useState, Suspense, useRef } from 'react';
import Scene from './components/Scene';
import Controls from './components/Controls';
import ExportPage from './components/ExportPage';
import type { Mesh } from 'three';

export const FONT_LIST = {
  'Helvetica Bold': 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/fonts/helvetiker_bold.typeface.json',
  'Gentilis Bold': 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/fonts/gentilis_bold.typeface.json',
  'Optimer Bold': 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/fonts/optimer_bold.typeface.json',
  'Droid Sans Mono': 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/fonts/droid/droid_sans_mono_regular.typeface.json',
};

export const ENV_LIST = ['city', 'sunset', 'dawn', 'night', 'warehouse', 'forest', 'apartment', 'studio', 'lobby'];

export const ANIMATION_LIST = ['Static', 'Float', 'Spin', 'Pulse'];

export const MATERIAL_PRESETS = {
  'Custom': {},
  'Crystal': { color: '#ffffff', roughness: 0.0, metalness: 0.02, thickness: 1.5, ior: 1.3 },
  'Ice': { color: '#a0d8ef', roughness: 0.1, metalness: 0.0, thickness: 2.5, ior: 1.31 },
  'Gold': { color: '#ffd700', roughness: 0.2, metalness: 0.8, thickness: 0.5, ior: 1.5 },
  'Obsidian': { color: '#151515', roughness: 0.25, metalness: 0.1, thickness: 2.0, ior: 1.5 },
  'Holographic': { color: '#ff00ff', roughness: 0.0, metalness: 0.5, thickness: 1.0, ior: 2.4 },
};

const App: React.FC = () => {
  // Page state
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const sceneRef = useRef<Mesh>(null!);

  // Text, Material, Animation properties
  const [text, setText] = useState<string>('3D');
  const [font, setFont] = useState<string>(FONT_LIST['Helvetica Bold']);
  const [animation, setAnimation] = useState<string>('Float');
  const [materialPreset, setMaterialPreset] = useState<string>('Crystal');
  const [ior, setIor] = useState<number>(1.3);
  const [facetDensity, setFacetDensity] = useState<number>(8);
  const [textDensity, setTextDensity] = useState<number>(0.3);
  const [color, setColor] = useState<string>('#ffffff');
  const [roughness, setRoughness] = useState<number>(0.0);
  const [metalness, setMetalness] = useState<number>(0.02);
  const [thickness, setThickness] = useState<number>(1.5);
  const [envPreset, setEnvPreset] = useState<string>('city');
  const [cascadingText, setCascadingText] = useState<string>('CRYSTAL');
  
  // Post-processing effects
  const [bloomIntensity, setBloomIntensity] = useState<number>(0.7);
  const [chromaticAberrationOffset, setChromaticAberrationOffset] = useState<number>(0.001);
  const [vignetteDarkness, setVignetteDarkness] = useState<number>(1.1);
  const [godRaysIntensity, setGodRaysIntensity] = useState<number>(0.3);
  const [noiseIntensity, setNoiseIntensity] = useState<number>(0.05);
  const [dofIntensity, setDofIntensity] = useState<number>(0.2);
  const [glitchIntensity, setGlitchIntensity] = useState<number>(0.0);
  const [scanlineIntensity, setScanlineIntensity] = useState<number>(0.0);

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

  const settings = {
    text, font, ior, facetDensity, textDensity, color, roughness, metalness, thickness, envPreset, animation,
    cascadingText, bloomIntensity, chromaticAberrationOffset, vignetteDarkness, godRaysIntensity, noiseIntensity,
    dofIntensity, glitchIntensity, scanlineIntensity
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
          <header className="absolute top-0 left-0 z-10 p-4 md:p-6">
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wider">
              Crystal Text
            </h1>
            <p className="text-sm text-gray-400 max-w-xs">
              An interactive 3D crystalline sculpture generator.
            </p>
          </header>
          
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
            materialPreset={materialPreset}
            setText={setText}
            setFont={setFont}
            setAnimation={setAnimation}
            setMaterialPreset={handleMaterialPresetChange}
            setIor={setIor}
            setFacetDensity={setFacetDensity}
            setTextDensity={setTextDensity}
            setColor={setColor}
            setRoughness={setRoughness}
            setMetalness={setMetalness}
            setThickness={setThickness}
            setEnvPreset={setEnvPreset}
            setCascadingText={setCascadingText}
            setBloomIntensity={setBloomIntensity}
            setChromaticAberrationOffset={setChromaticAberrationOffset}
            setVignetteDarkness={setVignetteDarkness}
            setGodRaysIntensity={setGodRaysIntensity}
            setNoiseIntensity={setNoiseIntensity}
            setDofIntensity={setDofIntensity}
            setGlitchIntensity={setGlitchIntensity}
            setScanlineIntensity={setScanlineIntensity}
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
