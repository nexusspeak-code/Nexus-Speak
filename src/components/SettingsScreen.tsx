import React, { useState } from 'react';
import {
  Globe,
  Wand2,
  Shield,
  Moon,
  Sun,
  Bell,
  Trash2,
  LogOut,
  ChevronRight,
  User,
  Info,
  Check,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { UserPreferences, UserProfile, SUPPORTED_LANGUAGES, WritingTone } from '../types';

interface SettingsScreenProps {
  preferences: UserPreferences;
  onUpdatePreferences: (prefs: UserPreferences) => void;
  user: UserProfile;
  onOpenPrivacyModal: () => void;
  onDeleteAccount: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  preferences,
  onUpdatePreferences,
  user,
  onOpenPrivacyModal,
  onDeleteAccount,
}) => {
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [backendUrl, setBackendUrl] = useState(() => {
    return localStorage.getItem('nexus_speak_backend_url') || '';
  });

  const toggleHistory = () => {
    onUpdatePreferences({
      ...preferences,
      historyEnabled: !preferences.historyEnabled,
    });
  };

  const toggleAudioLifecycle = () => {
    onUpdatePreferences({
      ...preferences,
      deleteAudioImmediately: !preferences.deleteAudioImmediately,
    });
  };

  const toggleTheme = () => {
    onUpdatePreferences({
      ...preferences,
      theme: preferences.theme === 'dark' ? 'light' : 'dark',
    });
  };

  return (
    <div style={{ padding: '16px 20px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '20px', marginBottom: '2px' }}>Settings & Preferences</h2>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Configure speech defaults, privacy safeguards, and app appearance.
        </p>
      </div>

      {/* User Account Card */}
      <div
        className="nexus-card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'var(--grad-primary)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '16px',
            }}
          >
            {user.name.charAt(0)}
          </div>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 700 }}>{user.name}</h4>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {user.isGuest ? 'Guest Session' : user.email}
            </span>
          </div>
        </div>

        <span
          style={{
            fontSize: '11px',
            padding: '3px 8px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(255, 255, 255, 0.08)',
            color: 'var(--text-secondary)',
          }}
        >
          {user.isGuest ? 'Guest' : 'Member'}
        </span>
      </div>

      {/* Language & AI Defaults */}
      <div>
        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '8px' }}>
          Language & AI Preferences
        </span>

        <div className="nexus-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '14px' }}>
          {/* Default Spoken Language */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Globe size={16} style={{ color: 'var(--accent-primary)' }} />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>Default Spoken Language</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Primary input dialect</div>
              </div>
            </div>

            <select
              value={preferences.sourceLanguage}
              onChange={(e) => onUpdatePreferences({ ...preferences, sourceLanguage: e.target.value })}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '6px 10px',
                fontSize: '12px',
                color: 'var(--text-primary)',
              }}
            >
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code} style={{ background: '#111827', color: '#fff' }}>
                  {l.name} ({l.flag})
                </option>
              ))}
            </select>
          </div>

          {/* Default Output Language */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Globe size={16} style={{ color: 'var(--accent-cyan)' }} />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>Default Translation Output</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Target language for translation</div>
              </div>
            </div>

            <select
              value={preferences.targetLanguage}
              onChange={(e) => onUpdatePreferences({ ...preferences, targetLanguage: e.target.value })}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '6px 10px',
                fontSize: '12px',
                color: 'var(--text-primary)',
              }}
            >
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code} style={{ background: '#111827', color: '#fff' }}>
                  {l.name} ({l.flag})
                </option>
              ))}
            </select>
          </div>

          {/* Default Writing Tone */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Wand2 size={16} style={{ color: 'var(--accent-violet)' }} />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>Default Writing Tone</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Initial tone applied to speech</div>
              </div>
            </div>

            <select
              value={preferences.defaultTone}
              onChange={(e) => onUpdatePreferences({ ...preferences, defaultTone: e.target.value as WritingTone })}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '6px 10px',
                fontSize: '12px',
                color: 'var(--text-primary)',
              }}
            >
              <option value="grammar" style={{ background: '#111827', color: '#fff' }}>Fix Grammar</option>
              <option value="professional" style={{ background: '#111827', color: '#fff' }}>Professional</option>
              <option value="friendly" style={{ background: '#111827', color: '#fff' }}>Friendly</option>
              <option value="concise" style={{ background: '#111827', color: '#fff' }}>Concise</option>
              <option value="formal" style={{ background: '#111827', color: '#fff' }}>Formal</option>
            </select>
          </div>
        </div>
      </div>

      {/* Privacy & Safeguards (Section 13) */}
      <div>
        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '8px' }}>
          Privacy Controls (Strict Security)
        </span>

        <div className="nexus-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '14px' }}>
          {/* History Enabled Switch */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Shield size={16} style={{ color: 'var(--accent-emerald)' }} />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>Save Transcription History</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  When off, transcripts are discarded immediately
                </div>
              </div>
            </div>

            <button
              onClick={toggleHistory}
              style={{
                width: '44px',
                height: '24px',
                borderRadius: 'var(--radius-full)',
                background: preferences.historyEnabled ? 'var(--accent-emerald)' : 'rgba(255, 255, 255, 0.2)',
                position: 'relative',
                transition: 'background 0.2s ease',
              }}
            >
              <div
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: '#ffffff',
                  position: 'absolute',
                  top: '3px',
                  left: preferences.historyEnabled ? '23px' : '3px',
                  transition: 'left 0.2s ease',
                }}
              />
            </button>
          </div>

          {/* Delete Audio Immediately */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600 }}>Ephemeral Raw Audio</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Delete audio buffer promptly after processing
              </div>
            </div>

            <button
              onClick={toggleAudioLifecycle}
              style={{
                width: '44px',
                height: '24px',
                borderRadius: 'var(--radius-full)',
                background: preferences.deleteAudioImmediately ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.2)',
                position: 'relative',
                transition: 'background 0.2s ease',
              }}
            >
              <div
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: '#ffffff',
                  position: 'absolute',
                  top: '3px',
                  left: preferences.deleteAudioImmediately ? '23px' : '3px',
                  transition: 'left 0.2s ease',
                }}
              />
            </button>
          </div>

          {/* Privacy Policy Link */}
          <button
            onClick={onOpenPrivacyModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '8px',
              borderTop: '1px solid var(--border-subtle)',
              fontSize: '12px',
              color: 'var(--text-secondary)',
              textAlign: 'left',
            }}
          >
            <span>Read Privacy Policy & Data Retention Policy</span>
            <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>
      </div>

      {/* App Appearance */}
      <div>
        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '8px' }}>
          Appearance & System
        </span>

        <div className="nexus-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {preferences.theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>Theme Mode</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {preferences.theme === 'dark' ? 'Obsidian Dark' : 'Pearl Light'}
                </div>
              </div>
            </div>

            <button
              onClick={toggleTheme}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 255, 255, 0.08)',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--text-primary)',
              }}
            >
              Toggle {preferences.theme === 'dark' ? 'Light' : 'Dark'}
            </button>
          </div>
        </div>
      </div>

      {/* Cloud & Vercel API Sync */}
      <div>
        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '8px' }}>
          Cloud Voice Backend (Optional)
        </span>
        <div className="nexus-card" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            If running in an offline APK or external host, enter your Vercel deployment URL for serverless voice transcription:
          </div>
          <input
            type="url"
            placeholder="https://your-app.vercel.app"
            value={backendUrl}
            onChange={(e) => {
              const val = e.target.value.trim();
              setBackendUrl(val);
              localStorage.setItem('nexus_speak_backend_url', val);
            }}
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              fontSize: '13px',
              width: '100%',
              boxSizing: 'border-box',
            }}
          />
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            When deploying on Vercel, leave empty to automatically use the current domain.
          </div>
        </div>
      </div>

      {/* Danger Zone: Account Deletion */}
      <div style={{ marginTop: '8px' }}>
        {!deleteConfirm ? (
          <button
            onClick={() => setDeleteConfirm(true)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: 'var(--accent-rose)',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <Trash2 size={15} />
            <span>Delete Account & Purge Data</span>
          </button>
        ) : (
          <div
            style={{
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              textAlign: 'center',
            }}
          >
            <AlertTriangle size={24} style={{ color: 'var(--accent-rose)', margin: '0 auto 8px' }} />
            <h4 style={{ fontSize: '14px', color: '#ffffff', marginBottom: '4px' }}>Confirm Permanent Deletion?</h4>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              This will irreversibly delete your session, saved transcripts, and preferences.
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <button
                onClick={() => setDeleteConfirm(false)}
                style={{ padding: '6px 14px', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.1)', fontSize: '12px' }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setDeleteConfirm(false);
                  onDeleteAccount();
                }}
                style={{ padding: '6px 14px', borderRadius: 'var(--radius-md)', background: 'var(--accent-rose)', color: '#ffffff', fontSize: '12px', fontWeight: 700 }}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
