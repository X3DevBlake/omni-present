import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { proposalId, action } = await req.json(); // action = 'approve' or 'reject'

        const proposal = await base44.entities.CourseUpdateProposal.get(proposalId);
        if (!proposal) throw new Error("Proposal not found");

        if (action === 'reject') {
            await base44.entities.CourseUpdateProposal.update(proposalId, { status: 'rejected' });
            return Response.json({ success: true, status: 'rejected' });
        }

        if (action === 'approve') {
            // Apply changes to the actual course (Simplified logic here)
            // In a real app, this would append to the Course entity's modules/content
            if (proposal.course_id && proposal.course_id !== 'general') {
                const course = await base44.entities.Course.get(proposal.course_id);
                // Here we would effectively merge the new lectures/exercises into the course object
                // For now, we'll just log it or update a 'last_updated_content' field to simulate
                await base44.entities.Course.update(proposal.course_id, {
                    // updated_content: proposal.generated_content // Assuming schema supports this
                });
            }

            await base44.entities.CourseUpdateProposal.update(proposalId, { status: 'approved' });
            return Response.json({ success: true, status: 'approved' });
        }

        return Response.json({ error: "Invalid action" }, { status: 400 });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});