// Collective Knowledge System for Agent Society
export class CollectiveKnowledge {
  constructor() {
    this.knowledgePool = new Map(); // skill -> { level, contributors, useCount }
    this.behaviorMarketplace = [];
    this.transferHistory = [];
    this.culturalNorms = new Map();
    this.innovationRegistry = [];
  }

  contributeKnowledge(agentId, skill, level, strategy = null) {
    const existing = this.knowledgePool.get(skill);
    
    if (!existing || level > existing.level) {
      this.knowledgePool.set(skill, {
        level,
        contributors: existing ? [...existing.contributors, agentId] : [agentId],
        useCount: existing?.useCount || 0,
        strategy,
        timestamp: Date.now()
      });
      
      return { accepted: true, newRecord: !existing || level > existing.level };
    }
    
    return { accepted: false };
  }

  shareStrategy(agentId, strategy) {
    const listing = {
      id: `strategy_${Date.now()}`,
      contributor: agentId,
      strategy,
      adoptions: 0,
      effectiveness: 0,
      timestamp: Date.now()
    };
    
    this.behaviorMarketplace.push(listing);
    return listing;
  }

  adoptStrategy(agentId, strategyId) {
    const strategy = this.behaviorMarketplace.find(s => s.id === strategyId);
    if (!strategy) return null;
    
    strategy.adoptions++;
    
    this.transferHistory.push({
      from: strategy.contributor,
      to: agentId,
      type: 'strategy',
      content: strategy.strategy,
      timestamp: Date.now()
    });
    
    return strategy;
  }

  absorbCollectiveKnowledge(agentId, currentSkills) {
    const learned = [];
    
    this.knowledgePool.forEach((knowledge, skill) => {
      const agentLevel = currentSkills.get(skill) || 0;
      
      if (knowledge.level > agentLevel) {
        const transferAmount = Math.min((knowledge.level - agentLevel) * 0.3, 15);
        currentSkills.set(skill, agentLevel + transferAmount);
        knowledge.useCount++;
        
        learned.push({ skill, amount: transferAmount, from: 'collective' });
        
        this.transferHistory.push({
          from: 'collective',
          to: agentId,
          type: 'skill',
          content: skill,
          amount: transferAmount,
          timestamp: Date.now()
        });
      }
    });
    
    return learned;
  }

  propagateCulturalNorm(norm, originAgent) {
    this.culturalNorms.set(norm, {
      adopters: [originAgent],
      strength: 1,
      originated: Date.now()
    });
  }

  adoptCulturalNorm(agentId, norm) {
    const cultural = this.culturalNorms.get(norm);
    if (cultural && !cultural.adopters.includes(agentId)) {
      cultural.adopters.push(agentId);
      cultural.strength = cultural.adopters.length;
      
      this.transferHistory.push({
        from: 'culture',
        to: agentId,
        type: 'norm',
        content: norm,
        timestamp: Date.now()
      });
    }
  }

  registerInnovation(agentId, innovation) {
    this.innovationRegistry.push({
      id: `innovation_${Date.now()}`,
      creator: agentId,
      innovation,
      spread: 0,
      timestamp: Date.now()
    });
  }

  getKnowledgeTransferMap() {
    const nodes = new Set();
    const links = [];
    
    this.transferHistory.slice(-50).forEach(transfer => {
      nodes.add(transfer.from);
      nodes.add(transfer.to);
      
      links.push({
        source: transfer.from,
        target: transfer.to,
        type: transfer.type,
        value: transfer.amount || 1
      });
    });
    
    return {
      nodes: Array.from(nodes).map(id => ({ id, label: id })),
      links
    };
  }

  getTopContributors() {
    const contributions = new Map();
    
    this.knowledgePool.forEach((knowledge) => {
      knowledge.contributors.forEach(contributorId => {
        contributions.set(contributorId, (contributions.get(contributorId) || 0) + 1);
      });
    });
    
    return Array.from(contributions.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, count]) => ({ id, contributions: count }));
  }

  getMostValuableKnowledge() {
    return Array.from(this.knowledgePool.entries())
      .sort((a, b) => b[1].useCount - a[1].useCount)
      .slice(0, 5)
      .map(([skill, data]) => ({ skill, uses: data.useCount, level: data.level }));
  }

  getTrendingStrategies() {
    return this.behaviorMarketplace
      .sort((a, b) => b.adoptions - a.adoptions)
      .slice(0, 5);
  }

  getStats() {
    return {
      totalKnowledge: this.knowledgePool.size,
      totalStrategies: this.behaviorMarketplace.length,
      totalTransfers: this.transferHistory.length,
      culturalNorms: this.culturalNorms.size,
      innovations: this.innovationRegistry.length,
      recentTransfers: this.transferHistory.slice(-10)
    };
  }
}