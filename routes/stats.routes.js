import { Router } from 'express';
import authorize from '../middlewares/auth.middleware.js';
import authorizeRole from '../middlewares/role.middleware.js';
import { getAdminStats } from '../controllers/stats.controller.js';

const statsRouter = Router();

statsRouter.get('/', authorize, authorizeRole('admin'), getAdminStats);

export default statsRouter;
