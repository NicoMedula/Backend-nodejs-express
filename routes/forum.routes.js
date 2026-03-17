import { Router } from 'express';
import authorize from '../middlewares/auth.middleware.js';
import {
  getPosts,
  getPost,
  createPost,
  deletePost,
  createReply,
  deleteReply,
} from '../controllers/forum.controller.js';

const forumRouter = Router();

forumRouter.get('/posts', authorize, getPosts);
forumRouter.get('/posts/:id', authorize, getPost);
forumRouter.post('/posts', authorize, createPost);
forumRouter.delete('/posts/:id', authorize, deletePost);

forumRouter.post('/posts/:id/replies', authorize, createReply);
forumRouter.delete('/posts/:id/replies/:replyId', authorize, deleteReply);

export default forumRouter;
