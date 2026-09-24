export default async function decentralizedInsuranceMarketplace(data, context) {
  const { action, agent_id, coverage_type, coverage_amount, premium_amount } = data;
  
  const agent = await context.entities.Agent.get(agent_id);
  
  if (action === 'create_policy') {
    const policyDesign = await context.integrations.Core.InvokeLLM({
      prompt: `Design decentralized insurance policy for DeFi risks:

Coverage Type: ${coverage_type}
Coverage Amount: $${coverage_amount}
Premium: $${premium_amount}

Design policy including:
1. Coverage terms and conditions
2. Claim triggers (automated)
3. Payout mechanism
4. Risk assessment
5. Premium pricing model
6. Underwriting criteria
7. Claim verification process

Make it fully autonomous and agent-managed.`,
      response_json_schema: {
        type: "object",
        properties: {
          policy_id: { type: "string" },
          coverage_terms: {
            type: "object",
            properties: {
              covered_risks: { type: "array", items: { type: "string" } },
              exclusions: { type: "array", items: { type: "string" } },
              max_payout: { type: "number" },
              deductible: { type: "number" },
              duration_days: { type: "number" }
            }
          },
          automated_triggers: {
            type: "array",
            items: {
              type: "object",
              properties: {
                trigger_type: { type: "string" },
                condition: { type: "string" },
                payout_percentage: { type: "number" }
              }
            }
          },
          premium_schedule: {
            type: "object",
            properties: {
              frequency: { type: "string" },
              amount: { type: "number" },
              payment_token: { type: "string" }
            }
          },
          risk_score: { type: "number" }
        }
      }
    });
    
    await context.entities.DAOProposal.create({
      title: `Insurance Policy: ${coverage_type}`,
      description: `Decentralized insurance for ${coverage_type} - $${coverage_amount} coverage`,
      proposal_type: 'insurance_policy',
      status: 'active',
      metadata: {
        policy: policyDesign,
        managed_by_agent: agent_id
      }
    });
    
    return { policy: policyDesign };
  }
  
  if (action === 'file_claim') {
    const { policy_id, claim_evidence } = data;
    
    const claimProcessing = await context.integrations.Core.InvokeLLM({
      prompt: `Automated insurance claim processing:

Policy ID: ${policy_id}
Evidence: ${JSON.stringify(claim_evidence)}

Verify claim:
1. Check trigger conditions
2. Validate evidence on-chain
3. Calculate payout amount
4. Verify no fraud
5. Execute payout if valid`,
      response_json_schema: {
        type: "object",
        properties: {
          claim_valid: { type: "boolean" },
          payout_amount: { type: "number" },
          verification_details: { type: "string" },
          fraud_score: { type: "number" }
        }
      }
    });
    
    if (claimProcessing.claim_valid) {
      await context.entities.OmniTransaction.create({
        from_address: 'insurance_pool',
        to_address: agent.created_by,
        amount: claimProcessing.payout_amount,
        transaction_type: 'insurance_payout',
        status: 'completed'
      });
    }
    
    return { claim_result: claimProcessing };
  }
  
  return { error: 'Invalid action' };
}