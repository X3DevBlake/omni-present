import { base44 } from '@/api/base44Client';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userEmail, agentId, limit = 5 } = req.query;

    if (!userEmail) {
      return res.status(400).json({ error: 'User email is required' });
    }

    // Fetch agents
    const agents = await base44.entities.Agent.filter({ created_by: userEmail }).catch(() => []);
    const targetAgents = agentId ? agents.filter(a => a.id === agentId) : agents.slice(0, limit);

    // Fetch KPIs for each agent
    const kpis = await Promise.all(
      targetAgents.map(async (agent) => {
        const goals = await base44.entities.AgentGoal.filter({ agent_id: agent.id }).catch(() => []);
        const memory = await base44.entities.AgentMemory.filter({ agent_id: agent.id }).catch(() => []);
        const skills = await base44.entities.AgentSkill.filter({ agent_id: agent.id }).catch(() => []);

        return {
          agentId: agent.id,
          agentName: agent.name,
          status: agent.status || 'idle',
          activeGoals: goals.filter(g => g.status === 'active').length,
          completedGoals: goals.filter(g => g.status === 'completed').length,
          memorySize: memory.length,
          skillCount: skills.length,
          successRate: goals.length > 0 
            ? ((goals.filter(g => g.status === 'completed').length / goals.length) * 100).toFixed(1)
            : 0,
          lastActivity: agent.updated_date
        };
      })
    );

    res.status(200).json({
      success: true,
      kpis,
      totalAgents: agents.length,
      averageSuccessRate: kpis.length > 0
        ? (kpis.reduce((sum, k) => sum + parseFloat(k.successRate), 0) / kpis.length).toFixed(1)
        : 0
    });
  } catch (error) {
    console.error('Get agent KPIs error:', error);
    res.status(500).json({ error: 'Failed to fetch agent KPIs' });
  }
}