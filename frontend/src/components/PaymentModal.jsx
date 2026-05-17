import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { CreditCard, Smartphone, X, CheckCircle, AlertCircle } from 'lucide-react';

export default function PaymentModal({ orderId, amount, onClose, onPaymentComplete }) {
  const { user } = useAuth();
  const [method, setMethod] = useState('');
  const [processing, setProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [upiId, setUpiId] = useState('');
  const [razorpayData, setRazorpayData] = useState(null);

  const handleRazorpayPayment = async () => {
    setProcessing(true);
    try {
      const { data } = await api.post('/payments/create-order', {
        orderId,
        userId: user.id,
        amount,
      });
      setRazorpayData(data);

      // Simulate Razorpay checkout
      setTimeout(async () => {
        try {
          await api.post('/payments/verify-razorpay', {
            razorpayOrderId: data.razorpayOrderId,
            razorpayPaymentId: 'pay_' + Date.now(),
          });
          setPaymentStatus('success');
          toast.success('Razorpay payment successful!');
          setTimeout(() => onPaymentComplete?.(), 1500);
        } catch {
          setPaymentStatus('failed');
          toast.error('Payment verification failed');
        } finally {
          setProcessing(false);
        }
      }, 2000);
    } catch {
      toast.error('Failed to create payment order');
      setProcessing(false);
    }
  };

  const handleUpiPayment = async () => {
    if (!upiId.trim()) {
      toast.error('Enter your UPI ID');
      return;
    }
    setProcessing(true);
    try {
      // Simulate UPI processing
      setTimeout(async () => {
        try {
          await api.post('/payments/upi', {
            orderId,
            userId: user.id,
            amount,
            upiTransactionId: 'UPI' + Date.now(),
          });
          setPaymentStatus('success');
          toast.success('UPI payment successful!');
          setTimeout(() => onPaymentComplete?.(), 1500);
        } catch {
          setPaymentStatus('failed');
          toast.error('UPI payment failed');
        } finally {
          setProcessing(false);
        }
      }, 2000);
    } catch {
      toast.error('Failed to process UPI payment');
      setProcessing(false);
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <h3 style={styles.title}>Payment</h3>
          <button onClick={onClose} style={styles.closeBtn}><X size={18} /></button>
        </div>

        <div style={styles.body}>
          <div style={styles.orderSummary}>
            <div style={styles.summaryRow}>
              <span>Order ID</span>
              <strong>#{orderId}</strong>
            </div>
            <div style={styles.summaryRow}>
              <span>Amount</span>
              <strong style={{ color: '#2ecc71', fontSize: '20px' }}>₹{amount.toFixed(2)}</strong>
            </div>
          </div>

          {paymentStatus === 'success' ? (
            <div style={styles.statusBox}>
              <CheckCircle size={48} color="#2ecc71" />
              <h3 style={{ color: '#2ecc71', margin: '12px 0 4px' }}>Payment Successful!</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                Your order #{orderId} has been paid.
              </p>
            </div>
          ) : paymentStatus === 'failed' ? (
            <div style={styles.statusBox}>
              <AlertCircle size={48} color="#e74c3c" />
              <h3 style={{ color: '#e74c3c', margin: '12px 0 4px' }}>Payment Failed</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                Please try again or choose a different payment method.
              </p>
              <button onClick={() => { setPaymentStatus(null); setMethod(''); }} style={styles.retryBtn}>
                Try Again
              </button>
            </div>
          ) : !method ? (
            <div style={styles.methods}>
              <h4 style={styles.methodsTitle}>Choose Payment Method</h4>
              <button onClick={() => setMethod('razorpay')} style={styles.methodBtn}>
                <CreditCard size={24} color="#3395FF" />
                <div>
                  <strong>Razorpay</strong>
                  <span style={styles.methodDesc}>Credit/Debit Card, Net Banking, Wallets</span>
                </div>
              </button>
              <button onClick={() => setMethod('upi')} style={styles.methodBtn}>
                <Smartphone size={24} color="#4CAF50" />
                <div>
                  <strong>UPI</strong>
                  <span style={styles.methodDesc}>Google Pay, PhonePe, Paytm, BHIM</span>
                </div>
              </button>
            </div>
          ) : method === 'razorpay' ? (
            <div style={styles.paymentForm}>
              <h4 style={styles.paymentFormTitle}>
                <CreditCard size={18} color="#3395FF" /> Razorpay Checkout
              </h4>
              <p style={styles.methodDesc}>
                You will be redirected to Razorpay's secure payment gateway.
              </p>
              {razorpayData && (
                <div style={styles.paymentInfo}>
                  <span>Razorpay Order: {razorpayData.razorpayOrderId}</span>
                </div>
              )}
              <div style={styles.formActions}>
                <button onClick={() => setMethod('')} style={styles.backBtn}>Back</button>
                <button
                  onClick={handleRazorpayPayment}
                  disabled={processing}
                  style={styles.payBtn}
                >
                  {processing ? 'Processing...' : `Pay ₹${amount.toFixed(2)}`}
                </button>
              </div>
            </div>
          ) : (
            <div style={styles.paymentForm}>
              <h4 style={styles.paymentFormTitle}>
                <Smartphone size={18} color="#4CAF50" /> UPI Payment
              </h4>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>UPI ID</label>
                <input
                  type="text"
                  placeholder="yourname@upi"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  style={styles.formInput}
                />
              </div>
              <div style={styles.formActions}>
                <button onClick={() => setMethod('')} style={styles.backBtn}>Back</button>
                <button
                  onClick={handleUpiPayment}
                  disabled={processing}
                  style={{ ...styles.payBtn, background: '#4CAF50' }}
                >
                  {processing ? 'Processing...' : `Pay ₹${amount.toFixed(2)} via UPI`}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  },
  modal: {
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '480px',
    maxHeight: '80vh', overflow: 'auto',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 20px', borderBottom: '1px solid var(--border)',
  },
  title: { fontSize: '16px', fontWeight: 600, margin: 0, color: 'var(--text-primary)' },
  closeBtn: {
    background: 'none', border: 'none', color: 'var(--text-secondary)',
    cursor: 'pointer', padding: '4px',
  },
  body: { padding: '20px' },
  orderSummary: {
    background: 'var(--bg-input)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', padding: '16px', marginBottom: '20px',
  },
  summaryRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '6px 0', fontSize: '14px', color: 'var(--text-secondary)',
  },
  methods: {},
  methodsTitle: {
    fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)',
    margin: '0 0 12px',
  },
  methodBtn: {
    display: 'flex', alignItems: 'center', gap: '16px',
    width: '100%', padding: '16px', background: 'var(--bg-input)',
    border: '1px solid var(--border)', borderRadius: 'var(--radius)',
    cursor: 'pointer', textAlign: 'left', marginBottom: '12px',
    color: 'var(--text-primary)',
  },
  methodDesc: {
    display: 'block', fontSize: '12px', color: 'var(--text-muted)',
    marginTop: '2px',
  },
  paymentForm: {},
  paymentFormTitle: {
    display: 'flex', alignItems: 'center', gap: '8px',
    fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)',
    margin: '0 0 16px',
  },
  paymentInfo: {
    fontSize: '12px', color: 'var(--text-muted)',
    padding: '8px 12px', background: 'var(--bg-input)',
    borderRadius: 'var(--radius)', marginBottom: '16px',
  },
  formGroup: { marginBottom: '16px' },
  formLabel: {
    display: 'block', fontSize: '12px', fontWeight: 600,
    color: 'var(--text-secondary)', marginBottom: '6px',
  },
  formInput: {
    width: '100%', padding: '10px 12px', background: 'var(--bg-input)',
    border: '1px solid var(--border)', borderRadius: 'var(--radius)',
    color: 'var(--text-primary)', fontSize: '14px', outline: 'none',
  },
  formActions: {
    display: 'flex', gap: '12px', marginTop: '16px',
  },
  backBtn: {
    flex: 1, padding: '12px', background: 'var(--bg-input)',
    border: '1px solid var(--border)', borderRadius: 'var(--radius)',
    color: 'var(--text-secondary)', fontSize: '14px', cursor: 'pointer',
  },
  payBtn: {
    flex: 2, padding: '12px', background: '#3395FF',
    border: 'none', borderRadius: 'var(--radius)',
    color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
  },
  retryBtn: {
    marginTop: '12px', padding: '10px 24px', background: 'var(--accent)',
    border: 'none', borderRadius: 'var(--radius)',
    color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
  },
  statusBox: {
    textAlign: 'center', padding: '24px 0',
  },
};
