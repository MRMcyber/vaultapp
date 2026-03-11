import Layout from '@/components/Layout';
import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Admin() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [targetUserId, setTargetUserId] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('vault_user');
    if (userData) {
      const u = JSON.parse(userData);
      setUser(u);
      // Client-side only role check — the API has NO server-side role check
      setIsAdmin(u.role === 'admin');
    }
  }, []);

  const fetchAuditLogs = async () => {
    if (!targetUserId) return;
    try {
      const token = localStorage.getItem('vault_token');
      const res = await fetch(`/api/admin/audit-logs?user_id=${targetUserId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      setAuditLogs(data.logs || []);
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    }
  };

  const deleteUser = async (userId) => {
    if (!confirm(`Are you sure you want to delete user #${userId}?`)) return;
    try {
      const token = localStorage.getItem('vault_token');
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        alert(`User deleted: ${data.deleted_user.username}`);
      } else {
        alert(data.error || 'Failed to delete user');
      }
    } catch (err) {
      alert('Network error');
    }
  };

  if (!user) return null;

  return (
    <Layout title="Admin Panel">
      <Head>
        <title>Admin — VaultApp</title>
      </Head>

      <div className="space-y-6 fade-in">
        {/* Client-side access check */}
        {!isAdmin ? (
          <div className="max-w-lg mx-auto text-center py-20">
            <div className="text-6xl mb-4">🔐</div>
            <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
            <p className="text-vault-text-muted">You do not have admin privileges to access this panel.</p>
            <p className="text-vault-text-muted text-sm mt-2">Current role: <span className="text-amber-400 font-mono">{user.role}</span></p>
            <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <p className="text-amber-400/70 text-xs">
                💡 Hint: This is only a client-side check. The underlying API endpoints may behave differently...
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
              <span className="text-xl">🛡️</span>
              <div>
                <p className="text-red-400 font-medium text-sm">Admin Panel — Restricted Area</p>
                <p className="text-red-400/60 text-xs mt-1">All actions are logged. Proceed with caution.</p>
              </div>
            </div>

            {/* Audit Log Viewer */}
            <div className="bg-vault-card border border-vault-border rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Audit Logs</h3>
              <div className="flex gap-3 mb-4">
                <input
                  type="number"
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(e.target.value)}
                  className="flex-1 px-4 py-3 bg-vault-bg border border-vault-border rounded-xl text-white placeholder-vault-text-muted focus:outline-none focus:border-emerald-500 transition-all"
                  placeholder="Enter User ID to view logs..."
                />
                <button
                  onClick={fetchAuditLogs}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition-all"
                >
                  Fetch Logs
                </button>
              </div>

              {auditLogs.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-vault-border">
                        <th className="text-left p-3 text-vault-text-muted font-medium">ID</th>
                        <th className="text-left p-3 text-vault-text-muted font-medium">Action</th>
                        <th className="text-left p-3 text-vault-text-muted font-medium">User</th>
                        <th className="text-left p-3 text-vault-text-muted font-medium">Target</th>
                        <th className="text-left p-3 text-vault-text-muted font-medium">IP</th>
                        <th className="text-left p-3 text-vault-text-muted font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-vault-border">
                      {auditLogs.map(log => (
                        <tr key={log.id} className="hover:bg-white/[0.02]">
                          <td className="p-3 text-vault-text-muted font-mono text-xs">#{log.id}</td>
                          <td className="p-3">
                            <span className={`text-xs px-2 py-1 rounded-full font-mono ${
                              log.action.includes('LOGIN') ? 'bg-blue-500/15 text-blue-400' :
                              log.action.includes('DELETE') || log.action.includes('ROLE') ? 'bg-red-500/15 text-red-400' :
                              'bg-vault-border text-vault-text-muted'
                            }`}>{log.action}</span>
                          </td>
                          <td className="p-3 text-white text-xs">{log.user_username}</td>
                          <td className="p-3 text-vault-text-muted text-xs">{log.target_username || '-'}</td>
                          <td className="p-3 text-vault-text-muted font-mono text-xs">{log.ip_address}</td>
                          <td className="p-3 text-vault-text-muted text-xs">{new Date(log.created_at).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* User Management */}
            <div className="bg-vault-card border border-vault-border rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">User Management</h3>
              <p className="text-vault-text-muted text-sm mb-4">Delete a user account by entering their ID.</p>
              <div className="flex gap-3">
                <input
                  id="deleteUserId"
                  type="number"
                  className="flex-1 px-4 py-3 bg-vault-bg border border-vault-border rounded-xl text-white placeholder-vault-text-muted focus:outline-none focus:border-red-500 transition-all"
                  placeholder="User ID to delete..."
                />
                <button
                  onClick={() => {
                    const id = document.getElementById('deleteUserId').value;
                    if (id) deleteUser(id);
                  }}
                  className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-medium rounded-xl transition-all"
                >
                  Delete User
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
