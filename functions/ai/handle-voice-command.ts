/**
 * Handle Voice Commands
 * - Processes natural language voice input
 * - Routes to appropriate actions
 * - Returns structured responses
 */

import { base44 } from '@base44/sdk';

export default async function handler(req, res) {
  try {
    const { userEmail, voiceInput } = req.body;

    // Process voice command with LLM
    const commandAnalysis = await base44.integrations.Core.InvokeLLM({
      prompt: `Parse this voice command and identify the action:
      "${voiceInput}"
      
      Return JSON with: 
      - action (show_portfolio, show_analytics, create_goal, check_budget, etc)
      - parameters (object with relevant params)
      - confidence (0-1)
      - requires_confirmation (boolean if sensitive action)`,
      response_json_schema: {
        type: 'object',
        properties: {
          action: { type: 'string' },
          parameters: { type: 'object' },
          confidence: { type: 'number' },
          requires_confirmation: { type: 'boolean' }
        }
      }
    });

    // Execute action based on command
    let result = null;

    switch (commandAnalysis.action) {
      case 'show_portfolio':
        const transactions = await base44.entities.FinancialTransaction.filter({
          user_email: userEmail
        });
        result = { type: 'portfolio', data: transactions };
        break;

      case 'show_analytics':
        const budgets = await base44.entities.Budget.filter({
          user_email: userEmail
        });
        result = { type: 'analytics', data: budgets };
        break;

      case 'create_goal':
        const newGoal = await base44.entities.FinancialGoal.create({
          user_email: userEmail,
          name: commandAnalysis.parameters.goal_name || 'New Goal',
          target_amount: commandAnalysis.parameters.amount || 0,
          target_date: commandAnalysis.parameters.date || new Date().toISOString(),
          category: commandAnalysis.parameters.category || 'savings'
        });
        result = { type: 'goal_created', data: newGoal };
        break;

      default:
        result = { type: 'unknown', message: 'Command not recognized' };
    }

    res.status(200).json({
      success: true,
      command_analysis: commandAnalysis,
      result: result
    });
  } catch (error) {
    console.error('Voice command error:', error);
    res.status(500).json({ error: error.message });
  }
}