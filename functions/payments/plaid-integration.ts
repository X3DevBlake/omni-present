import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
import { base44 } from '@/api/base44Client';

const plaidClient = new PlaidApi(new Configuration({
  basePath: PlaidEnvironments.Production,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
}));

export async function createPlaidLinkToken(userEmail) {
  const response = await plaidClient.linkTokenCreate({
    user: { client_user_id: userEmail },
    client_name: 'Omni Banking',
    language: 'en',
    country_codes: ['US'],
    products: ['auth', 'transactions'],
  });

  return response.data.link_token;
}

export async function exchangePlaidToken(publicToken) {
  const response = await plaidClient.itemPublicTokenExchange({
    public_token: publicToken,
  });

  return response.data.access_token;
}

export async function getBankingData(accessToken) {
  const accountsResponse = await plaidClient.accountsGet({ access_token: accessToken });
  const transactionsResponse = await plaidClient.transactionsGet({
    access_token: accessToken,
    start_date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
  });

  return {
    accounts: accountsResponse.data.accounts,
    transactions: transactionsResponse.data.transactions,
  };
}

export async function calculateCreditScore(accessToken, userEmail) {
  const data = await getBankingData(accessToken);
  const transactions = data.transactions;
  
  // Calculate credit metrics
  const totalTransactions = transactions.length;
  const onTimePayments = transactions.filter(t => t.pending === false).length;
  const averageBalance = data.accounts.reduce((sum, acc) => sum + (acc.balances?.current || 0), 0) / data.accounts.length;

  const paymentHistoryScore = (onTimePayments / totalTransactions) * 35;
  const accountAgeScore = Math.min(data.accounts.length * 10, 15);
  const balanceScore = Math.min((averageBalance / 10000) * 30, 30);
  const inquiryScore = 10;

  const overallScore = Math.round(paymentHistoryScore + accountAgeScore + balanceScore + inquiryScore + 300);

  const defaultRisk = 100 - (overallScore - 300) / 5.5;

  const creditScore = {
    user_email: userEmail,
    overall_score: Math.min(overallScore, 850),
    payment_history: paymentHistoryScore,
    credit_utilization: 100 - (averageBalance / (averageBalance * 2)) * 100,
    account_age: data.accounts.length * 6,
    default_risk: Math.max(defaultRisk, 1),
    analysis: {
      total_accounts: data.accounts.length,
      average_balance: averageBalance,
      on_time_payments: onTimePayments,
      total_transactions: totalTransactions,
    }
  };

  await base44.entities.CreditScore.create(creditScore);
  return creditScore;
}