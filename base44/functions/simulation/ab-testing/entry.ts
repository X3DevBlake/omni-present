import { base44 } from '@/api/base44Client';

export async function createABTest(userEmail, testData) {
  const test = {
    user_email: userEmail,
    name: testData.name,
    description: testData.description,
    metric: testData.metric,
    strategy_a: testData.strategyA || {},
    strategy_b: testData.strategyB || {},
    sample_size: testData.sampleSize || 100,
    status: 'setup',
    results_a: {},
    results_b: {},
    confidence_level: 0.95
  };

  return await base44.entities.ABTest.create(test);
}

export async function runABTest(testId) {
  const test = await base44.entities.ABTest.filter({ id: testId });
  if (test.length === 0) return null;

  const testData = test[0];

  // Simulate test results
  const resultsA = generateTestResults(testData.strategy_a, testData.sample_size);
  const resultsB = generateTestResults(testData.strategy_b, testData.sample_size);

  // Calculate statistical significance
  const tScore = calculateTScore(resultsA, resultsB);
  const winner = determinWinner(resultsA, resultsB, tScore);

  return await base44.entities.ABTest.update(testId, {
    status: 'completed',
    results_a: resultsA,
    results_b: resultsB,
    winner
  });
}

export async function getABTestResults(testId) {
  const test = await base44.entities.ABTest.filter({ id: testId });
  if (test.length === 0) return null;

  const testData = test[0];
  return {
    name: testData.name,
    metric: testData.metric,
    status: testData.status,
    results_a: testData.results_a,
    results_b: testData.results_b,
    winner: testData.winner
  };
}

function generateTestResults(strategy, sampleSize) {
  const baseValue = strategy.baseValue || 100;
  const variance = strategy.variance || 10;

  const results = [];
  for (let i = 0; i < sampleSize; i++) {
    results.push(baseValue + (Math.random() - 0.5) * variance * 2);
  }

  const mean = results.reduce((a, b) => a + b, 0) / results.length;
  const variance_ = results.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / results.length;
  const std = Math.sqrt(variance_);

  return {
    mean,
    std,
    min: Math.min(...results),
    max: Math.max(...results),
    sample_count: sampleSize
  };
}

function calculateTScore(resultsA, resultsB) {
  const pooledStd = Math.sqrt(
    ((resultsA.sample_count - 1) * Math.pow(resultsA.std, 2) +
      (resultsB.sample_count - 1) * Math.pow(resultsB.std, 2)) /
    (resultsA.sample_count + resultsB.sample_count - 2)
  );

  const tScore = (resultsA.mean - resultsB.mean) /
    (pooledStd * Math.sqrt(1 / resultsA.sample_count + 1 / resultsB.sample_count));

  return tScore;
}

function determinWinner(resultsA, resultsB, tScore) {
  const criticalValue = 1.96; // For 95% confidence

  if (Math.abs(tScore) < criticalValue) return 'tie';
  return tScore > 0 ? 'a' : 'b';
}