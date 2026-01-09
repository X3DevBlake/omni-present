import React from 'react';
import AuroraBackground from '../components/omni/AuroraBackground';
import TechShowcase from '../components/omni/TechShowcase';
import Immersive3DTechnology from '../components/3d/Immersive3DTechnology';

export default function Technology() {
  return (
    <AuroraBackground className="min-h-screen">
      <div className="pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <Immersive3DTechnology />
          <TechShowcase />
        </div>
      </div>
    </AuroraBackground>
  );
}