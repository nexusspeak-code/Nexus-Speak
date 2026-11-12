import React from 'react';
import { Mic, Clock, Sparkles, Sliders, Keyboard } from 'lucide-react';
import { ActiveScreen } from '../types';

interface BottomNavProps {
  activeScreen: ActiveScreen;
  onSelectScreen: (screen: ActiveScreen) => void;
  historyCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeScreen,
  onSelectScreen,
  historyCount,
}) => {
  return (
    <nav className="bottom-nav">
      <button
        className={`nav-tab-btn ${activeScreen === 'studio' ? 'active' : ''}`}
        onClick={() => onSelectScreen('studio')}
      >
        <Mic size={19} />
        <span>Studio</span>
      </button>

      <button
        className={`nav-tab-btn ${activeScreen === 'history' ? 'active' : ''}`}
        onClick={() => onSelectScreen('history')}
      >
        <Clock size={19} />
        <span>History</span>
        {historyCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '4px',
              right: '8px',
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: 'var(--accent-primary)',
            }}
          />
        )}
      </button>

      <button
        className={`nav-tab-btn ${activeScreen === 'keyboard-demo' ? 'active' : ''}`}
        onClick={() => onSelectScreen('keyboard-demo')}
      >
        <Keyboard size={19} />
        <span>Keyboard</span>
      </button>

      <button
        className={`nav-tab-btn ${activeScreen === 'subscription' ? 'active' : ''}`}
        onClick={() => onSelectScreen('subscription')}
      >
        <Sparkles size={19} />
        <span>Upgrade</span>
      </button>

      <button
        className={`nav-tab-btn ${activeScreen === 'settings' ? 'active' : ''}`}
        onClick={() => onSelectScreen('settings')}
      >
        <Sliders size={19} />
        <span>Settings</span>
      </button>
    </nav>
  );
};
