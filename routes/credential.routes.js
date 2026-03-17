import { Router } from 'express';
import authorize from '../middlewares/auth.middleware.js';
import authorizeRole from '../middlewares/role.middleware.js';
import {
  getCredentials,
  getCredential,
  createCredential,
  updateCredential,
  deleteCredential,
} from '../controllers/credential.controller.js';

const credentialRouter = Router();

credentialRouter.get('/', authorize, getCredentials);
credentialRouter.get('/:id', authorize, getCredential);
credentialRouter.post('/', authorize, authorizeRole('admin'), createCredential);
credentialRouter.put('/:id', authorize, authorizeRole('admin'), updateCredential);
credentialRouter.delete('/:id', authorize, authorizeRole('admin'), deleteCredential);

export default credentialRouter;
