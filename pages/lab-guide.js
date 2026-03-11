import Layout from '@/components/Layout';
import Head from 'next/head';
import { useState, useEffect } from 'react';

const challenges = [
  {
    id: 1,
    title: 'Sequential ID Enumeration',
    difficulty: 'Easy',
    diffColor: 'bg-emerald-500/15 text-emerald-400',
    method: 'GET',
    type: 'URL Parameter',
    endpoint: '/api/users/[id]',
    description: 'User profiles are accessed via sequential integer IDs in the URL path. What happens if you change the ID?',
    hint: 'Try browsing to different user IDs. Your ID is 42 — what about 1, 2, or 299?',
  },
  {
    id: 2,
    title: 'Query Parameter Manipulation',
    difficulty: 'Easy',
    diffColor: 'bg-emerald-500/15 text-emerald-400',
    method: 'GET',
    type: 'Query Parameter',
    endpoint: '/api/transactions?account_id=',
    description: 'Transaction history is fetched using an account_id query parameter. Whose transactions can you view?',
    hint: 'Check the Network tab when viewing your transactions. Notice the account_id format.',
  },
  {
    id: 3,
    title: 'POST Body Object Reference',
    difficulty: 'Medium',
    diffColor: 'bg-amber-500/15 text-amber-400',
    method: 'POST',
    type: 'Request Body',
    endpoint: '/api/messages/read',
    description: 'Messages are read by sending a message_id in the POST body. Can you read messages not addressed to you?',
    hint: 'Intercept the request when opening a message. Try different message_id values.',
  },
  {
    id: 4,
    title: 'Mass Assignment Attack',
    difficulty: 'Medium',
    diffColor: 'bg-amber-500/15 text-amber-400',
    method: 'POST',
    type: 'Request Body',
    endpoint: '/api/profile/update',
    description: 'The profile update endpoint accepts certain fields. But does it accept MORE fields than it should?',
    hint: 'Intercept the profile update request. The frontend sends phone and address — what other fields might the server accept?',
  },
  {
    id: 5,
    title: 'Base64 Encoded ID Bypass',
    difficulty: 'Medium',
    diffColor: 'bg-amber-500/15 text-amber-400',
    method: 'GET',
    type: 'URL Parameter (Encoded)',
    endpoint: '/api/documents/[encoded_id]',
    description: 'Documents use Base64-encoded IDs instead of plain integers. Does encoding equal security?',
    hint: 'Decode the Base64 ID from the URL. What do you get? Can you predict other document IDs?',
  },
  {
    id: 6,
    title: 'UUID Information Leakage',
    difficulty: 'Medium',
    diffColor: 'bg-amber-500/15 text-amber-400',
    method: 'GET',
    type: 'URL Parameter (UUID)',
    endpoint: '/api/users/profile/[uuid]',
    description: 'A hidden profile endpoint uses UUIDs instead of integer IDs. UUIDs are unguessable... unless they\'re leaked somewhere.',
    hint: 'Where on this application can you find other users\' UUIDs? Check the directory page.',
  },
  {
    id: 7,
    title: 'Vertical Privilege Escalation',
    difficulty: 'Hard',
    diffColor: 'bg-red-500/15 text-red-400',
    method: 'DELETE',
    type: 'URL Parameter',
    endpoint: '/api/admin/users/[id]',
    description: 'Admin-only user deletion endpoint. But is the admin check really enforced?',
    hint: 'The admin panel shows "Access Denied" — but that\'s the frontend. Try calling the API directly.',
  },
  {
    id: 8,
    title: 'Private Note Access',
    difficulty: 'Easy',
    diffColor: 'bg-emerald-500/15 text-emerald-400',
    method: 'GET',
    type: 'URL Parameter',
    endpoint: '/api/notes/[id]',
    description: 'Notes have a "private" flag. Does the server actually enforce it?',
    hint: 'Try accessing notes with different IDs. Private notes may contain sensitive information.',
  },
  {
    id: 9,
    title: 'API Key Impersonation',
    difficulty: 'Hard',
    diffColor: 'bg-red-500/15 text-red-400',
    method: 'GET',
    type: 'HTTP Header',
    endpoint: '/api/account/export',
    description: 'The account export feature uses an API key for authorization. Chain this with another vulnerability for full impact.',
    hint: 'This endpoint uses an X-API-Key header. If you could get someone else\'s API key, what could you do?',
  },
  {
    id: 10,
    title: 'Admin Audit Log Exposure',
    difficulty: 'Medium',
    diffColor: 'bg-amber-500/15 text-amber-400',
    method: 'GET',
    type: 'Query Parameter',
    endpoint: '/api/admin/audit-logs?user_id=',
    description: 'Audit logs should be admin-only. But are they?',
    hint: 'Try calling this endpoint directly with different user_id values. Do you need to be an admin?',
  },
];

