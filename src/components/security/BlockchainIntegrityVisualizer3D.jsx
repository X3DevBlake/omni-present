import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Box, Line } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Shield, Lock, Database, CheckCircle } from 'lucide-react';

function BlockNode({ record, index, total }) {
  const meshRef = useRef();
  const angle = (index / total) * Math.PI * 2;
  const radius = 5;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;
  const y = index * 0.5;

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
      if (record.verification_status === 'confirmed') {
        const pulse = Math.sin(state.clock.elapsedTime * 1.5) * 0.1 + 1;
        meshRef.current.scale.set(pulse, pulse, pulse);
      }
    }
  });

  const statusColors = {
    confirmed: '#00FF00',
    pending: '#FFFF00',
    failed: '#FF0000'
  };

  const color = statusColors[record.verification_status] || '#888888';

  return (
    <group position={[x, y, z]}>
      <Box ref={meshRef} args={[0.8, 0.8, 0.8]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={record.verification_status === 'confirmed' ? 0.8 : 0.3}
          metalness={0.9}
          roughness={0.1}
        />
      </Box>
      <Text
        position={[0, 1.2, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
      >
        Block #{record.block_number}
      </Text>
      <Text
        position={[0, -1, 0]}
        fontSize={0.15}
        color={color}
        anchorX="center"
      >
        {record.confirmations} confirms
      </Text>
    </group>
  );
}

function BlockchainChain({ records }) {
  const lines = [];
  
  for (let i = 0; i < records.length - 1; i++) {
    const angle1 = (i / records.length) * Math.PI * 2;
    const angle2 = ((i + 1) / records.length) * Math.PI * 2;
    const radius = 5;
    
    lines.push({
      from: [Math.cos(angle1) * radius, i * 0.5, Math.sin(angle1) * radius],
      to: [Math.cos(angle2) * radius, (i + 1) * 0.5, Math.sin(angle2) * radius]
    });
  }

  return (
    <>
      {lines.map((line, idx) => (
        <Line
          key={idx}
          points={[line.from, line.to]}
          color="#00FFFF"
          lineWidth={2}
          transparent
          opacity={0.6}
        />
      ))}
    </>
  );
}

function BlockchainScene({ records }) {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#00FF00" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00FFFF" />
      
      <OrbitControls autoRotate autoRotateSpeed={0.5} />

      {records.map((record, idx) => (
        <BlockNode
          key={record.id || idx}
          record={record}
          index={idx}
          total={records.length}
        />
      ))}

      <BlockchainChain records={records} />

      <Text position={[0, -2, 0]} fontSize={0.4} color="#00FFFF" anchorX="center">
        Blockchain Integrity Layer
      </Text>
    </>
  );
}

export default function BlockchainIntegrityVisualizer3D({ vaultId }) {
  const { data: records = [] } = useQuery({
    queryKey: ['blockchain-records', vaultId],
    queryFn: async () => {
      const filter = vaultId ? { vault_id: vaultId } : {};
      return await base44.entities.BlockchainDataRecord.filter(filter);
    },
    refetchInterval: 5000
  });

  const confirmed = records.filter(r => r.verification_status === 'confirmed').length;
  const pending = records.filter(r => r.verification_status === 'pending').length;
  const totalGas = records.reduce((sum, r) => sum + (r.gas_used || 0), 0);

  return (
    <Card className="bg-gradient-to-br from-slate-900 to-green-950 border-green-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Database className="w-6 h-6 text-green-400" />
            Blockchain Integrity
          </span>
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-green-900 text-green-200">
              <CheckCircle className="w-3 h-3 mr-1" />
              {confirmed} Confirmed
            </Badge>
            {pending > 0 && (
              <Badge variant="outline" className="bg-yellow-900 text-yellow-200">
                {pending} Pending
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-96 w-full rounded-lg overflow-hidden bg-black">
          <Canvas camera={{ position: [12, 8, 12], fov: 60 }}>
            <color attach="background" args={['#001100']} />
            <fog attach="fog" args={['#001100', 10, 40]} />
            <BlockchainScene records={records} />
          </Canvas>
        </div>

        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="p-3 bg-slate-800 rounded-lg text-center">
            <div className="text-slate-400 mb-1">Total Records</div>
            <div className="text-white text-xl font-bold">{records.length}</div>
          </div>
          <div className="p-3 bg-slate-800 rounded-lg text-center">
            <div className="text-slate-400 mb-1">Networks</div>
            <div className="text-white text-xl font-bold">
              {new Set(records.map(r => r.blockchain_network)).size}
            </div>
          </div>
          <div className="p-3 bg-slate-800 rounded-lg text-center">
            <div className="text-slate-400 mb-1">Total Gas</div>
            <div className="text-white text-xl font-bold">{totalGas.toFixed(3)}</div>
          </div>
        </div>

        {records.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm text-slate-400">Recent Transactions</div>
            {records.slice(-3).reverse().map((record, idx) => (
              <div key={idx} className="p-3 bg-slate-800 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {record.blockchain_network}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={
                      record.verification_status === 'confirmed'
                        ? 'bg-green-900 text-green-200'
                        : 'bg-yellow-900 text-yellow-200'
                    }
                  >
                    {record.verification_status}
                  </Badge>
                </div>
                <div className="text-xs font-mono text-slate-400 truncate">
                  {record.transaction_hash}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}