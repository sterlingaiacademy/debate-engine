const fs = require('fs');
const path = '../frontend/src/pages/Settings.jsx';

const content = `import React, { useState, useEffect } from 'react';
import { User, Settings as SettingsIcon, CreditCard, History, Download, Clock, X, ChevronRight } from 'lucide-react';
import jsPDF from 'jspdf';

export default function Settings({ user }) {
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    username: user?.username || '@student_' + Math.floor(Math.random() * 10000),
  });

  const [historyData, setHistoryData] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedTranscript, setSelectedTranscript] = useState(null);

  useEffect(() => {
    if (activeTab === 'transcripts' && user?.studentId) {
      setLoadingHistory(true);
      fetch('/api/history/' + user.studentId)
        .then(res => res.json())
        .then(data => {
          // Only show specific modes based on level if needed, but data is naturally filtered by what they played.
          setHistoryData(data.filter(d => {
            try {
              const t = JSON.parse(d.transcript);
              return t && t.length > 0;
            } catch(e) { return false; }
          }));
        })
        .catch(err => console.error(err))
        .finally(() => setLoadingHistory(false));
    }
  }, [activeTab, user?.studentId]);

  const downloadPDF = (session) => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('Session Transcript', 14, 22);
    
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(\'Date: \' + new Date(session.createdAt).toLocaleString(), 14, 32);
    doc.text(\'Mode: \' + session.mode, 14, 38);
    doc.text(\'Topic: \' + session.debateTopic, 14, 44);
    doc.text(\'Duration: \' + Math.floor(session.sessionDuration / 60) + 'm ' + (session.sessionDuration % 60) + 's', 14, 50);
    
    let yPos = 60;
    try {
      const transcript = typeof session.transcript === 'string' ? JSON.parse(session.transcript) : session.transcript;
      
      doc.setFontSize(11);
      transcript.forEach((msg, idx) => {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(msg.role === 'user' ? 41 : 139, 128, msg.role === 'user' ? 246 : 246);
        const roleName = msg.role === 'user' ? 'You' : 'Agent';
        doc.text(roleName + ':', 14, yPos);
        
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(50);
        
        const splitText = doc.splitTextToSize(msg.text, 170);
        doc.text(splitText, 14, yPos + 6);
        yPos += (splitText.length * 6) + 10;
        
        if (yPos > 280) {
          doc.addPage();
          yPos = 20;
        }
      });
    } catch (e) {
      doc.text('Failed to parse transcript data.', 14, yPos);
    }

    doc.save(\'Transcript_\' + session.id + '.pdf');
  };

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

  const set = (field) => (e) => setFormData((p) => ({ ...p, [field]: e.target.value }));

  return (
    <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', color: 'var(--text-primary)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
         <SettingsIcon size={28} color="var(--accent)" />
         <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>Settings & Analytics</h1>
      </div>

      <div style={{ display: 'flex', gap: '2rem' }}>
        {/* Sidebar Nav */}
        <div style={{ width: '220px', display: 'flex', flexDirection: 'column', gap: '0.5rem', flexShrink: 0 }}>
          {[
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'transcripts', label: 'Analytics & History', icon: History },
            { id: 'billing', label: 'Plan & Billing', icon: CreditCard }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSelectedTranscript(null); }}
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
        <div className="card" style={{ flex: 1, padding: '2rem', minHeight: '600px', display: 'flex', flexDirection: 'column' }}>
          
          {activeTab === 'profile' && (
            <div className="animate-fade-in">
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Public Profile</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '500px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={set('name')}
                    style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', outline: 'none' }}
                  />
                </div>
                <button className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: '1rem' }}>Save Changes</button>
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
            <div className="animate-fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Analytics & Transcript History</h2>
              
              {loadingHistory ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                   <div className="animate-spin" style={{ border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', width: 30, height: 30 }} />
                </div>
              ) : historyData.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No debate sessions recorded yet.
                </div>
              ) : selectedTranscript ? (
                <div className="animate-fade-in" style={{ display: 'flex', gap: '2rem', flex: 1 }}>
                  {/* Left: Transcript View */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                     <button onClick={() => setSelectedTranscript(null)} style={{ background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--text-secondary)', padding: 0, fontWeight: 600 }}>
                        <X size={16} /> Close Transcript
                     </button>
                     <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem', overflowY: 'auto', flex: 1, maxHeight: '500px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {(() => {
                          try {
                            const t = JSON.parse(selectedTranscript.transcript);
                            return t.map((msg, i) => (
                              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>
                                  {msg.role === 'user' ? 'You' : 'Agent'}
                                </span>
                                <div style={{
                                  background: msg.role === 'user' ? 'var(--accent)' : 'var(--bg-secondary)',
                                  color: msg.role === 'user' ? '#fff' : 'var(--text-primary)',
                                  padding: '0.75rem 1rem', borderRadius: '12px', maxWidth: '85%',
                                  lineHeight: 1.5, fontSize: '0.95rem'
                                }}>
                                  {msg.text}
                                </div>
                              </div>
                            ));
                          } catch(e) { return <div>Failed to load transcript data.</div> }
                        })()}
                     </div>
                  </div>

                  {/* Right: Metadata Panel (ElevenLabs style) */}
                  <div style={{ width: '300px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                     <div>
                       <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Metadata</h3>
                       
                       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                         <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Date</span>
                         <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{new Date(selectedTranscript.createdAt).toLocaleDateString()}</span>
                       </div>

                       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                         <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Environment</span>
                         <span style={{ fontSize: '0.75rem', fontWeight: 600, background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '0.15rem 0.5rem', borderRadius: '99px' }}>production</span>
                       </div>

                       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                         <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Mode</span>
                         <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{selectedTranscript.mode || 'Ranked Match'}</span>
                       </div>

                       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                         <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Duration</span>
                         <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{Math.floor(selectedTranscript.sessionDuration / 60)}:{(selectedTranscript.sessionDuration % 60).toString().padStart(2, '0')}</span>
                       </div>

                       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                         <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Score</span>
                         <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent)' }}>{selectedTranscript.debateScore > 0 ? selectedTranscript.debateScore + '/100' : 'N/A'}</span>
                       </div>
                     </div>

                     <button 
                       onClick={() => downloadPDF(selectedTranscript)}
                       className="btn btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                     >
                       <Download size={16} /> Download PDF Transcript
                     </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {historyData.map((session) => (
                    <div 
                      key={session.id} 
                      onClick={() => setSelectedTranscript(session)}
                      style={{ 
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                        background: 'var(--bg-tertiary)', border: '1px solid var(--border)', 
                        padding: '1rem', borderRadius: '8px', cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                    >
                       <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                           <h4 style={{ margin: 0, fontWeight: 700, fontSize: '1rem' }}>{session.mode || 'Debate Session'}</h4>
                           <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', background: 'var(--bg-secondary)', borderRadius: '99px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                             {Math.floor(session.sessionDuration / 60)}:{(session.sessionDuration % 60).toString().padStart(2, '0')}
                           </span>
                         </div>
                         <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{session.debateTopic}</span>
                         <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(session.createdAt).toLocaleString()}</span>
                       </div>
                       <div>
                          <ChevronRight size={20} color="var(--text-muted)" />
                       </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync(path, content);
console.log('Settings.jsx updated successfully.');
