import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

class PhysicsSimulation {
  constructor() {
    this.objects = [];
    this.gravity = new THREE.Vector3(0, -9.81, 0);
    this.airResistance = 0.01;
    this.groundY = 0;
  }

  addObject(obj) {
    this.objects.push({
      position: obj.position.clone(),
      velocity: new THREE.Vector3(),
      mass: obj.mass || 1,
      restitution: obj.restitution || 0.6,
      friction: obj.friction || 0.3,
      isStatic: obj.isStatic || false,
      radius: obj.radius || 0.5
    });
  }

  update(delta) {
    this.objects.forEach((obj, i) => {
      if (obj.isStatic) return;

      // Apply gravity
      const gravityForce = this.gravity.clone().multiplyScalar(obj.mass * delta);
      obj.velocity.add(gravityForce);

      // Air resistance
      const resistance = obj.velocity.clone().multiplyScalar(-this.airResistance);
      obj.velocity.add(resistance);

      // Update position
      const displacement = obj.velocity.clone().multiplyScalar(delta);
      obj.position.add(displacement);

      // Ground collision
      if (obj.position.y - obj.radius < this.groundY) {
        obj.position.y = this.groundY + obj.radius;
        obj.velocity.y *= -obj.restitution;
        
        // Friction
        obj.velocity.x *= (1 - obj.friction * delta);
        obj.velocity.z *= (1 - obj.friction * delta);
      }

      // Object-object collisions
      this.objects.forEach((other, j) => {
        if (i === j) return;
        const distance = obj.position.distanceTo(other.position);
        const minDistance = obj.radius + other.radius;
        
        if (distance < minDistance) {
          const normal = obj.position.clone().sub(other.position).normalize();
          const relativeVelocity = obj.velocity.clone().sub(other.velocity);
          const velocityAlongNormal = relativeVelocity.dot(normal);
          
          if (velocityAlongNormal < 0) {
            const impulse = normal.multiplyScalar(velocityAlongNormal * (1 + obj.restitution));
            obj.velocity.sub(impulse);
          }
        }
      });
    });
  }

  getObjects() {
    return this.objects;
  }
}

export function DynamicPhysicsEngine({ children, onPhysicsUpdate }) {
  const simulationRef = useRef(new PhysicsSimulation());

  useFrame((state, delta) => {
    simulationRef.current.update(delta);
    onPhysicsUpdate?.(simulationRef.current.getObjects());
  });

  return <>{children}</>;
}

export function PhysicsObject({ initialPosition, mass, restitution, color = '#00f5ff' }) {
  const meshRef = useRef();
  const [position, setPosition] = useState(initialPosition);

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
    </mesh>
  );
}