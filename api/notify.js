export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { lead } = req.body;

  if (!lead) {
    return res.status(400).json({ error: 'No lead data' });
  }

  const timestamp = new Date().toLocaleString('en-US', { 
    month: 'short', 
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true 
  });

  const projectSnippet = lead.project 
    ? lead.project.substring(0, 30) + (lead.project.length > 30 ? '...' : '')
    : 'New Inquiry';

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
        subject: `Lead [${lead.score}/12]: ${projectSnippet} — ${timestamp}`,
        html: `
          <div style="font-family: -apple-system, sans-serif; max-width: 600px;">
            <h2 style="margin-bottom: 24px;">New Lead — Score: ${lead.score}/12</h2>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666; width: 100px;">Email</td>
                <td style="padding: 8px 0;"><strong>${lead.email || 'Not provided'}</strong></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Company</td>
                <td style="padding: 8px 0;">${lead.company || 'Not provided'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Project</td>
                <td style="padding: 8px 0;">${lead.project || 'Not provided'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Budget</td>
                <td style="padding: 8px 0;">${lead.budget || 'Not provided'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Timeline</td>
                <td style="padding: 8px 0;">${lead.timeline || 'Not provided'}</td>
              </tr>
            </table>
            
            <div style="margin-top: 24px; padding: 16px; background: #f5f5f5; border-radius: 8px;">
              <strong>Summary:</strong><br>
              ${lead.summary || 'No summary'}
            </div>
            
            <p style="margin-top: 24px;">
              <a href="mailto:${lead.email}" style="background: #0a0a0a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reply to Lead</a>
            </p>
          </div>
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
