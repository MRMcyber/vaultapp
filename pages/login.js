import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      // Intentional: store JWT in localStorage
      localStorage.setItem('vault_token', data.token);
      localStorage.setItem('vault_user', JSON.stringify(data.user));
      router.push('/dashboard');
    } catch (err) {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>VaultApp — Sign In</title>
        <meta name="description" content="Sign in to your VaultApp account" />
      </Head>
      <div className="min-h-screen bg-vault-bg flex items-center justify-center p-4">
        {/* Background decoration */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="w-full max-w-md relative fade-in">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-2xl font-bold mx-auto mb-4 glow-accent">
              V
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">VaultApp</h1>
            <p className="text-vault-text-muted">Secure Personal Finance Portal</p>
          </div>

          {/* Login Card */}
          <div className="bg-vault-card border border-vault-border rounded-2xl p-8 glow-accent">
            <h2 className="text-xl font-semibold text-white mb-6">Sign in to your account</h2>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-vault-text-muted mb-2">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-vault-bg border border-vault-border rounded-xl text-white placeholder-vault-text-muted focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  placeholder="Enter your username"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-vault-text-muted mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-vault-bg border border-vault-border rounded-xl text-white placeholder-vault-text-muted focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  placeholder="Enter your password"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </div>

          {/* Lab hint */}
          <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-center">
            <p className="text-amber-400 text-sm font-medium">⚠️ Security Training Lab</p>
            <p className="text-amber-400/70 text-xs mt-1">Test credentials: player / player123</p>
          </div>
        </div>
      </div>
    </>
  );
}
