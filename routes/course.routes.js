import { Router } from 'express';
import authorize from '../middlewares/auth.middleware.js';
import authorizeRole from '../middlewares/role.middleware.js';
import {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollInCourse,
  getCourseEnrollments,
  createMaterial,
  updateMaterial,
  deleteMaterial,
} from '../controllers/course.controller.js';

const courseRouter = Router();

courseRouter.get('/', authorize, getCourses);
courseRouter.get('/:id', authorize, getCourse);
courseRouter.post('/', authorize, authorizeRole('admin'), createCourse);
courseRouter.put('/:id', authorize, authorizeRole('admin'), updateCourse);
courseRouter.delete('/:id', authorize, authorizeRole('admin'), deleteCourse);

courseRouter.post('/:id/enroll', authorize, authorizeRole('student'), enrollInCourse);
courseRouter.get('/:id/enrollments', authorize, authorizeRole('admin'), getCourseEnrollments);

courseRouter.post('/:id/materials', authorize, authorizeRole('admin'), createMaterial);
courseRouter.put('/:id/materials/:materialId', authorize, authorizeRole('admin'), updateMaterial);
courseRouter.delete('/:id/materials/:materialId', authorize, authorizeRole('admin'), deleteMaterial);

export default courseRouter;
