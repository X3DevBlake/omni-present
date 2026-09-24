import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { action, amount, pool_id } = await req.json(); // action: 'stake' | 'unstake' | 'claim'

        // Mock response for staking operations
        return Response.json({
            success: true,
            transaction_hash: "0x" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
            new_balance: 1000 - (amount || 0), // Mock balance update
            staked_amount: amount || 0,
            rewards_claimed: action === 'claim' ? 42.5 : 0,
            message: `Successfully ${action}d ${amount || ''} OMNI`
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});