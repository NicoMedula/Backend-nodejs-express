import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import prisma from '../database/prisma.js';
import { JWT_SECRET, JWT_EXPIRES_IN, FRONTEND_URL } from '../config/env.js';
import transporter, { accountEmail } from '../config/nodemailer.js';

const generateToken = (userId) =>
  jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

export const signUp = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      const error = new Error('Name, email and password are required');
      error.statusCode = 400;
      throw error;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const error = new Error('Invalid email format');
      error.statusCode = 400;
      throw error;
    }

    if (password.length < 6 || password.length > 128) {
      const error = new Error('Password must be between 6 and 128 characters');
      error.statusCode = 400;
      throw error;
    }

    if (name.trim().length < 2 || name.trim().length > 100) {
      const error = new Error('Name must be between 2 and 100 characters');
      error.statusCode = 400;
      throw error;
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existing) {
      const error = new Error('Email already registered');
      error.statusCode = 409;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        verificationToken,
        emailVerified: false,
        profile: {
          create: {
            fullName: name,
            role: 'student',
          },
        },
      },
      include: { profile: true },
    });

    const verifyUrl = `${FRONTEND_URL}/auth/verify-email?token=${verificationToken}`;

    await transporter.sendMail({
      from: accountEmail,
      to: email,
      subject: 'Hakia - Verify your email',
      html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; background-color: #E8E9E7;">
          <div style="background: #fff; border: 3px solid #000; padding: 30px;">
            <h1 style="font-family: 'Space Grotesk', sans-serif; margin: 0 0 10px; font-size: 24px;">HAKIA</h1>
            <h2 style="margin: 0 0 16px; font-size: 20px;">Welcome, ${name}!</h2>
            <p style="color: #323232; line-height: 1.6;">Thanks for signing up. Please verify your email address to access the platform.</p>
            <a href="${verifyUrl}" style="display: inline-block; margin: 24px 0; padding: 14px 28px; background: #80DC72; color: #000; text-decoration: none; font-weight: bold; font-size: 16px; border: 3px solid #000; box-shadow: 4px 4px 0 #000;">
              Verify Email
            </a>
            <p style="color: #666; font-size: 13px;">If you didn't create this account, you can ignore this email.</p>
            <p style="color: #999; font-size: 12px; margin-top: 20px;">This link expires when you use it.</p>
          </div>
        </div>
      `,
    });

    res.status(201).json({
      success: true,
      message: 'Account created! Check your email to verify.',
      data: {
        requiresVerification: true,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;

    if (!token) {
      const error = new Error('Verification token is required');
      error.statusCode = 400;
      throw error;
    }

    const user = await prisma.user.findFirst({
      where: { verificationToken: token },
    });

    if (!user) {
      const error = new Error('Invalid or expired verification token. Try requesting a new one.');
      error.statusCode = 400;
      throw error;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! You can now sign in.',
    });
  } catch (error) {
    next(error);
  }
};

export const resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || user.emailVerified) {
      return res.status(200).json({
        success: true,
        message: 'If that email needs verification, a new link was sent',
      });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');

    await prisma.user.update({
      where: { id: user.id },
      data: { verificationToken },
    });

    const verifyUrl = `${FRONTEND_URL}/auth/verify-email?token=${verificationToken}`;

    await transporter.sendMail({
      from: accountEmail,
      to: email,
      subject: 'Hakia - Verify your email',
      html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; background-color: #E8E9E7;">
          <div style="background: #fff; border: 3px solid #000; padding: 30px;">
            <h1 style="font-family: 'Space Grotesk', sans-serif; margin: 0 0 10px; font-size: 24px;">HAKIA</h1>
            <h2 style="margin: 0 0 16px; font-size: 20px;">Verify your email</h2>
            <p style="color: #323232; line-height: 1.6;">Click below to verify your email address.</p>
            <a href="${verifyUrl}" style="display: inline-block; margin: 24px 0; padding: 14px 28px; background: #80DC72; color: #000; text-decoration: none; font-weight: bold; font-size: 16px; border: 3px solid #000; box-shadow: 4px 4px 0 #000;">
              Verify Email
            </a>
          </div>
        </div>
      `,
    });

    res.status(200).json({
      success: true,
      message: 'If that email needs verification, a new link was sent',
    });
  } catch (error) {
    next(error);
  }
};

export const signIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (!user || !user.password) {
      const error = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      const error = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }

    if (!user.emailVerified) {
      return res.status(403).json({
        success: false,
        error: 'Please verify your email before signing in',
        requiresVerification: true,
        email: user.email,
      });
    }

    const token = generateToken(user.id);

    res.status(200).json({
      success: true,
      message: 'Signed in successfully',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          profile: user.profile,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const signOut = async (_req, res) => {
  res.status(200).json({ success: true, message: 'Signed out successfully' });
};

export const googleCallback = async (req, res) => {
  const token = generateToken(req.user.id);
  res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}`);
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    console.log('[forgot-password] Request for:', email);

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      console.log('[forgot-password] User not found:', email);
      return res.status(200).json({
        success: true,
        message: 'If that email exists, a reset link was sent',
      });
    }

    console.log('[forgot-password] User found, generating token...');
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry: resetExpires,
      },
    });

    const resetUrl = `${FRONTEND_URL}/reset-password?token=${resetToken}`;
    console.log('[forgot-password] Sending email to:', email);

    const info = await transporter.sendMail({
      from: accountEmail,
      to: email,
      subject: 'Hakia - Reset your password',
      html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; background-color: #E8E9E7;">
          <div style="background: #fff; border: 3px solid #000; padding: 30px;">
            <h1 style="font-family: 'Space Grotesk', sans-serif; margin: 0 0 10px; font-size: 24px;">HAKIA</h1>
            <h2 style="margin: 0 0 16px; font-size: 20px;">Password Reset</h2>
            <p style="color: #323232; line-height: 1.6;">Click the button below to reset your password. This link expires in 1 hour.</p>
            <a href="${resetUrl}" style="display: inline-block; margin: 24px 0; padding: 14px 28px; background: #80DC72; color: #000; text-decoration: none; font-weight: bold; font-size: 16px; border: 3px solid #000; box-shadow: 4px 4px 0 #000;">
              Reset Password
            </a>
            <p style="color: #666; font-size: 13px;">If you didn't request this, ignore this email.</p>
          </div>
        </div>
      `,
    });

    console.log('[forgot-password] Email sent:', info.messageId);

    res.status(200).json({
      success: true,
      message: 'If that email exists, a reset link was sent',
    });
  } catch (error) {
    console.error('[forgot-password] ERROR:', error.message);
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (!password || password.length < 6) {
      const error = new Error('Password must be at least 6 characters');
      error.statusCode = 400;
      throw error;
    }

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      const error = new Error('Invalid or expired reset token');
      error.statusCode = 400;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { profile: true },
    });

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
        profile: user.profile,
      },
    });
  } catch (error) {
    next(error);
  }
};
