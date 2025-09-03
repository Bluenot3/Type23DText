
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { CanvasTexture } from 'three';

const BACKGROUND_GLYPHS = '0123456789{}[]()</>|&*^%$#@!+=-_';

export const useCascadingTextTexture = (cascadingText: string, textDensity: number): CanvasTexture => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const dropsRef = useRef<number[]>([]);
    const columnsRef = useRef<number>(0);

    const texture = useMemo(() => {
        const canvas = document.createElement('canvas');
        const size = 1024; // Higher resolution for better quality
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return new CanvasTexture(document.createElement('canvas'));

        canvasRef.current = canvas;
        ctxRef.current = ctx;

        const fontSize = 18;
        ctx.font = `${fontSize}px monospace`;
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

        // Background with fading effect
        ctx.fillStyle = 'rgba(20, 20, 30, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Background glyphs, drawn sparingly for performance
        const numGlyphs = Math.floor(canvas.width * textDensity * 0.1);
        if (Math.random() < 0.2) {
             ctx.font = '16px monospace';
            for (let i = 0; i < numGlyphs; i++) {
                const char = BACKGROUND_GLYPHS[Math.floor(Math.random() * BACKGROUND_GLYPHS.length)];
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;
                const opacity = Math.random() * 0.1 + 0.05;
                ctx.fillStyle = `rgba(200, 220, 255, ${opacity})`;
                ctx.fillText(char, x, y);
            }
        }

        // Cascading text
        const fontSize = 18;
        ctx.font = `${fontSize}px monospace`;
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
