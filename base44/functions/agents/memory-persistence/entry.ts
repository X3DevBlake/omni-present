import { base44 } from '@/api/base44Client';

export async function storeMemory(agentId, userEmail, memoryData) {
  const memory = {
    agent_id: agentId,
    user_email: userEmail,
    memory_type: memoryData.type || 'episodic',
    content: memoryData.content,
    importance_score: memoryData.importance || 0.5,
    associated_interactions: memoryData.interactions || [],
    learned_patterns: memoryData.patterns || [],
    last_accessed: new Date().toISOString(),
    decay_rate: 0.95
  };

  return await base44.entities.AgentMemoryStore.create(memory);
}

export async function retrieveMemories(agentId, limit = 50) {
  const memories = await base44.entities.AgentMemoryStore.filter(
    { agent_id: agentId },
    '-importance_score',
    limit
  );

  // Apply decay to old memories
  return memories.map(mem => ({
    ...mem,
    current_strength: calculateMemoryStrength(mem)
  }));
}

export async function queryMemory(agentId, query) {
  const allMemories = await base44.entities.AgentMemoryStore.filter({ agent_id: agentId });

  // Simple semantic search
  const relevantMemories = allMemories.filter(mem =>
    JSON.stringify(mem.content).toLowerCase().includes(query.toLowerCase())
  );

  return relevantMemories.sort((a, b) => b.importance_score - a.importance_score);
}

export async function consolidateMemories(agentId) {
  const memories = await retrieveMemories(agentId, 1000);

  // Group by type and consolidate similar memories
  const consolidated = {};
  
  memories.forEach(mem => {
    const key = mem.memory_type;
    if (!consolidated[key]) {
      consolidated[key] = [];
    }
    consolidated[key].push(mem);
  });

  // Merge high-similarity memories
  const merged = {};
  Object.entries(consolidated).forEach(([type, mems]) => {
    merged[type] = mergeSimilarMemories(mems);
  });

  return merged;
}

function calculateMemoryStrength(memory) {
  const age = Date.now() - new Date(memory.last_accessed).getTime();
  const ageInDays = age / (1000 * 60 * 60 * 24);
  const decay = Math.pow(memory.decay_rate, ageInDays);
  
  return memory.importance_score * decay;
}

function mergeSimilarMemories(memories) {
  const grouped = {};
  
  memories.forEach(mem => {
    const key = JSON.stringify(mem.content).substring(0, 50);
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(mem);
  });

  return Object.values(grouped).map(group =>
    group.reduce((acc, mem) => ({
      ...acc,
      importance_score: Math.max(acc.importance_score || 0, mem.importance_score)
    }))
  );
}

export async function extractPatterns(agentId) {
  const memories = await retrieveMemories(agentId, 100);
  const patterns = [];

  // Analyze interactions for patterns
  memories.forEach(mem => {
    if (mem.associated_interactions?.length > 0) {
      const sequence = mem.associated_interactions.map(i => i.type);
      patterns.push({
        sequence,
        frequency: mem.associated_interactions.length,
        success_rate: calculateSuccessRate(mem.associated_interactions)
      });
    }
  });

  return patterns.sort((a, b) => b.frequency - a.frequency);
}

function calculateSuccessRate(interactions) {
  if (interactions.length === 0) return 0;
  const successful = interactions.filter(i => i.success).length;
  return (successful / interactions.length) * 100;
}