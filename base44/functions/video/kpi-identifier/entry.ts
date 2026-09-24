import { base44 } from '@/api/base44Client';

export async function identifyKPIsForVideoType(videoType, videoData, analytics) {
  try {
    // Automatically identify KPIs based on video type
    const kpiMap = {
      sales_call: identifySalesKPIs,
      training: identifyTrainingKPIs,
      consultation: identifyConsultationKPIs,
      casual: identifyCasualKPIs,
      standup: identifyStandupKPIs,
      executive: identifyExecutiveKPIs,
    };

    const identifyFunc = kpiMap[videoType] || identifyGenericKPIs;
    const kpis = await identifyFunc(videoData, analytics);

    return kpis;
  } catch (error) {
    console.error('Error identifying KPIs:', error);
    throw error;
  }
}

async function identifySalesKPIs(videoData, analytics) {
  try {
    const kpis = await base44.integrations.Core.InvokeLLM({
      prompt: `Identify KPIs for sales call:
      
Duration: ${videoData.duration}
Participants: ${videoData.participants?.join(', ')}
Engagement: ${analytics.engagement?.score}
Sentiment: ${analytics.sentiment?.overall}

Calculate:
1. Pitch clarity score (0-100)
2. Objection handling quality (0-100)
3. Close probability (0-100)
4. Deal size potential ($)
5. Sales cycle acceleration (days)
6. Follow-up probability (%)
7. Discovery completeness (%)`,
      response_json_schema: {
        type: 'object',
        properties: {
          pitchClarity: { type: 'number' },
          objectionHandling: { type: 'number' },
          closeProbability: { type: 'number' },
          dealPotential: { type: 'number' },
          cycleAcceleration: { type: 'number' },
          followUpProb: { type: 'number' },
          discoveryCompleteness: { type: 'number' },
        },
      },
    });

    return { type: 'sales_call', kpis };
  } catch (error) {
    console.error('Error identifying sales KPIs:', error);
    throw error;
  }
}

async function identifyTrainingKPIs(videoData, analytics) {
  try {
    const kpis = await base44.integrations.Core.InvokeLLM({
      prompt: `Identify KPIs for training session:
      
Duration: ${videoData.duration}
Participants: ${videoData.participants?.length}
Engagement: ${analytics.engagement?.score}
Topics Covered: ${videoData.topics?.join(', ')}

Calculate:
1. Content retention potential (%)
2. Participant engagement (0-100)
3. Knowledge transfer effectiveness (%)
4. Question quality (0-100)
5. Material clarity (0-100)
6. Practical applicability (0-100)
7. Follow-up training need (%)`,
      response_json_schema: {
        type: 'object',
        properties: {
          retentionPotential: { type: 'number' },
          engagement: { type: 'number' },
          knowledgeTransfer: { type: 'number' },
          questionQuality: { type: 'number' },
          materialClarity: { type: 'number' },
          applicability: { type: 'number' },
          followUpNeed: { type: 'number' },
        },
      },
    });

    return { type: 'training', kpis };
  } catch (error) {
    console.error('Error identifying training KPIs:', error);
    throw error;
  }
}

async function identifyConsultationKPIs(videoData, analytics) {
  try {
    const kpis = await base44.integrations.Core.InvokeLLM({
      prompt: `Identify KPIs for client consultation:
      
Duration: ${videoData.duration}
Client Sentiment: ${analytics.sentiment?.overall}
Engagement: ${analytics.engagement?.score}
Issues Discussed: ${videoData.topics?.join(', ')}

Calculate:
1. Client satisfaction (0-100)
2. Problem understanding (%)
3. Solution clarity (0-100)
4. Actionability of recommendations (%)
5. Trust building (0-100)
6. Expected client retention (%)
7. Upsell opportunity (0-100)`,
      response_json_schema: {
        type: 'object',
        properties: {
          satisfaction: { type: 'number' },
          problemUnderstanding: { type: 'number' },
          solutionClarity: { type: 'number' },
          actionability: { type: 'number' },
          trustBuilding: { type: 'number' },
          retention: { type: 'number' },
          upsellOpportunity: { type: 'number' },
        },
      },
    });

    return { type: 'consultation', kpis };
  } catch (error) {
    console.error('Error identifying consultation KPIs:', error);
    throw error;
  }
}

