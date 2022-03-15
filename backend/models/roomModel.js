import mongoose from 'mongoose';

const roomSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: ''
    },
    images: [{
        type: String,
        default: ''
    }],
    price: {
        type: Number,
        default: 0
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    countInStock: {
        type: Number,
        required: true,
        min: 0,
        max: 255
    },
    fromDate: {
        type: Date,
        reqired: true
    },
    toDate: {
        type: Date,
        required: true
    },
    dateCreated: {
        type: Date,
        default: Date.now
    }
})

roomSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

roomSchema.set('toJSON', {
    virtuals: true,
});

const Room = mongoose.model('Room', roomSchema);

export default Room