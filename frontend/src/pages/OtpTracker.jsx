import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import {
  Radio, RefreshCw, ArrowLeft, MapPin, Clock, Package,
  XCircle, Eye, ChevronDown, ChevronUp
} from 'lucide-react';

export default function OtpTracker() {
  const { user } = useAuth();
  const [trackings, setTrackings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const loadTrackings = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await api.get(`/tracking/${user.id}/active`);
      setTrackings(data);
      setLastSync(new Date());
    } catch {
      toast.error('Failed to load tracking data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadTrackings(); }, [loadTrackings]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(loadTrackings, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, loadTrackings]);

  const handleCancel = async (trackingId) => {
    try {
      await api.post(`/tracking/${trackingId}/cancel`);
      toast.success('Order cancelled');
      loadTrackings();
    } catch {
      toast.error('Failed to cancel order');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'var(--success)';
      case 'Out for Delivery': return '#3b82f6';
      case 'Processing': return 'var(--warning)';
      case 'Shipped': return 'var(--accent)';
      case 'Cancelled': return 'var(--danger)';
      default: return 'var(--text-muted)';
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <Link to="/" style={styles.backLink}>
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <div style={styles.titleRow}>
            <Radio size={20} color="var(--danger)" />
            <h1 style={styles.title}>Live OTP Tracker</h1>
            <span style={styles.liveBadge}>LIVE</span>
          </div>
        </div>
        <div style={styles.headerRight}>
          <div style={styles.syncInfo}>
            <Clock size={12} />
            <span>Last synced: {lastSync ? lastSync.toLocaleTimeString() : '--'}</span>
          </div>
          <label style={styles.toggleLabel}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              style={styles.toggleCheckbox}
            />
            Auto-refresh (30s)
          </label>
          <button onClick={loadTrackings} style={styles.refreshBtn}>
            <RefreshCw size={14} /> Sync Now
          </button>
        </div>
      </div>

      <div style={styles.infoBar}>
        <Package size={14} />
        <span>Syncs every 30 seconds with JioMart for live delivery tracking and Delivery PINs (OTPs).</span>
        <span style={styles.infoBadge}>{trackings.length} active order(s)</span>
      </div>

      {loading ? (
        <div style={styles.loadingWrap}>
          <RefreshCw size={24} className="spin" />
          <p style={styles.loadingText}>Loading tracking data...</p>
        </div>
      ) : trackings.length === 0 ? (
        <div style={styles.emptyState}>
          <Package size={48} color="var(--text-muted)" />
          <h3 style={styles.emptyTitle}>No Active Orders</h3>
          <p style={styles.emptyText}>
            Place a bulk order from the dashboard to see tracking and OTP information here.
          </p>
          <Link to="/" style={styles.goBackBtn}>Go to Dashboard</Link>
        </div>
      ) : (
        <div style={styles.trackingList}>
          {trackings.map((t) => (
            <div key={t.id} style={styles.trackingCard}>
              <div
                style={styles.cardHeader}
                onClick={() => setExpandedId(expandedId === t.id ? null : t.id)}
              >
                <div style={styles.cardHeaderLeft}>
                  <span style={{ ...styles.statusDot, background: getStatusColor(t.deliveryStatus) }} />
                  <div>
                    <div style={styles.orderId}>{t.jioOrderId || `Order #${t.orderId}`}</div>
                    <div style={styles.productName}>{t.productName || 'Unknown product'}</div>
                  </div>
                </div>
                <div style={styles.cardHeaderRight}>
                  <span style={{ ...styles.statusBadge, background: getStatusColor(t.deliveryStatus) }}>
                    {t.deliveryStatus}
                  </span>
                  {t.deliveryOtp && (
                    <span style={styles.otpBadge}>
                      OTP: {t.deliveryOtp}
                    </span>
                  )}
                  {expandedId === t.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>

              {expandedId === t.id && (
                <div style={styles.cardBody}>
                  <div style={styles.detailGrid}>
                    <DetailRow label="JioMart Order ID" value={t.jioOrderId || '--'} />
                    <DetailRow label="Account ID" value={t.accountId || '--'} />
                    <DetailRow label="Mobile" value={t.mobileNumber || '--'} />
                    <DetailRow label="Order Amount" value={t.orderAmount ? `Rs. ${t.orderAmount.toFixed(2)}` : '--'} />
                    <DetailRow label="Estimated Delivery" value={t.estimatedDelivery || 'Pending'} />
                    <DetailRow label="Delivery Address" value={t.deliveryAddress || '--'} />
                    <DetailRow
                      label="Delivery OTP/PIN"
                      value={t.deliveryOtp || 'Will appear when available in order history'}
                      highlight={!!t.deliveryOtp}
                    />
                    <DetailRow label="Last Synced" value={t.lastSyncedAt ? new Date(t.lastSyncedAt).toLocaleString() : '--'} />
                  </div>
                  <div style={styles.cardActions}>
                    {t.trackingUrl && (
                      <a href={t.trackingUrl} target="_blank" rel="noreferrer" style={styles.trackBtn}>
                        <Eye size={12} /> Track on JioMart
                      </a>
                    )}
                    {t.deliveryStatus !== 'Delivered' && t.deliveryStatus !== 'Cancelled' && (
                      <button onClick={() => handleCancel(t.id)} style={styles.cancelBtn}>
                        <XCircle size={12} /> Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value, highlight }) {
  return (
    <div style={styles.detailRow}>
      <span style={styles.detailLabel}>{label}</span>
      <span style={{ ...styles.detailValue, ...(highlight ? styles.highlightValue : {}) }}>
        {value}
      </span>
    </div>
  );
}

const styles = {
  page: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '24px',
    minHeight: '100vh',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '16px',
    marginBottom: '20px',
  },
  headerLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  backLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    color: 'var(--accent)',
    textDecoration: 'none',
    fontSize: '13px',
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  title: {
    margin: 0,
    fontSize: '22px',
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  liveBadge: {
    background: 'var(--danger)',
    color: '#fff',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '1px',
    animation: 'pulse 2s infinite',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  syncInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    color: 'var(--text-muted)',
  },
  toggleLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
  },
  toggleCheckbox: {
    cursor: 'pointer',
  },
  refreshBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 12px',
    background: 'var(--accent)',
    border: 'none',
    borderRadius: 'var(--radius)',
    color: '#fff',
    fontSize: '12px',
    cursor: 'pointer',
    fontWeight: 600,
  },
  infoBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    fontSize: '12px',
    color: 'var(--text-secondary)',
    marginBottom: '20px',
  },
  infoBadge: {
    marginLeft: 'auto',
    background: 'var(--accent)',
    color: '#fff',
    padding: '2px 8px',
    borderRadius: '10px',
    fontSize: '11px',
    fontWeight: 600,
  },
  loadingWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '60px 0',
  },
  loadingText: {
    color: 'var(--text-muted)',
    marginTop: '12px',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '60px 0',
    textAlign: 'center',
  },
  emptyTitle: {
    margin: '16px 0 8px',
    color: 'var(--text-primary)',
    fontSize: '18px',
  },
  emptyText: {
    color: 'var(--text-muted)',
    fontSize: '14px',
    maxWidth: '400px',
    marginBottom: '20px',
  },
  goBackBtn: {
    padding: '10px 20px',
    background: 'var(--accent)',
    border: 'none',
    borderRadius: 'var(--radius)',
    color: '#fff',
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: '14px',
  },
  trackingList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  trackingCard: {
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    cursor: 'pointer',
    gap: '12px',
  },
  cardHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  statusDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  orderId: {
    fontSize: '14px',
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  productName: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    marginTop: '2px',
  },
  cardHeaderRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: 'var(--text-muted)',
  },
  statusBadge: {
    padding: '3px 10px',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '11px',
    fontWeight: 600,
  },
  otpBadge: {
    padding: '4px 12px',
    borderRadius: '6px',
    background: 'var(--warning)',
    color: '#000',
    fontSize: '13px',
    fontWeight: 700,
    letterSpacing: '1px',
  },
  cardBody: {
    padding: '0 20px 20px',
    borderTop: '1px solid var(--border)',
  },
  detailGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    padding: '16px 0',
  },
  detailRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  detailLabel: {
    fontSize: '11px',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    fontWeight: 600,
    letterSpacing: '0.5px',
  },
  detailValue: {
    fontSize: '13px',
    color: 'var(--text-primary)',
  },
  highlightValue: {
    fontSize: '18px',
    fontWeight: 700,
    color: 'var(--warning)',
    letterSpacing: '2px',
  },
  cardActions: {
    display: 'flex',
    gap: '8px',
    paddingTop: '12px',
    borderTop: '1px solid var(--border)',
  },
  trackBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 12px',
    background: 'var(--accent)',
    border: 'none',
    borderRadius: 'var(--radius)',
    color: '#fff',
    fontSize: '12px',
    cursor: 'pointer',
    textDecoration: 'none',
    fontWeight: 600,
  },
  cancelBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 12px',
    background: 'none',
    border: '1px solid var(--danger)',
    borderRadius: 'var(--radius)',
    color: 'var(--danger)',
    fontSize: '12px',
    cursor: 'pointer',
    fontWeight: 600,
  },
};
