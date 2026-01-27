import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Mock governance data
        const proposals = [
            { id: 1, title: "OIP-12: Increase Staking APY to 15%", status: "Active", votes_for: 150000, votes_against: 20000, end_date: "2026-02-01" },
            { id: 2, title: "OIP-13: Integrate Solana Bridge", status: "Active", votes_for: 85000, votes_against: 90000, end_date: "2026-02-05" },
            { id: 3, title: "OIP-11: Burn 5% of Treasury", status: "Passed", votes_for: 500000, votes_against: 10000, end_date: "2026-01-20" }
        ];

        return Response.json({ proposals });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});