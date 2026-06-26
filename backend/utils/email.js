const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

/**
 * Send an email.
 * @param {Object} options
 * @param {string} options.to      - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html    - HTML body
 */
const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️  Email credentials not set. Skipping email send.');
    return;
  }
  try {
    const info = await transporter.sendMail({
      from: `"CareerPilot 🚀" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`📧 Email sent: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error('❌ Email send error:', err.message);
  }
};

// ── Email Templates ────────────────────────────────────────────────────────────

const baseStyle = `
  font-family: 'Inter', -apple-system, sans-serif;
  background: #0A0F1E; color: #F1F5F9;
  max-width: 560px; margin: 0 auto; padding: 40px 32px;
  border-radius: 20px; border: 1px solid rgba(59,130,246,0.15);
`;
const btnStyle = `
  display: inline-block; padding: 14px 32px;
  background: linear-gradient(135deg, #3B82F6, #8B5CF6);
  color: #fff; font-weight: 800; border-radius: 12px;
  text-decoration: none; margin-top: 24px;
`;

exports.sendWelcomeEmail = async (user) => {
  await sendEmail({
    to: user.email,
    subject: '🚀 Welcome to CareerPilot!',
    html: `<div style="${baseStyle}">
      <h1 style="color:#fff; font-size:28px; margin-bottom:8px;">Welcome, ${user.name}! 👋</h1>
      <p style="color:#94A3B8; font-size:16px; line-height:1.7;">
        You've joined CareerPilot — the AI-powered recruitment platform.
        ${user.role === 'fresher'
          ? 'Browse jobs matched to your skills and earn certificates.'
          : 'Post jobs and discover top freshers with our ATS pipeline.'}
      </p>
      <a href="${process.env.CLIENT_URL}" style="${btnStyle}">
        Go to Dashboard →
      </a>
      <p style="color:#475569; font-size:13px; margin-top:32px;">
        — The CareerPilot Team
      </p>
    </div>`,
  });
};

exports.sendStatusEmail = async ({ to, name, jobTitle, status }) => {
  const statusMsg = {
    Shortlisted:  { emoji: '⭐', msg: 'Great news! You\'ve been shortlisted.' },
    Interviewing: { emoji: '📅', msg: 'You\'ve been selected for an interview!' },
    Selected:     { emoji: '🎉', msg: 'Congratulations! You\'ve been selected!' },
    Hired:        { emoji: '🏆', msg: 'Amazing! You\'ve been officially hired!' },
    Rejected:     { emoji: '📩', msg: 'Thank you for your interest.' },
  };
  const { emoji, msg } = statusMsg[status] || { emoji: '📌', msg: `Your status changed to ${status}.` };

  await sendEmail({
    to,
    subject: `${emoji} Application Update — ${jobTitle}`,
    html: `<div style="${baseStyle}">
      <h1 style="color:#fff; font-size:26px;">${emoji} Hi ${name},</h1>
      <p style="color:#94A3B8; font-size:16px; line-height:1.7;">${msg}</p>
      <p style="color:#94A3B8;">Your application for <strong style="color:#3B82F6;">${jobTitle}</strong> is now: <strong style="color:#fff;">${status}</strong></p>
      <a href="${process.env.CLIENT_URL}/fresher/applications" style="${btnStyle}">
        View My Applications →
      </a>
    </div>`,
  });
};

exports.sendFollowRequestEmail = async ({ to, companyName, fresherName }) => {
  await sendEmail({
    to,
    subject: `🔔 New Follow Request from ${fresherName}`,
    html: `<div style="${baseStyle}">
      <h1 style="color:#fff; font-size:26px;">Hi ${companyName},</h1>
      <p style="color:#94A3B8; font-size:16px; line-height:1.7;">
        <strong style="color:#fff;">${fresherName}</strong> has requested to follow your private company profile.
      </p>
      <a href="${process.env.CLIENT_URL}/startup/followers" style="${btnStyle}">
        Review Request →
      </a>
    </div>`,
  });
};

exports.sendFollowApprovedEmail = async ({ to, fresherName, companyName }) => {
  await sendEmail({
    to,
    subject: `✅ Follow Request Approved by ${companyName}`,
    html: `<div style="${baseStyle}">
      <h1 style="color:#fff; font-size:26px;">Hi ${fresherName},</h1>
      <p style="color:#94A3B8; font-size:16px; line-height:1.7;">
        Great news! <strong style="color:#fff;">${companyName}</strong> has approved your follow request. You can now view their private job postings.
      </p>
      <a href="${process.env.CLIENT_URL}/company" style="${btnStyle}">
        View Company Jobs →
      </a>
    </div>`,
  });
};

exports.sendInvitationEmail = async ({ to, fresherName, companyName, jobTitle }) => {
  await sendEmail({
    to,
    subject: `💌 You're Invited! ${companyName} wants you to apply`,
    html: `<div style="${baseStyle}">
      <h1 style="color:#fff; font-size:26px;">Hi ${fresherName},</h1>
      <p style="color:#94A3B8; font-size:16px; line-height:1.7;">
        <strong style="color:#fff;">${companyName}</strong> thinks you'd be a great fit for the <strong style="color:#3B82F6;">${jobTitle}</strong> role and has invited you to apply!
      </p>
      <a href="${process.env.CLIENT_URL}/fresher/applications" style="${btnStyle}">
        Accept Invitation →
      </a>
    </div>`,
  });
};

exports.sendNewJobEmail = async ({ to, fresherName, companyName, jobTitle }) => {
  await sendEmail({
    to,
    subject: `📢 New Job Posted by ${companyName}`,
    html: `<div style="${baseStyle}">
      <h1 style="color:#fff; font-size:26px;">Hi ${fresherName},</h1>
      <p style="color:#94A3B8; font-size:16px; line-height:1.7;">
        <strong style="color:#fff;">${companyName}</strong> (a company you follow) just posted a new role: <strong style="color:#3B82F6;">${jobTitle}</strong>.
      </p>
      <a href="${process.env.CLIENT_URL}/jobs" style="${btnStyle}">
        Check it out →
      </a>
    </div>`,
  });
};

exports.sendEmail = sendEmail;
