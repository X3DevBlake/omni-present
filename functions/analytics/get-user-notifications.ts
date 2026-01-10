import { base44 } from '@/api/base44Client';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userEmail, limit = 20 } = req.query;

    if (!userEmail) {
      return res.status(400).json({ error: 'User email is required' });
    }

    // Aggregate notifications from various sources
    const notifications = [];

    // Market alerts
    const markets = await base44.entities.MarketAsset.list().catch(() => []);
    const priceChangeAlerts = markets
      .filter(m => Math.abs(m.price_change_24h) > 5)
      .map(m => ({
        id: `market-${m.id}`,
        type: 'price_alert',
        title: `${m.symbol} moved ${m.price_change_24h > 0 ? '📈' : '📉'} ${Math.abs(m.price_change_24h).toFixed(2)}%`,
        timestamp: new Date(m.last_updated),
        read: false,
        action: { page: 'World', id: m.id }
      }));

    // Financial goal alerts
    const goals = await base44.entities.FinancialGoal.filter({ user_email: userEmail }).catch(() => []);
    const goalAlerts = goals
      .filter(g => g.progress_percentage > 75 && g.status === 'active')
      .map(g => ({
        id: `goal-${g.id}`,
        type: 'goal_milestone',
        title: `🎉 Goal "${g.name}" is ${g.progress_percentage.toFixed(0)}% complete!`,
        timestamp: new Date(g.updated_date),
        read: false,
        action: { page: 'FinancialGoal', id: g.id }
      }));

    // Combine and sort by timestamp
    notifications.push(...priceChangeAlerts, ...goalAlerts);
    notifications.sort((a, b) => b.timestamp - a.timestamp);

    res.status(200).json({
      success: true,
      notifications: notifications.slice(0, limit),
      unreadCount: notifications.filter(n => !n.read).length
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
}