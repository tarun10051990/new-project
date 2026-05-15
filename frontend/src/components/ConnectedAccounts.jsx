import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import {
  Users, Search, RefreshCw, Trash2, Plus, Star,
  ChevronLeft, ChevronRight
} from 'lucide-react';

export default function ConnectedAccounts() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [rowRange, setRowRange] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(40);
  const [page, setPage] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAccount, setNewAccount] = useState({ mobileNumber: '', accessToken: '', refreshToken: '' });

  const loadAccounts = useCallback(async () => {
    if (!user) return;
    try {
      const url = searchQuery
        ? `/accounts/${user.id}/search?q=${encodeURIComponent(searchQuery)}`
        : `/accounts/${user.id}`;
      const { data } = await api.get(url);
      setAccounts(data);
    } catch {
      // ignore
    }
  }, [user, searchQuery]);

  useEffect(() => { loadAccounts(); }, [loadAccounts]);

  const toggleSelect = (id) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const selectAll = () => {
    if (selected.size === accounts.length) setSelected(new Set());
    else setSelected(new Set(accounts.map(a => a.id)));
  };

  const handleSelectRange = () => {
    if (!rowRange) return;
    const parts = rowRange.split('-').map(Number);
    if (parts.length === 2) {
      const ids = accounts.slice(parts[0] - 1, parts[1]).map(a => a.id);
      setSelected(new Set(ids));
    }
  };

  const handleDelete = async () => {
    if (selected.size === 0) return;
    try {
      await api.delete('/accounts/bulk', { data: { ids: [...selected] } });
      toast.success(`${selected.size} account(s) deleted`);
      setSelected(new Set());
      loadAccounts();
    } catch {
      toast.error('Failed to delete accounts');
    }
  };

  const handleAddAccount = async () => {
    if (!newAccount.mobileNumber) {
      toast.error('Mobile number is required');
      return;
    }
    try {
      await api.post('/accounts', { ...newAccount, userId: user.id });
      toast.success('Account added');
      setNewAccount({ mobileNumber: '', accessToken: '', refreshToken: '' });
      setShowAddModal(false);
      loadAccounts();
    } catch {
      toast.error('Failed to add account');
    }
  };

  const startIdx = page * rowsPerPage;
  const pageAccounts = accounts.slice(startIdx, startIdx + rowsPerPage);
  const totalPages = Math.ceil(accounts.length / rowsPerPage);

  return (
    <div style={styles.section}>
      <div style={styles.sectionHeader}>
        <Users size={18} />
        <h3 style={styles.sectionTitle}>Connected Accounts</h3>
        <Users size={14} color="var(--text-muted)" />
      </div>

      <div style={styles.toolbar}>
        <div style={styles.searchGroup}>
          <div style={styles.searchWrap}>
            <Search size={14} />
            <input
              placeholder="Search Mobile or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
          </div>
          <input
            placeholder="Row 3-8"
            value={rowRange}
            onChange={(e) => setRowRange(e.target.value)}
            style={styles.rangeInput}
          />
          <button onClick={handleSelectRange} style={styles.toolBtn}>Select</button>
        </div>
        <div style={styles.toolActions}>
          <button style={styles.toolBtn}>Select ({selected.size}) Orders</button>
          <button onClick={() => setSelected(new Set())} style={styles.toolBtn}>Unselect All</button>
          <button onClick={loadAccounts} style={styles.toolBtn}><RefreshCw size={12} /> Refresh</button>
          <button onClick={handleDelete} style={{ ...styles.toolBtn, color: 'var(--danger)' }}>
            <Trash2 size={12} /> Delete
          </button>
          <button style={{ ...styles.toolBtn, color: 'var(--warning)' }}>
            <Star size={12} /> Buy Accounts
          </button>
          <button onClick={() => setShowAddModal(true)} style={styles.addBtn}>
            <Plus size={12} /> Add Account
          </button>
        </div>
      </div>

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>
                <input type="checkbox" checked={selected.size === accounts.length && accounts.length > 0} onChange={selectAll} />
              </th>
              <th style={styles.th}>Account #</th>
              <th style={styles.th}>Mobile Number</th>
              <th style={styles.th}>State</th>
              <th style={styles.th}>Live Activity</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageAccounts.length === 0 ? (
              <tr><td colSpan={6} style={styles.empty}>No accounts found.</td></tr>
            ) : (
              pageAccounts.map((acc, i) => (
                <tr key={acc.id} style={selected.has(acc.id) ? styles.selectedRow : {}}>
                  <td style={styles.td}>
                    <input type="checkbox" checked={selected.has(acc.id)} onChange={() => toggleSelect(acc.id)} />
                  </td>
                  <td style={styles.td}>{startIdx + i + 1}</td>
                  <td style={styles.td}>{acc.mobileNumber}</td>
                  <td style={styles.td}>
                    <span style={{ ...styles.badge, background: acc.state === 'Active' ? 'var(--success)' : 'var(--danger)' }}>
                      {acc.state}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.activityBadge}>{acc.liveActivity}</span>
                  </td>
                  <td style={styles.td}>
                    <button
                      onClick={async () => { await api.delete(`/accounts/${acc.id}`); loadAccounts(); }}
                      style={styles.actionBtn}
                    >
                      <Trash2 size={12} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={styles.pagination}>
        <div style={styles.paginationControls}>
          <span style={styles.paginationLabel}>Rows per page:</span>
          <select value={rowsPerPage} onChange={(e) => { setRowsPerPage(+e.target.value); setPage(0); }} style={styles.paginationSelect}>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={40}>40</option>
            <option value={100}>100</option>
          </select>
        </div>
        <span style={styles.paginationInfo}>
          {accounts.length === 0 ? '0-0 of 0' : `${startIdx + 1}-${Math.min(startIdx + rowsPerPage, accounts.length)} of ${accounts.length}`}
        </span>
        <div style={styles.paginationNav}>
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} style={styles.pageBtn}>
            <ChevronLeft size={16} />
          </button>
          <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} style={styles.pageBtn}>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {showAddModal && (
        <div style={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Add Account</h3>
            <input
              placeholder="Mobile Number"
              value={newAccount.mobileNumber}
              onChange={(e) => setNewAccount({ ...newAccount, mobileNumber: e.target.value })}
              style={styles.modalInput}
            />
            <input
              placeholder="Access Token (cra_access_token)"
              value={newAccount.accessToken}
              onChange={(e) => setNewAccount({ ...newAccount, accessToken: e.target.value })}
              style={styles.modalInput}
            />
            <input
              placeholder="Refresh Token (cra_refresh_token)"
              value={newAccount.refreshToken}
              onChange={(e) => setNewAccount({ ...newAccount, refreshToken: e.target.value })}
              style={styles.modalInput}
            />
            <div style={styles.modalActions}>
              <button onClick={() => setShowAddModal(false)} style={styles.cancelBtn}>Cancel</button>
              <button onClick={handleAddAccount} style={styles.submitBtn}>Add Account</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  section: {
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '24px',
  },
  sectionHeader: {
    display: 'flex', alignItems: 'center', gap: '8px',
    marginBottom: '16px', color: 'var(--text-primary)',
  },
  sectionTitle: { margin: 0, fontSize: '18px', fontWeight: 600 },
  toolbar: {
    display: 'flex', flexWrap: 'wrap', gap: '8px',
    justifyContent: 'space-between', marginBottom: '16px',
  },
  searchGroup: { display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' },
  searchWrap: {
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '6px 10px', background: 'var(--bg-input)',
    border: '1px solid var(--border)', borderRadius: 'var(--radius)',
    color: 'var(--text-muted)',
  },
  searchInput: {
    background: 'none', border: 'none', outline: 'none',
    color: 'var(--text-primary)', fontSize: '13px', width: '140px',
  },
  rangeInput: {
    padding: '6px 10px', background: 'var(--bg-input)',
    border: '1px solid var(--border)', borderRadius: 'var(--radius)',
    color: 'var(--text-primary)', fontSize: '13px', width: '80px', outline: 'none',
  },
  toolActions: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  toolBtn: {
    display: 'flex', alignItems: 'center', gap: '4px',
    padding: '6px 10px', background: 'var(--bg-input)',
    border: '1px solid var(--border)', borderRadius: 'var(--radius)',
    color: 'var(--text-secondary)', fontSize: '12px', cursor: 'pointer',
  },
  addBtn: {
    display: 'flex', alignItems: 'center', gap: '4px',
    padding: '6px 12px', background: 'var(--accent)',
    border: 'none', borderRadius: 'var(--radius)',
    color: '#fff', fontSize: '12px', cursor: 'pointer',
  },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
  th: {
    textAlign: 'left', padding: '10px 12px',
    borderBottom: '2px solid var(--border)',
    color: 'var(--text-muted)', fontSize: '11px',
    textTransform: 'uppercase', fontWeight: 600,
  },
  td: {
    padding: '10px 12px', borderBottom: '1px solid var(--border)',
    color: 'var(--text-primary)',
  },
  selectedRow: { background: 'var(--accent-light)' },
  empty: {
    textAlign: 'center', padding: '24px',
    color: 'var(--text-muted)', fontSize: '14px',
  },
  badge: {
    padding: '2px 8px', borderRadius: '12px',
    color: '#fff', fontSize: '11px', fontWeight: 600,
  },
  activityBadge: {
    padding: '2px 8px', borderRadius: '12px',
    background: 'var(--bg-input)', color: 'var(--text-secondary)',
    fontSize: '11px',
  },
  actionBtn: {
    background: 'none', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', padding: '4px 8px',
    color: 'var(--text-muted)', cursor: 'pointer',
  },
  pagination: {
    display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
    gap: '16px', marginTop: '12px', flexWrap: 'wrap',
  },
  paginationControls: { display: 'flex', alignItems: 'center', gap: '6px' },
  paginationLabel: { fontSize: '12px', color: 'var(--text-muted)' },
  paginationSelect: {
    padding: '4px 8px', background: 'var(--bg-input)',
    border: '1px solid var(--border)', borderRadius: '4px',
    color: 'var(--text-primary)', fontSize: '12px', outline: 'none',
  },
  paginationInfo: { fontSize: '12px', color: 'var(--text-muted)' },
  paginationNav: { display: 'flex', gap: '4px' },
  pageBtn: {
    background: 'var(--bg-input)', border: '1px solid var(--border)',
    borderRadius: '4px', padding: '4px 6px',
    color: 'var(--text-secondary)', cursor: 'pointer',
    display: 'flex', alignItems: 'center',
  },
  modalOverlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)', padding: '24px',
    width: '100%', maxWidth: '440px',
  },
  modalTitle: { margin: '0 0 16px', fontSize: '18px', color: 'var(--text-primary)' },
  modalInput: {
    width: '100%', padding: '10px 12px', background: 'var(--bg-input)',
    border: '1px solid var(--border)', borderRadius: 'var(--radius)',
    color: 'var(--text-primary)', fontSize: '13px', outline: 'none',
    marginBottom: '10px',
  },
  modalActions: {
    display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px',
  },
  cancelBtn: {
    padding: '8px 16px', background: 'var(--bg-input)',
    border: '1px solid var(--border)', borderRadius: 'var(--radius)',
    color: 'var(--text-secondary)', cursor: 'pointer',
  },
  submitBtn: {
    padding: '8px 16px', background: 'var(--accent)',
    border: 'none', borderRadius: 'var(--radius)',
    color: '#fff', cursor: 'pointer', fontWeight: 600,
  },
};
