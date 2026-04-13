import React, { useState } from 'react';
import { User, Settings as SettingsIcon, CreditCard, History, Mic, Shield } from 'lucide-react';

export default function Settings({ user }) {
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    username: user?.username || `@student_${Math.floor(Math.random() * 10000)}`,
    voicePrefs: 'Default Agent',
  });

  const isLevel4 = user?.classLevel === 'Level 4';

  const handlePayment = () => {
    // Razorpay Integration mockup
    if (window.Razorpay) {
      const options = {
        key: 'rzp_test_mock_key', // Mock key
        amount: '199900', // Mock amount
        currency: 'INR',
        name: 'G FORCE AI',
        description: 'Pro Plan Upgrade',
        handler: function(response) {
          alert('Payment Successful!');
        },
        prefill: {
          name: user?.name,
          email: 'student@example.com',
          contact: '9999999999'
        },
      };
      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } else {
      alert("Razorpay SDK not loaded yet.");
    }
  };

  const set = (field) => (e) => setFormData((p) => ({ ...p, [field]: e.target.value }));

  return (
    <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto', color: 'var(--text-primary)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
         <SettingsIcon size={28} color="var(--accent)" />
         <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>Settings</h1>
      </div>

      <div style={{ display: 'flex', gap: '2rem' }}>
        {/* Sidebar Nav */}
        <div style={{ width: '220px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'voice', label: 'Voice & Agent', icon: Mic },
            { id: 'billing', label: 'Billing', icon: CreditCard },
            { id: 'transcripts', label: 'History', icon: History }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem',
                borderRadius: '8px', border: 'none', background: activeTab === tab.id ? 'var(--accent)' : 'transparent',
                color: activeTab === tab.id ? '#fff' : 'var(--text-secondary)',
                fontWeight: 600, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s'
              }}
            >
              <tab.icon size={18} /> {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="card" style={{ flex: 1, padding: '2rem', minHeight: '400px' }}>
          
          {activeTab === 'profile' && (
            <div className="animate-fade-in">
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Public Profile</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={set('name')}
                    style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', outline: 'none' }}
                  />
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>@Username</label>
                  <div style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
                    {formData.username}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Your permanent unique identifier for Leaderboards. Cannot be changed.</span>
                </div>

                <button className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: '1rem' }}>Save Changes</button>
              </div>
            </div>
          )}

          {activeTab === 'voice' && (
            <div className="animate-fade-in">
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Voice Preferences</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Standard Debate Agent Voice</label>
                  <select 
                    value={formData.voicePrefs} 
                    onChange={set('voicePrefs')}
                    style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', outline: 'none' }}
                  >
                    <option>Default Agent</option>
                    <option>Teacher Voice (Friendly)</option>
                    <option>Professional Judge</option>
                    <option>British Accent</option>
                  </select>
                </div>

                {isLevel4 && (
                  <div style={{ background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.2)', padding: '1.25rem', borderRadius: '8px', marginTop: '1rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#eab308' }}>
                      <Shield size={16} /> Persona Configuration
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                      In Level 4 Persona Mode, the voice cannot be changed as it is locked to the selected historical figure.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Persona Voice (Locked)</label>
                      <select disabled style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-tertiary)', color: 'var(--text-muted)', outline: 'none', opacity: 0.6 }}>
                        <option>Locked to Persona</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="animate-fade-in">
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Plan & Billing</h2>
              
              <div style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)', border: '1px solid rgba(139, 92, 246, 0.2)', padding: '2rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
          )}

          {activeTab === 'transcripts' && (
            <div className="animate-fade-in">
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Transcript History</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[1, 2, 3].map((num) => (
                  <div key={num} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', padding: '1rem', borderRadius: '8px' }}>
                     <div>
                       <h4 style={{ margin: '0 0 0.25rem 0', fontWeight: 600 }}>Debate Session {num}</h4>
                       <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Attempted on April 10, 2026</span>
                     </div>
                     <button className="btn btn-secondary btn-sm" style={{ gap: '0.5rem' }}>
                        View PDF
                     </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
