import mongoose from 'mongoose';

const categorySchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    dateCreated: {
        type: Date,
        default: Date.now
    }
})

categorySchema.virtual('id').get(function () {
    return this._id.toHexString();
});

categorySchema.set('toJSON', {
    virtuals: true,
});

const Category = mongoose.model('Category', categorySchema);

export default Category