import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function LODObject({ position, highDetail, mediumDetail, lowDetail, distances = [10, 25, 50] }) {
  const lodRef = useRef();
  
  useMemo(() => {
    if (lodRef.current) {
      lodRef.current.addLevel(highDetail, distances[0]);
      lodRef.current.addLevel(mediumDetail, distances[1]);
      lodRef.current.addLevel(lowDetail, distances[2]);
    }
  }, [highDetail, mediumDetail, lowDetail, distances]);
  
  useFrame(({ camera }) => {
    if (lodRef.current) {
      lodRef.current.update(camera);
    }
  });
  
  return <lOD ref={lodRef} position={position} />;
}

export function InstancedNodes({ count = 100, radius = 20, color = '#00f5ff' }) {
  const meshRef = useRef();
  
  const positions = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = radius * Math.cbrt(Math.random());
      
      temp.push({
        x: r * Math.sin(phi) * Math.cos(theta),
        y: r * Math.sin(phi) * Math.sin(theta),
        z: r * Math.cos(phi)
      });
    }
    return temp;
  }, [count, radius]);
  
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  useFrame((state) => {
    if (meshRef.current) {
      positions.forEach((pos, i) => {
        dummy.position.set(pos.x, pos.y, pos.z);
        dummy.rotation.y = state.clock.elapsedTime + i;
        dummy.scale.setScalar(0.5 + Math.sin(state.clock.elapsedTime + i) * 0.2);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
      });
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  });
  
  return (
    <instancedMesh ref={meshRef} args={[null, null, count]}>
      <sphereGeometry args={[0.2, 8, 8]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
    </instancedMesh>
  );
}

export function FrustumCulledGroup({ children, boundingBox }) {
  const groupRef = useRef();
  const [visible, setVisible] = React.useState(true);
  
  useFrame(({ camera }) => {
    if (groupRef.current && boundingBox) {
      const frustum = new THREE.Frustum();
      const matrix = new THREE.Matrix4().multiplyMatrices(
        camera.projectionMatrix,
        camera.matrixWorldInverse
      );
      frustum.setFromProjectionMatrix(matrix);
      
      const box = new THREE.Box3().setFromObject(groupRef.current);
      setVisible(frustum.intersectsBox(box));
    }
  });
  
  return visible ? <group ref={groupRef}>{children}</group> : null;
}

export default LODObject;