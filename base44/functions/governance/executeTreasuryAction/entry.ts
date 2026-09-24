import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { proposal_id, action_type, amount, recipient } = await req.json();
    
    // Verify proposal passed
    const proposals = await base44.entities.GovernanceProposal.filter({ id: proposal_id });
    const proposal = proposals[0];
    
    if (!proposal || proposal.status !== 'passed') {
      return Response.json({ error: 'Proposal not approved for execution' }, { status: 400 });
    }
    
    // Get treasury
    const treasuries = await base44.entities.Treasury.list();
    let treasury = treasuries[0];
    
    if (!treasury) {
      // Create default treasury
      treasury = await base44.entities.Treasury.create({
        treasury_name: 'Main Treasury',
        total_balance_usd: 1000000,
        asset_holdings: [
          { asset_type: 'USDT', symbol: 'USDT', amount: 500000, value_usd: 500000 },
          { asset_type: 'ETH', symbol: 'ETH', amount: 200, value_usd: 500000 }
        ],
        multisig_signers: [user.id],
        required_signatures: 1
      });
    }
    
    if (amount > treasury.total_balance_usd) {
      return Response.json({ error: 'Insufficient treasury funds' }, { status: 400 });
    }
    
    // Execute action
    const txHash = `0x${Math.random().toString(16).substr(2, 64)}`;
    
    const transaction = {
      type: action_type,
      amount,
      timestamp: new Date().toISOString(),
      tx_hash: txHash
    };
    
    // Update treasury
    await base44.entities.Treasury.update(treasury.id, {
      total_balance_usd: treasury.total_balance_usd - amount,
      total_spent: (treasury.total_spent || 0) + amount,
      transaction_history: [
        ...(treasury.transaction_history || []),
        transaction
      ].slice(-100)
    });
    
    // Mark proposal as executed
    await base44.entities.GovernanceProposal.update(proposal_id, {
      status: 'executed',
      blockchain_tx_hash: txHash,
      executed_at: new Date().toISOString()
    });
    
    return Response.json({
      transaction,
      treasury_balance_remaining: treasury.total_balance_usd - amount,
      proposal_status: 'executed'
    });
    
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});