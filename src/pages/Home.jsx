import React from 'react';
import AuroraBackground from '../components/omni/AuroraBackground';
import FloatingNav from '../components/omni/FloatingNav';
import HeroSection from '../components/omni/HeroSection';
import TechShowcase from '../components/omni/TechShowcase';
import FeatureGrid from '../components/omni/FeatureGrid';
import BlueprintSection from '../components/omni/BlueprintSection';
import CTASection from '../components/omni/CTASection';
import ScrollProgress from '../components/omni/ScrollProgress';
import PerformanceMetrics from '../components/omni/PerformanceMetrics';

export default function Home() {
  return (
    <AuroraBackground className="min-h-screen">
      <ScrollProgress />
      <PerformanceMetrics />
      <FloatingNav />
      <HeroSection />
      <TechShowcase />
      <FeatureGrid />
      <BlueprintSection />
      <CTASection />
    </AuroraBackground>
  );
}