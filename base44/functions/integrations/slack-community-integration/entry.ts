import { base44 } from '@/api/base44Client';

/**
 * Slack Community Integration
 * Bridges Discord/Community forum with Slack for real-time discussions
 */

export async function initializeSlackCommunity(slackToken, channelName) {
  try {
    // Initialize Slack workspace connection
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Configure Slack integration for financial community:
      
      Channel: ${channelName}
      Features needed:
      1. Real-time discussion sync from forum to Slack
      2. Notifications for new expert responses
      3. Leaderboard updates in Slack
      4. Appointment reminders for advisor consultations
      5. Daily financial tips channel
      
      Provide configuration steps and webhook setup.`,
      response_json_schema: {
        type: 'object',
        properties: {
          slackSetupSteps: { type: 'array', items: { type: 'string' } },
          requiredScopes: { type: 'array', items: { type: 'string' } },
          webhookEndpoints: { type: 'object' },
          channelConfig: { type: 'object' },
        },
      },
    });

    return response;
  } catch (error) {
    console.error('Error initializing Slack community:', error);
    throw error;
  }
}

/**
 * Sync forum posts to Slack
 */
export async function syncForumToSlack(forumPost, slackChannelId) {
  try {
    const slackMessage = {
      channel: slackChannelId,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '💬 New Forum Discussion',
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${forumPost.title}*\nPosted by ${forumPost.author}`,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: forumPost.content || 'View full discussion →',
          },
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Reply on Forum',
              },
              value: `forum_${forumPost.id}`,
              action_id: `forum_reply_${forumPost.id}`,
            },
          ],
        },
      ],
    };

    // Send to Slack (would use actual Slack API)
    console.log('Slack message prepared:', slackMessage);
    return slackMessage;
  } catch (error) {
    console.error('Error syncing forum to Slack:', error);
    throw error;
  }
}

/**
 * Handle Slack messages and sync back to forum
 */
export async function handleSlackMessage(slackEvent, forumChannelId) {
  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Process Slack message for community forum:
      
      Message: ${slackEvent.text}
      User: ${slackEvent.user}
      Channel: ${slackEvent.channel}
      
      Convert this Slack message to a forum reply maintaining:
      1. User identity and reputation
      2. Message formatting
      3. Reply threading
      4. Media attachments
      
      Return formatted forum reply.`,
      response_json_schema: {
        type: 'object',
        properties: {
          forumReply: { type: 'string' },
          author: { type: 'string' },
          thread_id: { type: 'string' },
          attachments: { type: 'array', items: { type: 'string' } },
        },
      },
    });

    return response;
  } catch (error) {
    console.error('Error handling Slack message:', error);
    throw error;
  }
}

/**
 * Notify Slack of advisor availability
 */
export async function notifyAdvisorAvailability(advisor, slackChannelId) {
  try {
    const notification = {
      channel: slackChannelId,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `👨‍💼 *${advisor.name}* is now available for consultations\n$${advisor.hourlyRate}/hr • ${advisor.rating}⭐`,
          },
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Book Now',
              },
              url: `/advisors/${advisor.id}`,
              action_id: `book_advisor_${advisor.id}`,
            },
          ],
        },
      ],
    };

    console.log('Advisor availability notification prepared:', notification);
    return notification;
  } catch (error) {
    console.error('Error notifying advisor availability:', error);
    throw error;
  }
}

/**
 * Send leaderboard updates to Slack
 */
export async function sendLeaderboardUpdate(leaderboardData, slackChannelId) {
  try {
    const topUsers = leaderboardData.slice(0, 5);
    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '🏆 Weekly Leaderboard Update',
        },
      },
    ];

    topUsers.forEach((user, idx) => {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `${['🥇', '🥈', '🥉', '4️⃣', '5️⃣'][idx]} *${user.name}* - ${user.points.toLocaleString()} points (Level ${user.level})`,
        },
      });
    });

    const notification = {
      channel: slackChannelId,
      blocks,
    };

    console.log('Leaderboard update prepared:', notification);
    return notification;
  } catch (error) {
    console.error('Error sending leaderboard update:', error);
    throw error;
  }
}

export default {
  initializeSlackCommunity,
  syncForumToSlack,
  handleSlackMessage,
  notifyAdvisorAvailability,
  sendLeaderboardUpdate,
};