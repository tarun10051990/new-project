import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import CustomerDetailModal from '../components/CustomerDetailModal';
import {
  Shield, LogOut, Users, ShoppingCart, CreditCard, TrendingUp,
  Plus, Search, Edit, Trash2, Eye, DollarSign, Sun, Moon
} from 'lucide-react';

export default function AdminPanel() {
  const { admin, adminLogout } = useAuth();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [dashStats, setDashStats] = useState({});
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreditModal, setShowCreditModal] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(null);
  const [editCustomer, setEditCustomer] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  const [newCustomer, setNewCustomer] = useState({ displayName: '', email: '', credits: 0, accessKey: '' });
  const [creditForm, setCreditForm] = useState({ amount: 0, type: 'add', description: '' });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const fetchCustomers = useCallback(async () => {
    try {
      const params = search ? { search } : {};
      const { data } = await api.get('/admin/customers', { params });
      setCustomers(data);
    } catch { /* ignore */ }
  }, [search]);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/dashboard');
      setDashStats(data);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  const handleLogout = () => { adminLogout(); navigate('/admin/login'); };
  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...newCustomer };
      if (!payload.accessKey) delete payload.accessKey;
      await api.post('/admin/customers', payload);
      toast.success('Customer created');
      setShowCreateModal(false);
      setNewCustomer({ displayName: '', email: '', credits: 0, accessKey: '' });
      fetchCustomers();
      fetchStats();
    } catch {
      toast.error('Failed to create customer');
    }
  };

  const handleUpdateCustomer = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/customers/${editCustomer.id}`, editCustomer);
      toast.success('Customer updated');
      setEditCustomer(null);
      fetchCustomers();
    } catch {
      toast.error('Failed to update');
    }
  };

  const handleDeleteCustomer = async (id) => {
    if (!window.confirm('Delete this customer?')) return;
    try {
      await api.delete(`/admin/customers/${id}`);
      toast.success('Customer deleted');
      fetchCustomers();
      fetchStats();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleCreditAdjust = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/admin/customers/${showCreditModal}/credits`, creditForm);
      toast.success('Credits adjusted');
      setShowCreditModal(null);
      setCreditForm({ amount: 0, type: 'add', description: '' });
      fetchCustomers();
    } catch {
      toast.error('Failed to adjust credits');
    }
  };

  const handleToggleStatus = async (customer) => {
    const newStatus = customer.status === 'Active' ? 'Suspended' : 'Active';
    try {
      await api.put(`/admin/customers/${customer.id}`, { status: newStatus });
      toast.success(`Customer ${newStatus.toLowerCase()}`);
      fetchCustomers();
    } catch {
      toast.error('Failed to update status');
    }
  };

  if (!admin) return null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <Shield size={20} color="#e74c3c" />
          <h1 style={styles.logo}>Admin Panel</h1>
          <span style={styles.badge}>ELITe JioMart</span>
        </div>
        <div style={styles.headerRight}>
          <span style={styles.adminName}>{admin.displayName}</span>
          <button onClick={toggleTheme} style={styles.iconBtn}>
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button onClick={handleLogout} style={{ ...styles.iconBtn, color: 'var(--danger)' }}>
            <LogOut size={16} />
          </button>
        </div>
      </header>

      <main style={styles.main}>
        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          <StatCard icon={<Users size={20} />} label="Total Customers" value={dashStats.totalCustomers || 0} color="#3498db" />
          <StatCard icon={<Users size={20} />} label="Active Customers" value={dashStats.activeCustomers || 0} color="#2ecc71" />
          <StatCard icon={<CreditCard size={20} />} label="Credits Allocated" value={(dashStats.totalCreditsAllocated || 0).toFixed(0)} color="#f39c12" />
          <StatCard icon={<ShoppingCart size={20} />} label="Total Orders" value={dashStats.totalOrders || 0} color="#9b59b6" />
          <StatCard icon={<TrendingUp size={20} />} label="Today's Orders" value={dashStats.todaysOrders || 0} color="#e74c3c" />
          <StatCard icon={<DollarSign size={20} />} label="Total Revenue" value={`₹${(dashStats.totalRevenue || 0).toFixed(2)}`} color="#1abc9c" />
        </div>

        {/* Customer Management */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Premium Customers</h2>
            <div style={styles.sectionActions}>
              <div style={styles.searchWrap}>
                <Search size={14} />
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={styles.searchInput}
                />
              </div>
              <button onClick={() => setShowCreateModal(true)} style={styles.addBtn}>
                <Plus size={14} /> Add Customer
              </button>
            </div>
          </div>

          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>ID</th>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Access Key</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Credits</th>
                  <th style={styles.th}>Accounts</th>
                  <th style={styles.th}>Orders</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(c => (
                  <tr key={c.id} style={styles.tr}>
                    <td style={styles.td}>{c.id}</td>
                    <td style={styles.td}>{c.displayName}</td>
                    <td style={styles.td}>
                      <code style={styles.keyCode}>{c.accessKey}</code>
                    </td>
                    <td style={styles.td}>{c.email || '-'}</td>
                    <td style={styles.td}>
                      <span style={styles.creditBadge}>{c.credits.toFixed(1)}</span>
                    </td>
                    <td style={styles.td}>{c.totalAccounts}</td>
                    <td style={styles.td}>{c.totalOrders}</td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.statusBadge,
                          background: c.status === 'Active' ? 'rgba(46,204,113,0.15)' : 'rgba(231,76,60,0.15)',
                          color: c.status === 'Active' ? '#2ecc71' : '#e74c3c',
                          cursor: 'pointer',
                        }}
                        onClick={() => handleToggleStatus(c)}
                        title="Click to toggle"
                      >
                        {c.status}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actionBtns}>
                        <button onClick={() => setShowDetailModal(c.id)} style={{ ...styles.actionBtn, color: '#3498db' }} title="View Details">
                          <Eye size={14} />
                        </button>
                        <button onClick={() => setEditCustomer({ ...c })} style={{ ...styles.actionBtn, color: '#f39c12' }} title="Edit">
                          <Edit size={14} />
                        </button>
                        <button onClick={() => { setShowCreditModal(c.id); setCreditForm({ amount: 0, type: 'add', description: '' }); }} style={{ ...styles.actionBtn, color: '#2ecc71' }} title="Manage Credits">
                          <CreditCard size={14} />
                        </button>
                        <button onClick={() => handleDeleteCustomer(c.id)} style={{ ...styles.actionBtn, color: '#e74c3c' }} title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {customers.length === 0 && (
                  <tr><td colSpan={9} style={{ ...styles.td, textAlign: 'center', padding: '40px' }}>No customers found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Create Customer Modal */}
      {showCreateModal && (
        <Modal title="Add Premium Customer" onClose={() => setShowCreateModal(false)}>
          <form onSubmit={handleCreateCustomer}>
            <FormField label="Display Name" value={newCustomer.displayName} onChange={v => setNewCustomer({ ...newCustomer, displayName: v })} required />
            <FormField label="Email" value={newCustomer.email} onChange={v => setNewCustomer({ ...newCustomer, email: v })} type="email" />
            <FormField label="Access Key (optional)" value={newCustomer.accessKey} onChange={v => setNewCustomer({ ...newCustomer, accessKey: v })} placeholder="Auto-generated if empty" />
            <FormField label="Initial Credits" value={newCustomer.credits} onChange={v => setNewCustomer({ ...newCustomer, credits: Number(v) })} type="number" />
            <button type="submit" style={styles.submitBtn}>Create Customer</button>
          </form>
        </Modal>
      )}

      {/* Edit Customer Modal */}
      {editCustomer && (
        <Modal title="Edit Customer" onClose={() => setEditCustomer(null)}>
          <form onSubmit={handleUpdateCustomer}>
            <FormField label="Display Name" value={editCustomer.displayName} onChange={v => setEditCustomer({ ...editCustomer, displayName: v })} required />
            <FormField label="Email" value={editCustomer.email || ''} onChange={v => setEditCustomer({ ...editCustomer, email: v })} type="email" />
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Status</label>
              <select value={editCustomer.status} onChange={e => setEditCustomer({ ...editCustomer, status: e.target.value })} style={styles.formInput}>
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
            <button type="submit" style={styles.submitBtn}>Update Customer</button>
          </form>
        </Modal>
      )}

      {/* Credit Adjustment Modal */}
      {showCreditModal && (
        <Modal title="Adjust Credits" onClose={() => setShowCreditModal(null)}>
          <form onSubmit={handleCreditAdjust}>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Type</label>
              <select value={creditForm.type} onChange={e => setCreditForm({ ...creditForm, type: e.target.value })} style={styles.formInput}>
                <option value="add">Add Credits</option>
                <option value="deduct">Deduct Credits</option>
              </select>
            </div>
            <FormField label="Amount" value={creditForm.amount} onChange={v => setCreditForm({ ...creditForm, amount: Number(v) })} type="number" required />
            <FormField label="Description" value={creditForm.description} onChange={v => setCreditForm({ ...creditForm, description: v })} placeholder="Reason for adjustment" />
            <button type="submit" style={{ ...styles.submitBtn, background: creditForm.type === 'deduct' ? '#e74c3c' : '#2ecc71' }}>
              {creditForm.type === 'add' ? 'Add' : 'Deduct'} Credits
            </button>
          </form>
        </Modal>
      )}

      {/* Customer Detail Modal */}
      {showDetailModal && (
        <CustomerDetailModal customerId={showDetailModal} onClose={() => setShowDetailModal(null)} />
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div style={{ ...styles.statCard, borderTop: `3px solid ${color}` }}>
      <div style={{ color, marginBottom: '8px' }}>{icon}</div>
      <div style={styles.statValue}>{value}</div>
      <div style={styles.statLabel}>{label}</div>
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h3 style={styles.modalTitle}>{title}</h3>
          <button onClick={onClose} style={styles.closeBtn}>&times;</button>
        </div>
        <div style={styles.modalBody}>{children}</div>
      </div>
    </div>
  );
}

function FormField({ label, value, onChange, type = 'text', placeholder, required }) {
  return (
    <div style={styles.formGroup}>
      <label style={styles.formLabel}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        style={styles.formInput}
      />
    </div>
  );
}

const styles = {
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 24px',
    background: 'var(--bg-secondary)',
    borderBottom: '1px solid var(--border)',
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '8px' },
  headerRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  logo: { fontSize: '18px', fontWeight: 700, margin: 0, color: '#e74c3c' },
  badge: {
    fontSize: '11px',
    background: 'var(--bg-input)',
    padding: '2px 8px',
    borderRadius: '4px',
    color: 'var(--text-secondary)',
  },
  adminName: { fontSize: '13px', color: 'var(--text-secondary)' },
  iconBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    padding: '6px',
  },
  main: { maxWidth: '1200px', margin: '0 auto', padding: '24px' },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  statCard: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '20px',
    textAlign: 'center',
  },
  statValue: { fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' },
  statLabel: { fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '4px' },
  section: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    borderBottom: '1px solid var(--border)',
    flexWrap: 'wrap',
    gap: '12px',
  },
  sectionTitle: { fontSize: '16px', fontWeight: 600, margin: 0, color: 'var(--text-primary)' },
  sectionActions: { display: 'flex', gap: '12px', alignItems: 'center' },
  searchWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'var(--bg-input)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '6px 12px',
    color: 'var(--text-secondary)',
  },
  searchInput: {
    background: 'none',
    border: 'none',
    outline: 'none',
    color: 'var(--text-primary)',
    fontSize: '13px',
    width: '160px',
  },
  addBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '8px 16px',
    background: '#2ecc71',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--radius)',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: '11px',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    borderBottom: '1px solid var(--border)',
    whiteSpace: 'nowrap',
  },
  tr: { borderBottom: '1px solid var(--border)' },
  td: {
    padding: '12px 16px',
    fontSize: '13px',
    color: 'var(--text-primary)',
    whiteSpace: 'nowrap',
  },
  keyCode: {
    background: 'var(--bg-input)',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontFamily: 'monospace',
  },
  creditBadge: {
    background: 'rgba(243,156,18,0.15)',
    color: '#f39c12',
    padding: '2px 10px',
    borderRadius: '12px',
    fontWeight: 600,
    fontSize: '12px',
  },
  statusBadge: {
    padding: '3px 10px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: 600,
  },
  actionBtns: { display: 'flex', gap: '4px' },
  actionBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    width: '100%',
    maxWidth: '480px',
    maxHeight: '80vh',
    overflow: 'auto',
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    borderBottom: '1px solid var(--border)',
  },
  modalTitle: { fontSize: '16px', fontWeight: 600, margin: 0, color: 'var(--text-primary)' },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
  },
  modalBody: { padding: '20px' },
  formGroup: { marginBottom: '16px' },
  formLabel: {
    display: 'block',
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    marginBottom: '6px',
  },
  formInput: {
    width: '100%',
    padding: '10px 12px',
    background: 'var(--bg-input)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    color: 'var(--text-primary)',
    fontSize: '14px',
    outline: 'none',
  },
  submitBtn: {
    width: '100%',
    padding: '12px',
    background: 'var(--accent)',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--radius)',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: '8px',
  },
};
