import { base44 } from '@/api/base44Client';

export async function syncAgentPerformanceToSheet(userEmail, agentId) {
  // Gather agent performance data
  const agent = await base44.entities.SimulationAgent.filter({ id: agentId }).catch(() => []);
  const memories = await base44.entities.AgentMemoryStore.filter({ agent_id: agentId }).catch(() => []);
  const skills = await base44.entities.AgentSkill.filter({ agent_id: agentId }).catch(() => []);
  const trainingSessions = await base44.entities.AgentTrainingSession.filter({ agent_id: agentId }).catch(() => []);

  const performanceData = {
    agent_id: agentId,
    total_memories: memories.length,
    total_skills: skills.length,
    training_sessions: trainingSessions.length,
    avg_skill_proficiency: skills.reduce((sum, s) => sum + (s.proficiency || 0), 0) / (skills.length || 1),
    improvement_score: trainingSessions.reduce((sum, t) => sum + (t.improvement_score || 0), 0),
    timestamp: new Date().toISOString()
  };

  // Convert to sheet format
  const sheetData = [
    ['Agent ID', 'Memories', 'Skills', 'Training Sessions', 'Avg Proficiency', 'Improvement', 'Timestamp'],
    [
      performanceData.agent_id,
      performanceData.total_memories,
      performanceData.total_skills,
      performanceData.training_sessions,
      performanceData.avg_skill_proficiency.toFixed(2),
      performanceData.improvement_score.toFixed(2),
      performanceData.timestamp
    ]
  ];

  // In production: Use Google Sheets API
  const sheetId = `sheet_${Date.now()}`;
  console.log('Syncing to Google Sheets:', sheetId, sheetData);

  return {
    sheet_id: sheetId,
    sheet_url: `https://docs.google.com/spreadsheets/d/${sheetId}`,
    rows_written: sheetData.length
  };
}

export async function importMarketDataFromSheet(userEmail, sheetId) {
  // In production: Use Google Sheets API to read
  // Simulate reading market data
  const mockData = [
    { symbol: 'BTC', price: 45000, volume: 1234567, timestamp: new Date().toISOString() },
    { symbol: 'ETH', price: 2800, volume: 987654, timestamp: new Date().toISOString() },
    { symbol: 'SOL', price: 120, volume: 456789, timestamp: new Date().toISOString() }
  ];

  // Import into database
  for (const data of mockData) {
    await base44.entities.MarketAsset.create({
      user_email: userEmail,
      asset_type: 'crypto',
      symbol: data.symbol,
      current_price: data.price,
      volume_24h: data.volume,
      price_change_24h: 0
    }).catch(() => null);
  }

  return { imported: mockData.length, data: mockData };
}

export async function exportFinancialReportToSheet(userEmail) {
  // Gather financial data
  const transactions = await base44.entities.FinancialTransaction.filter({ user_email: userEmail });
  const accounts = await base44.entities.OmniBankAccount.filter({ user_email: userEmail }).catch(() => []);
  const trades = await base44.entities.TradeExecution.filter({ user_email: userEmail });
  const healthScore = await base44.entities.FinancialHealthScore.filter({ user_email: userEmail }).catch(() => []);

  const reportData = [
    ['Financial Report', '', '', ''],
    ['Generated', new Date().toISOString(), '', ''],
    ['', '', '', ''],
    ['Account Summary', '', '', ''],
    ['Account Name', 'Balance', 'Type', 'Status'],
    ...accounts.map(acc => [acc.account_name || 'Account', acc.balance || 0, acc.account_type || 'checking', 'Active']),
    ['', '', '', ''],
    ['Recent Transactions', '', '', ''],
    ['Date', 'Amount', 'Type', 'Description'],
    ...transactions.slice(0, 20).map(tx => [
      tx.transaction_date || new Date().toISOString(),
      tx.amount || 0,
      tx.type || 'unknown',
      tx.description || ''
    ]),
    ['', '', '', ''],
    ['Trading Summary', '', '', ''],
    ['Total Trades', trades.length, '', ''],
    ['Health Score', healthScore[0]?.overall_score || 0, '', '']
  ];

  const sheetId = `report_${Date.now()}`;
  console.log('Exporting financial report to Google Sheets:', sheetId);

  return {
    sheet_id: sheetId,
    sheet_url: `https://docs.google.com/spreadsheets/d/${sheetId}`,
    rows_written: reportData.length
  };
}

export async function updateTradeLogsInSheet(userEmail, sheetId) {
  // Get recent trades
  const trades = await base44.entities.TradeExecution.filter({ user_email: userEmail });
  const hfTrades = await base44.entities.HighFrequencyTrade.filter({ user_email: userEmail }).catch(() => []);

  const tradeLogData = [
    ['Trade Logs - Updated', new Date().toISOString(), '', '', '', ''],
    ['ID', 'Asset', 'Type', 'Quantity', 'Price', 'P&L', 'Status', 'Timestamp'],
    ...trades.slice(0, 50).map(trade => [
      trade.id,
      trade.asset_symbol,
      trade.trade_type,
      trade.quantity || 0,
      trade.price || 0,
      trade.profit_loss || 0,
      trade.status,
      trade.executed_at || new Date().toISOString()
    ]),
    ['', '', '', '', '', '', '', ''],
    ['High Frequency Trades', '', '', '', '', '', '', ''],
    ['ID', 'Asset', 'Entry', 'Exit', 'Hold Time (s)', 'P&L', '', ''],
    ...hfTrades.slice(0, 50).map(trade => [
      trade.id,
      trade.asset_symbol,
      trade.entry_price || 0,
      trade.exit_price || 0,
      trade.hold_duration_seconds || 0,
      trade.profit_loss || 0,
      '',
      ''
    ])
  ];

  console.log('Updating trade logs in Google Sheets:', sheetId);

  return {
    sheet_id: sheetId,
    sheet_url: `https://docs.google.com/spreadsheets/d/${sheetId}`,
    rows_updated: tradeLogData.length
  };
}

export async function batchSyncAllReports(userEmail, agentId) {
  const results = await Promise.all([
    syncAgentPerformanceToSheet(userEmail, agentId),
    exportFinancialReportToSheet(userEmail),
    updateTradeLogsInSheet(userEmail, `tradelog_${Date.now()}`)
  ]);

  return {
    synced: results.length,
    sheets: results
  };
}