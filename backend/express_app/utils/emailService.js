const nodemailer = require('nodemailer');

/**
 * Creates a Nodemailer transporter.
 * - If EMAIL_USER ends in @gmail.com: uses Gmail service (needs App Password, not regular password)
 * - Otherwise: tries Gmail service first, falls back to a generic SMTP guess
 * 
 * IMPORTANT FOR GMAIL: You MUST use an App Password (not your login password).
 * Go to: Google Account → Security → 2-Step Verification → App Passwords
 * Generate an app password and set it as EMAIL_PASS in .env (16 chars, no spaces).
 *
 * For institutional emails (e.g. @srmap.edu.in), contact your IT dept for SMTP settings.
 * You may need to set EMAIL_SMTP_HOST, EMAIL_SMTP_PORT, EMAIL_SMTP_SECURE in .env.
 */
const createTransporter = () => {
    const emailUser = process.env.EMAIL_USER || '';
    const smtpHost = process.env.EMAIL_SMTP_HOST;
    const smtpPort = parseInt(process.env.EMAIL_SMTP_PORT || '587', 10);
    const smtpSecure = process.env.EMAIL_SMTP_SECURE === 'true';

    if (smtpHost) {
        // Explicit SMTP host provided (e.g., for institutional emails)
        return nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpSecure,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
            tls: { rejectUnauthorized: false }
        });
    }

    // Default: Gmail service
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
};

/**
 * Generate a styled HTML email body for a booking confirmation.
 */
