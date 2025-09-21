// FIX: Add a triple-slash directive to help TypeScript resolve React Three Fiber's custom JSX elements.
/// <reference types="@react-three/fiber" />

import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PlaneGeometry, ShaderMaterial, Color, DoubleSide, AdditiveBlending, Mesh } from 'three';

// GLSL shaders for the scanner effect
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform vec3 uColor; // Color for the grid
  uniform float uDensity;
  varying vec2 vUv;

  // 2D Random function
  float random (vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }

  // Generates a grid pattern
  float grid(vec2 st, float res){
    vec2 grid = fract(st*res);
    // Make grid lines thin
    return (step(grid.x, 0.02) + step(grid.y, 0.02));
  }

  // Generates a crystalline pattern with moving glints
  float crystal_pattern(vec2 st, float time) {
    // Animate the pattern itself slowly
    st += time * 0.1;
    st *= 18.0; // Scale up the pattern for more facets
    vec2 i_st = floor(st);
    
    // Get a random value for each cell to give it a base brightness
    float cell_random = random(i_st);
    
    // Create moving diagonal lines that 'glint'
    float moving_lines = fract(st.x + st.y + time * 2.0);
    float glint = pow(1.0 - moving_lines, 8.0) * 0.5;

    // Combine a base cell brightness with the glints
    return cell_random * 0.2 + glint;
  }


  void main() {
    // Oscillating scanner position from left to right
    float scannerX = sin(uTime) * 0.75 + 0.5;

    // --- Grid ---
    float gridVal = grid(vUv, uDensity);
    vec3 gridColor = uColor * gridVal * 0.15;

    // --- Crystal Tile Slider ---
    float scannerWidth = 0.1;
    // Use a sharp edge for a "tile"
    float dist = abs(vUv.x - scannerX);

    // Create the main tile shape (mask) with a soft falloff
    float sliderMask = 1.0 - smoothstep(scannerWidth * 0.5, scannerWidth * 0.5 + 0.01, dist);

    // Generate the crystalline texture within the tile
    float crystalNoise = crystal_pattern(vUv * vec2(1.0, 2.5), uTime); // Stretch UVs vertically for better effect

    // The color and alpha of the crystal effect
    // We want it to be subtle, mostly transparent but visible
    float crystalAlpha = sliderMask * crystalNoise * 0.4; // subtle alpha
    vec3 crystalColor = vec3(0.8, 0.9, 1.0) * crystalAlpha; // faint cool white color

    // --- Combine ---
    vec3 finalColor = gridColor + crystalColor;
    float finalAlpha = max(gridVal * 0.1, crystalAlpha);

    gl_FragColor = vec4(finalColor, finalAlpha);
  }
`;

interface ScannerEffectProps {
  color: string;
  speed: number;
  density: number;
}

const ScannerEffect: React.FC<ScannerEffectProps> = ({ color, speed, density }) => {
  const meshRef = useRef<Mesh<PlaneGeometry, ShaderMaterial>>(null!);
  const { viewport } = useThree();

  const uniforms = useMemo(() => ({
    uTime: { value: 0.0 },
    uColor: { value: new Color(color) },
    uDensity: { value: density },
  }), []);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.material.uniforms.uTime.value += delta * speed;
    }
  });
  
  // Update uniforms when props change without re-creating the material
  useMemo(() => {
    if(meshRef.current) {
        meshRef.current.material.uniforms.uColor.value.set(color);
        meshRef.current.material.uniforms.uDensity.value = density;
    }
  }, [color, density]);


  return (
    // Move the mesh further back
    <mesh ref={meshRef} position={[0, 0, -20]} rotation={[0, 0, 0]}>
      {/* Increase plane size to ensure it covers the entire viewport from a distance */}
      <planeGeometry args={[viewport.width * 4, viewport.height * 2.5, 1, 1]} />
      <shaderMaterial
        key={`${color}-${density}`} // Recreate material if these fundamental aspects change
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        blending={AdditiveBlending}
        depthWrite={false}
        side={DoubleSide}
      />
    </mesh>
  );
};

export default ScannerEffect;