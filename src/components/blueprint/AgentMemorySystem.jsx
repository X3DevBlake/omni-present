import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Database, History, Save, Download } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export class AgentMemory {
  constructor(agentId) {
    this.agentId = agentId;
    this.experiences = [];
    this.learnedPatterns = new Map();
    this.interactions = [];
    this.environmentalKnowledge = new Map();
    this.skills = new Set();
    this.personality = {};
    this.longTermMemory = [];
    this.episodicMemory = [];
    this.semanticMemory = new Map();
    this.emotionalMemory = [];
    this.characterArc = { milestones: [], traits: [], evolution: [] };
  }

  recordExperience(experience) {
    const exp = {
      ...experience,
      timestamp: Date.now(),
      id: `exp_${Date.now()}_${Math.random()}`,
      emotionalValue: experience.emotionalValue || 0,
      importance: experience.importance || 1
    };
    
    this.experiences.push(exp);
    
    // Consolidate to long-term if important
    if (exp.importance > 5 || exp.emotionalValue > 7) {
      this.consolidateToLongTerm(exp);
    }
    
    // Episodic memory for significant events
    if (exp.importance > 3) {
      this.episodicMemory.push({
        event: exp,
        context: { location: exp.location, participants: exp.participants || [] },
        timestamp: exp.timestamp
      });
    }
    
    if (this.experiences.length > 100) {
      this.experiences = this.experiences.slice(-100);
    }
  }

  consolidateToLongTerm(experience) {
    // AI-driven memory consolidation
    const consolidated = {
      summary: experience.action,
      details: experience,
      timestamp: experience.timestamp,
      retrievalCount: 0,
      emotionalSignificance: experience.emotionalValue || 0,
      id: experience.id
    };
    
    this.longTermMemory.push(consolidated);
    
    // Update character arc
    if (experience.importance > 7) {
      this.characterArc.milestones.push({
        event: experience.action,
        timestamp: experience.timestamp,
        impact: experience.emotionalValue
      });
    }
  }

  recallLongTermMemory(query) {
    // AI-driven retrieval with relevance scoring
    return this.longTermMemory
      .map(mem => ({
        ...mem,
        relevance: this.calculateRelevance(mem, query)
      }))
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, query.limit || 5);
  }

  calculateRelevance(memory, query) {
    let score = 0;
    
    // Recency
    const age = (Date.now() - memory.timestamp) / (1000 * 60 * 60 * 24); // days
    score += Math.max(0, 10 - age);
    
    // Retrieval frequency
    score += memory.retrievalCount * 2;
    
    // Emotional significance
    score += memory.emotionalSignificance;
    
    return score;
  }

  updateCharacterArc(trait, value) {
    this.characterArc.traits.push({ trait, value, timestamp: Date.now() });
    this.characterArc.evolution.push({
      description: `${trait} evolved to ${value}`,
      timestamp: Date.now()
    });
  }

  learnPattern(patternName, data) {
    const existing = this.learnedPatterns.get(patternName) || { count: 0, data: [] };
    existing.count++;
    existing.data.push({ ...data, learned: Date.now() });
    this.learnedPatterns.set(patternName, existing);
  }

  recordInteraction(agentId, interactionType, outcome) {
    this.interactions.push({
      withAgent: agentId,
      type: interactionType,
      outcome,
      timestamp: Date.now()
    });
  }

  rememberLocation(locationId, properties) {
    this.environmentalKnowledge.set(locationId, {
      ...properties,
      visitCount: (this.environmentalKnowledge.get(locationId)?.visitCount || 0) + 1,
      lastVisit: Date.now()
    });
  }

  acquireSkill(skillName) {
    this.skills.add(skillName);
  }

  recall(query) {
    if (query.type === 'experience') {
      return this.experiences
        .filter(e => !query.filter || query.filter(e))
        .slice(-query.limit || -10);
    }
    if (query.type === 'pattern') {
      return this.learnedPatterns.get(query.name);
    }
    if (query.type === 'location') {
      return this.environmentalKnowledge.get(query.locationId);
    }
    if (query.type === 'interactions') {
      return this.interactions.filter(i => !query.agentId || i.withAgent === query.agentId);
    }
    return null;
  }

  getMemoryStats() {
    return {
      totalExperiences: this.experiences.length,
      patternsLearned: this.learnedPatterns.size,
      interactions: this.interactions.length,
      knownLocations: this.environmentalKnowledge.size,
      skills: this.skills.size,
      longTermMemories: this.longTermMemory.length,
      episodicMemories: this.episodicMemory.length,
      milestones: this.characterArc.milestones.length
    };
  }

  export() {
    return {
      agentId: this.agentId,
      experiences: this.experiences,
      learnedPatterns: Array.from(this.learnedPatterns.entries()),
      interactions: this.interactions,
      environmentalKnowledge: Array.from(this.environmentalKnowledge.entries()),
      skills: Array.from(this.skills),
      personality: this.personality,
      exportedAt: Date.now()
    };
  }

  import(data) {
    this.experiences = data.experiences || [];
    this.learnedPatterns = new Map(data.learnedPatterns || []);
    this.interactions = data.interactions || [];
    this.environmentalKnowledge = new Map(data.environmentalKnowledge || []);
    this.skills = new Set(data.skills || []);
    this.personality = data.personality || {};
  }
}

