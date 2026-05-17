require('dotenv').config();

const express    = require('express');
const nodemailer = require('nodemailer');
const cors       = require('cors');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_LOGIN,
    pass: process.env.BREVO_SMTP_PASSWORD,
  }
});

transporter.verify((error) => {
  if (error) {
    console.log('❌ Email connection failed:', error.message);
  } else {
    console.log('✅ Email server is ready!');
  }
});

app.post('/submit-inquiry', async (req, res) => {
  const { fullName, email, phone, service, message } = req.body;

  const serviceNames = {
    lawn:    'Lawn Lots',
    niche:   'Garden Niche',
    estate:  'Family Estate',
    burial:  'Burial Services',
  };
  const serviceName = serviceNames[service] || service;

  if (!fullName || !email || !phone || !service || !message) {
    return res.status(400).json({ success: false, error: 'All fields are required.' });
  }

  try {
    await transporter.sendMail({
      from:    '"Talibon Memorial Park" <valmoresjomary10@gmail.com>',
      to:      process.env.RECEIVING_EMAIL,
      subject: `📋 New Inquiry from ${fullName}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 620px; margin: 0 auto; background: #f9f6f0; padding: 30px; border-radius: 8px;">
          <div style="background: #3a4a3a; padding: 20px 30px; border-radius: 6px 6px 0 0; text-align: center;">
            <h2 style="color: #c9a84c; margin: 0;">TALIBON MEMORIAL PARK</h2>
            <p style="color: #a0b0a0; margin: 4px 0 0;">New Inquiry Received</p>
          </div>
          <div style="background: #ffffff; padding: 30px; border-radius: 0 0 6px 6px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 10px; font-weight: bold; background: #f5f0e8;">Full Name</td><td style="padding: 10px;">${fullName}</td></tr>
              <tr><td style="padding: 10px; font-weight: bold; background: #f5f0e8;">Email</td><td style="padding: 10px;">${email}</td></tr>
              <tr><td style="padding: 10px; font-weight: bold; background: #f5f0e8;">Phone</td><td style="padding: 10px;">${phone}</td></tr>
              <tr><td style="padding: 10px; font-weight: bold; background: #f5f0e8;">Service</td><td style="padding: 10px;">${serviceName}</td></tr>
              <tr><td style="padding: 10px; font-weight: bold; background: #f5f0e8; vertical-align:top;">Message</td><td style="padding: 10px;">${message}</td></tr>
            </table>
            <p style="font-size: 12px; color: #999; margin-top: 20px;">Submitted: ${new Date().toLocaleString('en-PH', { timeZone: 'Asia/Manila' })}</p>
          </div>
        </div>
      `
    });

    await transporter.sendMail({
      from:    '"Talibon Memorial Park" <valmoresjomary10@gmail.com>',
      to:      email,
      subject: `Thank you for your inquiry, ${fullName}!`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 620px; margin: 0 auto; background: #f9f6f0; padding: 30px; border-radius: 8px;">
          <div style="background: #3a4a3a; padding: 20px 30px; border-radius: 6px 6px 0 0; text-align: center;">
            <h2 style="color: #c9a84c; margin: 0;">TALIBON MEMORIAL PARK</h2>
            <p style="color: #a0b0a0; margin: 4px 0 0;">Est. in Talibon, Bohol</p>
          </div>
          <div style="background: #ffffff; padding: 30px; border-radius: 0 0 6px 6px;">
            <p>Dear <strong>${fullName}</strong>,</p>
            <p>We have received your inquiry and our team will reach out to you shortly.</p>
            <div style="background: #f5f0e8; border-left: 4px solid #c9a84c; padding: 16px; margin: 20px 0;">
              <p style="margin:0;"><strong>Service Interest:</strong> ${serviceName}</p>
              <p style="margin:8px 0 0;"><strong>Your Message:</strong> ${message}</p>
            </div>
            <p>📞 +63 (912) 345-6789<br>📍 Talibon, Bohol, Philippines 6325<br>🕐 Mon–Sat: 8:00 AM – 5:00 PM</p>
          </div>
        </div>
      `
    });

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