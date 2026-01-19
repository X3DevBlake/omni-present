import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Box, Sphere } from '@react-three/drei';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import * as THREE from 'three';

function MarketplaceListing3D({ listing, position, onClick }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.2;
    }
  });

  const typeColors = {
    skill: '#a855f7',
    knowledge: '#00f5ff',
    compute: '#00ff88',
    data: '#ff8800',
    model: '#ff0066',
  };

  const color = typeColors[listing.listing_type] || '#888888';
  const quality = listing.quality_rating || 0;

  return (
    <group position={position} onClick={onClick}>
      <Box ref={meshRef} args={[1, 1, 1]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          transparent
          opacity={0.8}
        />
      </Box>

      {/* Quality stars */}
      {Array.from({ length: Math.floor(quality) }).map((_, i) => (
        <Sphere
          key={i}
          args={[0.1, 16, 16]}
          position={[-0.6 + i * 0.3, 0.8, 0]}
        >
          <meshBasicMaterial color="#ffcc00" />
        </Sphere>
      ))}

      <Text
        position={[0, -1, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        maxWidth={2}
      >
        {listing.title}
      </Text>

      <Text
        position={[0, -1.4, 0]}
        fontSize={0.15}
        color="#00ff88"
        anchorX="center"
      >
        {listing.price} tokens
      </Text>

      {/* Sales badge */}
      {listing.total_sales > 0 && (
        <group position={[0.8, 0.8, 0]}>
          <Sphere args={[0.15, 16, 16]}>
            <meshBasicMaterial color="#ff0066" />
          </Sphere>
          <Text
            position={[0, 0, 0.2]}
            fontSize={0.1}
            color="white"
            anchorX="center"
          >
            {listing.total_sales}
          </Text>
        </group>
      )}
    </group>
  );
}

export default function AgentMarketplace3D({ onListingSelect }) {
  const [selectedListing, setSelectedListing] = React.useState(null);

  const { data: listings = [] } = useQuery({
    queryKey: ['marketplace-listings'],
    queryFn: async () => {
      const result = await base44.entities.AgentMarketplaceListing.filter({ is_active: true });
      return result;
    },
  });

  const positions = React.useMemo(() => {
    return listings.map((_, index) => {
      const row = Math.floor(index / 5);
      const col = index % 5;
      return [
        col * 3 - 6,
        row * 3 - 3,
        -row * 2,
      ];
    });
  }, [listings]);

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden bg-black/20">
      <Canvas camera={{ position: [0, 3, 12], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <pointLight position={[-10, -10, -10]} intensity={0.8} color="#a855f7" />

        {listings.map((listing, index) => (
          <MarketplaceListing3D
            key={listing.id}
            listing={listing}
            position={positions[index]}
            onClick={() => {
              setSelectedListing(listing);
              onListingSelect?.(listing);
            }}
          />
        ))}

        <OrbitControls enableZoom={true} />
        <gridHelper args={[20, 20, '#ffffff20', '#ffffff10']} />
      </Canvas>

      {listings.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-white/60">No marketplace listings available</p>
        </div>
      )}
    </div>
  );
}