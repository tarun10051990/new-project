import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const [accessKey, setAccessKey] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!accessKey.startsWith('jm_')) {
      toast.error('Access key must start with jm_');
      return;
    }
    setLoading(true);
    try {
      await login(accessKey);
      toast.success('Authenticated successfully');
      navigate('/');
    } catch {
      toast.error('Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        <div style={styles.iconWrap}>
          <Lock size={32} color="var(--accent)" />
        </div>
        <h2 style={styles.title}>ELITe JioMart</h2>
        <p style={styles.subtitle}>Secure Access Portal</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter Access Key (jm_...)"
            value={accessKey}
            onChange={(e) => setAccessKey(e.target.value)}
            style={styles.input}
          />
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Authenticating...' : 'Authenticate'}
          </button>
        </form>
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
    background: 'var(--accent-light)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 600,
    color: 'var(--accent)',
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
    background: 'var(--accent)',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--radius)',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
};
