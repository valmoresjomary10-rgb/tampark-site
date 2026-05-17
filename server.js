if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const cors    = require('cors');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

async function sendEmail(to, subject, html) {
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': process.env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: { name: 'Talibon Memorial Park', email: process.env.SENDER_EMAIL },
      to: [{ email: to }],
      subject: subject,
      htmlContent: html,
    })
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(err);
  }
}

app.post('/submit-inquiry', async (req, res) => {
  const { fullName, email, phone, service, message } = req.body;

  const serviceNames = {
    lawn:   'Lawn Lots',
    niche:  'Garden Niche',
    estate: 'Family Estate',
    burial: 'Burial Services',
  };
  const serviceName = serviceNames[service] || service;

  if (!fullName || !email || !phone || !service || !message) {
    return res.status(400).json({ success: false, error: 'All fields are required.' });
  }

  try {
    await sendEmail(
      process.env.RECEIVING_EMAIL,
      `📋 New Inquiry from ${fullName}`,
      `
        <div style="font-family:Georgia,serif;max-width:620px;margin:0 auto;">
          <div style="background:#3a4a3a;padding:20px;text-align:center;">
            <h2 style="color:#c9a84c;margin:0;">TALIBON MEMORIAL PARK</h2>
            <p style="color:#a0b0a0;margin:4px 0 0;">New Inquiry Received</p>
          </div>
          <div style="background:#fff;padding:30px;">
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:10px;background:#f5f0e8;font-weight:bold;">Full Name</td><td style="padding:10px;">${fullName}</td></tr>
              <tr><td style="padding:10px;background:#f5f0e8;font-weight:bold;">Email</td><td style="padding:10px;">${email}</td></tr>
              <tr><td style="padding:10px;background:#f5f0e8;font-weight:bold;">Phone</td><td style="padding:10px;">${phone}</td></tr>
              <tr><td style="padding:10px;background:#f5f0e8;font-weight:bold;">Service</td><td style="padding:10px;">${serviceName}</td></tr>
              <tr><td style="padding:10px;background:#f5f0e8;font-weight:bold;vertical-align:top;">Message</td><td style="padding:10px;">${message}</td></tr>
            </table>
            <p style="font-size:12px;color:#999;margin-top:20px;">Submitted: ${new Date().toLocaleString('en-PH', { timeZone: 'Asia/Manila' })}</p>
          </div>
        </div>
      `
    );

    await sendEmail(
      email,
      `Thank you for your inquiry, ${fullName}!`,
      `
        <div style="font-family:Georgia,serif;max-width:620px;margin:0 auto;">
          <div style="background:#3a4a3a;padding:20px;text-align:center;">
            <h2 style="color:#c9a84c;margin:0;">TALIBON MEMORIAL PARK</h2>
            <p style="color:#a0b0a0;margin:4px 0 0;">Est. in Talibon, Bohol</p>
          </div>
          <div style="background:#fff;padding:30px;">
            <p>Dear <strong>${fullName}</strong>,</p>
            <p>We have received your inquiry and our team will reach out to you shortly.</p>
            <div style="background:#f5f0e8;border-left:4px solid #c9a84c;padding:16px;margin:20px 0;">
              <p style="margin:0;"><strong>Service Interest:</strong> ${serviceName}</p>
              <p style="margin:8px 0 0;"><strong>Your Message:</strong> ${message}</p>
            </div>
            <p>📞 +63 (912) 345-6789<br>📍 Talibon, Bohol, Philippines 6325<br>🕐 Mon–Sat: 8:00 AM – 5:00 PM</p>
          </div>
        </div>
      `
    );

    res.json({ success: true });

  } catch (error) {
    console.error('❌ Email error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to send email.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running → http://localhost:${PORT}`);
});