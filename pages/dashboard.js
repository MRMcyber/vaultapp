import Layout from '@/components/Layout';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const userData = localStorage.getItem('vault_user');
    if (userData) {
      const u = JSON.parse(userData);
      setUser(u);
      fetchTransactions(u.account_number);
    }
  }, []);

  const fetchTransactions = async (accountId) => {
    try {
      const token = localStorage.getItem('vault_token');
      const res = await fetch(`/api/transactions?account_id=${accountId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.transactions) {
        setTransactions(data.transactions.slice(0, 3));
      }
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    }
  };

  if (!user) return null;

  const quickLinks = [
    { href: '/transactions', label: 'Transaction History', icon: '💳', desc: 'View all transactions' },
    { href: '/messages', label: 'Messages', icon: '✉️', desc: 'Read your messages' },
    { href: '/documents', label: 'Documents', icon: '📄', desc: 'Access your documents' },
    { href: '/notes', label: 'Notes', icon: '📝', desc: 'View private notes' },
    { href: '/profile', label: 'Edit Profile', icon: '👤', desc: 'Update your info' },
    { href: '/lab-guide', label: 'Lab Guide', icon: '🎯', desc: 'Security challenges' },
  ];

  return (
    <Layout title="Dashboard">
      <Head>
        <title>Dashboard — VaultApp</title>
      </Head>

      <div className="space-y-6 fade-in">
        {/* Warning Banner */}
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="text-amber-400 font-semibold">Security Training Lab</p>
            <p className="text-amber-400/70 text-sm mt-1">
              This is a security training lab. All data is fake. Practice finding IDOR vulnerabilities using browser DevTools, Burp Suite, and curl.
            </p>
          </div>
        </div>

        {/* Welcome + Balance */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 bg-gradient-to-br from-emerald-600/20 to-cyan-600/10 border border-emerald-500/20 rounded-2xl p-6">
            <p className="text-vault-text-muted text-sm mb-1">Welcome back,</p>
            <h2 className="text-2xl font-bold text-white mb-4">{user.first_name || user.username} {user.last_name || ''}</h2>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="bg-vault-bg/50 rounded-lg px-4 py-2">
                <p className="text-vault-text-muted text-xs">Account</p>
                <p className="text-white font-mono font-medium">{user.account_number}</p>
              </div>
              <div className="bg-vault-bg/50 rounded-lg px-4 py-2">
                <p className="text-vault-text-muted text-xs">Role</p>
                <p className="text-white font-medium capitalize">{user.role}</p>
              </div>
              <div className="bg-vault-bg/50 rounded-lg px-4 py-2">
                <p className="text-vault-text-muted text-xs">User ID</p>
                <p className="text-white font-mono font-medium">#{user.id}</p>
              </div>
            </div>
          </div>
          <div className="bg-vault-card border border-vault-border rounded-2xl p-6 flex flex-col justify-center">
            <p className="text-vault-text-muted text-sm mb-1">Available Balance</p>
            <p className="text-3xl font-bold text-emerald-400">${user.balance?.toLocaleString()}</p>
            <p className="text-vault-text-muted text-xs mt-2">Last updated: today</p>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Quick Access</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {quickLinks.map(link => (
              <Link key={link.href} href={link.href}
                className="bg-vault-card border border-vault-border rounded-xl p-4 card-hover block">
                <span className="text-2xl mb-2 block">{link.icon}</span>
                <p className="text-white font-medium text-sm">{link.label}</p>
                <p className="text-vault-text-muted text-xs mt-1">{link.desc}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-white">Recent Transactions</h3>
            <Link href="/transactions" className="text-emerald-400 text-sm hover:underline">View all →</Link>
          </div>
          <div className="bg-vault-card border border-vault-border rounded-xl overflow-hidden">
            {transactions.length === 0 ? (
              <div className="p-8 text-center text-vault-text-muted">Loading transactions...</div>
            ) : (
              <div className="divide-y divide-vault-border">
                {transactions.map(txn => (
                  <div key={txn.id} className="p-4 flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{txn.description}</p>
                      <p className="text-vault-text-muted text-xs mt-1">
                        {new Date(txn.transaction_date).toLocaleDateString()} · {txn.from_account} → {txn.to_account}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <p className={`font-mono font-semibold text-sm ${txn.status === 'failed' ? 'text-red-400' : 'text-white'}`}>
                        ${parseFloat(txn.amount).toFixed(2)}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        txn.status === 'completed' ? 'bg-emerald-500/15 text-emerald-400' :
                        txn.status === 'pending' ? 'bg-amber-500/15 text-amber-400' :
                        'bg-red-500/15 text-red-400'
                      }`}>
                        {txn.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
