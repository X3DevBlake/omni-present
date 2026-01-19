import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';

function ArticleNode({ article, position, onClick }) {
  const meshRef = useRef();
  const [hovered, setHovered] = React.useState(false);
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      
      const targetScale = hovered ? 1.3 : 1;
      meshRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.1
      );
    }
  });
  
  // Size based on view count
  const size = 0.2 + Math.min(article.view_count / 100, 0.5);
  
  // Color based on category
  const categoryColors = {
    'technical': '#00f5ff',
    'business': '#a855f7',
    'tutorial': '#10b981',
    'faq': '#fbbf24'
  };
  
  const color = categoryColors[article.category] || '#ffffff';
  
  return (
    <group position={position}>
      <Sphere
        ref={meshRef}
        args={[size, 32, 32]}
        onClick={() => onClick(article)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 0.6 : 0.3}
          metalness={0.5}
          roughness={0.3}
        />
      </Sphere>
      
      <Text
        position={[0, size + 0.4, 0]}
        fontSize={0.15}
        color="white"
        anchorX="center"
        maxWidth={2}
      >
        {article.title}
      </Text>
      
      {/* Helpful indicator */}
      {article.helpful_count > 10 && (
        <Sphere args={[0.08, 16, 16]} position={[size, 0, 0]}>
          <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.8} />
        </Sphere>
      )}
    </group>
  );
}

export default function KnowledgeGraph3D({ articles, onArticleClick }) {
  const positions = React.useMemo(() => {
    if (!articles || articles.length === 0) return [];
    
    // Organize by category
    const categories = {};
    articles.forEach(article => {
      if (!categories[article.category]) {
        categories[article.category] = [];
      }
      categories[article.category].push(article);
    });
    
    const categoryKeys = Object.keys(categories);
    const positions = [];
    
    categoryKeys.forEach((category, catIdx) => {
      const categoryArticles = categories[category];
      const angle = (catIdx / categoryKeys.length) * Math.PI * 2;
      const baseRadius = 4;
      
      categoryArticles.forEach((article, artIdx) => {
        const radius = baseRadius + artIdx * 0.5;
        positions.push([
          Math.cos(angle) * radius,
          (artIdx - categoryArticles.length / 2) * 0.8,
          Math.sin(angle) * radius
        ]);
      });
    });
    
    return positions;
  }, [articles]);
  
  // Generate connections between related articles
  const connections = React.useMemo(() => {
    if (!articles || articles.length === 0) return [];
    
    const conns = [];
    articles.forEach((article, idx) => {
      if (article.related_articles && article.related_articles.length > 0) {
        article.related_articles.forEach(relatedId => {
          const relatedIdx = articles.findIndex(a => a.id === relatedId);
          if (relatedIdx !== -1 && relatedIdx > idx) {
            conns.push({
              from: positions[idx],
              to: positions[relatedIdx]
            });
          }
        });
      }
    });
    
    return conns;
  }, [articles, positions]);
  
  if (!articles || articles.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-white">
        <p>No knowledge articles available</p>
      </div>
    );
  }
  
  return (
    <Canvas camera={{ position: [0, 5, 15], fov: 60 }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, 5, -10]} intensity={0.5} color="#a855f7" />
      
      {/* Central knowledge hub */}
      <Sphere args={[0.5, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial
          color="#6366f1"
          emissive="#6366f1"
          emissiveIntensity={0.5}
          wireframe
        />
      </Sphere>
      
      {/* Article nodes */}
      {articles.map((article, idx) => (
        <ArticleNode
          key={article.id || idx}
          article={article}
          position={positions[idx]}
          onClick={onArticleClick}
        />
      ))}
      
      {/* Connections */}
      {connections.map((conn, idx) => (
        <Line
          key={idx}
          points={[conn.from, conn.to]}
          color="#00f5ff"
          lineWidth={1}
          transparent
          opacity={0.3}
        />
      ))}
      
      <Text
        position={[0, 6, -8]}
        fontSize={0.5}
        color="white"
        anchorX="center"
      >
        Knowledge Graph
      </Text>
      
      <OrbitControls
        enableZoom={true}
        minDistance={5}
        maxDistance={30}
        autoRotate
        autoRotateSpeed={0.3}
      />
    </Canvas>
  );
}