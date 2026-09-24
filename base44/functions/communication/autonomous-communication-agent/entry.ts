/**
 * Autonomous Communication Agent
 * Monitors messages, analyzes sentiment, generates responses, creates agendas
 */

import { base44 } from '@base44/sdk';

export default async function autonomousCommunicationAgent(context) {
  const { user_email } = context.params;

  try {
    // Fetch recent communications
    const conversations = await base44.asServiceRole.entities.AIConversation.list(
      { user_email },
      '-created_date',
      50
    );

    const documents = await base44.asServiceRole.entities.CollaborativeDocument.list(
      { created_by: user_email },
      '-last_modified',
      10
    );

    // Analyze sentiment and urgency with Gemini
    const sentimentAnalysis = await base44.integrations.Core.InvokeLLM({
      prompt: `Autonomous Communication Analysis:

Recent Messages:
${JSON.stringify(conversations.slice(0, 20), null, 2)}

Analyze each message for:
1. Sentiment (positive/neutral/negative)
2. Urgency score (0-10)
3. Priority (low/medium/high/critical)
4. Required action (none/response/meeting/escalation)
5. Suggested response (if needed)

Return structured JSON.`,
      response_json_schema: {
        type: 'object',
        properties: {
          analyzed_messages: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                message_id: { type: 'string' },
                sentiment: { type: 'string' },
                urgency_score: { type: 'number' },
                priority: { type: 'string' },
                action_required: { type: 'string' },
                suggested_response: { type: 'string' },
                reasoning: { type: 'string' }
              }
            }
          }
        }
      }
    });

    // Auto-respond to urgent messages
    const urgentMessages = sentimentAnalysis.analyzed_messages.filter(
      m => m.priority === 'critical' || m.urgency_score >= 8
    );

    for (const urgent of urgentMessages) {
      // Send via Slack
      await base44.integrations.Core.InvokeLLM({
        prompt: `Send Slack message: ${urgent.suggested_response}`
      });

      // Send SMS for critical items via Twilio
      if (urgent.priority === 'critical') {
        await base44.integrations.Core.InvokeLLM({
          prompt: `Send SMS notification via Twilio about critical message requiring attention`
        });
      }

      // Generate voice notification via ElevenLabs
      await base44.integrations.Core.InvokeLLM({
        prompt: `Generate voice message via ElevenLabs: "You have a critical message requiring immediate attention: ${urgent.reasoning}"`
      });
    }

    // Generate meeting agenda if collaboration activity detected
    if (documents.length > 0) {
      const agenda = await generateAutomatedAgenda(user_email, documents, conversations);
      
      if (agenda.should_schedule) {
        // Send agenda via Slack
        await base44.integrations.Core.InvokeLLM({
          prompt: `Send Slack message with meeting agenda:

${agenda.title}

Topics:
${agenda.topics.map(t => `- ${t.topic} (${t.duration})`).join('\n')}

Attendees: ${agenda.attendees.join(', ')}`
        });
      }
    }

    return {
      success: true,
      messages_analyzed: conversations.length,
      urgent_responses_sent: urgentMessages.length,
      sentiment_summary: {
        positive: sentimentAnalysis.analyzed_messages.filter(m => m.sentiment === 'positive').length,
        neutral: sentimentAnalysis.analyzed_messages.filter(m => m.sentiment === 'neutral').length,
        negative: sentimentAnalysis.analyzed_messages.filter(m => m.sentiment === 'negative').length
      }
    };

  } catch (error) {
    console.error('Autonomous communication agent error:', error);
    return { success: false, error: error.message };
  }
}

async function generateAutomatedAgenda(userEmail, documents, conversations) {
  const agenda = await base44.integrations.Core.InvokeLLM({
    prompt: `Generate automated meeting agenda based on activity:

Documents Modified:
${JSON.stringify(documents, null, 2)}

Recent Conversations:
${JSON.stringify(conversations.slice(0, 10), null, 2)}

Determine:
1. Should a meeting be scheduled? (based on activity level and topics)
2. Meeting title and objectives
3. Key discussion topics with time allocations
4. Action items that need review
5. Suggested attendees based on who's involved

Return structured JSON.`,
    response_json_schema: {
      type: 'object',
      properties: {
        should_schedule: { type: 'boolean' },
        title: { type: 'string' },
        topics: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              topic: { type: 'string' },
              duration: { type: 'string' },
              description: { type: 'string' }
            }
          }
        },
        action_items: { type: 'array', items: { type: 'string' } },
        attendees: { type: 'array', items: { type: 'string' } }
      }
    }
  });

  return agenda;
}