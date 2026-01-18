export default async function executeMultiSigTransaction(data, context) {
  const { transaction_id, signature } = data;
  
  const transaction = await context.entities.MultiSigTransaction.get(transaction_id);
  if (!transaction) throw new Error('Transaction not found');
  
  if (transaction.status !== 'pending') throw new Error('Transaction not pending');
  
  const signatures = transaction.signatures || [];
  signatures.push({
    signer: context.user.email,
    signature,
    timestamp: new Date().toISOString()
  });
  
  const updatedTransaction = await context.entities.MultiSigTransaction.update(transaction_id, {
    signatures
  });
  
  if (signatures.length >= transaction.required_signatures) {
    await context.entities.MultiSigTransaction.update(transaction_id, {
      status: 'approved'
    });
    
    const walletTx = await context.entities.WalletTransaction.create({
      from_address: transaction.from_address,
      to_address: transaction.to_address,
      amount: transaction.amount,
      token: transaction.token,
      network: 'ethereum',
      type: 'send',
      status: 'pending'
    });
    
    return { approved: true, wallet_transaction: walletTx };
  }
  
  return { approved: false, signatures_remaining: transaction.required_signatures - signatures.length };
}