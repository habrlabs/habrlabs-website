export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { lead } = req.body;

  if (!lead) {
    return res.status(400).json({ error: 'No lead data' });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'HABR Labs <notifications@habrlabs.com>',
        to: 'hello@habrlabs.com',
        subject: `🔥 Hot Lead: ${lead.name || 'New Inquiry'}`,
        html: `
          <h2>New Qualified Lead</h2>
          <p><strong>Name:</strong> ${lead.name || 'Not provided'}</p>
          <p><strong>Email:</strong> ${lead.email || 'Not provided'}</p>
          <p><strong>Company:</strong> ${lead.company || 'Not provided'}</p>
          <p><strong>Project:</strong> ${lead.project || 'Not provided'}</p>
          <p><strong>Budget:</strong> ${lead.budget || 'Not provided'}</p>
          <p><strong>Timeline:</strong> ${lead.timeline || 'Not provided'}</p>
          <p><strong>Score:</strong> ${lead.score}/10</p>
          <hr>
          <p><strong>Conversation Summary:</strong></p>
          <p>${lead.summary || 'No summary'}</p>
        `
      })
    });

    if (!response.ok) {
      console.error('Resend error:', await response.text());
      return res.status(500).json({ error: 'Email failed' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Notify error:', error);
    return res.status(500).json({ error: 'Internal error' });
  }
}
