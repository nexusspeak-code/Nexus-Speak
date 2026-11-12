import React, { useState } from 'react';
import { Share2, Copy, Check, X, MessageSquare, Mail, Send } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  textToShare: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, textToShare }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(textToShare);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareViaWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(textToShare)}`, '_blank');
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent('Transcript from Nexus Speak');
    const body = encodeURIComponent(textToShare);
    const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;

    // Auto-copy text to clipboard so user never loses it
    try {
      navigator.clipboard.writeText(textToShare);
    } catch (e) {}

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isMobile) {
      // On Mobile devices: directly launch native Gmail / Mail app
      window.location.href = mailtoUrl;
    } else {
      // On Desktop (PC/Laptop): Chrome/Edge blocks window.open('mailto:...') popups.
      // Open Gmail web compose in a new tab (100% reliable for browser users),
      // and trigger native mailto as seamless fallback.
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`;
      const win = window.open(gmailUrl, '_blank');
      if (!win) {
        window.location.href = mailtoUrl;
      }
    }

    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Nexus Speak Output',
          text: textToShare,
        });
      } catch (e) {}
    } else {
      handleCopy();
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(8px)',
        zIndex: 180,
        display: 'flex',
        alignItems: 'flex-end',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          background: 'var(--bg-surface-elevated)',
          borderTopLeftRadius: 'var(--radius-xl)',
          borderTopRightRadius: 'var(--radius-xl)',
          padding: '24px 20px',
          border: '1px solid var(--border-subtle)',
          animation: 'fadeIn 0.2s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px' }}>Share Transcription</h3>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        {/* Text Preview Box */}
        <div
          style={{
            padding: '12px',
            background: 'rgba(0, 0, 0, 0.25)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            fontSize: '12px',
            color: 'var(--text-secondary)',
            maxHeight: '100px',
            overflowY: 'auto',
            marginBottom: '16px',
            lineHeight: 1.5,
          }}
        >
          {textToShare}
        </div>

        {/* Share Destination Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
          <button
            onClick={shareViaWhatsApp}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              padding: '12px 8px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(37, 211, 102, 0.1)',
              border: '1px solid rgba(37, 211, 102, 0.25)',
              color: '#25d366',
            }}
          >
            <MessageSquare size={20} />
            <span style={{ fontSize: '11px', fontWeight: 600 }}>WhatsApp</span>
          </button>

          <button
            onClick={shareViaEmail}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              padding: '12px 8px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              color: 'var(--accent-primary)',
            }}
          >
            <Mail size={20} />
            <span style={{ fontSize: '11px', fontWeight: 600 }}>Email</span>
          </button>

          <button
            onClick={handleNativeShare}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              padding: '12px 8px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
            }}
          >
            <Share2 size={20} />
            <span style={{ fontSize: '11px', fontWeight: 600 }}>System Share</span>
          </button>
        </div>

        <button
          onClick={handleCopy}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: 'var(--radius-full)',
            background: copied ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.08)',
            color: copied ? 'var(--accent-emerald)' : 'var(--text-primary)',
            fontWeight: 600,
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          <span>{copied ? 'Copied to Clipboard!' : 'Copy to Clipboard'}</span>
        </button>
      </div>
    </div>
  );
};
