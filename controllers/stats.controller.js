import prisma from '../database/prisma.js';

export const getAdminStats = async (req, res, next) => {
  try {
    const [totalUsers, students, admins, courses, posts, credentials] = await Promise.all([
      prisma.user.count(),
      prisma.profile.count({ where: { role: 'student' } }),
      prisma.profile.count({ where: { role: 'admin' } }),
      prisma.course.count(),
      prisma.forumPost.count(),
      prisma.credential.count(),
    ]);

    res.status(200).json({
      success: true,
      data: { totalUsers, students, admins, courses, posts, credentials },
    });
  } catch (error) {
    next(error);
  }
};
