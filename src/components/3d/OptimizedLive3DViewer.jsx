import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// LOD levels configuration
const LOD_LEVELS = {
  HIGH: { distance: 5, quality: 1.0 },
  MEDIUM: { distance: 10, quality: 0.6 },
  LOW: { distance: 20, quality: 0.3 }
};

// Animation state configurations
const ANIMATION_CONFIGS = {
  idle: { speed: 1.0, blend: 0.3 },
  walking: { speed: 1.5, blend: 0.2 },
  running: { speed: 2.0, blend: 0.15 },
  working: { speed: 0.8, blend: 0.4 },
  celebrating: { speed: 1.2, blend: 0.25 },
  waving: { speed: 1.0, blend: 0.2, duration: 2000 },
  nodding: { speed: 1.5, blend: 0.15, duration: 1000 }
};

function ComponentMesh({ component, properties, lodLevel, isLazyLoaded }) {
  const meshRef = useRef();
  const [isLoaded, setIsLoaded] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(!isLazyLoaded);

  // Lazy loading trigger
  useEffect(() => {
    if (isLazyLoaded && !shouldLoad) {
      const timer = setTimeout(() => setShouldLoad(true), 100);
      return () => clearTimeout(timer);
    }
  }, [isLazyLoaded, shouldLoad]);

  const { scene } = useGLTF(shouldLoad ? component.asset_url : '', () => setIsLoaded(true));

  useEffect(() => {
    if (meshRef.current && properties?.color) {
      meshRef.current.traverse((child) => {
        if (child.isMesh) {
          child.material.color.set(properties.color);
        }
      });
    }
  }, [properties?.color]);

  // Apply LOD-based quality reduction
  useEffect(() => {
    if (meshRef.current && lodLevel !== 'HIGH') {
      meshRef.current.traverse((child) => {
        if (child.isMesh) {
          const quality = LOD_LEVELS[lodLevel].quality;
          if (child.geometry) {
            // Simplify geometry for lower LOD
            const simplified = child.geometry.clone();
            simplified.setDrawRange(0, Math.floor(simplified.attributes.position.count * quality));
            child.geometry = simplified;
          }
        }
      });
    }
  }, [lodLevel]);

  if (!shouldLoad || !isLoaded) return null;

  return (
    <primitive
      ref={meshRef}
      object={scene.clone()}
      scale={properties?.scale || 1}
      position={properties?.position || [0, 0, 0]}
    />
  );
}

function AnimatedAvatar({ baseModel, components, componentProperties, animationState, lodLevel }) {
  const groupRef = useRef();
  const mixerRef = useRef();
  const actionsRef = useRef({});
  const [currentAnimation, setCurrentAnimation] = useState('idle');
  const [blendProgress, setBlendProgress] = useState(0);

  const { scene, animations } = useGLTF(baseModel.base_mesh_url);

  // Setup animation mixer
  useEffect(() => {
    if (animations && animations.length > 0) {
      mixerRef.current = new THREE.AnimationMixer(scene);
      
      animations.forEach((clip) => {
        const action = mixerRef.current.clipAction(clip);
        actionsRef.current[clip.name] = action;
      });

      // Start with idle
      if (actionsRef.current['idle']) {
        actionsRef.current['idle'].play();
      }
    }

    return () => {
      if (mixerRef.current) {
        mixerRef.current.stopAllAction();
      }
    };
  }, [animations, scene]);

  // Animation blending on state change
  useEffect(() => {
    if (!mixerRef.current || !actionsRef.current[animationState]) return;

    const config = ANIMATION_CONFIGS[animationState];
    const newAction = actionsRef.current[animationState];
    const oldAction = actionsRef.current[currentAnimation];

    if (oldAction && oldAction !== newAction) {
      newAction.reset();
      newAction.setEffectiveTimeScale(config.speed);
      newAction.setEffectiveWeight(0);
      newAction.play();

      // Blend from old to new
      setBlendProgress(0);
      const blendDuration = config.blend * 1000;
      const startTime = Date.now();

      const blendInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / blendDuration, 1);
        
        newAction.setEffectiveWeight(progress);
        oldAction.setEffectiveWeight(1 - progress);
        
        setBlendProgress(progress);

        if (progress >= 1) {
          clearInterval(blendInterval);
          oldAction.stop();
        }
      }, 16);

      return () => clearInterval(blendInterval);
    }

    setCurrentAnimation(animationState);
  }, [animationState, currentAnimation]);

  // Animation frame update
  useFrame((state, delta) => {
    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }

    // Idle subtle movement
    if (groupRef.current && animationState === 'idle') {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.02;
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene.clone()} />
      {components.map((component, idx) => (
        <ComponentMesh
          key={component.id}
          component={component}
          properties={componentProperties?.[component.id]}
          lodLevel={lodLevel}
          isLazyLoaded={idx > 5}
        />
      ))}
    </group>
  );
}

export default function OptimizedLive3DViewer({
  avatarData,
  animationState = 'idle',
  enableLOD = true,
  enableLazyLoading = true
}) {
  const [baseModel, setBaseModel] = useState(null);
  const [components, setComponents] = useState([]);
  const [lodLevel, setLodLevel] = useState('HIGH');
  const cameraRef = useRef();

  useEffect(() => {
    const loadData = async () => {
      try {
        if (avatarData.avatar_base_id) {
          const bases = await base44.entities.AvatarBase.list();
          const base = bases.find(b => b.id === avatarData.avatar_base_id);
          setBaseModel(base);
        }

        if (avatarData.selected_components?.length > 0) {
          const allComponents = await base44.entities.CustomComponent.list();
          const selected = allComponents.filter(c => 
            avatarData.selected_components.includes(c.id)
          );
          setComponents(selected);
        }
      } catch (error) {
        console.error('Failed to load avatar data:', error);
      }
    };

    loadData();
  }, [avatarData]);

  // Dynamic LOD based on camera distance
  useFrame((state) => {
    if (!enableLOD || !cameraRef.current) return;

    const distance = state.camera.position.distanceTo(new THREE.Vector3(0, 0, 0));
    
    if (distance < LOD_LEVELS.HIGH.distance) {
      setLodLevel('HIGH');
    } else if (distance < LOD_LEVELS.MEDIUM.distance) {
      setLodLevel('MEDIUM');
    } else {
      setLodLevel('LOW');
    }
  });

  if (!baseModel) return null;

  return (
    <AnimatedAvatar
      baseModel={baseModel}
      components={components}
      componentProperties={avatarData.component_properties}
      animationState={animationState}
      lodLevel={lodLevel}
    />
  );
}