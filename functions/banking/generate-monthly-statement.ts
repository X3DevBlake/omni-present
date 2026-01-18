export default async function generateMonthlyStatement(data, context) {
  const { user_email, month, year } = data;
  
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);
  
  const transactions = await context.entities.PaymentTransaction.filter({
    user_email,
    created_date: { $gte: startDate.toISOString(), $lte: endDate.toISOString() }
  });
  
  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
  const totalCashback = transactions.reduce((sum, t) => sum + (t.cashback || 0), 0);
  const transactionCount = transactions.length;
  
  const categoryBreakdown = {};
  transactions.forEach(t => {
    categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount;
  });
  
  const statement = await context.entities.MonthlyStatement.create({
    user_email,
    month,
    year,
    total_spent: totalSpent,
    total_cashback: totalCashback,
    transaction_count: transactionCount,
    category_breakdown: categoryBreakdown,
    transactions: transactions.map(t => t.id)
  });
  
  return statement;
}