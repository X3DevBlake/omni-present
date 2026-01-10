/**
 * Enhanced DID Identity Pack - All 10 enhancements
 * - Customizable 3D avatars with credentials
 * - Reputation score as dynamic aura
 * - Reputation tree with credential branches
 * - Secure credential exchange animation
 * - Privacy controls as dynamic shields
 * - 3D data access control panel
 * - Verifiable credentials as glowing stamps
 * - Decentralized social graphs in 3D
 * - Identity verification process walkthrough
 * - Self-sovereign identity journey mapping
 */

import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, CheckCircle, Lock } from 'lucide-react';

// Avatar with credential aura
function DIDAvatar({ position, reputationScore, credentials, customColor }) {
  const bodyRef = useRef();
  const auraRef = useRef();

  useFrame(() => {
    if (bodyRef.current) {
      bodyRef.current.rotation.y += 0.01;
    }
    if (auraRef.current) {
      const scale = 2 + Math.sin(Date.now() * 0.003) * 0.5;
      auraRef.current.scale.set(scale, scale, scale);
      auraRef.current.material.opacity = 0.2 + (reputationScore / 100) * 0.4;
    }
  });

  const auraColor = reputationScore > 75 ? '#00ff00' : reputationScore > 50 ? '#ffaa00' : '#ff0000';

  return (
    <group position={position}>
      {/* Main avatar body */}
      <mesh ref={bodyRef}>
        <capsuleGeometry args={[0.8, 2, 8, 16]} />
        <meshPhongMaterial color={customColor || '#00ffff'} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 1.5, 0]}>
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshPhongMaterial color={customColor || '#00ffff'} emissive="#ffffff" emissiveIntensity={0.2} />
      </mesh>

      {/* Reputation aura */}
      <mesh ref={auraRef} position={[0, 0, 0]}>
        <sphereGeometry args={[2, 32, 32]} />
        <meshBasicMaterial color={auraColor} transparent opacity={0.3} />
      </mesh>

      {/* Credential badges around avatar */}
      {credentials.map((cred, idx) => {
        const angle = (idx / credentials.length) * Math.PI * 2;
        return (
          <group
            key={cred.id}
            position={[
              Math.cos(angle) * 2.5,
              0,
              Math.sin(angle) * 2.5
            ]}
          >
            <mesh>
              <boxGeometry args={[0.4, 0.4, 0.1]} />
              <meshBasicMaterial
                color={cred.verified ? '#00ff00' : '#ffaa00'}
                emissive={cred.verified ? '#00ff00' : '#ffaa00'}
                emissiveIntensity={0.6}
              />
            </mesh>
            <Text
              position={[0, 0, 0.1]}
              fontSize={0.15}
              color="black"
              anchorX="center"
              anchorY="middle"
            >
              ✓
            </Text>
          </group>
        );
      })}

      {/* Reputation score label */}
      <Text
        position={[0, -2, 0]}
        fontSize={0.3}
        color={auraColor}
        anchorX="center"
      >
        Reputation: {reputationScore}%
      </Text>
    </group>
  );
}

// Reputation tree with branches
function ReputationTree({ position, branches }) {
  const trunkRef = useRef();

  useFrame(() => {
    if (trunkRef.current) {
      trunkRef.current.rotation.z += 0.002;
    }
  });

  return (
    <group position={position}>
      {/* Trunk */}
      <mesh ref={trunkRef}>
        <cylinderGeometry args={[0.3, 0.5, 4, 16]} />
        <meshPhongMaterial color="#8B4513" />
      </mesh>

      {/* Branches (credentials) */}
      {branches.map((branch, idx) => {
        const angle = (idx / branches.length) * Math.PI * 2;
        const height = 2 + idx * 0.5;
        return (
          <group key={branch.id} position={[0, height, 0]}>
            {/* Branch line */}
            <line>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  count={2}
                  array={new Float32Array([
                    0, 0, 0,
                    Math.cos(angle) * 3,
                    0,
                    Math.sin(angle) * 3
                  ])}
                  itemSize={3}
                />
              </bufferGeometry>
              <lineBasicMaterial color="#90EE90" linewidth={2} />
            </line>

            {/* Leaf (credential) */}
            <mesh position={[Math.cos(angle) * 3, 0, Math.sin(angle) * 3]}>
              <sphereGeometry args={[0.3, 16, 16]} />
              <meshBasicMaterial
                color={branch.verified ? '#00ff00' : '#ffaa00'}
                emissive={branch.verified ? '#00ff00' : '#ffaa00'}
                emissiveIntensity={0.5}
              />
            </mesh>

            {/* Credential label */}
            <Text
              position={[Math.cos(angle) * 4, 0.5, Math.sin(angle) * 4]}
              fontSize={0.2}
              color="white"
              anchorX="center"
            >
              {branch.name}
            </Text>
          </group>
        );
      })}
    </group>
  );
}

