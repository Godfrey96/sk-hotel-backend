import express from 'express';
import {
    registerUser,
    loginUser,
    updateUser,
    getUserById,
    getUsers,
    deleteUser,
    GetUserCount
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router()

router
    .route('/')
    .get(getUsers)
router
    .route('/:id')
    .get(getUserById)
    .put(updateUser)
    .delete(deleteUser)
router
    .route('/login')
    .post(loginUser)
router
    .route('/register')
    .post(registerUser)
router.route('/get/count').get(GetUserCount)

// router
//     .route('/')
//     .get(protect, admin, getUsers)
// router
//     .route('/:id')
//     .get(protect, admin, getUserById)
//     .put(protect, admin, updateUser)
//     .delete(protect, admin, deleteUser)
// router
//     .route('/login')
//     .post(loginUser)
// router
//     .route('/register')
//     .post(registerUser)
// router.route('/get/count').get(protect, admin, GetUserCount)

export default router