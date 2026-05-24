import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protect = async (req, res, next) => {
  let token;

  // 1. Extract Bearer token from header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      
      // Find user and attach to request context (excluding hashed password)
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        res.status(401);
        throw new Error('User not found. Authorization denied.');
      }

      return next();
    } catch (error) {
      // Forward to centralized custom error handler
      return next(error);
    }
  }

  if (!token) {
    res.status(401);
    return next(new Error('Not authorized, token missing. Authorization denied.'));
  }
};

export default protect;
