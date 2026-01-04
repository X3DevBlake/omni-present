import React from 'react';
import AuroraBackground from '../components/omni/AuroraBackground';
import FeatureGrid from '../components/omni/FeatureGrid';

export default function Features() {
  return (
    <AuroraBackground className="min-h-screen">
      <div className="pt-32 pb-16">
        <FeatureGrid />
      </div>
    </AuroraBackground>
  );
}