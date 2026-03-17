import { Router } from 'express';
import multer from 'multer';
import authorize from '../middlewares/auth.middleware.js';
import { uploadFile } from '../controllers/upload.controller.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const uploadRouter = Router();

uploadRouter.post('/', authorize, upload.single('file'), uploadFile);

export default uploadRouter;
