const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    author: {
        type: String,
        required: true,
        trim: true
    },
    publisher: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    publishedYear: {
        type: Number,
        required: true
    },
    isbn: {
        type: String,
        required: true,
        unique: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 0,
        default: 1
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['Novel', 'Education', 'Technology', 'History', 'Biography', 'Fiction'],
        required: true
    },
    pages:{
        type: Number,
        required: true,
        min: 0
    },
    bookCover: {
        type: String,
        required: true
    }
},
{
    timestamps: true
});

module.exports=mongoose.model('Book',bookSchema);