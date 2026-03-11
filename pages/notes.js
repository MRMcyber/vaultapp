import Layout from '@/components/Layout';
import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem('vault_token');
      const userData = JSON.parse(localStorage.getItem('vault_user'));
      const userId = userData.id;
      const startId = (userId - 1) * 2 + 1;
      const notePromises = [];
      for (let i = startId; i < startId + 2; i++) {
        notePromises.push(
          fetch(`/api/notes/${i}`, {
            headers: { 'Authorization': `Bearer ${token}` },
          }).then(r => r.json()).catch(() => null)
        );
      }
      const results = await Promise.all(notePromises);
      setNotes(results.filter(n => n && n.id));
    } catch (err) {
      console.error('Failed to fetch notes:', err);
    }
    setLoading(false);
  };

  const viewNote = async (noteId) => {
    try {
      const token = localStorage.getItem('vault_token');
      const res = await fetch(`/api/notes/${noteId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      setSelectedNote(data);
    } catch (err) {
      console.error('Failed to fetch note:', err);
    }
  };

  return (
    <Layout title="Notes">
      <Head>
        <title>Notes — VaultApp</title>
      </Head>

      <div className="space-y-6 fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Notes List */}
          <div className="lg:col-span-1">
            <div className="bg-vault-card border border-vault-border rounded-xl overflow-hidden">
              <div className="p-4 border-b border-vault-border">
                <h3 className="text-white font-semibold">My Notes</h3>
                <p className="text-vault-text-muted text-xs mt-1">{notes.length} notes</p>
              </div>
              {loading ? (
                <div className="p-8 text-center text-vault-text-muted">Loading...</div>
              ) : (
                <div className="divide-y divide-vault-border">
                  {notes.map(note => (
                    <button
                      key={note.id}
                      onClick={() => viewNote(note.id)}
                      className={`w-full text-left p-4 hover:bg-white/[0.03] transition-colors ${
                        selectedNote?.id === note.id ? 'bg-emerald-500/10' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-white text-sm font-medium">{note.title}</p>
                          <p className="text-vault-text-muted text-xs mt-1">
                            ID: <span className="font-mono text-amber-400">#{note.id}</span>
                          </p>
                        </div>
                        {note.is_private && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/15 text-red-400">Private</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Note Viewer */}
          <div className="lg:col-span-2">
            <div className="bg-vault-card border border-vault-border rounded-xl overflow-hidden">
              {selectedNote ? (
                <div>
                  <div className="p-5 border-b border-vault-border">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white">{selectedNote.title}</h3>
                      <div className="flex items-center gap-2">
                        {selectedNote.is_private && (
                          <span className="text-xs px-2 py-1 rounded-full bg-red-500/15 text-red-400">🔒 Private</span>
                        )}
                        <span className="text-xs text-vault-text-muted font-mono">ID: #{selectedNote.id}</span>
                      </div>
                    </div>
                    <p className="text-vault-text-muted text-xs mt-1">
                      Owner: {selectedNote.owner_username} · Created: {new Date(selectedNote.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="p-5">
                    <pre className="text-vault-text-muted text-sm whitespace-pre-wrap font-mono bg-vault-bg rounded-lg p-4">
                      {selectedNote.body}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center text-vault-text-muted">
                  <span className="text-4xl mb-3 block">📝</span>
                  <p>Select a note to view</p>
                  <p className="text-xs mt-2 text-amber-400/60">Hint: Note IDs are sequential integers</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
