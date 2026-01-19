import React, { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * LOD (Level of Detail) Manager for optimizing 3D performance
 * Dynamically adjusts detail based on camera distance
 */
export function useLOD(ref, levels = [10, 50, 100]) {
  const [lod, setLod] = React.useState(0);

  useFrame(({ camera }) => {
    if (!ref.current) return;
    
    const distance = camera.position.distanceTo(ref.current.position);
    
    if (distance < levels[0]) {
      setLod(2); // High detail
    } else if (distance < levels[1]) {
      setLod(1); // Medium detail
    } else {
      setLod(0); // Low detail
    }
  });

  return lod;
}

// Instanced mesh for rendering many similar objects efficiently
export function InstancedObjects({ count, geometry, material, positions }) {
  const meshRef = React.useRef();

  useMemo(() => {
    if (!meshRef.current) return;
    
    const dummy = new THREE.Object3D();
    
    for (let i = 0; i < count; i++) {
      const pos = positions[i] || { x: 0, y: 0, z: 0 };
      dummy.position.set(pos.x, pos.y, pos.z);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [count, positions]);

  return (
    <instancedMesh ref={meshRef} args={[geometry, material, count]} />
  );
}

// Frustum culling helper
export function useFrustumCulling(objects, camera) {
  const frustum = useMemo(() => new THREE.Frustum(), []);
  const [visibleObjects, setVisibleObjects] = React.useState([]);

  useFrame(() => {
    const matrix = new THREE.Matrix4().multiplyMatrices(
      camera.projectionMatrix,
      camera.matrixWorldInverse
    );
    frustum.setFromProjectionMatrix(matrix);

    const visible = objects.filter(obj => {
      const sphere = new THREE.Sphere(
        new THREE.Vector3(obj.position.x, obj.position.y, obj.position.z),
        obj.radius || 1
      );
      return frustum.intersectsSphere(sphere);
    });

    setVisibleObjects(visible);
  });

  return visibleObjects;
}