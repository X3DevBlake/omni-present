export default async function processOmniCardTransaction(data, context) {
  const { card_id, merchant, amount, category } = data;
  
  const card = await context.entities.OmniCardExtended.get(card_id);
  if (!card) throw new Error('Card not found');
  
  if (card.status !== 'active') throw new Error('Card is not active');
  if (amount > card.spending_limit) throw new Error('Transaction exceeds spending limit');
  
  // Calculate cashback
  const cashback = amount * card.cash_back_rate;
  
  // Create transaction
  const transaction = await context.entities.PaymentTransaction.create({
    user_email: card.user_email,
    card_id,
    merchant,
    amount,
    category,
    cashback,
    status: 'completed',
    transaction_type: 'purchase'
  });
  
  // Track spending
  await context.entities.AgentSpending.create({
    user_email: card.user_email,
    card_id,
    amount,
    category,
    merchant,
    cashback_earned: cashback
  });
  
  return { transaction, cashback };
}