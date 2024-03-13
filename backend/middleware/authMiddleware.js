import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';

const protect  = asyncHandler(async (req, res, next) => {
    let token = req.cookies.jwt;    // it is allowed because we have cookie parser

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // decoded has userId because we use userId as payload when sign JWT in generateToken
            // "-password" ensures password will not be returned
            // req.user --> we want the info of user to be accessible everywhere, e.g. getUserProfile, etc.
            req.user = await User.findById(decoded.userId).select('-password');

            next();
        } catch (e) {
            res.status(401);
            throw new Error('Not authorized, invalid token');
        }
    } else {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});

// do not use default because we might need to add more middleware later, e.g. function to check if a user is an admin
export { protect };