export default function LabGuide() {
  const [timeLeft, setTimeLeft] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    // Target time: 10:00 PM today (local time)
    const now = new Date();
    const targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 22, 0, 0);
    
    const calculateTimeLeft = () => {
      const currentTime = new Date();
      const difference = targetDate.getTime() - currentTime.getTime();

      if (difference <= 0) {
        setIsUnlocked(true);
        setTimeLeft('');
      } else {
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        
        setTimeLeft(
          `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
      }
    };

    calculateTimeLeft(); // Initial calculation
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <Layout title="Lab Guide">
      <Head>
        <title>Lab Guide — VaultApp</title>
      </Head>

      <div className="space-y-8 fade-in max-w-5xl">
        {/* Header */}
        <div className="text-center py-6">
          <h1 className="text-3xl font-bold text-white mb-3">🎯 IDOR Challenge Lab</h1>
          <p className="text-vault-text-muted max-w-2xl mx-auto">
            Find and exploit all 10 Insecure Direct Object Reference (IDOR) vulnerabilities hidden in this application.
            Each challenge teaches a different IDOR attack pattern found in real-world applications.
          </p>
        </div>

        {!isUnlocked ? (
          <div className="max-w-md mx-auto mt-12 bg-vault-card border border-amber-500/30 rounded-2xl p-8 text-center shadow-[0_0_30px_rgba(245,158,11,0.1)]">
            <span className="text-5xl mb-4 block">🔒</span>
            <h2 className="text-2xl font-bold text-white mb-2">Lab Guide Locked</h2>
            <p className="text-vault-text-muted mb-6">The challenge details will automatically unlock tonight at 10:00 PM.</p>
            <div className="font-mono text-4xl font-bold text-amber-400 tracking-wider">
              {timeLeft || '00:00:00'}
            </div>
            <p className="text-xs text-vault-text-muted mt-6 uppercase tracking-widest">Time Remaining</p>
          </div>
        ) : (
          <>
            {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-vault-card border border-vault-border rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-emerald-400">10</p>
            <p className="text-vault-text-muted text-xs mt-1">Vulnerabilities</p>
          </div>
          <div className="bg-vault-card border border-vault-border rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-amber-400">300</p>
            <p className="text-vault-text-muted text-xs mt-1">User Accounts</p>
          </div>
          <div className="bg-vault-card border border-vault-border rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-red-400">6</p>
            <p className="text-vault-text-muted text-xs mt-1">Data Tables</p>
          </div>
        </div>

        {/* Challenges */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">Challenges</h2>
          {challenges.map((c) => (
            <div key={c.id} className="bg-vault-card border border-vault-border rounded-xl p-5 card-hover">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-vault-text-muted font-mono text-sm">#{c.id}</span>
                  <h3 className="text-white font-semibold">{c.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${c.diffColor}`}>{c.difficulty}</span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-400 font-mono">{c.method}</span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-purple-500/15 text-purple-400">{c.type}</span>
                </div>
              </div>
              <p className="text-vault-text-muted text-sm mb-3">{c.description}</p>
              <div className="flex flex-wrap items-center gap-4">
                <code className="text-xs bg-vault-bg px-3 py-1.5 rounded-lg text-emerald-400 font-mono">{c.endpoint}</code>
              </div>
              <div className="mt-3 p-3 bg-amber-500/5 border border-amber-500/10 rounded-lg">
                <p className="text-amber-400/70 text-xs">💡 {c.hint}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tool Tips */}
        <div className="bg-vault-card border border-vault-border rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">🛠️ Recommended Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-vault-bg rounded-xl p-4">
              <h4 className="text-white font-semibold text-sm mb-2">🌐 Browser DevTools</h4>
              <p className="text-vault-text-muted text-xs">Use the Network tab to inspect API requests, view parameters, and modify requests. Available in all modern browsers (F12).</p>
            </div>
            <div className="bg-vault-bg rounded-xl p-4">
              <h4 className="text-white font-semibold text-sm mb-2">🔧 Burp Suite</h4>
              <p className="text-vault-text-muted text-xs">Intercept and modify HTTP requests in transit. Use the Repeater to replay modified requests. Essential for IDOR testing.</p>
            </div>
            <div className="bg-vault-bg rounded-xl p-4">
              <h4 className="text-white font-semibold text-sm mb-2">💻 curl / HTTPie</h4>
              <p className="text-vault-text-muted text-xs">Command-line HTTP clients for crafting custom requests. Great for testing API endpoints with specific headers and bodies.</p>
            </div>
          </div>
        </div>

        {/* Login info */}
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
          <p className="text-emerald-400 text-sm font-medium">🔑 Test Account: player / player123 (ID: 42)</p>
          <p className="text-emerald-400/60 text-xs mt-1">Log in and start hunting!</p>
        </div>
          </>
        )}
      </div>
    </Layout>
  );
}
