import bcrypt from 'bcrypt';
import crypto from 'node:crypto';
import { User } from '../../models/User.js';
import {  sendPasswordResetEmail, sendVerificationEmail, sendWelcomeEmail } from '../../services/nodeServices.js';




export const signUp = async (req, res) => {
    try {
       
        const { email, password, name } = req.body;
        

        if (!email || !password || !name) {
            return res.status(400).json({ message: 'Name, email, and password are required' });
        }

        if (password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters' });
        }

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(409).json({ message: 'An account with this email already exists' });
        }

        const salt           = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate raw email verification token to send in the link
        const rawVerifyToken    = crypto.randomBytes(32).toString('hex');
        const hashedVerifyToken = crypto.createHash('sha256').update(rawVerifyToken).digest('hex');

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            emailVerificationToken:   hashedVerifyToken,
            emailVerificationExpires: Date.now() + 1000 * 60 * 60 * 24, // 24 hours
        });

        // Send verification email — don't block the response if this fails
        try {
            await sendVerificationEmail({ to: email, name, verificationToken: rawVerifyToken });
        } catch (mailError) {
            console.error('[SignUp] Verification email failed:', mailError.message);
        }

        return res.status(201).json({
            message: 'Account created. Check your email to verify your account.',
            user: {
                id:    user._id,
                name:  user.name,
                email: user.email,
            },
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


// ─── Verify Email ─────────────────────────────────────────────────────────────

export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            emailVerificationToken:   hashedToken,
            emailVerificationExpires: { $gt: Date.now() },
        }).select('+emailVerificationToken +emailVerificationExpires');

        if (!user) {
            return res.status(400).json({ message: 'Verification link is invalid or has expired' });
        }

        user.isVerified               = true;
        user.emailVerificationToken   = undefined;
        user.emailVerificationExpires = undefined;
        await user.save();

        // Send welcome email after successful verification
        try {
            await sendWelcomeEmail({ to: user.email, name: user.name });
        } catch (mailError) {
            console.error('[VerifyEmail] Welcome email failed:', mailError.message);
        }

        return res.status(200).json({ message: 'Email verified. Welcome to Safe_Net!' });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


// ─── Login ────────────────────────────────────────────────────────────────────

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Credentials required' });
        }

        // select('+password') needed because password has select:false in schema
        const user = await User.findOne({ email }).select('+password +loginAttempts +lockedUntil');

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check lockout before comparing password
        if (user.isLocked()) {
            const minutesLeft = Math.ceil((user.lockedUntil - Date.now()) / 1000 / 60);
            return res.status(423).json({
                message: `Account locked. Try again in ${minutesLeft} minute(s).`,
            });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            await user.recordFailedLogin();
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (!user.isVerified) {
            return res.status(403).json({ message: 'Please verify your email before logging in' });
        }

        await user.recordSuccessfulLogin();

        // TODO: generate and return a JWT token here
        return res.status(200).json({
            message: 'Login successful',
            user: {
                id:    user._id,
                name:  user.name,
                email: user.email,
                role:  user.role,
            },
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


// ─── Forgot Password ──────────────────────────────────────────────────────────

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const user = await User.findOne({ email });

        // Always return 200 even if no user — prevents email enumeration attacks
        if (!user) {
            return res.status(200).json({
                message: 'If an account with that email exists, a reset link has been sent',
            });
        }

        const rawToken    = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

        user.resetPasswordToken   = hashedToken;
        user.resetPasswordExpires = Date.now() + 1000 * 60 * 10; // 10 minutes
        await user.save();

        try {
            await sendPasswordResetEmail({ to: user.email, name: user.name, resetToken: rawToken });
        } catch (mailError) {
            // Roll back the saved token if email fails
            user.resetPasswordToken   = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();
            console.error('[ForgotPassword] Email failed:', mailError.message);
            return res.status(500).json({ message: 'Failed to send reset email. Please try again.' });
        }

        return res.status(200).json({
            message: 'If an account with that email exists, a reset link has been sent',
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


// ─── Reset Password ───────────────────────────────────────────────────────────

export const resetPassword = async (req, res) => {
    try {
        const { token }    = req.params;
        const { password } = req.body;

        if (!token || !password) {
            return res.status(400).json({ message: 'Token and new password are required' });
        }

        if (password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters' });
        }

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken:   hashedToken,
            resetPasswordExpires: { $gt: Date.now() },
        }).select('+resetPasswordToken +resetPasswordExpires');

        if (!user) {
            return res.status(400).json({ message: 'Reset link is invalid or has expired' });
        }

        const salt         = await bcrypt.genSalt(12);
        user.password      = await bcrypt.hash(password, salt);
        user.resetPasswordToken   = undefined;
        user.resetPasswordExpires = undefined;
        user.loginAttempts        = 0;
        user.lockedUntil          = undefined;

        await user.save();

        return res.status(200).json({ message: 'Password updated successfully. You can now log in.' });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};