import express from 'express';
import {
    createOrder,
    getOrders,
    getOrderById,
    createCheckoutSession,
    updateOrder,
    deleteOrder,
    getTotalSales,
    GetOrderCount,
    getUserOrders
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router();

router
    .route('/')
    .post(createOrder)
    .get(getOrders)

router.route('/create-checkout-session').post(createCheckoutSession)

router
    .route('/get/totalsales')
    .get(getTotalSales)

router
    .route('/get/count')
    .get(GetOrderCount)

router
    .route('/:id')
    .get(getOrderById)
    .put(updateOrder)
    .delete(deleteOrder)

router
    .route('/get/userorders/:userid')
    .get(getUserOrders)

// router
//     .route('/')
//     .post(protect, createOrder)
//     .get(protect, admin, getOrders)

// router.route('/create-checkout-session').post(protect, createCheckoutSession)

// router
//     .route('/get/totalsales')
//     .get(protect, admin, getTotalSales)

// router
//     .route('/get/count')
//     .get(protect, admin, GetOrderCount)

// router
//     .route('/:id')
//     .get(protect, admin, getOrderById)
//     .put(protect, admin, updateOrder)
//     .delete(protect, admin, deleteOrder)

// router
//     .route('/get/userorders/:userid')
//     .get(protect, admin, getUserOrders)

export default router