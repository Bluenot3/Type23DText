// FIX: Add a triple-slash directive to help TypeScript resolve React Three Fiber's custom JSX elements.
/// <reference types="@react-three/fiber" />

import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Instances } from '@react-three/drei';
import { Object3D, Vector3 } from 'three';

interface SurroundingParticlesProps {
  count: number;
  size: number;
  spread: number;
  animation: string;
  speed: number;
  gravity: number;
}

const SurroundingParticles: React.FC<SurroundingParticlesProps> = ({ count, size, spread, animation, speed, gravity }) => {
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        position: new Vector3(),
        t: Math.random() * 100, 
        speed: 0.01 + Math.random() / 200,
        xFactor: -spread + Math.random() * spread * 2,
        yFactor: -spread + Math.random() * spread * 2,
        zFactor: -spread + Math.random() * spread * 2,
        velocity: new Vector3(),
        age: 0,
        life: 0
      });
    }
    return temp;
  }, [count, spread]);

  const ref = useRef<any>(null!);
  const dummy = useMemo(() => new Object3D(), []);

  const resetParticle = (particle: typeof particles[0]) => {
      particle.age = 0;
      particle.life = 1 + Math.random() * 2; // Lifespan of 1-3 seconds
      particle.position.set(0, 0, 0);
      
      // Give it a random velocity direction
      const phi = Math.random() * Math.PI * 2;
      const theta = Math.acos(2 * Math.random() - 1); // uniform spherical distribution
      const r = (0.5 + Math.random() * 0.5) * speed;
      
      particle.velocity.set(
        r * Math.sin(theta) * Math.cos(phi),
        r * Math.cos(theta),
        r * Math.sin(theta) * Math.sin(phi)
      );
  };
  
  // Initialize particles for sparks animation
  useEffect(() => {
    if (animation === 'Sparks') {
      particles.forEach(resetParticle);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animation, count, speed]);


  useFrame((state, delta) => {
    if (!ref.current) return;
    
    particles.forEach((particle, i) => {
      if (animation === 'Sparks') {
        if (particle.age >= particle.life) {
            resetParticle(particle);
        }
        
        // Apply gravity
        particle.velocity.y -= gravity * delta;
        
        // Update position
        particle.position.addScaledVector(particle.velocity, delta);
        
        // Increment age
        particle.age += delta;

        dummy.position.copy(particle.position);

      } else {
        let { t, speed, xFactor, yFactor, zFactor } = particle;
        t = particle.t += speed * delta * 20;
        
        let x = 0, y = 0, z = 0;
        
        switch(animation) {
          case 'Orbit':
            const angle = t * 0.2;
            x = Math.cos(angle) * xFactor;
            y = Math.sin(angle * 0.5) * yFactor;
            z = Math.sin(angle) * zFactor;
            break;
          case 'Random Drift':
             x = xFactor + Math.sin(t * 0.1) * 0.5;
             y = yFactor + Math.cos(t * 0.2) * 0.5;
             z = zFactor + Math.sin(t * 0.3) * 0.5;
             break;
          case 'Static':
          default:
             x = xFactor;
             y = yFactor;
             z = zFactor;
             break;
        }
        dummy.position.set(x, y, z);
      }
      
      dummy.scale.setScalar(size);
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
    });

    ref.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <Instances ref={ref} limit={count} range={count}>
      <icosahedronGeometry args={[1, 0]} />
      <meshBasicMaterial color="#ffffff" toneMapped={false} />
    </Instances>
  );
};

export default SurroundingParticles;