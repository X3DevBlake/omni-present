/**
 * Sync Blockchain DeFi Data
 * - Updates liquidity pool information
 * - Syncs staking data
 * - Tracks governance proposals
 */

import { base44 } from '@base44/sdk';

export default async function handler(req, res) {
  try {
    // Fetch latest pool data via LLM with web search
    const poolData = await base44.integrations.Core.InvokeLLM({
      prompt: `Get current data for top DeFi liquidity pools:
      - USDT/USDC on Uniswap
      - ETH/USDC on Uniswap
      - OMNI/ETH on major DEX
      
      For each pool provide: TVL, APY, 24h volume, risk level (low/medium/high), impermanent loss %.
      Return as JSON array.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          pools: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                tvl: { type: 'number' },
                apy: { type: 'number' },
                volume_24h: { type: 'number' }
              }
            }
          }
        }
      }
    });

    // Update LiquidityPool entities
    for (const pool of poolData.pools || []) {
      const existing = await base44.entities.LiquidityPool.filter({
        pool_name: pool.name
      });

      if (existing.length > 0) {
        await base44.entities.LiquidityPool.update(existing[0].id, {
          current_apy: pool.apy,
          total_value_locked: pool.tvl
        });
      }
    }

    // Fetch governance proposals
    const proposals = await base44.entities.DAOProposal.filter({
      status: 'active'
    });

    res.status(200).json({
      success: true,
      pools_synced: poolData.pools.length,
      active_proposals: proposals.length,
      data: poolData.pools
    });
  } catch (error) {
    console.error('Blockchain sync error:', error);
    res.status(500).json({ error: error.message });
  }
}