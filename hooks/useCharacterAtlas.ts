import { useMemo } from 'react';
import { CanvasTexture } from 'three';

// Expanded character set for more visual diversity
const CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン!@#$%^&*()[]{}';

/**
 * A hook that generates a texture atlas for a given set of characters.
 * It creates a canvas, draws each character into a grid cell, and calculates
 * the UV coordinates required to map a plane to each character.
 * @returns An object containing the texture, a map of character data, 
 *          the list of characters, and the dimensions of a single tile.
 */
export const useCharacterAtlas = () => {
    return useMemo(() => {
        const canvas = document.createElement('canvas');
        const gridCols = 16; // Increased grid size for more characters
        const gridRows = Math.ceil(CHARACTERS.length / gridCols);
        const cellSize = 64; // The pixel dimension of each character cell

        canvas.width = gridCols * cellSize;
        canvas.height = gridRows * cellSize;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            // Return a fallback object if context creation fails
            return { 
                texture: new CanvasTexture(canvas), 
                atlasData: new Map(), 
                charList: [], 
                tileWidth: 0, 
                tileHeight: 0 
            };
        }

        ctx.fillStyle = 'white';
        ctx.font = `bold ${cellSize * 0.9}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const atlasData = new Map<string, { u: number, v: number }>();
        const tileWidth = 1 / gridCols;
        const tileHeight = 1 / gridRows;

        for (let i = 0; i < CHARACTERS.length; i++) {
            const char = CHARACTERS[i];
            const col = i % gridCols;
            const row = Math.floor(i / gridCols);
            
            const x = col * cellSize + cellSize / 2;
            const y = row * cellSize + cellSize / 2;
            ctx.fillText(char, x, y);

            // Store the UV coordinates for the top-left of the tile
            atlasData.set(char, { 
                u: col * tileWidth, 
                // Invert V coordinate as textures are read from bottom-up in WebGL
                v: 1.0 - (row + 1) * tileHeight 
            });
        }
        
        const texture = new CanvasTexture(canvas);
        texture.needsUpdate = true;

        return { 
            texture, 
            atlasData,
            charList: CHARACTERS.split(''),
            tileWidth,
            tileHeight
        };
    }, []);
};