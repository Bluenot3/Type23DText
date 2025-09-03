
import React, { useState } from 'react';
import type { Mesh } from 'three';
import { OBJExporter } from '../utils/exporters';

interface ExportPageProps {
  settings: Record<string, any>;
  sceneRef: React.RefObject<Mesh>;
  onBack: () => void;
}

const ExportPage: React.FC<ExportPageProps> = ({ settings, sceneRef, onBack }) => {
  const [copyObjButtonText, setCopyObjButtonText] = useState('Copy to Clipboard');
  const [copyIframeButtonText, setCopyIframeButtonText] = useState('Copy Iframe Code');

  const handleExportOBJ = () => {
    if (!sceneRef.current) {
      alert("Scene object not found. Please go back and wait for the scene to load.");
      return;
    }
    try {
      const exporter = new OBJExporter();
      const objData = exporter.parse(sceneRef.current);
      const blob = new Blob([objData], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = 'crystal-text.obj';
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export OBJ:", error);
      alert("An error occurred during the OBJ export.");
    }
  };
  
  const generateHTML = () => {
    const settingsString = JSON.stringify(settings, null, 2);
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Crystal Text 3D</title>
  <style>
    body { margin: 0; background-color: #101015; }
    canvas { display: block; }
  </style>
  <script type="importmap">
  {
    "imports": {
      "react": "https://aistudiocdn.com/react@^19.1.1",
      "react-dom/": "https://aistudiocdn.com/react-dom@^19.1.1/",
      "react/": "https://aistudiocdn.com/react@^19.1.1/",
      "@react-three/fiber": "https://aistudiocdn.com/@react-three/fiber@^9.3.0",
      "@react-three/drei": "https://aistudiocdn.com/@react-three/drei@^10.7.4",
      "three": "https://aistudiocdn.com/three@^0.179.1",
      "@react-three/postprocessing": "https://aistudiocdn.com/@react-three/postprocessing@^3.0.4",
      "postprocessing": "https://aistudiocdn.com/postprocessing@^7.0.0"
    }
  }
  </script>
</head>
<body>
  <div id="root" style="width: 100vw; height: 100vh;"></div>
  <script type="module">
    import React, { useMemo, useRef } from 'react';
    import ReactDOM from 'react-dom/client';
    import { Canvas, useFrame } from '@react-three/fiber';
    import { Text3D, OrbitControls, Environment } from '@react-three/drei';
    import { EffectComposer, Bloom, ChromaticAberration, Vignette, SMAA, GodRays, Noise, DepthOfField, Glitch, Scanline } from '@react-three/postprocessing';
    import { CanvasTexture, Vector2, Mesh } from 'three';
    import { BlendFunction, Resolution, KernelSize, GlitchMode } from 'postprocessing';
    
    const settings = ${settingsString};

    const BACKGROUND_GLYPHS = '0123456789{}[]()</>|&*^%$#@!+=-_';
    const useCascadingTextTexture = (cascadingText, textDensity) => {
        const canvasRef = React.useRef();
        const ctxRef = React.useRef();
        const dropsRef = React.useRef([]);
        const columnsRef = React.useRef(0);

        const texture = React.useMemo(() => {
            const canvas = document.createElement('canvas');
            const size = 1024;
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            if (!ctx) return new CanvasTexture(document.createElement('canvas'));

            canvasRef.current = canvas;
            ctxRef.current = ctx;

            const fontSize = 18;
            ctx.font = \`\${fontSize}px monospace\`;
            columnsRef.current = Math.floor(size / fontSize);
            const drops = [];
            for (let x = 0; x < columnsRef.current; x++) {
                drops[x] = Math.random() * (size / fontSize);
            }
            dropsRef.current = drops;

            return new CanvasTexture(canvas);
        }, []);

        useFrame(() => {
            const canvas = canvasRef.current;
            const ctx = ctxRef.current;
            const drops = dropsRef.current;

            if (!canvas || !ctx) return;

            ctx.fillStyle = 'rgba(20, 20, 30, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const numGlyphs = Math.floor(canvas.width * textDensity * 0.1);
            if (Math.random() < 0.2) {
                 ctx.font = '16px monospace';
                for (let i = 0; i < numGlyphs; i++) {
                    const char = BACKGROUND_GLYPHS[Math.floor(Math.random() * BACKGROUND_GLYPHS.length)];
                    const x = Math.random() * canvas.width;
                    const y = Math.random() * canvas.height;
                    const opacity = Math.random() * 0.1 + 0.05;
                    ctx.fillStyle = \`rgba(200, 220, 255, \${opacity})\`;
                    ctx.fillText(char, x, y);
                }
            }

            const fontSize = 18;
            ctx.font = \`\${fontSize}px monospace\`;
            ctx.fillStyle = '#aef';
            const validCascadingText = cascadingText && cascadingText.length > 0 ? cascadingText : ' ';

            for (let i = 0; i < drops.length; i++) {
                const textIndex = Math.floor(drops[i] + i * 3) % validCascadingText.length;
                const textChar = validCascadingText[textIndex];
                const x = i * fontSize;
                const y = drops[i] * fontSize;
                ctx.fillText(textChar, x, y);

                if (y > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }

            texture.needsUpdate = true;
        });

        return texture;
    };

    const CrystallineText = (props) => {
      const groupRef = useRef();
      useFrame(({ clock }, delta) => {
        if (!groupRef.current) return;
        const t = clock.getElapsedTime();
        switch (props.animation) {
          case 'Float':
            groupRef.current.rotation.y += delta * 0.1;
            groupRef.current.position.y = Math.sin(t * 0.7) * 0.2;
            break;
          case 'Spin':
            groupRef.current.rotation.y += delta * 0.3;
            break;
          case 'Pulse':
            const scale = 1 + Math.sin(t * 1.5) * 0.05;
            groupRef.current.scale.set(scale, scale, scale);
            groupRef.current.rotation.y += delta * 0.05;
            break;
          case 'Static':
          default:
            break;
        }
      });
      return (
        <mesh ref={groupRef} position={[0,0,0]} castShadow receiveShadow>
          <Text3D font={props.font} size={3} height={1} curveSegments={Math.round(props.facetDensity)} bevelEnabled bevelThickness={0.1} bevelSize={0.05} bevelSegments={Math.round(props.facetDensity / 2)}>
            {props.text}
            <meshPhysicalMaterial map={props.texture} emissiveMap={props.texture} emissive={"#ffffff"} emissiveIntensity={0.5} transmission={1.0} roughness={props.roughness} thickness={props.thickness} ior={props.ior} specularIntensity={1} envMapIntensity={1} metalness={props.metalness} color={props.color}/>
          </Text3D>
        </mesh>
      );
    };

    const App = () => {
      const texture = useCascadingTextTexture(settings.cascadingText, settings.textDensity);
      const aberrationOffset = useMemo(() => new Vector2(settings.chromaticAberrationOffset, settings.chromaticAberrationOffset), [settings.chromaticAberrationOffset]);
      const glitchStrength = useMemo(() => new Vector2(settings.glitchIntensity, settings.glitchIntensity * 2), [settings.glitchIntensity]);
      const godRaysLightSourceRef = React.useRef();

      return (
        <Canvas shadows gl={{ antialias: false }} camera={{ position: [0, 0, 8], fov: 50 }}>
          <color attach="background" args={['#101015']} />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1.5} color="#87ceeb" />
          <pointLight position={[-10, -10, -5]} intensity={1} color="#ff8c00" />
          <spotLight position={[0, 15, 0]} intensity={2} angle={0.3} penumbra={1} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
          <mesh ref={godRaysLightSourceRef} position={[0, 0, -5]}><sphereGeometry args={[1, 16, 16]} /><meshBasicMaterial color="white" visible={false} /></mesh>
          <CrystallineText {...settings} texture={texture} />
          <Environment preset={settings.envPreset} />
          <EffectComposer>
            <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} height={300} intensity={settings.bloomIntensity} />
            <ChromaticAberration offset={aberrationOffset} />
            <Vignette eskil={false} offset={0.1} darkness={settings.vignetteDarkness} />
            {godRaysLightSourceRef.current && <GodRays sun={godRaysLightSourceRef.current} blendFunction={BlendFunction.SCREEN} samples={30} density={0.97} decay={0.97} weight={0.6 * settings.godRaysIntensity} exposure={0.4 * settings.godRaysIntensity} clampMax={1} kernelSize={KernelSize.SMALL} blur={true} />}
            <Noise premultiply blendFunction={BlendFunction.ADD} opacity={settings.noiseIntensity}/>
            <DepthOfField focusDistance={0.01 * settings.dofIntensity} focalLength={0.2 * settings.dofIntensity} bokehScale={4 * settings.dofIntensity} height={480} />
            <Glitch delay={new Vector2(1.5, 3.5)} duration={new Vector2(0.2, 0.5)} strength={glitchStrength} mode={GlitchMode.SPORADIC} active={settings.glitchIntensity > 0.0001} ratio={0.5} />
            <Scanline blendFunction={BlendFunction.OVERLAY} density={settings.scanlineIntensity * 5} opacity={settings.scanlineIntensity * 0.2} />
            <SMAA />
          </EffectComposer>
          <OrbitControls minDistance={3} maxDistance={20} enablePan={false} />
        </Canvas>
      );
    };

    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(React.createElement(App));
  </script>
</body>
</html>`;
  };

  const htmlContent = generateHTML();
  const iframeCode = `<iframe
  width="600"
  height="400"
  style="border:none; border-radius: 8px; overflow: hidden;"
  title="Interactive 3D Crystal Text"
  srcdoc="${htmlContent.replace(/"/g, '&quot;')}">
</iframe>`;

  const handleCopyToClipboard = (textToCopy: string, setButtonText: React.Dispatch<React.SetStateAction<string>>) => {
    navigator.clipboard.writeText(textToCopy).then(() => {
      setButtonText('Copied!');
      setTimeout(() => setButtonText(textToCopy === iframeCode ? 'Copy Iframe Code' : 'Copy to Clipboard'), 2000);
    }, (err) => {
      console.error('Could not copy text: ', err);
      setButtonText('Failed to Copy');
      setTimeout(() => setButtonText(textToCopy === iframeCode ? 'Copy Iframe Code' : 'Copy to Clipboard'), 2000);
    });
  };

  return (
    <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm z-20 flex justify-center items-center text-white p-4">
      <div className="w-full max-w-3xl bg-gray-800/80 border border-white/10 rounded-lg shadow-2xl p-6 md:p-8 space-y-6 max-h-full overflow-y-auto">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Export Your Creation</h2>
          <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors text-3xl leading-none">&times;</button>
        </div>

        {/* OBJ Export */}
        <div className="bg-gray-900/50 p-4 rounded-md border border-white/10">
          <h3 className="font-semibold mb-2">Download .OBJ File</h3>
          <p className="text-sm text-gray-400 mb-4">Export the 3D model for use in other 3D software like Blender, Cinema 4D, or Unity.</p>
          <button onClick={handleExportOBJ} className="w-full md:w-auto bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200">
            Download .obj
          </button>
        </div>

        {/* Iframe Embed */}
        <div className="bg-gray-900/50 p-4 rounded-md border border-white/10 space-y-4">
          <h3 className="font-semibold">Embed with &lt;iframe&gt;</h3>
          <p className="text-sm text-gray-400">Copy the code to embed the interactive 3D scene on your website. Below is a live preview.</p>
          <div className="relative">
            <textarea
              readOnly
              value={iframeCode}
              className="w-full h-28 bg-gray-900 text-gray-300 text-xs font-mono p-3 border border-white/20 rounded-md resize-none focus:ring-sky-500 focus:border-sky-500"
            />
            <button onClick={() => handleCopyToClipboard(iframeCode, setCopyIframeButtonText)} className="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 text-white text-xs font-semibold py-1 px-3 rounded-md transition-colors duration-200">
              {copyIframeButtonText}
            </button>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-300 mb-2">Live Preview</h4>
            <iframe
              className="w-full h-64 bg-gray-900 rounded-md border border-white/10"
              title="3D Text Preview"
              srcDoc={htmlContent}
            />
          </div>
        </div>
        
        <button onClick={onBack} className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200">
          Back to Editor
        </button>
      </div>
    </div>
  );
};

export default ExportPage;
