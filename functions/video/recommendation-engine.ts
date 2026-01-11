import { base44 } from '@/api/base44Client';

export async function generatePersonalizedRecommendations(
  videoAnalytics,
  videoData,
  kpis,
  pastPerformance
) {
  try {
    // Generate personalized recommendations based on all video factors
    const recommendations = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate personalized video improvement recommendations:
      
Video Type: ${videoData.type}
Engagement Score: ${videoAnalytics.engagement?.score}
Sentiment: ${videoAnalytics.sentiment?.overall}
Duration: ${videoData.duration}
KPI Performance: ${JSON.stringify(kpis?.kpis || {})}
Past Performance: ${JSON.stringify(pastPerformance)}

Provide specific, actionable recommendations for:
1. Content delivery improvement
2. Engagement enhancement
3. Time management optimization
4. Participant interaction tactics
5. Presentation style adjustments
6. Technical quality improvements
7. Follow-up strategy`,
      response_json_schema: {
        type: 'object',
        properties: {
          delivery: { type: 'array', items: { type: 'object', properties: { recommendation: { type: 'string' }, impact: { type: 'string' }, priority: { type: 'string' } } } },
          engagement: { type: 'array', items: { type: 'object', properties: { recommendation: { type: 'string' }, impact: { type: 'string' }, priority: { type: 'string' } } } },
          timing: { type: 'array', items: { type: 'object', properties: { recommendation: { type: 'string' }, impact: { type: 'string' }, priority: { type: 'string' } } } },
          interaction: { type: 'array', items: { type: 'object', properties: { recommendation: { type: 'string' }, impact: { type: 'string' }, priority: { type: 'string' } } } },
          presentation: { type: 'array', items: { type: 'object', properties: { recommendation: { type: 'string' }, impact: { type: 'string' }, priority: { type: 'string' } } } },
          technical: { type: 'array', items: { type: 'object', properties: { recommendation: { type: 'string' }, impact: { type: 'string' }, priority: { type: 'string' } } } },
          followUp: { type: 'array', items: { type: 'object', properties: { recommendation: { type: 'string' }, impact: { type: 'string' }, priority: { type: 'string' } } } },
        },
      },
    });

    return recommendations;
  } catch (error) {
    console.error('Error generating recommendations:', error);
    throw error;
  }
}

export async function generateRoleSpecificRecommendations(
  role,
  videoAnalytics,
  videoData
) {
  try {
    // Generate recommendations tailored to specific roles
    const roleRecommendations = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate role-specific recommendations for ${role}:
      
Video Type: ${videoData.type}
Analytics: ${JSON.stringify(videoAnalytics)}

For ${role}, recommend improvements in:
1. Primary responsibilities performance
2. Role-specific KPIs
3. Stakeholder management
4. Decision-making quality
5. Communication effectiveness
6. Team dynamics impact`,
      response_json_schema: {
        type: 'object',
        properties: {
          role: { type: 'string' },
          recommendations: { type: 'array', items: { type: 'string' } },
          kpiImpact: { type: 'object' },
          estimatedImprovement: { type: 'number' },
        },
      },
    });

    return roleRecommendations;
  } catch (error) {
    console.error('Error generating role-specific recommendations:', error);
    throw error;
  }
}

export async function generateQuickWins(videoAnalytics, videoData) {
  try {
    // Generate quick, easy-to-implement improvements
    const quickWins = await base44.integrations.Core.InvokeLLM({
      prompt: `Identify quick wins for immediate improvement:
      
Type: ${videoData.type}
Engagement: ${videoAnalytics.engagement?.score}
Sentiment: ${videoAnalytics.sentiment?.overall}

Identify easy, high-impact changes that can be implemented for next meeting:
1. Quick wins (implementable within 1 hour prep)
2. Time investment required
3. Expected impact percentage
4. Implementation steps`,
      response_json_schema: {
        type: 'object',
        properties: {
          quickWins: { type: 'array', items: { type: 'object', properties: { win: { type: 'string' }, timeRequired: { type: 'string' }, expectedImpact: { type: 'number' }, steps: { type: 'array', items: { type: 'string' } } } } },
        },
      },
    });

    return quickWins;
  } catch (error) {
    console.error('Error generating quick wins:', error);
    throw error;
  }
}