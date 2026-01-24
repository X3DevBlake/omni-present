import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { action, document_type, section } = await req.json();

    switch (action) {
      case 'extract_curriculum': {
        // Extract structured curriculum from the OPO documents
        const curriculumPrompt = `Based on the Omni-Present Omega research documents, extract a detailed PhD curriculum for Cyber-Physical Convergence.

        Create a structured curriculum with:
        1. Year 1 Foundation Courses (Course codes CP-601, CP-602, CP-603)
        2. Year 2 Advanced Integration (CP-701, CP-702, CP-703)
        3. Years 3-4 Research Dissertation Topics
        4. Learning objectives for each course
        5. Prerequisites and dependencies

        Format as a comprehensive JSON structure with modules, topics, and estimated hours.`;

        const curriculum = await base44.integrations.Core.InvokeLLM({
          prompt: curriculumPrompt,
          add_context_from_internet: true,
          response_json_schema: {
            type: "object",
            properties: {
              courses: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    code: { type: "string" },
                    title: { type: "string" },
                    year: { type: "integer" },
                    credits: { type: "number" },
                    topics: { type: "array", items: { type: "string" } },
                    learning_outcomes: { type: "array", items: { type: "string" } },
                    lab_components: { type: "array", items: { type: "string" } }
                  }
                }
              },
              dissertation_topics: {
                type: "array",
                items: { type: "string" }
              }
            }
          }
        });

        // Create course and module records
        for (const course of curriculum.courses) {
          const courseRecord = await base44.asServiceRole.entities.Course.create({
            course_id: `opo_${course.code.toLowerCase().replace('-', '_')}`,
            title: course.title,
            description: `${course.title} - Part of the PhD in Cyber-Physical Convergence`,
            category: 'consciousness_studies',
            academic_level: 'phd',
            instructor_id: 'ai_opo_instructor',
            duration_weeks: 16,
            credits: course.credits,
            learning_objectives: course.learning_outcomes,
            is_published: true,
            ai_generated: true
          });

          // Create modules for each topic
          for (let i = 0; i < course.topics.length; i++) {
            await base44.asServiceRole.entities.Module.create({
              module_id: `${course.code}_topic_${i + 1}`,
              course_id: courseRecord.course_id,
              title: course.topics[i],
              order_index: i + 1,
              content_type: 'mixed',
              estimated_duration_minutes: 180,
              learning_outcomes: course.learning_outcomes.slice(i, i + 2)
            });
          }
        }

        return Response.json({ success: true, curriculum });
      }

      case 'generate_interactive_content': {
        const { topic_name } = await req.json();

        // Generate interactive 3D simulation content
        const contentPrompt = `Create interactive learning content for: ${topic_name}

        Include:
        1. Conceptual explanation (markdown)
        2. Mathematical formulation
        3. 3D visualization parameters (what should be rendered)
        4. Interactive exercises
        5. Code examples (Python/JavaScript)`;

        const content = await base44.integrations.Core.InvokeLLM({
          prompt: contentPrompt,
          response_json_schema: {
            type: "object",
            properties: {
              explanation_markdown: { type: "string" },
              mathematical_notation: { type: "string" },
              visualization_config: {
                type: "object",
                properties: {
                  type: { type: "string" },
                  parameters: { type: "object" }
                }
              },
              exercises: { type: "array", items: { type: "string" } },
              code_examples: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    language: { type: "string" },
                    code: { type: "string" }
                  }
                }
              }
            }
          }
        });

        // Create documentation article
        const article = await base44.asServiceRole.entities.DocumentationArticle.create({
          article_id: `opo_${Date.now()}`,
          title: topic_name,
          category: 'tutorials',
          content_markdown: content.explanation_markdown,
          code_examples: content.code_examples,
          difficulty_level: 'advanced',
          ai_generated: true,
          tags: ['omni-present', 'interactive', '3d-visualization']
        });

        return Response.json({ success: true, article, content });
      }

      case 'analyze_research_paper': {
        const { paper_section } = await req.json();

        // Extract key concepts and create knowledge graph nodes
        const analysisPrompt = `Analyze this research section and extract:
        
        ${paper_section}
        
        1. Key concepts and definitions
        2. Mathematical equations (LaTeX format)
        3. Dependencies on other concepts
        4. Real-world applications
        5. Difficulty level (1-10)`;

        const analysis = await base44.integrations.Core.InvokeLLM({
          prompt: analysisPrompt,
          response_json_schema: {
            type: "object",
            properties: {
              concepts: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    definition: { type: "string" },
                    equations: { type: "array", items: { type: "string" } },
                    dependencies: { type: "array", items: { type: "string" } },
                    applications: { type: "array", items: { type: "string" } },
                    difficulty: { type: "number" }
                  }
                }
              }
            }
          }
        });

        // Create knowledge graph nodes
        for (const concept of analysis.concepts) {
          await base44.asServiceRole.entities.KnowledgeGraphNode.create({
            node_id: `opo_${concept.name.toLowerCase().replace(/\s+/g, '_')}`,
            label: concept.name,
            node_type: 'concept',
            properties: {
              definition: concept.definition,
              equations: concept.equations,
              difficulty: concept.difficulty,
              applications: concept.applications
            },
            connections: concept.dependencies.map(dep => ({
              target: dep,
              relationship: 'depends_on'
            })),
            metadata: { source: 'opo_research' }
          });
        }

        return Response.json({ success: true, concepts: analysis.concepts });
      }

      case 'generate_learning_path': {
        const { user_background, goals } = await req.json();

        // AI-generated personalized learning path through OPO content
        const pathPrompt = `Create a personalized learning path for:
        
        Background: ${user_background}
        Goals: ${goals}
        
        Based on the Omni-Present Omega curriculum (BCI, Holography, Agent Swarms, CRDTs), 
        suggest optimal learning sequence, estimated timeline, and skill milestones.`;

        const path = await base44.integrations.Core.InvokeLLM({
          prompt: pathPrompt,
          response_json_schema: {
            type: "object",
            properties: {
              stages: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    stage_name: { type: "string" },
                    courses: { type: "array", items: { type: "string" } },
                    estimated_weeks: { type: "integer" },
                    prerequisites: { type: "array", items: { type: "string" } }
                  }
                }
              },
              skill_targets: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    skill_name: { type: "string" },
                    target_level: { type: "number" }
                  }
                }
              }
            }
          }
        });

        return Response.json({ success: true, learning_path: path });
      }

      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('OPO knowledge extractor error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});