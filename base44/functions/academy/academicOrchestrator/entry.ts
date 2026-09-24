import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, payload } = await req.json();

    switch (action) {
      case 'enroll_course': {
        const { course_id } = payload;
        
        // Get or create academic profile
        let profiles = await base44.entities.AcademicProfile.filter({ user_id: user.id });
        let profile = profiles[0];
        
        if (!profile) {
          profile = await base44.entities.AcademicProfile.create({
            profile_id: `prof_${Date.now()}`,
            user_id: user.id,
            academic_role: 'student',
            enrolled_courses: [course_id],
            completed_courses: [],
            active_research_projects: [],
            certifications: []
          });
        } else {
          const enrolled = profile.enrolled_courses || [];
          if (!enrolled.includes(course_id)) {
            await base44.entities.AcademicProfile.update(profile.id, {
              enrolled_courses: [...enrolled, course_id]
            });
          }
        }

        // Update course enrollment count
        const course = await base44.entities.Course.filter({ course_id });
        if (course[0]) {
          await base44.entities.Course.update(course[0].id, {
            enrollment_count: (course[0].enrollment_count || 0) + 1
          });
        }

        // Create personalized learning path
        const learningPathResponse = await base44.functions.invoke('aiCurriculumGenerator', {
          action: 'generate_learning_path',
          user_id: user.id,
          course_id: course_id
        });

        return Response.json({
          success: true,
          profile,
          learning_path: learningPathResponse.data
        });
      }

      case 'submit_assignment': {
        const { assignment_id, submission_data } = payload;
        
        const submission = await base44.entities.Submission.create({
          submission_id: `sub_${Date.now()}`,
          assignment_id,
          student_id: user.id,
          submission_data,
          submitted_at: new Date().toISOString(),
          status: 'submitted',
          ai_analysis_pending: true
        });

        // Trigger AI grading if enabled
        const assignment = await base44.entities.Assignment.filter({ assignment_id });
        if (assignment[0]?.ai_grading_enabled) {
          await base44.functions.invoke('aiResearchAssistantAgent', {
            action: 'grade_assignment',
            submission_id: submission.submission_id,
            assignment_id
          });
        }

        return Response.json({ success: true, submission });
      }

      case 'complete_module': {
        const { module_id, course_id } = payload;
        
        const profiles = await base44.entities.AcademicProfile.filter({ user_id: user.id });
        const profile = profiles[0];

        // Update learning path progress
        const learningPaths = await base44.entities.LearningPath.filter({ user_id: user.id });
        for (const path of learningPaths) {
          const stages = path.path_stages || [];
          let updated = false;
          
          for (const stage of stages) {
            if (stage.modules?.includes(module_id)) {
              stage.completed = true;
              updated = true;
            }
          }

          if (updated) {
            const completedStages = stages.filter(s => s.completed).length;
            const progress = (completedStages / stages.length) * 100;
            
            await base44.entities.LearningPath.update(path.id, {
              path_stages: stages,
              progress_percentage: progress
            });
          }
        }

        // Check if course is complete
        const course = await base44.entities.Course.filter({ course_id });
        if (course[0]) {
          const allModules = course[0].modules || [];
          const completedModules = []; // Track this in user progress
          
          if (allModules.length === completedModules.length) {
            // Issue certification
            const certResponse = await base44.functions.invoke('certificationManager', {
              action: 'issue_certification',
              user_id: user.id,
              course_id
            });
            
            return Response.json({ 
              success: true, 
              course_completed: true,
              certification: certResponse.data
            });
          }
        }

        return Response.json({ success: true, module_completed: true });
      }

      case 'create_research_project': {
        const { title, abstract, research_type, collaborators } = payload;
        
        // Create data vault for research
        const vaultResponse = await base44.functions.invoke('dataVaultAccessManager', {
          action: 'create_vault',
          owner_id: user.id,
          vault_name: `Research: ${title}`
        });

        const project = await base44.entities.ResearchProject.create({
          project_id: `proj_${Date.now()}`,
          title,
          abstract,
          research_type,
          principal_investigator: user.id,
          collaborators: collaborators || [],
          data_vaults: [vaultResponse.data.vault_id],
          status: 'proposal',
          milestones: [],
          ai_assistants: []
        });

        // Assign AI research assistant
        const aiAssistant = await base44.entities.Agent.create({
          agent_id: `ai_researcher_${Date.now()}`,
          name: `Research Assistant for ${title}`,
          agent_type: 'research_assistant',
          specialization: research_type,
          assigned_to: user.id
        });

        await base44.entities.ResearchProject.update(project.id, {
          ai_assistants: [aiAssistant.agent_id]
        });

        return Response.json({ success: true, project, ai_assistant: aiAssistant });
      }

      case 'request_peer_review': {
        const { project_id, reviewer_ids } = payload;
        
        const reviewResponse = await base44.functions.invoke('peerReviewOrchestrator', {
          action: 'initiate_review',
          project_id,
          reviewer_ids,
          requester_id: user.id
        });

        return Response.json({ success: true, review: reviewResponse.data });
      }

      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Academic orchestrator error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});