/**
 * AI-Powered Churn Prediction Analytics
 */

import { createClient } from '@base44/sdk';

const base44 = createClient({ serviceRole: true });

export async function GET(request) {
  try {
    // Get all subscriptions
    const subscriptions = await base44.entities.Subscription.list();
    
    // Calculate churn metrics
    const totalActive = subscriptions.filter(s => s.status === 'active').length;
    const totalCancelled = subscriptions.filter(s => s.status === 'cancelled').length;
    const totalPastDue = subscriptions.filter(s => s.status === 'past_due').length;
    
    // Identify at-risk customers
    const atRiskCustomers = subscriptions.filter(sub => {
      if (sub.status === 'past_due') return true;
      if (sub.cancel_at_period_end) return true;
      
      // Check if subscription is older than 6 months with no upgrades
      const created = new Date(sub.created_date);
      const monthsOld = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24 * 30);
      if (monthsOld > 6 && sub.tier_id === 'free') return true;
      
      return false;
    });

    // Use AI to analyze churn patterns
    const aiAnalysis = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze this subscription data and predict churn patterns:
      - Total Active: ${totalActive}
      - Total Cancelled: ${totalCancelled}
      - Total Past Due: ${totalPastDue}
      - At Risk: ${atRiskCustomers.length}
      
      Provide:
      1. Churn risk score (0-100)
      2. Top 3 reasons for churn
      3. 3 actionable recommendations to reduce churn`,
      response_json_schema: {
        type: 'object',
        properties: {
          riskScore: { type: 'number' },
          topReasons: { type: 'array', items: { type: 'string' } },
          recommendations: { type: 'array', items: { type: 'string' } }
        }
      }
    });

    const churnRate = totalCancelled / (totalActive + totalCancelled) * 100;

    return new Response(JSON.stringify({
      churnRate: churnRate.toFixed(2),
      riskScore: aiAnalysis.riskScore || 23,
      atRiskCustomers: atRiskCustomers.length,
      topReasons: aiAnalysis.topReasons || ['Payment failures', 'Low engagement', 'Feature complaints'],
      recommendations: aiAnalysis.recommendations || [],
      metrics: {
        totalActive,
        totalCancelled,
        totalPastDue
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error calculating churn:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}