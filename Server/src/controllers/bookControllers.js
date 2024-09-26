const bookModel = require('../models/Book');
const dataurl = require('dataurl');
const { uploadToCloudinary, removeFromCloudinary } = require('../services/cloudinary');
const categoryModel = require('../models/category.model');
const { catchAsync } = require('../utils/catchAsync');

// Cloudinary
const cloudinary = require('cloudinary').v2;
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
//
exports.addBook = catchAsync(async (req, res, next) => {
    const { bookTitle, bookPrice, Author, category, publisherName, bookDescription, user, discount } = req.body;
    const foundedBook = await bookModel.findOne({ bookTitle });
    if (foundedBook) {
        return res.status(400).json({
            status: 'ERROR',
            message: 'Book with the same name already exists',
        });
    }
    if (!req.files) {
        // Upload image to Cloudinary
        return res.status(400).json({ status: 'error', message: 'Must add image' });
    }

    // Calculate price after discount if discount is provided
    let priceAfterDiscount = bookPrice; // Default price after discount is same as book price
    if (discount && discount >= 0 && discount <= 100) {
        const discountAmount = (bookPrice * discount) / 100;
        priceAfterDiscount = bookPrice - discountAmount;
    }
    const originalFile = req.files.bookPdf[0].originalname;
    const name = originalFile.slice(0, originalFile.indexOf('.'));
    console.log(name);
    const bookPdfDataUrlString = dataurl.format({
        data: req.files.bookPdf[0].buffer,
        mimetype: req.files.bookPdf[0].mimetype,
    });

    const bookImageDataUrlString = dataurl.format({
        data: req.files.bookImage[0].buffer,
        mimetype: req.files.bookImage[0].mimetype,
    });
    const uploadedBookImage = await uploadToCloudinary(bookImageDataUrlString, 'book image');
    const uploadedBookPdf = await cloudinary.uploader.upload(bookPdfDataUrlString, {
        // transformation: { flags: attachment:${name}, fetch_format: 'auto' },
        format: 'pdf',
        access_mode: 'public',
    });
    const newBook = new bookModel({
        bookTitle,
        bookPrice,
        Author,
        user,
        discount,
        priceAfterDiscount,
        ['bookImage.url']: uploadedBookImage.secure_url,
        ['bookImage.public_id']: uploadedBookImage.public_id,
        ['bookPdf.url']: uploadedBookPdf.secure_url,
        ['bookPdf.public_id']: uploadedBookPdf.public_id,
        category,
        publisherName,
        bookDescription,
    });

    const savedBook = await newBook.save();
    res.status(201).json(savedBook);
});
exports.deleteBook = catchAsync(async (req, res, next) => {
    console.log('from delete');
    const bookId = req.params.bookId;
    const book = await bookModel.findById(bookId);
    console.log(book);
    if (!book) {
        return res.status(404).json({ status: 'error', data: { message: 'book not found' } });
    }
    // Remove the book image from Cloudinary
    const deleteResult = await removeFromCloudinary(book.bookImage);

    console.log('Cloudinary delete result:', deleteResult);

    await bookModel.findByIdAndDelete(bookId);

    res.status(200).json({ status: 'Deleted Succefully', data: null });
});
exports.searchBooksByPrice = catchAsync(async (req, res, next) => {
    const { minPrice, maxPrice } = req.query;

    // Query books based on the price range
    const books = await bookModel.find({
        bookPrice: { $gte: minPrice, $lte: maxPrice },
    });

    res.status(200).json({ status: 'Done', data: { books } });
});
exports.getRecentBooks = catchAsync(async (req, res, next) => {
    const recentBooks = await bookModel.find({ isRecent: true });
    res.status(200).json({ status: 'Done', data: { recentBooks } });
});
exports.getBookById = catchAsync(async (req, res) => {
    const bookId = req.params.bookId;

    // Find the book by its ID
    const book = await bookModel.findById(bookId);

    // If book is not found, return error
    if (!book) {
        return res.status(404).json({ status: 'error', data: { message: 'Book not found' } });
    }

    // If book is found, return it in the response
    res.status(200).json({ status: 'Done', data: { book } });
});
exports.getBook = catchAsync(async (req, res, next) => {
    const bookId = req.params.id;

    // Find the book by its ID
    const book = await bookModel.findById(bookId);

    // If book is not found, return error
    if (!book) {
        return res.status(404).json({ status: 'error', data: { message: 'Book not found' } });
    }

    // If book is found, return it in the response
    res.status(200).json({ status: 'Done', data: { book } });
});
exports.getAllBooks = catchAsync(async (req, res, next) => {
    const query = req.query;
    console.log('query', query);
    const limit = query.limit || 30;
    const page = query.page || 1;
    const skip = (page - 1) * limit;

    const allBooks = await bookModel
        .find({}, { __v: false })
        .populate('category') // Populate the category field
        .limit(limit)
        .skip(skip);

    res.status(200).json({ status: 'Done', data: { allBooks } });
});

