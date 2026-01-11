import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import AuroraBackground from '../components/omni/AuroraBackground';
import HeroSection from '../components/omni/HeroSection';
import FeatureGrid from '../components/omni/FeatureGrid';
import CTASection from '../components/omni/CTASection';
import HeroWith3DGalaxy from '../components/home/HeroWith3DGalaxy';
import MarketNewsSection from '../components/home/MarketNewsSection';
import FinancialGoalsShowcase from '../components/home/FinancialGoalsShowcase';
import AIAgentActivityFeed from '../components/home/AIAgentActivityFeed';
import RealWorldMapSection from '../components/home/RealWorldMapSection';
import MediaShowcase from '../components/home/MediaShowcase';
import GamificationSection from '../components/home/GamificationSection';
import OnboardingSection from '../components/home/OnboardingSection';
import TestimonialsSection from '../components/home/TestimonialsSection';
import DashboardMetricsWidget from '../components/home/DashboardMetricsWidget';
import ImmersiveFinancialDashboard from '../components/dashboard/ImmersiveFinancialDashboard';

export default function Home() {
  const [userEmail, setUserEmail] = React.useState(null);

  React.useEffect(() => {
    base44.auth.me()
      .then(user => setUserEmail(user?.email))
      .catch(() => setUserEmail(null));
  }, []);

  return (
    <AuroraBackground className="min-h-screen">
      <HeroSection />
      
      {/* Enhanced 3D Hero Galaxy */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <HeroWith3DGalaxy />
        </div>
      </section>

      {/* Real-Time Market News */}
      <MarketNewsSection />

      {/* Immersive Dashboard */}
      {userEmail && (
        <section className="py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <ImmersiveFinancialDashboard userEmail={userEmail} />
          </div>
        </section>
      )}

      {/* Financial Goals Showcase */}
      {userEmail && <FinancialGoalsShowcase userEmail={userEmail} />}

      {/* AI Agents Activity */}
      {userEmail && <AIAgentActivityFeed userEmail={userEmail} />}

      {/* Gamification */}
      {userEmail && <GamificationSection userEmail={userEmail} />}

      {/* Global Map Visualization */}
      <RealWorldMapSection />

      {/* Media Showcase */}
      <MediaShowcase limit={6} />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Onboarding */}
      {!userEmail && <OnboardingSection userEmail={userEmail} />}

      {/* Original Sections */}
      <FeatureGrid />
      
      <CTASection />
    </AuroraBackground>
  );
}