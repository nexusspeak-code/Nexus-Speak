// Vercel Serverless Function: /api/transcribe
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const lang = req.query.lang || 'ta-IN';
    const googleSpeechKey = 'AIzaSyBOti4mM-6x9WDnZIjIeyEU21OpBXqWBgw';

    // Collect request body
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    const bodyBuffer = Buffer.concat(chunks);

    // Extract PCM data if WAV header is present
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

    return res.status(200).json({ transcript, language: lang });
  } catch (err) {
    return res.status(500).json({ error: err.message, transcript: '' });
  }
}

