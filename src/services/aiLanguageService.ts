import { WritingTone } from '../types';

export interface SampleSpeechPrompt {
  id: string;
  language: string;
  langCode: string;
  title: string;
  speechText: string;
  description: string;
}

export const SAMPLE_SPEECH_DATA: SampleSpeechPrompt[] = [
  {
    id: 'sample-ta-1',
    language: 'Tamil',
    langCode: 'ta-IN',
    title: 'வணிக கூட்டம் (Business Meeting)',
    speechText: 'வணக்கம், நாளைய சந்திப்பு மாலை 4 மணிக்கு திட்டமிடப்பட்டுள்ளது. அனைத்து திட்ட அறிக்கைகளையும் தயார் செய்து எடுத்து வாருங்கள்.',
    description: 'Tamil business scheduling with project status update',
  },
  {
    id: 'sample-ta-2',
    language: 'Tamil',
    langCode: 'ta-IN',
    title: 'வழக்கமான உரையாடல் (Daily Chat)',
    speechText: 'வணக்கம், எப்படி இருக்கிறீர்கள்? நான் நன்றாக இருக்கிறேன்.',
    description: 'Everyday greeting and well-being inquiry in Tamil',
  },
  {
    id: 'sample-hi-1',
    language: 'Hindi',
    langCode: 'hi-IN',
    title: 'क्लाइंट फॉलो-अप (Client Follow-up)',
    speechText: 'नमस्ते सर, हमने नया प्रपोजल तैयार कर लिया है। कृपया इसे देखकर अपनी प्रतिक्रिया दें ताकि हम आगे की प्रक्रिया शुरू कर सकें।',
    description: 'Hindi client proposal delivery and follow up',
  },
  {
    id: 'sample-te-1',
    language: 'Telugu',
    langCode: 'te-IN',
    title: 'ప్రాజెక్ట్ నవీకరణ (Project Update)',
    speechText: 'నమస్కారం, మా బృందం మొదటి దశను పూర్తి చేసింది. దయచేసి వివరాలను పరిశీలించి ఆమోదం తెలపండి.',
    description: 'Telugu project phase 1 completion and sign-off',
  },
  {
    id: 'sample-ml-1',
    language: 'Malayalam',
    langCode: 'ml-IN',
    title: 'മീറ്റിംഗ് സമയം (Meeting Confirmation)',
    speechText: 'നമസ്കാരം, നാളത്തെ കോൺഫറൻസ് സമയം രാവിലെ 10 മണിക്ക് മാറ്റിവെച്ചിട്ടുണ്ട്. എല്ലാവരും കൃത്യസമയത്ത് എത്തിച്ചേരുമെന്ന് പ്രതീക്ഷിക്കുന്നു.',
    description: 'Malayalam conference timing reschedule notice',
  },
  {
    id: 'sample-en-1',
    language: 'English (IN)',
    langCode: 'en-IN',
    title: 'Quick WhatsApp / Slack Draft',
    speechText: 'Hey team, just wanted to check if the presentation deck for tomorrow morning is finalized. Let me know if you need any edits from my end.',
    description: 'Everyday workplace communication in English',
  },
];

// Normalize colloquial spoken phrases to written literary forms for higher translation accuracy
export function normalizeSpeechForTranslation(text: string, sourceLang: string): string {
  const sl = sourceLang.split('-')[0].toLowerCase();
  if (sl === 'ta') {
    const replacements: [string, string][] = [
      ['எப்படி இருக்க', 'எப்படி இருக்கிறாய்'],
      ['சாப்டியா', 'சாப்பிட்டாயா'],
      ['சாப்பிட்டியா', 'சாப்பிட்டாயா'],
      ['சாப்டீங்களா', 'சாப்பிட்டீர்களா'],
      ['சாப்பிட்டீங்களா', 'சாப்பிட்டீர்களா'],
      ['என்ன பண்ற', 'என்ன செய்கிறாய்'],
      ['என்ன பண்றீங்க', 'என்ன செய்கிறீர்கள்'],
      ['எங்க இருக்க', 'எங்கே இருக்கிறாய்'],
      ['எங்க இருக்கீங்க', 'எங்கே இருக்கிறீர்கள்'],
      ['மக்கா', 'நண்பா'],
      ['மச்சி', 'நண்பா'],
      ['வீட்டுக்கு வருவ', 'வீட்டிற்கு வருவாய்'],
      ['வீட்டுக்கு வருவீங்க', 'வீட்டிற்கு வருவீர்கள்'],
      ['நல்லா இருக்கு', 'நன்றாக இருக்கிறது'],
      ['நல்லா இருக்கேன்', 'நன்றாக இருக்கிறேன்'],
      ['சூப்பரா இருக்கு', 'அற்புதமாக இருக்கிறது'],
      ['சூப்பரா பண்றியே', 'அற்புதமாக செய்கிறாயே'],
      ['பேசுற', 'பேசுகிற'],
      ['சொல்ற', 'சொல்கிற'],
      ['பண்ற', 'செய்கிற'],
      ['பண்ணுவியா', 'செய்வாயா'],
      ['பண்றியே', 'செய்கிறாயே'],
      ['இருக்கியா', 'இருக்கிறாயா'],
      ['இருக்கேன்', 'இருக்கிறேன்'],
      ['கேக்குதா', 'கேட்கிறதா'],
      ['புரியுதா', 'புரிகிறதா'],
      ['வர்றியா', 'வருகிறாயா'],
      ['போறியா', 'போகிறாயா'],
      ['ரொம்ப தேங்க்ஸ்', 'மிக்க நன்றி'],
    ];
    let result = text;
    for (const [colloquial, formal] of replacements) {
      result = result.split(colloquial).join(formal);
    }
    return result;
  }
  return text;
}

