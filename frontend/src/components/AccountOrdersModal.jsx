import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import {
  X, Package, RefreshCw, XCircle, Eye, Clock
} from 'lucide-react';

export default function AccountOrdersModal({ account, onClose }) {
  const [orders, setOrders] = useState([]);
  const [trackings, setTrackings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');

  const loadData = useCallback(async () => {
    try {
      const [ordersRes, trackingsRes] = await Promise.all([
        api.get(`/orders/account/${account.id}`),
        api.get(`/tracking/account/${account.id}`),
      ]);
      setOrders(ordersRes.data);
      setTrackings(trackingsRes.data);
    } catch {
      toast.error('Failed to load account orders');
    } finally {
      setLoading(false);
    }
  }, [account.id]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleCancelOrder = async (orderId) => {
    try {
      await api.post(`/orders/${orderId}/cancel`);
      toast.success('Order cancelled');
      loadData();
    } catch {
      toast.error('Failed to cancel order');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'var(--success)';
      case 'Processing': return 'var(--warning)';
      case 'Shipped': case 'Out for Delivery': return '#3b82f6';
      case 'Cancelled': return 'var(--danger)';
      default: return 'var(--text-muted)';
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <div style={styles.modalTitleWrap}>
            <Package size={18} />
            <div>
              <h3 style={styles.modalTitle}>Account Orders</h3>
              <span style={styles.modalSubtitle}>{account.mobileNumber} (ID: {account.id})</span>
            </div>
          </div>
          <div style={styles.headerActions}>
            <button onClick={loadData} style={styles.refreshBtn}>
              <RefreshCw size={12} /> Refresh
            </button>
            <button onClick={onClose} style={styles.closeBtn}>
              <X size={18} />
            </button>
          </div>
        </div>

        <div style={styles.tabs}>
          <button
            onClick={() => setActiveTab('orders')}
            style={activeTab === 'orders' ? styles.activeTab : styles.tab}
          >
            Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('tracking')}
            style={activeTab === 'tracking' ? styles.activeTab : styles.tab}
          >
            Tracking & OTPs ({trackings.length})
          </button>
        </div>

        <div style={styles.modalBody}>
          {loading ? (
            <div style={styles.loadingWrap}>
              <RefreshCw size={20} />
              <span style={styles.loadingText}>Loading...</span>
            </div>
          ) : activeTab === 'orders' ? (
            orders.length === 0 ? (
              <div style={styles.emptyState}>
                <Package size={36} color="var(--text-muted)" />
                <p>No orders found for this account.</p>
              </div>
            ) : (
              <div style={styles.orderList}>
                {orders.map((order) => (
                  <div key={order.id} style={styles.orderCard}>
                    <div style={styles.orderRow}>
                      <div style={styles.orderInfo}>
                        <span style={styles.orderLabel}>Order #{order.id}</span>
                        <span style={{ ...styles.statusBadge, background: getStatusColor(order.status) }}>
                          {order.status}
                        </span>
                      </div>
                      <div style={styles.orderMeta}>
                        <Clock size={11} />
                        <span>{new Date(order.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                    <div style={styles.orderDetails}>
                      <span>Repeat: {order.repeatCount}x</span>
                      {order.couponCode && <span>Coupon: {order.couponCode}</span>}
                      {order.totalAmount > 0 && <span>Amount: Rs. {order.totalAmount.toFixed(2)}</span>}
                    </div>
                    {order.status !== 'Cancelled' && order.status !== 'Delivered' && (
                      <button onClick={() => handleCancelOrder(order.id)} style={styles.cancelOrderBtn}>
                        <XCircle size={12} /> Cancel Order
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )
          ) : (
            trackings.length === 0 ? (
              <div style={styles.emptyState}>
                <Eye size={36} color="var(--text-muted)" />
                <p>No tracking data for this account.</p>
              </div>
            ) : (
              <div style={styles.orderList}>
                {trackings.map((t) => (
                  <div key={t.id} style={styles.orderCard}>
                    <div style={styles.orderRow}>
                      <div style={styles.orderInfo}>
                        <span style={styles.orderLabel}>{t.jioOrderId || `Tracking #${t.id}`}</span>
                        <span style={{ ...styles.statusBadge, background: getStatusColor(t.deliveryStatus) }}>
                          {t.deliveryStatus}
                        </span>
                      </div>
                      {t.deliveryOtp && (
                        <span style={styles.otpDisplay}>
                          OTP: {t.deliveryOtp}
                        </span>
                      )}
                    </div>
                    <div style={styles.orderDetails}>
                      <span>{t.productName || 'Unknown product'}</span>
                      {t.orderAmount > 0 && <span>Rs. {t.orderAmount.toFixed(2)}</span>}
                      {t.estimatedDelivery && <span>ETA: {t.estimatedDelivery}</span>}
                    </div>
                    <div style={styles.orderMeta}>
                      <Clock size={11} />
                      <span>Synced: {t.lastSyncedAt ? new Date(t.lastSyncedAt).toLocaleString() : '--'}</span>
                    </div>
                    <div style={styles.trackingActions}>
                      {t.trackingUrl && (
                        <a href={t.trackingUrl} target="_blank" rel="noreferrer" style={styles.trackLink}>
                          <Eye size={12} /> Track
                        </a>
                      )}
                      {t.deliveryStatus !== 'Delivered' && t.deliveryStatus !== 'Cancelled' && (
                        <button
                          onClick={async () => {
                            await api.post(`/tracking/${t.id}/cancel`);
                            toast.success('Order cancelled');
                            loadData();
                          }}
                          style={styles.cancelOrderBtn}
                        >
                          <XCircle size={12} /> Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
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
    maxWidth: '640px',
    maxHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid var(--border)',
  },
  modalTitleWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: 'var(--text-primary)',
  },
  modalTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  modalSubtitle: {
    fontSize: '12px',
    color: 'var(--text-muted)',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  refreshBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 10px',
    background: 'var(--bg-input)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    color: 'var(--text-secondary)',
    fontSize: '11px',
    cursor: 'pointer',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    padding: '4px',
  },
  tabs: {
    display: 'flex',
    borderBottom: '1px solid var(--border)',
  },
  tab: {
    flex: 1,
    padding: '10px',
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    color: 'var(--text-muted)',
    fontSize: '13px',
    cursor: 'pointer',
  },
  activeTab: {
    flex: 1,
    padding: '10px',
    background: 'none',
    border: 'none',
    borderBottom: '2px solid var(--accent)',
    color: 'var(--accent)',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  modalBody: {
    padding: '16px 20px',
    overflowY: 'auto',
    flex: 1,
  },
  loadingWrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '40px 0',
    color: 'var(--text-muted)',
  },
  loadingText: {
    fontSize: '13px',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '40px 0',
    color: 'var(--text-muted)',
    fontSize: '13px',
  },
  orderList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  orderCard: {
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '14px',
  },
  orderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  orderInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  orderLabel: {
    fontSize: '13px',
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  statusBadge: {
    padding: '2px 8px',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '10px',
    fontWeight: 600,
  },
  otpDisplay: {
    padding: '3px 10px',
    borderRadius: '6px',
    background: 'var(--warning)',
    color: '#000',
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '1px',
  },
  orderDetails: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    fontSize: '12px',
    color: 'var(--text-secondary)',
    marginBottom: '6px',
  },
  orderMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '11px',
    color: 'var(--text-muted)',
    marginBottom: '8px',
  },
  trackingActions: {
    display: 'flex',
    gap: '6px',
  },
  trackLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
    padding: '4px 10px',
    background: 'var(--accent)',
    borderRadius: 'var(--radius)',
    color: '#fff',
    fontSize: '11px',
    textDecoration: 'none',
    fontWeight: 600,
  },
  cancelOrderBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
    padding: '4px 10px',
    background: 'none',
    border: '1px solid var(--danger)',
    borderRadius: 'var(--radius)',
    color: 'var(--danger)',
    fontSize: '11px',
    cursor: 'pointer',
    fontWeight: 600,
  },
};
