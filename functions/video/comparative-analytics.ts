import { base44 } from '@/api/base44Client';

export async function compareAgainstPastPerformance(
  currentAnalytics,
  videoType,
  pastVideoData
) {
  try {
    // Compare current video against past performance of same type
    const comparison = await base44.integrations.Core.InvokeLLM({
      prompt: `Compare current video performance against historical data:
      
Current Performance:
- Engagement: ${currentAnalytics.engagement?.score}
- Sentiment: ${currentAnalytics.sentiment?.overall}
- Decision Density: ${currentAnalytics.performance?.decisionDensity}
- Action Items: ${currentAnalytics.performance?.actionItems}

Type: ${videoType}
Historical Average Engagement: ${pastVideoData?.avgEngagement || 'N/A'}
Historical Average Sentiment: ${pastVideoData?.avgSentiment || 'N/A'}
Number of Past Videos: ${pastVideoData?.count || 0}

Provide:
1. Performance vs historical average (%)
2. Improvement/decline trends
3. Key differences identified
4. What's working better/worse
5. Recommendation priorities`,
      response_json_schema: {
        type: 'object',
        properties: {
          engagementComparison: { type: 'number' },
          sentimentComparison: { type: 'number' },
          performanceTrend: { type: 'string' },
          improvements: { type: 'array', items: { type: 'string' } },
          declines: { type: 'array', items: { type: 'string' } },
          strengths: { type: 'array', items: { type: 'string' } },
          weaknesses: { type: 'array', items: { type: 'string' } },
        },
      },
    });

    return comparison;
  } catch (error) {
    console.error('Error comparing to past performance:', error);
    throw error;
  }
}

export async function compareAgainstIndustryBenchmarks(
  currentAnalytics,
  videoType,
  industry
) {
  try {
    // Compare against industry benchmarks
    const benchmarkComparison = await base44.integrations.Core.InvokeLLM({
      prompt: `Compare video performance against industry benchmarks:
      
Current Metrics:
- Engagement: ${currentAnalytics.engagement?.score}
- Sentiment: ${currentAnalytics.sentiment?.overall}
- Decision Quality: ${currentAnalytics.performance?.decisionQuality}
- Duration: ${currentAnalytics.duration}

Type: ${videoType}
Industry: ${industry}

Compare against industry standards:
1. Engagement percentile ranking
2. Sentiment benchmark
3. Duration appropriateness
4. KPI vs industry average
5. Competitive positioning
6. Areas of excellence
7. Areas needing improvement`,
      response_json_schema: {
        type: 'object',
        properties: {
          engagementPercentile: { type: 'number' },
          sentimentBenchmark: { type: 'string' },
          durationRating: { type: 'string' },
          kpiRanking: { type: 'object' },
          competitivePosition: { type: 'string' },
          excellenceAreas: { type: 'array', items: { type: 'string' } },
          improvementAreas: { type: 'array', items: { type: 'string' } },
        },
      },
    });

    return benchmarkComparison;
  } catch (error) {
    console.error('Error comparing to benchmarks:', error);
    throw error;
  }
}

export async function generateTrendAnalysis(historicalData, videoType) {
  try {
    // Analyze trends over time
    const trends = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze performance trends over time:
      
Type: ${videoType}
Historical Data: ${JSON.stringify(historicalData)}

Analyze:
1. Engagement trend (increasing/decreasing/stable)
2. Sentiment trend
3. Duration trend
4. Decision-making trend
5. Participant satisfaction trend
6. Seasonal patterns
7. Correlation with external factors`,
      response_json_schema: {
        type: 'object',
        properties: {
          engagementTrend: { type: 'string' },
          sentimentTrend: { type: 'string' },
          durationTrend: { type: 'string' },
          decisionTrend: { type: 'string' },
          satisfactionTrend: { type: 'string' },
          patterns: { type: 'array', items: { type: 'string' } },
          correlations: { type: 'array', items: { type: 'string' } },
          forecast: { type: 'object' },
        },
      },
    });

    return trends;
  } catch (error) {
    console.error('Error generating trend analysis:', error);
    throw error;
  }
}

export async function generatePeerComparison(userMetrics, similarPeers) {
  try {
    // Compare user performance against similar peers
    const peerComparison = await base44.integrations.Core.InvokeLLM({
      prompt: `Compare user performance against peer group:
      
User Metrics: ${JSON.stringify(userMetrics)}
Similar Peers: ${JSON.stringify(similarPeers)}

Provide:
1. User ranking vs peers
2. Top performing peers (learn from)
3. Areas where user leads
4. Areas where user lags
5. Peer learning opportunities
6. Competitive advantages
7. Catch-up priorities`,
      response_json_schema: {
        type: 'object',
        properties: {
          ranking: { type: 'number' },
          percentile: { type: 'number' },
          topPeers: { type: 'array', items: { type: 'string' } },
          leadingAreas: { type: 'array', items: { type: 'string' } },
          laggingAreas: { type: 'array', items: { type: 'string' } },
          learningOpportunities: { type: 'array', items: { type: 'string' } },
          advantages: { type: 'array', items: { type: 'string' } },
        },
      },
    });

    return peerComparison;
  } catch (error) {
    console.error('Error generating peer comparison:', error);
    throw error;
  }
}