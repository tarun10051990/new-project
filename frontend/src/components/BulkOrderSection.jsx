import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import AddressForm from './AddressForm';
import CartBlock from './CartBlock';
import PaymentModal from './PaymentModal';
import { Lock, Zap, Plus, ChevronDown, ChevronUp, Trash2, Settings, Package, AlertTriangle } from 'lucide-react';

const emptyCart = () => ({
  products: [{ url: '', qty: 1 }],
  expectedPrice: '',
  couponCode: '',
});

export default function BulkOrderSection() {
  const { user, refreshUser } = useAuth();
  const isDemo = user?.role === 'DEMO';
  const [addresses, setAddresses] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [randomizeMobile, setRandomizeMobile] = useState(true);
  const [repeatCount, setRepeatCount] = useState(1);
  const [carts, setCarts] = useState([emptyCart()]);
  const [optionalOpen, setOptionalOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [stockResults, setStockResults] = useState([]);
  const [checkingStock, setCheckingStock] = useState(false);
  const [showPayment, setShowPayment] = useState(null);

  const loadAddresses = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await api.get(`/addresses/${user.id}`);
      setAddresses(data);
    } catch { /* ignore */ }
  }, [user]);

  const loadAccounts = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await api.get(`/accounts/${user.id}`);
      setAccounts(data);
    } catch { /* ignore */ }
  }, [user]);

  useEffect(() => { loadAddresses(); }, [loadAddresses]);
  useEffect(() => { loadAccounts(); }, [loadAccounts]);

  const updateCart = (idx, cart) => {
    const newCarts = [...carts];
    newCarts[idx] = cart;
    setCarts(newCarts);
  };

  const addCart = () => setCarts([...carts, emptyCart()]);
  const removeCart = (idx) => setCarts(carts.filter((_, i) => i !== idx));
  const addProduct = (cartIdx) => {
    const newCarts = [...carts];
    newCarts[cartIdx].products.push({ url: '', qty: 1 });
    setCarts(newCarts);
  };
  const removeProduct = (cartIdx, prodIdx) => {
    const newCarts = [...carts];
    newCarts[cartIdx].products = newCarts[cartIdx].products.filter((_, i) => i !== prodIdx);
    if (newCarts[cartIdx].products.length === 0) newCarts[cartIdx].products = [{ url: '', qty: 1 }];
    setCarts(newCarts);
  };

  const handleDeleteAddress = async () => {
    if (!selectedAddress) return;
    try {
      await api.delete(`/addresses/${selectedAddress}`);
      toast.success('Address deleted');
      setSelectedAddress('');
      loadAddresses();
    } catch {
      toast.error('Failed to delete address');
    }
  };

  const handleCheckStock = async () => {
    const products = [];
    carts.forEach(cart => {
      cart.products.forEach(p => {
        if (p.url.trim()) {
          products.push({ productUrl: p.url, quantity: p.qty });
        }
      });
    });
    if (products.length === 0) {
      toast.error('Add product URLs to check stock');
      return;
    }
    setCheckingStock(true);
    setStockResults([]);
    try {
      const selectedAddr = addresses.find(a => String(a.id) === String(selectedAddress));
      const pincode = selectedAddr?.pincode || '';
      const results = [];
      for (const prod of products) {
        const { data } = await api.post('/jiomart/check-stock', {
          productUrl: prod.productUrl,
          quantity: prod.quantity,
          pincode,
        });
        results.push(data);
      }
      setStockResults(results);
      const outOfStock = results.filter(r => !r.inStock);
      if (outOfStock.length > 0) {
        toast.error(`${outOfStock.length} product(s) have insufficient stock`);
      } else {
        toast.success('All products in stock!');
      }
    } catch {
      toast.error('Failed to check stock');
    } finally {
      setCheckingStock(false);
    }
  };

  const handleSyncCart = async () => {
    if (!selectedAccount) {
      toast.error('Select an account to sync cart');
      return;
    }
    const items = [];
    carts.forEach(cart => {
      cart.products.forEach(p => {
        if (p.url.trim()) {
          items.push({ productUrl: p.url, quantity: p.qty });
        }
      });
    });
    if (items.length === 0) {
      toast.error('Add product URLs first');
      return;
    }
    try {
      const { data } = await api.post('/jiomart/sync-cart', {
        accountId: parseInt(selectedAccount),
        items,
      });
      toast.success(`${data.syncedItems} item(s) synced to JioMart cart`);
    } catch {
      toast.error('Failed to sync cart');
    }
  };

  const handleStartBulkOrders = async () => {
    if (isDemo) {
      toast.error('Demo users cannot place orders. Contact admin for Premium access.');
      return;
    }
    if (!selectedAddress) {
      toast.error('Please select a delivery address');
      return;
    }
    const hasProducts = carts.some(c => c.products.some(p => p.url.trim()));
    if (!hasProducts) {
      toast.error('Please add at least one product URL');
      return;
    }
    setProcessing(true);
    try {
      const cartItems = [];
      carts.forEach((cart, ci) => {
        cart.products.forEach(p => {
          if (p.url.trim()) {
            cartItems.push({
              cartNumber: ci + 1,
              productUrl: p.url,
              quantity: p.qty,
            });
          }
        });
      });
      const { data } = await api.post('/orders', {
        userId: user.id,
        addressId: parseInt(selectedAddress),
        accountId: selectedAccount ? parseInt(selectedAccount) : null,
        repeatCount,
        randomizeMobile,
        couponCode: carts[0]?.couponCode || '',
        expectedPrice: carts[0]?.expectedPrice ? parseFloat(carts[0].expectedPrice) : null,
        cartItems,
      });
      toast.success('Order created! Proceeding to payment...');
      refreshUser?.();
      setShowPayment({
        orderId: data.orderId,
        amount: carts[0]?.expectedPrice ? parseFloat(carts[0].expectedPrice) * repeatCount : 99.0,
      });
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to start bulk orders';
      toast.error(msg);
    } finally {
      setProcessing(false);
    }
  };

  const handlePaymentComplete = () => {
    setShowPayment(null);
    toast.success('Payment completed successfully!');
  };

  return (
    <div style={styles.section}>
      <div style={styles.sectionHeader}>
        <Lock size={18} />
        <h3 style={styles.sectionTitle}>Bulk Order</h3>
        {isDemo && <span style={styles.demoTag}>VIEW ONLY</span>}
      </div>

      {!isDemo && <AddressForm onAddressAdded={loadAddresses} accounts={accounts} />}

      <div style={styles.fieldGroup}>
        <label style={styles.label}>Target Delivery Address</label>
        <div style={styles.addressRow}>
          <select
            value={selectedAddress}
            onChange={(e) => setSelectedAddress(e.target.value)}
            style={styles.select}
            disabled={isDemo}
          >
            <option value="">-- Select Address --</option>
            {addresses.map(a => (
              <option key={a.id} value={a.id}>
                {a.fullName} - {a.flatHouseNo}, {a.city} ({a.pincode})
              </option>
            ))}
          </select>
          {!isDemo && (
            <button onClick={handleDeleteAddress} style={styles.deleteBtn} title="Delete Selected Address">
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      <div style={styles.fieldGroup}>
        <label style={styles.label}>Select Account for Order</label>
        <select
          value={selectedAccount}
          onChange={(e) => setSelectedAccount(e.target.value)}
          style={styles.select}
          disabled={isDemo}
        >
          <option value="">-- Select Account (Optional) --</option>
          {accounts.map(a => (
            <option key={a.id} value={a.id}>
              {a.mobileNumber} ({a.state})
            </option>
          ))}
        </select>
      </div>

      <div style={styles.checkboxRow}>
        <input
          type="checkbox"
          checked={randomizeMobile}
          onChange={(e) => setRandomizeMobile(e.target.checked)}
          id="randomize"
          style={styles.checkbox}
          disabled={isDemo}
        />
        <label htmlFor="randomize" style={styles.checkboxLabel}>
          <strong>Randomize Mobile Number in Address</strong>
          <br />
          <span style={styles.hint}>
            Adds a random 10-digit number (1-xxxxxxxxx) to bypass daily limits. Turn this off to enter your own mobile number
          </span>
        </label>
      </div>

      <div style={styles.repeatRow}>
        <label style={styles.repeatLabel}>Repeat Order Count</label>
        <input
          type="number"
          value={repeatCount}
          onChange={(e) => setRepeatCount(Math.max(1, parseInt(e.target.value) || 1))}
          style={styles.repeatInput}
          min={1}
          disabled={isDemo}
        />
      </div>

      {carts.map((cart, i) => (
        <CartBlock
          key={i}
          cart={cart}
          cartIndex={i}
          onUpdate={(c) => updateCart(i, c)}
          onRemove={() => removeCart(i)}
          onAddProduct={() => addProduct(i)}
          onRemoveProduct={(prodIdx) => removeProduct(i, prodIdx)}
          disabled={isDemo}
        />
      ))}

      {!isDemo && (
        <button onClick={addCart} style={styles.addCartBtn}>
          <Plus size={14} /> Add Another Cart (For using Another Coupon on Same Account)
        </button>
      )}

      {/* Stock Check Section */}
      <div style={styles.stockSection}>
        <button
          onClick={handleCheckStock}
          disabled={checkingStock || isDemo}
          style={{ ...styles.stockBtn, opacity: isDemo ? 0.5 : 1 }}
        >
          <Package size={14} />
          {checkingStock ? 'Checking Stock...' : 'Check Stock Availability'}
        </button>
        {selectedAccount && !isDemo && (
          <button onClick={handleSyncCart} style={styles.syncBtn}>
            Sync Cart to JioMart
          </button>
        )}
      </div>

      {stockResults.length > 0 && (
        <div style={styles.stockResults}>
          <h4 style={styles.stockResultsTitle}>Stock Check Results</h4>
          {stockResults.map((r, i) => (
            <div key={i} style={{
              ...styles.stockItem,
              borderLeft: `3px solid ${r.inStock ? '#2ecc71' : '#e74c3c'}`,
            }}>
              <div style={styles.stockItemName}>{r.productName}</div>
              <div style={styles.stockItemDetails}>
                <span>Available: <strong>{r.availableStock}</strong></span>
                <span>Requested: <strong>{r.requestedQuantity}</strong></span>
                <span>Price: <strong>₹{r.price}</strong></span>
                <span style={{ color: r.inStock ? '#2ecc71' : '#e74c3c', fontWeight: 600 }}>
                  {r.inStock ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={styles.optionalHeader} onClick={() => setOptionalOpen(!optionalOpen)}>
        <span style={styles.optionalTitle}>
          <Settings size={14} /> Optional Features [Do not use without knowledge]
        </span>
        {optionalOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </div>

      {optionalOpen && (
        <div style={styles.optionalContent}>
          <p style={styles.hint}>Advanced features for experienced users. Coming soon.</p>
        </div>
      )}

      <button
        onClick={handleStartBulkOrders}
        disabled={processing || isDemo}
        style={{ ...styles.startBtn, opacity: isDemo ? 0.5 : 1, cursor: isDemo ? 'not-allowed' : 'pointer' }}
      >
        <Zap size={18} />
        {isDemo ? 'PREMIUM ONLY - UPGRADE TO PLACE ORDERS' : processing ? 'PROCESSING...' : 'START BULK ORDERS'}
      </button>

      {showPayment && (
        <PaymentModal
          orderId={showPayment.orderId}
          amount={showPayment.amount}
          onClose={() => setShowPayment(null)}
          onPaymentComplete={handlePaymentComplete}
        />
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
    marginBottom: '24px',
  },
  sectionHeader: {
    display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px',
    color: 'var(--text-primary)',
  },
  sectionTitle: { margin: 0, fontSize: '18px', fontWeight: 600 },
  demoTag: {
    fontSize: '10px', fontWeight: 700, padding: '2px 8px',
    background: 'rgba(243,156,18,0.15)', color: '#f39c12',
    borderRadius: '4px', marginLeft: 'auto',
  },
  fieldGroup: { margin: '16px 0' },
  label: {
    display: 'block', fontSize: '11px', textTransform: 'uppercase',
    fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px',
  },
  addressRow: { display: 'flex', gap: '8px' },
  select: {
    flex: 1, padding: '10px 12px', background: 'var(--bg-input)',
    border: '1px solid var(--border)', borderRadius: 'var(--radius)',
    color: 'var(--text-primary)', fontSize: '13px', outline: 'none',
  },
  deleteBtn: {
    background: 'var(--danger)', border: 'none', borderRadius: 'var(--radius)',
    padding: '8px 12px', color: '#fff', cursor: 'pointer',
  },
  checkboxRow: {
    display: 'flex', alignItems: 'flex-start', gap: '8px',
    margin: '12px 0', padding: '12px', background: 'var(--bg-card)',
    borderRadius: 'var(--radius)',
  },
  checkbox: { marginTop: '4px', accentColor: 'var(--accent)' },
  checkboxLabel: { fontSize: '13px', color: 'var(--text-primary)' },
  hint: { fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'normal' },
  repeatRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    margin: '16px 0', padding: '12px', background: 'var(--bg-card)',
    borderRadius: 'var(--radius)',
  },
  repeatLabel: { fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)' },
  repeatInput: {
    width: '80px', padding: '8px', background: 'var(--bg-input)',
    border: '1px solid var(--border)', borderRadius: 'var(--radius)',
    color: 'var(--text-primary)', fontSize: '14px', textAlign: 'center', outline: 'none',
  },
  addCartBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    width: '100%', padding: '12px', background: 'transparent',
    border: '2px dashed var(--border)', borderRadius: 'var(--radius)',
    color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer',
    marginBottom: '16px',
  },
  stockSection: {
    display: 'flex', gap: '12px', marginBottom: '16px',
  },
  stockBtn: {
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '10px 20px', background: '#8e44ad', border: 'none',
    borderRadius: 'var(--radius)', color: '#fff', fontSize: '13px',
    fontWeight: 600, cursor: 'pointer',
  },
  syncBtn: {
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '10px 20px', background: '#2980b9', border: 'none',
    borderRadius: 'var(--radius)', color: '#fff', fontSize: '13px',
    fontWeight: 600, cursor: 'pointer',
  },
  stockResults: {
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', padding: '16px', marginBottom: '16px',
  },
  stockResultsTitle: {
    margin: '0 0 12px', fontSize: '14px', fontWeight: 600,
    color: 'var(--text-primary)',
  },
  stockItem: {
    padding: '10px 12px', marginBottom: '8px',
    background: 'var(--bg-input)', borderRadius: 'var(--radius)',
  },
  stockItemName: {
    fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)',
    marginBottom: '4px',
  },
  stockItemDetails: {
    display: 'flex', gap: '16px', fontSize: '12px',
    color: 'var(--text-secondary)', flexWrap: 'wrap',
  },
  optionalHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '12px', background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', cursor: 'pointer', marginBottom: '16px',
    color: 'var(--text-secondary)',
  },
  optionalTitle: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' },
  optionalContent: {
    padding: '16px', background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', marginBottom: '16px', marginTop: '-8px',
  },
  startBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    width: '100%', padding: '16px', background: 'var(--accent)', border: 'none',
    borderRadius: 'var(--radius)', color: '#fff', fontSize: '16px',
    fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s',
    letterSpacing: '0.5px',
  },
};
