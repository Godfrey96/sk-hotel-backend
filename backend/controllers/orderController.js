import asyncHandler from 'express-async-handler';
import OrderItem from '../models/order-itemModel.js';
import Order from '../models/orderModel.js';
import Room from '../models/roomModel.js';
import Stripe from 'stripe';

// const stripe = new Stripe(process.env.STRIPE_KEY);
const stripe = new Stripe('sk_test_51JjjPCF3RlIhoq4AkOwHSs7EN8fr0t4lBuf3AvPCdgI3zGEgtf4k6rCTYcyOtyoDvX27ibOBQXeSbiNE5SzygoCl00a2iE3MGU');

// Create new order
const createOrder = asyncHandler(async (req, res) => {
    const orderItemsIds = Promise.all(req.body.orderItems.map(async orderItem => {
        let newOrderItem = new OrderItem({
            quantity: orderItem.quantity,
            fromDate: orderItem.fromDate,
            toDate: orderItem.toDate,
            room: orderItem.room
        });

        newOrderItem = await newOrderItem.save();

        return newOrderItem._id;
    }));
    const orderItemsIdsResolved = await orderItemsIds;

    const totalPrices = await Promise.all(orderItemsIdsResolved.map(async (orderItemId) => {
        const orderItem = await OrderItem.findById(orderItemId).populate('room', 'price');
        const totalPrice = orderItem.room.price * orderItem.quantity;
        return totalPrice;
    }))

    const totalPrice = totalPrices.reduce((a, b) => a + b, 0);

    let order = new Order({
        orderItems: orderItemsIdsResolved,
        status: req.body.status,
        totalPrice: totalPrice,
        fromDate: req.body.fromDate,
        toDate: req.body.toDate,
        user: req.body.user
    });

    order = await order.save();

    if (!order) {
        return res.status(400).send('the order cannot be created!');
    }
    res.send(order);
});

// Get all orders
const getOrders = asyncHandler(async (req, res) => {
    const orderList = await Order.find().populate('user', 'firstname').sort({ 'dateOrdered': -1 })

    if (!orderList) {
        res.status(500).json({ success: false })
    }
    res.send(orderList)
})

// Get single order
const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate('user', 'firstname lastname phone')
        .populate({
            path: 'orderItems', populate: {
                path: 'room', populate: 'category'
            }
        })

    if (!order) {
        res.status(500).json({ message: 'The order with the given ID was not found' })
    }
    res.status(200).send(order)
})

// Create a checkout session
const createCheckoutSession = asyncHandler(async (req, res) => {
    const orderItems = req.body;

    if (!orderItems) {
        return res.status(400).send('checkout session cannot be created - check the order items')
    }

    const lineItems = await Promise.all(
        orderItems.map(async (orderItem) => {
            const room = await Room.findById(orderItem.room);
            return {
                price_data: {
                    currency: 'zar',
                    room_data: {
                        name: room.name
                    },
                    unit_amount: room.price * 100
                },
                quantity: orderItem.quantity,
                // adults: orderItem.adults,
                // children: orderItem.children,
            };
        })
    );

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: 'http://localhost:4200/success',
        cancel_url: 'http://localhost:4200/error'
    })

    res.json({ id: session.id });
})

// Update an existing order
const updateOrder = asyncHandler(async (req, res) => {
    const order = await Order.findByIdAndUpdate(req.params.id, {
        status: req.body.status
    },
        { new: true }
    )
    if (!order) {
        return res.status(404).send('the order cannot be updated!');
    }
    res.send(order)
})

// Delete order
const deleteOrder = asyncHandler(async (req, res) => {
    Order.findByIdAndRemove(req.params.id).then(async order => {
        if (order) {
            await order.orderItems.map(async orderItem => {
                await OrderItem.findByIdAndRemove(orderItem)
            })
            return res.status(200).json({ success: true, message: 'the order is deleted' });
        } else {
            return res.status(404).json({ success: false, message: 'order not found' })
        }
    }).catch(err => {
        return res.status(400).json({ success: false, error: err })
    })
})

// Get a total sales
const getTotalSales = asyncHandler(async (req, res) => {
    const totalSales = await Order.aggregate([
        { $group: { _id: null, totalsales: { $sum: '$totalPrice' } } }
    ])

    if (!totalSales) {
        return res.status(400).send('The order sales cannot be generated')
    }

    res.send({ totalsales: totalSales.pop().totalsales })
})

// Get order count
const GetOrderCount = asyncHandler(async (req, res) => {
    const orderCount = await Order.countDocuments({})

    if (!orderCount) {
        res.status(500).json({ success: false })
    }
    res.send({
        orderCount: orderCount
    })
})

// Get all users order
const getUserOrders = asyncHandler(async (req, res) => {
    const userOrderList = await Order.find({ user: req.params.userid })
        .populate({
            path: 'orderItems', populate: {
                path: 'room', populate: 'category'
            }
        })
        .sort({ 'dateOrdered': -1 })

    if (!userOrderList) {
        res.status(500).json({ success: false })
    }
    res.send(userOrderList)
})

export {
    createOrder,
    getOrders,
    getOrderById,
    createCheckoutSession,
    updateOrder,
    deleteOrder,
    getTotalSales,
    GetOrderCount,
    getUserOrders
}