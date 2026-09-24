import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    const { action, project_id, reviewer_ids, review_id, feedback, rating } = await req.json();

    switch (action) {
      case 'initiate_review': {
        const projects = await base44.asServiceRole.entities.ResearchProject.filter({ project_id });
        const project = projects[0];

        if (!project) {
          return Response.json({ error: 'Project not found' }, { status: 404 });
        }

        // Create review records for each reviewer
        const reviews = [];
        for (const reviewerId of reviewer_ids) {
          const review = await base44.asServiceRole.entities.PeerReview.create({
            review_id: `review_${Date.now()}_${reviewerId}`,
            project_id,
            reviewer_id: reviewerId,
            status: 'pending',
            assigned_date: new Date().toISOString(),
            due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            criteria: {
              originality: null,
              methodology: null,
              clarity: null,
              significance: null,
              ethical_compliance: null
            },
            comments: [],
            recommendation: null
          });
          reviews.push(review);

          // Send notification
          const reviewers = await base44.asServiceRole.entities.User.filter({ id: reviewerId });
          if (reviewers[0]) {
            await base44.integrations.Core.SendEmail({
              to: reviewers[0].email,
              subject: `Peer Review Request: ${project.title}`,
              body: `You have been invited to review the research project "${project.title}".
              
              Project Abstract: ${project.abstract}
              
              Please complete your review within 14 days.
              Access the review system at: https://omni-present.academy/reviews/${review.review_id}`
            });
          }
        }

        // Update project status
        await base44.asServiceRole.entities.ResearchProject.update(project.id, {
          status: 'peer_review'
        });

        return Response.json({ success: true, reviews });
      }

      case 'submit_review': {
        const reviews = await base44.asServiceRole.entities.PeerReview.filter({ review_id });
        const review = reviews[0];

        if (!review || review.reviewer_id !== user.id) {
          return Response.json({ error: 'Unauthorized or review not found' }, { status: 403 });
        }

        // AI-assisted review analysis
        const aiAnalysis = await base44.integrations.Core.InvokeLLM({
          prompt: `Analyze this peer review feedback for completeness and constructiveness:
          
          Feedback: ${feedback}
          Rating: ${rating}
          
          Provide suggestions for improvement if needed.`,
          response_json_schema: {
            type: "object",
            properties: {
              completeness_score: { type: "number" },
              constructiveness_score: { type: "number" },
              suggestions: { type: "array", items: { type: "string" } }
            }
          }
        });

        await base44.asServiceRole.entities.PeerReview.update(review.id, {
          status: 'completed',
          completed_date: new Date().toISOString(),
          criteria: rating,
          comments: feedback,
          recommendation: rating.overall >= 7 ? 'accept' : rating.overall >= 5 ? 'minor_revisions' : 'major_revisions',
          ai_analysis: aiAnalysis
        });

        // Check if all reviews are complete
        const projects = await base44.asServiceRole.entities.ResearchProject.filter({ project_id: review.project_id });
        const project = projects[0];
        
        const allReviews = await base44.asServiceRole.entities.PeerReview.filter({ project_id: review.project_id });
        const allComplete = allReviews.every(r => r.status === 'completed');

        if (allComplete) {
          // Generate consolidated review report
          const consolidatedReport = await base44.integrations.Core.InvokeLLM({
            prompt: `Generate a consolidated peer review report:
            
            ${allReviews.map(r => `Reviewer ${r.reviewer_id}: ${JSON.stringify(r.criteria)}\nComments: ${r.comments}`).join('\n\n')}
            
            Provide an executive summary and overall recommendation.`
          });

          await base44.asServiceRole.entities.ResearchProject.update(project.id, {
            status: 'reviewed',
            peer_review_summary: consolidatedReport
          });

          // Notify principal investigator
          const pis = await base44.asServiceRole.entities.User.filter({ id: project.principal_investigator });
          if (pis[0]) {
            await base44.integrations.Core.SendEmail({
              to: pis[0].email,
              subject: `Peer Review Complete: ${project.title}`,
              body: `All peer reviews for your research project "${project.title}" have been completed.
              
              ${consolidatedReport}
              
              View full review details in your dashboard.`
            });
          }
        }

        return Response.json({ success: true, ai_analysis: aiAnalysis });
      }

      case 'ai_preliminary_review': {
        const projects = await base44.asServiceRole.entities.ResearchProject.filter({ project_id });
        const project = projects[0];

        const aiReview = await base44.integrations.Core.InvokeLLM({
          prompt: `Conduct a preliminary AI review of this research project:
          
          Title: ${project.title}
          Abstract: ${project.abstract}
          Methodology: ${project.methodology}
          Research Type: ${project.research_type}
          
          Evaluate:
          1. Originality and novelty
          2. Methodological soundness
          3. Clarity of objectives
          4. Potential ethical concerns
          5. Significance to field
          
          Provide detailed feedback and a preliminary assessment.`,
          response_json_schema: {
            type: "object",
            properties: {
              originality_score: { type: "number" },
              methodology_score: { type: "number" },
              clarity_score: { type: "number" },
              ethical_assessment: { type: "string" },
              significance_score: { type: "number" },
              strengths: { type: "array", items: { type: "string" } },
              concerns: { type: "array", items: { type: "string" } },
              recommendations: { type: "array", items: { type: "string" } }
            }
          }
        });

        // Create AI review record
        const aiReviewRecord = await base44.asServiceRole.entities.PeerReview.create({
          review_id: `ai_review_${Date.now()}`,
          project_id,
          reviewer_id: 'ai_reviewer_001',
          status: 'completed',
          assigned_date: new Date().toISOString(),
          completed_date: new Date().toISOString(),
          criteria: {
            originality: aiReview.originality_score,
            methodology: aiReview.methodology_score,
            clarity: aiReview.clarity_score,
            significance: aiReview.significance_score,
            ethical_compliance: aiReview.ethical_assessment
          },
          comments: JSON.stringify(aiReview),
          recommendation: 'ai_preliminary'
        });

        return Response.json({ success: true, ai_review: aiReview });
      }

      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Peer review orchestrator error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});