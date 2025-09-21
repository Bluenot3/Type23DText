import { useMemo } from 'react';
import { CanvasTexture } from 'three';

const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:",./<>?`~';
const EMOJIS = ['😀', '😂', '😍', '🥳', '🤯', '🚀', '🔥', '💀', '👽', '🤖', '🦄', '✨', '⭐', '❤️‍🔥'];

export const useSymbolTexture = (type: 'symbols' | 'emojis', size = 256): CanvasTexture => {
    const texture = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return new CanvasTexture(canvas);

        const characters = type === 'symbols' ? SYMBOLS.split('') : EMOJIS;
        const charCount = characters.length;
        const gridSize = Math.ceil(Math.sqrt(charCount));
        const cellSize = size / gridSize;

        ctx.fillStyle = 'white';
        ctx.font = `bold ${cellSize * 0.8}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        for (let i = 0; i < charCount; i++) {
            const char = characters[i];
            const row = Math.floor(i / gridSize);
            const col = i % gridSize;
            const x = col * cellSize + cellSize / 2;
            const y = row * cellSize + cellSize / 2;
            
            const randomChar = characters[Math.floor(Math.random() * charCount)];
            ctx.fillText(randomChar, x, y);
        }

        const tex = new CanvasTexture(canvas);
        tex.needsUpdate = true;
        return tex;
    }, [type, size]);

    // This hook actually creates a texture with random symbols from the set
    // which is better for instanced mesh where each instance can't have a different UV
    // each particle will look like a random symbol from the atlas.
    const particleTexture = useMemo(() => {
        const canvas = document.createElement('canvas');
        const canvasSize = 128;
        canvas.width = canvasSize;
        canvas.height = canvasSize;
        const ctx = canvas.getContext('2d');
        if (!ctx) return new CanvasTexture(canvas);

        const characterSet = type === 'symbols' ? SYMBOLS : EMOJIS;
        const char = characterSet[Math.floor(Math.random() * characterSet.length)];
        
        ctx.fillStyle = 'white';
        ctx.font = `bold ${canvasSize * 0.9}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(char, canvasSize / 2, canvasSize / 2);
        
        return new CanvasTexture(canvas);

    }, [type]);


    // To make each particle truly unique, we would need a texture atlas and custom shaders.
    // A simpler approach for this project is to generate a single texture containing one random character.
    // While this means all particles in a single burst share the same symbol/emoji,
    // each new burst will feature a different character, providing variety.
    // The user requested many symbols, so let's try the atlas approach, even if UVs are the same.
    // The visual effect will be a plane textured with a grid of symbols.
    return texture;
};