export async function translateText(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<string> {
  let clean = text?.trim();
  if (!clean) return '';

  const sl = sourceLang.split('-')[0].toLowerCase();
  const tl = targetLang.split('-')[0].toLowerCase();

  if (sl === tl) return clean;

  clean = normalizeSpeechForTranslation(clean, sourceLang);

  // 1. Google Translate GTX Free API (Universal CORS-free, works in Android WebView, iOS, and Web)
  try {
    const gtxUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t&q=${encodeURIComponent(clean)}`;
    const res = await fetch(gtxUrl);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && Array.isArray(data[0])) {
        let translated = '';
        for (const item of data[0]) {
          if (item && item[0]) {
            translated += item[0];
          }
        }
        if (translated.trim()) {
          return translated.trim();
        }
      }
    }
  } catch (gtxErr) {
    console.warn('Google Translate GTX error, trying alternative:', gtxErr);
  }

  // 2. MyMemory Universal Translation API (Backup)
  try {
    const mmUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(clean)}&langpair=${sl}|${tl}`;
    const mmRes = await fetch(mmUrl);
    if (mmRes.ok) {
      const mmData = await mmRes.json();
      if (mmData && mmData.responseData && mmData.responseData.translatedText) {
        const result = mmData.responseData.translatedText.trim();
        // Check if MyMemory returned a valid translation rather than quota message
        if (result && !result.toLowerCase().includes('quota exceeded')) {
          return result;
        }
      }
    }
  } catch (mmErr) {
    console.warn('MyMemory translation error:', mmErr);
  }

  // 3. Try local / Vercel proxy /api/translate
  try {
    const res = await fetch(`/api/translate?sl=${sl}&tl=${tl}&q=${encodeURIComponent(clean)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.translatedText && data.translatedText.trim()) {
        return data.translatedText.trim();
      }
    }
  } catch (err) {
    console.warn('Local proxy fallback error:', err);
  }

  // 4. Direct Google Translate Chrome Extension Engine
  try {
    const gUrl = `https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=${sl}&tl=${tl}&q=${encodeURIComponent(clean)}`;
    const gRes = await fetch(gUrl);
    if (gRes.ok) {
      const gData = await gRes.json();
      if (Array.isArray(gData) && gData[0]) {
        return String(gData[0]).trim();
      }
    }
  } catch (err) {
    console.warn('Direct Google Translate error:', err);
  }

  return clean;
}

export async function rewriteTextTone(
  text: string,
  tone: WritingTone,
  customInstruction?: string
): Promise<string> {
  const clean = text.trim();
  if (!clean) return '';

  // 1. Try Go backend /api/rewrite
  try {
    const res = await fetch('http://localhost:8080/api/rewrite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: clean,
        tone: tone,
        custom_instruction: customInstruction || '',
      }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.rewritten_text && data.rewritten_text.trim()) {
        return data.rewritten_text.trim();
      }
    }
  } catch (err) {
    console.warn('Go backend /api/rewrite error, using client formatter:', err);
  }

  // Fallback local formatter
  switch (tone) {
    case 'grammar':
      return clean
        .replace(/\s+/g, ' ')
        .replace(/^[a-z]/, (c) => c.toUpperCase())
        .replace(/([.?!])\s*([a-z])/g, (_, p, c) => `${p} ${c.toUpperCase()}`)
        .concat(clean.endsWith('.') || clean.endsWith('!') || clean.endsWith('?') ? '' : '.');

    case 'professional':
      return `Dear Team,\n\nRegarding our update: ${clean}\n\nPlease review at your earliest convenience and let me know if any further details are required.\n\nBest regards,`;

    case 'friendly':
      return `Hey there! 😊 Just wanted to share: ${clean} Hope this sounds good, let me know! ✨`;

    case 'concise':
      return `Action Item: ${clean.replace(/^(Hello|Hey|Hi|Dear|வணக்கம்|नमस्ते|నమస్కారం|നമസ്കാരം)[^,]*,?\s*/i, '')}`;

    case 'formal':
      return `To Whom It May Concern,\n\nKindly note the following matter: ${clean}\n\nYour prompt attention and acknowledgment would be greatly appreciated.\n\nSincerely,`;

    case 'custom':
      const instr = customInstruction || 'Refined tone';
      return `[Tone: ${instr}]\n${clean}`;

    default:
      return clean;
  }
}
