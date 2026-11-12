import React, { useState } from 'react';
import {
  Keyboard,
  Mic,
  Send,
  Languages,
  Sparkles,
  Check,
  Smartphone,
  Info,
  ArrowRight,
  Smile,
  Delete,
} from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../types';

interface KeyboardCompanionModalProps {
  onInsertToStudio?: (text: string) => void;
}

export const KeyboardCompanionModal: React.FC<KeyboardCompanionModalProps> = () => {
  const [platform, setPlatform] = useState<'ios' | 'android'>('ios');
  const [inputText, setInputText] = useState('Hey, wanted to confirm our meeting for tomorrow!');
  const [chatMessages, setChatMessages] = useState<string[]>([
    'Hello! Are we still on for the 4 PM product sync?',
  ]);
  const [isDictating, setIsDictating] = useState(false);
  const [kbLang, setKbLang] = useState('ta-IN');
  const [kbMode, setKbMode] = useState<'transcribe' | 'translate'>('translate');
  const [copiedNotice, setCopiedNotice] = useState(false);

  const handleSimulatedDictation = () => {
    setIsDictating(true);
    setTimeout(() => {
      setIsDictating(false);
      const textToAppend =
        kbMode === 'translate'
          ? 'Yes, meeting confirmed for 4 PM. All project reports are ready.'
          : 'வணக்கம், மாலை 4 மணிக்கு சந்திப்பு உறுதி செய்யப்பட்டது.';
      setInputText(textToAppend);
    }, 1200);
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    setChatMessages([...chatMessages, inputText]);
    setInputText('');
  };

  return (
    <div style={{ padding: '16px 20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Title */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(99, 102, 241, 0.15)',
              color: 'var(--accent-primary)',
            }}
          >
            <Keyboard size={18} />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', marginBottom: '2px' }}>Keyboard Extension Simulator</h2>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Direct dictation & translation inside WhatsApp, Gmail & other apps
            </p>
          </div>
        </div>
      </div>

      {/* Platform Switcher */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={() => setPlatform('ios')}
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: 'var(--radius-md)',
            background: platform === 'ios' ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.05)',
            color: platform === 'ios' ? '#ffffff' : 'var(--text-secondary)',
            fontSize: '12px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <Smartphone size={14} />
          <span>iOS Swift Keyboard</span>
        </button>

        <button
          onClick={() => setPlatform('android')}
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: 'var(--radius-md)',
            background: platform === 'android' ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.05)',
            color: platform === 'android' ? '#ffffff' : 'var(--text-secondary)',
            fontSize: '12px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <Smartphone size={14} />
          <span>Android Kotlin IME</span>
        </button>
      </div>

      {/* Mock Chat Interface (e.g. WhatsApp Simulation) */}
      <div
        style={{
          borderRadius: 'var(--radius-lg)',
          background: '#0b141a',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          height: '240px',
        }}
      >
        {/* Mock App Header */}
        <div
          style={{
            padding: '8px 14px',
            background: '#202c33',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: '#00a884',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 700,
            }}
          >
            W
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#e9edef' }}>WhatsApp Messenger (Target App)</div>
            <div style={{ fontSize: '10px', color: '#8696a0' }}>Online • Direct Text Insertion Active</div>
          </div>
        </div>

        {/* Chat Stream */}
        <div style={{ flex: 1, padding: '12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {chatMessages.map((msg, i) => (
            <div
              key={i}
              style={{
                maxWidth: '80%',
                alignSelf: i % 2 === 0 ? 'flex-start' : 'flex-end',
                background: i % 2 === 0 ? '#202c33' : '#005c4b',
                color: '#e9edef',
                padding: '6px 10px',
                borderRadius: '8px',
                fontSize: '12px',
                lineHeight: 1.4,
              }}
            >
              {msg}
            </div>
          ))}
        </div>

        {/* Input Field in Chat */}
        <div style={{ padding: '8px 10px', background: '#202c33', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type or dictate using Nexus..."
            style={{
              flex: 1,
              background: '#2a3942',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 12px',
              color: '#ffffff',
              fontSize: '12px',
            }}
          />
          <button
            onClick={handleSendMessage}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#00a884',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Send size={14} />
          </button>
        </div>
      </div>

      {/* Virtual Nexus Speak Keyboard Dock */}
      <div
        style={{
          borderRadius: 'var(--radius-lg)',
          background: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-glow)',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-primary)', textTransform: 'uppercase' }}>
              Nexus Speak {platform === 'ios' ? 'iOS Keyboard' : 'Android IME'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={() => setKbMode(kbMode === 'translate' ? 'transcribe' : 'translate')}
              style={{
                padding: '3px 8px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(99, 102, 241, 0.15)',
                color: 'var(--accent-primary)',
                fontSize: '10px',
                fontWeight: 700,
              }}
            >
              Mode: {kbMode === 'translate' ? 'Speak Ta → En' : 'Direct Ta'}
            </button>
          </div>
        </div>

        {/* Virtual Keyboard Keys & Special Nexus Dictation Bar */}
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {/* Quick Actions Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={handleSimulatedDictation}
              disabled={isDictating}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: 'var(--radius-md)',
                background: isDictating ? 'var(--accent-rose)' : 'var(--grad-primary)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <Mic size={15} />
              <span>{isDictating ? 'Listening to speech...' : 'Hold or Tap to Dictate (Tamil)'}</span>
            </button>
          </div>

          {/* Virtual key rows representation */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '4px' }}>
            {['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'].map((k) => (
              <span
                key={k}
                style={{
                  padding: '6px 7px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 600,
                }}
              >
                {k}
              </span>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4px' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>123</span>
            <span
              style={{
                padding: '4px 30px',
                background: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '4px',
                fontSize: '11px',
                color: 'var(--text-muted)',
              }}
            >
              space
            </span>
            <span style={{ fontSize: '10px', color: 'var(--accent-emerald)', fontWeight: 600 }}>Insert</span>
          </div>
        </div>
      </div>

      {/* Platform Specification Notes from PRD Section 12 */}
      <div
        style={{
          padding: '12px',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid var(--border-subtle)',
          fontSize: '11px',
          color: 'var(--text-muted)',
          lineHeight: 1.5,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)', marginBottom: '4px', fontWeight: 600 }}>
          <Info size={13} />
          <span>Implementation Note (PRD Section 12)</span>
        </div>
        Keyboard extensions operate in restricted sandboxes. On iOS, "Allow Full Access" is required for network calls to speech services. On Android, InputMethodService handles the keyboard lifecycle and mic stream.
      </div>
    </div>
  );
};
