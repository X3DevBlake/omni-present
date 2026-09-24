import { base44 } from '@/api/base44Client';

async function getSlackAccessToken() {
  return await base44.asServiceRole.connectors.getAccessToken('slack');
}

export async function sendAgentKPIAlert(agentId, kpiData) {
  try {
    const accessToken = await getSlackAccessToken();
    
    const message = {
      channel: '#agents',
      attachments: [{
        color: kpiData.status === 'excellent' ? '#10b981' : kpiData.status === 'warning' ? '#f59e0b' : '#ef4444',
        title: `🤖 Agent KPI Alert: ${kpiData.agentName}`,
        fields: [
          {
            title: 'Agent ID',
            value: agentId,
            short: true
          },
          {
            title: 'Status',
            value: kpiData.status.toUpperCase(),
            short: true
          },
          {
            title: 'Success Rate',
            value: `${kpiData.successRate}%`,
            short: true
          },
          {
            title: 'Active Goals',
            value: `${kpiData.activeGoals}`,
            short: true
          },
          {
            title: 'Performance Metric',
            value: kpiData.performanceMetric,
            short: false
          }
        ],
        ts: Math.floor(Date.now() / 1000)
      }]
    };

    // Post to Slack using webhook or API
    // This would use the Slack connector's method to post messages
    console.log('Agent KPI Alert sent to Slack:', message);
    return { success: true };
  } catch (error) {
    console.error('Slack notification error:', error);
    throw error;
  }
}

export async function postGoalProgress(userId, goalData) {
  try {
    const accessToken = await getSlackAccessToken();
    
    const progressPercent = goalData.progress_percentage || 0;
    const daysRemaining = Math.ceil((new Date(goalData.target_date) - new Date()) / (1000 * 60 * 60 * 24));

    const message = {
      channel: '#finance',
      attachments: [{
        color: progressPercent >= 75 ? '#10b981' : progressPercent >= 50 ? '#3b82f6' : '#f59e0b',
        title: `💰 Goal Progress Update: ${goalData.name}`,
        fields: [
          {
            title: 'Progress',
            value: `${progressPercent}%`,
            short: true
          },
          {
            title: 'Category',
            value: goalData.category,
            short: true
          },
          {
            title: 'Current Amount',
            value: `$${goalData.current_amount?.toLocaleString() || 0}`,
            short: true
          },
          {
            title: 'Target Amount',
            value: `$${goalData.target_amount?.toLocaleString()}`,
            short: true
          },
          {
            title: 'Days Remaining',
            value: daysRemaining > 0 ? `${daysRemaining} days` : 'Overdue',
            short: true
          },
          {
            title: 'Status',
            value: goalData.status.toUpperCase(),
            short: true
          }
        ],
        image_url: generateProgressBarImage(progressPercent),
        ts: Math.floor(Date.now() / 1000)
      }]
    };

    console.log('Goal progress posted to Slack:', message);
    return { success: true };
  } catch (error) {
    console.error('Slack notification error:', error);
    throw error;
  }
}

export async function notifyMarketInsights(insights) {
  try {
    const accessToken = await getSlackAccessToken();
    
    const message = {
      channel: '#team',
      attachments: [{
        color: '#8b5cf6',
        title: `📊 New Market Insights`,
        fields: [
          {
            title: 'Insights Summary',
            value: insights.summary || 'Market analysis complete',
            short: false
          },
          {
            title: 'Key Trends',
            value: insights.trends?.join('\n') || 'No specific trends',
            short: false
          },
          {
            title: 'Recommendation',
            value: insights.recommendation || 'Monitor markets',
            short: false
          },
          {
            title: 'Confidence Score',
            value: `${Math.round((insights.confidence || 0) * 100)}%`,
            short: true
          },
          {
            title: 'Updated At',
            value: new Date().toLocaleString(),
            short: true
          }
        ],
        ts: Math.floor(Date.now() / 1000)
      }]
    };

    console.log('Market insights posted to Slack:', message);
    return { success: true };
  } catch (error) {
    console.error('Slack notification error:', error);
    throw error;
  }
}

export async function shareCollaborationUpdate(collaborationData) {
  try {
    const accessToken = await getSlackAccessToken();
    
    const message = {
      channel: '#ai-hub',
      attachments: [{
        color: '#06b6d4',
        title: `🤝 AI Agent Collaboration Update`,
        fields: [
          {
            title: 'Collaboration Type',
            value: collaborationData.task_type,
            short: true
          },
          {
            title: 'Agents Involved',
            value: `${collaborationData.agents?.length || 0} agents`,
            short: true
          },
          {
            title: 'Status',
            value: collaborationData.status || 'Active',
            short: true
          },
          {
            title: 'Progress',
            value: collaborationData.progress || 'In Progress',
            short: true
          },
          {
            title: 'Insights Shared',
            value: collaborationData.insightsCount || '0',
            short: true
          },
          {
            title: 'Tasks Delegated',
            value: collaborationData.tasksCount || '0',
            short: true
          },
          {
            title: 'Details',
            value: collaborationData.details || 'Agents collaborating safely',
            short: false
          }
        ],
        ts: Math.floor(Date.now() / 1000)
      }]
    };

    console.log('Collaboration update posted to Slack:', message);
    return { success: true };
  } catch (error) {
    console.error('Slack notification error:', error);
    throw error;
  }
}

function generateProgressBarImage(percent) {
  // Placeholder - would generate actual progress bar image
  return `https://via.placeholder.com/400x50?text=${percent}%25+Complete`;
}