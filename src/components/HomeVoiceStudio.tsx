import React, { useState } from 'react';
import {
  Mic,
  ArrowRightLeft,
  Sparkles,
  Languages,
  ChevronDown,
  Volume2,
  Clock,
  ChevronRight,
  ShieldAlert,
  PlayCircle
} from 'lucide-react';
import {
  ProcessingMode,
  SUPPORTED_LANGUAGES,
  SubscriptionState,
  TranscriptionRecord,
  LanguageOption,
} from '../types';
import { SAMPLE_SPEECH_DATA, SampleSpeechPrompt } from '../services/aiLanguageService';

interface HomeVoiceStudioProps {
  currentMode: ProcessingMode;
  onChangeMode: (mode: ProcessingMode) => void;
  sourceLang: string;
  onChangeSourceLang: (lang: string) => void;
  targetLang: string;
  onChangeTargetLang: (lang: string) => void;
  onStartRecording: () => void;
  onSimulateSpeechSample: (sample: SampleSpeechPrompt) => void;
  onDirectTextInput: (text: string) => void;
  subscription: SubscriptionState;
  recentRecords: TranscriptionRecord[];
  onSelectRecord: (record: TranscriptionRecord) => void;
  onOpenSubscription: () => void;
}

export const HomeVoiceStudio: React.FC<HomeVoiceStudioProps> = ({
  currentMode,
  onChangeMode,
  sourceLang,
  onChangeSourceLang,
  targetLang,
  onChangeTargetLang,
  onStartRecording,
  onSimulateSpeechSample,
  onDirectTextInput,
  subscription,
  recentRecords,
  onSelectRecord,
  onOpenSubscription,
}) => {
  const [showLangModal, setShowLangModal] = useState<'source' | 'target' | null>(null);
  const [typedText, setTypedText] = useState('');

  const currentSource = SUPPORTED_LANGUAGES.find((l) => l.code === sourceLang) || SUPPORTED_LANGUAGES[0];
  const currentTarget = SUPPORTED_LANGUAGES.find((l) => l.code === targetLang) || SUPPORTED_LANGUAGES[1];

  const handleSwapLanguages = () => {
    const temp = sourceLang;
    onChangeSourceLang(targetLang);
    onChangeTargetLang(temp);
  };

  return (
    <div style={{ padding: '16px 20px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Mode Pill Bar */}
      <div className="mode-pill-bar">
        <button
          className={`mode-pill ${currentMode === 'transcribe' ? 'active' : ''}`}
          onClick={() => onChangeMode('transcribe')}
        >
          <Mic size={14} />
          <span>Transcribe</span>
        </button>

        <button
          className={`mode-pill ${currentMode === 'translate' ? 'active' : ''}`}
          onClick={() => onChangeMode('translate')}
        >
          <Languages size={14} />
          <span>Translate</span>
        </button>

        <button
          className={`mode-pill ${currentMode === 'rewrite' ? 'active' : ''}`}
          onClick={() => onChangeMode('rewrite')}
        >
          <Sparkles size={14} />
          <span>Rewrite</span>
        </button>
      </div>

      {/* Language Pickers Card */}
      <div className="nexus-card" style={{ padding: '12px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          {/* Source Lang Picker */}
          <button
            onClick={() => setShowLangModal('source')}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)',
              textAlign: 'left',
            }}
          >
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>SPEAK IN</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
              <span style={{ fontSize: '16px' }}>{currentSource.flag}</span>
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {currentSource.name}
              </span>
              <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              {currentSource.nativeName}
            </span>
          </button>

          {/* Swap or Arrow */}
          {currentMode !== 'transcribe' ? (
            <button
              onClick={handleSwapLanguages}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(99, 102, 241, 0.12)',
                color: 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                flexShrink: 0,
              }}
              title="Swap Languages"
            >
              <ArrowRightLeft size={15} />
            </button>
          ) : (
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.04)',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Mic size={15} />
            </div>
          )}

          {/* Target Lang Picker (Disabled in pure Transcribe mode) */}
          <button
            onClick={() => currentMode !== 'transcribe' && setShowLangModal('target')}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              background: currentMode === 'transcribe' ? 'rgba(0,0,0,0.2)' : 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)',
              textAlign: 'left',
              opacity: currentMode === 'transcribe' ? 0.6 : 1,
              cursor: currentMode === 'transcribe' ? 'not-allowed' : 'pointer',
            }}
          >
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
              {currentMode === 'transcribe' ? 'OUTPUT' : 'OUTPUT AS'}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
              <span style={{ fontSize: '16px' }}>
                {currentMode === 'transcribe' ? currentSource.flag : currentTarget.flag}
              </span>
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {currentMode === 'transcribe' ? currentSource.name : currentTarget.name}
              </span>
              {currentMode !== 'transcribe' && <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />}
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              {currentMode === 'transcribe' ? 'Original Lang' : currentTarget.nativeName}
            </span>
          </button>
        </div>
      </div>

      {/* Main Studio Mic Hero */}
      <div style={{ textAlign: 'center', margin: '10px 0 6px' }}>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
          {currentMode === 'transcribe' && `Tap mic and speak in ${currentSource.name}`}
          {currentMode === 'translate' && `Speak ${currentSource.name} → Output in ${currentTarget.name}`}
          {currentMode === 'rewrite' && `Speak your thoughts → AI will polish & format`}
        </p>

        {/* Pulsing Mic Circle */}
        <div className="mic-outer-ring">
          <div className="mic-pulse-wave" />
          <div className="mic-pulse-wave" />
          <button
            className="mic-button"
            onClick={onStartRecording}
            aria-label="Tap to record voice"
          >
            <Mic size={38} />
          </button>
        </div>

        <span
          style={{
            display: 'inline-block',
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--text-muted)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          Tap to Record
        </span>

        {/* Direct Text Input Option */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (typedText.trim()) {
              onDirectTextInput(typedText.trim());
              setTypedText('');
            }
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: '16px',
            background: 'var(--bg-surface-elevated)',
            borderRadius: 'var(--radius-full)',
            padding: '4px 6px 4px 14px',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <input
            type="text"
            placeholder={`Or type in ${currentSource.name} to translate...`}
            value={typedText}
            onChange={(e) => setTypedText(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              fontSize: '13px',
              color: 'var(--text-primary)',
            }}
          />
          <button
            type="submit"
            disabled={!typedText.trim()}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              background: typedText.trim() ? 'var(--grad-primary)' : 'rgba(255, 255, 255, 0.08)',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: typedText.trim() ? 'pointer' : 'not-allowed',
            }}
          >
            <span>{currentMode === 'translate' ? 'Translate' : 'Process'}</span>
          </button>
        </form>
      </div>

      {/* Quota Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(99, 102, 241, 0.08)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          fontSize: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={15} style={{ color: 'var(--accent-primary)' }} />
          <span>
            {subscription.plan === 'premium' ? (
              <strong style={{ color: 'var(--accent-emerald)' }}>Premium Active • Unlimited Access</strong>
            ) : subscription.plan === 'pro' ? (
              <strong style={{ color: '#c084fc' }}>Pro Active • {subscription.unitsRemaining} of {subscription.totalUnits} credits left</strong>
            ) : (
              <>
                <strong>{subscription.unitsRemaining} of {subscription.totalUnits}</strong> free credits left
              </>
            )}
          </span>
        </div>
        {subscription.plan !== 'premium' && (
          <button
            onClick={onOpenSubscription}
            style={{
              color: 'var(--accent-primary)',
              fontWeight: 700,
              fontSize: '11px',
              textDecoration: 'underline',
            }}
          >
            Upgrade
          </button>
        )}
      </div>

      {/* Quick Test Audio Chips (One-tap Demonstration) */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Quick Spoken Demos (One-Tap Test)
          </span>
          <span style={{ fontSize: '11px', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '3px' }}>
            <PlayCircle size={12} /> Instant
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {SAMPLE_SPEECH_DATA.map((sample) => (
            <button
              key={sample.id}
              onClick={() => onSimulateSpeechSample(sample)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'rgba(99, 102, 241, 0.12)',
                    color: 'var(--accent-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Volume2 size={14} />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {sample.title}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {sample.language} • {sample.description}
                  </div>
                </div>
              </div>
              <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity Mini List (If history has items) */}
      {recentRecords.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Recent Transcriptions
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recentRecords.slice(0, 2).map((rec) => (
              <div
                key={rec.id}
                onClick={() => onSelectRecord(rec)}
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {rec.title}
                  </span>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                    {new Date(rec.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {rec.output || rec.transcript}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Language Selection Modal */}
      {showLangModal && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 150,
            display: 'flex',
            alignItems: 'flex-end',
          }}
          onClick={() => setShowLangModal(null)}
        >
          <div
            style={{
              width: '100%',
              background: 'var(--bg-surface-elevated)',
              borderTopLeftRadius: 'var(--radius-xl)',
              borderTopRightRadius: 'var(--radius-xl)',
              padding: '20px',
              border: '1px solid var(--border-subtle)',
              animation: 'fadeIn 0.2s ease',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px' }}>
                Select {showLangModal === 'source' ? 'Spoken Language' : 'Output Language'}
              </h3>
              <button
                onClick={() => setShowLangModal(null)}
                style={{ fontSize: '13px', color: 'var(--accent-primary)', fontWeight: 600 }}
              >
                Done
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {SUPPORTED_LANGUAGES.map((lang) => {
                const isSelected =
                  showLangModal === 'source' ? sourceLang === lang.code : targetLang === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => {
                      if (showLangModal === 'source') onChangeSourceLang(lang.code);
                      else onChangeTargetLang(lang.code);
                      setShowLangModal(null);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                      border: `1px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '20px' }}>{lang.flag}</span>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {lang.name}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {lang.nativeName} ({lang.code})
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <span style={{ fontSize: '12px', color: 'var(--accent-primary)', fontWeight: 700 }}>
                        Active
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
