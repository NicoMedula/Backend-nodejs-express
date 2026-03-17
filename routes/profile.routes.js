import { Router } from 'express';
import authorize from '../middlewares/auth.middleware.js';
import { getProfile, updateProfile } from '../controllers/profile.controller.js';

const profileRouter = Router();

profileRouter.get('/', authorize, getProfile);
profileRouter.put('/', authorize, updateProfile);

export default profileRouter;