export function AgentMemoryViewer({ agent, memorySystem }) {
  const [activeTab, setActiveTab] = useState('experiences');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (memorySystem) {
      setStats(memorySystem.getMemoryStats());
    }
  }, [memorySystem]);

  const saveMemory = async () => {
    if (!memorySystem) return;
    
    try {
      const memoryData = memorySystem.export();
      const user = await base44.auth.me();
      const memories = user.agent_memories || [];
      
      await base44.auth.updateMe({
        agent_memories: [...memories.filter(m => m.agentId !== agent.id), memoryData]
      });
      
      toast.success('Memory saved!');
    } catch (error) {
      toast.error('Failed to save memory');
    }
  };

  const downloadMemory = () => {
    if (!memorySystem) return;
    
    const data = memorySystem.export();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${agent.name}_memory_${Date.now()}.json`;
    a.click();
    toast.success('Memory downloaded!');
  };

  if (!stats) return null;

  return (
    <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-cyan-400" />
          <h4 className="text-white font-semibold">Memory System</h4>
        </div>
        <div className="flex gap-2">
          <button onClick={saveMemory} className="p-2 bg-green-500/20 border border-green-500/40 text-green-300 rounded hover:bg-green-500/30">
            <Save className="w-4 h-4" />
          </button>
          <button onClick={downloadMemory} className="p-2 bg-blue-500/20 border border-blue-500/40 text-blue-300 rounded hover:bg-blue-500/30">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2 mb-4">
        {Object.entries(stats).map(([key, value]) => (
          <div key={key} className="bg-white/5 rounded-lg p-2">
            <div className="text-xs text-white/60 capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
            <div className="text-lg font-bold text-white">{value}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-3 overflow-x-auto">
        {['experiences', 'patterns', 'interactions', 'locations', 'longterm', 'arc'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-3 py-1 rounded text-xs capitalize whitespace-nowrap ${activeTab === tab ? 'bg-cyan-500/30 border border-cyan-500/50 text-cyan-300' : 'bg-white/5 text-white/60'}`}>
            {tab === 'longterm' ? 'Long-Term' : tab === 'arc' ? 'Character Arc' : tab}
          </button>
        ))}
      </div>

      <div className="max-h-48 overflow-y-auto space-y-2">
        {activeTab === 'experiences' && memorySystem.experiences.slice(-10).reverse().map(exp => (
          <div key={exp.id} className="bg-white/5 rounded p-2 text-xs">
            <div className="text-cyan-400 font-medium">{exp.action || 'Experience'}</div>
            <div className="text-white/60">{new Date(exp.timestamp).toLocaleTimeString()}</div>
          </div>
        ))}
        
        {activeTab === 'patterns' && Array.from(memorySystem.learnedPatterns.entries()).map(([name, data]) => (
          <div key={name} className="bg-white/5 rounded p-2 text-xs">
            <div className="text-purple-400 font-medium">{name}</div>
            <div className="text-white/60">Learned {data.count} times</div>
          </div>
        ))}
        
        {activeTab === 'interactions' && memorySystem.interactions.slice(-10).reverse().map((int, i) => (
          <div key={i} className="bg-white/5 rounded p-2 text-xs">
            <div className="text-green-400 font-medium">{int.type} with {int.withAgent}</div>
            <div className="text-white/60">{int.outcome}</div>
          </div>
        ))}
        
        {activeTab === 'locations' && Array.from(memorySystem.environmentalKnowledge.entries()).map(([loc, data]) => (
          <div key={loc} className="bg-white/5 rounded p-2 text-xs">
            <div className="text-blue-400 font-medium">{loc}</div>
            <div className="text-white/60">Visited {data.visitCount} times</div>
          </div>
        ))}

        {activeTab === 'longterm' && memorySystem.longTermMemory.slice(-10).reverse().map(mem => (
          <div key={mem.id} className="bg-white/5 rounded p-2 text-xs">
            <div className="text-purple-400 font-medium">{mem.summary}</div>
            <div className="text-white/60">Retrieved {mem.retrievalCount} times</div>
            <div className="text-orange-400 text-xs">Emotional: {mem.emotionalSignificance}/10</div>
          </div>
        ))}

        {activeTab === 'arc' && (
          <div className="space-y-2">
            <div className="text-white/60 text-xs mb-2">Character Evolution</div>
            {memorySystem.characterArc.milestones.slice(-5).reverse().map((milestone, i) => (
              <div key={i} className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded p-2 text-xs">
                <div className="text-purple-300 font-medium">{milestone.event}</div>
                <div className="text-white/50">Impact: {milestone.impact}/10</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}