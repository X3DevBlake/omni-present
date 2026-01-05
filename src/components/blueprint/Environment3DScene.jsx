import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PhysicsInteractiveObject } from './PhysicsSystem';

function Office() {
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
      
      {/* Walls */}
      <mesh position={[0, 2, -10]}>
        <boxGeometry args={[20, 6, 0.2]} />
        <meshStandardMaterial color="#3a3a3a" />
      </mesh>
      <mesh position={[-10, 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[20, 6, 0.2]} />
        <meshStandardMaterial color="#3a3a3a" />
      </mesh>
      
      {/* Desk - Static */}
      <mesh position={[3, 0, 2]}>
        <boxGeometry args={[4, 1.5, 2]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      
      {/* Interactive Chair */}
      <PhysicsInteractiveObject
        geometry={{ type: 'cylinder', args: [0.5, 0.5, 0.8] }}
        position={[3, 0.1, 4]}
        color="#1a1a1a"
        physicsProps={{ mass: 2, friction: 0.7, restitution: 0.2, canBePushed: true }}
      />
      
      {/* Interactive objects on desk */}
      <PhysicsInteractiveObject
        geometry={{ type: 'box', args: [0.3, 0.3, 0.3] }}
        position={[3.5, 1.6, 2]}
        color="#ff6b6b"
        physicsProps={{ mass: 0.5, friction: 0.5, restitution: 0.3 }}
      />
      <PhysicsInteractiveObject
        geometry={{ type: 'sphere', args: [0.15] }}
        position={[2.5, 1.6, 2]}
        color="#4ecdc4"
        physicsProps={{ mass: 0.3, friction: 0.3, restitution: 0.6 }}
      />
      
      {/* Shelves */}
      {[0, 1, 2].map(i => (
        <mesh key={i} position={[-8, i * 1.5, -9]}>
          <boxGeometry args={[3, 0.3, 1]} />
          <meshStandardMaterial color="#5a4a3a" />
        </mesh>
      ))}
    </group>
  );
}

function Nature() {
  return (
    <group>
      {/* Ground with grass texture */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#2d5016" roughness={0.9} />
      </mesh>
      
      {/* Trees */}
      {[...Array(8)].map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const radius = 8 + Math.random() * 4;
        return (
          <group key={i} position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}>
            {/* Trunk */}
            <mesh position={[0, 1, 0]}>
              <cylinderGeometry args={[0.3, 0.4, 3]} />
              <meshStandardMaterial color="#4a3520" />
            </mesh>
            {/* Foliage */}
            <mesh position={[0, 3.5, 0]}>
              <coneGeometry args={[1.5, 3, 8]} />
              <meshStandardMaterial color="#1a5c1a" />
            </mesh>
          </group>
        );
      })}
      
      {/* Rocks */}
      {[...Array(5)].map((_, i) => (
        <mesh key={i} position={[Math.random() * 10 - 5, -0.5, Math.random() * 10 - 5]}>
          <dodecahedronGeometry args={[0.5 + Math.random() * 0.5]} />
          <meshStandardMaterial color="#6a6a6a" />
        </mesh>
      ))}
      
      {/* Small lake */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[5, -0.8, 5]}>
        <circleGeometry args={[3, 32]} />
        <meshStandardMaterial color="#1e5a8e" transparent opacity={0.7} />
      </mesh>
    </group>
  );
}

