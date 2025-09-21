// FIX: Add a triple-slash directive to help TypeScript resolve React Three Fiber's custom JSX elements.
/// <reference types="@react-three/fiber" />

import React, { useRef, useMemo, useCallback, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, Object3D, Color, AdditiveBlending, InstancedMesh, Euler, Mesh } from 'three';
import { useSymbolTexture } from '../hooks/useSymbolTexture';

interface InteractiveEffectsProps {
  effectType: string;
  effectColor1: string;
  effectColor2: string;
}

const tempVec = new Vector3();
const tempColor = new Color();

// --- Particle System Hook ---
const useParticleSystem = (count: number) => {
  const particles = useMemo(() => Array.from({ length: count }, () => ({
    position: new Vector3(),
    velocity: new Vector3(),
    rotation: new Vector3(),
    scale: 0,
    age: 0,
    life: 0,
    maxLife: 2 + Math.random() * 3,
    color: new Color(),
    data: new Map<string, any>(),
  })), [count]);

  const getNext = useCallback(() => {
    for (const p of particles) {
      if (p.life <= 0) return p;
    }
    return particles[Math.floor(Math.random() * particles.length)];
  }, [particles]);

  return { particles, getNext };
};

// --- Effect: Symbol Explosion & Flame ---
const SymbolExplosionEffect: React.FC<InteractiveEffectsProps> = ({ effectColor1, effectColor2 }) => {
  const symbolMeshRef = useRef<InstancedMesh>(null!);
  const emojiMeshRef = useRef<InstancedMesh>(null!);
  const flameMeshRef = useRef<InstancedMesh>(null!);
  const dummy = useMemo(() => new Object3D(), []);
  const { camera } = useThree();

  const symbolSystem = useParticleSystem(200);
  const emojiSystem = useParticleSystem(100);
  const flameSystem = useParticleSystem(300);

  const symbolTexture = useSymbolTexture('symbols');
  const emojiTexture = useSymbolTexture('emojis');

  const interactionState = useRef({ isHolding: false, isPointerDown: false, lastAction: 'none' });

  const unprojectCoords = (event: PointerEvent | MouseEvent) => new Vector3((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1, 0.5).unproject(camera);

  const spawn = useCallback((system: ReturnType<typeof useParticleSystem>, count: number, position: Vector3, type: 'symbol' | 'emoji' | 'flame') => {
    const color1 = new Color(effectColor1);
    const color2 = new Color(effectColor2);

    for (let i = 0; i < count; i++) {
      const p = system.getNext();
      p.life = p.maxLife = 1 + Math.random() * (type === 'flame' ? 1 : 2);
      p.age = 0;
      p.position.copy(position).add(new Vector3((Math.random() - 0.5), (Math.random() - 0.5), (Math.random() - 0.5)).multiplyScalar(0.2));
      
      const phi = Math.random() * Math.PI * 2;
      const theta = Math.acos(2 * Math.random() - 1);
      const speed = type === 'flame' ? Math.random() * 2 + 1 : Math.random() * 4;
      p.velocity.set(speed * Math.sin(theta) * Math.cos(phi), speed * Math.sin(theta) * Math.sin(phi), speed * Math.cos(theta));
      if (type === 'flame') p.velocity.y = Math.abs(p.velocity.y) * 1.5;

      p.scale = (type === 'emoji' ? 0.3 : 0.15) + Math.random() * 0.1;
      p.data.set('startColor', type === 'flame' ? new Color('#ffbe0b') : color1.clone());
      p.data.set('endColor', type === 'flame' ? new Color('#fb5607') : color2.clone());
    }
  }, [effectColor1, effectColor2]);

  useEffect(() => {
    // FIX: Use `ReturnType<typeof setTimeout>` for `holdTimeout` to ensure compatibility
    // with browser environments where `setTimeout` returns a number.
    let holdTimeout: ReturnType<typeof setTimeout>;
    
    const handlePointerDown = (e: PointerEvent) => {
      interactionState.current.isPointerDown = true;
      interactionState.current.lastAction = 'down';
      holdTimeout = setTimeout(() => {
        if (interactionState.current.isPointerDown) {
          interactionState.current.isHolding = true;
          spawn(flameSystem, 20, unprojectCoords(e), 'flame');
        }
      }, 200);
    };

    const handlePointerUp = (e: PointerEvent) => {
      clearTimeout(holdTimeout);
      if (!interactionState.current.isHolding && interactionState.current.lastAction !== 'dblclick') {
        spawn(symbolSystem, 50, unprojectCoords(e), 'symbol');
      }
      interactionState.current.isPointerDown = false;
      interactionState.current.isHolding = false;
      setTimeout(() => { interactionState.current.lastAction = 'none'; }, 50);
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (interactionState.current.isHolding) {
        spawn(flameSystem, 5, unprojectCoords(e), 'flame');
      }
    };
    
    const handleDoubleClick = (e: MouseEvent) => {
      interactionState.current.lastAction = 'dblclick';
      spawn(emojiSystem, 30, unprojectCoords(e), 'emoji');
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('dblclick', handleDoubleClick);

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('dblclick', handleDoubleClick);
      clearTimeout(holdTimeout);
    };
  }, [spawn, flameSystem, symbolSystem, emojiSystem]);

  useFrame((_, delta) => {
    [
      { system: symbolSystem, mesh: symbolMeshRef.current, type: 'symbol' },
      { system: emojiSystem, mesh: emojiMeshRef.current, type: 'emoji' },
      { system: flameSystem, mesh: flameMeshRef.current, type: 'flame' }
    ].forEach(({ system, mesh, type }) => {
      if (!mesh) return;
      let visible = 0;
      system.particles.forEach(p => {
        if (p.life > 0) {
          p.life -= delta;
          p.age += delta;
          p.position.addScaledVector(p.velocity, delta);
          p.velocity.multiplyScalar(0.97);
          if (type === 'flame') p.velocity.y += delta * 0.5;

          const lifeRatio = Math.max(0, p.life / p.maxLife);
          const scale = p.scale * lifeRatio * (type === 'flame' ? (1 + Math.sin(p.age * 30) * 0.2) : 1);
          
          dummy.position.copy(p.position);
          dummy.scale.set(scale, scale, scale);
          dummy.rotation.set(p.age * 2, p.age * 2, p.age * 2);
          dummy.updateMatrix();

          tempColor.copy(p.data.get('startColor')).lerp(p.data.get('endColor'), 1 - lifeRatio);

          mesh.setMatrixAt(visible, dummy.matrix);
          mesh.setColorAt(visible, tempColor);
          visible++;
        }
      });
      mesh.count = visible;
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    });
  });

  return (
    <group>
      <instancedMesh ref={symbolMeshRef} args={[undefined, undefined, symbolSystem.particles.length]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={symbolTexture} toneMapped={false} transparent blending={AdditiveBlending} depthWrite={false} />
      </instancedMesh>
      <instancedMesh ref={emojiMeshRef} args={[undefined, undefined, emojiSystem.particles.length]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={emojiTexture} toneMapped={false} transparent blending={AdditiveBlending} depthWrite={false} />
      </instancedMesh>
      <instancedMesh ref={flameMeshRef} args={[undefined, undefined, flameSystem.particles.length]}>
        <sphereGeometry args={[0.5, 8, 8]} />
        <meshStandardMaterial emissive="#ffffff" toneMapped={false} transparent blending={AdditiveBlending} depthWrite={false} />
      </instancedMesh>
    </group>
  );
};

// --- Effect: Geometric Burst ---
const GeometricBurstEffect: React.FC = () => {
    const { camera } = useThree();
    const refs = [useRef<InstancedMesh>(null!), useRef<InstancedMesh>(null!), useRef<InstancedMesh>(null!)];
    const particleSystems = [useParticleSystem(100), useParticleSystem(100), useParticleSystem(100)];
    const dummy = useMemo(() => new Object3D(), []);
    const colors = useMemo(() => [new Color('#ff477e'), new Color('#477eff'), new Color('#7eff47')], []);

    const spawn = useCallback((event: PointerEvent) => {
        const position = new Vector3((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1, 0.5).unproject(camera);
        for (let i = 0; i < 45; i++) {
            const systemIndex = i % 3;
            const p = particleSystems[systemIndex].getNext();
            p.life = p.maxLife = 2 + Math.random() * 2;
            p.age = 0;
            p.position.copy(position);
            p.velocity.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize().multiplyScalar(Math.random() * 8 + 2);
            p.data.set('rotSpeed', new Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(8));
            p.scale = Math.random() * 0.2 + 0.1;
            p.color.copy(colors[systemIndex]);
        }
    }, [camera, particleSystems, colors]);

    useEffect(() => {
        window.addEventListener('pointerdown', spawn);
        return () => window.removeEventListener('pointerdown', spawn);
    }, [spawn]);

    useFrame((_, delta) => {
        particleSystems.forEach((system, i) => {
            const mesh = refs[i].current;
            if (!mesh) return;
            let visible = 0;
            system.particles.forEach(p => {
                if (p.life > 0) {
                    p.life -= delta;
                    p.position.addScaledVector(p.velocity, delta);
                    p.velocity.multiplyScalar(0.98);
                    p.rotation.addScaledVector(p.data.get('rotSpeed'), delta);
                    const scale = p.scale * Math.max(0, p.life / p.maxLife);
                    dummy.position.copy(p.position);
                    dummy.scale.set(scale, scale, scale);
                    dummy.rotation.set(p.rotation.x, p.rotation.y, p.rotation.z);
                    dummy.updateMatrix();
                    mesh.setMatrixAt(visible, dummy.matrix);
                    mesh.setColorAt(visible, p.color);
                    visible++;
                }
            });
            mesh.count = visible;
            mesh.instanceMatrix.needsUpdate = true;
            if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
        });
    });
    
    return (
        <group>
            <instancedMesh ref={refs[0]} args={[undefined, undefined, 100]}>
                <boxGeometry />
                <meshStandardMaterial metalness={0.6} roughness={0.3} />
            </instancedMesh>
            <instancedMesh ref={refs[1]} args={[undefined, undefined, 100]}>
                <coneGeometry args={[0.7, 1.2, 8]} />
                <meshStandardMaterial metalness={0.6} roughness={0.3} />
            </instancedMesh>
            <instancedMesh ref={refs[2]} args={[undefined, undefined, 100]}>
                <dodecahedronGeometry args={[0.8, 0]} />
                <meshStandardMaterial metalness={0.6} roughness={0.3} />
            </instancedMesh>
        </group>
    );
};

// --- Effect: Vortex ---
const VortexEffect: React.FC = () => {
    const meshRef = useRef<InstancedMesh>(null!);
    const dummy = useMemo(() => new Object3D(), []);
    const { camera } = useThree();
    const { particles, getNext } = useParticleSystem(400);
    const vortexCenter = useRef(new Vector3());
    const colors = useMemo(() => [new Color('#00ffff'), new Color('#ff00ff'), new Color('#ffffff')], []);

    const spawn = useCallback((event: PointerEvent) => {
        const position = new Vector3((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1, 0.5).unproject(camera);
        vortexCenter.current.copy(position);
        
        for (let i = 0; i < 150; i++) {
            const p = getNext();
            p.life = p.maxLife = 2 + Math.random() * 3;
            p.age = 0;
            const radius = 2 + Math.random() * 4;
            const angle = Math.random() * Math.PI * 2;
            p.position.set(position.x + Math.cos(angle) * radius, position.y + Math.sin(angle) * radius, position.z + (Math.random() - 0.5) * 4);
            p.velocity.set(0, 0, 0);
            p.scale = Math.random() * 0.1 + 0.05;
            p.color.copy(colors[i % 3]);
            p.data.set('initialDist', p.position.distanceTo(vortexCenter.current));
        }
    }, [camera, getNext, colors]);

    useEffect(() => {
        window.addEventListener('pointerdown', spawn);
        return () => window.removeEventListener('pointerdown', spawn);
    }, [spawn]);

    useFrame((_, delta) => {
        if (!meshRef.current) return;
        let visible = 0;
        particles.forEach(p => {
            if (p.life > 0) {
                p.life -= delta;
                
                const toCenter = tempVec.copy(vortexCenter.current).sub(p.position);
                const dist = toCenter.length();
                if (dist < 0.1) p.life = 0;

                const pullForce = toCenter.normalize().multiplyScalar(50 / (dist * dist + 1));
                const tangentForce = tempVec.cross(new Vector3(0, 0, 1)).multiplyScalar(2 / dist);

                p.velocity.addScaledVector(pullForce, delta);
                p.velocity.addScaledVector(tangentForce, delta);
                p.velocity.multiplyScalar(0.96);
                p.position.addScaledVector(p.velocity, delta);

                const scale = p.scale * Math.max(0, p.life / p.maxLife);
                dummy.position.copy(p.position);
                dummy.scale.set(scale * 0.1, scale * 3, scale * 0.1); // streaks
                dummy.lookAt(p.position.clone().add(p.velocity));
                dummy.updateMatrix();

                meshRef.current.setMatrixAt(visible, dummy.matrix);
                meshRef.current.setColorAt(visible, p.color);
                visible++;
            }
        });
        meshRef.current.count = visible;
        meshRef.current.instanceMatrix.needsUpdate = true;
        if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, 400]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial emissive="#ffffff" toneMapped={false} transparent blending={AdditiveBlending} depthWrite={false} />
        </instancedMesh>
    );
};

// --- Effect: Bubble Pop ---
const BubblePopEffect: React.FC = () => {
    const meshRef = useRef<InstancedMesh>(null!);
    const dummy = useMemo(() => new Object3D(), []);
    const { camera } = useThree();
    const { particles, getNext } = useParticleSystem(100);
    const colors = useMemo(() => [new Color('#ffdde1'), new Color('#ee9ca7')], []);

    const spawn = useCallback((event: PointerEvent) => {
        const position = new Vector3((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1, 0.5).unproject(camera);
        
        for (let i = 0; i < 15; i++) {
            const p = getNext();
            p.life = p.maxLife = 3 + Math.random() * 3;
            p.age = 0;
            p.position.copy(position).add(new Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(0.5));
            p.velocity.set((Math.random() - 0.5) * 0.2, 0.5 + Math.random(), (Math.random() - 0.5) * 0.2).multiplyScalar(0.3);
            p.scale = Math.random() * 0.2 + 0.15;
            p.data.set('color1', colors[0]);
            p.data.set('color2', colors[1]);
        }
    }, [camera, getNext, colors]);

    useEffect(() => {
        window.addEventListener('pointerdown', spawn);
        return () => window.removeEventListener('pointerdown', spawn);
    }, [spawn]);

    useFrame(({ clock }, delta) => {
        if (!meshRef.current) return;
        let visible = 0;
        particles.forEach(p => {
            if (p.life > 0) {
                p.life -= delta;
                p.age += delta;
                p.position.addScaledVector(p.velocity, delta);
                p.velocity.y += Math.sin(clock.elapsedTime + p.age) * delta * 0.3; // gentle wobble
                p.velocity.multiplyScalar(0.99);

                const popTime = p.maxLife - 0.15;
                const scale = p.age > popTime ? p.scale * 1.2 * Math.max(0, (p.maxLife - p.age) / 0.15) : p.scale * (1 + Math.sin(p.age * 2) * 0.05);

                dummy.position.copy(p.position);
                dummy.scale.setScalar(scale);
                dummy.updateMatrix();

                tempColor.copy(p.data.get('color1')).lerp(p.data.get('color2'), 0.5 + Math.sin(p.age * 3 + clock.elapsedTime * 5) * 0.5);

                meshRef.current.setMatrixAt(visible, dummy.matrix);
                meshRef.current.setColorAt(visible, tempColor);
                visible++;
            }
        });
        meshRef.current.count = visible;
        meshRef.current.instanceMatrix.needsUpdate = true;
        if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, 100]}>
            <sphereGeometry args={[1, 24, 24]} />
            <meshPhysicalMaterial transparent={true} opacity={0.5} iridescence={1} iridescenceIOR={1.8} roughness={0.05} metalness={0.1} />
        </instancedMesh>
    );
};

// --- Effect: Growing Orb ---
const GrowingOrbEffect: React.FC = () => {
    const meshRef = useRef<InstancedMesh>(null!);
    const dummy = useMemo(() => new Object3D(), []);
    const { camera } = useThree();
    const { particles, getNext } = useParticleSystem(20);
    const colors = useMemo(() => [new Color('#f7b733'), new Color('#fc4a1a')], []);


    const spawn = useCallback((event: PointerEvent) => {
        const p = getNext();
        p.life = p.maxLife = 2.5;
        p.age = 0;
        p.position.set((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1, 0.5).unproject(camera);
        p.scale = Math.random() * 2 + 1.5; // max scale
        p.data.set('color1', colors[0]);
        p.data.set('color2', colors[1]);
    }, [camera, getNext, colors]);

    useEffect(() => {
        window.addEventListener('pointerdown', spawn);
        return () => window.removeEventListener('pointerdown', spawn);
    }, [spawn]);

    useFrame((_, delta) => {
        if (!meshRef.current) return;
        let visible = 0;
        particles.forEach(p => {
            if (p.life > 0) {
                p.life -= delta;
                p.age += delta;

                const lifeRatio = p.age / p.maxLife;
                const baseScale = Math.sin(lifeRatio * Math.PI);
                const pulse = 1 + Math.sin(p.age * 15) * 0.05;
                const scale = p.scale * baseScale * pulse;

                dummy.position.copy(p.position);
                dummy.scale.setScalar(scale);
                dummy.updateMatrix();

                tempColor.copy(p.data.get('color1')).lerp(p.data.get('color2'), lifeRatio);

                meshRef.current.setMatrixAt(visible, dummy.matrix);
                meshRef.current.setColorAt(visible, tempColor);
                visible++;
            }
        });
        meshRef.current.count = visible;
        meshRef.current.instanceMatrix.needsUpdate = true;
        if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, 20]}>
            <sphereGeometry args={[1, 32, 32]} />
            <meshStandardMaterial emissive="#ffffff" toneMapped={false} transparent blending={AdditiveBlending} depthWrite={false} />
        </instancedMesh>
    );
};

// --- Effect: Electric Arcs ---
const ElectricArcsEffect: React.FC = () => {
    const meshRef = useRef<InstancedMesh>(null!);
    const dummy = useMemo(() => new Object3D(), []);
    const { camera } = useThree();
    const { particles, getNext } = useParticleSystem(250);
    const color = useMemo(() => new Color('#00ff00'), []);

    const spawn = useCallback((event: PointerEvent) => {
        const position = new Vector3((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1, 0.5).unproject(camera);
        for (let i = 0; i < 30; i++) {
            const p = getNext();
            p.life = p.maxLife = 0.4 + Math.random() * 0.4;
            p.age = 0;
            p.position.copy(position);
            p.velocity.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize().multiplyScalar(15);
            p.color.copy(color).lerp(new Color('#ccffcc'), Math.random() * 0.5);
        }
    }, [camera, getNext, color]);
    
    useEffect(() => {
        window.addEventListener('pointerdown', spawn);
        return () => window.removeEventListener('pointerdown', spawn);
    }, [spawn]);

    useFrame((_, delta) => {
        if (!meshRef.current) return;
        let visible = 0;
        particles.forEach(p => {
            if (p.life > 0) {
                p.life -= delta;
                
                const jolt = tempVec.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize().multiplyScalar(40 * delta);
                p.velocity.add(jolt).multiplyScalar(0.95);
                p.position.addScaledVector(p.velocity, delta);

                const scale = Math.max(0, p.life / p.maxLife);
                dummy.position.copy(p.position);
                dummy.scale.set(0.02, 0.3 * scale, 0.02);
                dummy.lookAt(p.position.clone().add(p.velocity));
                dummy.updateMatrix();

                meshRef.current.setMatrixAt(visible, dummy.matrix);
                meshRef.current.setColorAt(visible, p.color);
                visible++;
            }
        });
        meshRef.current.count = visible;
        meshRef.current.instanceMatrix.needsUpdate = true;
        if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, 250]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial emissive="#ffffff" emissiveIntensity={4} toneMapped={false} blending={AdditiveBlending} />
        </instancedMesh>
    );
};

// --- Effect: Meteor Shower ---
const MeteorShowerEffect: React.FC = () => {
    const meshRef = useRef<InstancedMesh>(null!);
    const dummy = useMemo(() => new Object3D(), []);
    const { camera, size } = useThree();
    const { particles, getNext } = useParticleSystem(500);
    const interaction = useRef({ isHolding: false, target: new Vector3() });
    const colors = useMemo(() => [new Color('#ff8800'), new Color('#ff4400'), new Color('#ffee88')], []);

    const spawn = useCallback((count: number) => {
        const target = interaction.current.target;
        for (let i = 0; i < count; i++) {
            const p = getNext();
            p.life = p.maxLife = 1.5 + Math.random() * 1.5;
            p.age = 0;
            const spawnRadius = Math.max(size.width, size.height) / 100;
            p.position.set(
                (Math.random() - 0.5) * spawnRadius,
                spawnRadius / 2,
                -10
            ).applyMatrix4(camera.matrixWorld);

            const velocity = tempVec.copy(target).sub(p.position).normalize().multiplyScalar(20 + Math.random() * 10);
            p.velocity.copy(velocity);
            p.scale = Math.random() * 0.1 + 0.05;
            p.color.copy(colors[Math.floor(Math.random() * colors.length)]);
        }
    }, [camera, getNext, colors, size]);

    useEffect(() => {
        const onPointerDown = (e: PointerEvent) => {
            interaction.current.isHolding = true;
            interaction.current.target.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1, 0.5).unproject(camera);
        };
        const onPointerUp = () => interaction.current.isHolding = false;
        const onPointerMove = (e: PointerEvent) => {
            if(interaction.current.isHolding){
                interaction.current.target.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1, 0.5).unproject(camera);
            }
        };

        window.addEventListener('pointerdown', onPointerDown);
        window.addEventListener('pointerup', onPointerUp);
        window.addEventListener('pointermove', onPointerMove);
        return () => {
            window.removeEventListener('pointerdown', onPointerDown);
            window.removeEventListener('pointerup', onPointerUp);
            window.removeEventListener('pointermove', onPointerMove);
        }
    }, [camera, spawn]);
    
    useFrame((_, delta) => {
        if (interaction.current.isHolding) {
            spawn(5);
        }
        if (!meshRef.current) return;
        let visible = 0;
        particles.forEach(p => {
            if (p.life > 0) {
                p.life -= delta;
                p.position.addScaledVector(p.velocity, delta);
                const lifeRatio = Math.max(0, p.life / p.maxLife);
                const scale = p.scale * lifeRatio;

                dummy.position.copy(p.position);
                dummy.scale.set(scale, scale, scale * 10);
                dummy.lookAt(p.position.clone().add(p.velocity));
                dummy.updateMatrix();

                meshRef.current.setMatrixAt(visible, dummy.matrix);
                meshRef.current.setColorAt(visible, p.color);
                visible++;
            }
        });
        meshRef.current.count = visible;
        meshRef.current.instanceMatrix.needsUpdate = true;
        if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, 500]}>
            <coneGeometry args={[0.2, 1, 8]} />
            <meshStandardMaterial emissive="#ffffff" toneMapped={false} transparent blending={AdditiveBlending} depthWrite={false} />
        </instancedMesh>
    );
};


// --- Effect: Liquid Metal ---
const LiquidMetalEffect: React.FC = () => {
    const meshRef = useRef<InstancedMesh>(null!);
    const dummy = useMemo(() => new Object3D(), []);
    const { camera } = useThree();
    const { particles, getNext } = useParticleSystem(200);
    const color = useMemo(() => new Color('#c0c0c0'), []);

    const spawn = useCallback((event: PointerEvent) => {
        const position = new Vector3((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1, 0.5).unproject(camera);
        for (let i = 0; i < 40; i++) {
            const p = getNext();
            p.life = p.maxLife = 2 + Math.random() * 2;
            p.age = 0;
            p.position.copy(position);
            p.velocity.set(Math.random() - 0.5, Math.random() * 0.8, Math.random() - 0.5).normalize().multiplyScalar(Math.random() * 6 + 2);
            p.scale = Math.random() * 0.15 + 0.05;
            p.color.copy(color);
        }
    }, [camera, getNext, color]);
    
    useEffect(() => {
        window.addEventListener('pointerdown', spawn);
        return () => window.removeEventListener('pointerdown', spawn);
    }, [spawn]);

    useFrame((_, delta) => {
        if (!meshRef.current) return;
        let visible = 0;
        particles.forEach(p => {
            if (p.life > 0) {
                p.life -= delta;
                p.velocity.y -= 9.8 * delta; // Gravity
                p.position.addScaledVector(p.velocity, delta);

                const scale = p.scale * Math.max(0, p.life / p.maxLife);
                dummy.position.copy(p.position);
                dummy.scale.setScalar(scale);
                dummy.updateMatrix();

                meshRef.current.setMatrixAt(visible, dummy.matrix);
                visible++;
            }
        });
        meshRef.current.count = visible;
        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, 200]}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshStandardMaterial color={color} metalness={1.0} roughness={0.1} />
        </instancedMesh>
    );
};


// --- Effect: Crystalline Growth ---
const CrystallineGrowthEffect: React.FC = () => {
    const meshRef = useRef<InstancedMesh>(null!);
    const dummy = useMemo(() => new Object3D(), []);
    const { camera } = useThree();
    const { particles, getNext } = useParticleSystem(600);
    const color = useMemo(() => new Color('#a0e0ff'), []);

    const spawn = useCallback((event: PointerEvent) => {
        const position = new Vector3((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1, 0.5).unproject(camera);
        const p = getNext();
        p.life = p.maxLife = 0.5 + Math.random() * 0.5;
        p.age = 0;
        p.position.copy(position);
        p.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        p.scale = 0.2;
        p.data.set('gen', 0); // Generation
    }, [camera, getNext]);
    
    useEffect(() => {
        window.addEventListener('pointerdown', spawn);
        return () => window.removeEventListener('pointerdown', spawn);
    }, [spawn]);

    useFrame((_, delta) => {
        if (!meshRef.current) return;
        let visible = 0;
        particles.forEach(p => {
            if (p.life > 0) {
                p.life -= delta;
                p.age += delta;

                // Branching logic
                const gen = p.data.get('gen');
                if (gen < 5 && Math.random() < 0.05) {
                    const child = getNext();
                    if(child.life <= 0) {
                        const parentDir = new Vector3(0, 1, 0).applyEuler(new Euler(p.rotation.x, p.rotation.y, p.rotation.z));
                        child.position.copy(p.position).add(parentDir.multiplyScalar(p.scale * 0.8));
                        child.rotation.copy(p.rotation).add(new Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(1.5));
                        child.life = child.maxLife = p.maxLife * 0.9;
                        child.age = 0;
                        child.scale = p.scale * 0.9;
                        child.data.set('gen', gen + 1);
                    }
                }

                const scale = p.scale * (p.age / p.maxLife) * (1 - p.age / p.maxLife) * 4;
                dummy.position.copy(p.position);
                dummy.rotation.set(p.rotation.x, p.rotation.y, p.rotation.z);
                dummy.scale.set(scale * 0.2, scale, scale * 0.2);
                dummy.updateMatrix();

                meshRef.current.setMatrixAt(visible, dummy.matrix);
                meshRef.current.setColorAt(visible, color);
                visible++;
            }
        });
        meshRef.current.count = visible;
        meshRef.current.instanceMatrix.needsUpdate = true;
        if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, 600]}>
            <coneGeometry args={[0.5, 2, 6]} />
            <meshStandardMaterial emissive="#ffffff" emissiveIntensity={1.5} toneMapped={false} color={color} transparent opacity={0.8} />
        </instancedMesh>
    );
};

// --- Effect: Black Hole ---
const BlackHoleEffect: React.FC = () => {
    const meshRef = useRef<InstancedMesh>(null!);
    const blackHoleMeshRef = useRef<Mesh>(null!);
    const dummy = useMemo(() => new Object3D(), []);
    const { camera } = useThree();
    const { particles, getNext } = useParticleSystem(500);
    const center = useRef(new Vector3());
    const colors = useMemo(() => [new Color('#ff00ff'), new Color('#00ffff'), new Color('#ffff00')], []);

    const spawn = useCallback((event: PointerEvent) => {
        const position = new Vector3((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1, 0.5).unproject(camera);
        center.current.copy(position);
        
        for (let i = 0; i < 200; i++) {
            const p = getNext();
            p.life = p.maxLife = 4 + Math.random() * 4;
            p.age = 0;
            const radius = 3 + Math.random() * 5;
            const angle = Math.random() * Math.PI * 2;
            p.position.set(position.x + Math.cos(angle) * radius, position.y + Math.sin(angle) * radius, position.z + (Math.random() - 0.5) * 2);
            p.velocity.copy(p.position).sub(center.current).cross(new Vector3(0,0,1)).normalize().multiplyScalar(0.5);
            p.scale = Math.random() * 0.1 + 0.05;
            p.color.copy(colors[i%3]);
        }
    }, [camera, getNext, colors]);

    useEffect(() => {
        window.addEventListener('pointerdown', spawn);
        return () => window.removeEventListener('pointerdown', spawn);
    }, [spawn]);

    useFrame((_, delta) => {
        if (blackHoleMeshRef.current) {
            const isVisible = particles.some(p => p.life > 0);
            if (blackHoleMeshRef.current.visible !== isVisible) {
                blackHoleMeshRef.current.visible = isVisible;
            }
            if (isVisible) {
                blackHoleMeshRef.current.position.copy(center.current);
            }
        }
        
        if (!meshRef.current) return;
        let visible = 0;
        particles.forEach(p => {
            if (p.life > 0) {
                p.life -= delta;
                
                const toCenter = tempVec.copy(center.current).sub(p.position);
                const distSq = toCenter.lengthSq();
                if (distSq < 0.01) p.life = 0;

                const pullForce = toCenter.normalize().multiplyScalar(20 * delta / (distSq + 0.1));
                p.velocity.add(pullForce).multiplyScalar(0.99);
                p.position.addScaledVector(p.velocity, delta);

                const scale = p.scale * Math.max(0, p.life / p.maxLife);
                dummy.position.copy(p.position);
                dummy.scale.setScalar(scale);
                dummy.updateMatrix();

                meshRef.current.setMatrixAt(visible, dummy.matrix);
                meshRef.current.setColorAt(visible, p.color);
                visible++;
            }
        });
        meshRef.current.count = visible;
        meshRef.current.instanceMatrix.needsUpdate = true;
        if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    });

    return (
        <>
            <mesh ref={blackHoleMeshRef} visible={false}>
                <sphereGeometry args={[0.2, 32, 32]}/>
                <meshBasicMaterial color="black" />
            </mesh>
            <instancedMesh ref={meshRef} args={[undefined, undefined, 500]}>
                <sphereGeometry args={[1, 8, 8]} />
                <meshStandardMaterial emissive="#ffffff" toneMapped={false} blending={AdditiveBlending} />
            </instancedMesh>
        </>
    );
};

// --- Effect: Water Droplets ---
const WaterDropletsEffect: React.FC = () => {
    const meshRef = useRef<InstancedMesh>(null!);
    const dummy = useMemo(() => new Object3D(), []);
    const { camera } = useThree();
    const { particles, getNext } = useParticleSystem(250);

    const spawn = useCallback((event: PointerEvent) => {
        const position = new Vector3((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1, 0.5).unproject(camera);
        for (let i = 0; i < 50; i++) {
            const p = getNext();
            p.life = p.maxLife = 2.5 + Math.random() * 2;
            p.age = 0;
            p.position.copy(position);
            p.velocity.set(Math.random() - 0.5, Math.random() * 1.2, Math.random() - 0.5).normalize().multiplyScalar(Math.random() * 5 + 3);
            p.scale = Math.random() * 0.12 + 0.04;
        }
    }, [camera, getNext]);
    
    useEffect(() => {
        window.addEventListener('pointerdown', spawn);
        return () => window.removeEventListener('pointerdown', spawn);
    }, [spawn]);

    useFrame((_, delta) => {
        if (!meshRef.current) return;
        let visible = 0;
        particles.forEach(p => {
            if (p.life > 0) {
                p.life -= delta;
                p.velocity.y -= 9.8 * delta; // Gravity
                p.position.addScaledVector(p.velocity, delta);
                const scale = p.scale * Math.max(0, p.life / p.maxLife);
                dummy.position.copy(p.position);
                dummy.scale.setScalar(scale);
                dummy.updateMatrix();
                meshRef.current.setMatrixAt(visible, dummy.matrix);
                visible++;
            }
        });
        meshRef.current.count = visible;
        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, 250]}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshPhysicalMaterial 
                transmission={1.0} 
                roughness={0.05} 
                ior={1.33} 
                thickness={1.5} 
                color="#eefcff" 
            />
        </instancedMesh>
    );
};

// --- Effect: Glass Balls ---
const GlassBallsEffect: React.FC = () => {
    const meshRef = useRef<InstancedMesh>(null!);
    const dummy = useMemo(() => new Object3D(), []);
    const { camera } = useThree();
    const { particles, getNext } = useParticleSystem(150);

    const spawn = useCallback((event: PointerEvent) => {
        const position = new Vector3((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1, 0.5).unproject(camera);
        for (let i = 0; i < 30; i++) {
            const p = getNext();
            p.life = p.maxLife = 3 + Math.random() * 2;
            p.age = 0;
            p.position.copy(position);
            p.velocity.set(Math.random() - 0.5, Math.random(), Math.random() - 0.5).normalize().multiplyScalar(Math.random() * 7 + 2);
            p.scale = Math.random() * 0.2 + 0.1;
        }
    }, [camera, getNext]);
    
    useEffect(() => {
        window.addEventListener('pointerdown', spawn);
        return () => window.removeEventListener('pointerdown', spawn);
    }, [spawn]);

    useFrame((_, delta) => {
        if (!meshRef.current) return;
        let visible = 0;
        particles.forEach(p => {
            if (p.life > 0) {
                p.life -= delta;
                p.velocity.y -= 9.8 * delta * 1.2; // Heavier gravity
                p.position.addScaledVector(p.velocity, delta);
                const scale = p.scale * Math.max(0, p.life / p.maxLife);
                dummy.position.copy(p.position);
                dummy.scale.setScalar(scale);
                dummy.updateMatrix();
                meshRef.current.setMatrixAt(visible, dummy.matrix);
                visible++;
            }
        });
        meshRef.current.count = visible;
        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, 150]}>
            <sphereGeometry args={[1, 24, 24]} />
            <meshPhysicalMaterial 
                transmission={1.0} 
                roughness={0.0} 
                ior={1.5} 
                thickness={2.5} 
                specularIntensity={1}
            />
        </instancedMesh>
    );
};

// --- Effect: Molten Lava ---
const MoltenLavaEffect: React.FC = () => {
    const meshRef = useRef<InstancedMesh>(null!);
    const dummy = useMemo(() => new Object3D(), []);
    const { camera } = useThree();
    const { particles, getNext } = useParticleSystem(200);
    const color = useMemo(() => new Color('#ff6600'), []);

    const spawn = useCallback((event: PointerEvent) => {
        const position = new Vector3((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1, 0.5).unproject(camera);
        for (let i = 0; i < 35; i++) {
            const p = getNext();
            p.life = p.maxLife = 1.5 + Math.random() * 1.5;
            p.age = 0;
            p.position.copy(position);
            p.velocity.set(Math.random() - 0.5, Math.random() * 0.5, Math.random() - 0.5).normalize().multiplyScalar(Math.random() * 3 + 1);
            p.scale = Math.random() * 0.2 + 0.1;
            p.color.copy(color);
        }
    }, [camera, getNext, color]);
    
    useEffect(() => {
        window.addEventListener('pointerdown', spawn);
        return () => window.removeEventListener('pointerdown', spawn);
    }, [spawn]);

    useFrame((_, delta) => {
        if (!meshRef.current) return;
        let visible = 0;
        particles.forEach(p => {
            if (p.life > 0) {
                p.life -= delta;
                p.velocity.y -= 9.8 * delta * 0.8;
                p.velocity.multiplyScalar(0.98);
                p.position.addScaledVector(p.velocity, delta);
                
                const lifeRatio = Math.max(0, p.life / p.maxLife);
                const scale = p.scale * lifeRatio;
                dummy.position.copy(p.position);
                dummy.scale.setScalar(scale);
                dummy.updateMatrix();

                const cooling = Math.pow(lifeRatio, 2);
                tempColor.copy(p.color).multiplyScalar(cooling * 1.5 + 0.5);

                meshRef.current.setMatrixAt(visible, dummy.matrix);
                meshRef.current.setColorAt(visible, tempColor);
                visible++;
            }
        });
        meshRef.current.count = visible;
        meshRef.current.instanceMatrix.needsUpdate = true;
        if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, 200]}>
            <sphereGeometry args={[1, 12, 12]} />
            <meshStandardMaterial 
                emissive="#ffffff"
                toneMapped={false} 
                roughness={0.6}
            />
        </instancedMesh>
    );
};

// --- Main Component ---
const InteractiveEffects: React.FC<InteractiveEffectsProps> = (props) => {
  switch (props.effectType) {
    case 'Symbol Explosion & Flame':
      return <SymbolExplosionEffect {...props} />;
    case 'Geometric Burst':
      return <GeometricBurstEffect />;
    case 'Vortex':
      return <VortexEffect />;
    case 'Bubble Pop':
      return <BubblePopEffect />;
    case 'Growing Orb':
      return <GrowingOrbEffect />;
    case 'Electric Arcs':
      return <ElectricArcsEffect />;
    case 'Meteor Shower':
      return <MeteorShowerEffect />;
    case 'Liquid Metal':
        return <LiquidMetalEffect />;
    case 'Crystalline Growth':
        return <CrystallineGrowthEffect />;
    case 'Black Hole':
        return <BlackHoleEffect />;
    case 'Water Droplets':
        return <WaterDropletsEffect />;
    case 'Glass Balls':
        return <GlassBallsEffect />;
    case 'Molten Lava':
        return <MoltenLavaEffect />;
    default:
      return <SymbolExplosionEffect {...props} />;
  }
};

export default InteractiveEffects;