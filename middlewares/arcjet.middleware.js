import aj from '../config/arcjet.js';
import { NODE_ENV } from '../config/env.js';

const arcjetMiddleware = async (req, res, next) => {
  if (NODE_ENV === 'development') return next();

  try {
    const decision = await aj.protect(req, { requested: 1 });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return res.status(429).json({ success: false, error: 'Too Many Requests' });
      }
      if (decision.reason.isBot()) {
        return res.status(403).json({ success: false, error: 'Forbidden' });
      }
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    next();
  } catch (error) {
    console.error(`Arcjet error: ${error.message}`);
    if (NODE_ENV === 'production') {
      return next();
    }
    next();
  }
};

export default arcjetMiddleware;
