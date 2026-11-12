import { TranscriptionRecord, UserPreferences, SubscriptionState, UserProfile } from '../types';

const STORAGE_KEYS = {
  PREFS: 'nexus_speak_prefs_v1',
  HISTORY: 'nexus_speak_history_v1',
  SUBSCRIPTION: 'nexus_speak_sub_v1',
  USER: 'nexus_speak_user_v1',
};

export const DEFAULT_PREFERENCES: UserPreferences = {
  sourceLanguage: 'ta-IN',
  targetLanguage: 'en-IN',
  defaultTone: 'professional',
  historyEnabled: true,
  theme: 'dark',
  deleteAudioImmediately: true,
  notifications: true,
};

export const DEFAULT_SUBSCRIPTION: SubscriptionState = {
  plan: 'free',
  unitsRemaining: 50,
  totalUnits: 50,
  billingPeriod: 'monthly',
  resetDate: '1 Nov 2026',
};

export const DEFAULT_USER: UserProfile = {
  id: 'usr_guest_' + Math.random().toString(36).substring(2, 9),
  email: 'guest@nexusspeak.ai',
  name: 'Nexus Explorer',
  isGuest: true,
};

export function loadPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PREFS);
    return raw ? { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) } : DEFAULT_PREFERENCES;
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function savePreferences(prefs: UserPreferences): void {
  localStorage.setItem(STORAGE_KEYS.PREFS, JSON.stringify(prefs));
}

export function loadHistory(): TranscriptionRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveHistory(records: TranscriptionRecord[]): void {
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(records));
}

export function addHistoryRecord(record: TranscriptionRecord, historyEnabled: boolean): TranscriptionRecord[] {
  if (!historyEnabled) {
    return loadHistory(); // Respect privacy: do not retain if history is disabled
  }
  const current = loadHistory();
  const updated = [record, ...current];
  saveHistory(updated);
  return updated;
}

export function deleteHistoryRecord(id: string): TranscriptionRecord[] {
  const current = loadHistory();
  const filtered = current.filter((r) => r.id !== id);
  saveHistory(filtered);
  return filtered;
}

export function clearAllHistory(): void {
  localStorage.removeItem(STORAGE_KEYS.HISTORY);
}

export function loadSubscription(): SubscriptionState {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTION);
    return raw ? { ...DEFAULT_SUBSCRIPTION, ...JSON.parse(raw) } : DEFAULT_SUBSCRIPTION;
  } catch {
    return DEFAULT_SUBSCRIPTION;
  }
}

export function saveSubscription(sub: SubscriptionState): void {
  localStorage.setItem(STORAGE_KEYS.SUBSCRIPTION, JSON.stringify(sub));
}

export function loadUser(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    return raw ? { ...DEFAULT_USER, ...JSON.parse(raw) } : DEFAULT_USER;
  } catch {
    return DEFAULT_USER;
  }
}

export function saveUser(user: UserProfile): void {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
}
