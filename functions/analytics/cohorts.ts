/**
 * Cohort Retention Analysis
 */

import { createClient } from '@base44/sdk';

const base44 = createClient({ serviceRole: true });

export async function GET(request) {
  try {
    const subscriptions = await base44.entities.Subscription.list();

    // Group by cohort (month of sign-up)
    const cohorts = {};
    
    subscriptions.forEach(sub => {
      const cohortMonth = new Date(sub.created_date).toISOString().substring(0, 7); // YYYY-MM
      
      if (!cohorts[cohortMonth]) {
        cohorts[cohortMonth] = {
          cohort: cohortMonth,
          signups: new Set(),
          retention: {}
        };
      }
      
      cohorts[cohortMonth].signups.add(sub.user_email);
      
      // Calculate months since sign-up
      const signupDate = new Date(sub.created_date);
      const currentDate = new Date();
      const monthsSince = Math.floor((currentDate - signupDate) / (1000 * 60 * 60 * 24 * 30));
      
      // Track if user is still active
      if (sub.status === 'active' || sub.status === 'past_due') {
        for (let m = 0; m <= monthsSince; m++) {
          if (!cohorts[cohortMonth].retention[`M${m}`]) {
            cohorts[cohortMonth].retention[`M${m}`] = new Set();
          }
          cohorts[cohortMonth].retention[`M${m}`].add(sub.user_email);
        }
      }
    });

    // Calculate retention percentages
    const cohortData = Object.values(cohorts).map(cohort => {
      const initialSize = cohort.signups.size;
      const retentionData = { cohort: cohort.cohort };
      
      Object.entries(cohort.retention).forEach(([month, users]) => {
        retentionData[month] = Math.round((users.size / initialSize) * 100);
      });
      
      return retentionData;
    }).sort((a, b) => b.cohort.localeCompare(a.cohort));

    // Calculate average retention curve
    const avgRetention = {};
    cohortData.forEach(cohort => {
      Object.entries(cohort).forEach(([key, value]) => {
        if (key !== 'cohort') {
          if (!avgRetention[key]) avgRetention[key] = [];
          avgRetention[key].push(value);
        }
      });
    });

    Object.keys(avgRetention).forEach(month => {
      const values = avgRetention[month];
      avgRetention[month] = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
    });

    return new Response(JSON.stringify({
      cohortData,
      avgRetention,
      insights: {
        bestCohort: cohortData[0]?.cohort,
        avgMonth3Retention: avgRetention['M3'] || 0,
        avgMonth6Retention: avgRetention['M6'] || 0
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error calculating cohorts:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}