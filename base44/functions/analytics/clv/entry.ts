/**
 * Customer Lifetime Value Analysis & Forecasting
 */

import { createClient } from '@base44/sdk';

const base44 = createClient({ serviceRole: true });

export async function GET(request) {
  try {
    const subscriptions = await base44.entities.Subscription.list();
    const purchases = await base44.entities.Purchase.list();

    // Group by user and calculate CLV
    const userRevenue = {};
    
    subscriptions.forEach(sub => {
      if (!userRevenue[sub.user_email]) {
        userRevenue[sub.user_email] = {
          email: sub.user_email,
          totalRevenue: 0,
          subscriptionRevenue: 0,
          purchaseRevenue: 0,
          firstDate: sub.created_date,
          lastDate: sub.updated_date,
          isActive: sub.status === 'active'
        };
      }
      
      const months = Math.ceil((new Date(sub.current_period_end) - new Date(sub.current_period_start)) / (1000 * 60 * 60 * 24 * 30));
      const revenue = sub.amount * months;
      
      userRevenue[sub.user_email].subscriptionRevenue += revenue;
      userRevenue[sub.user_email].totalRevenue += revenue;
    });

    purchases.forEach(purchase => {
      if (!userRevenue[purchase.user_email]) {
        userRevenue[purchase.user_email] = {
          email: purchase.user_email,
          totalRevenue: 0,
          subscriptionRevenue: 0,
          purchaseRevenue: 0,
          firstDate: purchase.created_date,
          lastDate: purchase.created_date,
          isActive: false
        };
      }
      
      userRevenue[purchase.user_email].purchaseRevenue += purchase.total_amount;
      userRevenue[purchase.user_email].totalRevenue += purchase.total_amount;
    });

    // Calculate average CLV
    const users = Object.values(userRevenue);
    const avgCLV = users.reduce((sum, u) => sum + u.totalRevenue, 0) / users.length;
    
    // Calculate by cohort
    const cohorts = {};
    users.forEach(user => {
      const cohortKey = new Date(user.firstDate).toISOString().substring(0, 7); // YYYY-MM
      if (!cohorts[cohortKey]) {
        cohorts[cohortKey] = {
          cohort: cohortKey,
          users: 0,
          totalRevenue: 0,
          clv: 0
        };
      }
      cohorts[cohortKey].users++;
      cohorts[cohortKey].totalRevenue += user.totalRevenue;
    });

    Object.values(cohorts).forEach(cohort => {
      cohort.clv = cohort.totalRevenue / cohort.users;
      
      // Project future CLV (simple projection: current CLV * 1.5 for growth)
      cohort.projected = cohort.clv * 1.5;
    });

    // Use AI for advanced forecasting
    const aiProjection = await base44.integrations.Core.InvokeLLM({
      prompt: `Based on current average CLV of $${avgCLV.toFixed(2)} and cohort data, forecast the CLV for the next 12 months. Consider seasonal trends and growth patterns. Provide projected CLV values.`,
      response_json_schema: {
        type: 'object',
        properties: {
          projectedCLV: { type: 'number' },
          confidenceLevel: { type: 'number' },
          growthRate: { type: 'number' }
        }
      }
    });

    return new Response(JSON.stringify({
      avgCLV: avgCLV.toFixed(2),
      cohorts: Object.values(cohorts).sort((a, b) => b.cohort.localeCompare(a.cohort)),
      projection: aiProjection,
      topCustomers: users.sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 10)
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error calculating CLV:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}