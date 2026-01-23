import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Box, Torus } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Shield, Lock, Key, Database, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

function EncryptedDataShard({ shard, index, total }) {
  const meshRef = useRef();
  const angle = (index / total) * Math.PI * 2;
  const radius = 3;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.02;
      meshRef.current.rotation.z += 0.01;
    }
  });

  const color = shard.location_type === 'ipfs' ? '#00FF00' : 
                shard.location_type === 'blockchain' ? '#0088FF' : '#FF00FF';

  return (
    <group position={[x, 0, z]}>
      <Box ref={meshRef} args={[0.8, 0.8, 0.8]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </Box>
      <Text
        position={[0, 1.2, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
      >
        {shard.location_type}
      </Text>
    </group>
  );
}

function VaultCore({ vault }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.01;
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.2 + 1;
      meshRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  const isLocked = vault?.vault_status === 'locked';

  return (
    <>
      <Sphere ref={meshRef} args={[1.5, 32, 32]}>
        <meshStandardMaterial
          color={isLocked ? "#FF0000" : "#FFD700"}
          emissive={isLocked ? "#FF0000" : "#FFD700"}
          emissiveIntensity={1}
          wireframe
        />
      </Sphere>
      
      <Torus args={[2, 0.1, 16, 100]}>
        <meshStandardMaterial
          color="#00FFFF"
          emissive="#00FFFF"
          emissiveIntensity={0.5}
        />
      </Torus>
    </>
  );
}

function VaultScene({ vault }) {
  const shards = vault?.storage_locations || [];

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#FFD700" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00FFFF" />
      
      <OrbitControls autoRotate autoRotateSpeed={1} />

      <VaultCore vault={vault} />

      {shards.map((shard, idx) => (
        <EncryptedDataShard
          key={idx}
          shard={shard}
          index={idx}
          total={shards.length}
        />
      ))}

      <Text
        position={[0, -4, 0]}
        fontSize={0.4}
        color="#00FFFF"
        anchorX="center"
      >
        Encrypted • Decentralized • Immutable
      </Text>
    </>
  );
}

export default function DecentralizedVaultManager3D() {
  const [vaultName, setVaultName] = useState('');
  const queryClient = useQueryClient();

  const { data: vaults = [] } = useQuery({
    queryKey: ['data-vaults'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return await base44.entities.DecentralizedDataVault.filter({ owner_id: user.id });
    }
  });

  const { data: permissions = [] } = useQuery({
    queryKey: ['vault-permissions'],
    queryFn: () => base44.entities.DataAccessPermission.list()
  });

  const { data: blockchainRecords = [] } = useQuery({
    queryKey: ['blockchain-records'],
    queryFn: () => base44.entities.BlockchainDataRecord.list()
  });

  const createVaultMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('dataVaultManager', {
        action: 'create_vault',
        data: {
          name: vaultName || 'Secure Vault',
          categories: ['personal', 'spatial', 'biometric']
        }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data-vaults'] });
      queryClient.invalidateQueries({ queryKey: ['blockchain-records'] });
      toast.success('Vault created and anchored to blockchain!');
      setVaultName('');
    }
  });

  const currentVault = vaults[0];
  const confirmedRecords = blockchainRecords.filter(r => r.verification_status === 'confirmed').length;

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-slate-900 to-emerald-950 border-emerald-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-emerald-400" />
              Decentralized Data Vault
            </span>
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-emerald-900 text-emerald-200">
                <Lock className="w-3 h-3 mr-1" />
                {vaults.length} Vaults
              </Badge>
              <Badge variant="outline" className="bg-blue-900 text-blue-200">
                <Database className="w-3 h-3 mr-1" />
                {confirmedRecords} Blockchain
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-96 w-full rounded-lg overflow-hidden bg-black">
            <Canvas camera={{ position: [8, 8, 8], fov: 60 }}>
              <color attach="background" args={['#000000']} />
              <fog attach="fog" args={['#001100', 10, 40]} />
              <VaultScene vault={currentVault} />
            </Canvas>
          </div>

          <div className="flex gap-2">
            <Input
              value={vaultName}
              onChange={(e) => setVaultName(e.target.value)}
              placeholder="Vault name..."
              className="flex-1 bg-slate-800 text-white border-slate-700"
            />
            <Button
              onClick={() => createVaultMutation.mutate()}
              disabled={createVaultMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Lock className="w-4 h-4 mr-2" />
              Create Vault
            </Button>
          </div>

          {currentVault && (
            <div className="space-y-3">
              <div className="p-4 bg-slate-800 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">Vault Name</span>
                  <span className="text-white font-semibold">{currentVault.vault_name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">Storage Locations</span>
                  <span className="text-white">{currentVault.storage_locations?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">Encryption</span>
                  <Badge variant="outline" className="bg-green-900 text-green-200">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {currentVault.encryption_config?.algorithm}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">Redundancy</span>
                  <span className="text-white">{currentVault.redundancy_factor}x</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">Blockchain Anchors</span>
                  <span className="text-white">{currentVault.blockchain_anchors?.length || 0}</span>
                </div>
              </div>

              {currentVault.blockchain_anchors?.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm text-slate-400">Blockchain Integrity</div>
                  {currentVault.blockchain_anchors.slice(0, 2).map((anchor, idx) => (
                    <div key={idx} className="p-3 bg-slate-800 rounded-lg">
                      <div className="text-xs text-slate-500 mb-1">
                        {anchor.blockchain}
                      </div>
                      <div className="text-xs font-mono text-emerald-400 truncate">
                        {anchor.transaction_hash}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        Block #{anchor.block_number}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Key className="w-4 h-4" />
            Access Permissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {permissions.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-sm">
              No permissions granted yet
            </div>
          ) : (
            <div className="space-y-2">
              {permissions.slice(0, 5).map((perm, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-slate-800 rounded">
                  <div className="text-sm">
                    <div className="text-white">{perm.granted_to.substring(0, 16)}...</div>
                    <div className="text-xs text-slate-400">{perm.permission_type}</div>
                  </div>
                  <Badge
                    variant="outline"
                    className={perm.status === 'active' ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}
                  >
                    {perm.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}