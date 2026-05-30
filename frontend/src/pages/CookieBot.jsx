import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Bot, Play, Copy, Loader, Cookie, CheckCircle, AlertCircle } from 'lucide-react';

const BOT_API = 'http://localhost:3001';

export default function CookieBot() {
  const navigate = useNavigate();
  const [accessToken, setAccessToken] = useState('');
  const [refreshToken, setRefreshToken] = useState('');
  const [running, setRunning] = useState(false);
  const [cookies, setCookies] = useState(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('idle'); // idle | running | success | error

  const runBot = async () => {
    if (!accessToken.trim() || !refreshToken.trim()) {
      toast.error('Both tokens are required');
      return;
    }

    setRunning(true);
    setError('');
    setCookies(null);
    setStatus('running');

    try {
      const resp = await fetch(`${BOT_API}/run-bot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cra_access_token: accessToken.trim(),
          cra_refresh_token: refreshToken.trim(),
        }),
      });

      const data = await resp.json();

      if (!resp.ok) {
        throw new Error(data.error || 'Bot failed');
      }

      setCookies(data.cookies);
      setStatus('success');
      toast.success(`Collected ${data.count} cookies from JioMart`);
    } catch (err) {
      setError(err.message);
      setStatus('error');
      toast.error(err.message);
    } finally {
      setRunning(false);
    }
  };

  const copyAllCookies = () => {
    if (!cookies) return;
    navigator.clipboard.writeText(JSON.stringify(cookies, null, 2));
    toast.success('All cookies copied to clipboard');
  };

  const copyCookieValue = (name, value) => {
    navigator.clipboard.writeText(value);
    toast.success(`${name} copied`);
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>
            <Bot size={22} /> JioMart Cookie Bot
          </h1>
          <button onClick={() => navigate('/')} style={styles.closeBtn}>
            Close
          </button>
        </div>

        <p style={styles.desc}>
          Automatically opens the Reliance Retail login page, injects your{' '}
          <code style={styles.code}>cra_access_token</code> &amp;{' '}
          <code style={styles.code}>cra_refresh_token</code>, clicks Continue,
          and harvests all JioMart session cookies.
        </p>

        {/* Token inputs */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>cra_access_token</label>
          <textarea
            placeholder="Paste your cra_access_token here…"
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value)}
            style={styles.textarea}
            rows={3}
            disabled={running}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>cra_refresh_token</label>
          <textarea
            placeholder="Paste your cra_refresh_token here…"
            value={refreshToken}
            onChange={(e) => setRefreshToken(e.target.value)}
            style={styles.textarea}
            rows={3}
            disabled={running}
          />
        </div>

        {/* Run button */}
        <button
          onClick={runBot}
          disabled={running}
          style={{
            ...styles.runBtn,
            opacity: running ? 0.6 : 1,
            cursor: running ? 'not-allowed' : 'pointer',
          }}
        >
          {running ? (
            <>
              <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Running Bot…
            </>
          ) : (
            <>
              <Play size={16} /> Run Cookie Bot
            </>
          )}
        </button>

        {/* Status banner */}
        {status === 'running' && (
          <div style={{ ...styles.statusBanner, background: '#1e3a5f', borderColor: '#2563eb' }}>
            <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
            <span>
              Opening browser → Setting cookies → Refreshing → Clicking Continue → Collecting cookies…
            </span>
          </div>
        )}

        {status === 'success' && (
          <div style={{ ...styles.statusBanner, background: '#14532d', borderColor: '#22c55e' }}>
            <CheckCircle size={16} />
            <span>
              Successfully collected <b>{cookies?.length || 0}</b> cookies
            </span>
          </div>
        )}

        {status === 'error' && (
          <div style={{ ...styles.statusBanner, background: '#450a0a', borderColor: '#ef4444' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Cookie results */}
        {cookies && cookies.length > 0 && (
          <div style={styles.results}>
            <div style={styles.resultsHeader}>
              <h3 style={styles.resultsTitle}>
                <Cookie size={16} /> Extracted Cookies ({cookies.length})
              </h3>
              <button onClick={copyAllCookies} style={styles.copyAllBtn}>
                <Copy size={14} /> Copy All JSON
              </button>
            </div>

            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>#</th>
                    <th style={styles.th}>Name</th>
                    <th style={styles.th}>Domain</th>
                    <th style={styles.th}>Value</th>
                    <th style={styles.th}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {cookies.map((c, i) => (
                    <tr key={`${c.name}-${c.domain}-${i}`} style={styles.tr}>
                      <td style={styles.td}>{i + 1}</td>
                      <td style={{ ...styles.td, fontWeight: 600, color: '#60a5fa' }}>{c.name}</td>
                      <td style={{ ...styles.td, color: '#a78bfa' }}>{c.domain}</td>
                      <td style={{ ...styles.td, maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {c.value}
                      </td>
                      <td style={styles.td}>
                        <button
                          onClick={() => copyCookieValue(c.name, c.value)}
                          style={styles.copyBtn}
                        >
                          <Copy size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Raw JSON output */}
            <details style={styles.details}>
              <summary style={styles.summary}>View Raw JSON</summary>
              <pre style={styles.pre}>{JSON.stringify(cookies, null, 2)}</pre>
            </details>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'var(--bg-primary)',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: '24px',
  },
  card: {
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '32px',
    width: '100%',
    maxWidth: '960px',
    marginTop: '24px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: 'var(--text-primary)',
    fontSize: '20px',
    margin: 0,
  },
  closeBtn: {
    background: 'var(--bg-tertiary)',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border)',
    padding: '6px 14px',
    borderRadius: 'var(--radius)',
    cursor: 'pointer',
    fontSize: '13px',
  },
  desc: {
    color: 'var(--text-secondary)',
    fontSize: '14px',
    lineHeight: 1.5,
    marginBottom: '24px',
  },
  code: {
    background: 'var(--bg-tertiary)',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '12px',
    color: '#f59e0b',
  },
  inputGroup: {
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    color: 'var(--text-primary)',
    fontSize: '13px',
    fontWeight: 600,
    marginBottom: '6px',
  },
  textarea: {
    width: '100%',
    background: 'var(--bg-primary)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '10px 12px',
    color: 'var(--text-primary)',
    fontSize: '13px',
    fontFamily: 'monospace',
    resize: 'vertical',
    boxSizing: 'border-box',
  },
  runBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#2563eb',
    color: '#fff',
    border: 'none',
    padding: '10px 24px',
    borderRadius: 'var(--radius)',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    marginBottom: '16px',
  },
  statusBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    borderRadius: 'var(--radius)',
    border: '1px solid',
    color: '#fff',
    fontSize: '13px',
    marginBottom: '16px',
  },
  results: {
    marginTop: '8px',
  },
  resultsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  resultsTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: 'var(--text-primary)',
    fontSize: '16px',
    margin: 0,
  },
  copyAllBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: '#16a34a',
    color: '#fff',
    border: 'none',
    padding: '6px 14px',
    borderRadius: 'var(--radius)',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  tableWrap: {
    overflowX: 'auto',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--border)',
    marginBottom: '16px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '12px',
  },
  th: {
    textAlign: 'left',
    padding: '8px 12px',
    background: 'var(--bg-tertiary)',
    color: 'var(--text-secondary)',
    fontWeight: 600,
    borderBottom: '1px solid var(--border)',
    whiteSpace: 'nowrap',
  },
  tr: {
    borderBottom: '1px solid var(--border)',
  },
  td: {
    padding: '6px 12px',
    color: 'var(--text-primary)',
  },
  copyBtn: {
    background: 'none',
    border: '1px solid var(--border)',
    color: 'var(--text-secondary)',
    padding: '4px 8px',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  details: {
    marginTop: '8px',
  },
  summary: {
    color: 'var(--text-secondary)',
    fontSize: '13px',
    cursor: 'pointer',
    marginBottom: '8px',
  },
  pre: {
    background: 'var(--bg-primary)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '12px',
    fontSize: '11px',
    color: 'var(--text-primary)',
    overflow: 'auto',
    maxHeight: '400px',
  },
};
