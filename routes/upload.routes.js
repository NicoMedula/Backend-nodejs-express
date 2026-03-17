import { Router } from 'express';
import multer from 'multer';
import authorize from '../middlewares/auth.middleware.js';
import authorizeRole from '../middlewares/role.middleware.js';
import { uploadFile } from '../controllers/upload.controller.js';

const ALLOWED_MIMES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
  'application/pdf',
  'video/mp4', 'video/webm', 'video/quicktime',
];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIMES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed`), false);
    }
  },
});

const uploadRouter = Router();

uploadRouter.post('/', authorize, authorizeRole('admin'), upload.single('file'), uploadFile);

export default uploadRouter;
