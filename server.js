/* ============================================================
   TALIBON MEMORIAL PARK — Node.js Backend Server
   ============================================================ */

// Step 1: Load all the tools we installed
require('dotenv').config();           // Reads your .env file
const express    = require('express');
const nodemailer = require('nodemailer');
const cors       = require('cors');

const app = express();

/* ── Middleware (Tools that run on every request) ── */
app.use(cors());                        // Allows your HTML page to talk to this server
app.use(express.json());               // Understands JSON data sent from your form
app.use(express.static('public'));     // Serves your index.html, CSS, JS, images

/* ── Email Setup ── */
// This is like setting up your email app with your login credentials
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,   // Comes from your .env file
    pass: process.env.EMAIL_PASS,   // Your Gmail App Password (NOT your real password)
  }
});

// Test the email connection when server starts
transporter.verify((error) => {
  if (error) {
    console.log('❌ Email connection failed:', error.message);
    console.log('   → Check your EMAIL_USER and EMAIL_PASS in .env');
  } else {
    console.log('✅ Email server is ready!');
  }
});

/* ── The Inquiry Route ── */
// This runs when your form hits the Submit button
app.post('/submit-inquiry', async (req, res) => {

  // Grab what the form sent us
  const { fullName, email, phone, service, message } = req.body;

  // Map service values to readable names
  const serviceNames = {
    lawn:    'Lawn Lots',
    niche:   'Garden Niche',
    estate:  'Family Estate',
    burial:  'Burial Services',
  };
  const serviceName = serviceNames[service] || service;

  // Basic check — make sure nothing is empty
  if (!fullName || !email || !phone || !service || !message) {
    return res.status(400).json({
      success: false,
      error: 'All fields are required.'
    });
  }

  try {

    /* ── EMAIL 1: Notify YOU (Talibon Memorial Park) ── */
    await transporter.sendMail({
      from:    `"Talibon Memorial Park Website" <${process.env.EMAIL_USER}>`,
      to:      process.env.RECEIVING_EMAIL,
      subject: `📋 New Inquiry from ${fullName}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 620px; margin: 0 auto; background: #f9f6f0; padding: 30px; border-radius: 8px;">
          <div style="background: #3a4a3a; padding: 20px 30px; border-radius: 6px 6px 0 0; text-align: center;">
            <h2 style="color: #c9a84c; margin: 0; font-size: 22px; letter-spacing: 1px;">TALIBON MEMORIAL PARK</h2>
            <p style="color: #a0b0a0; margin: 4px 0 0; font-size: 13px;">New Inquiry Received</p>
          </div>
          <div style="background: #ffffff; padding: 30px; border-radius: 0 0 6px 6px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 15px;">
              <tr>
                <td style="padding: 10px 12px; font-weight: bold; color: #5a4a3a; width: 140px; background: #f5f0e8;">Full Name</td>
                <td style="padding: 10px 12px; color: #333;">${fullName}</td>
              </tr>
              <tr>
                <td style="padding: 10px 12px; font-weight: bold; color: #5a4a3a; background: #f5f0e8;">Email</td>
                <td style="padding: 10px 12px;"><a href="mailto:${email}" style="color: #c9a84c;">${email}</a></td>
              </tr>
              <tr>
                <td style="padding: 10px 12px; font-weight: bold; color: #5a4a3a; background: #f5f0e8;">Phone</td>
                <td style="padding: 10px 12px; color: #333;">${phone}</td>
              </tr>
              <tr>
                <td style="padding: 10px 12px; font-weight: bold; color: #5a4a3a; background: #f5f0e8;">Service Interest</td>
                <td style="padding: 10px 12px; color: #333;">${serviceName}</td>
              </tr>
              <tr>
                <td style="padding: 10px 12px; font-weight: bold; color: #5a4a3a; vertical-align: top; background: #f5f0e8;">Message</td>
                <td style="padding: 10px 12px; color: #333; line-height: 1.6;">${message}</td>
              </tr>
            </table>
            <p style="margin-top: 20px; font-size: 12px; color: #999; text-align: right;">
              Submitted on: ${new Date().toLocaleString('en-PH', { timeZone: 'Asia/Manila' })}
            </p>
            <div style="margin-top: 16px; text-align: center;">
              <a href="mailto:${email}" style="background: #c9a84c; color: white; padding: 10px 24px; border-radius: 4px; text-decoration: none; font-size: 14px; letter-spacing: 1px;">
                REPLY TO CLIENT
              </a>
            </div>
          </div>
        </div>
      `
    });

    /* ── EMAIL 2: Confirmation to the CLIENT ── */
    await transporter.sendMail({
      from:    `"Talibon Memorial Park" <${process.env.EMAIL_USER}>`,
      to:      email,
      subject: `Thank you for your inquiry, ${fullName}!`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 620px; margin: 0 auto; background: #f9f6f0; padding: 30px; border-radius: 8px;">
          <div style="background: #3a4a3a; padding: 20px 30px; border-radius: 6px 6px 0 0; text-align: center;">
            <h2 style="color: #c9a84c; margin: 0; font-size: 22px; letter-spacing: 1px;">TALIBON MEMORIAL PARK</h2>
            <p style="color: #a0b0a0; margin: 4px 0 0; font-size: 13px;">Est. in Talibon, Bohol</p>
          </div>
          <div style="background: #ffffff; padding: 30px; border-radius: 0 0 6px 6px;">
            <h3 style="color: #3a4a3a; margin-top: 0;">Thank You for Reaching Out</h3>
            <p style="color: #555; line-height: 1.7;">Dear <strong>${fullName}</strong>,</p>
            <p style="color: #555; line-height: 1.7;">
              We have received your inquiry and one of our caring team members will 
              reach out to you as soon as possible. We are honored that you have 
              chosen to trust Talibon Memorial Park.
            </p>
            <div style="background: #f5f0e8; border-left: 4px solid #c9a84c; padding: 16px 20px; border-radius: 0 4px 4px 0; margin: 20px 0;">
              <p style="margin: 0 0 6px; font-weight: bold; color: #5a4a3a;">Your Inquiry Summary:</p>
              <p style="margin: 4px 0; color: #555; font-size: 14px;">📋 Service Interest: <strong>${serviceName}</strong></p>
              <p style="margin: 4px 0; color: #555; font-size: 14px;">💬 Your Message: ${message}</p>
            </div>
            <p style="color: #555; line-height: 1.7;">If you have urgent concerns, feel free to contact us directly:</p>
            <p style="color: #555; font-size: 14px; line-height: 1.9;">
              📞 <strong>+63 (912) 345-6789</strong><br>
              📧 <strong>info@talibonmemorialpark.com</strong><br>
              📍 <strong>Talibon, Bohol, Philippines 6325</strong><br>
              🕐 <strong>Mon–Sat: 8:00 AM – 5:00 PM</strong>
            </p>
            <hr style="border: none; border-top: 1px solid #e8e0d0; margin: 24px 0;">
            <p style="color: #999; font-size: 12px; text-align: center; font-style: italic;">
              "A place of peace, love, and eternal remembrance."<br>
              © 2025 Talibon Memorial Park. All Rights Reserved.
            </p>
          </div>
        </div>
      `
    });

    // Tell the browser: success!
    res.json({ success: true, message: 'Inquiry submitted successfully!' });

  } catch (error) {
    // Something went wrong with sending email
    console.error('❌ Email error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to send email. Please try again later.'
    });
  }
});

/* ── Start the Server ── */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running → http://localhost:${PORT}`);
  console.log(`   Open this in your browser to see your site!`);
});
