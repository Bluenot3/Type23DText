
import { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { CanvasTexture } from 'three';

export const useCascadingTextTexture = (
    cascadingText: string,
    textDensity: number,
    glyphSet: string,
    fallSpeed: number,
    fadeFactor: number
): CanvasTexture => {
    
    const texture = useMemo(() => {
        const canvas = document.createElement('canvas');
        const size = 1024; // Higher resolution for better quality
        canvas.width = size;
        canvas.height = size;
        return new CanvasTexture(canvas);
    }, []);

    const animState = useRef({
        ctx: texture.image.getContext('2d'),
        drops: [] as number[],
        columns: 0,
        fontSize: 18,
    }).current;
    
    useEffect(() => {
      const size = 1024;
      const fontSize = 18;
      animState.columns = Math.floor(size / fontSize);
      const drops = [];
      for (let x = 0; x < animState.columns; x++) {
          drops[x] = Math.random() * (size / fontSize);
      }
      animState.drops = drops;
    }, []);


    useFrame((state, delta) => {
        const { ctx, drops, fontSize, columns } = animState;
        if (!ctx) return;

        const canvas = ctx.canvas;

        // Background with fading effect
        ctx.fillStyle = `rgba(20, 20, 30, ${fadeFactor})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Background glyphs, drawn sparingly for performance
        const numGlyphs = Math.floor(canvas.width * textDensity * 0.1);
        const validGlyphSet = glyphSet && glyphSet.length > 0 ? glyphSet : ' ';
        if (Math.random() < 0.2) {
             ctx.font = '16px monospace';
            for (let i = 0; i < numGlyphs; i++) {
                const char = validGlyphSet[Math.floor(Math.random() * validGlyphSet.length)];
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;
                const opacity = Math.random() * 0.1 + 0.05;
                ctx.fillStyle = `rgba(200, 220, 255, ${opacity})`;
                ctx.fillText(char, x, y);
            }
        }

        // Cascading text
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
            drops[i] += fallSpeed;
        }

        texture.needsUpdate = true;
    });

    return texture;
};
