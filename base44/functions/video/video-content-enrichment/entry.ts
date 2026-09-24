import { base44 } from '@/api/base44Client';

export async function enrichVideoContent(videoId, transcript, metadata) {
  try {
    // Orchestrate all enrichment tasks in parallel
    const [moments, summary, tags, actionItems] = await Promise.all([
      extractKeyMoments(videoId, transcript),
      generateVideoSummary(transcript, metadata),
      suggestTagsAndKeywords(transcript, metadata),
      extractActionItems(transcript, metadata),
    ]);

    const enrichedData = {
      videoId,
      moments,
      summary,
      tags,
      actionItems,
      enrichedAt: new Date(),
      confidence: calculateConfidence({ moments, summary, tags, actionItems }),
    };

    // Save enriched data
    await saveEnrichedContent(videoId, enrichedData);

    return enrichedData;
  } catch (error) {
    console.error('Error enriching video:', error);
    throw error;
  }
}

async function extractKeyMoments(videoId, transcript) {
  try {
    // Generate timestamped key moments from transcript
    const moments = await base44.integrations.Core.InvokeLLM({
      prompt: `Extract key moments from video transcript:
      
VideoID: ${videoId}
Transcript: ${transcript}

Identify 5-8 key moments with:
1. Timestamp (seconds)
2. Moment title
3. Description
4. Relevance score (0-100)
5. Category (insight/decision/action/question/discussion)
6. Key participants mentioned`,
      response_json_schema: {
        type: 'object',
        properties: {
          moments: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                timestamp: { type: 'number' },
                title: { type: 'string' },
                description: { type: 'string' },
                relevance: { type: 'number' },
                category: { type: 'string' },
                participants: { type: 'array', items: { type: 'string' } },
              },
            },
          },
        },
      },
    });

    return moments.moments;
  } catch (error) {
    console.error('Error extracting moments:', error);
    throw error;
  }
}

async function generateVideoSummary(transcript, metadata) {
  try {
    // Create concise summary with multiple lengths
    const summary = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate video summary:
      
Title: ${metadata?.title}
Duration: ${metadata?.duration}
Transcript: ${transcript}

Create:
1. One-line summary (max 15 words)
2. Short summary (50 words)
3. Medium summary (150 words)
4. Executive summary (300 words)
5. Key takeaways (5 bullet points)`,
      response_json_schema: {
        type: 'object',
        properties: {
          oneLine: { type: 'string' },
          short: { type: 'string' },
          medium: { type: 'string' },
          executive: { type: 'string' },
          takeaways: { type: 'array', items: { type: 'string' } },
        },
      },
    });

    return summary;
  } catch (error) {
    console.error('Error generating summary:', error);
    throw error;
  }
}

async function suggestTagsAndKeywords(transcript, metadata) {
  try {
    // Suggest tags and keywords for discoverability
    const tags = await base44.integrations.Core.InvokeLLM({
      prompt: `Suggest tags and keywords:
      
Title: ${metadata?.title}
Type: ${metadata?.type}
Transcript: ${transcript}

Generate:
1. Primary tags (5-7) - main topics
2. Secondary tags (5-7) - related topics
3. Keywords (10-15) - for search
4. Category tags - industry/function
5. Skill tags - skills discussed/needed
6. Sentiment tags - tone/mood
7. Action tags - if action items present`,
      response_json_schema: {
        type: 'object',
        properties: {
          primary: { type: 'array', items: { type: 'string' } },
          secondary: { type: 'array', items: { type: 'string' } },
          keywords: { type: 'array', items: { type: 'string' } },
          categories: { type: 'array', items: { type: 'string' } },
          skills: { type: 'array', items: { type: 'string' } },
          sentiment: { type: 'array', items: { type: 'string' } },
          actions: { type: 'array', items: { type: 'string' } },
        },
      },
    });

    return tags;
  } catch (error) {
    console.error('Error suggesting tags:', error);
    throw error;
  }
}

async function extractActionItems(transcript, metadata) {
  try {
    // Extract action items and decisions
    const actionItems = await base44.integrations.Core.InvokeLLM({
      prompt: `Extract action items and decisions:
      
Title: ${metadata?.title}
Participants: ${metadata?.participants?.join(', ')}
Transcript: ${transcript}

Extract:
1. Action items with:
   - Description
   - Owner/assignee
   - Due date (if mentioned)
   - Priority (high/medium/low)
   - Related timestamp
2. Decisions made with:
   - Decision statement
   - Rationale
   - Timeline
   - Owner
   - Related timestamp
3. Open questions with:
   - Question
   - Owner
   - Follow-up needed
4. Success metrics mentioned`,
      response_json_schema: {
        type: 'object',
        properties: {
          actionItems: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                description: { type: 'string' },
                owner: { type: 'string' },
                dueDate: { type: 'string' },
                priority: { type: 'string' },
                timestamp: { type: 'number' },
              },
            },
          },
          decisions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                decision: { type: 'string' },
                rationale: { type: 'string' },
                owner: { type: 'string' },
                timestamp: { type: 'number' },
              },
            },
          },
          openQuestions: { type: 'array', items: { type: 'string' } },
          metrics: { type: 'array', items: { type: 'string' } },
        },
      },
    });

    return actionItems;
  } catch (error) {
    console.error('Error extracting action items:', error);
    throw error;
  }
}

async function saveEnrichedContent(videoId, enrichedData) {
  try {
    await base44.integrations.Core.InvokeLLM({
      prompt: `Save enriched video content:
      
VideoID: ${videoId}
Data: ${JSON.stringify(enrichedData)}

Store in database with:
1. Timestamped moments
2. Summaries at all levels
3. Tags and keywords
4. Action items with ownership
5. Confidence scores`,
    });
  } catch (error) {
    console.error('Error saving enriched content:', error);
    throw error;
  }
}

function calculateConfidence(enrichedData) {
  let score = 100;
  if (!enrichedData.moments || enrichedData.moments.length === 0) score -= 20;
  if (!enrichedData.summary) score -= 15;
  if (!enrichedData.tags) score -= 15;
  if (!enrichedData.actionItems) score -= 10;
  return Math.max(score, 0);
}

export async function linkActionItemsToTaskManagement(actionItems, userEmail) {
  try {
    // Link extracted action items to task management systems
    const taskLinks = await Promise.all(
      actionItems.actionItems.map(item =>
        createTaskFromActionItem(item, userEmail)
      )
    );

    return taskLinks;
  } catch (error) {
    console.error('Error linking to task management:', error);
    throw error;
  }
}

async function createTaskFromActionItem(actionItem, userEmail) {
  try {
    const task = await base44.integrations.Core.InvokeLLM({
      prompt: `Create task from action item:
      
Item: ${actionItem.description}
Owner: ${actionItem.owner}
DueDate: ${actionItem.dueDate}
Priority: ${actionItem.priority}
User: ${userEmail}

Create task in system with:
1. Title from item description
2. Assigned to owner
3. Due date set
4. Priority level
5. Video reference/link
6. Timestamp link back to video`,
    });

    return task;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
}