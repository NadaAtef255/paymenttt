const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
    {
        categoryName: {
            type: String,
            enum: ['www', 'sss'],
            trim: true,
            unique: true,
        },
        categoryImage: {
            type: String,
        },
    },
    { timestamps: true }
);

const categoryModel = mongoose.model('Category', categorySchema);

module.exports = categoryModel;
