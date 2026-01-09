import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Cloud, Database, MessageCircle, DollarSign, BarChart, Lock, Zap } from 'lucide-react';

const integrationCategories = {
  'AI & ML': [
    { name: 'OpenAI GPT-4', icon: '🧠', connected: true, color: '#10b981' },
    { name: 'Google Gemini', icon: '✨', connected: true, color: '#3b82f6' },
    { name: 'Anthropic Claude', icon: '🤖', connected: false, color: '#a855f7' },
    { name: 'Hugging Face', icon: '🤗', connected: false, color: '#fbbf24' },
    { name: 'Cohere', icon: '💫', connected: false, color: '#ec4899' },
    { name: 'Stability AI', icon: '🎨', connected: false, color: '#8b5cf6' },
    { name: 'Replicate', icon: '🔄', connected: false, color: '#06b6d4' },
    { name: 'AWS SageMaker', icon: '☁️', connected: false, color: '#f97316' },
    { name: 'Azure ML', icon: '🔷', connected: false, color: '#0ea5e9' },
    { name: 'Vertex AI', icon: '🔺', connected: false, color: '#84cc16' }
  ],
  'Data & Analytics': [
    { name: 'Google Analytics', icon: '📊', connected: true, color: '#ef4444' },
    { name: 'MongoDB Atlas', icon: '🍃', connected: false, color: '#10b981' },
    { name: 'BigQuery', icon: '📈', connected: false, color: '#3b82f6' },
    { name: 'Snowflake', icon: '❄️', connected: false, color: '#06b6d4' },
    { name: 'Databricks', icon: '🔶', connected: false, color: '#f97316' },
    { name: 'Tableau', icon: '📉', connected: false, color: '#3b82f6' },
    { name: 'PowerBI', icon: '📊', connected: false, color: '#fbbf24' },
    { name: 'Amplitude', icon: '📈', connected: false, color: '#8b5cf6' },
    { name: 'Mixpanel', icon: '🎯', connected: false, color: '#ec4899' },
    { name: 'Segment', icon: '🔀', connected: false, color: '#10b981' },
    { name: 'Elasticsearch', icon: '🔍', connected: false, color: '#06b6d4' },
    { name: 'Redis', icon: '🔴', connected: false, color: '#ef4444' },
    { name: 'PostgreSQL', icon: '🐘', connected: false, color: '#3b82f6' },
    { name: 'MySQL', icon: '🐬', connected: false, color: '#f97316' },
    { name: 'Supabase', icon: '⚡', connected: false, color: '#22c55e' }
  ],
  'Communication': [
    { name: 'Slack', icon: '💬', connected: true, color: '#a855f7' },
    { name: 'Discord', icon: '🎮', connected: false, color: '#6366f1' },
    { name: 'SendGrid', icon: '📧', connected: false, color: '#3b82f6' },
    { name: 'Twilio', icon: '📱', connected: false, color: '#ef4444' },
    { name: 'Microsoft Teams', icon: '👥', connected: false, color: '#8b5cf6' },
    { name: 'Zoom', icon: '📹', connected: false, color: '#06b6d4' },
    { name: 'Telegram', icon: '✈️', connected: false, color: '#0ea5e9' },
    { name: 'WhatsApp', icon: '💚', connected: false, color: '#22c55e' },
    { name: 'Mailchimp', icon: '🐵', connected: false, color: '#fbbf24' },
    { name: 'Intercom', icon: '💙', connected: false, color: '#3b82f6' },
    { name: 'Zendesk', icon: '🎫', connected: false, color: '#10b981' },
    { name: 'Front', icon: '📮', connected: false, color: '#ec4899' }
  ],
  'Financial': [
    { name: 'Stripe', icon: '💳', connected: false, color: '#6366f1' },
    { name: 'PayPal', icon: '💰', connected: false, color: '#0ea5e9' },
    { name: 'Coinbase', icon: '₿', connected: false, color: '#fbbf24' },
    { name: 'Square', icon: '⬛', connected: false, color: '#000000' },
    { name: 'Plaid', icon: '🏦', connected: false, color: '#06b6d4' },
    { name: 'Braintree', icon: '🌳', connected: false, color: '#22c55e' },
    { name: 'Adyen', icon: '💵', connected: false, color: '#10b981' },
    { name: 'Wise', icon: '🌍', connected: false, color: '#3b82f6' },
    { name: 'QuickBooks', icon: '📗', connected: false, color: '#22c55e' },
    { name: 'Xero', icon: '📘', connected: false, color: '#06b6d4' }
  ],
  'Productivity': [
    { name: 'Notion', icon: '📝', connected: false, color: '#ffffff' },
    { name: 'Google Workspace', icon: '📁', connected: true, color: '#3b82f6' },
    { name: 'GitHub', icon: '🐙', connected: false, color: '#ffffff' },
    { name: 'GitLab', icon: '🦊', connected: false, color: '#f97316' },
    { name: 'Jira', icon: '📋', connected: false, color: '#0ea5e9' },
    { name: 'Asana', icon: '✓', connected: false, color: '#ec4899' },
    { name: 'Trello', icon: '📌', connected: false, color: '#3b82f6' },
    { name: 'Monday.com', icon: '📅', connected: false, color: '#ef4444' },
    { name: 'ClickUp', icon: '🎯', connected: false, color: '#8b5cf6' },
    { name: 'Linear', icon: '↗️', connected: false, color: '#6366f1' },
    { name: 'Airtable', icon: '🔷', connected: false, color: '#fbbf24' },
    { name: 'Coda', icon: '📄', connected: false, color: '#f97316' },
    { name: 'Miro', icon: '🎨', connected: false, color: '#fbbf24' },
    { name: 'Figma', icon: '🎨', connected: false, color: '#a855f7' },
    { name: 'Canva', icon: '🎨', connected: false, color: '#06b6d4' }
  ],
  'Developer Tools': [
    { name: 'Docker', icon: '🐳', connected: false, color: '#06b6d4' },
    { name: 'Kubernetes', icon: '☸️', connected: false, color: '#3b82f6' },
    { name: 'Jenkins', icon: '🔨', connected: false, color: '#ef4444' },
    { name: 'CircleCI', icon: '⭕', connected: false, color: '#22c55e' },
    { name: 'Vercel', icon: '▲', connected: false, color: '#000000' },
    { name: 'Netlify', icon: '🌐', connected: false, color: '#06b6d4' },
    { name: 'AWS', icon: '☁️', connected: false, color: '#f97316' },
    { name: 'GCP', icon: '☁️', connected: false, color: '#3b82f6' },
    { name: 'Azure', icon: '☁️', connected: false, color: '#0ea5e9' },
    { name: 'Heroku', icon: '🟣', connected: false, color: '#8b5cf6' },
    { name: 'Terraform', icon: '🏗️', connected: false, color: '#8b5cf6' },
    { name: 'Ansible', icon: '🔧', connected: false, color: '#ef4444' }
  ],
  'Marketing': [
    { name: 'HubSpot', icon: '🟠', connected: false, color: '#f97316' },
    { name: 'Salesforce', icon: '☁️', connected: false, color: '#0ea5e9' },
    { name: 'Marketo', icon: '💜', connected: false, color: '#8b5cf6' },
    { name: 'Pardot', icon: '🔵', connected: false, color: '#3b82f6' },
    { name: 'ActiveCampaign', icon: '⚡', connected: false, color: '#22c55e' },
    { name: 'ConvertKit', icon: '📧', connected: false, color: '#ec4899' },
    { name: 'SEMrush', icon: '📊', connected: false, color: '#f97316' },
    { name: 'Ahrefs', icon: '🔍', connected: false, color: '#0ea5e9' },
    { name: 'Google Ads', icon: '📢', connected: false, color: '#fbbf24' },
    { name: 'Facebook Ads', icon: '📘', connected: false, color: '#3b82f6' }
  ],
  'CRM & Sales': [
    { name: 'Pipedrive', icon: '🔵', connected: false, color: '#22c55e' },
    { name: 'Copper', icon: '🟠', connected: false, color: '#f97316' },
    { name: 'Close', icon: '📞', connected: false, color: '#3b82f6' },
    { name: 'Freshsales', icon: '🌱', connected: false, color: '#22c55e' },
    { name: 'Zoho CRM', icon: '📊', connected: false, color: '#ef4444' },
    { name: 'Insightly', icon: '👁️', connected: false, color: '#8b5cf6' }
  ],
  'E-commerce': [
    { name: 'Shopify', icon: '🛍️', connected: false, color: '#22c55e' },
    { name: 'WooCommerce', icon: '🛒', connected: false, color: '#8b5cf6' },
    { name: 'BigCommerce', icon: '🏪', connected: false, color: '#3b82f6' },
    { name: 'Magento', icon: '🟠', connected: false, color: '#f97316' },
    { name: 'Amazon Seller', icon: '📦', connected: false, color: '#fbbf24' },
    { name: 'eBay', icon: '🔵', connected: false, color: '#ef4444' }
  ],
  'IoT & Hardware': [
    { name: 'Arduino Cloud', icon: '🔧', connected: false, color: '#06b6d4' },
    { name: 'Raspberry Pi', icon: '🥧', connected: false, color: '#ef4444' },
    { name: 'AWS IoT', icon: '📡', connected: false, color: '#f97316' },
    { name: 'Azure IoT', icon: '🌐', connected: false, color: '#0ea5e9' },
    { name: 'Google IoT Core', icon: '🔷', connected: false, color: '#3b82f6' },
    { name: 'ThingSpeak', icon: '📊', connected: false, color: '#22c55e' },
    { name: 'Particle', icon: '⚡', connected: false, color: '#06b6d4' }
  ],
  'Security': [
    { name: 'Auth0', icon: '🔐', connected: false, color: '#ef4444' },
    { name: 'Okta', icon: '🔒', connected: false, color: '#0ea5e9' },
    { name: 'OneLogin', icon: '1️⃣', connected: false, color: '#22c55e' },
    { name: 'Cloudflare', icon: '☁️', connected: false, color: '#f97316' },
    { name: 'Snyk', icon: '🛡️', connected: false, color: '#8b5cf6' },
    { name: '1Password', icon: '🔑', connected: false, color: '#3b82f6' }
  ],
  'Monitoring': [
    { name: 'Datadog', icon: '🐕', connected: false, color: '#8b5cf6' },
    { name: 'New Relic', icon: '📊', connected: false, color: '#06b6d4' },
    { name: 'Sentry', icon: '🔔', connected: false, color: '#ec4899' },
    { name: 'PagerDuty', icon: '📟', connected: false, color: '#22c55e' },
    { name: 'Grafana', icon: '📈', connected: false, color: '#f97316' },
    { name: 'Prometheus', icon: '🔥', connected: false, color: '#ef4444' }
  ],
  'Storage': [
    { name: 'Dropbox', icon: '📦', connected: false, color: '#0ea5e9' },
    { name: 'Box', icon: '📦', connected: false, color: '#3b82f6' },
    { name: 'OneDrive', icon: '☁️', connected: false, color: '#0ea5e9' },
    { name: 'Google Drive', icon: '📁', connected: false, color: '#fbbf24' },
    { name: 'AWS S3', icon: '🪣', connected: false, color: '#f97316' },
    { name: 'Backblaze', icon: '💾', connected: false, color: '#ef4444' }
  ],
  'Social Media': [
    { name: 'Twitter', icon: '🐦', connected: false, color: '#0ea5e9' },
    { name: 'Facebook', icon: '📘', connected: false, color: '#3b82f6' },
    { name: 'Instagram', icon: '📸', connected: false, color: '#ec4899' },
    { name: 'LinkedIn', icon: '💼', connected: false, color: '#0ea5e9' },
    { name: 'YouTube', icon: '📹', connected: false, color: '#ef4444' },
    { name: 'TikTok', icon: '🎵', connected: false, color: '#000000' },
    { name: 'Pinterest', icon: '📌', connected: false, color: '#ef4444' },
    { name: 'Reddit', icon: '🔴', connected: false, color: '#f97316' }
  ]
};

