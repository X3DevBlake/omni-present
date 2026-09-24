/**
 * Process AI Agent Decision Making
 * - Evaluates agent personality and goals
 * - Uses LLM for decision reasoning
 * - Updates agent state and memory
 */

import { base44 } from '@base44/sdk';

export default async function handler(req, res) {
  try {
    const { agentId, situation, options } = req.body;

    // Fetch agent details
    const agent = await base44.entities.Agent.read(agentId);
    const personality = await base44.entities.AgentPersonality.filter({
      agent_id: agentId
    });

    // Get relevant memory
    const memory = await base44.entities.AgentMemory.filter({
      agent_id: agentId,
      memory_type: 'learned_fact'
    });

    // Use LLM to make decision
    const decision = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an AI agent with these characteristics:
      Name: ${agent.name}
      Personality: ${JSON.stringify(personality[0]?.traits || {})}
      Recent memory: ${memory.slice(0, 5).map(m => m.content).join('; ')}
      
      Situation: ${situation}
      Available options: ${options.join(', ')}
      
      Make a decision and explain your reasoning. Output JSON with: decision, confidence (0-1), emotion, reasoning.`,
      response_json_schema: {
        type: 'object',
        properties: {
          decision: { type: 'string' },
          confidence: { type: 'number' },
          emotion: { type: 'string' },
          reasoning: { type: 'string' }
        }
      }
    });

    // Update agent state
    await base44.entities.Agent.update(agentId, {
      status: decision.decision.toLowerCase().includes('idle') ? 'idle' : 'working'
    });

    // Store decision in memory
    await base44.entities.AgentMemory.create({
      agent_id: agentId,
      memory_type: 'interaction',
      content: `Decided: ${decision.decision}. Reasoning: ${decision.reasoning}`,
      importance_score: decision.confidence * 100,
      tags: [situation.split(' ')[0].toLowerCase()]
    });

    res.status(200).json({
      success: true,
      decision: decision.decision,
      confidence: decision.confidence,
      emotion: decision.emotion,
      reasoning: decision.reasoning
    });
  } catch (error) {
    console.error('Agent decision error:', error);
    res.status(500).json({ error: error.message });
  }
}