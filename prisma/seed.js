import { PrismaClient } from '@prisma/client';
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
    const hashedPassword = await bcrypt.hash('changeme123', 10);
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
    console.log(`Admin created: ${ADMIN_EMAIL} (password: changeme123 — change it!)`);
  }

  // Ensure no other user is admin
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
