import React, { useState, useEffect } from 'react';
import {
  ActiveScreen,
  ProcessingMode,
  WritingTone,
  TranscriptionRecord,
  UserPreferences,
  SubscriptionState,
  UserProfile,
} from './types';
import {
  loadPreferences,
  savePreferences,
  loadHistory,
  saveHistory,
  addHistoryRecord,
  deleteHistoryRecord,
  clearAllHistory,
  loadSubscription,
  saveSubscription,
  loadUser,
  saveUser,
  DEFAULT_USER,
} from './services/storageService';
import { speechAudioEngine } from './services/speechService';
import { translateText, rewriteTextTone, SampleSpeechPrompt } from './services/aiLanguageService';

import { HeaderIsland } from './components/HeaderIsland';
import { BottomNav } from './components/BottomNav';
import { OnboardingModal } from './components/OnboardingModal';
import { HomeVoiceStudio } from './components/HomeVoiceStudio';
import { RecordingOverlay } from './components/RecordingOverlay';
import { ProcessingOverlay } from './components/ProcessingOverlay';
import { ResultEditor } from './components/ResultEditor';
import { HistoryScreen } from './components/HistoryScreen';
import { SubscriptionScreen } from './components/SubscriptionScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { KeyboardCompanionModal } from './components/KeyboardCompanionModal';
import { ShareModal } from './components/ShareModal';

