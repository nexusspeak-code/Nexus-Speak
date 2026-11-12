import React, { useState, useEffect } from 'react';
import { Mic, Square, Pause, Play, X, AlertCircle } from 'lucide-react';

interface RecordingOverlayProps {
  isRecording: boolean;
  isPaused: boolean;
  frequencyData: Uint8Array | null;
  interimTranscript: string;
  sourceLang: string;
  onPauseToggle: () => void;
  onStop: () => void;
  onCancel: () => void;
}

export const RecordingOverlay: React.FC<RecordingOverlayProps> = ({
  isRecording,
  isPaused,
  frequencyData,
  interimTranscript,
  sourceLang,
  onPauseToggle,
  onStop,
  onCancel,
}) => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let timer: any = null;
    if (isRecording && !isPaused) {
      timer = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRecording, isPaused]);

  if (!isRecording) return null;

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, '0');
    const secs = (totalSeconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  // Generate 24 animated waveform bars based on frequency data or organic animation
  const barsCount = 24;
  const barHeights = Array.from({ length: barsCount }, (_, idx) => {
    if (isPaused) return 4;
    if (frequencyData && frequencyData.length > 0) {
      // Map index into frequency buffer
      const sampleIdx = Math.floor((idx / barsCount) * (frequencyData.length / 2));
      const val = frequencyData[sampleIdx] || 0;
      return Math.max(6, Math.min(52, Math.round((val / 255) * 52)));
    }
    // Fallback pulsating sine wave
    return 10 + Math.sin(idx * 0.4 + seconds * 3) * 8;
  });

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(8, 11, 17, 0.94)',
        backdropFilter: 'blur(20px)',
        zIndex: 140,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '28px 24px 36px',
        animation: 'fadeIn 0.25s ease',
      }}
    >
      {/* Top Status Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: isPaused ? 'var(--accent-amber)' : 'var(--accent-rose)',
              boxShadow: `0 0 10px ${isPaused ? 'var(--accent-amber)' : 'var(--accent-rose)'}`,
              animation: isPaused ? 'none' : 'pulse-ring 1.5s infinite',
            }}
          />
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', letterSpacing: '0.02em' }}>
            {isPaused ? 'RECORDING PAUSED' : 'LISTENING TO SPEECH'}
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
          title="Cancel Recording"
        >
          <X size={18} />
        </button>
      </div>

      {/* Center Waveform & Timer */}
      <div style={{ textAlign: 'center', margin: 'auto 0' }}>
        {/* Large Elapsed Timer */}
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '52px',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            color: '#ffffff',
            textShadow: '0 0 25px rgba(255, 255, 255, 0.2)',
            marginBottom: '16px',
          }}
        >
          {formatTime(seconds)}
        </div>

        {/* Dynamic Frequency Waveform */}
        <div className="waveform-bars">
          {barHeights.map((h, i) => (
            <div
              key={i}
              className="wave-bar"
              style={{
                height: `${h}px`,
                background: isPaused
                  ? 'var(--text-muted)'
                  : i % 2 === 0
                  ? 'linear-gradient(180deg, #6366f1, #8b5cf6)'
                  : 'linear-gradient(180deg, #ec4899, #f43f5e)',
                transition: 'height 0.08s ease',
              }}
            />
          ))}
        </div>

        {/* Interim Speech Transcript Display */}
        <div
          style={{
            marginTop: '20px',
            minHeight: '60px',
            maxHeight: '120px',
            overflowY: 'auto',
            padding: '12px 16px',
            background: 'rgba(255, 255, 255, 0.04)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            fontSize: '14px',
            color: interimTranscript ? 'var(--text-primary)' : 'var(--text-muted)',
            fontStyle: interimTranscript ? 'normal' : 'italic',
            textAlign: 'center',
          }}
        >
          {interimTranscript || 'Speak naturally into your device microphone...'}
        </div>

        <div style={{ marginTop: '12px', fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <span>Active Language: <strong>{sourceLang}</strong></span>
          <span>•</span>
          <span style={{ color: frequencyData && frequencyData.some((v) => v > 18) ? 'var(--accent-emerald)' : 'var(--text-muted)', fontWeight: 600 }}>
            {frequencyData && frequencyData.some((v) => v > 18) ? '● Voice Audio Detected' : 'Listening...'}
          </span>
        </div>
      </div>

      {/* Bottom Control Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px' }}>
        {/* Cancel */}
        <button
          onClick={onCancel}
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.06)',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid var(--border-subtle)',
          }}
          title="Discard Audio"
        >
          <X size={20} />
        </button>

        {/* Stop & Submit (Primary) */}
        <button
          onClick={onStop}
          style={{
            width: '74px',
            height: '74px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #ef4444 0%, #f43f5e 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 35px rgba(239, 68, 68, 0.6)',
            border: '3px solid rgba(255, 255, 255, 0.2)',
          }}
          title="Stop and Process Audio"
        >
          <Square size={26} fill="#ffffff" />
        </button>

        {/* Pause / Resume */}
        <button
          onClick={onPauseToggle}
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.06)',
            color: isPaused ? 'var(--accent-emerald)' : 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid var(--border-subtle)',
          }}
          title={isPaused ? 'Resume Recording' : 'Pause Recording'}
        >
          {isPaused ? <Play size={20} /> : <Pause size={20} />}
        </button>
      </div>
    </div>
  );
};