async function identifyStandupKPIs(videoData, analytics) {
  try {
    const kpis = await base44.integrations.Core.InvokeLLM({
      prompt: `Identify KPIs for standup meeting:
      
Duration: ${videoData.duration}
Team Size: ${videoData.participants?.length}
Engagement: ${analytics.engagement?.score}

Calculate:
1. Status clarity (0-100)
2. Blocker identification (0-100)
3. Action item clarity (0-100)
4. Meeting efficiency (%)
5. Time-to-insight (seconds)
6. Team alignment (0-100)
7. Risk visibility (0-100)`,
      response_json_schema: {
        type: 'object',
        properties: {
          statusClarity: { type: 'number' },
          blockerID: { type: 'number' },
          actionClarity: { type: 'number' },
          efficiency: { type: 'number' },
          timeToInsight: { type: 'number' },
          teamAlignment: { type: 'number' },
          riskVisibility: { type: 'number' },
        },
      },
    });

    return { type: 'standup', kpis };
  } catch (error) {
    console.error('Error identifying standup KPIs:', error);
    throw error;
  }
}

async function identifyExecutiveKPIs(videoData, analytics) {
  try {
    const kpis = await base44.integrations.Core.InvokeLLM({
      prompt: `Identify KPIs for executive meeting:
      
Duration: ${videoData.duration}
Executives: ${videoData.participants?.length}
Decisions Made: ${analytics.performance?.actionItems}
Engagement: ${analytics.engagement?.score}

Calculate:
1. Decision quality (0-100)
2. Strategic alignment (%)
3. Resource clarity (0-100)
4. Risk assessment completeness (%)
5. Timeline commitment (%)
6. Executive engagement (0-100)
7. Board readiness (0-100)`,
      response_json_schema: {
        type: 'object',
        properties: {
          decisionQuality: { type: 'number' },
          strategicAlignment: { type: 'number' },
          resourceClarity: { type: 'number' },
          riskCompleteness: { type: 'number' },
          timelineCommitment: { type: 'number' },
          engagement: { type: 'number' },
          boardReadiness: { type: 'number' },
        },
      },
    });

    return { type: 'executive', kpis };
  } catch (error) {
    console.error('Error identifying executive KPIs:', error);
    throw error;
  }
}

async function identifyCasualKPIs(videoData, analytics) {
  try {
    const kpis = await base44.integrations.Core.InvokeLLM({
      prompt: `Identify KPIs for casual conversation:
      
Duration: ${videoData.duration}
Participants: ${videoData.participants?.length}
Sentiment: ${analytics.sentiment?.overall}
Engagement: ${analytics.engagement?.score}

Calculate:
1. Enjoyment level (0-100)
2. Relationship building (0-100)
3. Information sharing (%)
4. Team morale impact (0-100)
5. Connection quality (0-100)`,
      response_json_schema: {
        type: 'object',
        properties: {
          enjoyment: { type: 'number' },
          relationshipBuilding: { type: 'number' },
          infoSharing: { type: 'number' },
          moralImpact: { type: 'number' },
          connectionQuality: { type: 'number' },
        },
      },
    });

    return { type: 'casual', kpis };
  } catch (error) {
    console.error('Error identifying casual KPIs:', error);
    throw error;
  }
}

async function identifyGenericKPIs(videoData, analytics) {
  try {
    const kpis = await base44.integrations.Core.InvokeLLM({
      prompt: `Identify generic KPIs for video:
      
Duration: ${videoData.duration}
Engagement: ${analytics.engagement?.score}
Sentiment: ${analytics.sentiment?.overall}

Calculate:
1. Overall effectiveness (0-100)
2. Engagement (0-100)
3. Productivity (0-100)
4. Sentiment (0-100)
5. Action density (0-100)`,
      response_json_schema: {
        type: 'object',
        properties: {
          effectiveness: { type: 'number' },
          engagement: { type: 'number' },
          productivity: { type: 'number' },
          sentiment: { type: 'number' },
          actionDensity: { type: 'number' },
        },
      },
    });

    return { type: 'generic', kpis };
  } catch (error) {
    console.error('Error identifying generic KPIs:', error);
    throw error;
  }
}