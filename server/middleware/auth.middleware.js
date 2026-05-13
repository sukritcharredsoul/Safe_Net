import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const authMiddleware = async (req, res, next) => {
    try {
        let token;

        // 1. Extract token
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer')) {
            token = authHeader.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                message: 'Unauthorized: No token provided'
            });
        }

        // 2. Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. Fetch user (exclude sensitive fields)
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({
                message: 'Unauthorized: User not found'
            });
        }

        // 4. Attach user to request
        req.user = user;

        next();

    } catch (error) {
        // Token expired / invalid
        return res.status(401).json({
            message: 'Unauthorized: Invalid or expired token'
        });
    }
};

export default authMiddleware;