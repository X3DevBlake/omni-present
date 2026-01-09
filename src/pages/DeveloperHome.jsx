import React from 'react';
import { motion } from 'framer-motion';
import { Code, Key, Webhook, Book, Box, Terminal, GitBranch, Zap } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';

export default function DeveloperHome() {
  return (
    <AuroraBackground className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-block mb-4 px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-full">
            <span className="text-green-400 text-sm font-semibold">👨‍💻 Developer Hub</span>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            Developer
            <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent"> Tools & APIs</span>
          </h1>
          <p className="text-white/60 text-lg max-w-3xl mx-auto">
            Build powerful integrations with Omni-Present's comprehensive API suite
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'API Calls Today', value: '124K', icon: Zap, color: 'green' },
            { label: 'Active Keys', value: '8', icon: Key, color: 'cyan' },
            { label: 'Webhooks', value: '12', icon: Webhook, color: 'purple' },
            { label: 'SDK Downloads', value: '2.4K', icon: Box, color: 'blue' }
          ].map((stat, i) => (
            <motion.div
              key={i}
              className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <stat.icon className={`w-6 h-6 text-${stat.color}-400 mb-2`} />
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-white/60 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: 'API Keys',
              description: 'Manage authentication tokens',
              icon: Key,
              page: 'APIKeys',
              gradient: 'from-cyan-500/20 to-blue-500/20',
              border: 'border-cyan-500/30'
            },
            {
              title: 'Webhooks',
              description: 'Configure real-time event notifications',
              icon: Webhook,
              page: 'Webhooks',
              gradient: 'from-purple-500/20 to-pink-500/20',
              border: 'border-purple-500/30'
            },
            {
              title: 'API Documentation',
              description: 'Comprehensive REST API reference',
              icon: Book,
              page: 'APIDocumentation',
              gradient: 'from-blue-500/20 to-indigo-500/20',
              border: 'border-blue-500/30'
            },
            {
              title: 'SDKs & Libraries',
              description: 'Client libraries for popular languages',
              icon: Box,
              page: 'SDKsLibraries',
              gradient: 'from-green-500/20 to-emerald-500/20',
              border: 'border-green-500/30'
            },
            {
              title: 'Custom Integrations',
              description: 'Build your own connectors',
              icon: GitBranch,
              page: 'CustomIntegrations',
              gradient: 'from-orange-500/20 to-red-500/20',
              border: 'border-orange-500/30'
            },
            {
              title: 'Sandbox Environment',
              description: 'Test APIs without affecting production',
              icon: Terminal,
              page: 'SandboxEnvironment',
              gradient: 'from-yellow-500/20 to-orange-500/20',
              border: 'border-yellow-500/30'
            },
            {
              title: 'Code Examples',
              description: 'Sample implementations and tutorials',
              icon: Code,
              page: 'Documentation',
              gradient: 'from-pink-500/20 to-purple-500/20',
              border: 'border-pink-500/30'
            },
            {
              title: 'API Explorer',
              description: 'Interactive API testing tool',
              icon: Zap,
              page: 'APIExplorer',
              gradient: 'from-teal-500/20 to-cyan-500/20',
              border: 'border-teal-500/30'
            }
          ].map((item, i) => (
            <Link key={i} to={createPageUrl(item.page)}>
              <motion.div
                className={`bg-gradient-to-br ${item.gradient} border ${item.border} rounded-2xl p-6 hover:scale-105 transition-all cursor-pointer group`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
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