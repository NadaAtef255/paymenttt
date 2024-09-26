const { Schema, Types, model } = require('mongoose');

const CartSchema = new Schema({
    userId: { type: Types.ObjectId, ref: 'User' },
    items: [
        {
            bookTitle: String,
            bookPrice: String,
            bookImage: String,
        },
    ],
});
const cartModel = model('Cart', CartSchema);
module.exports = cartModel;