export const App: React.FC = () => {
  // Persistence States
  const [preferences, setPreferences] = useState<UserPreferences>(loadPreferences);
  const [subscription, setSubscription] = useState<SubscriptionState>(loadSubscription);
  const [user, setUser] = useState<UserProfile>(loadUser);
  const [historyRecords, setHistoryRecords] = useState<TranscriptionRecord[]>(loadHistory);

  // Navigation & Shell States
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('studio');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    return !localStorage.getItem('nexus_speak_onboarded_v1');
  });
  const [shareText, setShareText] = useState<string | null>(null);

  // Active Studio States
  const [currentMode, setCurrentMode] = useState<ProcessingMode>('translate');
  const [sourceLang, setSourceLang] = useState<string>(preferences.sourceLanguage || 'ta-IN');
  const [targetLang, setTargetLang] = useState<string>(preferences.targetLanguage || 'en-IN');
  const [currentRecord, setCurrentRecord] = useState<TranscriptionRecord | null>(null);

  // Recording & Processing States
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [frequencyData, setFrequencyData] = useState<Uint8Array | null>(null);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [stepMessage, setStepMessage] = useState('');
  const [isApplyingTone, setIsApplyingTone] = useState(false);

  // Sync theme to root DOM
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', preferences.theme);
  }, [preferences.theme]);

  // Handle Preferences updates
  const handleUpdatePreferences = (newPrefs: UserPreferences) => {
    setPreferences(newPrefs);
    savePreferences(newPrefs);
  };

  // Quota & Subscription updater
  const handleUpgradeSubscription = (plan: 'free' | 'pro' | 'premium', period: 'monthly' | 'yearly') => {
    let units = 50;
    if (plan === 'pro') {
      units = 500;
    } else if (plan === 'premium') {
      units = 9999;
    }

    const updated: SubscriptionState = {
      ...subscription,
      plan,
      billingPeriod: period,
      unitsRemaining: units,
      totalUnits: units,
    };
    setSubscription(updated);
    saveSubscription(updated);
  };

  // Recording controls
  const handleStartRecording = async () => {
    // Quota check
    if ((subscription.plan === 'free' || subscription.plan === 'pro') && subscription.unitsRemaining <= 0) {
      alert(`You have reached your daily limit of ${subscription.totalUnits} credits. Please upgrade your plan for additional transcription.`);
      setActiveScreen('subscription');
      return;
    }

    setInterimTranscript('');
    setIsRecording(true);
    setIsPaused(false);

    const started = await speechAudioEngine.startRecording(
      sourceLang,
      (text) => {
        setInterimTranscript(text);
      },
      (freq) => {
        setFrequencyData(new Uint8Array(freq));
      },
      (errorMsg) => {
        setIsRecording(false);
        alert(errorMsg);
      }
    );

    if (!started) {
      setIsRecording(false);
    }
  };

  const handlePauseToggle = () => {
    if (isPaused) {
      speechAudioEngine.resumeRecording(sourceLang);
      setIsPaused(false);
    } else {
      speechAudioEngine.pauseRecording();
      setIsPaused(true);
    }
  };

  const handleCancelRecording = () => {
    speechAudioEngine.cancelRecording();
    setIsRecording(false);
    setIsPaused(false);
    setInterimTranscript('');
  };

  const handleStopRecordingAndProcess = async () => {
    setIsRecording(false);
    setIsPaused(false);

    // Allow native Android speech recognizer a brief window to finalize speech results
    await new Promise((r) => setTimeout(r, 350));

    // 1. Capture live speech text before stopping audio engine
    const liveText = speechAudioEngine.livePreviewText.trim() || interimTranscript.trim();

    // 2. Stop and get real recorded WAV audio from microphone
    const audioBlob = speechAudioEngine.stopAndGetAudioBlob();

    setIsProcessing(true);
    setStepMessage('Transcribing speech...');

    let recognizedText = liveText;

    // 3. If live browser speech recognition didn't get text (or in Android WebView),
    // transcribe the recorded audio via backend
    if (!recognizedText && audioBlob && audioBlob.size > 800) {
      setStepMessage('Transcribing audio from microphone...');
      const result = await speechAudioEngine.transcribeAudioWithBackend(audioBlob, sourceLang);
      if (result.transcript && result.transcript.trim()) {
        recognizedText = result.transcript.trim();
      }
    }

    if (!recognizedText) {
      setIsProcessing(false);
      alert('No speech was detected in your recording. Please speak clearly into your microphone or use the direct input box below.');
      return;
    }

    await processAudioResult(recognizedText, 4);
  };

  // Simulate Instant Speech Sample Test
  const handleSimulateSpeechSample = async (sample: SampleSpeechPrompt) => {
    setSourceLang(sample.langCode);
    await processAudioResult(sample.speechText, 5);
  };

  // Core Processing Pipeline
  const processAudioResult = async (spokenText: string, durationSecs: number) => {
    setIsProcessing(true);
    setStepMessage('Transcribing speech...');

    // Deduct 1 credit if free or pro
    if (subscription.plan === 'free' || subscription.plan === 'pro') {
      const updatedSub = {
        ...subscription,
        unitsRemaining: Math.max(0, subscription.unitsRemaining - 1),
      };
      setSubscription(updatedSub);
      saveSubscription(updatedSub);
    }

    try {
      let finalOutput = spokenText;

      if (currentMode === 'translate') {
        setStepMessage(`Translating from ${sourceLang} to ${targetLang}...`);
        finalOutput = await translateText(spokenText, sourceLang, targetLang);
      } else if (currentMode === 'rewrite') {
        setStepMessage(`Polishing grammar and tone...`);
        finalOutput = await rewriteTextTone(spokenText, preferences.defaultTone);
      } else {
        await new Promise((r) => setTimeout(r, 650));
      }

      const newRecord: TranscriptionRecord = {
        id: 'rec_' + Date.now(),
        userId: user.id,
        mode: currentMode,
        sourceLanguage: sourceLang,
        targetLanguage: currentMode !== 'transcribe' ? targetLang : undefined,
        transcript: spokenText,
        output: finalOutput,
        tone: currentMode === 'rewrite' ? preferences.defaultTone : undefined,
        audioSeconds: durationSecs,
        createdAt: new Date().toISOString(),
        isFavourite: false,
        title: finalOutput.slice(0, 36) + (finalOutput.length > 36 ? '...' : ''),
      };

      setCurrentRecord(newRecord);

      // Save to history if history is enabled
      if (preferences.historyEnabled) {
        const updatedHistory = addHistoryRecord(newRecord, true);
        setHistoryRecords(updatedHistory);
      }
    } catch (err) {
      alert('An error occurred during speech synthesis. Please retry.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Result Editor Tone application
  const handleApplyTone = async (tone: WritingTone, customPrompt?: string) => {
    if (!currentRecord) return;
    setIsApplyingTone(true);
    try {
      const baseText = currentRecord.output || currentRecord.transcript;
      const rewritten = await rewriteTextTone(baseText, tone, customPrompt);
      const updated = {
        ...currentRecord,
        output: rewritten,
        tone,
      };
      setCurrentRecord(updated);

      if (preferences.historyEnabled) {
        const updatedList = historyRecords.map((r) => (r.id === updated.id ? updated : r));
        setHistoryRecords(updatedList);
        saveHistory(updatedList);
      }
    } finally {
      setIsApplyingTone(false);
    }
  };

  // Result Editor Text change
  const handleUpdateCurrentText = (newText: string) => {
    if (!currentRecord) return;
    const updated = {
      ...currentRecord,
      output: newText,
    };
    setCurrentRecord(updated);
    if (preferences.historyEnabled) {
      const updatedList = historyRecords.map((r) => (r.id === updated.id ? updated : r));
      setHistoryRecords(updatedList);
      saveHistory(updatedList);
    }
  };

  // Explicit Save button in Result Editor
  const handleSaveCurrentRecord = () => {
    if (!currentRecord) return;
    const exists = historyRecords.some((r) => r.id === currentRecord.id);
    if (!exists) {
      const updated = [currentRecord, ...historyRecords];
      setHistoryRecords(updated);
      saveHistory(updated);
    }
  };

  // Account Deletion
  const handleDeleteAccount = () => {
    clearAllHistory();
    setHistoryRecords([]);
    const freshUser: UserProfile = {
      id: 'usr_guest_' + Math.random().toString(36).substring(2, 9),
      email: 'guest@nexusspeak.ai',
      name: 'Nexus Guest',
      isGuest: true,
    };
    setUser(freshUser);
    saveUser(freshUser);
    localStorage.removeItem('nexus_speak_onboarded_v1');
    setShowOnboarding(true);
    alert('Account and history records have been permanently purged.');
  };

  return (
    <div className="app-container">
      {/* Atmosphere Orbs */}
      <div className="bg-glow-orb-1" />
      <div className="bg-glow-orb-2" />

      {/* Main Shell Chassis */}
      <div className={`shell-wrapper ${isExpanded ? 'expanded-mode' : ''}`}>
        {/* Top Notch & Status Bar */}
        <HeaderIsland
          theme={preferences.theme}
          onToggleTheme={() =>
            handleUpdatePreferences({
              ...preferences,
              theme: preferences.theme === 'dark' ? 'light' : 'dark',
            })
          }
          isExpanded={isExpanded}
          onToggleExpanded={() => setIsExpanded(!isExpanded)}
          user={user}
          subscription={subscription}
          onOpenSubscription={() => setActiveScreen('subscription')}
          currentMode={currentMode}
        />

        {/* Scrollable Screen Content */}
        <main className="screen-scroll-container">
          {activeScreen === 'studio' && (
            <>
              {currentRecord ? (
                <ResultEditor
                  currentRecord={currentRecord}
                  onUpdateText={handleUpdateCurrentText}
                  onApplyTone={handleApplyTone}
                  onSaveRecord={handleSaveCurrentRecord}
                  onShare={(txt) => setShareText(txt)}
                  onReset={() => setCurrentRecord(null)}
                  historyEnabled={preferences.historyEnabled}
                  isApplyingTone={isApplyingTone}
                />
              ) : (
                <HomeVoiceStudio
                  currentMode={currentMode}
                  onChangeMode={setCurrentMode}
                  sourceLang={sourceLang}
                  onChangeSourceLang={setSourceLang}
                  targetLang={targetLang}
                  onChangeTargetLang={setTargetLang}
                  onStartRecording={handleStartRecording}
                  onSimulateSpeechSample={handleSimulateSpeechSample}
                  onDirectTextInput={(txt) => processAudioResult(txt, 2)}
                  subscription={subscription}
                  recentRecords={historyRecords}
                  onSelectRecord={(rec) => setCurrentRecord(rec)}
                  onOpenSubscription={() => setActiveScreen('subscription')}
                />
              )}
            </>
          )}

          {activeScreen === 'history' && (
            <HistoryScreen
              records={historyRecords}
              historyEnabled={preferences.historyEnabled}
              onSelectRecord={(rec) => {
                setCurrentRecord(rec);
                setActiveScreen('studio');
              }}
              onToggleFavourite={(id) => {
                const updated = historyRecords.map((r) =>
                  r.id === id ? { ...r, isFavourite: !r.isFavourite } : r
                );
                setHistoryRecords(updated);
                saveHistory(updated);
              }}
              onDeleteRecord={(id) => {
                const updated = deleteHistoryRecord(id);
                setHistoryRecords(updated);
              }}
              onClearAll={() => {
                clearAllHistory();
                setHistoryRecords([]);
              }}
              onNavigateStudio={() => setActiveScreen('studio')}
            />
          )}

          {activeScreen === 'subscription' && (
            <SubscriptionScreen
              subscription={subscription}
              onUpgradePlan={handleUpgradeSubscription}
              onRestorePurchases={() => {
                handleUpgradeSubscription('premium', 'yearly');
              }}
            />
          )}

          {activeScreen === 'keyboard-demo' && <KeyboardCompanionModal />}

          {activeScreen === 'settings' && (
            <SettingsScreen
              preferences={preferences}
              onUpdatePreferences={handleUpdatePreferences}
              user={user}
              onOpenPrivacyModal={() => setShowOnboarding(true)}
              onDeleteAccount={handleDeleteAccount}
            />
          )}
        </main>

        {/* Bottom Nav Tabs */}
        <BottomNav
          activeScreen={activeScreen}
          onSelectScreen={(screen) => {
            setActiveScreen(screen);
          }}
          historyCount={historyRecords.length}
        />

        {/* Recording Screen Overlay */}
        <RecordingOverlay
          isRecording={isRecording}
          isPaused={isPaused}
          frequencyData={frequencyData}
          interimTranscript={interimTranscript}
          sourceLang={sourceLang}
          onPauseToggle={handlePauseToggle}
          onStop={handleStopRecordingAndProcess}
          onCancel={handleCancelRecording}
        />

        {/* Processing Neural Overlay */}
        <ProcessingOverlay
          isProcessing={isProcessing}
          mode={currentMode}
          stepMessage={stepMessage}
          sourceLang={sourceLang}
          targetLang={targetLang}
          onCancel={() => setIsProcessing(false)}
        />

        {/* Welcome Onboarding Modal */}
        <OnboardingModal
          isOpen={showOnboarding}
          onClose={() => {
            setShowOnboarding(false);
            localStorage.setItem('nexus_speak_onboarded_v1', 'true');
          }}
          onCompleteGuest={() => {
            setShowOnboarding(false);
            localStorage.setItem('nexus_speak_onboarded_v1', 'true');
          }}
          onSignInUser={(email, name) => {
            const updated: UserProfile = {
              id: 'usr_' + Date.now(),
              email,
              name,
              isGuest: false,
            };
            setUser(updated);
            saveUser(updated);
            setShowOnboarding(false);
            localStorage.setItem('nexus_speak_onboarded_v1', 'true');
          }}
        />

        {/* Share Modal */}
        {shareText && (
          <ShareModal
            isOpen={!!shareText}
            onClose={() => setShareText(null)}
            textToShare={shareText}
          />
        )}
      </div>
    </div>
  );
};

export default App;
