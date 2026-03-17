import { Router } from 'express';
import passport from '../config/passport.js';
import authorize from '../middlewares/auth.middleware.js';
import {
  signUp,
  signIn,
  signOut,
  googleCallback,
  forgotPassword,
  resetPassword,
  getMe,
  verifyEmail,
  resendVerification,
} from '../controllers/auth.controller.js';

const authRouter = Router();

authRouter.post('/sign-up', signUp);
authRouter.post('/sign-in', signIn);
authRouter.post('/sign-out', signOut);
authRouter.get('/verify-email', verifyEmail);
authRouter.post('/resend-verification', resendVerification);
authRouter.post('/forgot-password', forgotPassword);
authRouter.post('/reset-password', resetPassword);
authRouter.get('/me', authorize, getMe);

authRouter.get('/oauth-token', (req, res) => {
  const token = req.cookies?.hakia_oauth_token;
  if (!token) return res.status(401).json({ success: false, error: 'No OAuth token' });
  res.clearCookie('hakia_oauth_token');
  res.json({ success: true, data: { token } });
});

authRouter.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

authRouter.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  googleCallback
);

export default authRouter;
