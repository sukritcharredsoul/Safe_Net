import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema(
    {
        name: {
            type:     String,
            required: [true, 'Name is required'],
            trim:     true,
            minLength: [2,  'Name must be at least 2 characters'],
            maxLength: [64, 'Name cannot exceed 64 characters'],
        },

        email: {
            type:      String,
            required:  [true, 'Email is required'],
            unique:    true,
            lowercase: true,
            trim:      true,
            match: [
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                'Please provide a valid email address',
            ],
        },

        password: {
            type:      String,
            required:  [true, 'Password is required'],
            minLength: [8, 'Password must be at least 8 characters'],
            select:    false, // never returned in queries unless explicitly asked with .select('+password')
        },

        role: {
            type:    String,
            enum:    ['user', 'admin'],
            default: 'user',
        },

        isVerified: {
            type:    Boolean,
            default: false,
        },

        // ── Email verification ────────────────────────────────────────────────
        emailVerificationToken:   { type: String, select: false },
        emailVerificationExpires: { type: Date,   select: false },

        // ── Password reset ────────────────────────────────────────────────────
        resetPasswordToken:   { type: String, select: false },
        resetPasswordExpires: { type: Date,   select: false },

        // ── Activity tracking ─────────────────────────────────────────────────
        lastLogin: {
            type: Date,
        },

        loginAttempts: {
            type:    Number,
            default: 0,
            select:  false,
        },

        lockedUntil: {
            type:   Date,
            select: false,
        },
    },
    {
        timestamps: true, // adds createdAt and updatedAt automatically
        toJSON: {
            transform(doc, ret) {
                // Strip sensitive fields from any JSON output
                delete ret.password;
                delete ret.resetPasswordToken;
                delete ret.resetPasswordExpires;
                delete ret.emailVerificationToken;
                delete ret.emailVerificationExpires;
                delete ret.loginAttempts;
                delete ret.lockedUntil;
                delete ret.__v;
                return ret;
            },
        },
    }
);


userSchema.index({ email: 1 });
userSchema.index({ resetPasswordToken: 1 });
userSchema.index({ emailVerificationToken: 1 });


// ─── Instance methods ─────────────────────────────────────────────────────────

// Check if account is currently locked out
userSchema.methods.isLocked = function () {
    return this.lockedUntil && this.lockedUntil > Date.now();
};


userSchema.methods.recordFailedLogin = async function () {
    const MAX_ATTEMPTS   = 5;
    const LOCKOUT_PERIOD = 15 * 60 * 1000; // 15 minutes in ms

    this.loginAttempts += 1;

    if (this.loginAttempts >= MAX_ATTEMPTS) {
        this.lockedUntil   = new Date(Date.now() + LOCKOUT_PERIOD);
        this.loginAttempts = 0; // reset counter after locking
    }

    await this.save();
};


userSchema.methods.recordSuccessfulLogin = async function () {
    this.loginAttempts = 0;
    this.lockedUntil   = undefined;
    this.lastLogin     = new Date();
    await this.save();
};

// Compare a plaintext password against the stored hash
userSchema.methods.comparePassword = async function (plaintext) {
    return bcrypt.compare(plaintext, this.password);
};




export const User = mongoose.model('User', userSchema);