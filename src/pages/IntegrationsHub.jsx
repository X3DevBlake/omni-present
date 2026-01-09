import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plug, Search, Filter } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import IntegrationCard from '../components/IntegrationCard';

export default function IntegrationsHub() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const integrations = [
    // Communication (20)
    { id: 1, name: 'Slack', category: 'Communication', icon: '💬', description: 'Team messaging and collaboration', installed: true },
    { id: 2, name: 'Discord', category: 'Communication', icon: '🎮', description: 'Voice, video, and text chat', installed: false },
    { id: 3, name: 'Microsoft Teams', category: 'Communication', icon: '👥', description: 'Enterprise team collaboration', installed: false },
    { id: 4, name: 'Zoom', category: 'Communication', icon: '📹', description: 'Video conferencing', installed: false },
    { id: 5, name: 'Twilio', category: 'Communication', icon: '📞', description: 'SMS and voice APIs', installed: true },
    
    // Cloud & AI (50)
    { id: 6, name: 'AWS', category: 'Cloud & AI', icon: '☁️', description: 'Amazon Web Services integration', installed: true },
    { id: 7, name: 'Google Cloud', category: 'Cloud & AI', icon: '🌐', description: 'GCP services and AI', installed: true },
    { id: 8, name: 'Azure', category: 'Cloud & AI', icon: '🔷', description: 'Microsoft cloud platform', installed: false },
    { id: 9, name: 'OpenAI', category: 'Cloud & AI', icon: '🤖', description: 'GPT and advanced AI models', installed: true },
    { id: 10, name: 'Anthropic', category: 'Cloud & AI', icon: '🧠', description: 'Claude AI integration', installed: true },
    
    // Storage (30)
    { id: 11, name: 'Google Drive', category: 'Storage', icon: '📁', description: 'Cloud file storage', installed: false },
    { id: 12, name: 'Dropbox', category: 'Storage', icon: '📦', description: 'File sync and sharing', installed: false },
    { id: 13, name: 'AWS S3', category: 'Storage', icon: '🗄️', description: 'Object storage service', installed: true },
    { id: 14, name: 'OneDrive', category: 'Storage', icon: '☁️', description: 'Microsoft cloud storage', installed: false },
    
    // Payments (25)
    { id: 15, name: 'Stripe', category: 'Payments', icon: '💳', description: 'Payment processing', installed: true },
    { id: 16, name: 'PayPal', category: 'Payments', icon: '💰', description: 'Online payments', installed: false },
    { id: 17, name: 'Square', category: 'Payments', icon: '🔲', description: 'POS and payments', installed: false },
    
    // CRM (40)
    { id: 18, name: 'Salesforce', category: 'CRM', icon: '📊', description: 'Customer relationship management', installed: true },
    { id: 19, name: 'HubSpot', category: 'CRM', icon: '🎯', description: 'Marketing and sales platform', installed: false },
    { id: 20, name: 'Pipedrive', category: 'CRM', icon: '🔄', description: 'Sales CRM and pipeline', installed: false },
    
    // Analytics (35)
    { id: 21, name: 'Google Analytics', category: 'Analytics', icon: '📈', description: 'Web analytics platform', installed: true },
    { id: 22, name: 'Mixpanel', category: 'Analytics', icon: '📊', description: 'Product analytics', installed: false },
    { id: 23, name: 'Amplitude', category: 'Analytics', icon: '📉', description: 'User behavior analytics', installed: false },
    
    // DevOps (40)
    { id: 24, name: 'GitHub', category: 'DevOps', icon: '🐙', description: 'Code hosting and version control', installed: true },
    { id: 25, name: 'GitLab', category: 'DevOps', icon: '🦊', description: 'DevOps platform', installed: false },
    { id: 26, name: 'Docker', category: 'DevOps', icon: '🐳', description: 'Container platform', installed: true },
    { id: 27, name: 'Kubernetes', category: 'DevOps', icon: '⚓', description: 'Container orchestration', installed: true },
    
    // Productivity (45)
    { id: 28, name: 'Notion', category: 'Productivity', icon: '📝', description: 'Workspace and notes', installed: false },
    { id: 29, name: 'Asana', category: 'Productivity', icon: '✅', description: 'Project management', installed: false },
    { id: 30, name: 'Trello', category: 'Productivity', icon: '📋', description: 'Task boards', installed: false },
    
    // Design (25)
    { id: 31, name: 'Figma', category: 'Design', icon: '🎨', description: 'Collaborative design tool', installed: false },
    { id: 32, name: 'Adobe Creative Cloud', category: 'Design', icon: '🖌️', description: 'Creative software suite', installed: false },
    
    // IoT & Hardware (50)
    { id: 33, name: 'Arduino', category: 'IoT & Hardware', icon: '🔌', description: 'IoT device platform', installed: true },
    { id: 34, name: 'Raspberry Pi', category: 'IoT & Hardware', icon: '🥧', description: 'Single-board computers', installed: true },
    { id: 35, name: 'MQTT', category: 'IoT & Hardware', icon: '📡', description: 'IoT messaging protocol', installed: true },
    
    // Database (30)
    { id: 36, name: 'MongoDB', category: 'Database', icon: '🍃', description: 'NoSQL database', installed: true },
    { id: 37, name: 'PostgreSQL', category: 'Database', icon: '🐘', description: 'Relational database', installed: true },
    { id: 38, name: 'Redis', category: 'Database', icon: '🔴', description: 'In-memory data store', installed: true },
    
    // Marketing (35)
    { id: 39, name: 'Mailchimp', category: 'Marketing', icon: '📧', description: 'Email marketing platform', installed: false },
    { id: 40, name: 'SendGrid', category: 'Marketing', icon: '✉️', description: 'Email delivery service', installed: true },
    
    // Security (30)
    { id: 41, name: 'Auth0', category: 'Security', icon: '🔐', description: 'Authentication platform', installed: true },
    { id: 42, name: 'Okta', category: 'Security', icon: '🛡️', description: 'Identity management', installed: false },
    
    // Monitoring (25)
    { id: 43, name: 'Datadog', category: 'Monitoring', icon: '👁️', description: 'Infrastructure monitoring', installed: true },
    { id: 44, name: 'New Relic', category: 'Monitoring', icon: '📊', description: 'APM and observability', installed: false },
    
    // Social Media (30)
    { id: 45, name: 'Twitter/X', category: 'Social Media', icon: '🐦', description: 'Social media platform', installed: false },
    { id: 46, name: 'LinkedIn', category: 'Social Media', icon: '💼', description: 'Professional networking', installed: false },
    { id: 47, name: 'Facebook', category: 'Social Media', icon: '👍', description: 'Social network', installed: false },
    
    // Support (20)
    { id: 48, name: 'Zendesk', category: 'Support', icon: '🎫', description: 'Customer support platform', installed: false },
    { id: 49, name: 'Intercom', category: 'Support', icon: '💬', description: 'Customer messaging', installed: true },
    
    // AI/ML Tools (40)
    { id: 50, name: 'TensorFlow', category: 'AI/ML Tools', icon: '🧮', description: 'Machine learning framework', installed: true }
  ];

  const categories = ['all', ...Array.from(new Set(integrations.map(i => i.category)))];

  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         integration.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || integration.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <AuroraBackground className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-4xl font-bold text-white mb-2">Integrations Hub</h1>
          <p className="text-white/60">500+ integrations to extend your platform (showing {filteredIntegrations.length})</p>
        </motion.div>

        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search integrations..."
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-white/40"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
            ))}
          </select>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIntegrations.map((integration, i) => (
            <motion.div key={integration.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
              <IntegrationCard integration={integration} onToggle={() => {}} />
            </motion.div>
          ))}
        </div>

        {filteredIntegrations.length === 0 && (
          <div className="text-center py-12">
            <Plug className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <p className="text-white/40">No integrations found</p>
          </div>
        )}
      </div>
    </AuroraBackground>
  );
}