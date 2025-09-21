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

  // 2D Noise function for liquid/foggy effects
  float noise (vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    // Smooth interpolation
    vec2 u = f*f*(3.0-2.0*f);
    return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  float grid(vec2 st, float res){
    vec2 grid = fract(st*res);
    // Make grid lines thin
    return (step(grid.x, 0.02) + step(grid.y, 0.02));
  }

  void main() {
    // Oscillating scanner position from left to right, going off-screen
    float scannerX = sin(uTime) * 0.75 + 0.5;

    // --- Grid ---
    float gridVal = grid(vUv, uDensity);
    vec3 gridColor = uColor * gridVal * 0.15; // Grid remains blue, slightly brighter

    // --- Liquid Glass Slider ---
    // Make the edges wavy/liquid using noise
    float liquidEdgeOffset = noise(vec2(vUv.y * 8.0, uTime * 0.5)) * 0.1 - 0.05;
    float scannerWidth = 0.1;
    float dist = abs(vUv.x - (scannerX + liquidEdgeOffset));

    // Create the main slider shape (mask)
    float sliderMask = 1.0 - smoothstep(scannerWidth * 0.4, scannerWidth * 0.5, dist);

    // Foggy/Misty interior using another layer of noise
    float fogNoise = noise(vUv * vec2(10.0, 30.0) + vec2(0.0, uTime * -2.0));
    float fog = sliderMask * (fogNoise * 0.2 + 0.1);

    // Reflective/Glassy highlights on the edges
    float highlight = pow(1.0 - smoothstep(0.0, scannerWidth * 0.5, dist), 10.0);
    vec3 highlightColor = vec3(1.0) * highlight * sliderMask * 0.8;

    // Final slider visuals (color is from highlights, alpha is from fog and highlights)
    vec3 sliderFinalColor = highlightColor;
    float sliderAlpha = fog + (highlight * 0.3);

    // --- Combine ---
    vec3 finalColor = gridColor + sliderFinalColor;
    float finalAlpha = max(gridVal * 0.1, sliderAlpha);

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
