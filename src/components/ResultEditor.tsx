import React, { useState } from 'react';
import {
  Copy,
  Share2,
  RotateCcw,
  Trash2,
  Bookmark,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight,
  Send,
  Wand2,
} from 'lucide-react';
import { TranscriptionRecord, WritingTone } from '../types';

interface ResultEditorProps {
  currentRecord: TranscriptionRecord | null;
  onUpdateText: (newText: string) => void;
  onApplyTone: (tone: WritingTone, customPrompt?: string) => void;
  onSaveRecord: () => void;
  onShare: (text: string) => void;
  onReset: () => void;
  historyEnabled: boolean;
  isApplyingTone: boolean;
}

const TONE_OPTIONS: { id: WritingTone; label: string; icon: string }[] = [
  { id: 'grammar', label: 'Fix Grammar', icon: '✍️' },
  { id: 'professional', label: 'Professional', icon: '💼' },
  { id: 'friendly', label: 'Friendly', icon: '😊' },
  { id: 'concise', label: 'Concise', icon: '⚡' },
  { id: 'formal', label: 'Formal', icon: '🏛️' },
  { id: 'custom', label: 'Custom Tone', icon: '✨' },
];

export const ResultEditor: React.FC<ResultEditorProps> = ({
  currentRecord,
  onUpdateText,
  onApplyTone,
  onSaveRecord,
  onShare,
  onReset,
  historyEnabled,
  isApplyingTone,
}) => {
  const [showOriginal, setShowOriginal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [selectedTone, setSelectedTone] = useState<WritingTone>(
    currentRecord?.tone || 'professional'
  );
  const [customPrompt, setCustomPrompt] = useState('');
  const [showCustomModal, setShowCustomModal] = useState(false);

  if (!currentRecord) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentRecord.output || currentRecord.transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    onSaveRecord();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleToneChange = (tone: WritingTone) => {
    setSelectedTone(tone);
    if (tone === 'custom') {
      setShowCustomModal(true);
    } else {
      onApplyTone(tone);
    }
  };

  return (
    <div style={{ padding: '16px 20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Header Information */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              padding: '3px 8px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(99, 102, 241, 0.15)',
              color: 'var(--accent-primary)',
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
            }}
          >
            {currentRecord.mode}
          </span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {currentRecord.sourceLanguage}
            {currentRecord.targetLanguage && ` → ${currentRecord.targetLanguage}`}
          </span>
        </div>

        <button
          onClick={onReset}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '12px',
            color: 'var(--text-muted)',
            padding: '4px 8px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(255, 255, 255, 0.04)',
          }}
          title="New Recording"
        >
          <RotateCcw size={13} />
          <span>New</span>
        </button>
      </div>

      {/* Main Editable Result Box */}
      <div
        className="nexus-card"
        style={{
          position: 'relative',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          border: '1px solid var(--border-glow)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {currentRecord.mode === 'translate' ? 'Translated Text' : 'Transcript Output'}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Editable
          </span>
        </div>

        <textarea
          value={currentRecord.output || currentRecord.transcript}
          onChange={(e) => onUpdateText(e.target.value)}
          rows={6}
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            fontSize: '15px',
            lineHeight: 1.6,
            color: 'var(--text-primary)',
            resize: 'none',
          }}
          placeholder="Transcription output appears here..."
        />

        {/* Action bar inside text card */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '12px',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleCopy}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                background: copied ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                color: copied ? 'var(--accent-emerald)' : 'var(--text-secondary)',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>

            <button
              onClick={() => onShare(currentRecord.output || currentRecord.transcript)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(255, 255, 255, 0.06)',
                color: 'var(--text-secondary)',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              <Share2 size={13} />
              <span>Share</span>
            </button>
          </div>

          {historyEnabled && (
            <button
              onClick={handleSave}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                background: saved ? 'rgba(16, 185, 129, 0.2)' : 'rgba(99, 102, 241, 0.15)',
                color: saved ? 'var(--accent-emerald)' : 'var(--accent-primary)',
                fontSize: '12px',
                fontWeight: 700,
              }}
            >
              {saved ? <Check size={13} /> : <Bookmark size={13} />}
              <span>{saved ? 'Saved!' : 'Save'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Accordion: View Original Transcript (If translated or rewritten) */}
      {currentRecord.transcript && currentRecord.transcript !== currentRecord.output && (
        <div
          style={{
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            overflow: 'hidden',
          }}
        >
          <button
            onClick={() => setShowOriginal(!showOriginal)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--text-secondary)',
            }}
          >
            <span>Original Spoken Transcript ({currentRecord.sourceLanguage})</span>
            {showOriginal ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showOriginal && (
            <div
              style={{
                padding: '12px 14px',
                background: 'rgba(0, 0, 0, 0.2)',
                fontSize: '13px',
                lineHeight: 1.5,
                color: 'var(--text-muted)',
                borderTop: '1px solid var(--border-subtle)',
              }}
            >
              {currentRecord.transcript}
            </div>
          )}
        </div>
      )}

      {/* AI Writing Assistant: Tone Selector */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Rewrite in AI Tone
          </span>
          {isApplyingTone && (
            <span style={{ fontSize: '11px', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Wand2 size={12} /> Polishing text...
            </span>
          )}
        </div>

        <div className="tone-chips-scroll">
          {TONE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              className={`tone-chip ${selectedTone === opt.id ? 'active' : ''}`}
              onClick={() => handleToneChange(opt.id)}
              disabled={isApplyingTone}
            >
              <span>{opt.icon}</span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Tone Modal Prompt */}
      {showCustomModal && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(6px)',
            zIndex: 160,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setShowCustomModal(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '380px',
              background: 'var(--bg-surface-elevated)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)',
              padding: '20px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>Custom Tone Instruction</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Provide instructions to guide the AI rewrite (e.g. "Draft as a WhatsApp message to an investor", "Make it poetic").
            </p>
            <input
              type="text"
              placeholder="e.g. Polite reminder for invoice payment"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                fontSize: '13px',
                marginBottom: '14px',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                onClick={() => setShowCustomModal(false)}
                style={{ padding: '8px 14px', borderRadius: 'var(--radius-md)', fontSize: '13px', color: 'var(--text-muted)' }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowCustomModal(false);
                  onApplyTone('custom', customPrompt);
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--grad-primary)',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 600,
                }}
              >
                Apply Rewrite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
