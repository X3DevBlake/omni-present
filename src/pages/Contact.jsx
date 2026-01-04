import React from 'react';
import AuroraBackground from '../components/omni/AuroraBackground';
import CTASection from '../components/omni/CTASection';

export default function Contact() {
  return (
    <AuroraBackground className="min-h-screen">
      <div className="pt-32 pb-16">
        <CTASection />
      </div>
    </AuroraBackground>
  );
}