const bookModel = require('../models/Book');
const { catchAsync } = require('../utils/catchAsync');

exports.createReview = catchAsync(async (req, res, next) => {
    const { rating, comment } = req.body;

    const foundedBook = await bookModel.findById(req.params.id);

    if (!foundedBook) return res.status(404).json({ message: 'book not found' });

    const alreadyReviewed = foundedBook.reviews.find((r) => r.user.toString() === req.user._id.toString());

    if (alreadyReviewed) return res.status(400).json({ message: 'You have already reviewed' });

    const review = {
        name: req.user.userName,
        rating: Number(rating),
        comment,
        user: req.user._id,
    };

    foundedBook.reviews.push(review);

    foundedBook.numReviews = foundedBook.reviews.length;

    if (foundedBook.reviews && foundedBook.reviews.length > 0) {
        foundedBook.rating =
            foundedBook.reviews.reduce((acc, item) => item.rating + acc, 0) / foundedBook.reviews.length;
    }
    await foundedBook.save();

    res.status(201).json({ message: 'Review added', foundedBook });
});

exports.getProductReviews = catchAsync(async (req, res, next) => {
    const foundedBook = await bookModel.findById(req.params.id);

    if (!foundedBook) return res.status(404).json({ message: 'Book not founded' });

    const reviews = foundedBook.reviews;

    res.status(200).json({ reviews });
});
