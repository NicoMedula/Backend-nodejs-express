import prisma from '../database/prisma.js';

export const getCourses = async (req, res, next) => {
  try {
    const isAdmin = req.user.profile.role === 'admin';

    const courses = await prisma.course.findMany({
      where: isAdmin ? {} : { status: 'active' },
      include: {
        _count: { select: { enrollments: true } },
        creator: { select: { id: true, email: true, profile: { select: { fullName: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ success: true, data: courses });
  } catch (error) {
    next(error);
  }
};

export const getCourse = async (req, res, next) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: req.params.id },
      include: {
        materials: { orderBy: { orderIndex: 'asc' } },
        _count: { select: { enrollments: true } },
        creator: { select: { id: true, profile: { select: { fullName: true } } } },
      },
    });

    if (!course) {
      const error = new Error('Course not found');
      error.statusCode = 404;
      throw error;
    }

    if (req.user.profile.role !== 'admin') {
      const enrolled = await prisma.courseEnrollment.findUnique({
        where: { courseId_userId: { courseId: course.id, userId: req.user.id } },
      });
      if (!enrolled) {
        const { materials, ...courseWithoutMaterials } = course;
        return res.status(200).json({ success: true, data: { ...courseWithoutMaterials, materials: [], enrolled: false } });
      }
    }

    res.status(200).json({ success: true, data: { ...course, enrolled: true } });
  } catch (error) {
    next(error);
  }
};

export const createCourse = async (req, res, next) => {
  try {
    const { title, description, accessCode, status } = req.body;

    const course = await prisma.course.create({
      data: {
        title,
        description,
        accessCode,
        status: status || 'draft',
        createdBy: req.user.id,
      },
    });

    req.io?.emit('course:created', course);
    res.status(201).json({ success: true, data: course });
  } catch (error) {
    next(error);
  }
};

export const updateCourse = async (req, res, next) => {
  try {
    const { title, description, accessCode, status } = req.body;

    const course = await prisma.course.update({
      where: { id: req.params.id },
      data: { title, description, accessCode, status },
    });

    req.io?.emit('course:updated', course);
    res.status(200).json({ success: true, data: course });
  } catch (error) {
    next(error);
  }
};

export const deleteCourse = async (req, res, next) => {
  try {
    await prisma.course.delete({ where: { id: req.params.id } });
    req.io?.emit('course:deleted', { id: req.params.id });
    res.status(200).json({ success: true, message: 'Course deleted' });
  } catch (error) {
    next(error);
  }
};

export const enrollInCourse = async (req, res, next) => {
  try {
    const { accessCode } = req.body;
    const course = await prisma.course.findUnique({ where: { id: req.params.id } });

    if (!course || course.status !== 'active') {
      const error = new Error('Course not found or not active');
      error.statusCode = 404;
      throw error;
    }

    if (course.accessCode !== accessCode) {
      const error = new Error('Invalid access code');
      error.statusCode = 403;
      throw error;
    }

    const enrollment = await prisma.courseEnrollment.create({
      data: {
        courseId: course.id,
        userId: req.user.id,
      },
    });

    req.io?.emit('enrollment:new', { courseId: course.id, userId: req.user.id });
    res.status(201).json({ success: true, data: enrollment });
  } catch (error) {
    next(error);
  }
};

export const getCourseEnrollments = async (req, res, next) => {
  try {
    const enrollments = await prisma.courseEnrollment.findMany({
      where: { courseId: req.params.id },
      include: {
        user: { select: { id: true, email: true, profile: { select: { fullName: true, avatarUrl: true } } } },
      },
      orderBy: { enrolledAt: 'desc' },
    });

    res.status(200).json({ success: true, data: enrollments });
  } catch (error) {
    next(error);
  }
};

export const createMaterial = async (req, res, next) => {
  try {
    const { title, type, url, orderIndex } = req.body;

    const material = await prisma.courseMaterial.create({
      data: {
        courseId: req.params.id,
        title,
        type: type || 'other',
        url,
        orderIndex: orderIndex || 0,
      },
    });

    req.io?.emit('material:added', material);
    res.status(201).json({ success: true, data: material });
  } catch (error) {
    next(error);
  }
};

export const updateMaterial = async (req, res, next) => {
  try {
    const { title, type, url, orderIndex } = req.body;

    const material = await prisma.courseMaterial.update({
      where: { id: req.params.materialId },
      data: { title, type, url, orderIndex },
    });

    req.io?.emit('material:updated', material);
    res.status(200).json({ success: true, data: material });
  } catch (error) {
    next(error);
  }
};

export const deleteMaterial = async (req, res, next) => {
  try {
    await prisma.courseMaterial.delete({ where: { id: req.params.materialId } });
    req.io?.emit('material:deleted', { id: req.params.materialId });
    res.status(200).json({ success: true, message: 'Material deleted' });
  } catch (error) {
    next(error);
  }
};
