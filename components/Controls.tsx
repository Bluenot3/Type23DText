
import React from 'react';
import { FONT_LIST, ENV_LIST, ANIMATION_LIST, MATERIAL_PRESETS } from '../App';

interface ControlsProps {
  text: string;
  setText: React.Dispatch<React.SetStateAction<string>>;
  font: string;
  setFont: React.Dispatch<React.SetStateAction<string>>;
  animation: string;
  setAnimation: React.Dispatch<React.SetStateAction<string>>;
  materialPreset: string;
  setMaterialPreset: (preset: string) => void;
  ior: number;
  setIor: React.Dispatch<React.SetStateAction<number>>;
  facetDensity: number;
  setFacetDensity: React.Dispatch<React.SetStateAction<number>>;
  textDensity: number;
  setTextDensity: React.Dispatch<React.SetStateAction<number>>;
  color: string;
  setColor: React.Dispatch<React.SetStateAction<string>>;
  roughness: number;
  setRoughness: React.Dispatch<React.SetStateAction<number>>;
  metalness: number;
  setMetalness: React.Dispatch<React.SetStateAction<number>>;
  thickness: number;
  setThickness: React.Dispatch<React.SetStateAction<number>>;
  envPreset: string;
  setEnvPreset: React.Dispatch<React.SetStateAction<string>>;
  cascadingText: string;
  setCascadingText: React.Dispatch<React.SetStateAction<string>>;
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
}> = ({ label, value, onChange, min, max, step, displayFactor = 1 }) => (
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
      className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer range-sm"
    />
  </div>
);

