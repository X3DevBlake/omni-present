import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { description, complexity, budget } = await req.json();

    if (!description) {
      return Response.json({ error: 'description required' }, { status: 400 });
    }

    // Create collaborative task entity
    const task = await base44.entities.CollaborationTask.create({
      description,
      complexity: complexity || 'medium',
      budget: budget || 1000,
      status: 'open_for_bids',
      created_by_user: user.email,
      required_agent_count: complexity === 'extreme' ? 5 : complexity === 'high' ? 3 : 2
    });

    // AI analyzes task and suggests agent types
    const aiAnalysis = {
      suggested_agent_types: [],
      estimated_duration_hours: 0,
      complexity_breakdown: {}
    };

    if (description.toLowerCase().includes('data') || description.toLowerCase().includes('analysis')) {
      aiAnalysis.suggested_agent_types.push('Data Analysis', 'Machine Learning');
    }
    if (description.toLowerCase().includes('risk') || description.toLowerCase().includes('security')) {
      aiAnalysis.suggested_agent_types.push('Risk Management', 'Cybersecurity');
    }
    if (description.toLowerCase().includes('predict') || description.toLowerCase().includes('forecast')) {
      aiAnalysis.suggested_agent_types.push('Predictive Analytics', 'Time Series Analysis');
    }

    aiAnalysis.estimated_duration_hours = complexity === 'extreme' ? 48 : complexity === 'high' ? 24 : 12;
    aiAnalysis.complexity_breakdown = {
      technical_complexity: complexity === 'extreme' ? 0.9 : complexity === 'high' ? 0.7 : 0.5,
      coordination_overhead: task.required_agent_count * 0.15,
      risk_level: complexity === 'extreme' ? 0.8 : 0.4
    };

    // Broadcast task to potential agents
    await base44.entities.MessageBroadcast.create({
      message_type: 'task_opportunity',
      content: `New collaborative task: ${description}`,
      target_audience: aiAnalysis.suggested_agent_types,
      task_id: task.id
    });

    return Response.json({
      task,
      ai_analysis: aiAnalysis,
      status: 'Task created and broadcast to potential agents'
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});