import prisma from '../database/prisma.js';

const sanitizeForStudents = (cred) => ({
  id: cred.id,
  name: cred.name,
  description: cred.description,
  emailOrUser: cred.emailOrUser,
  passwordOrKey: cred.passwordOrKey,
  icon: cred.icon,
  orderIndex: cred.orderIndex,
  isActive: cred.isActive,
});

const sanitizeForEvents = (cred) => ({
  id: cred.id,
  name: cred.name,
  icon: cred.icon,
  isActive: cred.isActive,
});

export const getCredentials = async (req, res, next) => {
  try {
    const isAdmin = req.user.profile.role === 'admin';

    const credentials = await prisma.credential.findMany({
      where: isAdmin ? {} : { isActive: true },
      orderBy: { orderIndex: 'asc' },
    });

    res.status(200).json({ success: true, data: credentials });
  } catch (error) {
    next(error);
  }
};

export const getCredential = async (req, res, next) => {
  try {
    const credential = await prisma.credential.findUnique({
      where: { id: req.params.id },
    });

    if (!credential) {
      const error = new Error('Credential not found');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({ success: true, data: credential });
  } catch (error) {
    next(error);
  }
};

export const createCredential = async (req, res, next) => {
  try {
    const { name, description, emailOrUser, passwordOrKey, icon, orderIndex, isActive } = req.body;

    if (!name || name.trim().length === 0) {
      const error = new Error('Name is required');
      error.statusCode = 400;
      throw error;
    }

    const credential = await prisma.credential.create({
      data: { name: name.trim(), description, emailOrUser, passwordOrKey, icon, orderIndex, isActive },
    });

    req.io?.emit('credential:created', sanitizeForEvents(credential));
    res.status(201).json({ success: true, data: credential });
  } catch (error) {
    next(error);
  }
};

export const updateCredential = async (req, res, next) => {
  try {
    const { name, description, emailOrUser, passwordOrKey, icon, orderIndex, isActive } = req.body;

    const credential = await prisma.credential.update({
      where: { id: req.params.id },
      data: { name, description, emailOrUser, passwordOrKey, icon, orderIndex, isActive },
    });

    req.io?.emit('credential:updated', sanitizeForEvents(credential));
    res.status(200).json({ success: true, data: credential });
  } catch (error) {
    next(error);
  }
};

export const deleteCredential = async (req, res, next) => {
  try {
    await prisma.credential.delete({ where: { id: req.params.id } });
    req.io?.emit('credential:deleted', { id: req.params.id });
    res.status(200).json({ success: true, message: 'Credential deleted' });
  } catch (error) {
    next(error);
  }
};
