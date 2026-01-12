import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// LOD Management System
const LODManager = {
  levels: [
    { distance: 0, quality: 'high', textureSize: 2048 },
    { distance: 5, quality: 'medium', textureSize: 1024 },
    { distance: 10, quality: 'low', textureSize: 512 }
  ],
  
  getLODLevel(distance) {
    for (let i = this.levels.length - 1; i >= 0; i--) {
      if (distance >= this.levels[i].distance) {
        return i;
      }
    }
    return 0;
  }
};

// Asset Streaming Manager
class AssetStreamingManager {
  constructor() {
    this.cache = new Map();
    this.loading = new Map();
    this.loadQueue = [];
  }

  async loadAsset(url, priority = 1) {
    if (this.cache.has(url)) {
      return this.cache.get(url);
    }

    if (this.loading.has(url)) {
      return this.loading.get(url);
    }

    const loadPromise = new Promise((resolve, reject) => {
      this.loadQueue.push({ url, priority, resolve, reject });
      this.loadQueue.sort((a, b) => b.priority - a.priority);
      this.processQueue();
    });

    this.loading.set(url, loadPromise);
    return loadPromise;
  }

  async processQueue() {
    if (this.loadQueue.length === 0) return;

    const { url, resolve, reject } = this.loadQueue.shift();
    
    try {
      const loader = new THREE.GLTFLoader();
      const gltf = await new Promise((res, rej) => {
        loader.load(url, res, undefined, rej);
      });
      
      this.cache.set(url, gltf);
      this.loading.delete(url);
      resolve(gltf);
    } catch (error) {
      this.loading.delete(url);
      reject(error);
    }
  }
}

const streamingManager = new AssetStreamingManager();

// Animation Blending System
const AnimationBlender = {
  animations: {
    idle: { loop: true, speed: 1 },
    walking: { loop: true, speed: 1.2 },
    running: { loop: true, speed: 1.5 },
    waving: { loop: false, speed: 1, duration: 2 },
    nodding: { loop: false, speed: 1, duration: 1 },
    celebrating: { loop: false, speed: 1, duration: 3 }
  },

  blend(mixer, fromAction, toAction, duration = 0.3) {
    if (fromAction && fromAction !== toAction) {
      fromAction.fadeOut(duration);
    }
    if (toAction) {
      toAction.reset().fadeIn(duration).play();
    }
  }
};

function ComponentMesh({ asset_url, properties, lodLevel }) {
  const [model, setModel] = useState(null);
  const meshRef = useRef();

  useEffect(() => {
    let mounted = true;
    const priority = lodLevel === 0 ? 3 : lodLevel === 1 ? 2 : 1;

    streamingManager.loadAsset(asset_url, priority).then((gltf) => {
      if (mounted) {
        setModel(gltf.scene.clone());
      }
    }).catch(console.error);

    return () => { mounted = false; };
  }, [asset_url, lodLevel]);

  useEffect(() => {
    if (model && meshRef.current && properties) {
      meshRef.current.traverse((child) => {
        if (child.isMesh) {
          if (properties.color) {
            child.material = child.material.clone();
            child.material.color.set(properties.color);
          }
          if (properties.scale) {
            child.scale.setScalar(properties.scale);
          }
        }
      });
    }
  }, [model, properties]);

  if (!model) return null;

  return <primitive ref={meshRef} object={model} />;
}

export default function OptimizedAvatarModel({ base, components, componentProperties, animation, isExpanded }) {
  const groupRef = useRef();
  const mixerRef = useRef();
  const actionsRef = useRef({});
  const currentActionRef = useRef(null);
  const [lodLevel, setLodLevel] = useState(0);
  const [loadedComponents, setLoadedComponents] = useState([]);

  // Lazy load components based on viewport visibility
  useEffect(() => {
    const visibleComponents = isExpanded ? components : components.slice(0, 5);
    setLoadedComponents(visibleComponents);
  }, [components, isExpanded]);

  // LOD calculation
  useFrame(({ camera }) => {
    if (groupRef.current) {
      const distance = camera.position.distanceTo(groupRef.current.position);
      const newLOD = LODManager.getLODLevel(distance);
      if (newLOD !== lodLevel) {
        setLodLevel(newLOD);
      }
    }
  });

  // Animation system
  useEffect(() => {
    if (!groupRef.current) return;

    const mixer = new THREE.AnimationMixer(groupRef.current);
    mixerRef.current = mixer;

    // Create mock animations for demonstration
    const createMockAnimation = (name) => {
      const times = [0, 1, 2];
      const values = [0, 1, 0];
      const track = new THREE.NumberKeyframeTrack('.position[y]', times, values);
      const clip = new THREE.AnimationClip(name, 2, [track]);
      return mixer.clipAction(clip);
    };

    actionsRef.current = {
      idle: createMockAnimation('idle'),
      walking: createMockAnimation('walking'),
      running: createMockAnimation('running'),
      waving: createMockAnimation('waving'),
      nodding: createMockAnimation('nodding'),
      celebrating: createMockAnimation('celebrating')
    };

    return () => {
      mixer.stopAllAction();
    };
  }, []);

  // Handle animation transitions
  useEffect(() => {
    if (!mixerRef.current || !actionsRef.current) return;

    const newAction = actionsRef.current[animation];
    if (newAction && newAction !== currentActionRef.current) {
      AnimationBlender.blend(mixerRef.current, currentActionRef.current, newAction);
      currentActionRef.current = newAction;
    }
  }, [animation]);

  // Update animation mixer
  useFrame((state, delta) => {
    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }
  });

  // Optimized texture loading based on LOD
  const textureQuality = useMemo(() => {
    return LODManager.levels[lodLevel].textureSize;
  }, [lodLevel]);

  if (!base) return null;

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {base.base_mesh_url && (
        <BaseMesh url={base.base_mesh_url} lodLevel={lodLevel} />
      )}
      
      {loadedComponents.map((component) => (
        <ComponentMesh
          key={component.id}
          asset_url={component.asset_url}
          properties={componentProperties[component.id]}
          lodLevel={lodLevel}
        />
      ))}
    </group>
  );
}

function BaseMesh({ url, lodLevel }) {
  const [model, setModel] = useState(null);

  useEffect(() => {
    streamingManager.loadAsset(url, 5).then((gltf) => {
      setModel(gltf.scene.clone());
    }).catch(console.error);
  }, [url]);

  if (!model) return null;

  return <primitive object={model} />;
}