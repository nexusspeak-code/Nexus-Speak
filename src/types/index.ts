export type ProcessingMode = 'transcribe' | 'translate' | 'rewrite';

export type WritingTone = 
  | 'grammar' 
  | 'professional' 
  | 'friendly' 
  | 'concise' 
  | 'formal' 
  | 'custom';

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'ta-IN', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'en-IN', name: 'English', nativeName: 'English (IN)', flag: '🌐' },
  { code: 'hi-IN', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'te-IN', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'ml-IN', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳' },
];

export interface TranscriptionRecord {
  id: string;
  userId: string;
  mode: ProcessingMode;
  sourceLanguage: string;
  targetLanguage?: string;
  transcript: string;
  output: string;
  tone?: WritingTone;
  audioSeconds: number;
  createdAt: string;
  isFavourite: boolean;
  title: string;
}

export interface UserPreferences {
  sourceLanguage: string;
  targetLanguage: string;
  defaultTone: WritingTone;
  historyEnabled: boolean;
  theme: 'dark' | 'light';
  deleteAudioImmediately: boolean;
  notifications: boolean;
}

export interface SubscriptionState {
  plan: 'free' | 'pro' | 'premium';
  unitsRemaining: number;
  totalUnits: number;
  billingPeriod: 'monthly' | 'yearly';
  resetDate: string;
  expiresAt?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  isGuest: boolean;
  avatarUrl?: string;
}

export type ActiveScreen = 'studio' | 'history' | 'subscription' | 'settings' | 'keyboard-demo';
