import { Plus, X, Download, Trash2 } from 'lucide-react';

export default function CartBlock({ cart, cartIndex, onUpdate, onRemove, onAddProduct, onRemoveProduct, disabled }) {
  const updateProduct = (prodIdx, field, value) => {
    const products = [...cart.products];
    products[prodIdx] = { ...products[prodIdx], [field]: value };
    onUpdate({ ...cart, products });
  };

  return (
    <div style={styles.block}>
      <div style={styles.blockHeader}>
        <h4 style={styles.blockTitle}>Cart #{cartIndex + 1}</h4>
        <div style={styles.blockActions}>
          <button style={styles.smallBtn}><Download size={12} /> Fetch Live Cart</button>
          <button style={{ ...styles.smallBtn, color: 'var(--danger)' }}><Trash2 size={12} /> Clear Cart</button>
        </div>
        {cartIndex > 0 && (
          <button onClick={onRemove} style={styles.deleteCartBtn}><Trash2 size={14} /></button>
        )}
      </div>

      {cart.products.map((prod, i) => (
        <div key={i} style={styles.productRow}>
          <input
            placeholder="Enter product url"
            value={prod.url}
            onChange={(e) => updateProduct(i, 'url', e.target.value)}
            style={styles.urlInput}
          />
          <div style={styles.qtyWrap}>
            <label style={styles.qtyLabel}>Qty</label>
            <input
              type="number"
              value={prod.qty}
              onChange={(e) => updateProduct(i, 'qty', parseInt(e.target.value) || 1)}
              style={styles.qtyInput}
              min={1}
            />
          </div>
          <button onClick={() => onRemoveProduct(i)} style={styles.removeBtn}>&times;</button>
        </div>
      ))}

      <button onClick={onAddProduct} style={styles.addProductBtn}>
        <Plus size={14} /> Add Product
      </button>

      <div style={styles.priceRow}>
        <div style={styles.priceField}>
          <label style={styles.label}>Expected Price</label>
          <input
            type="number"
            placeholder="Expected Price"
            value={cart.expectedPrice}
            onChange={(e) => onUpdate({ ...cart, expectedPrice: e.target.value })}
            style={styles.input}
          />
        </div>
        <div style={styles.priceField}>
          <label style={styles.label}>Coupon Code</label>
          <input
            placeholder="Coupon"
            value={cart.couponCode}
            onChange={(e) => onUpdate({ ...cart, couponCode: e.target.value })}
            style={styles.input}
          />
        </div>
      </div>
    </div>
  );
}

const styles = {
  block: {
    background: 'var(--bg-card)',
    border: '1px dashed var(--border)',
    borderRadius: 'var(--radius)',
    padding: '16px',
    marginBottom: '12px',
  },
  blockHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px',
    flexWrap: 'wrap',
  },
  blockTitle: { margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' },
  blockActions: { display: 'flex', gap: '8px' },
  smallBtn: {
    display: 'flex', alignItems: 'center', gap: '4px',
    background: 'none', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', padding: '4px 10px',
    color: 'var(--text-secondary)', fontSize: '12px', cursor: 'pointer',
  },
  deleteCartBtn: {
    marginLeft: 'auto', background: 'none', border: 'none',
    color: 'var(--text-muted)', cursor: 'pointer',
  },
  productRow: {
    display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px',
  },
  urlInput: {
    flex: 1, padding: '10px 12px', background: 'var(--bg-input)',
    border: '1px solid var(--border)', borderRadius: 'var(--radius)',
    color: 'var(--text-primary)', fontSize: '13px', outline: 'none',
  },
  qtyWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  qtyLabel: { fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' },
  qtyInput: {
    width: '50px', padding: '10px 6px', background: 'var(--bg-input)',
    border: '1px solid var(--border)', borderRadius: 'var(--radius)',
    color: 'var(--text-primary)', fontSize: '13px', outline: 'none', textAlign: 'center',
  },
  removeBtn: {
    background: 'none', border: 'none', color: 'var(--text-muted)',
    fontSize: '18px', cursor: 'pointer', padding: '4px',
  },
  addProductBtn: {
    display: 'flex', alignItems: 'center', gap: '4px',
    background: 'none', border: 'none', color: 'var(--accent)',
    fontSize: '13px', cursor: 'pointer', padding: '4px 0', marginBottom: '12px',
  },
  priceRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  priceField: { display: 'flex', flexDirection: 'column', gap: '4px' },
  label: { fontSize: '11px', textTransform: 'uppercase', fontWeight: 600, color: 'var(--text-muted)' },
  input: {
    padding: '10px 12px', background: 'var(--bg-input)',
    border: '1px solid var(--border)', borderRadius: 'var(--radius)',
    color: 'var(--text-primary)', fontSize: '13px', outline: 'none',
  },
};
