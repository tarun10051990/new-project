import { useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

const steps = [
  {
    num: 1,
    title: 'Link Your Accounts',
    body: 'Before you can place orders, you need to connect JioMart accounts to the bot.',
    items: [
      'Scroll down to the <b>Connected Accounts</b> table.',
      'Click the blue <b>Add Account</b> button.',
      'You can add accounts manually by pasting the <code>cra_access_token</code> and <code>cra_refresh_token</code>, or you can upload a JSON/TXT file for bulk uploading.',
      'Once added, the bot will verify the accounts and they will show up in the table as "Active".',
    ],
  },
  {
    num: 2,
    title: 'Add a Delivery Address',
    body: 'You must save at least one delivery address so the bot knows where to ship the items.',
    items: [
      'At the top of the dashboard, click on <b>Add New Address</b> to expand the form.',
      'Fill out all the details (Name, Pincode, Address, City). Ensure the pincode is serviceable by JioMart.',
      'Click <b>Save Address to Database</b>.',
      'Once saved, select it from the <b>Target Delivery Address</b> dropdown menu.',
    ],
  },
  {
    num: 3,
    title: 'Setup Your Cart Blocks',
    body: 'A <b>Cart Block</b> represents a single order you want to place. You can chain multiple carts together.',
    items: [
      'Paste the JioMart Product URL or the Product ID into the input box and set the quantity.',
      'Optional: Enter a <b>Coupon Code</b> (like <i>JMNEW100</i>).',
      'Optional: Enter the <b>Expected Price</b>. The bot will automatically cancel the checkout if the final amount doesn\'t match this exact price.',
      'Click <b>Add Another Cart Block</b> if you want the bot to place back-to-back orders on the same account.',
    ],
  },
  {
    num: 4,
    title: 'Dispatch Operations',
    body: 'Time to start the automation!',
    items: [
      'Scroll down to your connected accounts and check the boxes next to the accounts you want to use.',
      'Adjust the <b>Multi-Run Count</b> if you want the exact sequence of Carts to loop multiple times per account.',
      'Toggle <b>Continue on Error</b> if you want the bot to ignore out-of-stock items and move to the next cart automatically.',
      'Click the massive blue <b>START BULK ORDERS</b> button.',
      'Watch the "Live Activity" column in the table to see the bot working in real-time!',
    ],
  },
];

export default function HowToUse() {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <BookOpen size={20} />
        <h1 style={styles.headerTitle}>How to Use the Bot</h1>
        <button onClick={() => navigate('/')} style={styles.closeBtn}>Close Guide</button>
      </div>

      <div style={styles.content}>
        <div style={styles.welcome}>
          <h2 style={styles.welcomeTitle}>Welcome to ELITe JioMart Automation</h2>
          <p style={styles.welcomeText}>
            This guide will walk you through the 4 simple steps to automate your bulk checkout process.
          </p>
        </div>

        {steps.map((step) => (
          <div key={step.num} style={styles.stepCard}>
            <div style={styles.stepHeader}>
              <span style={styles.stepNum}>{step.num}</span>
              <h3 style={styles.stepTitle}>{step.title}</h3>
            </div>
            <p
              style={styles.stepBody}
              dangerouslySetInnerHTML={{ __html: step.body }}
            />
            <ul style={styles.stepList}>
              {step.items.map((item, i) => (
                <li
                  key={i}
                  style={styles.stepItem}
                  dangerouslySetInnerHTML={{ __html: item }}
                />
              ))}
            </ul>
          </div>
        ))}

        <div style={styles.trackingCard}>
          <h3 style={styles.trackingTitle}>Tracking Orders & OTPs</h3>
          <p style={styles.trackingText}>
            After your orders are placed, click the <b>Open Live OTP Tracker</b> button at the top of
            the dashboard. This will open a dedicated page that syncs every 30 seconds with JioMart to
            provide you with live delivery tracking and Delivery PINs (OTPs).
          </p>
          <p style={styles.trackingText}>
            You can also click the <b>Orders</b> button next to any specific account in the table to
            view its full history and even cancel live JioMart orders.
          </p>
        </div>

        <button onClick={() => navigate('/')} style={styles.readyBtn}>
          I&apos;m Ready, Take Me Back
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: 'var(--bg-primary)' },
  header: {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '16px 24px', background: 'var(--bg-secondary)',
    borderBottom: '1px solid var(--border)',
    position: 'sticky', top: 0, zIndex: 10,
    color: 'var(--text-primary)',
  },
  headerTitle: { margin: 0, fontSize: '18px', fontWeight: 600, flex: 1 },
  closeBtn: {
    padding: '6px 16px', background: 'var(--bg-input)',
    border: '1px solid var(--border)', borderRadius: 'var(--radius)',
    color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer',
  },
  content: { maxWidth: '800px', margin: '0 auto', padding: '24px' },
  welcome: {
    textAlign: 'center', padding: '32px', marginBottom: '24px',
    background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border)',
  },
  welcomeTitle: { margin: '0 0 8px', fontSize: '22px', color: 'var(--accent)' },
  welcomeText: { color: 'var(--text-secondary)', fontSize: '14px', margin: 0 },
  stepCard: {
    background: 'var(--bg-secondary)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)', padding: '24px', marginBottom: '16px',
  },
  stepHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' },
  stepNum: {
    width: '32px', height: '32px', borderRadius: '50%',
    background: 'var(--accent)', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 700, fontSize: '14px', flexShrink: 0,
  },
  stepTitle: { margin: 0, fontSize: '18px', color: 'var(--text-primary)' },
  stepBody: { color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '12px' },
  stepList: { margin: 0, paddingLeft: '20px' },
  stepItem: { color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px', lineHeight: 1.5 },
  trackingCard: {
    background: 'var(--bg-secondary)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)', padding: '24px', marginBottom: '24px',
  },
  trackingTitle: { margin: '0 0 12px', fontSize: '18px', color: 'var(--text-primary)' },
  trackingText: { color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px' },
  readyBtn: {
    display: 'block', width: '100%', maxWidth: '300px',
    margin: '0 auto', padding: '14px',
    background: 'var(--accent)', border: 'none',
    borderRadius: 'var(--radius)', color: '#fff',
    fontSize: '15px', fontWeight: 600, cursor: 'pointer',
  },
};
