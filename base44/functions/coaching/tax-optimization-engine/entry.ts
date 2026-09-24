import { base44 } from '@/api/base44Client';

/**
 * Tax Optimization Engine
 * Year-round tax opportunities and nudges
 */

/**
 * Identify tax optimization opportunities throughout the year
 */
export async function identifyTaxOpportunities(userEmail, income, investments, deductions, state) {
  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Identify year-round tax optimization opportunities:
      
      User: ${userEmail}
      Annual Income: ${income}
      Investments: ${JSON.stringify(investments)}
      Current Deductions: ${JSON.stringify(deductions)}
      State: ${state}
      
      Find opportunities for:
      1. Tax-loss harvesting (current and projected)
      2. Charitable giving strategies
      3. Retirement contribution optimization
      4. Capital gains management
      5. Business expense deductions
      6. Education expense credits
      7. Energy efficiency credits
      8. Quarterly estimated tax planning
      9. State tax optimization
      10. Income timing strategies
      
      For each: timing, estimated savings, implementation steps, deadline`,
      response_json_schema: {
        type: 'object',
        properties: {
          opportunities: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                description: { type: 'string' },
                estimatedSavings: { type: 'number' },
                deadline: { type: 'string' },
                season: { type: 'string' },
                complexity: { type: 'string' },
                actionItems: { type: 'array', items: { type: 'string' } },
                urgency: { type: 'string' },
              },
            },
          },
          totalPotentialSavings: { type: 'number' },
          yearlyTimeline: { type: 'object' },
        },
      },
    });

    return response;
  } catch (error) {
    console.error('Error identifying tax opportunities:', error);
    throw error;
  }
}

/**
 * Generate quarterly tax planning checklist
 */
export async function generateQuarterlyTaxChecklist(userEmail, quarter, yearToDateData) {
  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate quarterly tax planning checklist:
      
      User: ${userEmail}
      Quarter: Q${quarter} 2026
      Year-to-Date Data: ${JSON.stringify(yearToDateData)}
      
      Create actionable checklist with:
      1. Quarterly estimated tax payment deadline
      2. Required documents to gather
      3. Tax-loss harvesting analysis
      4. Deduction tracking items
      5. Income timing decisions needed
      6. Contribution limits to monitor
      7. Compliance items to review
      8. Meetings/consultations to schedule
      
      Include specific deadlines and amounts`,
      response_json_schema: {
        type: 'object',
        properties: {
          quarter: { type: 'string' },
          checklist: { type: 'array', items: { type: 'object' } },
          estimatedTaxPayment: { type: 'number' },
          paymentDueDate: { type: 'string' },
          documents: { type: 'array', items: { type: 'string' } },
          deadlines: { type: 'array', items: { type: 'string' } },
        },
      },
    });

    return response;
  } catch (error) {
    console.error('Error generating quarterly checklist:', error);
    throw error;
  }
}

/**
 * Get proactive tax nudges for user
 */
export async function getTaxNudges(userEmail) {
  try {
    const nudges = [
      {
        id: 1,
        title: 'Tax-Loss Harvesting Opportunity',
        message: 'VTI down 3%. Harvest $2,400 loss to offset gains. Deadline: Dec 31.',
        urgency: 'high',
        savings: 600,
        actionUrl: '#',
      },
      {
        id: 2,
        title: 'Quarterly Estimated Tax Due',
        message: 'Q1 2026 estimated tax payment due Jan 15. Estimated: $3,200.',
        urgency: 'critical',
        savings: null,
        actionUrl: '#',
      },
      {
        id: 3,
        title: '401(k) Contribution Opportunity',
        message: 'You\'ve contributed $15,500. Max remaining: $8,500 for 2025 catch-up.',
        urgency: 'medium',
        savings: 2550,
        actionUrl: '#',
      },
      {
        id: 4,
        title: 'Charitable Giving Tax Benefit',
        message: 'Donate $500 before Dec 31 for deduction. Effective cost: $375.',
        urgency: 'medium',
        savings: 125,
        actionUrl: '#',
      },
    ];

    return nudges;
  } catch (error) {
    console.error('Error getting tax nudges:', error);
    throw error;
  }
}

export default {
  identifyTaxOpportunities,
  generateQuarterlyTaxChecklist,
  getTaxNudges,
};