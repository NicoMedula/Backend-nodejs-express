import { PrismaClient } from '@prisma/client';
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const ADMIN_EMAIL = 'hakteamia@gmail.com';

async function main() {
  const existing = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });

  if (existing) {
    await prisma.profile.update({
      where: { userId: existing.id },
      data: { role: 'admin' },
    });
    console.log(`Admin role confirmed for ${ADMIN_EMAIL}`);
  } else {
    const randomPassword = crypto.randomBytes(24).toString('base64url');
    const hashedPassword = await bcrypt.hash(randomPassword, 10);
    await prisma.user.create({
      data: {
        email: ADMIN_EMAIL,
        password: hashedPassword,
        emailVerified: true,
        profile: {
          create: {
            fullName: 'Hakia Admin',
            role: 'admin',
          },
        },
      },
    });
    console.log(`Admin created: ${ADMIN_EMAIL} (use Google OAuth or forgot-password to set password)`);
  }

  await prisma.profile.updateMany({
    where: {
      role: 'admin',
      user: { email: { not: ADMIN_EMAIL } },
    },
    data: { role: 'student' },
  });

  console.log('All non-admin users set to student role');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
