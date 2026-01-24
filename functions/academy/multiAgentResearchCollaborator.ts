import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { action, project_id, agent_ids, finding_data, hypothesis_text, section_topic } = await req.json();

    switch (action) {
      case 'initiate_collaboration': {
        const projects = await base44.asServiceRole.entities.ResearchProject.filter({ project_id });
        const project = projects[0];

        if (!project) {
          return Response.json({ error: 'Project not found' }, { status: 404 });
        }

        // Create collaboration record
        const collaboration = await base44.asServiceRole.entities.AgentCollaboration.create({
          collaboration_id: `collab_${Date.now()}`,
          project_id,
          participating_agents: agent_ids,
          collaboration_type: 'research_synthesis',
          status: 'active',
          shared_knowledge: [],
          communication_log: [],
          outcomes: []
        });

        // Initialize agent communication channels
        for (const agentId of agent_ids) {
          await base44.asServiceRole.entities.AgentCommunication.create({
            communication_id: `comm_${Date.now()}_${agentId}`,
            sender_agent_id: agentId,
            receiver_agent_id: 'research_hub',
            message_type: 'collaboration_join',
            content: `Agent ${agentId} joined research collaboration`,
            timestamp: new Date().toISOString(),
            collaboration_id: collaboration.collaboration_id
          });
        }

        return Response.json({ success: true, collaboration });
      }

      case 'share_finding_from_vault': {
        const { agent_id, vault_id, finding_summary } = await req.json();

        // Verify agent has access to vault
        const vaults = await base44.asServiceRole.entities.DecentralizedDataVault.filter({ vault_id });
        const vault = vaults[0];

        if (!vault) {
          return Response.json({ error: 'Vault not found' }, { status: 404 });
        }

        const hasAccess = vault.access_permissions?.some(p => p.granted_to === agent_id);
        
        if (!hasAccess && vault.owner_id !== agent_id) {
          return Response.json({ error: 'Agent lacks vault access' }, { status: 403 });
        }

        // Create shared knowledge record
        const sharedKnowledge = await base44.asServiceRole.entities.SharedKnowledge.create({
          knowledge_id: `knowledge_${Date.now()}`,
          source_agent_id: agent_id,
          project_id,
          knowledge_type: 'research_finding',
          content: finding_summary,
          data_vault_reference: vault_id,
          confidence_score: 0.85,
          shared_with: agent_ids || [],
          timestamp: new Date().toISOString()
        });

        // Notify collaboration
        const collaborations = await base44.asServiceRole.entities.AgentCollaboration.filter({ project_id });
        if (collaborations[0]) {
          const sharedKnowledgeList = collaborations[0].shared_knowledge || [];
          await base44.asServiceRole.entities.AgentCollaboration.update(collaborations[0].id, {
            shared_knowledge: [...sharedKnowledgeList, sharedKnowledge.knowledge_id]
          });
        }

        return Response.json({ success: true, shared_knowledge: sharedKnowledge });
      }

      case 'refine_hypothesis_dialogue': {
        const { current_hypothesis, agent_perspectives } = await req.json();

        // Multi-agent dialogue to refine hypothesis
        const refinementPrompt = `Multiple AI research agents are collaborating to refine a hypothesis:
        
        Current Hypothesis: "${current_hypothesis}"
        
        Agent Perspectives:
        ${agent_perspectives.map((p, i) => `Agent ${i + 1}: ${p}`).join('\n')}
        
        Synthesize these perspectives into:
        1. A refined, more robust hypothesis
        2. Identified strengths from agent inputs
        3. Addressed weaknesses or gaps
        4. Suggested validation approaches
        5. Next research steps`;

        const refinement = await base44.integrations.Core.InvokeLLM({
          prompt: refinementPrompt,
          response_json_schema: {
            type: "object",
            properties: {
              refined_hypothesis: { type: "string" },
              strengths: { type: "array", items: { type: "string" } },
              addressed_gaps: { type: "array", items: { type: "string" } },
              validation_methods: { type: "array", items: { type: "string" } },
              next_steps: { type: "array", items: { type: "string" } },
              consensus_score: { type: "number" }
            }
          }
        });

        // Record the dialogue
        await base44.asServiceRole.entities.AgentCommunication.create({
          communication_id: `dialogue_${Date.now()}`,
          sender_agent_id: 'multi_agent_system',
          message_type: 'hypothesis_refinement',
          content: JSON.stringify(refinement),
          timestamp: new Date().toISOString(),
          metadata: { project_id, original_hypothesis: current_hypothesis }
        });

        return Response.json({ success: true, ...refinement });
      }

      case 'co_author_section': {
        const { lead_agent_id, supporting_agent_ids, outline } = await req.json();

        // Lead agent creates initial draft
        const leadDraft = await base44.integrations.Core.InvokeLLM({
          prompt: `As lead research AI, draft the following section:
          
          ${section_topic}
          
          Outline: ${outline}
          
          Write a comprehensive, academic-quality section with proper citations.`
        });

        // Supporting agents provide enhancements
        const enhancements = [];
        for (const agentId of supporting_agent_ids || []) {
          const enhancement = await base44.integrations.Core.InvokeLLM({
            prompt: `Review and enhance this research section draft:
            
            ${leadDraft}
            
            Provide:
            1. Additional insights or data
            2. Methodological improvements
            3. Citation additions
            4. Clarity enhancements`
          });
          enhancements.push({ agent_id: agentId, enhancement });
        }

        // Synthesize final version
        const finalDraft = await base44.integrations.Core.InvokeLLM({
          prompt: `Synthesize these AI agent contributions into a final research section:
          
          Lead Draft: ${leadDraft}
          
          Agent Enhancements:
          ${enhancements.map((e, i) => `Agent ${i + 1}: ${e.enhancement}`).join('\n\n')}
          
          Create a cohesive, publication-ready section.`
        });

        // Create documentation article with co-authored content
        const doc = await base44.asServiceRole.entities.DocumentationArticle.create({
          article_id: `coauthored_${Date.now()}`,
          title: section_topic,
          category: 'research_methodology',
          content_markdown: finalDraft,
          ai_generated: true,
          last_ai_update: new Date().toISOString(),
          associated_entities: ['ResearchProject'],
          tags: ['multi-agent', 'collaborative', 'ai-authored']
        });

        // Log collaboration outcome
        const collaborations = await base44.asServiceRole.entities.AgentCollaboration.filter({ project_id });
        if (collaborations[0]) {
          const outcomes = collaborations[0].outcomes || [];
          await base44.asServiceRole.entities.AgentCollaboration.update(collaborations[0].id, {
            outcomes: [...outcomes, {
              type: 'co_authored_section',
              document_id: doc.article_id,
              timestamp: new Date().toISOString(),
              agents_involved: [lead_agent_id, ...supporting_agent_ids]
            }]
          });
        }

        return Response.json({ 
          success: true, 
          final_section: finalDraft,
          document_id: doc.article_id,
          contributing_agents: [lead_agent_id, ...supporting_agent_ids]
        });
      }

      case 'autonomous_vault_query': {
        const { agent_id, vault_id, query } = await req.json();

        // Agent autonomously queries vault data
        const vaults = await base44.asServiceRole.entities.DecentralizedDataVault.filter({ vault_id });
        const vault = vaults[0];

        // Log access
        await base44.functions.invoke('dataVaultAccessManager', {
          action: 'log_access',
          permission_id: `agent_${agent_id}`,
          action_type: 'query',
          data_accessed: query
        });

        // Process query with AI
        const queryResult = await base44.integrations.Core.InvokeLLM({
          prompt: `Agent ${agent_id} is querying research data vault for: "${query}"
          
          Vault contains: ${vault.data_categories?.join(', ')}
          
          Provide relevant insights and data points that would help the research.`
        });

        return Response.json({ success: true, query_result: queryResult });
      }

      case 'synthesize_collaboration': {
        const collaborations = await base44.asServiceRole.entities.AgentCollaboration.filter({ project_id });
        const collaboration = collaborations[0];

        if (!collaboration) {
          return Response.json({ error: 'No active collaboration' }, { status: 404 });
        }

        // Get all shared knowledge
        const knowledgeRecords = [];
        for (const knowledgeId of collaboration.shared_knowledge || []) {
          const records = await base44.asServiceRole.entities.SharedKnowledge.filter({ knowledge_id: knowledgeId });
          if (records[0]) knowledgeRecords.push(records[0]);
        }

        // Synthesize into research insights
        const synthesis = await base44.integrations.Core.InvokeLLM({
          prompt: `Synthesize these collaborative AI research findings:
          
          ${knowledgeRecords.map(k => `${k.source_agent_id}: ${k.content}`).join('\n\n')}
          
          Create:
          1. Unified research narrative
          2. Key insights and patterns
          3. Consensus findings
          4. Areas of divergence
          5. Recommended next research directions`
        });

        return Response.json({ success: true, synthesis });
      }

      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Multi-agent research collaborator error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});