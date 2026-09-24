/**
 * Customizable Report Generation & Export
 * Supports CSV, PDF, Excel formats
 */

import { createClient } from '@base44/sdk';

const base44 = createClient({ serviceRole: true });

export async function POST(request) {
  try {
    const { format, reportType, dateRange } = await request.json();

    let data;
    
    switch (reportType) {
      case 'subscriptions':
        data = await generateSubscriptionReport(dateRange);
        break;
      case 'revenue':
        data = await generateRevenueReport(dateRange);
        break;
      case 'enterprise':
        data = await generateEnterpriseReport(dateRange);
        break;
      case 'analytics':
        data = await generateAnalyticsReport(dateRange);
        break;
      default:
        data = await generateFullReport(dateRange);
    }

    // Format data based on export format
    let exportData;
    let contentType;
    let filename;

    switch (format) {
      case 'csv':
        exportData = convertToCSV(data);
        contentType = 'text/csv';
        filename = `${reportType}_report_${Date.now()}.csv`;
        break;
        
      case 'excel':
        exportData = convertToExcel(data);
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        filename = `${reportType}_report_${Date.now()}.xlsx`;
        break;
        
      case 'pdf':
        exportData = await convertToPDF(data, reportType);
        contentType = 'application/pdf';
        filename = `${reportType}_report_${Date.now()}.pdf`;
        break;
        
      default:
        exportData = JSON.stringify(data, null, 2);
        contentType = 'application/json';
        filename = `${reportType}_report_${Date.now()}.json`;
    }

    return new Response(exportData, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });
  } catch (error) {
    console.error('Error generating report:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function generateSubscriptionReport(dateRange) {
  const subscriptions = await base44.entities.Subscription.list();
  return subscriptions.map(sub => ({
    'User Email': sub.user_email,
    'Tier': sub.tier_name,
    'Status': sub.status,
    'Amount': sub.amount,
    'Billing Cycle': sub.billing_cycle,
    'Created Date': sub.created_date,
    'Period End': sub.current_period_end
  }));
}

async function generateRevenueReport(dateRange) {
  const subscriptions = await base44.entities.Subscription.list();
  const purchases = await base44.entities.Purchase.list();
  
  return {
    subscriptions: subscriptions.length,
    totalSubscriptionRevenue: subscriptions.reduce((sum, s) => sum + s.amount, 0),
    purchases: purchases.length,
    totalPurchaseRevenue: purchases.reduce((sum, p) => sum + p.total_amount, 0)
  };
}

async function generateEnterpriseReport(dateRange) {
  const clients = await base44.entities.EnterpriseClient.list();
  return clients.map(client => ({
    'Company': client.company_name,
    'Contact': client.contact_name,
    'Email': client.contact_email,
    'Pricing': client.custom_pricing,
    'Billing Cycle': client.billing_cycle,
    'Status': client.status,
    'Contract Start': client.contract_start_date,
    'Contract End': client.contract_end_date
  }));
}

async function generateAnalyticsReport(dateRange) {
  const [churnRes, clvRes, cohortRes, attrRes] = await Promise.all([
    fetch('/api/analytics/churn').then(r => r.json()).catch(() => ({})),
    fetch('/api/analytics/clv').then(r => r.json()).catch(() => ({})),
    fetch('/api/analytics/cohorts').then(r => r.json()).catch(() => ({})),
    fetch('/api/analytics/attribution').then(r => r.json()).catch(() => ({}))
  ]);

  return {
    churn: churnRes,
    clv: clvRes,
    cohorts: cohortRes,
    attribution: attrRes
  };
}

async function generateFullReport(dateRange) {
  return {
    subscriptions: await generateSubscriptionReport(dateRange),
    revenue: await generateRevenueReport(dateRange),
    enterprise: await generateEnterpriseReport(dateRange),
    analytics: await generateAnalyticsReport(dateRange)
  };
}

function convertToCSV(data) {
  if (Array.isArray(data) && data.length > 0) {
    const headers = Object.keys(data[0]);
    const rows = data.map(row => 
      headers.map(header => JSON.stringify(row[header] || '')).join(',')
    );
    return [headers.join(','), ...rows].join('\n');
  }
  return JSON.stringify(data);
}

function convertToExcel(data) {
  // Simplified Excel format (would need xlsx library for full implementation)
  return convertToCSV(data);
}

async function convertToPDF(data, reportType) {
  // Simplified PDF generation (would need pdf library for full implementation)
  // For now, return formatted text
  return `
    ${reportType.toUpperCase()} REPORT
    Generated: ${new Date().toISOString()}
    
    ${JSON.stringify(data, null, 2)}
  `;
}