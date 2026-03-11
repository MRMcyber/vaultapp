import Layout from '@/components/Layout';
import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('vault_token');
      const userData = JSON.parse(localStorage.getItem('vault_user'));
      const res = await fetch(`/api/users/${userData.id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      // We don't have a messages list endpoint, so we'll try to read a few messages
      // by iterating through likely message IDs for this user
      const userId = userData.id;
      const startId = (userId - 1) * 4 + 1;
      const msgPromises = [];
      for (let i = startId; i < startId + 4; i++) {
        msgPromises.push(
          fetch('/api/messages/read', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ message_id: i }),
          }).then(r => r.json()).catch(() => null)
        );
      }
      const results = await Promise.all(msgPromises);
      setMessages(results.filter(m => m && m.id));
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    }
    setLoading(false);
  };

  const openMessage = async (messageId) => {
    try {
      const token = localStorage.getItem('vault_token');
      const res = await fetch('/api/messages/read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ message_id: messageId }),
      });
      const data = await res.json();
      setSelectedMessage(data);
    } catch (err) {
      console.error('Failed to read message:', err);
    }
  };

  return (
    <Layout title="Messages">
      <Head>
        <title>Messages — VaultApp</title>
      </Head>

      <div className="space-y-6 fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Message List */}
          <div className="lg:col-span-1">
            <div className="bg-vault-card border border-vault-border rounded-xl overflow-hidden">
              <div className="p-4 border-b border-vault-border">
                <h3 className="text-white font-semibold">Inbox</h3>
                <p className="text-vault-text-muted text-xs mt-1">{messages.length} messages</p>
              </div>
              {loading ? (
                <div className="p-8 text-center text-vault-text-muted">Loading...</div>
              ) : messages.length === 0 ? (
                <div className="p-8 text-center text-vault-text-muted">No messages</div>
              ) : (
                <div className="divide-y divide-vault-border max-h-[60vh] overflow-y-auto">
                  {messages.map(msg => (
                    <button
                      key={msg.id}
                      onClick={() => openMessage(msg.id)}
                      className={`w-full text-left p-4 hover:bg-white/[0.03] transition-colors ${
                        selectedMessage?.id === msg.id ? 'bg-emerald-500/10 border-l-2 border-l-emerald-500' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-white text-sm font-medium truncate">{msg.subject}</p>
                          <p className="text-vault-text-muted text-xs mt-1">From: {msg.sender_username}</p>
                          <p className="text-vault-text-muted text-xs">
                            ID: <span className="font-mono text-amber-400">#{msg.id}</span>
                          </p>
                        </div>
                        {!msg.is_read && (
                          <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1 flex-shrink-0"></div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Message View */}
          <div className="lg:col-span-2">
            <div className="bg-vault-card border border-vault-border rounded-xl overflow-hidden">
              {selectedMessage ? (
                <div>
                  <div className="p-6 border-b border-vault-border">
                    <h3 className="text-xl font-semibold text-white mb-3">{selectedMessage.subject}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-vault-text-muted">
                      <p>From: <span className="text-white">{selectedMessage.sender_username}</span> ({selectedMessage.sender_email})</p>
                      <p>To: <span className="text-white">{selectedMessage.receiver_username}</span> ({selectedMessage.receiver_email})</p>
                      <p>Date: <span className="text-white">{new Date(selectedMessage.sent_at).toLocaleString()}</span></p>
                      <p>Message ID: <span className="font-mono text-amber-400">#{selectedMessage.id}</span></p>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-vault-text-muted whitespace-pre-wrap leading-relaxed">{selectedMessage.body}</p>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center text-vault-text-muted">
                  <span className="text-4xl mb-3 block">✉️</span>
                  <p>Select a message to read</p>
                  <p className="text-xs mt-2 text-amber-400/60">Hint: Notice the message_id in network requests</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
