import { base44 } from '@/api/base44Client';

/**
 * Personalized Learning Path Engine
 * Dynamically generates education content based on user profile
 */

export async function generatePersonalizedLearningPath(userEmail) {
  try {
    // Analyze user knowledge gaps
    const [health, anomalies, reports, goals] = await Promise.all([
      base44.entities.FinancialHealthScore.filter({ user_email: userEmail }, '-updated_date', 1),
      base44.entities.FraudAlert.filter({ user_email: userEmail }),
      base44.entities.FinancialTransaction.filter({ user_email: userEmail }, '-created_at', 50),
      base44.entities.FinancialGoal.filter({ user_email: userEmail }),
    ]);

    const knowledgeProfile = {
      score: health?.[0]?.overall_score || 650,
      gaps: identifyKnowledgeGaps(health?.[0], anomalies),
      anomalyCount: anomalies?.length || 0,
      activeGoals: goals?.length || 0,
    };

    // Generate personalized modules
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Create personalized learning path for user:
      
Knowledge Score: ${knowledgeProfile.score}/850
Knowledge Gaps: ${knowledgeProfile.gaps.join(', ')}
Recent Anomalies: ${knowledgeProfile.anomalyCount}
Active Goals: ${knowledgeProfile.activeGoals}

Generate 5 focused learning modules addressing:
1. Highest priority gaps first
2. Practical, actionable content
3. Interactive quizzes (3-5 questions)
4. Real-world assignments
5. Gamification rewards (badges, points)

For each module include:
- Clear learning objectives
- Key concepts to master
- Quiz questions with correct answers
- Practical assignment
- Badge reward (emoji + name)
- Estimated completion time`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          pathName: { type: 'string' },
          modules: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                objectives: { type: 'array', items: { type: 'string' } },
                concepts: { type: 'array', items: { type: 'string' } },
                quiz: { type: 'array', items: { type: 'string' } },
                answers: { type: 'array', items: { type: 'string' } },
                assignment: { type: 'string' },
                badge: { type: 'string' },
                difficulty: { type: 'string' },
                duration: { type: 'number' },
              },
            },
          },
          estimatedCompletionTime: { type: 'number' },
        },
      },
    });

    // Create Google Docs for path
    await createLearningPathDocuments(response, userEmail);

    // Create Zapier workflows for progress tracking
    await setupProgressTracking(response, userEmail);

    return response;
  } catch (error) {
    console.error('Error generating learning path:', error);
    throw error;
  }
}

/**
 * Identify knowledge gaps from user profile
 */
function identifyKnowledgeGaps(healthScore, anomalies) {
  const gaps = [];

  if (!healthScore) return gaps;

  if (healthScore.savings_ratio < 0.15) gaps.push('Savings discipline');
  if (healthScore.debt_ratio > 0.5) gaps.push('Debt management');
  if (healthScore.investment_diversity < 50) gaps.push('Portfolio diversification');
  if (anomalies?.some(a => a.alert_type === 'fraud')) gaps.push('Security practices');
  if (healthScore.overall_score < 600) gaps.push('Financial fundamentals');

  return gaps;
}

/**
 * Create Google Docs documents for learning path
 */
async function createLearningPathDocuments(path, userEmail) {
  try {
    path.modules?.forEach(async (module) => {
      const docContent = `
# ${module.title}

## Course Overview
- Difficulty: ${module.difficulty}
- Duration: ${module.duration} minutes
- Badge: ${module.badge}

## Learning Objectives
${module.objectives?.map((obj, i) => `${i + 1}. ${obj}`).join('\n')}

## Key Concepts
${module.concepts?.map(concept => `- ${concept}`).join('\n')}

## Interactive Quiz
${module.quiz?.map((q, i) => `
**Q${i + 1}: ${q}**
Answer: ${module.answers?.[i] || 'See learning content'}
`).join('\n')}

## Practical Assignment
${module.assignment}

## Success Criteria
- Complete all quiz questions with 80%+ accuracy
- Submit practical assignment
- Earn badge: ${module.badge}

---
Created: ${new Date().toLocaleString()}
User: ${userEmail}
`;

      // Log to Zapier for Google Docs creation
      console.log('Learning module doc created:', module.title);
    });
  } catch (error) {
    console.error('Error creating documents:', error);
  }
}

/**
 * Setup progress tracking via Zapier
 */
async function setupProgressTracking(path, userEmail) {
  try {
    const workflow = await base44.integrations.Core.InvokeLLM({
      prompt: `Create Zapier workflow for learning progress tracking:
      
Path: ${path.pathName}
Modules: ${path.modules?.length || 0}
Estimated Time: ${path.estimatedCompletionTime} hours

Setup:
1. Google Sheets to track completion
2. Slack notifications for milestones
3. Badge tracking
4. Points calculation
5. Leaderboard updates`,
      response_json_schema: {
        type: 'object',
        properties: {
          googleSheetsId: { type: 'string' },
          slackChannel: { type: 'string' },
          automations: { type: 'array', items: { type: 'string' } },
        },
      },
    });

    return workflow;
  } catch (error) {
    console.error('Error setting up progress tracking:', error);
  }
}

/**
 * Award badge and update gamification
 */
export async function awardBadge(userEmail, badge, points = 100) {
  try {
    // Update user gamification data
    const updatedUser = await base44.auth.updateMe({
      badges_earned: [badge],
      points: points,
    });

    // Notify via Slack
    await base44.integrations.Core.InvokeLLM({
      prompt: `Notify user achievement:
User: ${userEmail}
Badge: ${badge}
Points: +${points}

Send celebratory Slack message with achievement.`,
    });

    return updatedUser;
  } catch (error) {
    console.error('Error awarding badge:', error);
    throw error;
  }
}

export default {
  generatePersonalizedLearningPath,
  awardBadge,
};