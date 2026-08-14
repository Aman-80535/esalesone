import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { to, subject, html } = body;

    if (!to || !subject) {
      return NextResponse.json(
        { error: 'Recipient and subject are required' },
        { status: 400 }
      );
    }

    console.log(`[Email Service] Sending email to: ${to}, Subject: ${subject}`);

    // If GMAIL_USER/PASS or custom SMTP is set, attempt sending via nodemailer dynamically
    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_PASS;

    if (gmailUser && gmailPass) {
      try {
        const nodemailer = await import('nodemailer');
        const transporter = nodemailer.default.createTransport({
          service: 'gmail',
          auth: {
            user: gmailUser,
            pass: gmailPass,
          },
        });

        await transporter.sendMail({
          from: `"Shopi E-Commerce" <${gmailUser}>`,
          to,
          subject,
          html: html || subject,
        });

        return NextResponse.json({ message: 'Email sent successfully via Gmail SMTP' });
      } catch (smtpErr) {
        console.warn('[Email Service] SMTP error, simulated delivery:', smtpErr.message);
      }
    }

    // Default simulation / success response
    return NextResponse.json({
      message: 'Email processed successfully (simulation/mock)',
      recipient: to,
    });
  } catch (error) {
    console.error('[Email Service] Error processing email:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send email' },
      { status: 500 }
    );
  }
}
