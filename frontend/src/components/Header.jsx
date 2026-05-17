import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import {
  Zap, Sun, Moon, LogOut, BookOpen, ArrowLeftRight,
  MessageCircle, Archive, History
} from 'lucide-react';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [stats, setStats] = useState({ totalAccounts: 0, totalOrders: 0, todaysOrders: 0, totalSpent: 0 });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (user) {
      api.get(`/orders/${user.id}/stats`).then(r => setStats(r.data)).catch(() => {});
    }
  }, [user]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  const handleLogout = () => { logout(); navigate('/login'); };

  if (!user) return null;

  return (
    <header style={styles.header}>
      <div style={styles.topRow}>
        <div style={styles.brand}>
          <Zap size={20} color="var(--accent)" />
          <h1 style={styles.logo}>ELITe JIOMART</h1>
          <span style={styles.keyBadge}>({user.accessKey.substring(0, 8)}...)</span>
        </div>

        <div style={styles.statsRow}>
          <StatBox label="Total Accounts" value={stats.totalAccounts} />
          <StatBox label="Total Orders" value={stats.totalOrders} />
          <StatBox label="Today's Orders" value={stats.todaysOrders} color="var(--danger)" />
          <StatBox label="Total Spent" value={`₹${(stats.totalSpent || 0).toFixed(2)}`} />
        </div>

        <div style={styles.navLinks}>
          <Link to="/howtouse" style={styles.navLink}><BookOpen size={14} /> How to Use</Link>
          <Link to="/converter" style={styles.navLink}><ArrowLeftRight size={14} /> Cookie Converter</Link>
        </div>
      </div>

      <div style={styles.bottomRow}>
        <div style={styles.userInfo}>
          <span style={styles.avatar}>👤 {user.displayName}</span>
          <span style={{
            fontSize: '11px', fontWeight: 600,
            padding: '2px 8px', borderRadius: '4px',
            background: user.role === 'PREMIUM' ? 'rgba(241,196,15,0.15)' : 'rgba(149,165,166,0.15)',
            color: user.role === 'PREMIUM' ? '#f1c40f' : '#95a5a6',
          }}>{user.role}</span>
          <span style={styles.credits}>💰 {user.credits.toFixed(2)} Cr</span>
        </div>
        <div style={styles.actions}>
          <button style={styles.actionBtn} title="Vault"><Archive size={14} /> Vault</button>
          <button style={styles.actionBtn} title="Credit History"><History size={14} /> Credit History</button>
          <a href="https://t.me/elitejiomart" target="_blank" rel="noreferrer" style={styles.telegramBtn}>
            <MessageCircle size={14} /> Contact on Telegram
          </a>
          <button onClick={toggleTheme} style={styles.iconBtn} title="Toggle Theme">
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button onClick={handleLogout} style={{ ...styles.actionBtn, color: 'var(--danger)' }}>
            <LogOut size={14} /> Logout
          </button>
        </div>
      </div>
    </header>
  );
}

function StatBox({ label, value, color }) {
  return (
    <div style={styles.statBox}>
      <span style={styles.statLabel}>{label}</span>
      <span style={{ ...styles.statValue, color: color || 'var(--text-primary)' }}>{value}</span>
    </div>
  );
}

const styles = {
  header: {
    background: 'var(--bg-secondary)',
    borderBottom: '1px solid var(--border)',
    padding: '16px 24px',
  },
  topRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '16px',
    marginBottom: '12px',
  },
  brand: { display: 'flex', alignItems: 'center', gap: '8px' },
  logo: { fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' },
  keyBadge: {
    fontSize: '11px',
    background: 'var(--bg-input)',
    padding: '2px 8px',
    borderRadius: '4px',
    color: 'var(--text-secondary)',
  },
  statsRow: { display: 'flex', gap: '24px', flexWrap: 'wrap' },
  statBox: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  statLabel: { fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' },
  statValue: { fontSize: '20px', fontWeight: 700 },
  navLinks: { display: 'flex', gap: '16px' },
  navLink: {
    display: 'flex', alignItems: 'center', gap: '4px',
    color: 'var(--accent)', fontSize: '13px', textDecoration: 'none',
  },
  bottomRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
  },
  userInfo: { display: 'flex', alignItems: 'center', gap: '12px' },
  avatar: {
    background: 'var(--bg-input)',
    padding: '4px 12px',
    borderRadius: 'var(--radius)',
    fontSize: '13px',
    color: 'var(--success)',
  },
  credits: {
    fontSize: '14px',
    fontWeight: 600,
    color: 'var(--warning)',
  },
  actions: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' },
  actionBtn: {
    display: 'flex', alignItems: 'center', gap: '4px',
    background: 'var(--bg-input)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', padding: '6px 12px',
    color: 'var(--text-secondary)', fontSize: '12px', cursor: 'pointer',
  },
  telegramBtn: {
    display: 'flex', alignItems: 'center', gap: '4px',
    background: 'var(--success)', border: 'none',
    borderRadius: 'var(--radius)', padding: '6px 12px',
    color: '#fff', fontSize: '12px', cursor: 'pointer', textDecoration: 'none',
  },
  iconBtn: {
    background: 'var(--bg-input)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', padding: '6px',
    color: 'var(--text-secondary)', cursor: 'pointer',
    display: 'flex', alignItems: 'center',
  },
};
