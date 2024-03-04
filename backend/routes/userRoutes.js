import express from 'express';
import {
    authUser,
    registerUser,
    logoutUser,
    getUserProfile,
    updateUserProfile,
} from '../controllers/userController.js';
const router = express.Router();

router.post('/auth', authUser);
router.post('/', registerUser);
router.post('/logout', logoutUser);

// getUserProfile and updateUserProfile share the same endpoint 
router.route('/profile').get(getUserProfile).put(updateUserProfile);

export default router;