import { createClientFromRequest } from 'npm:@base44/sdk@0.8.11';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { command, context } = await req.json();

        // Simple mock NLP router
        let action = "unknown";
        let target = "unknown";
        let parameters = {};

        const lowerCmd = command.toLowerCase();

        if (lowerCmd.includes("increase") && lowerCmd.includes("aggressiveness")) {
            action = "modify_parameter";
            target = "simulation_environment";
            parameters = { aggression: "+20%" };
        } else if (lowerCmd.includes("run") && lowerCmd.includes("audit")) {
            action = "trigger_process";
            target = "ethics_module";
        } else if (lowerCmd.includes("optimize") && lowerCmd.includes("tree")) {
            action = "optimize_behavior";
            target = "selected_agent";
        }

        return Response.json({
            status: "success",
            interpreted_intent: { action, target, parameters },
            response_message: `Initiating ${action} on ${target}. System adjusting...`
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});