const Controls: React.FC<ControlsProps> = (props) => {
  const { 
    text, setText, font, setFont, animation, setAnimation, materialPreset, setMaterialPreset, ior, setIor, 
    facetDensity, setFacetDensity, textDensity, setTextDensity, color, setColor, roughness, setRoughness, 
    metalness, setMetalness, thickness, setThickness, envPreset, setEnvPreset, cascadingText, setCascadingText,
    bloomIntensity, setBloomIntensity, chromaticAberrationOffset, setChromaticAberrationOffset, vignetteDarkness, setVignetteDarkness,
    godRaysIntensity, setGodRaysIntensity, noiseIntensity, setNoiseIntensity,
    dofIntensity, setDofIntensity, glitchIntensity, setGlitchIntensity, scanlineIntensity, setScanlineIntensity,
    onExport
  } = props;
  
  return (
    <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 z-10 w-64 md:w-80 p-4 bg-black/40 backdrop-blur-md rounded-lg shadow-2xl border border-white/10 text-white max-h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="space-y-6">
        <div>
          <h3 className="text-base font-semibold border-b border-white/20 pb-2 mb-4">Text & Font</h3>
          <div className="flex flex-col space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Display Text</label>
              <input type="text" value={text} onChange={(e) => setText(e.target.value)} maxLength={8} className="w-full bg-gray-900/50 text-white placeholder-gray-500 border border-white/20 rounded-md px-3 py-2 text-sm focus:ring-sky-500 focus:border-sky-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Font</label>
              <select value={font} onChange={(e) => setFont(e.target.value)} className="w-full bg-gray-900/50 text-white border border-white/20 rounded-md px-3 py-2 text-sm focus:ring-sky-500 focus:border-sky-500">
                {Object.entries(FONT_LIST).map(([name, url]) => (<option key={name} value={url}>{name}</option>))}
              </select>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-base font-semibold border-b border-white/20 pb-2 mb-4">Animation</h3>
          <div className="flex flex-col space-y-4">
              <label className="block text-sm font-medium text-gray-300">Style</label>
              <select value={animation} onChange={(e) => setAnimation(e.target.value)} className="w-full bg-gray-900/50 text-white border border-white/20 rounded-md px-3 py-2 text-sm focus:ring-sky-500 focus:border-sky-500">
                {ANIMATION_LIST.map((name) => (<option key={name} value={name}>{name}</option>))}
              </select>
            </div>
        </div>
        
        <div>
          <h3 className="text-base font-semibold border-b border-white/20 pb-2 mb-4">Surface Effects</h3>
          <div className="flex flex-col space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Cascading Message</label>
              <input type="text" value={cascadingText} onChange={(e) => setCascadingText(e.target.value)} maxLength={30} className="w-full bg-gray-900/50 text-white placeholder-gray-500 border border-white/20 rounded-md px-3 py-2 text-sm focus:ring-sky-500 focus:border-sky-500" />
            </div>
             <ControlSlider label="Texture Density" value={textDensity} onChange={(e) => setTextDensity(parseFloat(e.target.value))} min={0.05} max={1.0} step={0.01} />
          </div>
        </div>

        <div>
          <h3 className="text-base font-semibold border-b border-white/20 pb-2 mb-4">Material</h3>
          <div className="space-y-4">
             <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Preset</label>
              <select value={materialPreset} onChange={(e) => setMaterialPreset(e.target.value)} className="w-full bg-gray-900/50 text-white border border-white/20 rounded-md px-3 py-2 text-sm focus:ring-sky-500 focus:border-sky-500">
                {Object.keys(MATERIAL_PRESETS).map((name) => (<option key={name} value={name}>{name}</option>))}
              </select>
            </div>
            <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-300">Color</label>
                <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-8 h-8 p-0 border-none rounded bg-transparent" />
            </div>
            <ControlSlider label="Roughness" value={roughness} onChange={(e) => setRoughness(parseFloat(e.target.value))} min={0} max={1} step={0.01} />
            <ControlSlider label="Metalness" value={metalness} onChange={(e) => setMetalness(parseFloat(e.target.value))} min={0} max={1} step={0.01} />
            <ControlSlider label="Thickness" value={thickness} onChange={(e) => setThickness(parseFloat(e.target.value))} min={0} max={5} step={0.05} />
            <ControlSlider label="Index of Refraction" value={ior} onChange={(e) => setIor(parseFloat(e.target.value))} min={1.0} max={2.4} step={0.01} />
            <ControlSlider label="Facet Density" value={facetDensity} onChange={(e) => setFacetDensity(parseInt(e.target.value, 10))} min={1} max={24} step={1} />
          </div>
        </div>

        <div>
          <h3 className="text-base font-semibold border-b border-white/20 pb-2 mb-4">Environment</h3>
          <div className="flex flex-col space-y-4">
              <label className="block text-sm font-medium text-gray-300">Preset</label>
              <select value={envPreset} onChange={(e) => setEnvPreset(e.target.value)} className="w-full bg-gray-900/50 text-white border border-white/20 rounded-md px-3 py-2 text-sm focus:ring-sky-500 focus:border-sky-500">
                {ENV_LIST.map((name) => (<option key={name} value={name}>{name.charAt(0).toUpperCase() + name.slice(1)}</option>))}
              </select>
            </div>
        </div>
        
        <div>
          <h3 className="text-base font-semibold border-b border-white/20 pb-2 mb-4">Post-Processing</h3>
          <div className="space-y-4">
            <ControlSlider label="Bloom" value={bloomIntensity} onChange={(e) => setBloomIntensity(parseFloat(e.target.value))} min={0} max={3} step={0.01} />
            <ControlSlider label="Chromatic Aberration" value={chromaticAberrationOffset} onChange={(e) => setChromaticAberrationOffset(parseFloat(e.target.value))} min={0} max={0.01} step={0.0001} displayFactor={1000} />
            <ControlSlider label="Vignette" value={vignetteDarkness} onChange={(e) => setVignetteDarkness(parseFloat(e.target.value))} min={0} max={2} step={0.01} />
            <ControlSlider label="God Rays" value={godRaysIntensity} onChange={(e) => setGodRaysIntensity(parseFloat(e.target.value))} min={0} max={1} step={0.01} />
            <ControlSlider label="Noise" value={noiseIntensity} onChange={(e) => setNoiseIntensity(parseFloat(e.target.value))} min={0} max={0.2} step={0.001} />
            <ControlSlider label="Depth of Field" value={dofIntensity} onChange={(e) => setDofIntensity(parseFloat(e.target.value))} min={0} max={1} step={0.01} />
            <ControlSlider label="Glitch" value={glitchIntensity} onChange={(e) => setGlitchIntensity(parseFloat(e.target.value))} min={0} max={0.1} step={0.001} />
            <ControlSlider label="Scanline" value={scanlineIntensity} onChange={(e) => setScanlineIntensity(parseFloat(e.target.value))} min={0} max={1} step={0.01} />
          </div>
        </div>

         <div>
          <button onClick={onExport} className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200">
            Export
          </button>
        </div>
      </div>
    </div>
  );
};

export default Controls;
