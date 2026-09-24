export default async function processOmniStaking(data, context) {
  const { user_email, amount_omni, lock_period_days = 0 } = data;
  
  const apyRates = {
    0: 5.0,    // Flexible
    30: 8.0,   // 30 days
    90: 12.0,  // 90 days
    180: 18.0, // 180 days
    365: 25.0  // 1 year
  };
  
  const apy = apyRates[lock_period_days] || 5.0;
  const somniRatio = 1.0;
  const amount_somni = amount_omni * somniRatio;
  
  const unlockDate = new Date();
  unlockDate.setDate(unlockDate.getDate() + lock_period_days);
  
  const stake = await context.entities.OmniStake.create({
    user_email,
    amount_omni,
    amount_somni,
    apy,
    start_date: new Date().toISOString(),
    lock_period_days,
    unlock_date: unlockDate.toISOString(),
    status: 'active',
    rewards_earned: 0,
    auto_compound: true
  });
  
  await context.entities.OmniTransaction.create({
    user_email,
    transaction_type: 'stake',
    amount: amount_omni,
    token: 'OMNI',
    status: 'completed',
    metadata: { stake_id: stake.id }
  });
  
  return { stake, apy, projected_annual_return: amount_omni * (apy / 100) };
}