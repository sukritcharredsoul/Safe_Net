import bcrypt from 'bcrypt';
import crypto from 'node:crypto';
import { User } from '../models/User.js'; 



export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // [FIX] was req.status() — req has no .status(), only res does
        if (!email || !password) {
            return res.status(400).json({ message: 'Credentials required' });
        }

        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }


        // TODO: generate a JWT or session here and return it
        return res.status(200).json({ message: 'Login successful' });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};



export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        
        const user = await User.findOne({ email });

        
        if (!user) {
            return res.status(404).json({ message: 'No account found with that email' });
        }

        
        const resetToken = crypto.randomBytes(32).toString('hex');

        
        const hashedToken = crypto
            .createHash('sha512') 
            .update(resetToken)
            .digest('hex');

        user.resetPasswordToken   = hashedToken;
        user.resetPasswordExpires = Date.now() + 1000 * 60 * 10; // 10 minutes

        await user.save();

        // TODO: plug in your mailer (nodemailer, Resend, SendGrid, etc.)
        // The raw resetToken goes in the email link — NOT the hashed one
        const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;
        console.log(`[DEV] Password reset link: ${resetUrl}`);

        return res.status(200).json({ message: 'Password reset link sent to your email' });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};



export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!token || !password) {
            return res.status(400).json({ message: 'Token and new password are required' });
        }

        
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken:   hashedToken,
            resetPasswordExpires: { $gt: Date.now() }, 
        });

        if (!user) {
            return res.status(400).json({ message: 'Token is invalid or has expired' });
        }

        const salt         = await bcrypt.genSalt(12);
        user.password      = await bcrypt.hash(password, salt);

    
        user.resetPasswordToken   = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        return res.status(200).json({ message: 'Password updated successfully' });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};




export const signUp = async (req, res) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ message: 'Name, email, and password are required' });
        }

        // Reject if an account with this email already exists
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(409).json({ message: 'An account with this email already exists' });
        }

        if (password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters' });
        }

        // Hash before storing — never store plaintext passwords
        const salt           = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        // Return the new user without exposing the password hash
        return res.status(201).json({
            message: 'Account created successfully',
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