export default function IntegrationHub({ show, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  if (!show) return null;

  return (
    <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <Zap className="w-8 h-8 text-cyan-400" />
        <div>
          <h2 className="text-2xl font-bold text-white">Integration Hub</h2>
          <p className="text-white/60 text-sm">Connect with 200+ services and platforms</p>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder="Search integrations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-xl pl-12 pr-4 py-3 text-white placeholder-white/40"
          />
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['All', ...Object.keys(integrationCategories)].map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-cyan-500/30 border border-cyan-500/50 text-cyan-300'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {Object.entries(integrationCategories)
          .filter(([cat]) => selectedCategory === 'All' || selectedCategory === cat)
          .map(([category, integrations]) => (
            <div key={category}>
              <h3 className="text-white font-semibold mb-3">{category}</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {integrations.map(integration => (
                  <div
                    key={integration.name}
                    className={`bg-white/5 border rounded-xl p-4 hover:bg-white/10 transition-colors cursor-pointer ${
                      integration.connected ? 'border-green-500/40' : 'border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-3xl">{integration.icon}</span>
                      <div className="flex-1">
                        <div className="text-white font-medium text-sm">{integration.name}</div>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs ${
                      integration.connected 
                        ? 'bg-green-500/20 text-green-300'
                        : 'bg-white/10 text-white/60'
                    }`}>
                      {integration.connected ? 'Connected' : 'Connect'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}