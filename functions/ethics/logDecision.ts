import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { agentId, context, action, reasoning } = await req.json();

        // 1. Evaluate Ethics
        // Simple mock evaluation logic - ideally would use an LLM
        const riskyKeywords = ["delete", "purge", "overwrite", "unauthorized"];
        const isRisky = riskyKeywords.some(k => action.toLowerCase().includes(k));
        const complianceScore = isRisky ? 0.4 : 0.95;

        // 2. Log Decision
        const log = await base44.entities.EthicalDecisionLog.create({
            agent_id: agentId,
            decision_context: context,
            actions_considered: [action, "abort"],
            selected_action: action,
            ethical_framework_version: "v1.0.0-Omega",
            reasoning_trace: reasoning || "Autonomous decision based on goal alignment.",
            compliance_score: complianceScore,
            timestamp: new Date().toISOString()
        });

        // 3. Trigger Audit if score is low
        if (complianceScore < 0.5) {
            await base44.entities.EthicalAuditReport.create({
                agent_id: agentId,
                audit_period_start: new Date().toISOString(),
                audit_period_end: new Date().toISOString(),
                compliance_score: complianceScore,
                violations: [{
                    rule_id: "ETH-001",
                    severity: "high",
                    context: `Low compliance action detected: ${action}`
                }],
                recommendations: ["Review agent behavior tree", "Restrict permissions"]
            });
        }

        return Response.json({ success: true, log });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});