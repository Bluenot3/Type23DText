import React, { useState, Suspense, useRef, useEffect } from 'react';
import Scene from './components/Scene';
import Controls from './components/Controls';
import ExportPage from './components/ExportPage';
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
export const INTERACTIVE_EFFECT_LIST = [
    'Symbol Explosion & Flame', 
    'Geometric Burst', 
    'Vortex', 
    'Bubble Pop', 
    'Growing Orb', 
    'Electric Arcs',
    'Meteor Shower',
    'Liquid Metal',
    'Crystalline Growth',
    'Black Hole',
    'Water Droplets',
    'Glass Balls',
    'Molten Lava',
];

export const TEXTURE_GLYPH_PRESETS = {
  'Default': '0123456789{}[]()</>|&*^%$#@!+=-_',
  'Binary': '01',
  'Matrix': 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン',
  'Hex': '0123456789ABCDEF',
};

export const MATERIAL_PRESETS = {
  'Custom': {},
  'Crystal': { color: '#ffffff', roughness: 0.0, metalness: 0.02, thickness: 1.5, ior: 1.3, materialDispersion: 0.2, sheenEnabled: true, sheenColor: '#ffffff', sheenRoughness: 0.8 },
  'Ice': { color: '#a0d8ef', roughness: 0.1, metalness: 0.0, thickness: 2.5, ior: 1.31, materialDispersion: 0.05, sheenEnabled: false, sheenColor: '#ffffff', sheenRoughness: 0.5 },
  'Water': { color: '#d4f1f9', roughness: 0.1, metalness: 0.0, thickness: 4.0, ior: 1.33, materialDispersion: 0.1, sheenEnabled: false, sheenColor: '#ffffff', sheenRoughness: 0.5 },
  'Gold': { color: '#ffd700', roughness: 0.2, metalness: 0.8, thickness: 0.5, ior: 1.5, materialDispersion: 0, sheenEnabled: true, sheenColor: '#ffeebf', sheenRoughness: 0.3 },
  'Obsidian': { color: '#151515', roughness: 0.25, metalness: 0.1, thickness: 2.0, ior: 1.5, materialDispersion: 0, sheenEnabled: false, sheenColor: '#ffffff', sheenRoughness: 0.5 },
  'Holographic': { color: '#ff00ff', roughness: 0.0, metalness: 0.5, thickness: 1.0, ior: 2.4, materialDispersion: 0.8, sheenEnabled: true, sheenColor: '#00ffff', sheenRoughness: 0.2 },
};

