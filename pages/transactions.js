import Layout from '@/components/Layout';
import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [accountId, setAccountId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('vault_user');
    if (userData) {
      const u = JSON.parse(userData);
      setAccountId(u.account_number);
      fetchTransactions(u.account_number);
    }
  }, []);

  const fetchTransactions = async (acctId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('vault_token');
      const res = await fetch(`/api/transactions?account_id=${acctId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      setTransactions(data.transactions || []);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    }
    setLoading(false);
  };

  return (
    <Layout title="Transactions">
      <Head>
        <title>Transactions — VaultApp</title>
      </Head>

      <div className="space-y-6 fade-in">
        {/* Account filter */}
        <div className="bg-vault-card border border-vault-border rounded-xl p-4 flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-vault-text-muted text-xs mb-1">Viewing transactions for</p>
            <p className="text-white font-mono font-medium">{accountId}</p>
          </div>
          <div className="text-sm text-vault-text-muted">
            {transactions.length} transactions found
          </div>
        </div>

        {/* Transactions list */}
        <div className="bg-vault-card border border-vault-border rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-vault-text-muted">Loading transactions...</div>
          ) : transactions.length === 0 ? (
            <div className="p-8 text-center text-vault-text-muted">No transactions found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-vault-border">
                    <th className="text-left p-4 text-vault-text-muted font-medium">ID</th>
                    <th className="text-left p-4 text-vault-text-muted font-medium">Description</th>
                    <th className="text-left p-4 text-vault-text-muted font-medium">From</th>
                    <th className="text-left p-4 text-vault-text-muted font-medium">To</th>
                    <th className="text-right p-4 text-vault-text-muted font-medium">Amount</th>
                    <th className="text-left p-4 text-vault-text-muted font-medium">Status</th>
                    <th className="text-left p-4 text-vault-text-muted font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-vault-border">
                  {transactions.map(txn => (
                    <tr key={txn.id} className="hover:bg-white/[0.02]">
                      <td className="p-4 text-vault-text-muted font-mono text-xs">#{txn.id}</td>
                      <td className="p-4 text-white max-w-xs truncate">{txn.description}</td>
                      <td className="p-4 text-vault-text-muted font-mono text-xs">{txn.from_account}</td>
                      <td className="p-4 text-vault-text-muted font-mono text-xs">{txn.to_account}</td>
                      <td className="p-4 text-right text-white font-mono">${parseFloat(txn.amount).toFixed(2)}</td>
                      <td className="p-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          txn.status === 'completed' ? 'bg-emerald-500/15 text-emerald-400' :
                          txn.status === 'pending' ? 'bg-amber-500/15 text-amber-400' :
                          'bg-red-500/15 text-red-400'
                        }`}>{txn.status}</span>
                      </td>
                      <td className="p-4 text-vault-text-muted text-xs">{new Date(txn.transaction_date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
