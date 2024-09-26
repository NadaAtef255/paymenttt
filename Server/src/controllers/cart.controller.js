const bookModel = require('../models/Book');
const cartModel = require('../models/cartModel');
const { catchAsync } = require('../utils/catchAsync');

exports.addToCart = catchAsync(async (req, res, next) => {
    if (!req.user.id) {
        return res
            .status(401)
            .json({ status: 'FAIL', data: { message: 'You do not have permission to add to the cart' } });
    }
    const { cartItems } = req.body;

    // Get the user's cart or create a new one if it doesn't exist
    let cart = await cartModel.findOne({ userId: req.user.id });
    if (!cart) {
        cart = new cartModel({
            userId: req.user.id,
            cartItems: [],
            totalPrice: 0,
            totalQuantity: 0,
        });
    }

    // Iterate over each book in the request and add it to the cart
    for (const cartItemData of cartItems) {
        const bookId = cartItemData.bookId;

        // Check if the book is already in the cart
        const existingCartItem = cart.cartItems.find((item) => item.bookId.equals(bookId));

        if (!existingCartItem) {
            // If the book is not in the cart, retrieve book details
            const book = await bookModel.findById(bookId);

            if (!book) {
                return res.status(404).json({ error: `Book with ID ${bookId} not found` });
            }

            // Add the book to the cart with a quantity of 1
            cart.cartItems.push({
                bookId: book._id,
                quantity: 1,
            });

            // Update cart totals
            cart.totalPrice += book.bookPrice;
            cart.totalQuantity += 1; // Increment total quantity by 1 for each book
        }
    }

    // Save the updated cart
    await cart.save();

    res.status(200).json({ status: 'success', message: 'Books added to cart successfully', cart });
});

exports.getUserCart = catchAsync(async (req, res, next) => {
    // Find the user's cart and populate all details of the books
    const cart = await cartModel.findOne({ userId: req.user.id }).populate({
        path: 'cartItems.bookId',
        model: 'Book',
    });

    // Check if the cart exists
    if (!cart) {
        return res.status(404).json({ error: 'Cart not found' });
    }

    res.status(200).json({ status: 'success', message: 'User cart retrieved successfully', cart });
});
exports.getAllCarts = catchAsync(async (req, res, next) => {
    // Find all carts and populate the userId field
    const carts = await cartModel.find().populate({
        path: 'userId',
        model: 'User',
    });

    // Check if any carts exist
    if (carts.length === 0) {
        return res.status(404).json({ error: 'Carts not found' });
    }

    res.status(200).json({ status: 'success', carts });
});

exports.removeItemFromCart = catchAsync(async (req, res, next) => {
    const { bookId } = req.params;

    // Find the user's cart
    const cart = await cartModel.findOne({ userId: req.user.id });

    // Check if the cart exists
    if (!cart) {
        return res.status(404).json({ error: 'Cart not found' });
    }

    // Find the index of the item in the cartItems array
    const itemIndex = cart.cartItems.findIndex((item) => item.bookId.toString() === bookId);

    // Check if the item is in the cart
    if (itemIndex === -1) {
        return res.status(404).json({ error: 'Item not found in the cart' });
    }

    // Get the removed item details before removing it
    const removedItem = cart.cartItems[itemIndex];

    // Retrieve book details using bookId
    const book = await bookModel.findById(removedItem.bookId);

    // Remove the item from the cart
    cart.cartItems.splice(itemIndex, 1);

    // Update cart totals
    cart.totalPrice -= removedItem.quantity * book.bookPrice;
    cart.totalQuantity -= removedItem.quantity;

    // Ensure totalPrice is a number
    cart.totalPrice = isNaN(cart.totalPrice) ? 0 : cart.totalPrice;

    // Save the updated cart
    await cart.save();

    res.status(200).json({ status: 'success', message: 'Item removed from cart successfully', cart });
});

exports.clearCart = catchAsync(async (req, res, next) => {
    // Find the user's cart and delete it
    const deletedCart = await cartModel.deleteOne({ userId: req.user.id });

    // Check if the cart was deleted
    if (!deletedCart.deletedCount) {
        return res.status(404).json({ error: 'Cart not found' });
    }

    res.status(200).json({ status: 'success', message: 'Cart cleared successfully' });
});
