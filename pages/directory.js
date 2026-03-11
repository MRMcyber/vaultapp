import Layout from '@/components/Layout';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { getDb } from '@/lib/db';

export default function Directory({ users }) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 20;

  const filtered = users.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.first_name.toLowerCase().includes(search.toLowerCase()) ||
    u.last_name.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <Layout title="Staff Directory">
      <Head>
        <title>Directory — VaultApp</title>
      </Head>

      <div className="space-y-6 fade-in">
        {/* Info notice */}
        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-start gap-3">
          <span className="text-xl">📇</span>
          <div>
            <p className="text-blue-400 font-medium text-sm">Employee Directory — Internal Use Only</p>
            <p className="text-blue-400/60 text-xs mt-1">This directory contains contact information for all VaultApp employees.</p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-vault-card border border-vault-border rounded-xl p-4">
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full px-4 py-3 bg-vault-bg border border-vault-border rounded-xl text-white placeholder-vault-text-muted focus:outline-none focus:border-emerald-500 transition-all"
            placeholder="Search by name, username, or email..."
          />
          <p className="text-vault-text-muted text-xs mt-2">{filtered.length} employees found</p>
        </div>

        {/* Table */}
        <div className="bg-vault-card border border-vault-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-vault-border">
                  <th className="text-left p-4 text-vault-text-muted font-medium">Name</th>
                  <th className="text-left p-4 text-vault-text-muted font-medium">Username</th>
                  <th className="text-left p-4 text-vault-text-muted font-medium">Email</th>
                  <th className="text-left p-4 text-vault-text-muted font-medium">UUID</th>
                  <th className="text-left p-4 text-vault-text-muted font-medium">Account</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-vault-border">
                {paged.map(u => (
                  <tr key={u.id} className="hover:bg-white/[0.02]">
                    <td className="p-4 text-white font-medium">{u.first_name} {u.last_name}</td>
                    <td className="p-4 text-vault-text-muted">@{u.username}</td>
                    <td className="p-4 text-vault-text-muted">{u.email}</td>
                    <td className="p-4 font-mono text-xs text-amber-400">{u.uuid}</td>
                    <td className="p-4 font-mono text-xs text-vault-text-muted">{u.account_number}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-vault-card border border-vault-border rounded-lg text-sm text-vault-text-muted hover:text-white disabled:opacity-40 transition-all"
            >
              ← Prev
            </button>
            <span className="text-vault-text-muted text-sm px-4">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-vault-card border border-vault-border rounded-lg text-sm text-vault-text-muted hover:text-white disabled:opacity-40 transition-all"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}

export async function getServerSideProps() {
  try {
    const sql = getDb();
    const users = await sql`
      SELECT id, uuid, username, email, account_number, first_name, last_name, role
      FROM users 
      ORDER BY id ASC
    `;
    return { props: { users } };
  } catch (error) {
    console.error('Directory fetch error:', error);
    return { props: { users: [] } };
  }
}
