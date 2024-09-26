const express = require('express');
const upload = require('../middleware/multer');
const {
    addBook,
    getAllBooks,
    deleteBook,
    updateBook,
    searchBooksByPrice,
    getBookById,
    getCategoryWithBook,
    getRecentBooks,
    getCategoriesWithBookCount,
    getBook,
    getProductByKey,
} = require('../controllers/bookControllers');
const bookRouter = express.Router();
bookRouter.get('/search/:key', getProductByKey); // Added route for searching by title

bookRouter.post(
    '/add',
    upload.fields([
        { name: 'bookPdf', maxCount: 1 },
        { name: 'bookImage', maxCount: 1 },
    ]),
    addBook
);
bookRouter.get('/AllBook', getAllBooks);
bookRouter.get('/AllBooksandcategories', getCategoriesWithBookCount);
bookRouter.get('/recent', getRecentBooks);
bookRouter.delete('/:bookId', deleteBook);
bookRouter.put(
    '/:bookId',
    upload.fields([
        { name: 'bookPdf', maxCount: 1 },
        { name: 'bookImage', maxCount: 1 },
    ]),
    updateBook
);
bookRouter.get('/search', searchBooksByPrice);
bookRouter.get('/:bookId', getBookById);
bookRouter.get('/:id', getBook);
bookRouter.get('/getAllBookInCategory/:categoryId', getCategoryWithBook);
module.exports = bookRouter;
