// ============================================================
// email-reminder.js — Netlify Function
// Sends deadline reminder emails via Resend (free tier: 100/day)
// Setup: add RESEND_API_KEY to Netlify environment variables
// Get free key at: resend.com
// ============================================================

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  const { email, scholarshipTitle, deadline, applyUrl } = JSON.parse(event.body || '{}');
  if (!email || !scholarshipTitle) return { statusCode: 400, body: 'Email and scholarship required' };

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) return { statusCode: 500, body: 'Email service not configured' };

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'ScholarFind <reminders@scholarfind.org>',
        to: [email],
        subject: `⏰ Reminder: ${scholarshipTitle} deadline is coming up`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0d1b2a;">Scholarship Deadline Reminder</h2>
            <p>This is a reminder that the <strong>${scholarshipTitle}</strong> scholarship deadline is approaching.</p>
            <p><strong>Deadline:</strong> ${deadline}</p>
            <a href="${applyUrl}" style="display:inline-block;background:#1a9e8f;color:white;padding:0.75rem 1.5rem;border-radius:50px;text-decoration:none;font-weight:600;margin-top:1rem;">Apply Now →</a>
            <p style="margin-top:2rem;font-size:0.8rem;color:#94a3b8;">You're receiving this because you signed up for reminders on ScholarFind. <a href="#">Unsubscribe</a></p>
          </div>
        `
      })
    });

    if (!response.ok) throw new Error('Email send failed');

    return { statusCode: 200, body: JSON.stringify({ sent: true }) };
  } catch(e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
