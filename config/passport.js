import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, SERVER_URL } from './env.js';
import prisma from '../database/prisma.js';

const ADMIN_EMAIL = 'hakteamia@gmail.com';

if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: `${SERVER_URL}/api/v1/auth/google/callback`,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) return done(new Error('No email from Google'), null);

          let user = await prisma.user.findUnique({
            where: { email },
            include: { profile: true },
          });

          const role = email === ADMIN_EMAIL ? 'admin' : 'student';

          if (!user) {
            user = await prisma.user.create({
              data: {
                email,
                googleId: profile.id,
                provider: 'google',
                emailVerified: true,
                profile: {
                  create: {
                    fullName: profile.displayName || email.split('@')[0],
                    avatarUrl: profile.photos?.[0]?.value || null,
                    role,
                  },
                },
              },
              include: { profile: true },
            });
          } else if (!user.googleId) {
            const googleAvatar = profile.photos?.[0]?.value || null;
            user = await prisma.user.update({
              where: { id: user.id },
              data: { googleId: profile.id, emailVerified: true },
              include: { profile: true },
            });

            if (googleAvatar && !user.profile?.avatarUrl) {
              await prisma.profile.update({
                where: { userId: user.id },
                data: { avatarUrl: googleAvatar },
              });
              user = await prisma.user.findUnique({
                where: { id: user.id },
                include: { profile: true },
              });
            }
          }

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
}

export default passport;