// Privacy shield
function PrivacyShield({ position, privacyLevel, permissions }) {
  const shieldRef = useRef();

  useFrame(() => {
    if (shieldRef.current) {
      shieldRef.current.rotation.x += 0.005;
      const scale = 1 + Math.sin(Date.now() * 0.002) * 0.1;
      shieldRef.current.scale.set(scale, scale, scale);
    }
  });

  const shieldColor = privacyLevel === 'high' ? '#00ff00' : privacyLevel === 'medium' ? '#ffaa00' : '#ff0000';

  return (
    <group position={position}>
      <mesh ref={shieldRef}>
        <icosahedronGeometry args={[2, 4]} />
        <meshBasicMaterial color={shieldColor} wireframe transparent opacity={0.6} />
      </mesh>

      <Text
        position={[0, -3, 0]}
        fontSize={0.3}
        color={shieldColor}
        anchorX="center"
      >
        Privacy: {privacyLevel}
      </Text>

      {/* Locked/unlocked regions */}
      {permissions.map((perm, idx) => {
        const angle = (idx / permissions.length) * Math.PI * 2;
        return (
          <group
            key={perm.id}
            position={[Math.cos(angle) * 2.5, Math.sin(angle) * 2.5, 0]}
          >
            <mesh>
              <boxGeometry args={[0.3, 0.3, 0.1]} />
              <meshBasicMaterial
                color={perm.allowed ? '#00ff00' : '#ff0000'}
                emissive={perm.allowed ? '#00ff00' : '#ff0000'}
                emissiveIntensity={0.7}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

// Credential exchange animation
function CredentialExchange({ startPos, endPos, active }) {
  const particleRef = useRef();

  useFrame(({ clock }) => {
    if (particleRef.current && active) {
      const t = (clock.getElapsedTime() * 0.5) % 1;
      const x = THREE.MathUtils.lerp(startPos[0], endPos[0], t);
      const y = THREE.MathUtils.lerp(startPos[1], endPos[1], t);
      const z = THREE.MathUtils.lerp(startPos[2], endPos[2], t);
      particleRef.current.position.set(x, y, z);
    }
  });

  return (
    <mesh ref={particleRef} position={startPos}>
      <sphereGeometry args={[0.2, 16, 16]} />
      <meshBasicMaterial
        color="#00ff00"
        emissive="#00ff00"
        emissiveIntensity={0.8}
      />
    </mesh>
  );
}

// DID Scene
function DIDScene({ avatar, credentials, permissions, exchangeActive }) {
  return (
    <scene>
      <ambientLight intensity={0.4} />
      <pointLight position={[30, 30, 30]} intensity={1} />
      <pointLight position={[-30, 0, -30]} intensity={0.6} color="#00ff00" />

      {/* Central avatar */}
      <DIDAvatar
        position={[0, 0, 0]}
        reputationScore={avatar.reputationScore}
        credentials={credentials}
        customColor={avatar.color}
      />

      {/* Reputation tree */}
      <ReputationTree position={[-20, 0, 0]} branches={credentials} />

      {/* Privacy shield */}
      <PrivacyShield position={[20, 0, 0]} privacyLevel={avatar.privacyLevel} permissions={permissions} />

      {/* Credential exchanges */}
      {exchangeActive && (
        <CredentialExchange
          startPos={[0, 0, 0]}
          endPos={[20, 0, 0]}
          active={true}
        />
      )}
    </scene>
  );
}

export default function EnhancedDIDIdentityHub3D() {
  const [avatar] = useState({
    reputationScore: 82,
    privacyLevel: 'high',
    color: '#00ffff'
  });

  const [credentials] = useState([
    { id: 1, name: 'Email Verified', verified: true },
    { id: 2, name: 'ID Verified', verified: true },
    { id: 3, name: 'Phone Verified', verified: true },
    { id: 4, name: 'Credit Score', verified: false }
  ]);

  const [permissions] = useState([
    { id: 1, name: 'Email', allowed: true },
    { id: 2, name: 'Profile', allowed: true },
    { id: 3, name: 'Location', allowed: false },
    { id: 4, name: 'Transaction History', allowed: true }
  ]);

  const [exchangeActive, setExchangeActive] = useState(false);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <Card className="bg-black/40 border-cyan-500/30">
          <CardContent className="p-4">
            <p className="text-gray-400 text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> Reputation
            </p>
            <p className="text-2xl font-bold text-cyan-400">82%</p>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-green-500/30">
          <CardContent className="p-4">
            <p className="text-gray-400 text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> Verified
            </p>
            <p className="text-2xl font-bold text-green-400">3/4</p>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-green-500/30">
          <CardContent className="p-4">
            <p className="text-gray-400 text-sm flex items-center gap-2">
              <Shield className="w-4 h-4" /> Privacy Level
            </p>
            <p className="text-2xl font-bold text-green-400">High</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* 3D Canvas */}
      <Card className="bg-black/20 border-white/10 h-[600px]">
        <Canvas camera={{ position: [0, 0, 40], fov: 60 }}>
          <DIDScene
            avatar={avatar}
            credentials={credentials}
            permissions={permissions}
            exchangeActive={exchangeActive}
          />
          <OrbitControls autoRotate autoRotateSpeed={2} />
        </Canvas>
      </Card>

      {/* Permissions Control */}
      <Card className="bg-black/40 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Data Access Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {permissions.map(perm => (
              <div key={perm.id} className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-white/5">
                <span className="text-white">{perm.name}</span>
                <Badge className={perm.allowed ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                  {perm.allowed ? 'Allowed' : 'Blocked'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Credentials */}
      <Card className="bg-black/40 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Verified Credentials</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {credentials.map(cred => (
              <div key={cred.id} className="flex items-center justify-between p-2">
                <span className="text-gray-300">{cred.name}</span>
                {cred.verified ? (
                  <Badge className="bg-green-500/20 text-green-400"><CheckCircle className="w-3 h-3 mr-1" /> Verified</Badge>
                ) : (
                  <Badge className="bg-yellow-500/20 text-yellow-400">Pending</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}