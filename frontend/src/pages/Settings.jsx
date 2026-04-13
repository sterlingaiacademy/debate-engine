import React from 'react';
import { Settings as SettingsIcon, CreditCard } from 'lucide-react';

export default function Settings({ user }) {
  const handlePayment = () => {
    if (window.Razorpay) {
      const options = {
        key: 'rzp_test_mock_key',
        amount: '199900',
        currency: 'INR',
        name: 'G FORCE AI',
        description: 'Pro Plan Upgrade',
        handler: function(response) {
          alert('Payment Successful!');
        },
        prefill: { name: user?.name, email: 'student@example.com', contact: '9999999999' },
      };
      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } else {
      alert("Razorpay SDK not loaded yet.");
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', color: 'var(--text-primary)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
         <SettingsIcon size={28} color="var(--accent)" />
         <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>Settings</h1>
      </div>

      <div className="card" style={{ padding: '2rem', minHeight: '400px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Plan & Billing</h2>
        <div style={{ 
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)', 
          border: '1px solid rgba(139, 92, 246, 0.2)', 
          padding: '2rem', 
          borderRadius: '12px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', padding: '0.25rem 0.75rem', background: 'var(--bg-tertiary)', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>CURRENT PLAN</div>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.25rem 0' }}>Free Plan</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Basic debate access limits and standard voices.</p>
          </div>
          <button 
            onClick={handlePayment}
            style={{ background: 'linear-gradient(90deg, #F97316, #E8392A)', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', color: '#fff', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(249,115,22,0.3)', transition: 'transform 0.2s' }}
            onMouseEnter={e => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.target.style.transform = 'none'}
          >
            Upgrade to Pro Plan
          </button>
        </div>
      </div>
    </div>
  );
}
