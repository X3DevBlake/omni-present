import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Box } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Star, Shield, Zap } from 'lucide-react';

function MarketplaceListing({ listing, position, onSelect }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.elapsedTime * 0.5;
      if (hovered) {
        meshRef.current.scale.setScalar(1.3);
      } else {
        meshRef.current.scale.setScalar(1);
      }
    }
  });

  const typeColors = {
    agent: '#00ffff',
    skill: '#ff00ff',
    augmentation: '#00ff88',
    blueprint: '#ffaa00',
    knowledge_pack: '#0088ff',
    consciousness_module: '#ff0088'
  };

  const color = typeColors[listing.listing_type] || '#888888';
  const verified = listing.verification_status?.verified;

  return (
    <group position={position}>
      <Box
        ref={meshRef}
        args={[0.8, 0.8, 0.8]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => onSelect?.(listing)}
      >
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={verified ? 0.8 : 0.4}
          metalness={0.8}
          roughness={0.2}
        />
      </Box>

      {verified && (
        <Sphere args={[0.15, 16, 16]} position={[0.5, 0.5, 0.5]}>
          <meshBasicMaterial color="#00ff00" />
        </Sphere>
      )}

      <Text position={[0, 1.2, 0]} fontSize={0.12} color="white" anchorX="center">
        {listing.item_details?.name || 'ITEM'}
      </Text>
      <Text position={[0, -1.2, 0]} fontSize={0.1} color={color} anchorX="center">
        {listing.pricing?.price_omni || 0} OMNI
      </Text>
      {listing.marketplace_metrics?.average_rating > 0 && (
        <Text position={[0, 1, 0]} fontSize={0.08} color="#ffaa00" anchorX="center">
          ★ {listing.marketplace_metrics.average_rating.toFixed(1)}
        </Text>
      )}
    </group>
  );
}

function MarketplaceScene({ listings, onSelectListing }) {
  const listingPositions = useMemo(() => {
    return listings.map((_, idx) => {
      const row = Math.floor(idx / 6);
      const col = idx % 6;
      return [
        (col - 2.5) * 2,
        (row - 1) * 2,
        0
      ];
    });
  }, [listings]);

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#00ffff" />
      <pointLight position={[-10, 5, -10]} intensity={1} color="#ff00ff" />
      
      <Text position={[0, 5, 0]} fontSize={0.5} color="#ffffff" anchorX="center">
        OMEGA MARKETPLACE
      </Text>

      {listings.map((listing, idx) => (
        <MarketplaceListing
          key={listing.listing_id || idx}
          listing={listing}
          position={listingPositions[idx]}
          onSelect={onSelectListing}
        />
      ))}

      <OrbitControls enableZoom enablePan autoRotate autoRotateSpeed={0.3} />
    </>
  );
}

export default function OmegaMarketplace3D({ listings = [] }) {
  const [selectedListing, setSelectedListing] = useState(null);
  const verified = listings.filter(l => l.verification_status?.verified).length;
  const avgRating = listings.length > 0
    ? listings.reduce((sum, l) => sum + (l.marketplace_metrics?.average_rating || 0), 0) / listings.length
    : 0;

  return (
    <Card className="bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 border-indigo-500/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3 text-2xl">
          <ShoppingCart className="w-8 h-8 text-indigo-400 animate-pulse" />
          Omega Marketplace - Agents, Skills & Augmentations
          <Badge className="bg-indigo-500/30 text-indigo-300">
            {listings.length} LISTINGS
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-black/40 p-3 rounded-lg border border-indigo-500/30">
            <div className="flex items-center gap-2 mb-1">
              <ShoppingCart className="w-4 h-4 text-indigo-400" />
              <span className="text-white/60 text-xs">Total Items</span>
            </div>
            <div className="text-white text-lg font-bold">{listings.length}</div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-green-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-green-400" />
              <span className="text-white/60 text-xs">Verified</span>
            </div>
            <div className="text-white text-lg font-bold">{verified}</div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-yellow-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="text-white/60 text-xs">Avg Rating</span>
            </div>
            <div className="text-white text-lg font-bold">{avgRating.toFixed(1)}</div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-purple-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-purple-400" />
              <span className="text-white/60 text-xs">Active</span>
            </div>
            <div className="text-white text-lg font-bold">
              {listings.filter(l => l.listing_status === 'active').length}
            </div>
          </div>
        </div>

        <div className="h-[600px] bg-black/20 rounded-lg overflow-hidden">
          <Canvas camera={{ position: [0, 3, 12], fov: 60 }}>
            <color attach="background" args={['#000510']} />
            <fog attach="fog" args={['#000510', 10, 40]} />
            <MarketplaceScene listings={listings} onSelectListing={setSelectedListing} />
          </Canvas>
        </div>

        {selectedListing && (
          <div className="mt-4 bg-black/40 p-4 rounded-lg border border-indigo-500/30">
            <div className="flex items-center justify-between mb-2">
              <div className="text-indigo-400 font-bold text-lg">{selectedListing.item_details?.name}</div>
              <Badge className="bg-green-500/30 text-green-300">
                {selectedListing.pricing?.price_omni} OMNI
              </Badge>
            </div>
            <div className="text-white/70 text-sm mb-3">{selectedListing.item_details?.description}</div>
            <Button className="bg-indigo-600 hover:bg-indigo-700 w-full">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Purchase Now
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}