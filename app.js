const mongoose=require("mongoose");
const express=require("express");
const multer=require("multer"); 
require("dotenv").config();
const Book=require("./models/Book");
const path=require("path");
const fs=require("fs");

const { body, param, query, validationResult } = require("express-validator");

const app = express();

const PORT = process.env.PORT

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("Connected Successfully!");
    })
    .catch((error) => {
        console.log("Connection Failed : ", error.message);
    })

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname,"uploads")));

const storage=multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const upload= multer({ storage });

function checkValidation(req, res, next){
    const result = validationResult(req);

    if(!result.isEmpty()){
        return res.status(400).json({
            message: 'Validation failed',
            errors: result.array().map(({path,msg}) => ({field: path, message: msg}))
        });
    }
    next(); 
}

const bookRules = [
    // Title
    body("title")
        .trim()
        .notEmpty().withMessage("Title is required.")
        .isLength({ max: 200 }).withMessage("Title cannot exceed 200 characters."),

    // Author
    body("author")
        .trim()
        .notEmpty().withMessage("Author is required.")
        .isLength({ max: 100 }).withMessage("Author cannot exceed 100 characters."),

    // Publisher
    body("publisher")
        .trim()
        .notEmpty().withMessage("Publisher is required."),

    // Price
    body("price")
        .notEmpty().withMessage("Price is required.")
        .isFloat({ min: 0 }).withMessage("Price must be a number greater than or equal to 0.")
        .toFloat(),

    // Published Year
    body("publishedYear")
        .notEmpty().withMessage("Published year is required.")
        .isInt({ min: 1, max: new Date().getFullYear() }).withMessage("Published year must be a valid year.")
        .toInt(),

    // ISBN
    body("isbn")
        .trim()
        .notEmpty().withMessage("ISBN is required.")
        .matches(/^(?:\d{9}[\dX]|\d{13})$/).withMessage("ISBN must be a valid ISBN-10 or ISBN-13 format."),

    // Quantity
    body("quantity")
        .optional()
        .isInt({ min: 0 }).withMessage("Quantity must be a non-negative integer.")
        .toInt(),

    // Description
    body("description")
        .trim()
        .notEmpty().withMessage("Description is required."),

    // Category
    body("category")
        .trim()
        .notEmpty().withMessage("Category is required.")
        .isIn([
            "Novel",
            "Education",
            "Technology",
            "History",
            "Biography",
            "Fiction"
        ]).withMessage("Category must be one of: Novel, Education, Technology, History, Biography, Fiction."),

    // Pages
    body("pages")
        .notEmpty().withMessage("Number of pages is required.")
        .isInt({ min: 1 }).withMessage("Pages must be a positive integer.")
        .toInt()
];

// Add Book Data
app.post("/add-book", upload.single("bookCover"),  bookRules, checkValidation, async(req, res) => {
    try{
        // Check whether a book cover was uploaded
        if (!req.file) {
            return res.status(400).json({
                message: "Book cover is required."
            });
        }

        const { 
            title, author, publisher, price, publishedYear, isbn, quantity, description, category, pages, bookCover
        } = req.body;

        const book = await Book.create({
            title, author, publisher, price, publishedYear, isbn, quantity, description, category, pages, bookCover: req.file ? req.file.filename : "",
        });
        res.status(201).json({message: "Book Added", id: book._id});
    } catch(err) {
    console.error("Error adding book:", err);

    if (err.code === 11000) {
        return res.status(409).json({
            message: "ISBN already exists"
        });
    }

    res.status(500).json({
        message: "Server error",
        error: err.message
    });
}

});

// Display Books Data
app.get("/display-books", async (req, res) => {
  try {
    const books = await Book.find()
      .select("-__v")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: books.length,
      data: books
    });
  }
  catch (err) {
    res.status(500).json({
      message: "Unable to fetch books"
    });
  }
});

// Delete Book Data
app.delete("/delete-book/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate book ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid book ID"
      });
    }

    // Find the book
    const book = await Book.findById(id);

    if (!book) {
      return res.status(404).json({
        message: "Book not found"
      });
    }

    // Delete book cover image
    if (book.bookCover) {
      const imagePath = path.join(__dirname,"uploads",path.basename(book.bookCover));

      fs.unlink(imagePath, async (err) => {
        if (err && err.code !== "ENOENT") {
          console.error("Error deleting image:", err);

          return res.status(500).json({
            message: "Unable to delete book cover image"
          });
        }

        try {
          // Delete book record from MongoDB
          await Book.findByIdAndDelete(id);

          res.status(200).json({
            message: "Book and cover image deleted successfully"
          });
        } catch (dbError) {
          console.error("Error deleting book:", dbError);

          res.status(500).json({
            message: "Unable to delete book from database"
          });
        }
      });
    }
    else {
      // Delete book if it has no cover image
      await Book.findByIdAndDelete(id);

      res.status(200).json({
        message: "Book deleted successfully"
      });
    }
  }
  catch (err) {
    console.error("Error:", err);

    res.status(500).json({
      message: "Server error"
    });
  }
});

// Update Book Data
app.put("/update-book/:id", upload.single("bookCover"), async (req, res) => {
  try {
    const { id } = req.params;

    // Validate book ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error("Error deleting uploaded image:", err);
        });
      }

      return res.status(400).json({
        message: "Invalid book ID"
      });
    }

    // Find existing book
    const book = await Book.findById(id);

    if (!book) {
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error("Error deleting uploaded image:", err);
        });
      }

      return res.status(404).json({
        message: "Book not found"
      });
    }

    // Store the old cover filename
    const oldCover = book.bookCover;

    // Get updated fields
    const {
      title,
      author,
      publisher,
      price,
      publishedYear,
      isbn,
      quantity,
      description,
      category,
      pages
    } = req.body || {};

    // Update only provided fields
    if (title !== undefined) book.title = title;
    if (author !== undefined) book.author = author;
    if (publisher !== undefined) book.publisher = publisher;
    if (price !== undefined) book.price = price;
    if (publishedYear !== undefined) book.publishedYear = publishedYear;
    if (isbn !== undefined) book.isbn = isbn;
    if (quantity !== undefined) book.quantity = quantity;
    if (description !== undefined) book.description = description;
    if (category !== undefined) book.category = category;
    if (pages !== undefined) book.pages = pages;

    // Replace cover if a new image was uploaded
    if (req.file) {
      book.bookCover = req.file.filename;
    }

    // Save updated book first
    const updatedBook = await book.save();

    // Delete old cover only after database save succeeds
    if (req.file && oldCover && oldCover !== req.file.filename) {
      const oldImagePath = path.join(
        __dirname,
        "uploads",
        path.basename(oldCover)
      );

      fs.unlink(oldImagePath, (err) => {
        if (err && err.code !== "ENOENT") {
          console.error("Error deleting old cover:", err);
        } else if (!err) {
          console.log("Old cover image deleted successfully:", oldCover);
        }
      });
    }

    return res.status(200).json({
      message: "Book updated successfully",
      data: updatedBook
    });

  } catch (err) {
    console.error("Error updating book:", err);

    // Remove the newly uploaded image if the update failed
    if (req.file) {
      fs.unlink(req.file.path, (fileErr) => {
        if (fileErr && fileErr.code !== "ENOENT") {
          console.error("Error deleting new image:", fileErr);
        }
      });
    }

    if (err.code === 11000) {
      return res.status(409).json({
        message: "ISBN already exists"
      });
    }

    return res.status(500).json({
      message: "Unable to update book",
      error: err.message
    });
  }
});

app.get('/', (req,res) => {
    res.send("Home Page");
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});