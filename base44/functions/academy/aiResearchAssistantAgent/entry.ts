import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { action, user_id, project_id, query, submission_id, assignment_id } = await req.json();

    switch (action) {
      case 'literature_review': {
        const prompt = `Conduct a comprehensive literature review on: "${query}"
        
        Provide:
        1. Key research papers and findings (last 5 years)
        2. Research gaps and opportunities
        3. Theoretical frameworks
        4. Methodology recommendations
        5. Citation suggestions (formatted)`;

        const aiResponse = await base44.integrations.Core.InvokeLLM({
          prompt,
          add_context_from_internet: true,
          response_json_schema: {
            type: "object",
            properties: {
              summary: { type: "string" },
              key_papers: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    authors: { type: "string" },
                    year: { type: "number" },
                    key_findings: { type: "string" }
                  }
                }
              },
              research_gaps: { type: "array", items: { type: "string" } },
              methodology_suggestions: { type: "array", items: { type: "string" } }
            }
          }
        });

        return Response.json({ success: true, literature_review: aiResponse });
      }

      case 'hypothesis_generation': {
        const projects = await base44.entities.ResearchProject.filter({ project_id });
        const project = projects[0];

        const prompt = `Based on this research project:
        Title: ${project.title}
        Abstract: ${project.abstract}
        Type: ${project.research_type}
        
        Generate 5 testable hypotheses that would advance this research.
        Include expected outcomes and validation methods for each.`;

        const aiResponse = await base44.integrations.Core.InvokeLLM({
          prompt,
          response_json_schema: {
            type: "object",
            properties: {
              hypotheses: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    hypothesis: { type: "string" },
                    rationale: { type: "string" },
                    expected_outcome: { type: "string" },
                    validation_method: { type: "string" },
                    feasibility_score: { type: "number" }
                  }
                }
              }
            }
          }
        });

        return Response.json({ success: true, hypotheses: aiResponse.hypotheses });
      }

      case 'data_analysis_plan': {
        const { research_question, data_type } = await req.json();

        const prompt = `Create a detailed data analysis plan for:
        Research Question: ${research_question}
        Data Type: ${data_type}
        
        Include:
        1. Statistical methods to use
        2. Data preprocessing steps
        3. Visualization recommendations
        4. Potential biases to address
        5. Validation strategies`;

        const aiResponse = await base44.integrations.Core.InvokeLLM({
          prompt,
          response_json_schema: {
            type: "object",
            properties: {
              analysis_methods: { type: "array", items: { type: "string" } },
              preprocessing_steps: { type: "array", items: { type: "string" } },
              visualizations: { type: "array", items: { type: "string" } },
              bias_mitigation: { type: "array", items: { type: "string" } },
              validation_approach: { type: "string" }
            }
          }
        });

        return Response.json({ success: true, analysis_plan: aiResponse });
      }

      case 'draft_research_proposal': {
        const projects = await base44.entities.ResearchProject.filter({ project_id });
        const project = projects[0];

        const prompt = `Draft a comprehensive research proposal for:
        ${project.title}
        
        Abstract: ${project.abstract}
        Research Type: ${project.research_type}
        Methodology: ${project.methodology || 'To be determined'}
        
        Generate a structured proposal with:
        1. Introduction and background
        2. Literature review summary
        3. Research objectives
        4. Methodology
        5. Expected outcomes
        6. Timeline
        7. Ethical considerations`;

        const aiResponse = await base44.integrations.Core.InvokeLLM({
          prompt
        });

        // Create documentation article with the proposal
        const doc = await base44.entities.DocumentationArticle.create({
          article_id: `proposal_${Date.now()}`,
          title: `Research Proposal: ${project.title}`,
          category: 'research_proposal',
          content_markdown: aiResponse,
          associated_entities: ['ResearchProject'],
          difficulty_level: 'expert',
          ai_generated: true
        });

        return Response.json({ success: true, proposal: aiResponse, document_id: doc.article_id });
      }

      case 'grade_assignment': {
        const submissions = await base44.entities.Submission.filter({ submission_id });
        const submission = submissions[0];
        
        const assignments = await base44.entities.Assignment.filter({ assignment_id });
        const assignment = assignments[0];

        const prompt = `Grade this assignment submission:
        
        Assignment: ${assignment.title}
        Description: ${assignment.description}
        Max Points: ${assignment.max_points}
        Rubric: ${JSON.stringify(assignment.rubric)}
        
        Student Submission: ${JSON.stringify(submission.submission_data)}
        
        Provide:
        1. Overall score (0-${assignment.max_points})
        2. Detailed feedback for each rubric criterion
        3. Strengths identified
        4. Areas for improvement
        5. Specific suggestions`;

        const aiResponse = await base44.integrations.Core.InvokeLLM({
          prompt,
          response_json_schema: {
            type: "object",
            properties: {
              score: { type: "number" },
              grade_letter: { type: "string" },
              criterion_scores: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    criterion: { type: "string" },
                    score: { type: "number" },
                    feedback: { type: "string" }
                  }
                }
              },
              strengths: { type: "array", items: { type: "string" } },
              improvements: { type: "array", items: { type: "string" } },
              overall_feedback: { type: "string" }
            }
          }
        });

        // Update submission with AI grading
        await base44.entities.Submission.update(submission.id, {
          ai_grading_result: aiResponse,
          ai_analysis_pending: false,
          status: 'graded'
        });

        return Response.json({ success: true, grading: aiResponse });
      }

      case 'suggest_research_collaborators': {
        const projects = await base44.entities.ResearchProject.filter({ project_id });
        const project = projects[0];

        // Find researchers with similar interests
        const allProfiles = await base44.entities.AcademicProfile.list();
        const relevantProfiles = allProfiles.filter(p => {
          const interests = p.research_interests || [];
          return interests.some(interest => 
            project.title.toLowerCase().includes(interest.toLowerCase())
          );
        });

        return Response.json({ 
          success: true, 
          suggested_collaborators: relevantProfiles.slice(0, 10).map(p => ({
            user_id: p.user_id,
            research_interests: p.research_interests,
            publications: p.publications
          }))
        });
      }

      case 'analyze_research_data': {
        const { project_id, query } = await req.json();
        
        const projects = await base44.entities.ResearchProject.filter({ project_id });
        const project = projects[0];

        const analysisPrompt = `Perform real-time data analysis for research project:
        ${project.title}
        
        Query: ${query}
        
        Provide:
        1. Statistical analysis approach
        2. Visualization recommendations (3D coordinates for data points)
        3. Key insights and patterns
        4. Anomalies or outliers
        5. Next steps for deeper investigation`;

        const analysis = await base44.integrations.Core.InvokeLLM({
          prompt: analysisPrompt,
          response_json_schema: {
            type: "object",
            properties: {
              analysis_approach: { type: "string" },
              visualization_points: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    x: { type: "number" },
                    y: { type: "number" },
                    z: { type: "number" },
                    value: { type: "number" },
                    label: { type: "string" }
                  }
                }
              },
              insights: { type: "array", items: { type: "string" } },
              anomalies: { type: "array", items: { type: "string" } },
              recommendations: { type: "array", items: { type: "string" } }
            }
          }
        });

        return Response.json({ success: true, ...analysis });
      }

      case 'generate_data_visualization': {
        const { data_points, visualization_type } = await req.json();

        const vizPrompt = `Generate an advanced 3D data visualization configuration:
        
        Data Points: ${JSON.stringify(data_points)}
        Visualization Type: ${visualization_type || 'interactive_scatter'}
        
        Provide detailed configuration for rendering in React Three Fiber.`;

        const vizConfig = await base44.integrations.Core.InvokeLLM({
          prompt: vizPrompt,
          response_json_schema: {
            type: "object",
            properties: {
              scene_config: { type: "object" },
              camera_position: { type: "object" },
              lighting_setup: { type: "array" },
              interactive_elements: { type: "array" }
            }
          }
        });

        return Response.json({ success: true, visualization_config: vizConfig });
      }

      case 'contextual_assistance': {
        const { content, user_progress } = await req.json();

        const assistPrompt = `You are an AI academic advisor. Based on this learning content:
        
        ${content}
        
        Student Progress: ${JSON.stringify(user_progress)}
        
        Provide 3 proactive suggestions or clarifications that would help the student understand better.`;

        const suggestions = await base44.integrations.Core.InvokeLLM({
          prompt: assistPrompt,
          response_json_schema: {
            type: "object",
            properties: {
              suggestions: { type: "array", items: { type: "string" } }
            }
          }
        });

        return Response.json({ success: true, ...suggestions });
      }

      case 'parse_complex_research_question': {
        const { research_question } = await req.json();

        const parsePrompt = `Parse and refine this complex research question using advanced NLP:
        
        "${research_question}"
        
        Provide:
        1. Refined, clearer version of the question
        2. Key concepts identified
        3. Variables and relationships
        4. Suggested hypotheses
        5. Recommended research methods`;

        const parsed = await base44.integrations.Core.InvokeLLM({
          prompt: parsePrompt,
          response_json_schema: {
            type: "object",
            properties: {
              refined_question: { type: "string" },
              key_concepts: { type: "array", items: { type: "string" } },
              variables: { type: "array", items: { type: "string" } },
              relationships: { type: "array", items: { type: "string" } },
              hypotheses: { type: "array", items: { type: "string" } },
              methods: { type: "array", items: { type: "string" } }
            }
          }
        });

        return Response.json({ success: true, ...parsed });
      }

      case 'chat': {
        const { message, agent_id } = await req.json();

        // Get agent personality for context
        const traits = await base44.entities.AgentPersonalityTrait.filter({ agent_id });
        
        const chatPrompt = `You are an AI academic advisor with these personality traits:
        ${traits.map(t => `${t.trait_name}: ${t.strength}`).join(', ')}
        
        Student message: ${message}
        
        Provide helpful, personalized academic guidance.`;

        const response = await base44.integrations.Core.InvokeLLM({
          prompt: chatPrompt
        });

        // Record conversation
        await base44.entities.AIConversation.create({
          conversation_id: `conv_${Date.now()}`,
          agent_id,
          user_id: user_id,
          messages: [
            { role: 'user', content: message, timestamp: new Date().toISOString() },
            { role: 'assistant', content: response, timestamp: new Date().toISOString() }
          ]
        });

        return Response.json({ success: true, response });
      }

      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('AI research assistant error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});