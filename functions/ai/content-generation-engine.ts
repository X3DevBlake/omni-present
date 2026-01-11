import { base44 } from '@/api/base44Client';

/**
 * Automated Content Generation Engine
 * Reports, summaries, templates based on user specifications
 */

export async function generateReport(reportType, data, template) {
  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate a professional ${reportType} report:
      
      Data: ${JSON.stringify(data)}
      Template: ${JSON.stringify(template)}
      
      Create:
      1. Executive summary
      2. Key findings and insights
      3. Detailed analysis sections
      4. Visualizations/charts (descriptions)
      5. Recommendations
      6. Appendix with supporting data
      
      Use template structure: ${template?.structure || 'Standard professional format'}
      Tone: ${template?.tone || 'Professional'}.
      Length: ${template?.length || 'Comprehensive'}`,
      response_json_schema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          executiveSummary: { type: 'string' },
          sections: { type: 'array', items: { type: 'object' } },
          recommendations: { type: 'array', items: { type: 'string' } },
          metadata: { type: 'object' },
        },
      },
    });

    return response;
  } catch (error) {
    console.error('Error generating report:', error);
    throw error;
  }
}

/**
 * Generate summary from detailed data
 */
export async function generateSummary(sourceData, summaryType, length = 'medium') {
  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Create a ${length} ${summaryType} summary:
      
      Source Data: ${JSON.stringify(sourceData)}
      
      Produce:
      1. Key points (bullet format)
      2. Critical insights
      3. Action items
      4. Context for decision-making
      
      Length: ${length === 'short' ? '2-3 paragraphs' : length === 'medium' ? '4-6 paragraphs' : '1-2 pages'}`,
      response_json_schema: {
        type: 'object',
        properties: {
          summary: { type: 'string' },
          keyPoints: { type: 'array', items: { type: 'string' } },
          criticalInsights: { type: 'array', items: { type: 'string' } },
          actionItems: { type: 'array', items: { type: 'string' } },
        },
      },
    });

    return response;
  } catch (error) {
    console.error('Error generating summary:', error);
    throw error;
  }
}

/**
 * Create custom content templates
 */
export async function createContentTemplate(templateName, specification) {
  try {
    const template = {
      id: 'template_' + Date.now(),
      name: templateName,
      type: specification.type, // 'report', 'summary', 'email', 'briefing'
      structure: specification.structure,
      tone: specification.tone || 'professional',
      sections: specification.sections || [],
      variables: specification.variables || [],
      createdAt: new Date().toISOString(),
      usage: 0,
    };

    console.log('Template created:', template);
    return template;
  } catch (error) {
    console.error('Error creating template:', error);
    throw error;
  }
}

/**
 * Generate content using custom template
 */
export async function generateFromTemplate(templateId, data) {
  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate content using custom template:
      
      Template ID: ${templateId}
      Data: ${JSON.stringify(data)}
      
      Fill template sections with provided data, maintaining structure and tone`,
      response_json_schema: {
        type: 'object',
        properties: {
          content: { type: 'string' },
          sections: { type: 'array', items: { type: 'string' } },
          metadata: { type: 'object' },
        },
      },
    });

    return response;
  } catch (error) {
    console.error('Error generating from template:', error);
    throw error;
  }
}

export default {
  generateReport,
  generateSummary,
  createContentTemplate,
  generateFromTemplate,
};