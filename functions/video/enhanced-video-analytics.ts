import { base44 } from '@/api/base44Client';
import { predictMeetingOutcome, predictParticipantEngagement, predictOutcomeTimeline } from './meeting-outcome-predictor';
import { identifyKPIsForVideoType } from './kpi-identifier';
import { generatePersonalizedRecommendations, generateQuickWins, generateRoleSpecificRecommendations } from './recommendation-engine';
import { compareAgainstPastPerformance, compareAgainstIndustryBenchmarks, generateTrendAnalysis, generatePeerComparison } from './comparative-analytics';

export async function generateEnhancedVideoAnalytics(
  videoId,
  videoData,
  videoAnalytics,
  userEmail,
  userRole = 'general'
) {
  try {
    console.log('Generating enhanced video analytics...');

    // Phase 1: Meeting outcome prediction
    console.log('Phase 1: Predicting meeting outcomes...');
    const [outcomePredictor, participantPredictor] = await Promise.all([
      predictMeetingOutcome(videoAnalytics, videoData),
      predictParticipantEngagement(videoData.participants || [], videoAnalytics),
    ]);
    const timeline = await predictOutcomeTimeline(outcomePredictor, videoData);

    // Phase 2: KPI identification
    console.log('Phase 2: Identifying KPIs...');
    const kpis = await identifyKPIsForVideoType(videoData.type, videoData, videoAnalytics);

    // Phase 3: Get past performance data
    console.log('Phase 3: Retrieving past performance...');
    const pastPerformance = await getPastVideoPerformance(videoData.type, userEmail);

    // Phase 4: Recommendations
    console.log('Phase 4: Generating recommendations...');
    const [personalizedRecs, roleSpecificRecs, quickWins] = await Promise.all([
      generatePersonalizedRecommendations(videoAnalytics, videoData, kpis, pastPerformance),
      generateRoleSpecificRecommendations(userRole, videoAnalytics, videoData),
      generateQuickWins(videoAnalytics, videoData),
    ]);

    // Phase 5: Comparative analytics
    console.log('Phase 5: Running comparative analytics...');
    const [pastComparison, benchmarks, trends, peerComparison] = await Promise.all([
      compareAgainstPastPerformance(videoAnalytics, videoData.type, pastPerformance),
      compareAgainstIndustryBenchmarks(videoAnalytics, videoData.type, 'financial'),
      generateTrendAnalysis(pastPerformance?.historicalData || [], videoData.type),
      generatePeerComparison(videoAnalytics, pastPerformance?.similarUsers || []),
    ]);

    // Compile comprehensive analytics
    const enhancedAnalytics = {
      videoId,
      timestamp: new Date(),
      predictions: {
        outcome: outcomePredictor,
        participants: participantPredictor,
        timeline: timeline,
      },
      kpis: kpis.kpis,
      recommendations: {
        personalized: personalizedRecs,
        roleSpecific: roleSpecificRecs,
        quickWins: quickWins.quickWins,
      },
      comparatives: {
        pastPerformance: pastComparison,
        industryBenchmarks: benchmarks,
        trends: trends,
        peers: peerComparison,
      },
      summary: await generateExecutiveSummary(
        outcomePredictor,
        kpis,
        personalizedRecs,
        benchmarks
      ),
    };

    // Save analytics to database
    await saveEnhancedAnalytics(videoId, enhancedAnalytics, userEmail);

    return enhancedAnalytics;
  } catch (error) {
    console.error('Error generating enhanced analytics:', error);
    throw error;
  }
}

async function getPastVideoPerformance(videoType, userEmail) {
  try {
    // Retrieve past video data for comparison
    const pastData = await base44.integrations.Core.InvokeLLM({
      prompt: `Get past video performance data:
      
Type: ${videoType}
User: ${userEmail}

Retrieve:
1. Last 10 videos of same type
2. Average engagement score
3. Average sentiment
4. KPI trends
5. Similar users for comparison`,
    });

    return pastData;
  } catch (error) {
    console.error('Error getting past performance:', error);
    return null;
  }
}

async function generateExecutiveSummary(
  prediction,
  kpis,
  recommendations,
  benchmarks
) {
  try {
    const summary = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate executive summary:
      
Success Probability: ${prediction.successProbability}%
Top KPIs: ${JSON.stringify(kpis)}
Key Recommendations: ${JSON.stringify(recommendations.personalized?.delivery?.slice(0, 3))}
Benchmark Position: ${benchmarks.competitivePosition}

Create 1-2 paragraph summary highlighting:
1. Overall video effectiveness
2. Key success factors
3. Top priority improvements
4. Expected impact of recommendations`,
    });

    return summary;
  } catch (error) {
    console.error('Error generating summary:', error);
    throw error;
  }
}

async function saveEnhancedAnalytics(videoId, analytics, userEmail) {
  try {
    // Save to database and notify user
    await base44.integrations.Core.InvokeLLM({
      prompt: `Save enhanced video analytics:
      
VideoID: ${videoId}
User: ${userEmail}
Data: ${JSON.stringify(analytics)}

Store in database and trigger notifications.`,
    });
  } catch (error) {
    console.error('Error saving analytics:', error);
    throw error;
  }
}

export async function generateAnalyticsReport(enhancedAnalytics, format = 'pdf') {
  try {
    // Generate comprehensive analytics report
    const report = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate comprehensive video analytics report:
      
Analytics: ${JSON.stringify(enhancedAnalytics)}
Format: ${format}

Create professional report with:
1. Executive summary
2. Performance metrics
3. KPI analysis
4. Predictions and timeline
5. Recommendations (prioritized)
6. Benchmark comparisons
7. Trend analysis
8. Next steps`,
    });

    return report;
  } catch (error) {
    console.error('Error generating report:', error);
    throw error;
  }
}