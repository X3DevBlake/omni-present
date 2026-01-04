import React from 'react';
import AuroraBackground from '../components/omni/AuroraBackground';
import BlueprintSection from '../components/omni/BlueprintSection';
import PerformanceMetrics from '../components/omni/PerformanceMetrics';
import NotificationSystem from '../components/omni/NotificationSystem';

export default function Blueprint() {
  return (
    <AuroraBackground className="min-h-screen">
      <PerformanceMetrics />
      <NotificationSystem />
      <div className="pt-24 pb-16">
        <BlueprintSection />
      </div>
    </AuroraBackground>
  );
}