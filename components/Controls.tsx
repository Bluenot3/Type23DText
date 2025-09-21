
import React, { useState } from 'react';
import { FONT_LIST, ENV_LIST, ANIMATION_LIST, MATERIAL_PRESETS, TEXTURE_GLYPH_PRESETS, PARTICLE_ANIMATION_LIST, INTERACTIVE_EFFECT_LIST } from '../App';

interface ControlsProps {
  text: string;
  setText: React.Dispatch<React.SetStateAction<string>>;
  font: string;
  setFont: React.Dispatch<React.SetStateAction<string>>;
  textHeight: number;
  setTextHeight: React.Dispatch<React.SetStateAction<number>>;
  bevelThickness: number;
  setBevelThickness: React.Dispatch<React.SetStateAction<number>>;
  bevelSize: number;
  setBevelSize: React.Dispatch<React.SetStateAction<number>>;
  animation: string;
  setAnimation: React.Dispatch<React.SetStateAction<string>>;
  materialPreset: string;
  setMaterialPreset: (preset: string) => void;
  ior: number;
  setIor: React.Dispatch<React.SetStateAction<number>>;
  facetDensity: number;
  setFacetDensity: React.Dispatch<React.SetStateAction<number>>;
  color: string;
  setColor: React.Dispatch<React.SetStateAction<string>>;
  roughness: number;
  setRoughness: React.Dispatch<React.SetStateAction<number>>;
  metalness: number;
  setMetalness: React.Dispatch<React.SetStateAction<number>>;
  thickness: number;
  setThickness: React.Dispatch<React.SetStateAction<number>>;
  materialDispersion: number;
  setMaterialDispersion: React.Dispatch<React.SetStateAction<number>>;
  sheenEnabled: boolean;
  setSheenEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  sheenColor: string;
  setSheenColor: React.Dispatch<React.SetStateAction<string>>;
  sheenRoughness: number;
  setSheenRoughness: React.Dispatch<React.SetStateAction<number>>;
  envPreset: string;
  setEnvPreset: React.Dispatch<React.SetStateAction<string>>;
  cascadingText: string;
  setCascadingText: React.Dispatch<React.SetStateAction<string>>;
  textDensity: number;
  setTextDensity: React.Dispatch<React.SetStateAction<number>>;
  textureGlyphPreset: string;
  setTextureGlyphPreset: (preset: string) => void;
  textureGlyphSet: string;
  setTextureGlyphSet: React.Dispatch<React.SetStateAction<string>>;
  textureFallSpeed: number;
  setTextureFallSpeed: React.Dispatch<React.SetStateAction<number>>;
  textureFadeFactor: number;
  setTextureFadeFactor: React.Dispatch<React.SetStateAction<number>>;
  particlesEnabled: boolean;
  setParticlesEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  particleCount: number;
  setParticleCount: React.Dispatch<React.SetStateAction<number>>;
  particleSize: number;
  setParticleSize: React.Dispatch<React.SetStateAction<number>>;
  particleSpread: number;
  setParticleSpread: React.Dispatch<React.SetStateAction<number>>;
  particleAnimation: string;
  setParticleAnimation: React.Dispatch<React.SetStateAction<string>>;
  particleSpeed: number;
  setParticleSpeed: React.Dispatch<React.SetStateAction<number>>;
  particleGravity: number;
  setParticleGravity: React.Dispatch<React.SetStateAction<number>>;
  backgroundSymbolsEnabled: boolean;
  setBackgroundSymbolsEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  backgroundSymbolCount: number;
  setBackgroundSymbolCount: React.Dispatch<React.SetStateAction<number>>;
  backgroundSymbolSpread: number;
  setBackgroundSymbolSpread: React.Dispatch<React.SetStateAction<number>>;
  backgroundSymbolSize: number;
  setBackgroundSymbolSize: React.Dispatch<React.SetStateAction<number>>;
  backgroundSymbolColor: string;
  setBackgroundSymbolColor: React.Dispatch<React.SetStateAction<string>>;
  backgroundLayer2Enabled: boolean;
  setBackgroundLayer2Enabled: React.Dispatch<React.SetStateAction<boolean>>;
  backgroundLayer2Count: number;
  setBackgroundLayer2Count: React.Dispatch<React.SetStateAction<number>>;
  backgroundLayer2Spread: number;
  setBackgroundLayer2Spread: React.Dispatch<React.SetStateAction<number>>;
  backgroundLayer2Size: number;
  setBackgroundLayer2Size: React.Dispatch<React.SetStateAction<number>>;
  scannerEffectEnabled: boolean;
  setScannerEffectEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  scannerColor: string;
  setScannerColor: React.Dispatch<React.SetStateAction<string>>;
  scannerSpeed: number;
  setScannerSpeed: React.Dispatch<React.SetStateAction<number>>;
  scannerDensity: number;
  setScannerDensity: React.Dispatch<React.SetStateAction<number>>;
  light1Color: string;
  setLight1Color: React.Dispatch<React.SetStateAction<string>>;
  light1Intensity: number;
  setLight1Intensity: React.Dispatch<React.SetStateAction<number>>;
  light2Color: string;
  setLight2Color: React.Dispatch<React.SetStateAction<string>>;
  light2Intensity: number;
  setLight2Intensity: React.Dispatch<React.SetStateAction<number>>;
  bloomIntensity: number;
  setBloomIntensity: React.Dispatch<React.SetStateAction<number>>;
  chromaticAberrationOffset: number;
  setChromaticAberrationOffset: React.Dispatch<React.SetStateAction<number>>;
  vignetteDarkness: number;
  setVignetteDarkness: React.Dispatch<React.SetStateAction<number>>;
  godRaysIntensity: number;
  setGodRaysIntensity: React.Dispatch<React.SetStateAction<number>>;
  noiseIntensity: number;
  setNoiseIntensity: React.Dispatch<React.SetStateAction<number>>;
  dofIntensity: number;
  setDofIntensity: React.Dispatch<React.SetStateAction<number>>;
  glitchIntensity: number;
  setGlitchIntensity: React.Dispatch<React.SetStateAction<number>>;
  scanlineIntensity: number;
  setScanlineIntensity: React.Dispatch<React.SetStateAction<number>>;
  dotScreenIntensity: number;
  setDotScreenIntensity: React.Dispatch<React.SetStateAction<number>>;
  pixelation: number;
  setPixelation: React.Dispatch<React.SetStateAction<number>>;
  gridScale: number;
  setGridScale: React.Dispatch<React.SetStateAction<number>>;
  gridLineWidth: number;
  setGridLineWidth: React.Dispatch<React.SetStateAction<number>>;
  interactiveEffectsEnabled: boolean;
  setInteractiveEffectsEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  interactiveEffectType: string;
  setInteractiveEffectType: React.Dispatch<React.SetStateAction<string>>;
  effectColor1: string;
  setEffectColor1: React.Dispatch<React.SetStateAction<string>>;
  effectColor2: string;
  setEffectColor2: React.Dispatch<React.SetStateAction<string>>;
  autoRunEnabled: boolean;
  setAutoRunEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  onExport: () => void;
}