exports.getCategoryWithBook = catchAsync(async (req, res, next) => {
    const categoryId = req.params.categoryId;

    // Find the category by its ID
    const category = await categoryModel.findById(categoryId);

    if (!category) {
        return res.status(404).json({ status: 'FAIL', data: { message: 'Category not found' } });
    }

    // Find all products in the given category and populate the "category" field
    const allCategoryProducts = await bookModel.find({ category: categoryId }).populate('category');

    res.status(200).json({ status: 'SUCCESS', data: { allCategoryProducts } });
});
exports.updateBook = catchAsync(async (req, res, next) => {
    const bookId = req.params.bookId;
    const { bookTitle, bookPrice, Author, category, publisherName, bookDescription, user, discount } = req.body;

    // Check if the book exists
    const book = await bookModel.findById(bookId);
    if (!book) {
        return res.status(404).json({ status: 'error', message: 'Book not found' });
    }

    // Update the fields that are provided in the request body
    if (bookTitle) book.bookTitle = bookTitle;
    if (bookPrice) book.bookPrice = bookPrice;
    if (Author) book.Author = Author;
    if (category) book.category = category;
    if (publisherName) book.publisherName = publisherName;
    if (bookDescription) book.bookDescription = bookDescription;
    if (user) book.user = user;

    // Calculate price after discount if discount is provided
    if (discount && discount >= 0 && discount <= 100) {
        const discountAmount = (book.bookPrice * discount) / 100;
        book.discount = discount;
        book.priceAfterDiscount = book.bookPrice - discountAmount;
    }

    // Handle bookPdf and bookImage updates
    if (req.files) {
        if (req.files.bookPdf) {
            const bookPdfDataUrlString = dataurl.format({
                data: req.files.bookPdf[0].buffer,
                mimetype: req.files.bookPdf[0].mimetype,
            });
            const uploadedBookPdf = await uploadToCloudinary(bookPdfDataUrlString, 'pdf');
            book['bookPdf.url'] = uploadedBookPdf.secure_url;
            book['bookPdf.public_id'] = uploadedBookPdf.public_id;
        }
        if (req.files.bookImage) {
            const bookImageDataUrlString = dataurl.format({
                data: req.files.bookImage[0].buffer,
                mimetype: req.files.bookImage[0].mimetype,
            });
            const uploadedBookImage = await uploadToCloudinary(bookImageDataUrlString, 'book image');
            book['bookImage.url'] = uploadedBookImage.secure_url;
            book['bookImage.public_id'] = uploadedBookImage.public_id;
        }
    }

    // Save the updated book
    const updatedBook = await book.save();

    res.status(200).json({ status: 'success', data: updatedBook });
});

exports.getCategoriesWithBookCount = catchAsync(async (req, res, next) => {
    const categoriesWithBookCount = await categoryModel.aggregate([
        {
            $lookup: {
                from: 'books',
                localField: '_id',
                foreignField: 'category',
                as: 'books',
            },
        },
        {
            $project: {
                categoryName: 1,
                booksCount: { $size: '$books' },
            },
        },
    ]);

    if (!categoriesWithBookCount.length) {
        return res.status(404).json({ status: 'error', message: 'No categories found' });
    }

    res.status(200).json({ status: 'success', data: categoriesWithBookCount });
});
exports.getProductByKey = catchAsync(async function (req, res, next) {
    const { key } = req.params;
    const data = await bookModel.find({ bookTitle: { $regex: key, $options: 'i' } }); // Search by bookTitle using regex (case-insensitive)
    if (!data.length) {
        return res.status(404).send('Unable to find');
    }
    return res.send(data);
});
