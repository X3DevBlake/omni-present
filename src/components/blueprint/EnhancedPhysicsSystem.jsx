import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export class PhysicsObject {
  constructor(type, position, properties = {}) {
    this.id = `obj_${Date.now()}_${Math.random()}`;
    this.type = type;
    this.position = position;
    this.velocity = [0, 0, 0];
    this.properties = properties;
    this.isGrabbed = false;
    this.grabbedBy = null;
  }

  applyForce(force) {
    this.velocity[0] += force[0];
    this.velocity[1] += force[1];
    this.velocity[2] += force[2];
  }

  update(deltaTime) {
    // Apply velocity
    this.position[0] += this.velocity[0] * deltaTime;
    this.position[1] += this.velocity[1] * deltaTime;
    this.position[2] += this.velocity[2] * deltaTime;

    // Apply gravity if not grabbed
    if (!this.isGrabbed && this.position[1] > 0) {
      this.velocity[1] -= 9.8 * deltaTime;
    }

    // Ground collision
    if (this.position[1] <= 0) {
      this.position[1] = 0;
      this.velocity[1] = 0;
      // Friction
      this.velocity[0] *= 0.9;
      this.velocity[2] *= 0.9;
    }
  }
}

export function ManipulableObject({ object, onGrab, onRelease }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state, delta) => {
    if (meshRef.current && object) {
      meshRef.current.position.set(...object.position);
      
      // Visual feedback for grabbable objects
      if (hovered && !object.isGrabbed) {
        meshRef.current.scale.setScalar(1.1);
      } else if (object.isGrabbed) {
        meshRef.current.scale.setScalar(1.05);
      } else {
        meshRef.current.scale.setScalar(1);
      }

      if (object.update) {
        object.update(delta);
      }
    }
  });

  const handleClick = (e) => {
    e.stopPropagation();
    if (object.isGrabbed) {
      onRelease(object);
    } else {
      onGrab(object);
    }
  };

  const getGeometry = () => {
    switch (object.type) {
      case 'box':
        return <boxGeometry args={[1, 1, 1]} />;
      case 'sphere':
        return <sphereGeometry args={[0.5, 16, 16]} />;
      case 'tool':
        return <cylinderGeometry args={[0.1, 0.1, 1, 8]} />;
      default:
        return <boxGeometry args={[1, 1, 1]} />;
    }
  };

  return (
    <mesh
      ref={meshRef}
      onClick={handleClick}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      castShadow
    >
      {getGeometry()}
      <meshStandardMaterial
        color={object.isGrabbed ? '#00ff00' : hovered ? '#ffff00' : object.properties.color || '#888888'}
        emissive={hovered || object.isGrabbed ? '#ffffff' : '#000000'}
        emissiveIntensity={hovered || object.isGrabbed ? 0.2 : 0}
      />
    </mesh>
  );
}

export function WeatherAwareAgent({ agent, position, weatherType, onShelter }) {
  const groupRef = useRef();
  const [isSeeking, setIsSeeking] = useState(false);

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Weather-based behavior
      if (weatherType === 'rain' && !isSeeking) {
        setIsSeeking(true);
        onShelter(agent);
      } else if (weatherType === 'clear') {
        setIsSeeking(false);
      }

      // Visual indicator
      if (isSeeking) {
        groupRef.current.position.y = 0.5 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      }
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh castShadow>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color={isSeeking ? '#ff0000' : agent.color} />
      </mesh>
      {isSeeking && (
        <mesh position={[0, 0.6, 0]}>
          <coneGeometry args={[0.1, 0.2, 8]} />
          <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={0.5} />
        </mesh>
      )}
    </group>
  );
}

export function PersistentFootprints({ footprints }) {
  return (
    <group>
      {footprints.map(print => (
        <mesh key={print.id} position={print.position} rotation={[-Math.PI / 2, 0, print.rotation]}>
          <circleGeometry args={[0.15, 8]} />
          <meshBasicMaterial color="#333333" transparent opacity={Math.max(0, 1 - print.age / 100)} />
        </mesh>
      ))}
    </group>
  );
}

export function TerrainModification({ modifications }) {
  return (
    <group>
      {modifications.map(mod => (
        <mesh key={mod.id} position={mod.position} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[mod.radius, 16]} />
          <meshStandardMaterial
            color={mod.type === 'dig' ? '#654321' : '#8b7355'}
            roughness={0.9}
          />
        </mesh>
      ))}
    </group>
  );
}