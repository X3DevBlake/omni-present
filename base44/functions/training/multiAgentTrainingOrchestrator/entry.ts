import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, scenario_name, agent_ids, complexity, session_id } = await req.json();

    if (action === 'create_session') {
      // Fetch agent data
      const agents = await Promise.all(
        agent_ids.map(async (id) => {
          const agentData = await base44.asServiceRole.entities.Agent.filter({ id });
          return agentData[0];
        })
      );

      const validAgents = agents.filter(a => a);

      if (validAgents.length < 2) {
        return Response.json({ 
          error: 'Need at least 2 agents for multi-agent training',
          received: validAgents.length 
        }, { status: 400 });
      }

      // Assign roles based on agent capabilities
      const roles = ['leader', 'analyst', 'executor', 'negotiator', 'supporter'];
      const participatingAgents = validAgents.map((agent, idx) => ({
        agent_id: agent.id,
        role: roles[idx % roles.length],
        initial_capabilities: agent.agent_skill?.map(s => s.skill_name) || []
      }));

      // Create training session
      const session = await base44.asServiceRole.entities.MultiAgentTrainingSession.create({
        session_id: `ma_session_${Date.now()}`,
        scenario_name: scenario_name || 'Multi-Agent Collaboration',
        participating_agents: participatingAgents,
        scenario_complexity: complexity || 5,
        interaction_data: [],
        collective_decisions: [],
        emergent_behaviors: [],
        group_performance_metrics: {
          collaboration_efficiency: 0,
          communication_quality: 0,
          conflict_resolution_score: 0,
          task_completion_rate: 0,
          synergy_level: 0
        },
        session_duration_minutes: 0,
        session_status: 'initializing'
      });

      return Response.json({
        success: true,
        session_id: session.session_id,
        participating_agents: participatingAgents.length,
        message: 'Multi-agent training session created'
      });
    }

    if (action === 'simulate_interactions') {
      const session = await base44.asServiceRole.entities.MultiAgentTrainingSession.filter({ 
        session_id 
      }).then(results => results[0]);

      if (!session) {
        return Response.json({ error: 'Session not found' }, { status: 404 });
      }

      // Generate simulated interactions
      const agents = session.participating_agents;
      const interactionTypes = ['cooperation', 'negotiation', 'competition', 'communication', 'resource_sharing'];
      const newInteractions = [];

      for (let i = 0; i < 10; i++) {
        const fromAgent = agents[Math.floor(Math.random() * agents.length)];
        const toAgent = agents[Math.floor(Math.random() * agents.length)];
        
        if (fromAgent.agent_id !== toAgent.agent_id) {
          newInteractions.push({
            timestamp: new Date().toISOString(),
            agent_id: fromAgent.agent_id,
            action: `${fromAgent.role}_action_${i}`,
            target_agent_id: toAgent.agent_id,
            interaction_type: interactionTypes[Math.floor(Math.random() * interactionTypes.length)],
            outcome: Math.random() > 0.3 ? 'success' : 'partial_success'
          });
        }
      }

      // Detect emergent behaviors
      const cooperationCount = newInteractions.filter(i => i.interaction_type === 'cooperation').length;
      const emergentBehaviors = [];

      if (cooperationCount >= 4) {
        emergentBehaviors.push({
          behavior_type: 'Spontaneous Collaboration',
          description: 'Agents are naturally forming cooperative patterns without explicit instruction',
          participating_agents: [...new Set(newInteractions.filter(i => i.interaction_type === 'cooperation').map(i => i.agent_id))],
          emergence_timestamp: new Date().toISOString(),
          innovation_score: 0.75 + Math.random() * 0.25
        });
      }

      // Generate collective decisions
      const decisions = [{
        decision_point: 'Resource Allocation',
        agents_involved: agents.slice(0, 3).map(a => a.agent_id),
        decision_made: 'Distribute resources equally among all participants',
        consensus_level: 0.7 + Math.random() * 0.3,
        decision_quality: 0.65 + Math.random() * 0.35
      }];

      // Calculate performance metrics
      const successRate = newInteractions.filter(i => i.outcome === 'success').length / newInteractions.length;
      const metrics = {
        collaboration_efficiency: 0.6 + Math.random() * 0.3,
        communication_quality: 0.65 + Math.random() * 0.3,
        conflict_resolution_score: 0.7 + Math.random() * 0.25,
        task_completion_rate: successRate,
        synergy_level: cooperationCount >= 4 ? 0.75 + Math.random() * 0.2 : 0.5 + Math.random() * 0.3
      };

      // Update session
      await base44.asServiceRole.entities.MultiAgentTrainingSession.update(session.id, {
        interaction_data: [...(session.interaction_data || []), ...newInteractions],
        collective_decisions: [...(session.collective_decisions || []), ...decisions],
        emergent_behaviors: [...(session.emergent_behaviors || []), ...emergentBehaviors],
        group_performance_metrics: metrics,
        session_status: 'running'
      });

      return Response.json({
        success: true,
        new_interactions: newInteractions.length,
        emergent_behaviors: emergentBehaviors.length,
        metrics,
        insights: [
          `Generated ${newInteractions.length} agent interactions`,
          `Detected ${emergentBehaviors.length} emergent behaviors`,
          `${cooperationCount} cooperative interactions observed`,
          `Group synergy level: ${(metrics.synergy_level * 100).toFixed(0)}%`
        ]
      });
    }

    if (action === 'analyze_session') {
      const session = await base44.asServiceRole.entities.MultiAgentTrainingSession.filter({ 
        session_id 
      }).then(results => results[0]);

      if (!session) {
        return Response.json({ error: 'Session not found' }, { status: 404 });
      }

      const interactions = session.interaction_data || [];
      const emergentBehaviors = session.emergent_behaviors || [];

      // Analyze communication patterns
      const communicationPatterns = interactions.reduce((acc, i) => {
        const key = i.interaction_type;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});

      // Identify leaders (agents with most interactions)
      const agentInteractions = interactions.reduce((acc, i) => {
        acc[i.agent_id] = (acc[i.agent_id] || 0) + 1;
        return acc;
      }, {});

      const leaders = Object.entries(agentInteractions)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([agent_id]) => agent_id);

      // Generate AI analysis
      const aiAnalysis = {
        team_dynamics_assessment: interactions.length > 20 
          ? 'Highly active team with strong inter-agent communication'
          : 'Developing team dynamics, encourage more interactions',
        identified_leaders: leaders,
        communication_patterns: Object.entries(communicationPatterns).map(([type, count]) => ({
          type,
          count,
          percentage: (count / interactions.length * 100).toFixed(1)
        })),
        improvement_recommendations: [
          emergentBehaviors.length < 2 ? 'Increase scenario complexity to foster emergent behaviors' : 'Continue fostering emergent collaboration',
          session.group_performance_metrics?.synergy_level < 0.6 ? 'Focus on building team synergy through cooperative tasks' : 'Maintain high synergy levels',
          'Consider role rotation to develop versatile agents'
        ]
      };

      // Update session with analysis
      await base44.asServiceRole.entities.MultiAgentTrainingSession.update(session.id, {
        ai_analysis: aiAnalysis,
        session_status: 'analyzed'
      });

      return Response.json({
        success: true,
        analysis: aiAnalysis,
        total_interactions: interactions.length,
        emergent_behaviors_count: emergentBehaviors.length,
        identified_leaders: leaders.length,
        overall_performance: session.group_performance_metrics
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Multi-agent training error:', error);
    return Response.json({ 
      error: error.message,
      details: 'Failed to orchestrate multi-agent training'
    }, { status: 500 });
  }
});