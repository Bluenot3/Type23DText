
import React, { useRef, useCallback, useState } from 'react';
import Scene from './Scene';
import { OBJExporter } from '../utils/exporters';
import { Canvas } from '@react-three/fiber';
import type { Group } from 'three';
import type { WebGLRenderer } from 'three';

interface ExportPageProps {
  settings: any;
  onBack: () => void;
}

const ExportPage: React.FC<ExportPageProps> = ({ settings, onBack }) => {
    const [status, setStatus] = useState('Ready');
    const exportSceneRef = useRef<Group>(null!);
    // FIX: Initialize useRef with null to provide an initial value and a compatible type.
    const glRef = useRef<WebGLRenderer | null>(null);

    const handleExportPNG = useCallback(() => {
        if (glRef.current) {
            const dataURL = glRef.current.domElement.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = dataURL;
            link.download = 'crystalline-text.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setStatus('PNG exported successfully!');
        } else {
            setStatus('Error: Renderer not available for PNG export.');
        }
    }, []);

    const handleExportOBJ = useCallback(() => {
        if (exportSceneRef.current) {
            const exporter = new OBJExporter();
            try {
                const result = exporter.parse(exportSceneRef.current);
                const blob = new Blob([result], { type: 'text/plain' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = 'crystalline-text.obj';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(link.href);
                setStatus('OBJ exported successfully!');
            } catch (e) {
                console.error(e);
                setStatus('Error exporting OBJ. Check console for details.');
            }
        } else {
             setStatus('Error: Scene content not available for OBJ export.');
        }
    }, []);
    
    return (
        <div className="w-full h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
            <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none">
                 <Canvas
                    shadows
                    gl={{ preserveDrawingBuffer: true, antialias: true }}
                    dpr={[1, 2]}
                    camera={{ position: [0, 0, 8], fov: 50 }}
                    onCreated={({ gl }) => {
                        glRef.current = gl;
                    }}
                 >
                    <Scene ref={exportSceneRef} {...settings} />
                </Canvas>
            </div>
            <div className="relative z-10 bg-black/50 backdrop-blur-md p-8 rounded-lg shadow-2xl border border-white/10 text-center max-w-lg">
                <h1 className="text-3xl font-bold mb-4">Export Scene</h1>
                <p className="text-gray-400 mb-8">Choose a format to download your creation. The preview in the background is live.</p>
                <div className="flex gap-4 justify-center">
                    <button onClick={handleExportPNG} className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200">
                        Export as PNG
                    </button>
                    <button onClick={handleExportOBJ} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200">
                        Export as OBJ
                    </button>
                </div>
                <p className="mt-6 text-sm text-gray-500 min-h-[1.25rem]">{status}</p>
                <button onClick={onBack} className="mt-8 text-sky-400 hover:text-sky-300 transition-colors duration-200">
                    &larr; Back to Editor
                </button>
            </div>
        </div>
    );
};

export default ExportPage;