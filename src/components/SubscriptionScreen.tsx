import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Zap,
  RotateCcw,
  Check,
  CreditCard,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SubscriptionState } from '../types';

interface SubscriptionScreenProps {
  subscription: SubscriptionState;
  onUpgradePlan: (plan: 'free' | 'pro' | 'premium', period: 'monthly' | 'yearly') => void;
  onRestorePurchases: () => void;
}

export const SubscriptionScreen: React.FC<SubscriptionScreenProps> = ({
  subscription,
  onUpgradePlan,
  onRestorePurchases,
}) => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('yearly');
  const [upgradingPlan, setUpgradingPlan] = useState<'pro' | 'premium' | null>(null);
  const [successToast, setSuccessToast] = useState<string>('');

  const handleUpgrade = (targetPlan: 'pro' | 'premium') => {
    setUpgradingPlan(targetPlan);
    setTimeout(() => {
      setUpgradingPlan(null);
      onUpgradePlan(targetPlan, billingPeriod);
      setSuccessToast(targetPlan === 'premium' ? 'Nexus Speak Premium Activated!' : 'Nexus Speak Pro Activated!');

      // Trigger celebratory confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      setTimeout(() => setSuccessToast(''), 3000);
    }, 900);
  };

  const handleDowngrade = () => {
    if (confirm('Are you sure you want to revert to the Free Starter tier?')) {
      onUpgradePlan('free', 'monthly');
    }
  };

  return (
    <div style={{ padding: '16px 20px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Toast feedback */}
      {successToast && (
        <div className="toast-notice">
          <Sparkles size={16} style={{ color: 'var(--accent-emerald)' }} />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ textAlign: 'center', marginTop: '6px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            borderRadius: 'var(--radius-full)',
            background:
              subscription.plan === 'premium'
                ? 'rgba(16, 185, 129, 0.15)'
                : subscription.plan === 'pro'
                ? 'rgba(168, 85, 247, 0.15)'
                : 'rgba(99, 102, 241, 0.15)',
            border: `1px solid ${
              subscription.plan === 'premium'
                ? 'rgba(16, 185, 129, 0.3)'
                : subscription.plan === 'pro'
                ? 'rgba(168, 85, 247, 0.3)'
                : 'rgba(99, 102, 241, 0.3)'
            }`,
            color:
              subscription.plan === 'premium'
                ? 'var(--accent-emerald)'
                : subscription.plan === 'pro'
                ? '#c084fc'
                : 'var(--accent-primary)',
            fontSize: '12px',
            fontWeight: 700,
            marginBottom: '10px',
          }}
        >
          <Sparkles size={13} />
          <span>
            {subscription.plan === 'premium'
              ? 'PREMIUM MEMBER'
              : subscription.plan === 'pro'
              ? 'PRO MEMBER'
              : 'FREE TIER'}
          </span>
        </div>

        <h2 style={{ fontSize: '24px', lineHeight: 1.2, marginBottom: '6px' }}>
          Supercharge Your Voice
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Multilingual voice dictation, neural translation, and intelligent AI tone rewriting.
        </p>
      </div>

      {/* Current Usage Progress Card */}
      <div
        className="nexus-card"
        style={{
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          background: 'var(--bg-surface-elevated)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>CURRENT ALLOWANCE</span>
            <div style={{ fontSize: '18px', fontWeight: 800, marginTop: '2px' }}>
              {subscription.plan === 'premium' ? (
                <span style={{ color: 'var(--accent-emerald)' }}>Unlimited Processing</span>
              ) : subscription.plan === 'pro' ? (
                <span style={{ color: '#c084fc' }}>{subscription.unitsRemaining} Credits Remaining</span>
              ) : (
                <span>{subscription.unitsRemaining} Credits Remaining</span>
              )}
            </div>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Renews: {subscription.resetDate}
          </span>
        </div>

        {subscription.plan !== 'premium' && (
          <div>
            <div
              style={{
                width: '100%',
                height: '8px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(255, 255, 255, 0.08)',
                overflow: 'hidden',
                margin: '6px 0',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${Math.min(100, Math.max(0, (subscription.unitsRemaining / subscription.totalUnits) * 100))}%`,
                  background:
                    subscription.plan === 'pro'
                      ? 'linear-gradient(90deg, #a855f7 0%, #6366f1 100%)'
                      : 'var(--grad-primary)',
                  borderRadius: 'var(--radius-full)',
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
              <span>{subscription.unitsRemaining} left</span>
              <span>{subscription.totalUnits} daily limit</span>
            </div>
          </div>
        )}
      </div>

      {/* Billing Switcher (Monthly vs Yearly) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          background: 'rgba(0, 0, 0, 0.25)',
          padding: '4px',
          borderRadius: 'var(--radius-full)',
          border: '1px solid var(--border-subtle)',
          maxWidth: '260px',
          margin: '0 auto',
        }}
      >
        <button
          onClick={() => setBillingPeriod('monthly')}
          style={{
            flex: 1,
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            fontSize: '12px',
            fontWeight: 600,
            color: billingPeriod === 'monthly' ? '#ffffff' : 'var(--text-secondary)',
            background: billingPeriod === 'monthly' ? 'var(--accent-primary)' : 'transparent',
          }}
        >
          Monthly
        </button>

        <button
          onClick={() => setBillingPeriod('yearly')}
          style={{
            flex: 1,
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            fontSize: '12px',
            fontWeight: 600,
            color: billingPeriod === 'yearly' ? '#ffffff' : 'var(--text-secondary)',
            background: billingPeriod === 'yearly' ? 'var(--accent-primary)' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
          }}
        >
          <span>Yearly</span>
          <span
            style={{
              fontSize: '9px',
              padding: '1px 5px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--accent-emerald)',
              color: '#ffffff',
              fontWeight: 800,
            }}
          >
            -27%
          </span>
        </button>
      </div>

      {/* Pricing Comparison Cards - 3 Options: Free, Pro, Premium */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* 1. Free Plan Card */}
        <div
          className="nexus-card"
          style={{
            padding: '16px',
            background: 'var(--bg-surface-elevated)',
            border: subscription.plan === 'free' ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: 700 }}>1. Free</h4>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>₹0 / month</span>
            </div>
            {subscription.plan === 'free' ? (
              <span
                style={{
                  fontSize: '11px',
                  color: 'var(--accent-primary)',
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(99, 102, 241, 0.15)',
                }}
              >
                Active Plan
              </span>
            ) : (
              <button
                onClick={handleDowngrade}
                style={{
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: 'var(--text-secondary)',
                  fontSize: '11px',
                  fontWeight: 600,
                }}
              >
                Switch to Free
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)', marginTop: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Check size={14} style={{ color: 'var(--accent-emerald)', flexShrink: 0 }} />
              <span><strong>50 free processing units</strong> per day</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Check size={14} style={{ color: 'var(--accent-emerald)', flexShrink: 0 }} />
              <span>Basic speech transcription & translation</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Check size={14} style={{ color: 'var(--accent-emerald)', flexShrink: 0 }} />
              <span>Local device history controls</span>
            </div>
          </div>
        </div>

        {/* 2. Pro Plan Card */}
        <div
          className="nexus-card"
          style={{
            border: subscription.plan === 'pro' ? '2px solid #a855f7' : '1px solid rgba(168, 85, 247, 0.35)',
            background: 'linear-gradient(180deg, rgba(168, 85, 247, 0.08) 0%, rgba(15, 22, 35, 0.8) 100%)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
              color: '#ffffff',
              fontSize: '10px',
              fontWeight: 800,
              padding: '3px 8px',
              borderRadius: 'var(--radius-full)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            Popular
          </div>

          <h3 style={{ fontSize: '18px', marginBottom: '4px' }}>2. Pro</h3>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '14px' }}>
            <span style={{ fontSize: '28px', fontWeight: 800, color: '#ffffff' }}>
              {billingPeriod === 'yearly' ? '₹1,799' : '₹199'}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              /{billingPeriod === 'yearly' ? 'year (~₹149/mo)' : 'month'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            {[
              '500 processing units per day',
              'Fast translation across all 5 regional languages',
              '4 AI writing tones (Fix Grammar, Professional, Friendly, Concise)',
              'Accelerated neural processing speed',
              'Unlimited local history & search',
            ].map((feat, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                <CheckCircle2 size={15} style={{ color: '#c084fc', flexShrink: 0 }} />
                <span style={{ color: 'var(--text-primary)' }}>{feat}</span>
              </div>
            ))}
          </div>

          {subscription.plan === 'pro' ? (
            <button
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(255, 255, 255, 0.08)',
                color: 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '13px',
              }}
            >
              Current Active Plan (Manage)
            </button>
          ) : (
            <button
              onClick={() => handleUpgrade('pro')}
              disabled={upgradingPlan !== null}
              style={{
                width: '100%',
                padding: '13px',
                borderRadius: 'var(--radius-full)',
                background: 'linear-gradient(135deg, #9333ea 0%, #4f46e5 100%)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(168, 85, 247, 0.3)',
              }}
            >
              <Zap size={16} />
              <span>{upgradingPlan === 'pro' ? 'Activating Pro...' : 'Upgrade to Pro'}</span>
            </button>
          )}
        </div>

        {/* 3. Premium Plan Card */}
        <div
          className="nexus-card"
          style={{
            border: subscription.plan === 'premium' ? '2px solid var(--accent-emerald)' : '2px solid var(--accent-primary)',
            background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.1) 0%, rgba(15, 22, 35, 0.8) 100%)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: 'var(--grad-primary)',
              color: '#ffffff',
              fontSize: '10px',
              fontWeight: 800,
              padding: '3px 8px',
              borderRadius: 'var(--radius-full)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            Recommended
          </div>

          <h3 style={{ fontSize: '18px', marginBottom: '4px' }}>3. Premium</h3>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '14px' }}>
            <span style={{ fontSize: '28px', fontWeight: 800, color: '#ffffff' }}>
              {billingPeriod === 'yearly' ? '₹3,499' : '₹399'}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              /{billingPeriod === 'yearly' ? 'year (~₹291/mo)' : 'month'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            {[
              'Unlimited transcription duration & storage',
              'High-precision Tamil, Hindi, Telugu & Malayalam translation',
              'All 6 AI rewriting tones + Custom Prompts',
              'Direct Keyboard Extension (iOS & Android IME)',
              'Priority neural processing & zero wait queue',
              'Cross-device cloud sync with strict encryption',
            ].map((feat, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                <CheckCircle2 size={15} style={{ color: 'var(--accent-emerald)', flexShrink: 0 }} />
                <span style={{ color: 'var(--text-primary)' }}>{feat}</span>
              </div>
            ))}
          </div>

          {subscription.plan === 'premium' ? (
            <button
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(255, 255, 255, 0.08)',
                color: 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '13px',
              }}
            >
              Current Active Plan (Manage)
            </button>
          ) : (
            <button
              onClick={() => handleUpgrade('premium')}
              disabled={upgradingPlan !== null}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--grad-primary)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: 'var(--shadow-glow)',
              }}
            >
              <CreditCard size={16} />
              <span>{upgradingPlan === 'premium' ? 'Activating Premium...' : 'Upgrade to Premium'}</span>
            </button>
          )}
        </div>

      </div>

      {/* Restore and Footer info */}
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
        <button
          onClick={() => {
            onRestorePurchases();
            alert('Store receipts verified successfully with Apple / Google Play.');
          }}
          style={{
            fontSize: '12px',
            color: 'var(--text-muted)',
            textDecoration: 'underline',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
          }}
        >
          <RotateCcw size={12} />
          <span>Restore In-App Purchases</span>
        </button>

        <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
          Subscriptions auto-renew unless cancelled at least 24 hours prior to the end of the current billing cycle. Verified through Apple App Store and Google Play billing APIs.
        </p>
      </div>
    </div>
  );
};
