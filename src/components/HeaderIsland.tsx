import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Sun, Moon, Maximize2, Minimize2, Sparkles, Mic, Download } from 'lucide-react';
import { UserProfile, SubscriptionState } from '../types';

interface HeaderIslandProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  user: UserProfile;
  subscription: SubscriptionState;
  onOpenSubscription: () => void;
  currentMode?: string;
}

export const HeaderIsland: React.FC<HeaderIslandProps> = ({
  theme,
  onToggleTheme,
  isExpanded,
  onToggleExpanded,
  subscription,
  onOpenSubscription,
}) => {
  const [timeStr, setTimeStr] = useState('09:41');
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running as standalone PWA or native APK
    const standaloneCheck = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    const isNativeApp = window.location.protocol === 'file:' || 
      window.location.hostname === 'appassets.androidplatform.net' || 
      /wv|Android.*Version\/[\d.]+/i.test(navigator.userAgent);
    setIsStandalone(Boolean(standaloneCheck) || Boolean(isNativeApp));

    // Capture PWA beforeinstallprompt
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    const updateTime = () => {
      const d = new Date();
      const hrs = d.getHours().toString().padStart(2, '0');
      const mins = d.getMinutes().toString().padStart(2, '0');
      setTimeStr(`${hrs}:${mins}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstallPrompt(null);
      }
    } else {
      alert('To install Nexus Speak on your device:\n\n1. Tap your browser menu (⋮ on Chrome, or Share on Safari)\n2. Select "Add to Home screen" or "Install App"');
    }
  };

  const isMobile = typeof window !== 'undefined' && (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 768);

  return (
    <header className="phone-island-bar" style={{ padding: isMobile ? '8px 14px' : '10px 20px', minHeight: '44px' }}>
      {/* Left Section: Time on desktop, or Branding on mobile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {!isMobile ? (
          <>
            <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)', letterSpacing: '0.02em' }}>
              {timeStr}
            </span>
            <button
              onClick={onToggleExpanded}
              title={isExpanded ? 'Switch to Phone Frame' : 'Expand to Full Width'}
              style={{
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                padding: '2px',
              }}
            >
              {isExpanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            </button>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Transparent glowing clean logo */}
            <div
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(139, 92, 246, 0.3) 100%)',
                border: '1px solid rgba(99, 102, 241, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6366F1',
                boxShadow: '0 0 12px rgba(99, 102, 241, 0.3)',
              }}
            >
              <Mic size={14} strokeWidth={2.4} />
            </div>
            <span style={{ fontWeight: 800, fontSize: '14px', letterSpacing: '-0.01em', color: '#ffffff' }}>
              Nexus Speak
            </span>
          </div>
        )}
      </div>

      {/* Center Dynamic Notch (Visible on Desktop / Tablet for phone chassis feel) */}
      {!isMobile && (
        <div className="island-notch" style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '4px 14px' }}>
          <div
            style={{
              width: '18px',
              height: '18px',
              borderRadius: '5px',
              background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 0 10px rgba(99, 102, 241, 0.45)',
              flexShrink: 0,
            }}
          >
            <Mic size={11} strokeWidth={2.6} />
          </div>
          <span
            style={{
              fontWeight: 700,
              fontSize: '12px',
              color: 'var(--text-primary)',
              letterSpacing: '0.02em',
            }}
          >
            Nexus Speak
          </span>
        </div>
      )}

      {/* Right Controls: Quota badge, Install PWA button, Theme Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* PWA Install Button (shows when not already in standalone app) */}
        {!isStandalone && (
          <button
            onClick={handleInstallClick}
            style={{
              fontSize: '10px',
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(99, 102, 241, 0.15)',
              color: 'var(--accent-primary)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
            title="Install Nexus Speak App on this device"
          >
            <Download size={11} />
            <span>Install</span>
          </button>
        )}

        {/* Subscription Quota Chip */}
        <button
          onClick={onOpenSubscription}
          style={{
            fontSize: '11px',
            padding: '2px 8px',
            borderRadius: 'var(--radius-full)',
            background:
              subscription.plan === 'premium'
                ? 'rgba(16, 185, 129, 0.15)'
                : subscription.plan === 'pro'
                ? 'rgba(168, 85, 247, 0.15)'
                : 'rgba(99, 102, 241, 0.15)',
            color:
              subscription.plan === 'premium'
                ? 'var(--accent-emerald)'
                : subscription.plan === 'pro'
                ? '#c084fc'
                : 'var(--accent-primary)',
            border: `1px solid ${
              subscription.plan === 'premium'
                ? 'rgba(16, 185, 129, 0.3)'
                : subscription.plan === 'pro'
                ? 'rgba(168, 85, 247, 0.3)'
                : 'rgba(99, 102, 241, 0.3)'
            }`,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
          }}
        >
          <Sparkles size={11} />
          {subscription.plan === 'premium'
            ? 'PREMIUM'
            : subscription.plan === 'pro'
            ? 'PRO'
            : `${subscription.unitsRemaining} Left`}
        </button>

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', padding: '2px' }}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} theme`}
        >
          {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
        </button>

        {/* Simulated status icons only on desktop chassis view */}
        {!isMobile && (
          <>
            <Wifi size={13} style={{ color: 'var(--text-muted)' }} />
            <Battery size={14} style={{ color: 'var(--text-muted)' }} />
          </>
        )}
      </div>
    </header>
  );
};
