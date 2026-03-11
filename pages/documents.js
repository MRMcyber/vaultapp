import Layout from '@/components/Layout';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Documents() {
  const router = useRouter();
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    if (router.query.id) {
      fetchDocument(router.query.id);
    }
  }, [router.query.id]);

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('vault_token');
      const userData = JSON.parse(localStorage.getItem('vault_user'));
      const userId = userData.id;
      // Documents for this user start at (userId-1)*3 + 1
      const startId = (userId - 1) * 3 + 1;
      const docPromises = [];
      for (let i = startId; i < startId + 3; i++) {
        const encodedId = btoa(String(i));
        docPromises.push(
          fetch(`/api/documents/${encodedId}`, {
            headers: { 'Authorization': `Bearer ${token}` },
          }).then(r => r.json()).catch(() => null)
        );
      }
      const results = await Promise.all(docPromises);
      setDocuments(results.filter(d => d && d.id));
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    }
    setLoading(false);
  };

  const fetchDocument = async (encodedId) => {
    try {
      const token = localStorage.getItem('vault_token');
      const res = await fetch(`/api/documents/${encodedId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      setSelectedDoc(data);
    } catch (err) {
      console.error('Failed to fetch document:', err);
    }
  };

  const typeIcons = { invoice: '🧾', statement: '📊', report: '📈' };
  const typeColors = {
    invoice: 'bg-blue-500/15 text-blue-400',
    statement: 'bg-purple-500/15 text-purple-400',
    report: 'bg-amber-500/15 text-amber-400'
  };

  return (
    <Layout title="Documents">
      <Head>
        <title>Documents — VaultApp</title>
      </Head>

      <div className="space-y-6 fade-in">
        {/* Document list */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full p-8 text-center text-vault-text-muted">Loading documents...</div>
          ) : documents.length === 0 ? (
            <div className="col-span-full p-8 text-center text-vault-text-muted">No documents found</div>
          ) : (
            documents.map(doc => (
              <button
                key={doc.id}
                onClick={() => {
                  setSelectedDoc(doc);
                  router.push(`/documents?id=${doc.encoded_id}`, undefined, { shallow: true });
                }}
                className={`bg-vault-card border rounded-xl p-5 text-left card-hover ${
                  selectedDoc?.id === doc.id ? 'border-emerald-500' : 'border-vault-border'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-2xl">{typeIcons[doc.doc_type] || '📄'}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${typeColors[doc.doc_type]}`}>
                    {doc.doc_type}
                  </span>
                </div>
                <h4 className="text-white font-medium text-sm mb-2">{doc.title}</h4>
                <p className="text-vault-text-muted text-xs">
                  Created: {new Date(doc.created_at).toLocaleDateString()}
                </p>
                <p className="text-vault-text-muted text-xs mt-1 font-mono">
                  ID: <span className="text-amber-400">{doc.encoded_id}</span>
                </p>
              </button>
            ))
          )}
        </div>

        {/* Document viewer */}
        {selectedDoc && (
          <div className="bg-vault-card border border-vault-border rounded-xl overflow-hidden">
            <div className="p-5 border-b border-vault-border flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">{selectedDoc.title}</h3>
                <div className="flex items-center gap-3 mt-1 text-xs text-vault-text-muted">
                  <span>Owner: {selectedDoc.owner_username}</span>
                  <span>Type: {selectedDoc.doc_type}</span>
                  <span className="font-mono">Encoded ID: <span className="text-amber-400">{selectedDoc.encoded_id}</span></span>
                </div>
              </div>
              <button onClick={() => setSelectedDoc(null)} className="text-vault-text-muted hover:text-white">✕</button>
            </div>
            <div className="p-5">
              <pre className="text-vault-text-muted text-sm whitespace-pre-wrap font-mono bg-vault-bg rounded-lg p-4">
                {selectedDoc.content}
              </pre>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
