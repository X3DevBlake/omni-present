export default async function calculateImpermanentLoss(data, context) {
  const { pool_id, initial_price_a, initial_price_b, current_price_a, current_price_b } = data;
  
  const priceRatio = (current_price_a / current_price_b) / (initial_price_a / initial_price_b);
  const impermanentLoss = (2 * Math.sqrt(priceRatio) / (1 + priceRatio) - 1) * 100;
  
  return {
    impermanent_loss_percentage: impermanentLoss.toFixed(2),
    price_ratio_change: ((priceRatio - 1) * 100).toFixed(2),
    severity: Math.abs(impermanentLoss) > 20 ? 'high' : Math.abs(impermanentLoss) > 10 ? 'medium' : 'low'
  };
}