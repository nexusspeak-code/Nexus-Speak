// Vercel Serverless Function: /api/rewrite
export default async function handler(req, res) {
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
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {}
    }

    const text = body?.text?.trim() || '';
    const tone = body?.tone || 'professional';
    const customInstruction = body?.custom_instruction || '';

    if (!text) {
      return res.status(200).json({ rewritten_text: '' });
    }

    const isTamil = /[\u0B80-\u0BFF]/.test(text);

    let rewritten = text;
    switch (tone) {
      case 'grammar':
        rewritten = text
          .replace(/\s+/g, ' ')
          .replace(/^[a-z]/, (c) => c.toUpperCase())
          .replace(/([.?!])\s*([a-z])/g, (_, p, c) => `${p} ${c.toUpperCase()}`)
          .concat(text.endsWith('.') || text.endsWith('!') || text.endsWith('?') ? '' : '.');
        break;

      case 'professional':
        rewritten = isTamil
          ? `மதிப்பிற்குரிய குழுவினரே,\n\nநமது புதுப்பிப்பு குறித்து: ${text}\n\nஇதை பரிசீலித்து உங்கள் மேலான கருத்துக்களை விரைவில் பகிருமாறு கேட்டுக்கொள்கிறேன்.\n\nநன்றியுடன்,`
          : `Dear Team,\n\nRegarding our update: ${text}\n\nPlease review at your earliest convenience and let me know if any further details are required.\n\nBest regards,`;
        break;

      case 'friendly':
        rewritten = isTamil
          ? `வணக்கம் நண்பா! 😊 ஒரு சிறிய தகவல்: ${text} பார்த்துவிட்டு எப்படி இருக்குனு சொல்லுங்க! ✨`
          : `Hey there! 😊 Just wanted to share: ${text} Hope this sounds good, let me know! ✨`;
        break;

      case 'concise':
        rewritten = isTamil
          ? `செயல் குறிப்பு: ${text.replace(/^(வணக்கம்|ஹலோ)[^,]*,?\s*/i, '')}`
          : `Action Item: ${text.replace(/^(Hello|Hey|Hi|Dear|வணக்கம்|नमस्ते|నமస్కారం|നമസ്കാരം)[^,]*,?\s*/i, '')}`;
        break;

      case 'formal':
        rewritten = isTamil
          ? `வணக்கம்,\n\nதயவுசெய்து பின்வரும் தகவலை கவனத்தில் கொள்ளவும்: ${text}\n\nதங்களின் உடனடி நடவடிக்கைக்கும் ஏற்புக்கும் நன்றி.\n\nஇங்ஙனம்,`
          : `To Whom It May Concern,\n\nKindly note the following matter: ${text}\n\nYour prompt attention and acknowledgment would be greatly appreciated.\n\nSincerely,`;
        break;

      case 'custom':
        rewritten = `[${customInstruction || 'Refined tone'}]\n${text}`;
        break;

      default:
        rewritten = text;
    }

    return res.status(200).json({ rewritten_text: rewritten, tone });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

