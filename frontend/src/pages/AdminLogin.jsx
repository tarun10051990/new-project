import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const [accessKey, setAccessKey] = useState('');
  const [loading, setLoading] = useState(false);
  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!accessKey.startsWith('jm_')) {
      toast.error('Access key must start with jm_');
      return;
    }
    setLoading(true);
    try {
      await adminLogin(accessKey);
      toast.success('Admin authenticated');
      navigate('/admin');
    } catch {
      toast.error('Admin access denied');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        <div style={styles.iconWrap}>
          <Shield size={32} color="#e74c3c" />
        </div>
        <h2 style={styles.title}>Admin Panel</h2>
        <p style={styles.subtitle}>ELITe JioMart Administration</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter Admin Key (jm_...)"
            value={accessKey}
            onChange={(e) => setAccessKey(e.target.value)}
            style={styles.input}
          />
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Authenticating...' : 'Admin Login'}
          </button>
        </form>
        <a href="/login" style={styles.link}>Customer Login</a>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg-primary)',
    padding: '20px',
  },
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '48px 40px',
    width: '100%',
    maxWidth: '420px',
    textAlign: 'center',
    boxShadow: 'var(--shadow)',
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: '50%',
    background: 'rgba(231, 76, 60, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 600,
    color: '#e74c3c',
    margin: '0 0 4px',
  },
  subtitle: {
    color: 'var(--text-secondary)',
    fontSize: '14px',
    marginBottom: '24px',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    background: 'var(--bg-input)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    color: 'var(--text-primary)',
    fontSize: '14px',
    outline: 'none',
    marginBottom: '16px',
  },
  button: {
    width: '100%',
    padding: '12px',
    background: '#e74c3c',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--radius)',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  link: {
    display: 'inline-block',
    marginTop: '16px',
    color: 'var(--accent)',
    fontSize: '13px',
    textDecoration: 'none',
  },
};
