import mongoose from 'mongoose'

const orderItemSchema = mongoose.Schema({
    quantity: {
        type: Number,
        required: true
    },
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room'
    }
})

const OrderItem = mongoose.model('OrderItem', orderItemSchema)

export default OrderItem