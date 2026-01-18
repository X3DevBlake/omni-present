import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch transactions
    const transactions = await base44.entities.FinancialTransaction?.filter?.(
      { created_by: user.email }
    ).catch(() => []);

    // Categorize spending
    const spending = {
      food: 0,
      transport: 0,
      entertainment: 0,
      utilities: 0,
      health: 0,
      shopping: 0,
      other: 0,
    };

    const totalSpent = transactions?.reduce((sum, t) => {
      const category = categorizeTransaction(t);
      spending[category] = (spending[category] || 0) + t.amount;
      return sum + t.amount;
    }, 0) || 0;

    // Calculate recommendations
    const recommendations = generateRecommendations(spending, totalSpent);

    return Response.json({
      success: true,
      totalSpent,
      spending,
      budget: {
        food: 500,
        transport: 300,
        entertainment: 200,
        utilities: 350,
        health: 250,
        shopping: 200,
      },
      recommendations,
      monthlyAverage: totalSpent / 30,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function categorizeTransaction(transaction) {
  const merchant = transaction.merchant?.toLowerCase() || '';
  if (merchant.includes('grocery') || merchant.includes('restaurant')) return 'food';
  if (merchant.includes('uber') || merchant.includes('gas')) return 'transport';
  if (merchant.includes('cinema') || merchant.includes('game')) return 'entertainment';
  if (merchant.includes('electric') || merchant.includes('water')) return 'utilities';
  if (merchant.includes('pharmacy') || merchant.includes('doctor')) return 'health';
  return 'other';
}

function generateRecommendations(spending, totalSpent) {
  const recommendations = [];
  
  if (spending.food > 500) {
    recommendations.push('Consider reducing dining out expenses by 20%');
  }
  if (spending.entertainment > 200) {
    recommendations.push('Entertainment spending is above budget');
  }
  if (spending.other > 500) {
    recommendations.push('Review miscellaneous expenses for optimization');
  }

  return recommendations;
}