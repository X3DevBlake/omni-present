import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export class PhysicsObject {
  constructor(mesh, properties) {
    this.mesh = mesh;
    this.mass = properties.mass || 1;
    this.friction = properties.friction || 0.5;
    this.restitution = properties.restitution || 0.3;
    this.velocity = new THREE.Vector3();
    this.isStatic = properties.isStatic || false;
    this.canBePushed = properties.canBePushed !== false;
  }

  applyForce(force) {
    if (!this.isStatic && this.canBePushed) {
      const acceleration = force.divideScalar(this.mass);
      this.velocity.add(acceleration);
    }
  }

  update(delta) {
    if (this.isStatic) return;

    // Apply gravity
    this.velocity.y -= 9.8 * delta;

    // Apply friction
    this.velocity.x *= (1 - this.friction * delta);
    this.velocity.z *= (1 - this.friction * delta);

    // Update position
    this.mesh.position.add(this.velocity.clone().multiplyScalar(delta));

    // Ground collision
    if (this.mesh.position.y < 0) {
      this.mesh.position.y = 0;
      this.velocity.y = -this.velocity.y * this.restitution;
      
      // Stop if velocity is very small
      if (Math.abs(this.velocity.y) < 0.1) {
        this.velocity.y = 0;
      }
    }
  }
}

export function PhysicsInteractiveObject({ 
  geometry, 
  position, 
  color, 
  physicsProps,
  onInteraction 
}) {
  const meshRef = useRef();
  const physicsObject = useRef(null);
  const [isHighlighted, setIsHighlighted] = useState(false);

  useEffect(() => {
    if (meshRef.current) {
      physicsObject.current = new PhysicsObject(meshRef.current, physicsProps);
    }
  }, []);

  useFrame((state, delta) => {
    if (physicsObject.current) {
      physicsObject.current.update(delta);
    }
  });

  const handlePush = (direction, force = 5) => {
    if (physicsObject.current) {
      const pushForce = new THREE.Vector3(...direction).normalize().multiplyScalar(force);
      physicsObject.current.applyForce(pushForce);
      onInteraction?.({ type: 'push', force: pushForce });
    }
  };

  return (
    <mesh
      ref={meshRef}
      position={position}
      onPointerOver={() => setIsHighlighted(true)}
      onPointerOut={() => setIsHighlighted(false)}
      onClick={() => handlePush([Math.random() - 0.5, 0.5, Math.random() - 0.5], 8)}
      castShadow
      receiveShadow
    >
      {geometry.type === 'box' && <boxGeometry args={geometry.args} />}
      {geometry.type === 'sphere' && <sphereGeometry args={geometry.args} />}
      {geometry.type === 'cylinder' && <cylinderGeometry args={geometry.args} />}
      
      <meshStandardMaterial
        color={color}
        transparent
        opacity={isHighlighted ? 0.9 : 0.7}
        emissive={isHighlighted ? color : '#000000'}
        emissiveIntensity={isHighlighted ? 0.3 : 0}
      />
    </mesh>
  );
}

export function usePhysicsInteraction(agentPosition, objects, interactionRange = 2) {
  const [nearbyObjects, setNearbyObjects] = useState([]);

  useFrame(() => {
    const agentPos = new THREE.Vector3(...agentPosition);
    const nearby = objects.filter(obj => {
      const objPos = new THREE.Vector3(...obj.position);
      return agentPos.distanceTo(objPos) < interactionRange;
    });
    
    if (nearby.length !== nearbyObjects.length) {
      setNearbyObjects(nearby);
    }
  });

  const pushObject = (objectId, direction, force = 5) => {
    const object = objects.find(o => o.id === objectId);
    if (object && object.physicsRef?.current) {
      const pushForce = new THREE.Vector3(...direction).normalize().multiplyScalar(force);
      object.physicsRef.current.applyForce(pushForce);
      return true;
    }
    return false;
  };

  return { nearbyObjects, pushObject };
}