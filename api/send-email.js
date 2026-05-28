export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: process.env.EMAILJS_SERVICE_ID || 'service_97a6zs',
        template_id: process.env.EMAILJS_TEMPLATE_ID || 'template_knpmyoi',
        user_id: process.env.EMAILJS_PUBLIC_KEY || 'ww9lc62LvSjO7o1jP',
        template_params: {
          from_name: name,
          from_email: email,
          message: message,
          to_email: 'aveekpatel@gmail.com',
        },
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text);
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Email send error:', err);
    return res.status(500).json({ error: err.message || 'Failed to send email' });
  }
}
