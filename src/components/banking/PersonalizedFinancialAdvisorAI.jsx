import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, MessageSquare, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PersonalizedFinancialAdvisorAI() {
  const [messages, setMessages] = useState([
    { type: 'ai', text: 'Hello! I analyzed your spending patterns. You could save $300/month by optimizing your subscriptions.' }
  ]);

  const suggestions = [
    { icon: '💰', title: 'Investment Opportunity', desc: 'Consider increasing your retirement contributions by 2%' },
    { icon: '📉', title: 'Debt Strategy', desc: 'Pay off high-interest credit card first to save $450 in interest' },
    { icon: '🎯', title: 'Savings Goal', desc: 'On track to reach your emergency fund goal in 4 months' }
  ];

  return (
    <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
      <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
        <Brain className="w-6 h-6 text-purple-400" />
        AI Financial Advisor
      </h3>

      <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`px-4 py-2 rounded-lg max-w-[80%] ${
              msg.type === 'user' 
                ? 'bg-cyan-500/20 border border-cyan-500/40' 
                : 'bg-purple-500/20 border border-purple-500/40'
            }`}>
              <div className="text-white text-sm">{msg.text}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-3 mb-4">
        {suggestions.map((sug, i) => (
          <div key={i} className="bg-gradient-to-br from-white/5 to-white/10 border border-white/10 rounded-lg p-3">
            <div className="text-2xl mb-2">{sug.icon}</div>
            <div className="text-white font-bold text-sm mb-1">{sug.title}</div>
            <div className="text-white/60 text-xs">{sug.desc}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input 
          placeholder="Ask your AI advisor..."
          className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40"
        />
        <Button className="bg-gradient-to-r from-purple-500 to-pink-500">
          <MessageSquare className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}