with open('src/pages/Dashboard.jsx', 'r') as f:
    content = f.read()

old_welcome_start = content.find('      {/* ── Hero Greeting ── */}')
old_welcome_end = content.find('      {/* ── Event Tiles ── */}')

# If Event Tiles is not there (because it was swapped), let's find Mode Cards
if old_welcome_end == -1 or old_welcome_end > old_welcome_start + 4000:
    old_welcome_end = content.find('      {/* ── Mode Cards ── */}')

if old_welcome_start != -1 and old_welcome_end != -1:
    old_welcome = content[old_welcome_start:old_welcome_end]
    
    # We want to replace the whole welcome-card div.
    new_welcome = """      {/* ── Hero Greeting ── */}
      <div className="welcome-card animate-fade-in" style={{
        position: 'relative', overflow: 'hidden',
        borderRadius: 24, padding: '2rem 2.5rem',
        background: 'linear-gradient(135deg, #FF6B00 0%, #ff983f 100%)',
        color: '#fff',
        boxShadow: '0 12px 40px rgba(255,107,0,0.4)',
      }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, left: '30%', width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', fontWeight: 900, flexShrink: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              {user.avatar
                ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                : user.name?.charAt(0).toUpperCase()
              }
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, opacity: 0.9, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.2rem' }}>
                Welcome back
              </div>
              <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 900, margin: 0, letterSpacing: '-0.02em', lineHeight: 1.1, textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                {user.name}
              </h1>
              <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)', fontWeight: 600, marginTop: '0.2rem' }}>
                @{user.username || user.studentId}
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.2)', borderRadius: 99, padding: '0.3rem 0.75rem', fontSize: '0.8rem', fontWeight: 700, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <Flame size={14} />
                  {stats.current_streak || 0} Day Streak
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(0,0,0,0.15)', borderRadius: 99, padding: '0.3rem 0.75rem', fontSize: '0.8rem', fontWeight: 700 }}>
                  <TierIcon />
                  {tier.name}
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, background: '#fff', color: '#FF6B00', padding: '0.2rem 0.6rem', borderRadius: 6, letterSpacing: '0.05em', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  {user?.subscription_plan === 'max' ? 'MAX' : user?.subscription_plan === 'pro' ? 'Professional' : 'DEMO'}
                </div>
              </div>
            </div>
          </div>

          {/* Right side: Redeem & Time */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'rgba(0,0,0,0.1)', padding: '1rem 1.5rem', borderRadius: 20, backdropFilter: 'blur(10px)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Redeem Code
              </div>
              <div style={{ position: 'relative' }}>
                {showCoupon ? (
                  <div style={{
                    fontSize: '0.8rem', fontWeight: 700,
                    color: couponStatus.error ? '#fecaca' : '#bbf7d0',
                    background: 'rgba(0,0,0,0.2)', padding: '0.4rem 0.8rem', borderRadius: 8,
                    animation: 'fadeIn 0.3s'
                  }}>
                    {couponStatus.msg}
                  </div>
                ) : (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.3rem',
                    background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: 99, padding: '0.2rem 0.3rem 0.2rem 0.75rem',
                    transition: 'all 0.2s'
                  }}>
                    <input
                      type="text"
                      placeholder="ENTER CODE"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      style={{
                        background: 'transparent', border: 'none', color: '#fff', width: '100px', fontSize: '0.75rem',
                        fontFamily: 'monospace', textTransform: 'uppercase', outline: 'none', letterSpacing: '0.05em',
                      }}
                      autoFocus
                      onBlur={() => { if (!couponCode && !couponStatus.loading) setShowCoupon(false); }}
                      onKeyDown={(e) => e.key === 'Enter' && handleRedeemCoupon()}
                    />
                    <button
                      onClick={handleRedeemCoupon}
                      disabled={couponStatus.loading || !couponCode.trim()}
                      style={{
                        background: couponCode.trim() ? '#fff' : 'rgba(255,255,255,0.2)',
                        color: couponCode.trim() ? '#FF6B00' : 'rgba(255,255,255,0.6)', border: 'none', padding: '0.3rem 0.8rem', borderRadius: 99,
                        fontSize: '0.75rem', fontWeight: 800,
                        cursor: couponStatus.loading || !couponCode.trim() ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {couponStatus.loading ? '...' : 'APPLY'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {dailyMins !== null && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', minWidth: 120, borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <span>Daily Time</span>
                  <span style={{ color: '#fff', fontWeight: 900 }}>{dailyMins}m</span>
                </div>
                <div style={{ height: 6, background: 'rgba(0,0,0,0.2)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: '#fff', width: `${Math.min((dailyMins / 60) * 100, 100)}%`, borderRadius: 99, transition: 'width 1s ease' }} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Demo Account Upgrade Banner (Senior) */}
        {(!user?.subscription_plan || user?.subscription_plan === 'free') && stats?.timeLimits && stats.timeLimits.remainingRanked <= 0 && (
          <div 
            onClick={() => setShowPremiumModal(true)}
            style={{ 
              position: 'relative', zIndex: 2, marginTop: '1.75rem', padding: '1.25rem 1.5rem', borderRadius: 20, cursor: 'pointer',
              background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem',
              backdropFilter: 'blur(10px)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ background: '#fff', color: '#FF6B00', width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                <Crown size={24} strokeWidth={2.5} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.01em' }}>Demo Account</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>Upgrade to Pro to unlock unlimited time and features!</span>
              </div>
            </div>
            <div style={{ background: '#fff', color: '#FF6B00', padding: '0.6rem 1.25rem', borderRadius: 99, fontSize: '0.85rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
              Upgrade Now <ChevronRight size={16} strokeWidth={2.5} />
            </div>
          </div>
        )}
      </div>\n\n"""

    content = content.replace(old_welcome, new_welcome)
    with open('src/pages/Dashboard.jsx', 'w') as f:
        f.write(content)
    print("Updated welcome banner.")
else:
    print("Could not find bounds")
