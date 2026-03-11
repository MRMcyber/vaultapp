import { useRouter } from 'next/router';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/profile', label: 'Profile', icon: '👤' },
  { href: '/transactions', label: 'Transactions', icon: '💳' },
  { href: '/messages', label: 'Messages', icon: '✉️' },
  { href: '/documents', label: 'Documents', icon: '📄' },
  { href: '/notes', label: 'Notes', icon: '📝' },
  { href: '/directory', label: 'Directory', icon: '📇' },
  { href: '/admin', label: 'Admin Panel', icon: '🔐' },
  { href: '/lab-guide', label: 'Lab Guide', icon: '🎯' },
];

export default function Layout({ children, title = 'VaultApp' }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('vault_token');
    const userData = localStorage.getItem('vault_user');
    if (!token || !userData) {
      router.push('/login');
      return;
    }
    try {
      setUser(JSON.parse(userData));
    } catch {
      router.push('/login');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('vault_token');
    localStorage.removeItem('vault_user');
    router.push('/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-vault-bg flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-vault-card border-r border-vault-border flex flex-col transform transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className="p-5 border-b border-vault-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center font-bold text-lg">V</div>
            <div>
              <h1 className="font-bold text-lg text-white">VaultApp</h1>
              <p className="text-xs text-vault-text-muted">Secure Finance Portal</p>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const isActive = router.pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                    : 'text-vault-text-muted hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-vault-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-sm font-bold">
              {user.username?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.username}</p>
              <p className="text-xs text-vault-text-muted">{user.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-3 py-2 text-sm text-vault-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all flex items-center gap-2"
          >
            <span>🚪</span> Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 border-b border-vault-border bg-vault-card/50 backdrop-blur-sm flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 text-vault-text-muted hover:text-white rounded-lg hover:bg-white/5"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h2 className="text-lg font-semibold text-white">{title}</h2>
          </div>
          <div className="flex items-center gap-3 text-sm text-vault-text-muted">
            <span className="hidden sm:inline">{user.account_number}</span>
            <div className="w-2 h-2 rounded-full bg-emerald-500 pulse-glow"></div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
