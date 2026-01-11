// Autonomous Agent Navigation API
// Allows AI agents to programmatically navigate the platform

import { HubRegistry, AppKnowledgeGraph } from '../../components/navigation/HubRegistry.js';

export default async function agentNavigationAPI(request, context) {
  const { action, parameters } = request.body;

  try {
    switch(action) {
      case 'getAllHubs':
        return {
          statusCode: 200,
          body: {
            hubs: AppKnowledgeGraph.getAllHubs(),
            totalCount: HubRegistry.length
          }
        };

      case 'getHubById':
        const hub = AppKnowledgeGraph.getHubById(parameters.hubId);
        if (!hub) {
          return {
            statusCode: 404,
            body: { error: 'Hub not found' }
          };
        }
        return {
          statusCode: 200,
          body: { hub }
        };

      case 'searchHubs':
        const searchResults = HubRegistry.filter(hub => 
          hub.name.toLowerCase().includes(parameters.query.toLowerCase()) ||
          hub.category.toLowerCase().includes(parameters.query.toLowerCase())
        );
        return {
          statusCode: 200,
          body: { results: searchResults, count: searchResults.length }
        };

      case 'getHubsByCategory':
        const categoryHubs = AppKnowledgeGraph.getHubsByCategory(parameters.category);
        return {
          statusCode: 200,
          body: { hubs: categoryHubs, count: categoryHubs.length }
        };

      case 'getNavigationPath':
        const path = AppKnowledgeGraph.getNavigationPath(
          parameters.fromHubId, 
          parameters.toHubId
        );
        if (!path) {
          return {
            statusCode: 404,
            body: { error: 'Navigation path not found' }
          };
        }
        return {
          statusCode: 200,
          body: { path }
        };

      case 'getRelatedHubs':
        const related = AppKnowledgeGraph.getRelatedHubs(parameters.hubId);
        return {
          statusCode: 200,
          body: { hubs: related, count: related.length }
        };

      case 'suggestNextHub':
        // AI-powered hub suggestion based on current context
        const currentHub = AppKnowledgeGraph.getHubById(parameters.currentHubId);
        if (!currentHub) {
          return { statusCode: 404, body: { error: 'Current hub not found' } };
        }
        
        const suggestions = AppKnowledgeGraph.getRelatedHubs(parameters.currentHubId);
        const userGoal = parameters.userGoal || '';
        
        // Simple matching logic - can be enhanced with Mistral AI
        let bestMatch = suggestions[0];
        if (userGoal.toLowerCase().includes('trade')) {
          bestMatch = HubRegistry.find(h => h.id === 'trading') || bestMatch;
        } else if (userGoal.toLowerCase().includes('ai') || userGoal.toLowerCase().includes('agent')) {
          bestMatch = HubRegistry.find(h => h.id === 'ailab') || bestMatch;
        } else if (userGoal.toLowerCase().includes('data') || userGoal.toLowerCase().includes('analytics')) {
          bestMatch = HubRegistry.find(h => h.id === 'analytics') || bestMatch;
        }
        
        return {
          statusCode: 200,
          body: { 
            suggestion: bestMatch,
            alternatives: suggestions.slice(0, 3),
            reasoning: `Based on your goal: "${userGoal}"`
          }
        };

      default:
        return {
          statusCode: 400,
          body: { error: 'Invalid action' }
        };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: { error: error.message }
    };
  }
}