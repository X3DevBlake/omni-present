import React, { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function InteractiveDoor({ position, onInteract, id }) {
  const [isOpen, setIsOpen] = useState(false);
  const doorRef = useRef();
  const targetRotation = useRef(0);

  useFrame(() => {
    if (doorRef.current) {
      targetRotation.current = isOpen ? Math.PI / 2 : 0;
      doorRef.current.rotation.y += (targetRotation.current - doorRef.current.rotation.y) * 0.1;
    }
  });

  const handleClick = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    onInteract?.(id, 'door', newState ? 'open' : 'closed');
  };

  return (
    <group position={position}>
      <mesh ref={doorRef} onClick={handleClick} position={[0.5, 1, 0]}>
        <boxGeometry args={[1, 2, 0.1]} />
        <meshStandardMaterial color={isOpen ? "#4ade80" : "#8b5cf6"} />
      </mesh>
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[0.2, 2, 0.2]} />
        <meshStandardMaterial color="#6b7280" />
      </mesh>
    </group>
  );
}

export function InteractiveSwitch({ position, onInteract, id }) {
  const [isActive, setIsActive] = useState(false);
  const switchRef = useRef();

  const handleClick = () => {
    const newState = !isActive;
    setIsActive(newState);
    onInteract?.(id, 'switch', newState ? 'on' : 'off');
  };

  return (
    <group position={position} onClick={handleClick}>
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[0.2, 0.3, 0.1]} />
        <meshStandardMaterial color="#374151" />
      </mesh>
      <mesh ref={switchRef} position={[0, isActive ? 0.2 : 0.15, 0.06]}>
        <boxGeometry args={[0.1, 0.1, 0.05]} />
        <meshStandardMaterial color={isActive ? "#10b981" : "#ef4444"} emissive={isActive ? "#10b981" : "#000000"} emissiveIntensity={isActive ? 0.5 : 0} />
      </mesh>
    </group>
  );
}

export function InteractiveObject({ position, type, onInteract, id, onPickup }) {
  const [isPickedUp, setIsPickedUp] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const meshRef = useRef();
  const velocityRef = useRef([0, 0, 0]);

  useFrame((state, delta) => {
    if (meshRef.current && !isDragging && !isPickedUp) {
      velocityRef.current[1] -= 9.8 * delta;
      
      const newY = meshRef.current.position.y + velocityRef.current[1] * delta;
      if (newY < position[1]) {
        meshRef.current.position.y = position[1];
        velocityRef.current[1] = 0;
      } else {
        meshRef.current.position.y = newY;
      }
    }
  });

  const handleClick = (e) => {
    e.stopPropagation();
    if (!isPickedUp) {
      setIsPickedUp(true);
      onPickup?.(id, e.point);
      onInteract?.(id, 'object', 'picked_up');
    }
  };

  const getGeometry = () => {
    switch (type) {
      case 'box': return <boxGeometry args={[0.3, 0.3, 0.3]} />;
      case 'sphere': return <sphereGeometry args={[0.2, 16, 16]} />;
      case 'cylinder': return <cylinderGeometry args={[0.15, 0.15, 0.4, 16]} />;
      default: return <boxGeometry args={[0.3, 0.3, 0.3]} />;
    }
  };

  return (
    <mesh ref={meshRef} position={position} onClick={handleClick} onPointerOver={() => (document.body.style.cursor = 'grab')} onPointerOut={() => (document.body.style.cursor = 'auto')}>
      {getGeometry()}
      <meshStandardMaterial color={isPickedUp ? "#fbbf24" : "#3b82f6"} transparent opacity={isPickedUp ? 0.7 : 1} />
    </mesh>
  );
}

export function InteractiveLever({ position, onInteract, id }) {
  const [isPulled, setIsPulled] = useState(false);
  const leverRef = useRef();

  useFrame(() => {
    if (leverRef.current) {
      const target = isPulled ? -Math.PI / 4 : Math.PI / 4;
      leverRef.current.rotation.z += (target - leverRef.current.rotation.z) * 0.1;
    }
  });

  const handleClick = () => {
    const newState = !isPulled;
    setIsPulled(newState);
    onInteract?.(id, 'lever', newState ? 'pulled' : 'released');
  };

  return (
    <group position={position} onClick={handleClick}>
      <mesh>
        <cylinderGeometry args={[0.05, 0.05, 0.5, 8]} />
        <meshStandardMaterial color="#6b7280" />
      </mesh>
      <mesh ref={leverRef} position={[0, 0.25, 0]} rotation={[0, 0, Math.PI / 4]}>
        <cylinderGeometry args={[0.03, 0.03, 0.4, 8]} />
        <meshStandardMaterial color={isPulled ? "#10b981" : "#ef4444"} />
      </mesh>
    </group>
  );
}

export function EnvironmentSensor({ position, radius = 2, onDetection }) {
  const sensorRef = useRef();
  const [detected, setDetected] = useState([]);

  useFrame(() => {
    if (sensorRef.current && onDetection) {
      // Simplified detection - in real implementation would check for nearby objects
      const newDetected = [];
      onDetection(position, radius, newDetected);
    }
  });

  return (
    <group position={position} ref={sensorRef}>
      <mesh>
        <sphereGeometry args={[radius, 16, 16]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.1} wireframe />
      </mesh>
    </group>
  );
}