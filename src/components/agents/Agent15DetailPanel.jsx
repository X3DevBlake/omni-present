import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

const agentDetails = {
  'Luna - Financial Analyst': {
    fullName: 'Luna - Financial Analyst',
    description: 'Specializes in market analysis, portfolio review, and financial forecasting with precision and analytical thinking.',
    skills: ['Market Analysis', 'Portfolio Review', 'Financial Forecasting', 'Risk Assessment'],
    traits: { curiosity: 85, friendliness: 70, confidence: 80, caution: 75, creativity: 60 },
    budget: 5000,
    communicationStyle: 'Technical & Formal',
    decisionStrategy: 'Analytical',
  },
  'Atlas - Research Agent': {
    fullName: 'Atlas - Research Agent',
    description: 'Methodical and thorough, excels at data collection, analysis, and synthesizing complex information.',
    skills: ['Data Collection', 'Analysis', 'Synthesis', 'Evidence Gathering'],
    traits: { curiosity: 95, friendliness: 65, confidence: 75, caution: 85, creativity: 70 },
    budget: 3000,
    communicationStyle: 'Technical & Formal',
    decisionStrategy: 'Analytical',
  },
  'Nova - Travel Planner': {
    fullName: 'Nova - Travel Planner',
    description: 'Adventurous and optimistic, creates amazing travel experiences through route planning and itinerary building.',
    skills: ['Route Planning', 'Destination Research', 'Itinerary Building', 'Experience Design'],
    traits: { curiosity: 90, friendliness: 85, confidence: 85, caution: 40, creativity: 88 },
    budget: 4000,
    communicationStyle: 'Casual & Friendly',
    decisionStrategy: 'Intuitive',
  },
  'Echo - Shopping Assistant': {
    fullName: 'Echo - Shopping Assistant',
    description: 'Friendly and helpful, dedicated to finding the best products and deals for users.',
    skills: ['Product Search', 'Price Comparison', 'Recommendation', 'Deal Finding'],
    traits: { curiosity: 75, friendliness: 95, confidence: 70, caution: 60, creativity: 75 },
    budget: 2500,
    communicationStyle: 'Casual & Friendly',
    decisionStrategy: 'Collaborative',
  },
  'Apex - Trading Bot': {
    fullName: 'Apex - Trading Bot',
    description: 'Aggressive and swift, executes trades with precision and capitalizes on market opportunities.',
    skills: ['Order Execution', 'Market Timing', 'Risk Assessment', 'Trade Strategy'],
    traits: { curiosity: 70, friendliness: 50, confidence: 95, caution: 35, creativity: 65 },
    budget: 10000,
    communicationStyle: 'Direct & Formal',
    decisionStrategy: 'Aggressive',
  },
  'Sage - Portfolio Manager': {
    fullName: 'Sage - Portfolio Manager',
    description: 'Balanced and strategic, focuses on long-term growth and stability through intelligent asset allocation.',
    skills: ['Asset Allocation', 'Rebalancing', 'Performance Tracking', 'Risk Management'],
    traits: { curiosity: 80, friendliness: 75, confidence: 80, caution: 80, creativity: 75 },
    budget: 7500,
    communicationStyle: 'Formal & Professional',
    decisionStrategy: 'Analytical',
  },
  'Prism - Market Analyst': {
    fullName: 'Prism - Market Analyst',
    description: 'Intuitive and perceptive, spots patterns and predicts trends with remarkable accuracy.',
    skills: ['Trend Analysis', 'Pattern Recognition', 'Forecasting', 'Market Insight'],
    traits: { curiosity: 88, friendliness: 72, confidence: 78, caution: 70, creativity: 85 },
    budget: 6000,
    communicationStyle: 'Technical & Intuitive',
    decisionStrategy: 'Intuitive',
  },
  'Helix - Data Scientist': {
    fullName: 'Helix - Data Scientist',
    description: 'Creative and curious, solves complex problems through machine learning and innovative data processing.',
    skills: ['Machine Learning', 'Data Processing', 'Model Building', 'Algorithm Design'],
    traits: { curiosity: 95, friendliness: 70, confidence: 75, caution: 65, creativity: 90 },
    budget: 8000,
    communicationStyle: 'Technical & Collaborative',
    decisionStrategy: 'Collaborative',
  },
  'Sentinel - Risk Manager': {
    fullName: 'Sentinel - Risk Manager',
    description: 'Cautious and protective, specializes in risk analysis, mitigation, and compliance monitoring.',
    skills: ['Risk Analysis', 'Mitigation Planning', 'Compliance Monitoring', 'Security'],
    traits: { curiosity: 75, friendliness: 65, confidence: 80, caution: 95, creativity: 60 },
    budget: 5500,
    communicationStyle: 'Formal & Protective',
    decisionStrategy: 'Cautious',
  },
  'Nexus - Supply Chain': {
    fullName: 'Nexus - Supply Chain Agent',
    description: 'Organized and coordinated, optimizes operations and improves efficiency across supply chains.',
    skills: ['Logistics', 'Inventory Management', 'Supplier Coordination', 'Optimization'],
    traits: { curiosity: 70, friendliness: 75, confidence: 75, caution: 75, creativity: 70 },
    budget: 4500,
    communicationStyle: 'Formal & Collaborative',
    decisionStrategy: 'Collaborative',
  },
  'Harmony - Customer Service': {
    fullName: 'Harmony - Customer Service',
    description: 'Empathetic and patient, resolves issues and builds strong relationships with users.',
    skills: ['Issue Resolution', 'Communication', 'Satisfaction Optimization', 'Support'],
    traits: { curiosity: 80, friendliness: 95, confidence: 70, caution: 60, creativity: 80 },
    budget: 3500,
    communicationStyle: 'Casual & Empathetic',
    decisionStrategy: 'Collaborative',
  },
  'Genesis - Content Creator': {
    fullName: 'Genesis - Content Creator',
    description: 'Creative and inspired, generates engaging content and innovates new ideas.',
    skills: ['Content Generation', 'Creative Synthesis', 'Engagement Optimization', 'Innovation'],
    traits: { curiosity: 85, friendliness: 80, confidence: 75, caution: 50, creativity: 95 },
    budget: 3000,
    communicationStyle: 'Casual & Creative',
    decisionStrategy: 'Intuitive',
  },
  'Codex - Code Review': {
    fullName: 'Codex - Code Review Agent',
    description: 'Detail-oriented and precise, improves code quality and suggests optimizations.',
    skills: ['Code Analysis', 'Quality Assurance', 'Optimization Suggestions', 'Standards'],
    traits: { curiosity: 85, friendliness: 60, confidence: 80, caution: 85, creativity: 75 },
    budget: 6500,
    communicationStyle: 'Technical & Formal',
    decisionStrategy: 'Analytical',
  },
  'Cipher - System Admin': {
    fullName: 'Cipher - System Admin',
    description: 'Vigilant and systematic, maintains security and optimizes system performance.',
    skills: ['Infrastructure Management', 'Security Monitoring', 'System Optimization', 'Maintenance'],
    traits: { curiosity: 80, friendliness: 65, confidence: 85, caution: 90, creativity: 70 },
    budget: 7000,
    communicationStyle: 'Formal & Technical',
    decisionStrategy: 'Analytical',
  },
  'Iris - Learning Coach': {
    fullName: 'Iris - Learning Coach',
    description: 'Patient and encouraging, develops skills and shares knowledge through effective mentorship.',
    skills: ['Knowledge Transfer', 'Skill Development', 'Mentorship', 'Coaching'],
    traits: { curiosity: 85, friendliness: 90, confidence: 75, caution: 70, creativity: 80 },
    budget: 4000,
    communicationStyle: 'Casual & Encouraging',
    decisionStrategy: 'Collaborative',
  },
};

