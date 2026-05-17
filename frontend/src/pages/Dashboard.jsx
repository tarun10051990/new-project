import Header from '../components/Header';
import BulkOrderSection from '../components/BulkOrderSection';
import ConnectedAccounts from '../components/ConnectedAccounts';
import { ExternalLink, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const isDemo = user?.role === 'DEMO';

  return (
    <div>
      <Header />
      <main style={styles.main}>
        {isDemo && (
          <div style={styles.demoBanner}>
            <AlertTriangle size={16} />
            <span>You are using a <strong>Demo</strong> account. Add account, address, order, and payment features are view-only. Contact admin for Premium access.</span>
          </div>
        )}
        <div style={styles.topActions}>
          <button style={styles.primaryBtn}>Bulk Order Dashboard</button>
          <Link to="/otp-tracker" style={{ ...styles.secondaryBtn, textDecoration: 'none' }}>
            Open Live OTP Tracker <ExternalLink size={12} />
          </Link>
        </div>
        <BulkOrderSection />
        <ConnectedAccounts />
      </main>
    </div>
  );
}

const styles = {
  main: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '24px',
  },
  demoBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    background: 'rgba(243,156,18,0.1)',
    border: '1px solid rgba(243,156,18,0.3)',
    borderRadius: 'var(--radius)',
    color: '#f39c12',
    fontSize: '13px',
    marginBottom: '16px',
  },
  topActions: {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px',
  },
  primaryBtn: {
    padding: '10px 20px',
    background: 'var(--accent)',
    border: 'none',
    borderRadius: 'var(--radius)',
    color: '#fff',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  secondaryBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 20px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    color: 'var(--text-primary)',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },
};
