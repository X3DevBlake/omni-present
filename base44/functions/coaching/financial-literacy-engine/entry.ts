import { base44 } from '@/api/base44Client';

/**
 * Financial Literacy Course Engine
 * AI-personalized courses based on knowledge gaps
 */

/**
 * Identify knowledge gaps from anomalies and reports
 */
export async function identifyKnowledgeGaps(userEmail, anomalyData, reportData, userProgress) {
  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Identify financial knowledge gaps:
      
      User: ${userEmail}
      Detected Anomalies: ${JSON.stringify(anomalyData)}
      Financial Reports: ${JSON.stringify(reportData)}
      Learning Progress: ${JSON.stringify(userProgress)}
      
      Identify:
      1. Gaps revealed by detected anomalies (e.g., subscription overload = budgeting gap)
      2. Portfolio management knowledge gaps
      3. Tax optimization gaps
      4. Investment strategy misunderstandings
      5. Behavioral finance gaps
      6. Goal planning knowledge gaps
      
      For each gap: topic, severity, evidence, recommended course`,
      response_json_schema: {
        type: 'object',
        properties: {
          gaps: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                topic: { type: 'string' },
                severity: { type: 'string' },
                evidence: { type: 'string' },
                recommendedCourse: { type: 'string' },
              },
            },
          },
          prioritizedTopics: { type: 'array', items: { type: 'string' } },
        },
      },
    });

    return response;
  } catch (error) {
    console.error('Error identifying knowledge gaps:', error);
    throw error;
  }
}

/**
 * Generate personalized course curriculum
 */
export async function generatePersonalizedCourse(userEmail, topic, knowledgeLevel) {
  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Create personalized financial literacy course:
      
      User: ${userEmail}
      Topic: ${topic}
      Current Knowledge Level: ${knowledgeLevel}
      
      Design course with:
      1. 5-7 progressive modules (beginner → advanced)
      2. Real-world examples relevant to user's situation
      3. Interactive quizzes after each module
      4. Practical assignments
      5. Key takeaways for immediate application
      6. Time estimates per module
      7. Resources for deeper learning
      8. Success metrics
      
      Adapt complexity and pacing to ${knowledgeLevel} level`,
      response_json_schema: {
        type: 'object',
        properties: {
          courseId: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          modules: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                number: { type: 'number' },
                title: { type: 'string' },
                description: { type: 'string' },
                timeEstimate: { type: 'string' },
                learningObjectives: { type: 'array', items: { type: 'string' } },
                content: { type: 'string' },
                quiz: { type: 'array', items: { type: 'object' } },
                assignment: { type: 'string' },
              },
            },
          },
          estimatedCompletionTime: { type: 'string' },
          certificateAwarded: { type: 'boolean' },
        },
      },
    });

    return response;
  } catch (error) {
    console.error('Error generating course:', error);
    throw error;
  }
}

/**
 * Get user's course progress
 */
export async function getCourseProgress(userEmail) {
  try {
    const progress = {
      userEmail,
      coursesStarted: 3,
      coursesCompleted: 1,
      currentCourses: [
        {
          id: 'course_1',
          title: 'Tax Optimization Fundamentals',
          progress: 65,
          modulesCompleted: 4,
          totalModules: 7,
          nextModule: 'Advanced Deductions',
        },
        {
          id: 'course_2',
          title: 'Portfolio Diversification Strategies',
          progress: 40,
          modulesCompleted: 2,
          totalModules: 6,
          nextModule: 'Asset Allocation Models',
        },
      ],
      completedCourses: [
        {
          id: 'course_3',
          title: 'Budgeting & Expense Management',
          completedAt: '2025-12-20',
          certificateUrl: '#',
          finalScore: 92,
        },
      ],
      estimatedCertificateDate: '2026-02-15',
    };

    return progress;
  } catch (error) {
    console.error('Error getting course progress:', error);
    throw error;
  }
}

export default {
  identifyKnowledgeGaps,
  generatePersonalizedCourse,
  getCourseProgress,
};