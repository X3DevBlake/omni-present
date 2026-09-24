import { base44 } from '@/api/base44Client';

export default async function agentSelfLearning(req) {
  const { agentId, userId } = req.body;

  try {
    // Fetch agent's goal completion history
    const goals = await base44.entities.FinancialGoal.filter({
      user_email: userId,
      status: 'completed'
    });

    // Fetch agent's memory and knowledge
    const agentMemory = await base44.entities.AgentMemory.filter({
      agent_id: agentId
    });

    // Analyze patterns using AI
    const learningPrompt = `
      Based on the agent's goal completion history and memory:
      Completed Goals: ${JSON.stringify(goals.map(g => ({ name: g.name, category: g.category, completionRate: g.progress_percentage })))}
      
      Agent Memory: ${JSON.stringify(agentMemory.map(m => m.content).slice(0, 5))}
      
      Provide insights on:
      1. Patterns in successful goal completion
      2. Areas where the agent performed well
      3. Skills the agent has developed
      4. Recommended adjustments to future strategies
      
      Format as JSON with keys: patterns, strengths, developedSkills, recommendations
    `;

    const insights = await base44.integrations.Core.InvokeLLM({
      prompt: learningPrompt,
      response_json_schema: {
        type: 'object',
        properties: {
          patterns: { type: 'array', items: { type: 'string' } },
          strengths: { type: 'array', items: { type: 'string' } },
          developedSkills: { type: 'array', items: { type: 'string' } },
          recommendations: { type: 'array', items: { type: 'string' } }
        }
      }
    });

    // Store learning insights in agent knowledge
    await base44.entities.AgentKnowledge.create({
      agent_id: agentId,
      category: 'self_learning',
      content: JSON.stringify(insights),
      confidence_score: 0.85
    });

    return {
      success: true,
      insights,
      message: 'Agent self-learning analysis completed'
    };
  } catch (error) {
    console.error('Agent self-learning error:', error);
    throw error;
  }
}