const hslToHex = (h: number, s: number, l: number): string => {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

const App: React.FC = () => {
  // Page state
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const sceneRef = useRef<Group>(null!);
  
  // Automation state
  const [autoRunEnabled, setAutoRunEnabled] = useState<boolean>(false);

  // Text, Font, Geometry
  const [text, setText] = useState<string>('ZEN');
  const [font, setFont] = useState<string>(FONT_LIST['Optimer Bold']);
  const [textHeight, setTextHeight] = useState<number>(0.6);
  const [bevelThickness, setBevelThickness] = useState<number>(0.11);
  const [bevelSize, setBevelSize] = useState<number>(0.36);

  // Animation
  const [animation, setAnimation] = useState<string>('Float');

  // Material
  const [materialPreset, setMaterialPreset] = useState<string>('Holographic');
  const [ior, setIor] = useState<number>(2.4);
  const [color, setColor] = useState<string>('#ff00ff');
  const [roughness, setRoughness] = useState<number>(0.0);
  const [metalness, setMetalness] = useState<number>(0.5);
  const [thickness, setThickness] = useState<number>(1.0);
  const [facetDensity, setFacetDensity] = useState<number>(8);
  const [materialDispersion, setMaterialDispersion] = useState<number>(0.8);
  const [sheenEnabled, setSheenEnabled] = useState<boolean>(true);
  const [sheenColor, setSheenColor] = useState<string>('#00ffff');
  const [sheenRoughness, setSheenRoughness] = useState<number>(0.2);

  // Texture Generation
  const [cascadingText, setCascadingText] = useState<string>('CRYSTAL');
  const [textDensity, setTextDensity] = useState<number>(0.55);
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

  // Background Symbols
  const [backgroundSymbolsEnabled, setBackgroundSymbolsEnabled] = useState<boolean>(true);
  const [backgroundSymbolCount, setBackgroundSymbolCount] = useState<number>(500);
  const [backgroundSymbolSpread, setBackgroundSymbolSpread] = useState<number>(20);
  const [backgroundSymbolSize, setBackgroundSymbolSize] = useState<number>(0.2);
  const [backgroundSymbolColor, setBackgroundSymbolColor] = useState<string>('#ffffff');

  // Background Symbols Layer 2
  const [backgroundLayer2Enabled, setBackgroundLayer2Enabled] = useState<boolean>(true);
  const [backgroundLayer2Count, setBackgroundLayer2Count] = useState<number>(1000);
  const [backgroundLayer2Spread, setBackgroundLayer2Spread] = useState<number>(25);
  const [backgroundLayer2Size, setBackgroundLayer2Size] = useState<number>(0.1);

  // Scanner Effect
  const [scannerEffectEnabled, setScannerEffectEnabled] = useState<boolean>(true);
  const [scannerColor, setScannerColor] = useState<string>('#00ffff');
  const [scannerSpeed, setScannerSpeed] = useState<number>(0.5);
  const [scannerDensity, setScannerDensity] = useState<number>(20);

  // Lighting
  const [light1Color, setLight1Color] = useState<string>('#87ceeb');
  const [light1Intensity, setLight1Intensity] = useState<number>(1.5);
  const [light2Color, setLight2Color] = useState<string>('#ff8c00');
  const [light2Intensity, setLight2Intensity] = useState<number>(1.0);

  // Environment
  const [envPreset, setEnvPreset] = useState<string>('sunset');
  
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
  const [pixelation, setPixelation] = useState<number>(0);
  const [gridScale, setGridScale] = useState<number>(0);
  const [gridLineWidth, setGridLineWidth] = useState<number>(0.1);
  
  // Interactive Click/Hold Effects
  const [interactiveEffectsEnabled, setInteractiveEffectsEnabled] = useState<boolean>(true);
  const [interactiveEffectType, setInteractiveEffectType] = useState<string>('Symbol Explosion & Flame');
  const [effectColor1, setEffectColor1] = useState<string>('#ffffff');
  const [effectColor2, setEffectColor2] = useState<string>('#ff00ff');

  const handleMaterialPresetChange = (presetName: string) => {
    setMaterialPreset(presetName);
    const preset = MATERIAL_PRESETS[presetName as keyof typeof MATERIAL_PRESETS];
    if (preset && 'color' in preset) {
      setColor(preset.color);
      setRoughness(preset.roughness);
      setMetalness(preset.metalness);
      setThickness(preset.thickness);
      setIor(preset.ior);
      setMaterialDispersion(preset.materialDispersion);
      setSheenEnabled(preset.sheenEnabled);
      setSheenColor(preset.sheenColor);
      setSheenRoughness(preset.sheenRoughness);
    }
  };

  const handleTexturePresetChange = (presetName: string) => {
    setTextureGlyphPreset(presetName);
    const glyphs = TEXTURE_GLYPH_PRESETS[presetName as keyof typeof TEXTURE_GLYPH_PRESETS];
    if (glyphs) {
      setTextureGlyphSet(glyphs);
    }
  };
  
  const autoRunState = useRef({
    lastSwitchTime: 0,
    animationIndex: 0,
    materialPresetIndex: 0,
    particleAnimationIndex: 0,
    envPresetIndex: 0,
    interactiveEffectIndex: 0,
    animationFrameId: 0,
    typingState: 'TYPING' as 'TYPING' | 'PAUSED' | 'DELETING',
    textPresetIndex: 0,
    textSubPartIndex: 0,
    lastCharTime: 0,
  });

  useEffect(() => {
    if (!autoRunEnabled) {
      if (autoRunState.current.animationFrameId) {
        cancelAnimationFrame(autoRunState.current.animationFrameId);
        autoRunState.current.animationFrameId = 0;
      }
      return;
    }

    const presetCycleInterval = 10000; // 10 seconds

    const textPresets: (string | string[])[] = [
        'ZEN',
        'AI',
        ['AI', 'Pioneer', 'Program'],
        ['1st AI', 'Literacy Program', 'In US History']
    ];

    const otherPresetKeys = {
      animation: ANIMATION_LIST,
      materialPreset: Object.keys(MATERIAL_PRESETS),
      particleAnimation: PARTICLE_ANIMATION_LIST,
      envPreset: ENV_LIST,
      interactiveEffectType: INTERACTIVE_EFFECT_LIST,
    };

    const autoRunLoop = (time: number) => {
      const elapsedTime = time / 1000; // time in seconds

      if (time - autoRunState.current.lastSwitchTime > presetCycleInterval) {
        autoRunState.current.lastSwitchTime = time;

        const next = (key: 'animation' | 'materialPreset' | 'particleAnimation' | 'envPreset' | 'interactiveEffect', list: readonly any[]) => {
          const currentIndexName = `${key}Index` as keyof typeof autoRunState.current;
          const nextIndex = ((autoRunState.current[currentIndexName] as number) + 1) % list.length;
          (autoRunState.current as any)[currentIndexName] = nextIndex;
          return list[nextIndex];
        };
        
        setAnimation(next('animation', otherPresetKeys.animation));
        handleMaterialPresetChange(next('materialPreset', otherPresetKeys.materialPreset));
        setParticleAnimation(next('particleAnimation', otherPresetKeys.particleAnimation));
        setEnvPreset(next('envPreset', otherPresetKeys.envPreset));
        setInteractiveEffectType(next('interactiveEffect', otherPresetKeys.interactiveEffectType));
      }

      const mapSin = (val: number, min: number, max: number) => ((val + 1) / 2) * (max - min) + min;
      
      setTextHeight(mapSin(Math.sin(elapsedTime * 0.1), 0.2, 1.5));
      setBevelThickness(mapSin(Math.sin(elapsedTime * 0.15), 0, 0.25));
      setBevelSize(mapSin(Math.sin(elapsedTime * 0.2), 0, 0.25));
      setFacetDensity(Math.round(mapSin(Math.sin(elapsedTime * 0.25), 3, 20)));
      setParticleSpread(mapSin(Math.sin(elapsedTime * 0.3), 2, 15));
      setBloomIntensity(mapSin(Math.sin(elapsedTime * 0.12), 0.2, 1.8));
      setChromaticAberrationOffset(mapSin(Math.sin(elapsedTime * 0.18), 0, 0.004));

      if (materialPreset === 'Custom') {
        setIor(mapSin(Math.sin(elapsedTime * 0.35), 1.0, 2.4));
        setRoughness(mapSin(Math.sin(elapsedTime * 0.4), 0, 1));
        setMetalness(mapSin(Math.sin(elapsedTime * 0.08), 0, 1));
        setThickness(mapSin(Math.sin(elapsedTime * 0.1), 0.5, 4));
        setMaterialDispersion(mapSin(Math.sin(elapsedTime * 0.22), 0, 1));
      }
      
      const hue = (elapsedTime * 20) % 360;
      setLight1Color(hslToHex((hue + 120) % 360, 80, 60));
      setLight2Color(hslToHex((hue + 240) % 360, 80, 60));
      setScannerColor(hslToHex(hue, 100, 50));
      if (materialPreset === 'Custom') {
          setColor(hslToHex((hue + 60) % 360, 90, 55));
          setSheenColor(hslToHex((hue + 200) % 360, 90, 75));
      }
      
      // --- Text Typing Animation Logic ---
      const typingSpeed = 150; // ms per character
      const deleteSpeed = 100; // ms per character
      const pauseDuration = 6500; // 6.5 seconds

      const { typingState, textPresetIndex, textSubPartIndex, lastCharTime } = autoRunState.current;
      const currentPreset = textPresets[textPresetIndex];

      let currentTargetText = '';

      if (typeof currentPreset === 'string') {
          currentTargetText = currentPreset;
      } else { // It's an array for additive typing
          currentTargetText = currentPreset.slice(0, textSubPartIndex + 1).join(' ');
      }
      
      switch (typingState) {
        case 'TYPING':
          if (time - lastCharTime > typingSpeed) {
            setText(currentText => {
              if (currentText.length < currentTargetText.length) {
                autoRunState.current.lastCharTime = time;
                return currentTargetText.substring(0, currentText.length + 1);
              } else {
                autoRunState.current.typingState = 'PAUSED';
                autoRunState.current.lastCharTime = time;
                return currentText;
              }
            });
          }
          break;
        case 'PAUSED':
          if (time - lastCharTime > pauseDuration) {
            if (typeof currentPreset === 'string') {
                autoRunState.current.typingState = 'DELETING';
            } else {
                if (textSubPartIndex < currentPreset.length - 1) {
                    autoRunState.current.textSubPartIndex++;
                    autoRunState.current.typingState = 'TYPING';
                } else {
                    autoRunState.current.typingState = 'DELETING';
                }
            }
            autoRunState.current.lastCharTime = time;
          }
          break;
        case 'DELETING':
          if (time - lastCharTime > deleteSpeed) {
            setText(currentText => {
              if (currentText.length > 0) {
                autoRunState.current.lastCharTime = time;
                return currentText.substring(0, currentText.length - 1);
              } else {
                autoRunState.current.textPresetIndex = (textPresetIndex + 1) % textPresets.length;
                autoRunState.current.textSubPartIndex = 0; // Reset for the next preset
                autoRunState.current.typingState = 'TYPING';
                autoRunState.current.lastCharTime = time;
                return ''; // Ensure text is empty
              }
            });
          }
          break;
      }


      autoRunState.current.animationFrameId = requestAnimationFrame(autoRunLoop);
    };

    if (autoRunEnabled) {
      setText(''); // Clear text to begin typing animation
      autoRunState.current.lastSwitchTime = performance.now();
      autoRunState.current.lastCharTime = performance.now();
      autoRunState.current.animationFrameId = requestAnimationFrame(autoRunLoop);
    }

    return () => {
      if (autoRunState.current.animationFrameId) {
        cancelAnimationFrame(autoRunState.current.animationFrameId);
        autoRunState.current.animationFrameId = 0;
      }
    };
  }, [autoRunEnabled, materialPreset]);

  const settings = {
    text, font, textHeight, bevelThickness, bevelSize, animation, materialPreset,
    ior, color, roughness, metalness, thickness, facetDensity, cascadingText,
    textDensity, textureGlyphPreset, textureGlyphSet, textureFallSpeed, textureFadeFactor,
    materialDispersion, sheenEnabled, sheenColor, sheenRoughness,
    particlesEnabled, particleCount, particleSize, particleSpread, particleAnimation,
    particleSpeed, particleGravity,
    backgroundSymbolsEnabled, backgroundSymbolCount, backgroundSymbolSpread, backgroundSymbolSize, backgroundSymbolColor,
    backgroundLayer2Enabled, backgroundLayer2Count, backgroundLayer2Spread, backgroundLayer2Size,
    scannerEffectEnabled, scannerColor, scannerSpeed, scannerDensity,
    light1Color, light1Intensity, light2Color, light2Intensity, envPreset, bloomIntensity,
    chromaticAberrationOffset, vignetteDarkness, godRaysIntensity, noiseIntensity,
    dofIntensity, glitchIntensity, scanlineIntensity, dotScreenIntensity,
    pixelation, gridScale, gridLineWidth,
    interactiveEffectsEnabled, interactiveEffectType, effectColor1, effectColor2
  };

  return (
    <main className="relative w-screen h-screen antialiased">
      {isExporting ? (
        <ExportPage 
          settings={settings}
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
            setMaterialDispersion={setMaterialDispersion}
            setSheenEnabled={setSheenEnabled}
            setSheenColor={setSheenColor}
            setSheenRoughness={setSheenRoughness}
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
            setBackgroundSymbolsEnabled={setBackgroundSymbolsEnabled}
            setBackgroundSymbolCount={setBackgroundSymbolCount}
            setBackgroundSymbolSpread={setBackgroundSymbolSpread}
            setBackgroundSymbolSize={setBackgroundSymbolSize}
            setBackgroundSymbolColor={setBackgroundSymbolColor}
            setBackgroundLayer2Enabled={setBackgroundLayer2Enabled}
            setBackgroundLayer2Count={setBackgroundLayer2Count}
            setBackgroundLayer2Spread={setBackgroundLayer2Spread}
            setBackgroundLayer2Size={setBackgroundLayer2Size}
            setScannerEffectEnabled={setScannerEffectEnabled}
            setScannerColor={setScannerColor}
            setScannerSpeed={setScannerSpeed}
            setScannerDensity={setScannerDensity}
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
            setPixelation={setPixelation}
            setGridScale={setGridScale}
            setGridLineWidth={setGridLineWidth}
            setInteractiveEffectsEnabled={setInteractiveEffectsEnabled}
            setInteractiveEffectType={setInteractiveEffectType}
            setEffectColor1={setEffectColor1}
            setEffectColor2={setEffectColor2}
            autoRunEnabled={autoRunEnabled}
            setAutoRunEnabled={setAutoRunEnabled}
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