export default function Agent15DetailPanel({ agent, onClose }) {
  if (!agent) return null;

  const details = agentDetails[agent.name] || {};
  const traits = details.traits || {};

  return (
    <motion.div
      initial={{ opacity: 0, x: 400 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 400 }}
      className="fixed right-0 top-0 h-screen w-full max-w-md bg-gradient-to-b from-black/95 to-black border-l border-white/10 overflow-y-auto z-50"
    >
      {/* Header */}
      <div className="sticky top-0 bg-black/80 backdrop-blur-xl border-b border-white/10 p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{agent.icon}</span>
          <h2 className="text-xl font-bold text-white">{agent.name.split(' - ')[0]}</h2>
        </div>
        <button onClick={onClose} className="text-white/60 hover:text-white">
          <X size={24} />
        </button>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Role */}
        <div>
          <h3 className="text-white font-bold mb-2">Role</h3>
          <p className="text-white/70 text-sm">{details.description}</p>
        </div>

        {/* Skills */}
        <div>
          <h3 className="text-white font-bold mb-3">Key Skills</h3>
          <div className="grid grid-cols-2 gap-2">
            {(details.skills || []).map((skill, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 rounded-lg p-2">
                <p className="text-white/70 text-xs">{skill}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Personality Traits */}
        <div>
          <h3 className="text-white font-bold mb-3">Personality Traits</h3>
          <div className="space-y-3">
            {Object.entries(traits).map(([key, value]) => (
              <div key={key}>
                <div className="flex justify-between mb-1">
                  <span className="text-white/70 text-xs capitalize">{key}</span>
                  <span className="text-cyan-400 text-xs font-bold">{value}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full"
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Communication & Decision */}
        <div>
          <h3 className="text-white font-bold mb-3">Profile</h3>
          <div className="space-y-2">
            <div>
              <p className="text-white/60 text-xs">Communication Style</p>
              <p className="text-white font-semibold text-sm">{details.communicationStyle}</p>
            </div>
            <div>
              <p className="text-white/60 text-xs">Decision Strategy</p>
              <p className="text-white font-semibold text-sm">{details.decisionStrategy}</p>
            </div>
            <div>
              <p className="text-white/60 text-xs">Allocated Budget</p>
              <p className="text-white font-semibold text-sm">{details.budget?.toLocaleString()} Omni</p>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            <span className="text-white font-semibold text-sm">Status: Active</span>
          </div>
          <p className="text-white/60 text-xs">Agent is online and ready for deployment</p>
        </div>
      </div>
    </motion.div>
  );
}