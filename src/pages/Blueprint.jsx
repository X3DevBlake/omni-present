import React from 'react';
import AuroraBackground from '../components/omni/AuroraBackground';
import BlueprintSection from '../components/omni/BlueprintSection';
import PerformanceMetrics from '../components/omni/PerformanceMetrics';

export default function Blueprint() {
  return (
    <AuroraBackground className="min-h-screen">
      <PerformanceMetrics />
      <div className="pt-24 pb-16">
        <BlueprintSection />
      </div>
    </AuroraBackground>
  );
}