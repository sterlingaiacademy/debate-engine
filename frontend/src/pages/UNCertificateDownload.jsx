import React, { useState } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { saveAs } from 'file-saver';
import { Award, Download, Mail, AlertCircle, CheckCircle2, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Assuming API_BASE is defined similarly to other components. For simplicity, we can use window.location.origin in production if not imported.
const API_BASE = import.meta.env.VITE_API_URL || '';

export default function UNCertificateDownload() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  const handleDownload = async (e) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    setError(null);
    setSuccessMsg('');
    
    try {
      // 1. Fetch certificate status from backend
      const res = await fetch(`${API_BASE}/api/quiz/certificate-status/${encodeURIComponent(email)}`);
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch certificate status');
      }
      
      const { name, type, id } = data.student;
      
      // 2. Fetch the corresponding PDF template
      const pdfUrl = type === 'appreciation' 
        ? '/certificates/appreciation_cert.pdf'
        : '/certificates/participation_cert.pdf';
        
      const templateRes = await fetch(pdfUrl);
      if (!templateRes.ok) {
        throw new Error('Failed to load certificate template');
      }
      const existingPdfBytes = await templateRes.arrayBuffer();
      
      // 3. Load PDF into pdf-lib
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
      
      // 4. Embed font and set text
      const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
      
      // The dimensions of the PDF page
      const { width, height } = firstPage.getSize();
      
      const textSize = 40;
      const textWidth = font.widthOfTextAtSize(name, textSize);
      
      // Draw the text in the center horizontally
      // Note: The Y coordinate needs to be adjusted based on the specific template design.
      // Usually, names are placed somewhere in the middle. We'll estimate it.
      // Name (Y=300, horizontally centered)
      const x = (width / 2) - (textWidth / 2);
      const y = 300; 
      
      firstPage.drawText(name, {
        x: x,
        y: y,
        size: Math.min(textSize, (width - 200) / (name.length * 0.6)), // Scale down if name is very long
        font: font,
        color: rgb(0.1, 0.1, 0.1),
      });

      // "Model UN Quiz"
      const eventText = "Model UN Quiz";
      const eventSize = 16;
      firstPage.drawText(eventText, {
        x: 400, 
        y: 269, 
        size: eventSize,
        font: font,
        color: rgb(0.1, 0.1, 0.1),
      });

      // Date "5 July 2026"
      const dateText = "5 July 2026";
      const dateSize = 16;
      firstPage.drawText(dateText, {
        x: 250, 
        y: 238, 
        size: dateSize,
        font: font,
        color: rgb(0.1, 0.1, 0.1),
      });

      // ID
      if (id) {
        const idSize = 16;
        firstPage.drawText(id, {
          x: 695, 
          y: 378, 
          size: idSize,
          font: font,
          color: rgb(0.1, 0.1, 0.1),
        });
      }
      
      // 5. Save and trigger download
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      saveAs(blob, `UN_Quiz_Certificate_${name.replace(/\\s+/g, '_')}.pdf`);
      
      setSuccessMsg('Certificate downloaded successfully!');
      setEmail('');
      
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', padding: '2rem 1rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ maxWidth: 500, width: '100%', background: '#1e293b', borderRadius: 24, padding: '2.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
        
        <button 
          onClick={() => navigate('/')}
          style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', fontWeight: 600 }}
        >
          <ChevronLeft size={18} /> Back
        </button>

        <div style={{ textAlign: 'center', marginBottom: '2.5rem', marginTop: '1rem' }}>
          <div style={{ width: 80, height: 80, background: 'rgba(59,130,246,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', border: '1px solid rgba(59,130,246,0.2)' }}>
            <Award size={40} color="#3b82f6" />
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Download Certificate</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6 }}>
            The UN Quiz Contest has concluded. Enter your registered email address to download your certificate.
          </p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', padding: '1rem', borderRadius: 12, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem' }}>
            <AlertCircle size={20} style={{ flexShrink: 0 }} />
            <div style={{ lineHeight: 1.4 }}>{error}</div>
          </div>
        )}
        
        {successMsg && (
          <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981', padding: '1rem', borderRadius: 12, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem' }}>
            <CheckCircle2 size={20} style={{ flexShrink: 0 }} />
            <div style={{ lineHeight: 1.4 }}>{successMsg}</div>
          </div>
        )}

        <form onSubmit={handleDownload} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.5rem' }}>Registered Email Address</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>
                <Mail size={18} />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="student@example.com"
                style={{
                  width: '100%', padding: '0.85rem 1rem 0.85rem 2.75rem', borderRadius: 12,
                  background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s'
                }}
                onFocus={e => e.target.style.borderColor = '#3b82f6'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !email}
            style={{
              background: '#3b82f6', color: '#fff', border: 'none', padding: '1rem',
              borderRadius: 12, fontSize: '1rem', fontWeight: 700, cursor: (loading || !email) ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              transition: 'background 0.2s, transform 0.1s',
              opacity: (loading || !email) ? 0.7 : 1,
              marginTop: '0.5rem'
            }}
            onMouseDown={e => { if (!loading && email) e.currentTarget.style.transform = 'scale(0.98)' }}
            onMouseUp={e => { if (!loading && email) e.currentTarget.style.transform = 'scale(1)' }}
            onMouseLeave={e => { if (!loading && email) e.currentTarget.style.transform = 'scale(1)' }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                Generating...
              </span>
            ) : (
              <>
                Download Certificate <Download size={18} />
              </>
            )}
          </button>
        </form>

        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}
