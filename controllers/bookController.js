// bookController.js
const db = require('../db/queries');
const { body, validationResult } = require('express-validator');

// --- Validation Rules ---
// This is an array of middleware that will be used by the POST route.
const validateBook = [
  body('title', 'Title is required and must be between 1 and 255 characters.')
    .trim()
    .isLength({ min: 1, max: 255 })
    .escape(),

  body('author', 'Author is required and must be between 1 and 255 characters.')
    .trim()
    .isLength({ min: 1, max: 255 })
    .escape(),

  body('category_id', 'You must select a category.').trim().isInt(),

  body('cover_image_url', 'Cover link must be a valid URL.')
    .optional({ checkFalsy: true }) // Allows empty string
    .trim()
    .isURL(),

  body('genre', 'Genre must be less than 150 characters.')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 150 })
    .escape(),

  body('rating', 'Rating must be a number between 0 and 10.')
    .optional({ checkFalsy: true })
    .isInt({ min: 0, max: 10 }),

  body('review', 'Review must be less than 6000 characters.')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 6000 })
    .escape(),
];

// --- Controller Functions ---
exports.getBook = async (req, res, next) => {
  try {
    const book = await db.getBookById(req.params.id);
    if (!book) {
      return res.status(404).send('Book not found');
    }
    res.render('books/book_details', {
      book: book,
      title: book.title,
    });
  } catch (error) {
    next(error);
  }
};

exports.createBookGet = async (req, res, next) => {
  try {
    const categories = await db.getAllCategories();
    const selectedCategoryId = req.query.category_id || null;

    res.render('books/book_form', {
      title: 'Add New Book',
      categories,
      book: { category_id: selectedCategoryId },
      errors: [],
    });
  } catch (error) {
    next(error);
  }
};

exports.createBookPost = [
  ...validateBook,

  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      const bookData = req.body;

      if (!errors.isEmpty()) {
        // If there are errors, re-render the form with the data and errors
        const categories = await db.getAllCategories();
        return res.status(400).render('books/book_form', {
          title: 'Add New Book',
          categories: categories,
          book: bookData, // Pass back the submitted data to re-fill the form
          errors: errors.array(),
        });
      }

      // If validation passes, insert the book into the database
      // Ensure rating is null if it's an empty string
      const bookToInsert = {
        ...bookData,
        rating: bookData.rating || null,
      };

      const newBook = await db.insertBook(bookToInsert);

      // Redirect to the new book's detail page or the dashboard
      res.redirect(`/books/${newBook.id}`);
    } catch (error) {
      next(error); // Pass any database or other errors to the handler
    }
  },
];
