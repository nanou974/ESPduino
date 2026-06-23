export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message invalide' });
    }

    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      console.error('GROQ_API_KEY manquante');
      return res.status(500).json({ error: 'Configuration erreur' });
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',
        messages: [
          {
            role: 'system',
            content: `Tu es l'assistant IA de l'ESP32 Academy. Tu aides les utilisateurs avec Arduino, ESP32, électronique, développement et impression 3D. Sois amical, précis et utile. Réponds en français. Garde les réponses courtes et pertinentes (max 500 caractères pour la bulle).`
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Groq Error:', errorData);
      return res.status(response.status).json({
        error: 'Erreur Groq',
        details: errorData.error?.message || 'Erreur inconnue'
      });
    }

    const data = await response.json();
    const assistantMessage = data.choices[0].message.content;

    return res.status(200).json({
      success: true,
      message: assistantMessage,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({
      error: 'Erreur serveur',
      details: error.message
    });
  }
}
