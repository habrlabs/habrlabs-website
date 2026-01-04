export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages array required' });
  }

  const systemPrompt = `You are the AI assistant for HABR Labs, a hardware innovation studio that builds AI-powered physical products.

ABOUT HABR LABS:
- Hardware innovation studio based in New York
- We design, prototype, and build intelligent devices
- Focus areas: Smart Hardware, Computer Vision, Rapid Prototyping
- Tagline: "AI-powered physical products"

WHAT WE DO:
- Transform ideas into working hardware prototypes
- Integrate AI and computer vision into physical products
- Rapid prototyping and iteration
- End-to-end product development from concept to production

CONTACT:
- Email: hello@habrlabs.com
- Website: habrlabs.com

YOUR BEHAVIOR:
- Be helpful, professional, and concise
- Answer questions about HABR Labs and our capabilities
- For project inquiries, encourage them to email hello@habrlabs.com with details
- If asked about pricing, explain that each project is custom and they should reach out to discuss
- Don't make up services or capabilities not mentioned above
- Keep responses brief and conversational (2-3 sentences typically)
- If you don't know something specific about HABR Labs, say so and direct them to email

Do not discuss internal projects, client names, or proprietary technology.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        system: systemPrompt,
        messages: messages
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Anthropic API error:', error);
      return res.status(500).json({ error: 'AI service error' });
    }

    const data = await response.json();
    const reply = data.content[0]?.text || 'Sorry, I could not generate a response.';

    return res.status(200).json({ reply });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