const ControlSlider: React.FC<{
  label: string;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  min: number;
  max: number;
  step: number;
  displayFactor?: number;
  disabled?: boolean;
}> = ({ label, value, onChange, min, max, step, displayFactor = 1, disabled = false }) => (
  <div className="flex flex-col space-y-2">
    <div className="flex justify-between items-center">
      <label className="text-sm font-medium text-gray-300">{label}</label>
      <span className="px-2 py-1 text-xs font-mono bg-gray-900/50 rounded">
        {(value * displayFactor).toFixed(3)}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer range-sm disabled:cursor-not-allowed disabled:opacity-50"
    />
  </div>
);

const Toggle: React.FC<{
  label: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}> = ({ label, checked, onChange, disabled = false }) => (
  <div className="flex justify-between items-center">
    <label className="text-sm font-medium text-gray-300">{label}</label>
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" disabled={disabled} />
      <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-sky-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600 peer-disabled:cursor-not-allowed peer-disabled:opacity-50"></div>
    </label>
  </div>
);

const Section: React.FC<{ title: string; children: React.ReactNode, defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => (
  <details className="[&_summary]:hover:bg-white/10 rounded-md transition-colors" open={defaultOpen}>
    <summary className="text-base font-semibold border-b border-white/20 pb-2 mb-4 cursor-pointer p-2 list-none flex justify-between items-center">
      {title}
      <svg className="w-4 h-4 text-gray-400 transform transition-transform details-open:rotate-180" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
    </summary>
    <div className="space-y-4 p-2">{children}</div>
  </details>
);

const Controls: React.FC<ControlsProps> = (props) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className={`absolute bottom-4 right-4 z-10 text-white transition-all duration-300 ease-in-out ${isOpen ? 'w-64 md:w-80 p-2 bg-black/40 backdrop-blur-md rounded-lg shadow-2xl border border-white/10 max-h-[calc(100vh-4rem)] overflow-y-auto visible opacity-100' : 'w-0 h-0 overflow-hidden invisible opacity-0'}`}>
        <div className="space-y-2">
            <Section title="Automation" defaultOpen={true}>
              <Toggle label="Auto-run Showcase" checked={props.autoRunEnabled} onChange={e => props.setAutoRunEnabled(e.target.checked)} />
              <p className="text-xs text-gray-500 pt-2">Automatically cycles through settings to showcase different visual combinations.</p>
            </Section>

            <Section title="Text & Font" defaultOpen={!props.autoRunEnabled}>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Display Text</label>
                  <input type="text" value={props.text} onChange={(e) => props.setText(e.target.value)} maxLength={8} disabled={props.autoRunEnabled} className="w-full bg-gray-900/50 text-white placeholder-gray-500 border border-white/20 rounded-md px-3 py-2 text-sm focus:ring-sky-500 focus:border-sky-500 disabled:cursor-not-allowed disabled:opacity-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Font</label>
                  <select value={props.font} onChange={(e) => props.setFont(e.target.value)} disabled={props.autoRunEnabled} className="w-full bg-gray-900/50 text-white border border-white/20 rounded-md px-3 py-2 text-sm focus:ring-sky-500 focus:border-sky-500 disabled:cursor-not-allowed disabled:opacity-50">
                    {Object.entries(FONT_LIST).map(([name, url]) => (<option key={name} value={url}>{name}</option>))}
                  </select>
                </div>
            </Section>
            
            <Section title="Geometry">
              <ControlSlider label="Depth" value={props.textHeight} onChange={e => props.setTextHeight(parseFloat(e.target.value))} min={0.1} max={5} step={0.05} disabled={props.autoRunEnabled} />
              <ControlSlider label="Bevel Thickness" value={props.bevelThickness} onChange={e => props.setBevelThickness(parseFloat(e.target.value))} min={0} max={0.5} step={0.01} disabled={props.autoRunEnabled} />
              <ControlSlider label="Bevel Size" value={props.bevelSize} onChange={e => props.setBevelSize(parseFloat(e.target.value))} min={0} max={0.5} step={0.01} disabled={props.autoRunEnabled} />
            </Section>
            
            <Section title="Animation">
                <label className="block text-sm font-medium text-gray-300">Style</label>
                <select value={props.animation} onChange={(e) => props.setAnimation(e.target.value)} disabled={props.autoRunEnabled} className="w-full bg-gray-900/50 text-white border border-white/20 rounded-md px-3 py-2 text-sm focus:ring-sky-500 focus:border-sky-500 disabled:cursor-not-allowed disabled:opacity-50">
                  {ANIMATION_LIST.map((name) => (<option key={name} value={name}>{name}</option>))}
                </select>
            </Section>
            
            <Section title="Material">
                 <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Preset</label>
                  <select value={props.materialPreset} onChange={(e) => props.setMaterialPreset(e.target.value)} disabled={props.autoRunEnabled} className="w-full bg-gray-900/50 text-white border border-white/20 rounded-md px-3 py-2 text-sm focus:ring-sky-500 focus:border-sky-500 disabled:cursor-not-allowed disabled:opacity-50">
                    {Object.keys(MATERIAL_PRESETS).map((name) => (<option key={name} value={name}>{name}</option>))}
                  </select>
                </div>
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-gray-300">Color</label>
                    <input type="color" value={props.color} onChange={e => props.setColor(e.target.value)} disabled={props.autoRunEnabled} className="w-8 h-8 p-0 border-none rounded bg-transparent disabled:cursor-not-allowed disabled:opacity-50" />
                </div>
                <ControlSlider label="Roughness" value={props.roughness} onChange={(e) => props.setRoughness(parseFloat(e.target.value))} min={0} max={1} step={0.01} disabled={props.autoRunEnabled} />
                <ControlSlider label="Metalness" value={props.metalness} onChange={(e) => props.setMetalness(parseFloat(e.target.value))} min={0} max={1} step={0.01} disabled={props.autoRunEnabled} />
                <ControlSlider label="Thickness" value={props.thickness} onChange={(e) => props.setThickness(parseFloat(e.target.value))} min={0} max={5} step={0.05} disabled={props.autoRunEnabled} />
                <ControlSlider label="Index of Refraction" value={props.ior} onChange={(e) => props.setIor(parseFloat(e.target.value))} min={1.0} max={2.4} step={0.01} disabled={props.autoRunEnabled} />
                <ControlSlider label="Facet Density" value={props.facetDensity} onChange={(e) => props.setFacetDensity(parseInt(e.target.value, 10))} min={1} max={24} step={1} disabled={props.autoRunEnabled} />
                <ControlSlider label="Material Dispersion" value={props.materialDispersion} onChange={(e) => props.setMaterialDispersion(parseFloat(e.target.value))} min={0} max={1} step={0.01} disabled={props.autoRunEnabled} />
                <div className="space-y-2 pt-2 border-t border-white/10">
                    <Toggle label="Enable Sheen" checked={props.sheenEnabled} onChange={e => props.setSheenEnabled(e.target.checked)} disabled={props.autoRunEnabled} />
                    {props.sheenEnabled && (
                        <>
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-medium text-gray-300">Sheen Color</label>
                                <input type="color" value={props.sheenColor} onChange={e => props.setSheenColor(e.target.value)} disabled={props.autoRunEnabled} className="w-8 h-8 p-0 border-none rounded bg-transparent disabled:cursor-not-allowed disabled:opacity-50" />
                            </div>
                            <ControlSlider label="Sheen Roughness" value={props.sheenRoughness} onChange={(e) => props.setSheenRoughness(parseFloat(e.target.value))} min={0} max={1} step={0.01} disabled={props.autoRunEnabled} />
                        </>
                    )}
                </div>
            </Section>

            <Section title="Texture Generation">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Cascading Message</label>
                  <input type="text" value={props.cascadingText} onChange={(e) => props.setCascadingText(e.target.value)} maxLength={30} disabled={props.autoRunEnabled} className="w-full bg-gray-900/50 text-white placeholder-gray-500 border border-white/20 rounded-md px-3 py-2 text-sm focus:ring-sky-500 focus:border-sky-500 disabled:cursor-not-allowed disabled:opacity-50" />
                </div>
                 <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Glyph Preset</label>
                  <select value={props.textureGlyphPreset} onChange={(e) => props.setTextureGlyphPreset(e.target.value)} disabled={props.autoRunEnabled} className="w-full bg-gray-900/50 text-white border border-white/20 rounded-md px-3 py-2 text-sm focus:ring-sky-500 focus:border-sky-500 disabled:cursor-not-allowed disabled:opacity-50">
                    {Object.keys(TEXTURE_GLYPH_PRESETS).map((name) => (<option key={name} value={name}>{name}</option>))}
                    <option value="Custom">Custom</option>
                  </select>
                </div>
                {props.textureGlyphPreset === 'Custom' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Custom Glyphs</label>
                    <input type="text" value={props.textureGlyphSet} onChange={(e) => props.setTextureGlyphSet(e.target.value)} disabled={props.autoRunEnabled} className="w-full bg-gray-900/50 text-white placeholder-gray-500 border border-white/20 rounded-md px-3 py-2 text-sm focus:ring-sky-500 focus:border-sky-500 disabled:cursor-not-allowed disabled:opacity-50" />
                  </div>
                )}
                 <ControlSlider label="Texture Density" value={props.textDensity} onChange={(e) => props.setTextDensity(parseFloat(e.target.value))} min={0.05} max={1.0} step={0.01} disabled={props.autoRunEnabled} />
                 <ControlSlider label="Fall Speed" value={props.textureFallSpeed} onChange={(e) => props.setTextureFallSpeed(parseFloat(e.target.value))} min={0.1} max={5} step={0.1} disabled={props.autoRunEnabled} />
                 <ControlSlider label="Fade Factor" value={props.textureFadeFactor} onChange={(e) => props.setTextureFadeFactor(parseFloat(e.target.value))} min={0.01} max={0.2} step={0.005} disabled={props.autoRunEnabled} />
            </Section>
            
            <Section title="Surrounding Particles">
              <Toggle label="Enable Particles" checked={props.particlesEnabled} onChange={e => props.setParticlesEnabled(e.target.checked)} disabled={props.autoRunEnabled} />
              <ControlSlider label="Count" value={props.particleCount} onChange={e => props.setParticleCount(parseInt(e.target.value, 10))} min={0} max={1000} step={10} disabled={props.autoRunEnabled} />
              <ControlSlider label="Size" value={props.particleSize} onChange={e => props.setParticleSize(parseFloat(e.target.value))} min={0.01} max={0.5} step={0.01} disabled={props.autoRunEnabled} />
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Animation</label>
                <select value={props.particleAnimation} onChange={(e) => props.setParticleAnimation(e.target.value)} disabled={props.autoRunEnabled} className="w-full bg-gray-900/50 text-white border border-white/20 rounded-md px-3 py-2 text-sm focus:ring-sky-500 focus:border-sky-500 disabled:cursor-not-allowed disabled:opacity-50">
                  {PARTICLE_ANIMATION_LIST.map((name) => (<option key={name} value={name}>{name}</option>))}
                </select>
              </div>
              {props.particleAnimation === 'Sparks' ? (
                <>
                  <ControlSlider label="Spark Speed" value={props.particleSpeed} onChange={e => props.setParticleSpeed(parseFloat(e.target.value))} min={1} max={50} step={0.5} disabled={props.autoRunEnabled} />
                  <ControlSlider label="Spark Gravity" value={props.particleGravity} onChange={e => props.setParticleGravity(parseFloat(e.target.value))} min={0} max={5} step={0.1} disabled={props.autoRunEnabled} />
                </>
              ) : (
                <ControlSlider label="Spread" value={props.particleSpread} onChange={e => props.setParticleSpread(parseFloat(e.target.value))} min={1} max={20} step={0.1} disabled={props.autoRunEnabled} />
              )}
            </Section>

            <Section title="Background Symbols">
              <Toggle label="Enable Symbols" checked={props.backgroundSymbolsEnabled} onChange={e => props.setBackgroundSymbolsEnabled(e.target.checked)} disabled={props.autoRunEnabled} />
              <ControlSlider label="Count" value={props.backgroundSymbolCount} onChange={e => props.setBackgroundSymbolCount(parseInt(e.target.value, 10))} min={100} max={2000} step={50} disabled={props.autoRunEnabled} />
              <ControlSlider label="Spread" value={props.backgroundSymbolSpread} onChange={e => props.setBackgroundSymbolSpread(parseFloat(e.target.value))} min={5} max={50} step={1} disabled={props.autoRunEnabled} />
              <ControlSlider label="Size" value={props.backgroundSymbolSize} onChange={e => props.setBackgroundSymbolSize(parseFloat(e.target.value))} min={0.05} max={1} step={0.01} disabled={props.autoRunEnabled} />
              <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-gray-300">Color</label>
                  <input type="color" value={props.backgroundSymbolColor} onChange={e => props.setBackgroundSymbolColor(e.target.value)} disabled={props.autoRunEnabled} className="w-8 h-8 p-0 border-none rounded bg-transparent disabled:cursor-not-allowed disabled:opacity-50" />
              </div>
              <div className="space-y-2 pt-4 mt-4 border-t border-white/20">
                  <Toggle label="Enable Far Layer" checked={props.backgroundLayer2Enabled} onChange={e => props.setBackgroundLayer2Enabled(e.target.checked)} disabled={props.autoRunEnabled} />
                  <ControlSlider label="Far Count" value={props.backgroundLayer2Count} onChange={e => props.setBackgroundLayer2Count(parseInt(e.target.value, 10))} min={100} max={4000} step={50} disabled={props.autoRunEnabled} />
                  <ControlSlider label="Far Spread" value={props.backgroundLayer2Spread} onChange={e => props.setBackgroundLayer2Spread(parseFloat(e.target.value))} min={5} max={50} step={1} disabled={props.autoRunEnabled} />
                  <ControlSlider label="Far Size" value={props.backgroundLayer2Size} onChange={e => props.setBackgroundLayer2Size(parseFloat(e.target.value))} min={0.02} max={0.5} step={0.01} disabled={props.autoRunEnabled} />
              </div>
            </Section>

            <Section title="Scanner Effect">
                <Toggle label="Enable Scanner" checked={props.scannerEffectEnabled} onChange={e => props.setScannerEffectEnabled(e.target.checked)} disabled={props.autoRunEnabled} />
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-gray-300">Color</label>
                    <input type="color" value={props.scannerColor} onChange={e => props.setScannerColor(e.target.value)} disabled={props.autoRunEnabled} className="w-8 h-8 p-0 border-none rounded bg-transparent disabled:cursor-not-allowed disabled:opacity-50" />
                </div>
                <ControlSlider label="Speed" value={props.scannerSpeed} onChange={e => props.setScannerSpeed(parseFloat(e.target.value))} min={0.1} max={2} step={0.05} disabled={props.autoRunEnabled} />
                <ControlSlider label="Grid Density" value={props.scannerDensity} onChange={e => props.setScannerDensity(parseFloat(e.target.value))} min={5} max={100} step={1} disabled={props.autoRunEnabled} />
            </Section>

            <Section title="Interactive Effects">
              <Toggle label="Enable Effects" checked={props.interactiveEffectsEnabled} onChange={e => props.setInteractiveEffectsEnabled(e.target.checked)} disabled={props.autoRunEnabled} />
               <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Effect Type</label>
                  <select value={props.interactiveEffectType} onChange={(e) => props.setInteractiveEffectType(e.target.value)} disabled={props.autoRunEnabled} className="w-full bg-gray-900/50 text-white border border-white/20 rounded-md px-3 py-2 text-sm focus:ring-sky-500 focus:border-sky-500 disabled:cursor-not-allowed disabled:opacity-50">
                    {INTERACTIVE_EFFECT_LIST.map((name) => (<option key={name} value={name}>{name}</option>))}
                  </select>
                </div>
              {props.interactiveEffectType === 'Symbol Explosion & Flame' && (
                <>
                  <div className="flex justify-between items-center">
                      <label className="text-sm font-medium text-gray-300">Effect Color 1</label>
                      <input type="color" value={props.effectColor1} onChange={e => props.setEffectColor1(e.target.value)} disabled={props.autoRunEnabled} className="w-8 h-8 p-0 border-none rounded bg-transparent disabled:cursor-not-allowed disabled:opacity-50" />
                  </div>
                   <div className="flex justify-between items-center">
                      <label className="text-sm font-medium text-gray-300">Effect Color 2</label>
                      <input type="color" value={props.effectColor2} onChange={e => props.setEffectColor2(e.target.value)} disabled={props.autoRunEnabled} className="w-8 h-8 p-0 border-none rounded bg-transparent disabled:cursor-not-allowed disabled:opacity-50" />
                  </div>
                </>
              )}
            </Section>

            <Section title="Lighting">
              <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-gray-300">Primary Color</label>
                  <input type="color" value={props.light1Color} onChange={e => props.setLight1Color(e.target.value)} disabled={props.autoRunEnabled} className="w-8 h-8 p-0 border-none rounded bg-transparent disabled:cursor-not-allowed disabled:opacity-50" />
              </div>
              <ControlSlider label="Primary Intensity" value={props.light1Intensity} onChange={e => props.setLight1Intensity(parseFloat(e.target.value))} min={0} max={5} step={0.1} disabled={props.autoRunEnabled} />
              <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-gray-300">Secondary Color</label>
                  <input type="color" value={props.light2Color} onChange={e => props.setLight2Color(e.target.value)} disabled={props.autoRunEnabled} className="w-8 h-8 p-0 border-none rounded bg-transparent disabled:cursor-not-allowed disabled:opacity-50" />
              </div>
              <ControlSlider label="Secondary Intensity" value={props.light2Intensity} onChange={e => props.setLight2Intensity(parseFloat(e.target.value))} min={0} max={5} step={0.1} disabled={props.autoRunEnabled} />
            </Section>
            
            <Section title="Environment">
                <label className="block text-sm font-medium text-gray-300">Preset</label>
                <select value={props.envPreset} onChange={(e) => props.setEnvPreset(e.target.value)} disabled={props.autoRunEnabled} className="w-full bg-gray-900/50 text-white border border-white/20 rounded-md px-3 py-2 text-sm focus:ring-sky-500 focus:border-sky-500 disabled:cursor-not-allowed disabled:opacity-50">
                  {ENV_LIST.map((name) => (<option key={name} value={name}>{name.charAt(0).toUpperCase() + name.slice(1)}</option>))}
                </select>
            </Section>
            
            <Section title="Post-Processing">
                <ControlSlider label="Bloom" value={props.bloomIntensity} onChange={(e) => props.setBloomIntensity(parseFloat(e.target.value))} min={0} max={3} step={0.01} disabled={props.autoRunEnabled} />
                <ControlSlider label="Chromatic Aberration" value={props.chromaticAberrationOffset} onChange={(e) => props.setChromaticAberrationOffset(parseFloat(e.target.value))} min={0} max={0.01} step={0.0001} displayFactor={1000} disabled={props.autoRunEnabled} />
                <ControlSlider label="Vignette" value={props.vignetteDarkness} onChange={(e) => props.setVignetteDarkness(parseFloat(e.target.value))} min={0} max={2} step={0.01} disabled={props.autoRunEnabled} />
                <ControlSlider label="God Rays" value={props.godRaysIntensity} onChange={(e) => props.setGodRaysIntensity(parseFloat(e.target.value))} min={0} max={1} step={0.01} disabled={props.autoRunEnabled} />
                <ControlSlider label="Noise" value={props.noiseIntensity} onChange={(e) => props.setNoiseIntensity(parseFloat(e.target.value))} min={0} max={0.2} step={0.001} disabled={props.autoRunEnabled} />
                <ControlSlider label="Depth of Field" value={props.dofIntensity} onChange={(e) => props.setDofIntensity(parseFloat(e.target.value))} min={0} max={1} step={0.01} disabled={props.autoRunEnabled} />
                <ControlSlider label="Glitch" value={props.glitchIntensity} onChange={(e) => props.setGlitchIntensity(parseFloat(e.target.value))} min={0} max={0.1} step={0.001} disabled={props.autoRunEnabled} />
                <ControlSlider label="Scanline" value={props.scanlineIntensity} onChange={(e) => props.setScanlineIntensity(parseFloat(e.target.value))} min={0} max={1} step={0.01} disabled={props.autoRunEnabled} />
                <ControlSlider label="Dot Screen" value={props.dotScreenIntensity} onChange={(e) => props.setDotScreenIntensity(parseFloat(e.target.value))} min={0} max={1} step={0.01} disabled={props.autoRunEnabled} />
                <ControlSlider label="Pixelation" value={props.pixelation} onChange={(e) => props.setPixelation(parseInt(e.target.value, 10))} min={0} max={32} step={1} disabled={props.autoRunEnabled} />
                <ControlSlider label="Grid Scale" value={props.gridScale} onChange={(e) => props.setGridScale(parseFloat(e.target.value))} min={0} max={10} step={0.1} disabled={props.autoRunEnabled} />
                <ControlSlider label="Grid Line Width" value={props.gridLineWidth} onChange={(e) => props.setGridLineWidth(parseFloat(e.target.value))} min={0} max={1} step={0.01} disabled={props.autoRunEnabled} />
            </Section>

             <div className="pt-4">
              <button onClick={props.onExport} className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200">
                Export
              </button>
            </div>
        </div>
      </div>
      
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="absolute bottom-4 right-4 z-20 w-16 h-16 bg-sky-600 hover:bg-sky-700 text-white rounded-full shadow-lg flex items-center justify-center transition-transform duration-300 ease-in-out hover:scale-110"
        aria-label={isOpen ? 'Close Settings' : 'Open Settings'}
      >
        <div className="relative w-8 h-8">
            <svg className={`absolute inset-0 w-8 h-8 transition-all duration-300 ${isOpen ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <svg className={`absolute inset-0 w-8 h-8 transition-all duration-300 ${isOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </div>
      </button>
    </>
  );
};

export default Controls;
