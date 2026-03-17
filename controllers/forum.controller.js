import prisma from '../database/prisma.js';

export const getPosts = async (req, res, next) => {
  try {
    const { category, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = category ? { category } : {};

    const [posts, total] = await Promise.all([
      prisma.forumPost.findMany({
        where,
        include: {
          user: { select: { id: true, profile: { select: { fullName: true, avatarUrl: true } } } },
          _count: { select: { replies: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.forumPost.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: posts,
      meta: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

export const getPost = async (req, res, next) => {
  try {
    const post = await prisma.forumPost.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { id: true, profile: { select: { fullName: true, avatarUrl: true } } } },
        replies: {
          include: {
            user: { select: { id: true, profile: { select: { fullName: true, avatarUrl: true } } } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!post) {
      const error = new Error('Post not found');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
};

export const createPost = async (req, res, next) => {
  try {
    const { title, content, category } = req.body;

    const post = await prisma.forumPost.create({
      data: {
        title,
        content,
        category: category || 'general',
        userId: req.user.id,
      },
      include: {
        user: { select: { id: true, profile: { select: { fullName: true, avatarUrl: true } } } },
      },
    });

    req.io?.emit('forum:newPost', post);
    res.status(201).json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
};

export const deletePost = async (req, res, next) => {
  try {
    const post = await prisma.forumPost.findUnique({ where: { id: req.params.id } });

    if (!post) {
      const error = new Error('Post not found');
      error.statusCode = 404;
      throw error;
    }

    const isOwner = post.userId === req.user.id;
    const isAdmin = req.user.profile.role === 'admin';

    if (!isOwner && !isAdmin) {
      const error = new Error('Not authorized to delete this post');
      error.statusCode = 403;
      throw error;
    }

    await prisma.forumPost.delete({ where: { id: req.params.id } });
    req.io?.emit('forum:postDeleted', { id: req.params.id });
    res.status(200).json({ success: true, message: 'Post deleted' });
  } catch (error) {
    next(error);
  }
};

export const createReply = async (req, res, next) => {
  try {
    const { content } = req.body;

    const postExists = await prisma.forumPost.findUnique({ where: { id: req.params.id } });
    if (!postExists) {
      const error = new Error('Post not found');
      error.statusCode = 404;
      throw error;
    }

    const reply = await prisma.forumReply.create({
      data: {
        content,
        postId: req.params.id,
        userId: req.user.id,
      },
      include: {
        user: { select: { id: true, profile: { select: { fullName: true, avatarUrl: true } } } },
      },
    });

    req.io?.emit('forum:newReply', reply);
    res.status(201).json({ success: true, data: reply });
  } catch (error) {
    next(error);
  }
};

export const deleteReply = async (req, res, next) => {
  try {
    const reply = await prisma.forumReply.findUnique({ where: { id: req.params.replyId } });

    if (!reply) {
      const error = new Error('Reply not found');
      error.statusCode = 404;
      throw error;
    }

    const isOwner = reply.userId === req.user.id;
    const isAdmin = req.user.profile.role === 'admin';

    if (!isOwner && !isAdmin) {
      const error = new Error('Not authorized to delete this reply');
      error.statusCode = 403;
      throw error;
    }

    await prisma.forumReply.delete({ where: { id: req.params.replyId } });
    req.io?.emit('forum:replyDeleted', { id: req.params.replyId, postId: reply.postId });
    res.status(200).json({ success: true, message: 'Reply deleted' });
  } catch (error) {
    next(error);
  }
};
