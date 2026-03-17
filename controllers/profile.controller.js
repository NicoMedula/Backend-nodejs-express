import prisma from '../database/prisma.js';

export const getProfile = async (req, res, next) => {
  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: req.user.id },
    });

    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { fullName, description, occupation, avatarUrl } = req.body;

    if (!fullName || fullName.trim().length === 0) {
      const error = new Error('Full name is required');
      error.statusCode = 400;
      throw error;
    }

    const profile = await prisma.profile.update({
      where: { userId: req.user.id },
      data: {
        fullName,
        description,
        occupation,
        avatarUrl,
      },
    });

    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};
