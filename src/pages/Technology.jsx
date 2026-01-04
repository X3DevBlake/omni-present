import React from 'react';
import AuroraBackground from '../components/omni/AuroraBackground';
import TechShowcase from '../components/omni/TechShowcase';

export default function Technology() {
  return (
    <AuroraBackground className="min-h-screen">
      <div className="pt-32 pb-16">
        <TechShowcase />
      </div>
    </AuroraBackground>
  );
}