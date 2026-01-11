import { base44 } from '@/api/base44Client';

export async function generateMonthlyStatement(userEmail, month) {
  // Gather all monthly data
  const transactions = await base44.entities.FinancialTransaction.filter({ user_email: userEmail });
  const trades = await base44.entities.TradeExecution.filter({ user_email: userEmail });
  const predictions = await base44.entities.LongTermPrediction.filter({ user_email: userEmail });

  // Filter for the month
  const monthStart = new Date(month + '-01');
  const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);

  const monthTransactions = transactions.filter(t => {
    const date = new Date(t.transaction_date);
    return date >= monthStart && date <= monthEnd;
  });

  const monthTrades = trades.filter(t => {
    const date = new Date(t.executed_at);
    return date >= monthStart && date <= monthEnd;
  });

  // Generate comprehensive statement
  const statementContent = await base44.integrations.Core.InvokeLLM({
    prompt: `Create comprehensive monthly financial statement for ${month}. Transactions: ${monthTransactions.length}, Trades: ${monthTrades.length}. Include summary, detailed breakdown, risk analysis, and recommendations. Format as professional financial statement.`,
    response_json_schema: {
      type: 'object',
      properties: {
        executive_summary: { type: 'string' },
        transaction_summary: { type: 'object' },
        trading_summary: { type: 'object' },
        risk_analysis: { type: 'object' },
        recommendations: { type: 'array', items: { type: 'string' } }
      }
    }
  });

  // In production, create Google Doc via Google Docs API
  const googleDocUrl = await createGoogleDoc(userEmail, month, statementContent);

  const statement = {
    user_email: userEmail,
    statement_month: month,
    google_doc_url: googleDocUrl,
    google_drive_id: 'drive_id_placeholder',
    summary: statementContent.executive_summary,
    transactions_count: monthTransactions.length,
    trades_executed: monthTrades.length,
    total_volume: monthTrades.reduce((sum, t) => sum + (t.total_value || 0), 0),
    profit_loss: monthTrades.reduce((sum, t) => sum + (t.profit_loss || 0), 0),
    risk_assessment: statementContent.risk_analysis,
    sent_at: new Date().toISOString(),
    status: 'completed'
  };

  const created = await base44.entities.MonthlyStatement.create(statement);

  // Send email with statement
  await base44.integrations.Core.SendEmail({
    to: userEmail,
    subject: `Monthly Financial Statement - ${month}`,
    body: `Your monthly statement is ready. View it here: ${googleDocUrl}`
  });

  return created;
}

async function createGoogleDoc(userEmail, month, content) {
  // In production, use Google Docs API to create document
  // For now, return placeholder URL
  return `https://docs.google.com/document/d/statement_${month}_${userEmail}`;
}

export async function scheduleMonthlyStatements() {
  // Get all users
  const users = await base44.entities.User.list();
  const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM

  for (const user of users) {
    try {
      await generateMonthlyStatement(user.email, currentMonth);
    } catch (error) {
      console.error(`Failed to generate statement for ${user.email}:`, error);
    }
  }
}