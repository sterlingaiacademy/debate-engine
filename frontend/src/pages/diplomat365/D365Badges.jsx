import { useState } from 'react';
import { Award, Star, Trophy, Flame, Zap, Shield, Crown, Lock } from 'lucide-react';

const ALL_D365_BADGES = [
  { id: 'first_day',     name: 'First Step',      desc: 'Complete Day 1',                   color: '#009edb',  icon: Star },
  { id: 'week_1',        name: 'Week One',         desc: 'Complete your first week (7 days)', color: '#0ea5e9', icon: Award },
  { id: 'streak_7',      name: 'Seven Days',       desc: '7-day streak',                     color: '#f97316',  icon: Flame },
  { id: 'streak_14',     name: 'Fortnight',        desc: '14-day streak',                    color: '#ef4444',  icon: Flame },
  { id: 'streak_30',     name: 'Monthly Flame',    desc: '30-day streak',                    color: '#D4A017',  icon: Flame },
  { id: 'month_1',       name: 'Month 1 Token',    desc: 'Complete Month 1',                 color: '#D4A017',  icon: Trophy },
  { id: 'month_3',       name: 'Quarter Done',     desc: 'Reach Month 3',                   color: '#a855f7',  icon: Trophy },
  { id: 'month_6',       name: 'Half Journey',     desc: 'Reach Month 6',                   color: '#8b5cf6',  icon: Trophy },
  { id: 'perfect_week',  name: 'Perfect Week',     desc: '5 stars every day in a week',     color: '#10b981',  icon: Star },
  { id: 'level_3_done',  name: 'UN Ready',         desc: 'Complete Level 3',                color: '#3b82f6',  icon: Shield },
  { id: 'level_5_done',  name: 'Diplomat',         desc: 'Complete Level 5',                color: '#D4A017',  icon: Crown },
  { id: 'vienna_eligible','name': 'Vienna Bound',  desc: 'Score in top 30 of your age band', color: '#D4A017', icon: Crown },
];

export default function D365Badges({ user, progress }) {
  const earnedIds = new Set(progress?.badges || []);
  const earned = ALL_D365_BADGES.filter(b => earnedIds.has(b.id));
  const locked  = ALL_D365_BADGES.filter(b => !earnedIds.has(b.id));

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem' }}>
      <div>
        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#D4A017', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.2rem' }}>
          Diplomat 365
        </div>
        <h1 style={{ fontSize: 'clamp(1.2rem, 3vw, 1.5rem)', fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>
          Badges & Tokens
        </h1>
        <p style={{ color: '#475569', fontSize: '0.85rem', marginTop: '0.3rem' }}>
          {earned.length} of {ALL_D365_BADGES.length} badges earned
        </p>
      </div>

      {/* Tokens summary */}
      <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(212,160,23,0.12)', border: '1px solid rgba(212,160,23,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Zap size={24} color="#D4A017" strokeWidth={2} />
        </div>
        <div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#D4A017' }}>{progress?.tokens || 0}</div>
          <div style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 600 }}>Diplomat Tokens · Earned from monthly streaks</div>
        </div>
      </div>

      {/* Earned */}
      {earned.length > 0 && (
        <div>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 800, margin: '0 0 0.75rem', color: 'var(--text-primary)' }}>Earned Badges</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem' }}>
            {earned.map(badge => {
              const Icon = badge.icon;
              return (
                <div key={badge.id} className="badge-slot earned" title={badge.desc} style={{ animation: 'badgeUnlock 0.5s cubic-bezier(0.16,1,0.3,1) both' }}>
                  <div className="badge-icon-wrap" style={{ background: `${badge.color}15`, border: `1.5px solid ${badge.color}35` }}>
                    <Icon size={24} color={badge.color} strokeWidth={2} />
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#e2e8f0', textAlign: 'center', lineHeight: 1.3 }}>{badge.name}</span>
                  <span style={{ fontSize: '0.62rem', color: '#475569', textAlign: 'center', lineHeight: 1.3 }}>{badge.desc}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Locked */}
      {locked.length > 0 && (
        <div>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 800, margin: '0 0 0.75rem', color: '#334155' }}>Locked Badges</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem' }}>
            {locked.map(badge => {
              const Icon = badge.icon;
              return (
                <div key={badge.id} className="badge-slot locked" title={badge.desc}>
                  <div className="badge-icon-wrap" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <Icon size={24} color="#334155" strokeWidth={2} />
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#334155', textAlign: 'center', lineHeight: 1.3 }}>{badge.name}</span>
                  <span style={{ fontSize: '0.62rem', color: '#1e293b', textAlign: 'center', lineHeight: 1.3 }}>{badge.desc}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
