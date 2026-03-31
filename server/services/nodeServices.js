import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host:   process.env.SMTP_HOST,
    port:   Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_PORT === '465',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

transporter.verify((error) => {
    if (error) {
        console.warn('[Mailer] SMTP connection failed:', error.message);
    } else {
        console.log('[Mailer] SMTP ready');
    }
});

const sendMail = async ({ to, subject, text }) => {
    const info = await transporter.sendMail({
        from:    `"${process.env.SMTP_FROM_NAME || 'Safe_Net'}" <${process.env.SMTP_FROM_EMAIL}>`,
        to,
        subject,
        text,
    });
    console.log(`[Mailer] Sent: ${info.messageId}`);
    return info;
};

export const sendPasswordResetEmail = ({ to, name, resetToken }) => {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    return sendMail({
        to,
        subject: 'Reset your Safe_Net password',
        text: `Hi ${name},\n\nReset your password here:\n${resetUrl}\n\nThis link expires in 10 minutes.\n\nIf you did not request this, ignore this email.`,
    });
};

export const sendVerificationEmail = ({ to, name, verificationToken }) => {
    const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

    return sendMail({
        to,
        subject: 'Verify your Safe_Net email',
        text: `Hi ${name},\n\nVerify your email here:\n${verifyUrl}\n\nThis link expires in 24 hours.\n\nIf you did not create an account, ignore this email.`,
    });
};

export const sendWelcomeEmail = ({ to, name }) => {
    return sendMail({
        to,
        subject: 'Welcome to Safe_Net',
        text: `Hi ${name},\n\nYour Safe_Net account is active.\n\nWhat you can do:\n- Scan files via VirusTotal\n- Store files with AES-256-GCM encryption\n- Inspect TLS certificates for any domain\n\nQuestions? Reply to this email.`,
    });
};