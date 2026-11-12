import React from 'react';
import { Loader2, X, Sparkles, Brain, Check } from 'lucide-react';
import { ProcessingMode } from '../types';

interface ProcessingOverlayProps {
  isProcessing: boolean;
  mode: ProcessingMode;
  stepMessage: string;
  sourceLang: string;
  targetLang: string;
  onCancel: () => void;
}

export const ProcessingOverlay: React.FC<ProcessingOverlayProps> = ({
  isProcessing,
  mode,
  stepMessage,
  sourceLang,
  targetLang,
  onCancel,
}) => {
  if (!isProcessing) return null;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(8, 11, 17, 0.94)',
        backdropFilter: 'blur(20px)',
        zIndex: 145,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '28px 24px 36px',
        animation: 'fadeIn 0.25s ease',
      }}
    >
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={16} style={{ color: 'var(--accent-primary)' }} />
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', letterSpacing: '0.02em' }}>
            NEXUS AI PIPELINE
          </span>
        </div>

        <button
          onClick={onCancel}
          style={{
            color: 'var(--text-muted)',
            padding: '6px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.06)',
          }}
          title="Cancel Operation"
        >
          <X size={18} />
        </button>
      </div>

      {/* Center Neural Orb & Animation */}
      <div style={{ textAlign: 'center', margin: 'auto 0' }}>
        <div
          style={{
            width: '120px',
            height: '120px',
            margin: '0 auto 24px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Outer Glowing Ring */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: '2px dashed rgba(99, 102, 241, 0.4)',
              animation: 'spin 12s linear infinite',
            }}
          />
          {/* Middle Pulse Ring */}
          <div
            style={{
              position: 'absolute',
              inset: '10px',
              borderRadius: '50%',
              border: '2px solid rgba(236, 72, 153, 0.3)',
              animation: 'pulse-ring 2.5s infinite',
            }}
          />
          {/* Center Orb */}
          <div
            style={{
              width: '74px',
              height: '74px',
              borderRadius: '50%',
              background: 'var(--grad-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 0 40px rgba(99, 102, 241, 0.7)',
              animation: 'floatOrb 2s ease-in-out infinite',
            }}
          >
            <Brain size={34} />
          </div>
        </div>

        {/* Step Message */}
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>
          {stepMessage || 'Processing Audio...'}
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '300px', margin: '0 auto' }}>
          {mode === 'transcribe' && `Recognizing speech patterns in ${sourceLang}...`}
          {mode === 'translate' && `Synthesizing ${sourceLang} speech and translating into ${targetLang}...`}
          {mode === 'rewrite' && `Applying contextual grammar and writing refinement...`}
        </p>

        {/* Mini Step Badges */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: '20px',
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-subtle)',
            fontSize: '11px',
            color: 'var(--text-muted)',
          }}
        >
          <Loader2 size={12} style={{ animation: 'spin 1.5s linear infinite', color: 'var(--accent-primary)' }} />
          <span>Volatile In-Memory Execution • Zero Data Leakage</span>
        </div>
      </div>

      {/* Cancel button */}
      <div style={{ textAlign: 'center' }}>
        <button
          onClick={onCancel}
          style={{
            padding: '10px 24px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
            fontSize: '13px',
            fontWeight: 600,
          }}
        >
          Cancel Processing
        </button>
      </div>
    </div>
  );
};