const buildBookingEmailHTML = (options) => {
    const { userName, trainName, trainNumber, source, destination, departureTime, status, bookingId } = options.meta || {};
    
    if (!userName) {
        // Fallback: just wrap plain text in a minimal HTML wrapper
        return `<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#333;">
            <pre style="white-space:pre-wrap;">${options.message || ''}</pre>
        </div>`;
    }

    const statusColor = status === 'Confirmed' ? '#2D6A4F' : status === 'RAC' ? '#B45309' : '#6B21A8';
    const depFormatted = departureTime ? new Date(departureTime).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' }) : 'N/A';

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8"/>
      <meta name="viewport" content="width=device-width,initial-scale=1"/>
      <title>RailYatri E-Ticket</title>
    </head>
    <body style="margin:0;padding:0;background:#F0F4F8;font-family:'Segoe UI',Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#F0F4F8;padding:32px 0;">
        <tr><td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10);">
            
            <!-- Header Banner -->
            <tr>
              <td style="background:#1D3557;padding:28px 36px 20px;">
                <table width="100%">
                  <tr>
                    <td>
                      <p style="margin:0;color:#fff;font-size:26px;font-weight:900;letter-spacing:-0.5px;">RAILYATRI</p>
                      <p style="margin:4px 0 0;color:#E63946;font-size:10px;font-weight:700;letter-spacing:3px;">E-TICKET CONFIRMATION</p>
                    </td>
                    <td align="right">
                      <span style="display:inline-block;background:${statusColor};color:#fff;padding:6px 18px;border-radius:20px;font-size:13px;font-weight:700;">
                        ${status || 'Confirmed'}
                      </span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Greeting -->
            <tr>
              <td style="padding:28px 36px 0;">
                <p style="margin:0;font-size:18px;font-weight:700;color:#1D3557;">Hello, ${userName}! 👋</p>
                <p style="margin:10px 0 0;color:#4A5568;font-size:14px;line-height:1.6;">
                  Your train ticket has been booked successfully. Please find the details below.
                </p>
              </td>
            </tr>

            <!-- Journey Card -->
            <tr>
              <td style="padding:20px 36px;">
                <div style="background:#F7FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:20px 24px;">
                  <p style="margin:0 0 12px;font-size:12px;font-weight:700;color:#718096;letter-spacing:1.5px;text-transform:uppercase;">Journey Details</p>
                  <p style="margin:0 0 4px;font-size:18px;font-weight:800;color:#1D3557;">${trainName || 'N/A'}</p>
                  <p style="margin:0 0 16px;font-size:12px;color:#718096;">Train No. ${trainNumber || 'N/A'}</p>

                  <table width="100%">
                    <tr>
                      <td width="40%" valign="top">
                        <p style="margin:0;font-size:10px;color:#718096;font-weight:600;text-transform:uppercase;">From</p>
                        <p style="margin:4px 0 0;font-size:20px;font-weight:800;color:#1D3557;">${source || 'N/A'}</p>
                        <p style="margin:4px 0 0;font-size:12px;color:#4A5568;">${depFormatted}</p>
                      </td>
                      <td width="20%" align="center" valign="middle">
                        <div style="text-align:center;color:#E63946;font-size:22px;">→</div>
                        <p style="margin:4px 0 0;font-size:10px;color:#E63946;font-weight:700;text-align:center;">TRAIN</p>
                      </td>
                      <td width="40%" valign="top" align="right">
                        <p style="margin:0;font-size:10px;color:#718096;font-weight:600;text-transform:uppercase;text-align:right;">To</p>
                        <p style="margin:4px 0 0;font-size:20px;font-weight:800;color:#457B9D;text-align:right;">${destination || 'N/A'}</p>
                      </td>
                    </tr>
                  </table>
                </div>
              </td>
            </tr>

            <!-- Booking ID -->
            <tr>
              <td style="padding:0 36px 20px;">
                <table width="100%">
                  <tr>
                    <td style="background:#1D3557;border-radius:8px;padding:14px 20px;">
                      <p style="margin:0;font-size:10px;color:rgba(255,255,255,0.6);font-weight:600;letter-spacing:1px;text-transform:uppercase;">Booking ID / PNR</p>
                      <p style="margin:6px 0 0;font-size:16px;font-weight:800;color:#fff;letter-spacing:1px;font-family:monospace;">${String(bookingId || '').toUpperCase()}</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- PDF Notice -->
            <tr>
              <td style="padding:0 36px 20px;">
                <div style="background:#FFF3CD;border:1px solid #FFEEBA;border-radius:8px;padding:12px 16px;">
                  <p style="margin:0;font-size:13px;color:#856404;">
                    📎 <strong>Your PDF e-ticket is attached</strong> to this email. Please download and carry it during your journey (or show on your phone).
                  </p>
                </div>
              </td>
            </tr>

            <!-- Important Notes -->
            <tr>
              <td style="padding:0 36px 28px;">
                <p style="margin:0 0 10px;font-size:12px;font-weight:700;color:#718096;letter-spacing:1px;text-transform:uppercase;">Important Notes</p>
                <ul style="margin:0;padding-left:20px;color:#4A5568;font-size:13px;line-height:1.8;">
                  <li>Carry a valid government-issued photo ID proof.</li>
                  <li>Arrive at the platform at least 15 minutes before departure.</li>
                  <li>Cancellations allowed up to 4 hours before departure.</li>
                </ul>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#1D3557;padding:20px 36px;border-radius:0 0 16px 16px;">
                <p style="margin:0;color:rgba(255,255,255,0.6);font-size:12px;text-align:center;">
                  Happy Travels! 🚆 &nbsp;|&nbsp; Team RailYatri &nbsp;|&nbsp; support@railyatri.in
                </p>
                <p style="margin:8px 0 0;color:rgba(255,255,255,0.3);font-size:10px;text-align:center;">
                  This is an auto-generated email. Please do not reply directly.
                </p>
              </td>
            </tr>

          </table>
        </td></tr>
      </table>
    </body>
    </html>
    `;
};

/**
 * Send an email with optional PDF attachment.
 * @param {Object} options - { email, subject, message, attachments, meta }
 *   meta (optional): { userName, trainName, trainNumber, source, destination, departureTime, status, bookingId }
 */
const sendEmail = async (options) => {
    const transporter = createTransporter();

    const htmlBody = buildBookingEmailHTML(options);

    const mailOptions = {
        from: `"RailYatri Tickets 🚆" <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        // Plain text fallback
        text: options.message || options.subject,
        // Rich HTML version
        html: htmlBody,
    };

    if (options.attachments) {
        mailOptions.attachments = options.attachments;
    }

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent to: %s, Message ID: %s', options.email, info.messageId);
        return info;
    } catch (err) {
        console.error('Email send error:', err.message);
        // Log a helpful hint for Gmail app password issues
        if (err.message.includes('Invalid login') || err.message.includes('Username and Password')) {
            console.error('HINT: Gmail requires an App Password. Go to Google Account → Security → App Passwords. Set EMAIL_PASS in .env to the 16-char app password.');
        }
        throw err;
    }
};

module.exports = sendEmail;
