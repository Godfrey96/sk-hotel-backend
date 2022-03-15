import mongoose from 'mongoose'

const orderSchema = mongoose.Schema({
    orderItems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrderItem',
        required: true
    }],
    status: {
        type: Number,
        required: true,
        default: 0
    },
    totalPrice: {
        type: Number
    },
    fromDate: {
        type: Date,
    },
    toDate: {
        type: Date,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    dateOrdered: {
        type: Date,
        default: Date.now
    }
})

orderSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

orderSchema.set('toJSON', {
    virtuals: true,
});

const Order = mongoose.model('Order', orderSchema)

export default Order