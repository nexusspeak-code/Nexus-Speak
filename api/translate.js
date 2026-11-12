// Vercel Serverless Function: /api/translate
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const text = req.query.q || '';
    const sl = (req.query.sl || 'auto').split('-')[0];
    const tl = (req.query.tl || 'en').split('-')[0];

    if (!text.trim()) {
      return res.status(200).json({ translatedText: '' });
    }

    const targetUrl = `https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=${sl}&tl=${tl}&q=${encodeURIComponent(text)}`;
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': '*/*',
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Translate service error' });
    }

    const data = await response.json();
    const translatedText = Array.isArray(data) && data[0] ? String(data[0]) : text;

    return res.status(200).json({ translatedText, source: sl, target: tl });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

