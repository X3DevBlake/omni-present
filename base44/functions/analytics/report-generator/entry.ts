import { base44 } from '@/api/base44Client';

export async function generateComprehensiveAnalyticsReport(userEmail, analyticsData, format = 'googledocs') {
  try {
    const report = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate comprehensive analytics report for ${userEmail}:
      
Format: ${format}
Data: ${JSON.stringify(analyticsData)}

Create professional report with:
1. Executive Summary (1-2 pages)
   - Key metrics highlights
   - Performance overview
   - Critical insights
   
2. Video Analytics Section (2-3 pages)
   - Engagement metrics with charts
   - KPI performance by video type
   - Top performing content
   - Audience insights
   
3. DeFi Portfolio Analysis (2-3 pages)
   - Current portfolio composition
   - Yield farming performance
   - Risk assessment
   - Top opportunities
   
4. User Engagement Report (1-2 pages)
   - Active user metrics
   - Session analytics
   - Feature usage patterns
   - Retention analysis
   
5. Cross-Platform Insights (2-3 pages)
   - Gemini AI predictions
   - Trend analysis
   - Anomalies detected
   - Optimization recommendations
   
6. Financial Summary (1 page)
   - Revenue metrics
   - Cost analysis
   - ROI calculations
   
7. Action Items & Recommendations (1-2 pages)
   - Immediate actions
   - 30-day plan
   - Strategic recommendations
   
8. Technical Appendix (1-2 pages)
   - Data sources and methodology
   - Calculation details
   - API performance metrics`,
      response_json_schema: {
        type: 'object',
        properties: {
          reportId: { type: 'string' },
          docLink: { type: 'string' },
          pages: { type: 'number' },
          status: { type: 'string' },
          generatedAt: { type: 'string' },
        },
      },
    });

    // Save report metadata
    await saveReportMetadata(userEmail, report);

    // Send notification
    await base44.integrations.Core.InvokeLLM({
      prompt: `Send report generation confirmation:
      
User: ${userEmail}
ReportLink: ${report.docLink}

Notify user via email and Slack that report is ready.`,
    });

    return report;
  } catch (error) {
    console.error('Error generating report:', error);
    throw error;
  }
}

async function saveReportMetadata(userEmail, report) {
  try {
    await base44.integrations.Core.InvokeLLM({
      prompt: `Save report metadata to database:
      
User: ${userEmail}
ReportID: ${report.reportId}
DocLink: ${report.docLink}
Pages: ${report.pages}
GeneratedAt: ${report.generatedAt}

Store for future reference and tracking.`,
    });
  } catch (error) {
    console.error('Error saving metadata:', error);
  }
}

export async function scheduleMonthlyReportGeneration(userEmail) {
  try {
    // Create Zapier workflow for monthly reports
    const workflow = await base44.integrations.Core.InvokeLLM({
      prompt: `Create monthly report generation workflow for ${userEmail}:
      
Setup Zapier automation:
1. Trigger: First day of each month at 9 AM
2. Action: Aggregate all analytics data
3. Action: Generate comprehensive report
4. Action: Send to Google Docs
5. Action: Email report link to user
6. Action: Log to Snowflake

Include error handling and retry logic.`,
    });

    return workflow;
  } catch (error) {
    console.error('Error scheduling reports:', error);
    throw error;
  }
}

export async function exportAnalyticsToCSV(analyticsData, filename = 'analytics-export.csv') {
  try {
    const csv = await base44.integrations.Core.InvokeLLM({
      prompt: `Export analytics data to CSV:
      
Data: ${JSON.stringify(analyticsData)}
Filename: ${filename}

Create well-formatted CSV with:
- Headers
- Timestamps
- Numeric precision
- Proper escaping`,
    });

    return csv;
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    throw error;
  }
}

export async function generateCustomAnalyticsReport(userEmail, customConfig) {
  try {
    const report = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate custom analytics report for ${userEmail}:
      
Config: ${JSON.stringify(customConfig)}

Create report with:
- Selected sections from config
- Custom date ranges
- Specified metrics
- User-chosen visualizations`,
    });

    return report;
  } catch (error) {
    console.error('Error generating custom report:', error);
    throw error;
  }
}

export async function shareReportWithTeam(reportId, teamEmails) {
  try {
    const share = await base44.integrations.Core.InvokeLLM({
      prompt: `Share analytics report with team:
      
ReportID: ${reportId}
Team: ${teamEmails.join(', ')}

Share Google Docs with edit/view permissions as configured.`,
    });

    return share;
  } catch (error) {
    console.error('Error sharing report:', error);
    throw error;
  }
}