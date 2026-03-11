import Layout from '@/components/Layout';
import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ phone: '', address: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('vault_user');
    if (userData) {
      const u = JSON.parse(userData);
      setUser(u);
      fetchProfile(u.id);
    }
  }, []);

  const fetchProfile = async (id) => {
    try {
      const token = localStorage.getItem('vault_token');
      const res = await fetch(`/api/users/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      setUser(prev => ({ ...prev, ...data }));
      setForm({ phone: data.phone || '', address: data.address || '' });
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const token = localStorage.getItem('vault_token');
      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Profile updated successfully!');
        const updatedUser = { ...user, ...data.user };
        setUser(updatedUser);
        // Persist updated user data (including any changed role/balance) to localStorage
        localStorage.setItem('vault_user', JSON.stringify(updatedUser));
      } else {
        setError(data.error || 'Update failed');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  if (!user) return null;

  return (
    <Layout title="Profile">
      <Head>
        <title>Profile — VaultApp</title>
      </Head>

      <div className="max-w-3xl space-y-6 fade-in">
        {/* Profile card */}
        <div className="bg-vault-card border border-vault-border rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-2xl font-bold">
              {user.username?.[0]?.toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{user.first_name} {user.last_name}</h2>
              <p className="text-vault-text-muted text-sm">@{user.username} · {user.role}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="bg-vault-bg rounded-xl p-4">
              <p className="text-vault-text-muted text-xs mb-1">Email</p>
              <p className="text-white font-medium">{user.email}</p>
            </div>
            <div className="bg-vault-bg rounded-xl p-4">
              <p className="text-vault-text-muted text-xs mb-1">Account Number</p>
              <p className="text-white font-mono">{user.account_number}</p>
            </div>
            <div className="bg-vault-bg rounded-xl p-4">
              <p className="text-vault-text-muted text-xs mb-1">Balance</p>
              <p className="text-emerald-400 font-bold">${user.balance?.toLocaleString()}</p>
            </div>
            <div className="bg-vault-bg rounded-xl p-4">
              <p className="text-vault-text-muted text-xs mb-1">SSN (last 4)</p>
              <p className="text-white font-mono">XXX-XX-{user.ssn_last4}</p>
            </div>
            <div className="bg-vault-bg rounded-xl p-4">
              <p className="text-vault-text-muted text-xs mb-1">Phone</p>
              <p className="text-white">{user.phone}</p>
            </div>
            <div className="bg-vault-bg rounded-xl p-4">
              <p className="text-vault-text-muted text-xs mb-1">Member Since</p>
              <p className="text-white">{user.date_joined ? new Date(user.date_joined).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Edit form */}
        <div className="bg-vault-card border border-vault-border rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Edit Profile</h3>
          <p className="text-vault-text-muted text-sm mb-4">Update your contact information below.</p>

          {message && (
            <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm">{message}</div>
          )}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-vault-text-muted mb-2">Phone</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-4 py-3 bg-vault-bg border border-vault-border rounded-xl text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-vault-text-muted mb-2">Address</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-4 py-3 bg-vault-bg border border-vault-border rounded-xl text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold rounded-xl transition-all"
            >
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