function Street() {
  return (
    <group>
      {/* Road */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
        <planeGeometry args={[8, 30]} />
        <meshStandardMaterial color="#3a3a3a" />
      </mesh>
      
      {/* Road lines */}
      {[...Array(10)].map((_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.95, -12 + i * 3]}>
          <planeGeometry args={[0.3, 1.5]} />
          <meshStandardMaterial color="#ffff00" />
        </mesh>
      ))}
      
      {/* Sidewalks */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[6, -0.9, 0]}>
        <planeGeometry args={[4, 30]} />
        <meshStandardMaterial color="#c0c0c0" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-6, -0.9, 0]}>
        <planeGeometry args={[4, 30]} />
        <meshStandardMaterial color="#c0c0c0" />
      </mesh>
      
      {/* Buildings */}
      {[...Array(6)].map((_, i) => {
        const side = i % 2 === 0 ? 10 : -10;
        const height = 3 + Math.random() * 4;
        return (
          <mesh key={i} position={[side, height / 2 - 1, -10 + i * 4]}>
            <boxGeometry args={[3, height, 3]} />
            <meshStandardMaterial color="#5a5a5a" />
          </mesh>
        );
      })}
      
      {/* Street lights */}
      {[...Array(5)].map((_, i) => (
        <group key={i} position={[5, 0, -10 + i * 5]}>
          <mesh position={[0, 2, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 4]} />
            <meshStandardMaterial color="#2a2a2a" />
          </mesh>
          <mesh position={[0, 4, 0]}>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshStandardMaterial color="#ffee88" emissive="#ffee88" emissiveIntensity={2} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function House() {
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
        <planeGeometry args={[15, 15]} />
        <meshStandardMaterial color="#d4a373" />
      </mesh>
      
      {/* Main walls */}
      <mesh position={[0, 1.5, -5]}>
        <boxGeometry args={[10, 5, 0.3]} />
        <meshStandardMaterial color="#f5f5dc" />
      </mesh>
      <mesh position={[-5, 1.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[10, 5, 0.3]} />
        <meshStandardMaterial color="#f5f5dc" />
      </mesh>
      <mesh position={[5, 1.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[10, 5, 0.3]} />
        <meshStandardMaterial color="#f5f5dc" />
      </mesh>
      
      {/* Roof */}
      <mesh position={[0, 4.5, 0]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[8, 0.3, 11]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      
      {/* Furniture - Couch */}
      <mesh position={[-2, 0, 2]}>
        <boxGeometry args={[2, 1, 1]} />
        <meshStandardMaterial color="#4a4a8a" />
      </mesh>
      
      {/* Table */}
      <mesh position={[2, 0.3, 0]}>
        <boxGeometry args={[1.5, 0.1, 1.5]} />
        <meshStandardMaterial color="#6a4a3a" />
      </mesh>
      
      {/* Windows */}
      <mesh position={[0, 1.5, -4.9]}>
        <planeGeometry args={[2, 2]} />
        <meshStandardMaterial color="#87ceeb" transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

function Mountain() {
  return (
    <group>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#8b7355" />
      </mesh>
      
      {/* Mountains */}
      {[...Array(5)].map((_, i) => {
        const x = (i - 2) * 8;
        const height = 6 + Math.random() * 4;
        return (
          <mesh key={i} position={[x, height / 2 - 1, -15]} rotation={[0, Math.random() * Math.PI, 0]}>
            <coneGeometry args={[3 + Math.random() * 2, height, 6]} />
            <meshStandardMaterial color="#5a5a5a" />
          </mesh>
        );
      })}
      
      {/* Snow caps */}
      {[...Array(5)].map((_, i) => {
        const x = (i - 2) * 8;
        const height = 6 + Math.random() * 4;
        return (
          <mesh key={i} position={[x, height * 0.7, -15]}>
            <coneGeometry args={[1.5, height * 0.3, 6]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        );
      })}
      
      {/* Path */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.9, 0]}>
        <planeGeometry args={[2, 30]} />
        <meshStandardMaterial color="#6a5a4a" />
      </mesh>
    </group>
  );
}

export default function Environment3DScene({ environmentType }) {
  const getLighting = () => {
    switch (environmentType) {
      case 'nature':
        return { ambient: 0.6, sun: { intensity: 1.5, color: '#ffe87c' } };
      case 'street':
        return { ambient: 0.4, sun: { intensity: 1, color: '#ffffff' } };
      case 'mountain':
        return { ambient: 0.5, sun: { intensity: 1.2, color: '#fff5e1' } };
      case 'house':
        return { ambient: 0.7, sun: { intensity: 0.8, color: '#fffacd' } };
      default:
        return { ambient: 0.5, sun: { intensity: 1, color: '#ffffff' } };
    }
  };

  const lighting = getLighting();

  return (
    <group>
      <ambientLight intensity={lighting.ambient} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={lighting.sun.intensity}
        color={lighting.sun.color}
        castShadow
      />
      
      {environmentType === 'office' && <Office />}
      {environmentType === 'nature' && <Nature />}
      {environmentType === 'street' && <Street />}
      {environmentType === 'house' && <House />}
      {environmentType === 'mountain' && <Mountain />}
    </group>
  );
}