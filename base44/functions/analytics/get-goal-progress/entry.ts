import { base44 } from '@/api/base44Client';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userEmail, goalId } = req.query;

    if (!userEmail) {
      return res.status(400).json({ error: 'User email is required' });
    }

    // Fetch goals
    const goals = await base44.entities.FinancialGoal.filter({ user_email: userEmail }).catch(() => []);
    const targetGoals = goalId ? goals.filter(g => g.id === goalId) : goals;

    // Calculate progress details
    const progressData = targetGoals.map(goal => {
      const daysRemaining = goal.target_date 
        ? Math.ceil((new Date(goal.target_date) - new Date()) / (1000 * 60 * 60 * 24))
        : null;
      
      const progressPercentage = goal.target_amount > 0
        ? (goal.current_amount / goal.target_amount) * 100
        : 0;

      const projectedCompletion = goal.current_amount > 0 && daysRemaining > 0
        ? (goal.current_amount / goal.target_amount) * daysRemaining
        : null;

      return {
        goalId: goal.id,
        goalName: goal.name,
        category: goal.category,
        targetAmount: goal.target_amount,
        currentAmount: goal.current_amount,
        progressPercentage: Math.min(progressPercentage, 100),
        remainingAmount: Math.max(goal.target_amount - goal.current_amount, 0),
        targetDate: goal.target_date,
        daysRemaining,
        status: goal.status,
        priority: goal.priority,
        projectedCompletionDays: projectedCompletion
      };
    });

    // Summary stats
    const activeGoals = progressData.filter(g => g.status === 'active');
    const totalProgress = activeGoals.reduce((sum, g) => sum + g.progressPercentage, 0) / (activeGoals.length || 1);

    res.status(200).json({
      success: true,
      goals: progressData,
      summary: {
        totalGoals: targetGoals.length,
        activeGoals: activeGoals.length,
        completedGoals: progressData.filter(g => g.status === 'completed').length,
        averageProgress: totalProgress.toFixed(1),
        totalSaved: progressData.reduce((sum, g) => sum + g.currentAmount, 0),
        totalTarget: progressData.reduce((sum, g) => sum + g.targetAmount, 0)
      }
    });
  } catch (error) {
    console.error('Get goal progress error:', error);
    res.status(500).json({ error: 'Failed to fetch goal progress' });
  }
}