import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [hubs, patterns] = await Promise.all([
      base44.entities.NavigationHub.list(),
      base44.entities.NavigationPattern.filter({ user_id: user.id }, '-created_date', 30)
    ]);

    const linkMap = new Map();
    
    patterns.forEach(pattern => {
      const sequence = pattern.navigation_sequence || [];
      for (let i = 0; i < sequence.length - 1; i++) {
        const from = sequence[i].page_name;
        const to = sequence[i + 1].page_name;
        const key = `${from}-${to}`;
        
        if (!linkMap.has(key)) {
          linkMap.set(key, {
            source_hub: from,
            target_hub: to,
            link_type: 'user_navigation',
            strength: 0,
            usage_count: 0,
            avg_transition_time: 0,
            success_rate: 1.0,
            ai_confidence: 0,
            user_segments: [],
            is_active: false
          });
        }
        
        const link = linkMap.get(key);
        link.usage_count += 1;
        link.strength = Math.min(1, link.usage_count / 20);
        link.avg_transition_time = sequence[i].duration_seconds || 0;
        
        const recentTime = Date.now() - 24 * 60 * 60 * 1000;
        if (new Date(pattern.created_date) > recentTime) {
          link.is_active = true;
        }
      }
    });

    let links = Array.from(linkMap.values());

    if (links.length === 0 && hubs.length > 1) {
      const defaultLinks = [];
      for (let i = 0; i < Math.min(hubs.length - 1, 5); i++) {
        defaultLinks.push({
          source_hub: hubs[i].hub_name,
          target_hub: hubs[i + 1].hub_name,
          link_type: 'workflow',
          strength: 0.5,
          usage_count: 10,
          avg_transition_time: 3,
          success_rate: 0.85,
          ai_confidence: 0.7,
          user_segments: ['power_user'],
          is_active: true
        });
      }
      
      for (const link of defaultLinks) {
        await base44.entities.CrossHubLink.create(link);
      }
      
      links = defaultLinks;
    }

    const networkAnalysis = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze navigation network: ${hubs.length} hubs, ${links.length} connections, ${links.filter(l => l.is_active).length} active. Provide 2 key insights about user navigation patterns.`,
      response_json_schema: {
        type: "object",
        properties: {
          insights: {
            type: "array",
            items: { type: "string" }
          },
          optimization_suggestions: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    });

    return Response.json({
      success: true,
      hubs,
      links,
      insights: networkAnalysis.insights,
      optimization_suggestions: networkAnalysis.optimization_suggestions,
      message: 'Cross-hub network data retrieved'
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});