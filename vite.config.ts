import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import type { Plugin } from 'vite'

function speechAndTranslationApiPlugin(): Plugin {
  return {
    name: 'speech-translation-api',
    configureServer(server) {
      // 1. Translation Proxy Endpoint
      server.middlewares.use('/api/translate', async (req, res) => {
        try {
          const url = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
          const text = url.searchParams.get('q') || '';
          const sl = (url.searchParams.get('sl') || 'auto').split('-')[0];
          const tl = (url.searchParams.get('tl') || 'en').split('-')[0];

          if (!text.trim()) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ translatedText: '' }));
            return;
          }

          let normalizedText = text;
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
            for (const [colloquial, formal] of replacements) {
              normalizedText = normalizedText.split(colloquial).join(formal);
            }
          }

          const targetUrl = `https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=${sl}&tl=${tl}&q=${encodeURIComponent(normalizedText)}`;
          const response = await fetch(targetUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
              'Accept': '*/*',
            },
          });

          if (!response.ok) {
            throw new Error(`Google translate responded with status: ${response.status}`);
          }

          const data = (await response.json()) as any;
          const translatedText = Array.isArray(data) && data[0]
            ? String(data[0])
            : text;

          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ translatedText, source: sl, target: tl }));
        } catch (err: any) {
          console.error('Translation proxy error:', err.message);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err.message }));
        }
      });

      // 2. Speech Audio Transcription Endpoint
      server.middlewares.use('/api/transcribe', async (req, res) => {
        try {
          const url = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
          const lang = url.searchParams.get('lang') || 'ta-IN';

          const chunks: Buffer[] = [];
          for await (const chunk of req) {
            chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
          }
          const bodyBuffer = Buffer.concat(chunks);

          let pcmData = bodyBuffer;
          const riffIdx = bodyBuffer.indexOf('RIFF');
          if (riffIdx !== -1) {
            const dataIdx = bodyBuffer.indexOf('data', riffIdx);
            if (dataIdx !== -1 && dataIdx + 8 < bodyBuffer.length) {
              pcmData = bodyBuffer.subarray(dataIdx + 8);
            } else if (riffIdx + 44 < bodyBuffer.length) {
              pcmData = bodyBuffer.subarray(riffIdx + 44);
            }
          }

          const googleSpeechKey = 'AIzaSyBOti4mM-6x9WDnZIjIeyEU21OpBXqWBgw';
          const targetUrl = `https://www.google.com/speech-api/v2/recognize?client=chromium&lang=${encodeURIComponent(lang)}&key=${googleSpeechKey}`;
          
          const response = await fetch(targetUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'audio/l16; rate=16000',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            },
            body: pcmData,
          });

          const textResp = await response.text();
          let transcript = '';
          const lines = textResp.split('\n');
          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const parsed = JSON.parse(line);
              if (parsed.result && parsed.result[0] && parsed.result[0].alternative && parsed.result[0].alternative[0]) {
                transcript = parsed.result[0].alternative[0].transcript;
                if (parsed.result[0].final) break;
              }
            } catch (e) {}
          }

          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ transcript, language: lang }));
        } catch (err: any) {
          console.error('Transcription proxy error:', err.message);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err.message, transcript: '' }));
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(), speechAndTranslationApiPlugin()],
  server: {
    port: 5174,
    strictPort: true,
    host: true,
  },
})
