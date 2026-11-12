import React, { useState } from 'react';
import { Mic, Globe, Wand2, Shield, ArrowRight, X, CheckCircle2 } from 'lucide-react';
import { UserProfile } from '../types';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleteGuest: () => void;
  onSignInUser: (email: string, name: string) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onCompleteGuest,
  onSignInUser,
}) => {
  const [isSignInView, setIsSignInView] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(8, 11, 17, 0.95)',
        backdropFilter: 'blur(24px)',
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '24px 20px',
        animation: 'fadeIn 0.25s ease',
        overflowY: 'auto',
      }}
    >
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--grad-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
            }}
          >
            <Mic size={18} />
          </div>
          <span style={{ fontWeight: 800, fontSize: '18px', letterSpacing: '-0.02em' }}>Nexus Speak</span>
        </div>
        <button
          onClick={onClose}
          style={{
            color: 'var(--text-muted)',
            padding: '6px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.05)',
          }}
        >
          <X size={18} />
        </button>
      </div>

      {!showPrivacyPolicy ? (
        !isSignInView ? (
          <>
            {/* Hero Section */}
            <div style={{ textAlign: 'center', margin: '24px 0 16px' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(99, 102, 241, 0.12)',
                  border: '1px solid rgba(99, 102, 241, 0.25)',
                  color: 'var(--accent-primary)',
                  fontSize: '12px',
                  fontWeight: 600,
                  marginBottom: '14px',
                }}
              >
                <span>✨ Multilingual AI Voice Engine</span>
              </div>
              <h1 style={{ fontSize: '28px', lineHeight: 1.2, marginBottom: '10px' }}>
                Speak naturally.<br />
                <span
                  style={{
                    background: 'var(--grad-primary)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Write effortlessly.
                </span>
              </h1>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '320px', margin: '0 auto' }}>
                Convert spoken Tamil, Hindi, Telugu, Malayalam & English into polished emails, messages, and professional drafts.
              </p>
            </div>

            {/* Feature Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: '16px 0' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'rgba(99, 102, 241, 0.15)',
                    color: 'var(--accent-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Mic size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '14px', marginBottom: '2px' }}>Pure Voice-to-Text</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Accurate speech transcription preserving punctuations and regional dialects.
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'rgba(6, 182, 212, 0.15)',
                    color: 'var(--accent-cyan)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Globe size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '14px', marginBottom: '2px' }}>Instant Translation</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Speak in Tamil, Telugu, Hindi, or Malayalam — receive clean English in seconds.
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'rgba(139, 92, 246, 0.15)',
                    color: 'var(--accent-violet)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Wand2 size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '14px', marginBottom: '2px' }}>AI Tone Rewriting</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Switch effortlessly between Professional, Friendly, Formal, and Concise tones.
                  </p>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
              <button
                onClick={onCompleteGuest}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--grad-primary)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: 'var(--shadow-glow)',
                }}
              >
                <span>Continue as Guest</span>
                <ArrowRight size={17} />
              </button>

              <button
                onClick={() => setIsSignInView(true)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  fontSize: '14px',
                }}
              >
                Sign In / Create Account
              </button>

              <div style={{ textAlign: 'center', marginTop: '8px' }}>
                <button
                  onClick={() => setShowPrivacyPolicy(true)}
                  style={{ fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'underline' }}
                >
                  Privacy Policy & Data Rights
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Sign In View */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', margin: 'auto 0' }}>
            <div>
              <h2 style={{ fontSize: '22px', marginBottom: '6px' }}>Sign in to Nexus Speak</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Sync your saved transcripts across devices and preserve your speech library.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Revanth Moses"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '14px',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '14px',
                  }}
                />
              </div>
            </div>

            <button
              onClick={() => {
                onSignInUser(email || 'user@nexusspeak.ai', name || 'Nexus User');
                onClose();
              }}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--grad-primary)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '15px',
                marginTop: '10px',
              }}
            >
              Sign In with Email
            </button>

            <button
              onClick={() => setIsSignInView(false)}
              style={{
                fontSize: '13px',
                color: 'var(--text-muted)',
                textAlign: 'center',
                padding: '8px',
              }}
            >
              Back to Overview
            </button>
          </div>
        )
      ) : (
        /* Privacy Policy View */
        <div style={{ margin: 'auto 0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-emerald)' }}>
            <Shield size={20} />
            <h3 style={{ fontSize: '18px' }}>Privacy & Data Protection</h3>
          </div>
          <div
            style={{
              padding: '16px',
              background: 'var(--bg-surface-elevated)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              fontSize: '13px',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              maxHeight: '300px',
              overflowY: 'auto',
            }}
          >
            <p><strong>1. Temporary Audio Processing:</strong> Your raw voice recording is processed in volatile memory only and never saved or stored permanently on external servers without explicit consent.</p>
            <br />
            <p><strong>2. User Controlled History:</strong> You can toggle history on or off at any moment in Settings. When disabled, transcripts are never written to database tables.</p>
            <br />
            <p><strong>3. Zero Model Training:</strong> Your voice inputs and proprietary communications are not used to train public foundation models.</p>
            <br />
            <p><strong>4. Immediate Deletion:</strong> You have full rights to delete individual transcripts, wipe complete history, or request full account termination.</p>
          </div>
          <button
            onClick={() => setShowPrivacyPolicy(false)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--grad-primary)',
              color: '#ffffff',
              fontWeight: 600,
            }}
          >
            I Understand & Agree
          </button>
        </div>
      )}
    </div>
  );
};
