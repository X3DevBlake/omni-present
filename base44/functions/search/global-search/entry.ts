import { base44 } from '@/api/base44Client';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query, userEmail, limit = 10 } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Search across multiple entities
    const [agents, goals, markets, media] = await Promise.all([
      base44.entities.Agent.list().catch(() => []),
      base44.entities.FinancialGoal.filter({ user_email: userEmail }).catch(() => []),
      base44.entities.MarketAsset.list().catch(() => []),
      base44.entities.MediaAsset.filter({ user_email: userEmail }).catch(() => [])
    ]);

    const searchTerm = query.toLowerCase();

    // Filter and map results
    const results = [
      ...agents
        .filter(a => a.name?.toLowerCase().includes(searchTerm) || a.type?.toLowerCase().includes(searchTerm))
        .slice(0, limit / 4)
        .map(a => ({ type: 'Agent', title: a.name, id: a.id, page: 'Agent' })),

      ...goals
        .filter(g => g.name?.toLowerCase().includes(searchTerm))
        .slice(0, limit / 4)
        .map(g => ({ type: 'Goal', title: g.name, id: g.id, page: 'FinancialGoal' })),

      ...markets
        .filter(m => m.symbol?.toLowerCase().includes(searchTerm) || m.name?.toLowerCase().includes(searchTerm))
        .slice(0, limit / 4)
        .map(m => ({ type: 'Market', title: `${m.symbol} - ${m.name}`, id: m.id, page: 'World' })),

      ...media
        .filter(m => m.title?.toLowerCase().includes(searchTerm) || m.description?.toLowerCase().includes(searchTerm))
        .slice(0, limit / 4)
        .map(m => ({ type: 'Media', title: m.title, id: m.id, page: 'Marketplace' }))
    ].slice(0, limit);

    res.status(200).json({ success: true, results });
  } catch (error) {
    console.error('Global search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
}