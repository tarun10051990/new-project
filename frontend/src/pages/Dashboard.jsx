import Header from '../components/Header';
import BulkOrderSection from '../components/BulkOrderSection';
import ConnectedAccounts from '../components/ConnectedAccounts';
import { ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  return (
    <div>
      <Header />
      <main style={styles.main}>
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
