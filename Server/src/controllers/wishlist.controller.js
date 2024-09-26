const bookModel = require('../models/Book');
const wishlistModel = require('../models/wishlist.model');
const { catchAsync } = require('../utils/catchAsync');

exports.addToWishlist = catchAsync(async (req, res, next) => {
    if (!req.user.id) {
        return res
            .status(401)
            .json({ status: 'FAIL', data: { message: 'You do not have permission to add to wishlist' } });
    }

    const { wishlistItems } = req.body;

    let wishlist = await wishlistModel.findOne({ orderBy: req.user.id });

    if (!wishlist) {
        wishlist = new wishlistModel({
            orderBy: req.user.id,
            wishlistItems: [],
            totalQuantity: 0,
        });
    }

    for (const wishlistItemData of wishlistItems) {
        const bookId = wishlistItemData.bookId;

        const existingWishlistItem = wishlist.wishlistItems.find((item) => item.bookId.equals(bookId));

        if (!existingWishlistItem) {
            const book = await bookModel.findById(bookId);

            if (!book) {
                return res.status(404).json({ status: 'FAIL', data: { message: `Book with ID ${bookId} not found` } });
            }

            wishlist.wishlistItems.push({
                bookId: book._id,
            });

            wishlist.totalQuantity += 1;
        }
    }

    await wishlist.save();

    res.status(200).json({
        status: 'SUCCESS',
        data: { message: 'Books added to wishlist successfully', wishlist },
    });
});

exports.getUserWishlist = catchAsync(async (req, res, next) => {
    // Find the user's cart and populate all details of the books
    const cart = await wishlistModel.findOne({ orderBy: req.user.id }).populate({
        path: 'wishlistItems.bookId',
        model: 'Book',
    });

    if (!cart) {
        return res.status(404).json({ error: 'Wishlist not found' });
    }

    res.status(200).json({ status: 'success', message: 'User Wishlist retrieved successfully', cart });
});

exports.removeItemFromWishlist = catchAsync(async (req, res, next) => {
    if (!req.user.id) {
        return res
            .status(401)
            .json({ status: 'FAIL', data: { message: 'You do not have permission to remove from wishlist' } });
    }

    const { bookId } = req.params;

    const wishlist = await wishlistModel.findOne({ orderBy: req.user.id });

    if (!wishlist) {
        return res.status(404).json({ status: 'FAIL', data: { message: 'Wishlist not found for the user' } });
    }

    const existingItemIndex = wishlist.wishlistItems.findIndex((item) => item.bookId.equals(bookId));

    if (existingItemIndex === -1) {
        return res.status(404).json({ status: 'FAIL', data: { message: 'Book not found in the wishlist' } });
    }

    wishlist.wishlistItems.splice(existingItemIndex, 1);
    wishlist.totalQuantity = Math.max(0, wishlist.totalQuantity - 1);

    await wishlist.save();

    res.status(200).json({
        status: 'SUCCESS',
        data: { message: 'Book removed from wishlist successfully', wishlist },
    });
});

exports.clearWishlist = catchAsync(async (req, res, next) => {
    const deletedWishlist = await wishlistModel.deleteOne({ orderBy: req.user.id });

    if (!deletedWishlist.deletedCount) {
        return res.status(404).json({ error: 'wishlist not found' });
    }

    res.status(200).json({ status: 'success', message: 'wishlist cleared successfully' });
});
