import asyncHandler from 'express-async-handler';
import generateToken from '../utils/generateToken.js';
import User from '../models/userModel.js';

// @desc Auth user/set token
// route POST /api/user/auth
// @access Public
const authUser = asyncHandler(async (req, res) => {
    /* to test the custom error middleware *
    res.status(401);
    throw new Error('Something went wrong');
    /* end of test */

    const { email, password } = req.body;

    const user = await User.findOne({ email }); // to find a single user that matches the specified value of the key

    if (user && (await user.matchPassword(password))) { // matchPassword is defined in userModel
        generateToken(res, user._id);

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});


// @desc Register a new user
// route POST /api/users
// @access Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });   // to find a single user that matches the specified value of the key

    if (userExists) {
        res.status(400);
        throw new Error('User already exists'); // will pass to the custom error middleware
    }

    const user = await User.create({
        name,
        email,
        password,
    });

    if (user) {
        // generate jwt using user._id and add it to the response cookie
        generateToken(res, user._id);

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});


// @desc Logout a user
// route POST /api/users/logout
// @access Public
const logoutUser = asyncHandler(async (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0),
    });

    res.status(200).json({ message: 'User logged out'});
});


// @desc Get user profile
// route GET /api/users/profile
// @access Private
const getUserProfile = asyncHandler(async (req, res) => {
    // req.user was defined in authMiddleware
    const user = {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
    };
    // console.log(req.user);

    res.status(200).json({ user });
});


// @desc Get user profile
// route PUT /api/users/profile
// @access Private
const updateUserProfile = asyncHandler(async (req, res) => {
    res.status(200).json({ message: 'Update User Profile'});
});

export {
    authUser,
    registerUser,
    logoutUser,
    getUserProfile,
    updateUserProfile,
};