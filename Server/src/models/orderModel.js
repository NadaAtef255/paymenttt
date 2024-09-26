const { Schema, Types, model } = require('mongoose');

const OrderSchema = new Schema(
    {
        userId: {
            type: Types.ObjectId,
            ref: 'User',
        },
        // Stripe properties
        customerId: String,
        paymentIntentId: String,
        paymentStatus: {
            type: String,
        },
        cartItems: [
            {
                bookTitle: String,
                bookPrice: String,
            },
        ],
        totalPrice: Number,
        totalPriceAfterCoupon: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);
const orderModel = model('Order', OrderSchema);
module.exports = orderModel;
