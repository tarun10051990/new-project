import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Plus, ChevronDown, ChevronUp, Download } from 'lucide-react';

export default function AddressForm({ onAddressAdded, accounts = [], selectedAccount: externalSelectedAccount }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('manual');
  const [form, setForm] = useState({
    fullName: '', mobileNo: '', pincode: '', flatHouseNo: '',
    roadStreetName: '', localityLandmark: '', city: '', state: '',
    latitude: '', longitude: '',
  });
  const [jsonPayload, setJsonPayload] = useState('');
  const [selectedImportAccount, setSelectedImportAccount] = useState('');
  const [syncAccountId, setSyncAccountId] = useState('');
  const [fetchedAddresses, setFetchedAddresses] = useState([]);
  const [fetching, setFetching] = useState(false);

  const handleChange = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleManualSave = async () => {
    if (!form.fullName || !form.pincode) {
      toast.error('Full Name and Pincode are required');
      return;
    }
    try {
      const accountId = syncAccountId || externalSelectedAccount || null;
      const payload = { ...form, userId: user.id };
      if (accountId) payload.accountId = parseInt(accountId);
      const { data } = await api.post('/addresses', payload);
      const syncMsg = data.syncedToJiomart ? ' & synced to JioMart' : '';
      toast.success('Address saved' + syncMsg);
      setForm({ fullName: '', mobileNo: '', pincode: '', flatHouseNo: '', roadStreetName: '', localityLandmark: '', city: '', state: '', latitude: '', longitude: '' });
      onAddressAdded?.();
    } catch {
      toast.error('Failed to save address');
    }
  };

  const handleJsonSave = async () => {
    try {
      const parsed = JSON.parse(jsonPayload);
      const addr = Array.isArray(parsed) ? parsed[0] : parsed;
      const accountId = syncAccountId || externalSelectedAccount || null;
      const payload = { ...addr, userId: user.id };
      if (accountId) payload.accountId = parseInt(accountId);
      const { data } = await api.post('/addresses', payload);
      const syncMsg = data.syncedToJiomart ? ' & synced to JioMart' : '';
      toast.success('Address saved from JSON' + syncMsg);
      setJsonPayload('');
      onAddressAdded?.();
    } catch {
      toast.error('Invalid JSON payload');
    }
  };

  const handleFetchFromAccount = async () => {
    if (!selectedImportAccount) {
      toast.error('Select an account first');
      return;
    }
    setFetching(true);
    try {
      const { data } = await api.post(`/jiomart/fetch-addresses/${selectedImportAccount}`);
      setFetchedAddresses(data.addresses || []);
      if (data.addresses?.length > 0) {
        toast.success(`Found ${data.addresses.length} address(es) from JioMart account`);
      } else {
        toast.error('No addresses found for this account');
      }
    } catch {
      toast.error('Failed to fetch addresses from JioMart');
    } finally {
      setFetching(false);
    }
  };

  const handleImportAddress = async (addr) => {
    try {
      await api.post('/jiomart/import-address', {
        ...addr,
        userId: user.id,
        accountId: parseInt(selectedImportAccount),
      });
      toast.success('Address imported and synced!');
      onAddressAdded?.();
    } catch {
      toast.error('Failed to import address');
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.header} onClick={() => setOpen(!open)}>
        <span style={styles.headerText}>
          <Plus size={16} /> Add New Address
        </span>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </div>

      {open && (
        <div style={styles.content}>
          <div style={styles.tabs}>
            <button
              style={{ ...styles.tab, ...(tab === 'import' ? styles.tabActive : {}) }}
              onClick={() => setTab('import')}
            >
              ⭐Import from Account⭐
            </button>
            <button
              style={{ ...styles.tab, ...(tab === 'json' ? styles.tabActive : {}) }}
              onClick={() => setTab('json')}
            >
              JSON Payload
            </button>
            <button
              style={{ ...styles.tab, ...(tab === 'manual' ? styles.tabActive : {}) }}
              onClick={() => setTab('manual')}
            >
              Manual Entry
            </button>
          </div>

          {tab === 'import' && (
            <div style={styles.tabContent}>
              <select
                style={styles.select}
                value={selectedImportAccount}
                onChange={(e) => setSelectedImportAccount(e.target.value)}
              >
                <option value="">-- Select Account --</option>
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.mobileNumber} ({a.state})
                  </option>
                ))}
              </select>
              <button
                style={styles.fetchBtn}
                onClick={handleFetchFromAccount}
                disabled={fetching}
              >
                <Download size={14} />
                {fetching ? 'Fetching...' : 'Fetch Addresses from JioMart'}
              </button>

              {fetchedAddresses.length > 0 && (
                <div style={styles.fetchedList}>
                  <p style={styles.fetchedTitle}>Addresses found from JioMart:</p>
                  {fetchedAddresses.map((addr, i) => (
                    <div key={i} style={styles.fetchedItem}>
                      <div style={styles.fetchedDetails}>
                        <strong>{addr.fullName}</strong>
                        <span>{addr.flatHouseNo}, {addr.roadStreetName}</span>
                        <span>{addr.city}, {addr.state} - {addr.pincode}</span>
                      </div>
                      <button
                        onClick={() => handleImportAddress(addr)}
                        style={styles.importBtn}
                      >
                        Import
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {fetchedAddresses.length === 0 && !fetching && (
                <p style={styles.hint}>Select an account above to fetch its saved JioMart addresses.</p>
              )}
            </div>
          )}

          {tab === 'json' && (
            <div style={styles.tabContent}>
              <textarea
                placeholder='Paste JSON address payload here...'
                value={jsonPayload}
                onChange={(e) => setJsonPayload(e.target.value)}
                style={styles.textarea}
                rows={6}
              />
              {accounts.length > 0 && (
                <div style={styles.syncRow}>
                  <label style={styles.syncLabel}>Also sync to JioMart account:</label>
                  <select style={styles.syncSelect} value={syncAccountId} onChange={(e) => setSyncAccountId(e.target.value)}>
                    <option value="">-- Don't sync --</option>
                    {accounts.map(a => (
                      <option key={a.id} value={a.id}>{a.mobileNumber} ({a.state})</option>
                    ))}
                  </select>
                </div>
              )}
              <button style={styles.saveBtn} onClick={handleJsonSave}>Save Address{syncAccountId ? ' & Sync to JioMart' : ''}</button>
            </div>
          )}

          {tab === 'manual' && (
            <div style={styles.tabContent}>
              <div style={styles.grid}>
                <input placeholder="Full Name" value={form.fullName} onChange={handleChange('fullName')} style={styles.input} />
                <input placeholder="Mobile No." value={form.mobileNo} onChange={handleChange('mobileNo')} style={styles.input} />
                <input placeholder="Pincode" value={form.pincode} onChange={handleChange('pincode')} style={styles.input} />
                <input placeholder="Flat / House No." value={form.flatHouseNo} onChange={handleChange('flatHouseNo')} style={styles.input} />
                <input placeholder="Road / Street Name" value={form.roadStreetName} onChange={handleChange('roadStreetName')} style={styles.input} />
                <input placeholder="Locality / Landmark" value={form.localityLandmark} onChange={handleChange('localityLandmark')} style={styles.input} />
                <input placeholder="City" value={form.city} onChange={handleChange('city')} style={styles.input} />
                <input placeholder="State" value={form.state} onChange={handleChange('state')} style={styles.input} />
                <input placeholder="Latitude" type="number" value={form.latitude} onChange={handleChange('latitude')} style={styles.input} />
                <input placeholder="Longitude" type="number" value={form.longitude} onChange={handleChange('longitude')} style={styles.input} />
              </div>
              {accounts.length > 0 && (
                <div style={styles.syncRow}>
                  <label style={styles.syncLabel}>Also sync to JioMart account:</label>
                  <select style={styles.syncSelect} value={syncAccountId} onChange={(e) => setSyncAccountId(e.target.value)}>
                    <option value="">-- Don't sync --</option>
                    {accounts.map(a => (
                      <option key={a.id} value={a.id}>{a.mobileNumber} ({a.state})</option>
                    ))}
                  </select>
                </div>
              )}
              <button style={styles.saveBtn} onClick={handleManualSave}>Save Address{syncAccountId ? ' & Sync to JioMart' : ''}</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  wrapper: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '12px 16px', cursor: 'pointer', color: 'var(--text-secondary)',
  },
  headerText: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' },
  content: { padding: '0 16px 16px' },
  tabs: { display: 'flex', gap: '0', marginBottom: '16px', borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border)' },
  tab: {
    flex: 1, padding: '10px', background: 'var(--bg-input)', border: 'none',
    color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s',
  },
  tabActive: { background: 'var(--accent)', color: '#fff' },
  tabContent: { display: 'flex', flexDirection: 'column', gap: '12px' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  input: {
    padding: '10px 12px', background: 'var(--bg-input)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none',
  },
  select: {
    padding: '10px 12px', background: 'var(--bg-input)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none', width: '100%',
  },
  textarea: {
    padding: '10px 12px', background: 'var(--bg-input)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none',
    resize: 'vertical', fontFamily: 'monospace',
  },
  fetchBtn: {
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '10px 16px', background: '#27ae60', border: 'none',
    borderRadius: 'var(--radius)', color: '#fff', fontSize: '13px',
    fontWeight: 600, cursor: 'pointer', alignSelf: 'flex-start',
  },
  fetchedList: {
    background: 'var(--bg-input)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', padding: '12px',
  },
  fetchedTitle: {
    fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)',
    margin: '0 0 8px',
  },
  fetchedItem: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    gap: '12px', padding: '10px', background: 'var(--bg-card)',
    borderRadius: 'var(--radius)', marginBottom: '8px',
    border: '1px solid var(--border)',
  },
  fetchedDetails: {
    display: 'flex', flexDirection: 'column', gap: '2px',
    fontSize: '12px', color: 'var(--text-primary)',
  },
  importBtn: {
    padding: '6px 16px', background: 'var(--accent)', border: 'none',
    borderRadius: 'var(--radius)', color: '#fff', fontSize: '12px',
    fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
  },
  saveBtn: {
    padding: '12px', background: 'var(--accent)', border: 'none',
    borderRadius: 'var(--radius)', color: '#fff', fontSize: '14px',
    fontWeight: 600, cursor: 'pointer',
  },
  hint: { color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center' },
  syncRow: {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '10px 12px', background: 'var(--bg-input)',
    borderRadius: 'var(--radius)', border: '1px solid var(--border)',
  },
  syncLabel: {
    fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)',
    whiteSpace: 'nowrap',
  },
  syncSelect: {
    flex: 1, padding: '8px', background: 'var(--bg-secondary)',
    border: '1px solid var(--border)', borderRadius: 'var(--radius)',
    color: 'var(--text-primary)', fontSize: '12px', outline: 'none',
  },
};
