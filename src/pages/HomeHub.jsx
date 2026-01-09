import React from 'react';
import { motion } from 'framer-motion';
import { Home, Info, Mail, Sparkles, Briefcase, Newspaper, Calendar, HelpCircle, Users, Handshake } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';

export default function HomeHub() {
  return (
    <AuroraBackground className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-block mb-4 px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 rounded-full">
            <span className="text-cyan-400 text-sm font-semibold">🏠 Home Hub</span>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            Welcome to
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"> Omni-Present</span>
          </h1>
          <p className="text-white/60 text-lg max-w-3xl mx-auto">
            Your gateway to omnipresent intelligence and AI innovation
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: 'Home', description: 'Platform overview and features', icon: Home, page: 'Home', gradient: 'from-cyan-500/20 to-blue-500/20', border: 'border-cyan-500/30' },
            { title: 'About Us', description: 'Our mission and vision', icon: Info, page: 'About', gradient: 'from-purple-500/20 to-pink-500/20', border: 'border-purple-500/30' },
            { title: 'Technology', description: 'Our AI technology stack', icon: Sparkles, page: 'Technology', gradient: 'from-blue-500/20 to-indigo-500/20', border: 'border-blue-500/30' },
            { title: 'Features', description: 'Explore platform capabilities', icon: Sparkles, page: 'Features', gradient: 'from-green-500/20 to-emerald-500/20', border: 'border-green-500/30' },
            { title: 'Contact', description: 'Get in touch with our team', icon: Mail, page: 'Contact', gradient: 'from-orange-500/20 to-red-500/20', border: 'border-orange-500/30' },
            { title: 'News & Updates', description: 'Latest platform announcements', icon: Newspaper, page: 'NewsUpdates', gradient: 'from-pink-500/20 to-red-500/20', border: 'border-pink-500/30' },
            { title: 'Events Calendar', description: 'Upcoming conferences and meetups', icon: Calendar, page: 'EventsCalendar', gradient: 'from-yellow-500/20 to-orange-500/20', border: 'border-yellow-500/30' },
            { title: 'Careers', description: 'Join our growing team', icon: Briefcase, page: 'CareerOpportunities', gradient: 'from-indigo-500/20 to-purple-500/20', border: 'border-indigo-500/30' },
            { title: 'FAQ', description: 'Common questions answered', icon: HelpCircle, page: 'FAQ', gradient: 'from-teal-500/20 to-cyan-500/20', border: 'border-teal-500/30' },
            { title: 'Community Guidelines', description: 'Our code of conduct', icon: Users, page: 'CommunityGuidelines', gradient: 'from-blue-500/20 to-cyan-500/20', border: 'border-blue-500/30' },
            { title: 'Partnerships', description: 'Our trusted partners', icon: Handshake, page: 'Partnerships', gradient: 'from-purple-500/20 to-pink-500/20', border: 'border-purple-500/30' },
            { title: 'Press Releases', description: 'Official announcements', icon: Newspaper, page: 'PressReleases', gradient: 'from-red-500/20 to-pink-500/20', border: 'border-red-500/30' }
          ].map((item, i) => (
            <Link key={i} to={createPageUrl(item.page)}>
              <motion.div className={`bg-gradient-to-br ${item.gradient} border ${item.border} rounded-2xl p-6 hover:scale-105 transition-all cursor-pointer group`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-black/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-white/60 text-sm">{item.description}</p>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </AuroraBackground>
  );
}