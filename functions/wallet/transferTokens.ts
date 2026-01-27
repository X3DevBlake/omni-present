import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { recipientAddress, amount } = await req.json();

        // Get sender wallet
        const wallets = await base44.entities.UserWallet.filter({ user_id: user.id });
        const senderWallet = wallets.data[0];

        if (!senderWallet) {
            return Response.json({ error: 'Wallet not found' }, { status: 404 });
        }

        if (senderWallet.balance < amount) {
            return Response.json({ error: 'Insufficient funds' }, { status: 400 });
        }

        // Update sender balance
        await base44.entities.UserWallet.update(senderWallet.id, {
            balance: senderWallet.balance - amount
        });

        // Check if recipient exists within the system
        const recipientWallets = await base44.entities.UserWallet.filter({ address: recipientAddress });
        if (recipientWallets.data.length > 0) {
            const recipientWallet = recipientWallets.data[0];
            await base44.entities.UserWallet.update(recipientWallet.id, {
                balance: recipientWallet.balance + Number(amount)
            });
        }

        // Record transaction
        await base44.entities.WalletTransaction.create({
            from_address: senderWallet.address,
            to_address: recipientAddress,
            amount: Number(amount),
            currency: 'OMNI',
            timestamp: new Date().toISOString(),
            status: 'completed',
            type: 'transfer',
            user_id: user.id
        });

        return Response.json({ success: true, newBalance: senderWallet.balance - amount });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});