import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeftRight, Upload, Copy } from 'lucide-react';

export default function CookieConverter() {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [count, setCount] = useState(0);
  const fileRef = useRef(null);

  const extractAccounts = () => {
    if (!input.trim()) {
      toast.error('Please paste cookie text first');
      return;
    }

    try {
      const accounts = [];
      const blocks = input.split(/={5,}/);

      for (const block of blocks) {
        const trimmed = block.trim();
        if (!trimmed) continue;

        const accessMatch = trimmed.match(/cra_access_token[=:]\s*([^\s;,]+)/i);
        const refreshMatch = trimmed.match(/cra_refresh_token[=:]\s*([^\s;,]+)/i);

        if (accessMatch || refreshMatch) {
          accounts.push({
            cra_access_token: accessMatch ? accessMatch[1] : '',
            cra_refresh_token: refreshMatch ? refreshMatch[1] : '',
          });
        }
      }

      if (accounts.length === 0) {
        try {
          const parsed = JSON.parse(input);
          const arr = Array.isArray(parsed) ? parsed : [parsed];
          for (const item of arr) {
            if (item.cra_access_token || item.cra_refresh_token) {
              accounts.push({
                cra_access_token: item.cra_access_token || '',
                cra_refresh_token: item.cra_refresh_token || '',
              });
            }
          }
        } catch {
          // not JSON
        }
      }

      setCount(accounts.length);
      setOutput(JSON.stringify(accounts, null, 2));

      if (accounts.length > 0) {
        toast.success(`${accounts.length} accounts extracted`);
      } else {
        toast.error('No accounts found in the input');
      }
    } catch {
      toast.error('Failed to parse input');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setInput(ev.target?.result || '');
    reader.readAsText(file);
  };

  const copyOutput = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    toast.success('JSON copied to clipboard');
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>
            <ArrowLeftRight size={20} /> Cookie to JSON Converter
          </h1>
          <button onClick={() => navigate('/')} style={styles.closeBtn}>Close Tool</button>
        </div>

        <div style={styles.columns}>
          <div style={styles.column}>
            <div style={styles.colHeader}>
              <label style={styles.colLabel}>1. Paste or Upload Raw Cookies</label>
              <button onClick={() => fileRef.current?.click()} style={styles.uploadBtn}>
                <Upload size={12} /> Upload File
              </button>
              <input ref={fileRef} type="file" accept=".txt,.json" onChange={handleFileUpload} hidden />
            </div>
            <p style={styles.hint}>
              Supports huge TXT/JSON files, broken lines, and ========= separators. <b>No limit.</b>
            </p>
            <textarea
              placeholder="Paste text here..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={styles.textarea}
              rows={16}
            />
          </div>

          <div style={styles.column}>
            <div style={styles.colHeader}>
              <label style={styles.colLabel}>2. Output JSON Array</label>
              <span style={styles.countBadge}>{count} accounts extracted</span>
            </div>
            <p style={styles.hint}>
              Ready to be pasted into the Dashboard&apos;s JSON tab.
            </p>
            <textarea
              value={output}
              readOnly
              style={{ ...styles.textarea, fontFamily: 'monospace', fontSize: '12px' }}
              rows={16}
            />
          </div>
        </div>

        <div style={styles.actions}>
          <button onClick={extractAccounts} style={styles.convertBtn}>
            Extract & Convert ➔
          </button>
          <button onClick={copyOutput} style={styles.copyBtn}>
            <Copy size={14} /> Copy JSON to Clipboard
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh', background: 'var(--bg-primary)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '24px',
  },
  card: {
    background: 'var(--bg-secondary)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)', padding: '32px',
    width: '100%', maxWidth: '900px',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: '24px',
  },
  title: {
    display: 'flex', alignItems: 'center', gap: '8px',
    margin: 0, fontSize: '20px', color: 'var(--text-primary)',
  },
  closeBtn: {
    padding: '6px 16px', background: 'var(--bg-input)',
    border: '1px solid var(--border)', borderRadius: 'var(--radius)',
    color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer',
  },
  columns: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' },
  column: { display: 'flex', flexDirection: 'column' },
  colHeader: {
    display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px',
  },
  colLabel: { fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' },
  uploadBtn: {
    display: 'flex', alignItems: 'center', gap: '4px',
    padding: '4px 10px', background: 'var(--accent)',
    border: 'none', borderRadius: '4px',
    color: '#fff', fontSize: '12px', cursor: 'pointer',
    marginLeft: 'auto',
  },
  countBadge: {
    marginLeft: 'auto', fontSize: '12px', color: 'var(--success)', fontWeight: 600,
  },
  hint: { fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' },
  textarea: {
    flex: 1, padding: '12px', background: 'var(--bg-input)',
    border: '1px solid var(--border)', borderRadius: 'var(--radius)',
    color: 'var(--text-primary)', fontSize: '13px', outline: 'none',
    resize: 'none', lineHeight: 1.5,
  },
  actions: { display: 'flex', gap: '12px', marginTop: '16px' },
  convertBtn: {
    flex: 1, padding: '12px', background: 'var(--accent)',
    border: 'none', borderRadius: 'var(--radius)',
    color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
  },
  copyBtn: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
    padding: '12px', background: 'var(--success)',
    border: 'none', borderRadius: 'var(--radius)',
    color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
  },
};
