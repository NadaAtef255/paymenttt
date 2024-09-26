const stripe = require('stripe')(process.env.STRIPE_KEY);
const orderModel = require('../models/orderModel');
const { catchAsync } = require('../utils/catchAsync');
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

exports.pay = catchAsync(async (req, res, next) => {
    const { cartItems } = req.body;
    const objectIdString = req.user._id.toString();
    const customer = await stripe.customers.create({
        metadata: {
            userId: objectIdString,
            cart: JSON.stringify(cartItems),
        },
    });
    const line_items = cartItems.map((item) => {
        return {
            price_data: {
                currency: 'egp',
                unit_amount: item.bookPrice * 100,
                product_data: {
                    name: item.bookTitle,
                },
            },
            quantity: 1,
        };
    });
    const session = await stripe.checkout.sessions.create({
        customer: customer.id,
        line_items,
        mode: 'payment',
        success_url: `${process.env.CLIENT_URL}/checkout-success`,
        cancel_url: `${process.env.CLIENT_URL}/order`,
    });
    res.send({ url: session.url, sessionID: session.id });
});

exports.webHookFn = catchAsync(async (req, res, next) => {
    const sig = req.headers['stripe-signature'];

    let data;

    let eventType;

    if (endpointSecret) {
        let event;
        try {
            event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
        } catch (err) {
            res.status(400).send(`Webhook Error: ${err.message}`);
            return;
        }
        data = event.data.object;
        eventType = event.type;
    } else {
        data = req.body.data.object;
        eventType = req.body.type;
    }

    // handle the event
    if (eventType === 'checkout.session.completed') {
        // Retrieve the customer's information from Stripe
        const customer = await stripe.customers.retrieve(data.customer);

        const cartItems = data.cartItems;

        let order = await orderModel.findOne({ userId: req.user._id });

        if (!order) {
            order = await orderModel.create({ userId: req.user._id, cartItems: [] });
        }

        order.customerId = customer.id;

        order.paymentIntentId = data.payment_intent;

        order.paymentStatus = 'unpaid';

        order.cartItems = cartItems;

        await order.save();
    }

    res.status(200).json();
});
