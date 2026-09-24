import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { current_page, session_data } = await req.json();

    // Get user's navigation patterns
    const patterns = await base44.entities.NavigationPattern.filter({
      created_by: user.email
    }).limit(100).sort('-created_date');

    // Get recent activity
    const recentActivity = await base44.entities.UserActivity.filter({
      created_by: user.email
    }).limit(50).sort('-created_date');

    // AI-driven task inference
    const taskKeywords = {
      trading: ['swap', 'trade', 'defi', 'crypto', 'market'],
      managing_agents: ['agent', 'bot', 'ai', 'training', 'marketplace'],
      simulation: ['simulation', 'world', 'scenario', 'sandbox'],
      banking: ['bank', 'card', 'deposit', 'withdraw', 'transaction'],
      learning: ['labs', 'training', 'experiment', 'model'],
      customizing: ['customize', 'avatar', 'design', 'appearance']
    };

    let inferredTask = 'browsing';
    for (const [task, keywords] of Object.entries(taskKeywords)) {
      if (keywords.some(kw => current_page.toLowerCase().includes(kw))) {
        inferredTask = task;
        break;
      }
    }

    // Generate AI suggestions based on context
    const suggestions = [];

    if (inferredTask === 'trading') {
      suggestions.push(
        { page: 'CryptoSwapHub', reason: 'Quick access to swap interface', confidence: 0.9, priority: 1 },
        { page: 'DeFiHub', reason: 'View portfolio and liquidity pools', confidence: 0.85, priority: 2 },
        { page: 'AdvancedDeFiTrading', reason: 'Advanced trading tools', confidence: 0.75, priority: 3 }
      );
    } else if (inferredTask === 'managing_agents') {
      suggestions.push(
        { page: 'AIManagement', reason: 'Manage all your agents', confidence: 0.95, priority: 1 },
        { page: 'AIAgentMarketplace', reason: 'Discover new agents', confidence: 0.8, priority: 2 },
        { page: 'AgentTrainingCenter', reason: 'Train and improve agents', confidence: 0.7, priority: 3 }
      );
    } else if (inferredTask === 'simulation') {
      suggestions.push(
        { page: 'EnhancedSimulationHub', reason: 'Run multi-user simulations', confidence: 0.9, priority: 1 },
        { page: 'SandboxHub', reason: 'Create custom environments', confidence: 0.85, priority: 2 },
        { page: 'World', reason: 'Explore global simulations', confidence: 0.75, priority: 3 }
      );
    } else if (inferredTask === 'banking') {
      suggestions.push(
        { page: 'EnhancedOmniCardHub', reason: 'Manage your cards', confidence: 0.9, priority: 1 },
        { page: 'OmniBankingHub', reason: 'View account dashboard', confidence: 0.85, priority: 2 },
        { page: 'CryptoSwapHub', reason: 'Swap crypto assets', confidence: 0.7, priority: 3 }
      );
    }

    // Add frequently visited pages as shortcuts
    const pageFrequency = {};
    patterns.forEach(p => {
      pageFrequency[p.destination_page] = (pageFrequency[p.destination_page] || 0) + 1;
    });

    const shortcuts = Object.entries(pageFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([page, freq]) => ({
        name: page.replace(/([A-Z])/g, ' $1').trim(),
        path: page,
        frequency: freq
      }));

    // Create or update navigation context
    const existingContext = await base44.entities.NavigationContext.filter({
      user_id: user.id
    }).limit(1);

    const contextData = {
      user_id: user.id,
      current_page,
      previous_pages: session_data?.previous_pages || [],
      session_duration: session_data?.session_duration || 0,
      current_task: inferredTask,
      ai_suggestions: suggestions,
      shortcuts
    };

    if (existingContext.length > 0) {
      await base44.entities.NavigationContext.update(existingContext[0].id, contextData);
    } else {
      await base44.entities.NavigationContext.create(contextData);
    }

    return Response.json({
      success: true,
      current_task: inferredTask,
      suggestions,
      shortcuts,
      confidence: 0.85
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});