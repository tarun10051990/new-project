import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import {
  X, User, MapPin, Link2, ShoppingCart, CreditCard, Plus, Trash2, History
} from 'lucide-react';

export default function CustomerDetailModal({ customerId, onClose }) {
  const [tab, setTab] = useState('accounts');
  const [accounts, setAccounts] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [creditHistory, setCreditHistory] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAccount, setNewAccount] = useState({ mobileNumber: '', accessToken: '', refreshToken: '' });
  const [newAddress, setNewAddress] = useState({
    fullName: '', mobileNo: '', pincode: '', flatHouseNo: '',
    roadStreetName: '', localityLandmark: '', city: '', state: '',
  });

  const fetchData = useCallback(async () => {
    try {
      const [accRes, addrRes, ordRes, creditRes] = await Promise.all([
        api.get(`/admin/customers/${customerId}/accounts`),
        api.get(`/admin/customers/${customerId}/addresses`),
        api.get(`/admin/customers/${customerId}/orders`),
        api.get(`/admin/customers/${customerId}/credits/history`),
      ]);
      setAccounts(accRes.data);
      setAddresses(addrRes.data);
      setOrders(ordRes.data);
      setCreditHistory(creditRes.data);
    } catch { /* ignore */ }
  }, [customerId]);

  useEffect(() => {
    api.get(`/auth/me/${customerId}`).then(r => setCustomer(r.data)).catch(() => {});
    fetchData();
  }, [customerId, fetchData]);

  const handleAddAccount = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/admin/customers/${customerId}/accounts`, newAccount);
      toast.success('Account added');
      setShowAddAccount(false);
      setNewAccount({ mobileNumber: '', accessToken: '', refreshToken: '' });
      fetchData();
    } catch {
      toast.error('Failed to add account');
    }
  };

  const handleDeleteAccount = async (accountId) => {
    try {
      await api.delete(`/admin/customers/${customerId}/accounts/${accountId}`);
      toast.success('Account deleted');
      fetchData();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/admin/customers/${customerId}/addresses`, newAddress);
      toast.success('Address added');
      setShowAddAddress(false);
      setNewAddress({ fullName: '', mobileNo: '', pincode: '', flatHouseNo: '', roadStreetName: '', localityLandmark: '', city: '', state: '' });
      fetchData();
    } catch {
      toast.error('Failed to add address');
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      await api.delete(`/admin/customers/${customerId}/addresses/${addressId}`);
      toast.success('Address deleted');
      fetchData();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const tabs = [
    { key: 'accounts', label: 'Accounts', icon: <Link2 size={14} />, count: accounts.length },
    { key: 'addresses', label: 'Addresses', icon: <MapPin size={14} />, count: addresses.length },
    { key: 'orders', label: 'Orders', icon: <ShoppingCart size={14} />, count: orders.length },
    { key: 'credits', label: 'Credit History', icon: <History size={14} />, count: creditHistory.length },
  ];

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerInfo}>
            <User size={18} color="var(--accent)" />
            <div>
              <h3 style={styles.title}>{customer?.displayName || 'Loading...'}</h3>
              <span style={styles.subtitle}>{customer?.accessKey} &bull; Credits: {customer?.credits?.toFixed(1)}</span>
            </div>
          </div>
          <button onClick={onClose} style={styles.closeBtn}><X size={18} /></button>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{ ...styles.tab, ...(tab === t.key ? styles.tabActive : {}) }}
            >
              {t.icon} {t.label} <span style={styles.tabCount}>{t.count}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={styles.content}>
          {tab === 'accounts' && (
            <div>
              <div style={styles.contentHeader}>
                <span style={styles.contentTitle}>Connected Accounts</span>
                <button onClick={() => setShowAddAccount(!showAddAccount)} style={styles.smallAddBtn}>
                  <Plus size={12} /> Add
                </button>
              </div>
              {showAddAccount && (
                <form onSubmit={handleAddAccount} style={styles.inlineForm}>
                  <input placeholder="Mobile Number" value={newAccount.mobileNumber} onChange={e => setNewAccount({ ...newAccount, mobileNumber: e.target.value })} style={styles.miniInput} required />
                  <input placeholder="Access Token" value={newAccount.accessToken} onChange={e => setNewAccount({ ...newAccount, accessToken: e.target.value })} style={styles.miniInput} />
                  <input placeholder="Refresh Token" value={newAccount.refreshToken} onChange={e => setNewAccount({ ...newAccount, refreshToken: e.target.value })} style={styles.miniInput} />
                  <button type="submit" style={styles.miniBtn}>Add</button>
                </form>
              )}
              {accounts.length === 0 ? (
                <p style={styles.empty}>No accounts linked</p>
              ) : (
                accounts.map(a => (
                  <div key={a.id} style={styles.listItem}>
                    <div>
                      <span style={styles.listMain}>{a.mobileNumber || 'Unknown'}</span>
                      <span style={{ ...styles.listSub, color: a.state === 'Active' ? '#2ecc71' : '#e74c3c' }}>{a.state}</span>
                      <span style={styles.listSub}> &bull; Orders: {a.totalOrders}</span>
                    </div>
                    <button onClick={() => handleDeleteAccount(a.id)} style={styles.deleteBtn}><Trash2 size={14} /></button>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'addresses' && (
            <div>
              <div style={styles.contentHeader}>
                <span style={styles.contentTitle}>Addresses</span>
                <button onClick={() => setShowAddAddress(!showAddAddress)} style={styles.smallAddBtn}>
                  <Plus size={12} /> Add
                </button>
              </div>
              {showAddAddress && (
                <form onSubmit={handleAddAddress} style={styles.inlineForm}>
                  <input placeholder="Full Name" value={newAddress.fullName} onChange={e => setNewAddress({ ...newAddress, fullName: e.target.value })} style={styles.miniInput} required />
                  <input placeholder="Mobile No" value={newAddress.mobileNo} onChange={e => setNewAddress({ ...newAddress, mobileNo: e.target.value })} style={styles.miniInput} required />
                  <input placeholder="Pincode" value={newAddress.pincode} onChange={e => setNewAddress({ ...newAddress, pincode: e.target.value })} style={styles.miniInput} />
                  <input placeholder="Flat/House No" value={newAddress.flatHouseNo} onChange={e => setNewAddress({ ...newAddress, flatHouseNo: e.target.value })} style={styles.miniInput} />
                  <input placeholder="Road/Street" value={newAddress.roadStreetName} onChange={e => setNewAddress({ ...newAddress, roadStreetName: e.target.value })} style={styles.miniInput} />
                  <input placeholder="City" value={newAddress.city} onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} style={styles.miniInput} />
                  <input placeholder="State" value={newAddress.state} onChange={e => setNewAddress({ ...newAddress, state: e.target.value })} style={styles.miniInput} />
                  <button type="submit" style={styles.miniBtn}>Add Address</button>
                </form>
              )}
              {addresses.length === 0 ? (
                <p style={styles.empty}>No addresses added</p>
              ) : (
                addresses.map(a => (
                  <div key={a.id} style={styles.listItem}>
                    <div>
                      <span style={styles.listMain}>{a.fullName}</span>
                      <span style={styles.listSub}>{a.flatHouseNo}, {a.roadStreetName}, {a.city} - {a.pincode}</span>
                      <span style={styles.listSub}>{a.mobileNo}</span>
                    </div>
                    <button onClick={() => handleDeleteAddress(a.id)} style={styles.deleteBtn}><Trash2 size={14} /></button>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'orders' && (
            <div>
              <span style={styles.contentTitle}>Order History</span>
              {orders.length === 0 ? (
                <p style={styles.empty}>No orders placed</p>
              ) : (
                orders.map(o => (
                  <div key={o.id} style={styles.listItem}>
                    <div>
                      <span style={styles.listMain}>Order #{o.id}</span>
                      <span style={{
                        ...styles.orderStatus,
                        color: o.status === 'Processing' ? '#f39c12' : o.status === 'Cancelled' ? '#e74c3c' : '#2ecc71',
                      }}>{o.status}</span>
                      <span style={styles.listSub}> &bull; ₹{(o.totalAmount || 0).toFixed(2)} &bull; Repeat: {o.repeatCount}</span>
                    </div>
                    <span style={styles.listDate}>{new Date(o.createdAt).toLocaleDateString()}</span>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'credits' && (
            <div>
              <span style={styles.contentTitle}>Credit Transactions</span>
              {creditHistory.length === 0 ? (
                <p style={styles.empty}>No credit history</p>
              ) : (
                creditHistory.map(tx => (
                  <div key={tx.id} style={styles.listItem}>
                    <div>
                      <span style={{
                        ...styles.txType,
                        color: tx.type === 'add' || tx.type === 'refund' ? '#2ecc71' : '#e74c3c',
                      }}>
                        {tx.type === 'add' || tx.type === 'refund' ? '+' : '-'}{tx.amount.toFixed(1)}
                      </span>
                      <span style={styles.listSub}>{tx.description}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={styles.listSub}>Balance: {tx.balanceAfter.toFixed(1)}</span>
                      <br />
                      <span style={styles.listDate}>{new Date(tx.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
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
    maxWidth: '700px',
    maxHeight: '85vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    borderBottom: '1px solid var(--border)',
  },
  headerInfo: { display: 'flex', alignItems: 'center', gap: '10px' },
  title: { fontSize: '16px', fontWeight: 600, margin: 0, color: 'var(--text-primary)' },
  subtitle: { fontSize: '12px', color: 'var(--text-secondary)' },
  closeBtn: { background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' },
  tabs: {
    display: 'flex',
    borderBottom: '1px solid var(--border)',
    overflow: 'auto',
  },
  tab: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '10px 16px',
    border: 'none',
    background: 'none',
    color: 'var(--text-secondary)',
    fontSize: '12px',
    fontWeight: 500,
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
    whiteSpace: 'nowrap',
  },
  tabActive: {
    color: 'var(--accent)',
    borderBottomColor: 'var(--accent)',
  },
  tabCount: {
    background: 'var(--bg-input)',
    padding: '1px 6px',
    borderRadius: '8px',
    fontSize: '10px',
  },
  content: { padding: '16px 20px', overflow: 'auto', flex: 1 },
  contentHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '12px',
  },
  contentTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  smallAddBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 10px',
    background: '#2ecc71',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--radius)',
    fontSize: '11px',
    cursor: 'pointer',
  },
  inlineForm: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '12px',
    padding: '12px',
    background: 'var(--bg-input)',
    borderRadius: 'var(--radius)',
  },
  miniInput: {
    flex: '1 1 140px',
    padding: '8px 10px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    color: 'var(--text-primary)',
    fontSize: '12px',
    outline: 'none',
  },
  miniBtn: {
    padding: '8px 16px',
    background: 'var(--accent)',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--radius)',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  listItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 0',
    borderBottom: '1px solid var(--border)',
  },
  listMain: {
    fontSize: '13px',
    fontWeight: 600,
    color: 'var(--text-primary)',
    marginRight: '8px',
  },
  listSub: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
  },
  listDate: {
    fontSize: '11px',
    color: 'var(--text-muted)',
  },
  orderStatus: {
    fontSize: '11px',
    fontWeight: 600,
  },
  txType: {
    fontSize: '14px',
    fontWeight: 700,
    marginRight: '8px',
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    color: '#e74c3c',
    cursor: 'pointer',
    padding: '4px',
  },
  empty: {
    textAlign: 'center',
    color: 'var(--text-muted)',
    padding: '24px',
    fontSize: '13px',
  },
};
