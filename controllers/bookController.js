// controllers/bookController.js
const db = require('../db/queries');
const { body, validationResult } = require('express-validator');

// --- Validation Rules ---
// This is an array of middleware that will be used by the POST route.
const validateBook = [
  body('title', 'Title is required and must be between 1 and 255 characters.')
    .trim()
    .isLength({ min: 1, max: 255 }),

  body('author', 'Author is required and must be between 1 and 255 characters.')
    .trim()
    .isLength({ min: 1, max: 255 }),

  body('category_id', 'You must select a category.').trim().isInt(),

  body('cover_image_url', 'Cover link must be a valid URL.')
    .optional({ checkFalsy: true }) // Allows empty string
    .trim()
    .isURL(),

  body('genre', 'Genre must be less than 150 characters.')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 150 }),

  body('rating', 'Rating must be a number between 0 and 10.')
    .optional({ checkFalsy: true })
    .isInt({ min: 0, max: 10 }),

  body('review', 'Review must be less than 6000 characters.')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 6000 }),

  body('summary', 'Summary must be less than 1000 characters.')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 1000 }),
];

// --- Controller Functions ---
// GET /books/:id - READ
exports.getBook = async (req, res, next) => {
  try {
    const book = await db.getBookById(req.params.id);
    if (!book) {
      const err = new Error('Book not found');
      err.status = 404;
      return next(err);
    }

    // --- Dynamic Back Link Logic ---
    let categoryBackLink = null;
    const fromCategory = req.query.fromCategory; // Check for our new query param

    if (fromCategory) {
      // If we have the param, build the link back to that category
      const originCategory = await db.getCategoryById(fromCategory);
      if (originCategory) {
        categoryBackLink = {
          url: `/categories/${originCategory.id}`,
          text: `Back to "${originCategory.name}"`,
        };
      }
    } else {
      // Fallback to the original Referer logic if the param isn't there
      const referer = req.get('Referer');
      if (referer && referer.includes('/categories/')) {
        categoryBackLink = {
          url: referer,
          text: `Back to "${book.category_name}"`,
        };
      }
    }

    res.render('books/book_details', {
      book: book,
      title: book.title,
      categoryBackLink: categoryBackLink, // Pass the link to the view
    });
  } catch (error) {
    next(error);
  }
};

// GET /books/new - CREATE (Part 1: Show form)
exports.createBookGet = async (req, res, next) => {
  try {
    const categories = await db.getAllCategories();
    const selectedCategoryId = req.query.category_id || null;
    const currentCategory = await db.getCategoryById(selectedCategoryId);

    // --- Dynamic Back Link Logic ---
    const referer = req.get('Referer');
    let categoryBackLink = null;
    // If the user came from a category page, create a link back to it
    if (referer && referer.includes('/categories/')) {
      categoryBackLink = {
        url: referer,
        text: `Back to "${currentCategory.name}"`,
      };
    }

    res.render('books/book_form', {
      title: 'Add New Book',
      categories,
      book: { category_id: selectedCategoryId },
      errors: [],
      categoryBackLink: categoryBackLink,
    });
  } catch (error) {
    next(error);
  }
};

// POST /books/new - CREATE (Part 2: Handle submission)
exports.createBookPost = [
  ...validateBook,
  // We also need a password validation rule for editing
  body('password', 'Admin password is required to create.').notEmpty(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      const bookData = req.body;

      const categoryBackLink = null;

      // ADDED: Check admin password first
      if (bookData.password !== process.env.ADMIN_PASSWORD) {
        const categories = await db.getAllCategories();
        return res.status(403).render('books/book_form', {
          title: 'Add New Book',
          categories,
          book: bookData,
          errors: [{ msg: 'Incorrect admin password.' }],
          categoryBackLink: categoryBackLink,
        });
      }

      if (!errors.isEmpty()) {
        // If there are errors, re-render the form with the data and errors
        const categories = await db.getAllCategories();
        return res.status(400).render('books/book_form', {
          title: 'Add New Book',
          categories: categories,
          book: bookData, // Pass back the submitted data to re-fill the form
          errors: errors.array(),
          categoryBackLink: categoryBackLink,
        });
      }

      // If validation passes, insert the book into the database
      // Ensure rating is null if it's an empty string
      const bookToInsert = { ...bookData, rating: bookData.rating || null };
      const newBook = await db.insertBook(bookToInsert);

      // Redirect to the new book's detail page or the dashboard
      const fromCategory = req.body.category_id;
      res.redirect(`/books/${newBook.id}?fromCategory=${fromCategory}`);
    } catch (error) {
      next(error); // Pass any database or other errors to the handler
    }
  },
];

// GET /books/:id/edit
exports.editBookGet = async (req, res, next) => {
  try {
    const bookId = req.params.id;
    const book = await db.getBookById(bookId);
    const categories = await db.getAllCategories();

    // --- Dynamic Back Link Logic ---
    const referer = req.get('Referer');
    let categoryBackLink = null;
    // If the user came from a book page, create a link back to it
    if (referer && referer.includes('/books/')) {
      const updatedReferer = referer.replace('edit', '');
      categoryBackLink = {
        url: updatedReferer,
        text: `Back to "${book.title}"`,
      };
    }

    if (!book) {
      const err = new Error('Book not found');
      err.status = 404;
      return next(err);
    }

    res.render('books/book_form', {
      title: `Edit "${book.title}"`,
      categories: categories,
      book: book, // Pass the existing book data to pre-fill the form
      errors: [], // No errors on initial load
      categoryBackLink: categoryBackLink,
    });
  } catch (error) {
    next(error);
  }
};

// POST /books/:id/edit
exports.editBookPost = [
  ...validateBook,
  // We also need a password validation rule for editing
  body('password', 'Admin password is required for edits.').notEmpty(),

  async (req, res, next) => {
    const bookId = req.params.id;
    const bookData = req.body; // The data submitted by the user

    try {
      const referer = req.get('Referer');
      let categoryBackLink = null;
      // If the user came from a book page, create a link back to it
      if (referer && referer.includes('/books/')) {
        const updatedReferer = referer.replace('edit', '');
        categoryBackLink = {
          url: updatedReferer,
          text: `Back to "${bookData.title}"`,
        };
      }
      // Check for admin password first
      if (bookData.password !== process.env.ADMIN_PASSWORD) {
        // If password is wrong, re-render the form with an error
        const categories = await db.getAllCategories();
        // We need to merge the original book ID with the submitted data
        const submittedBook = { ...bookData, id: bookId };

        return res.status(403).render('books/book_form', {
          title: `Edit Book`,
          categories: categories,
          book: submittedBook, // Re-populate with the user's attempted changes
          errors: [{ msg: 'Incorrect admin password.' }], // Pass a specific error
          categoryBackLink: categoryBackLink,
        });
      }

      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        // If there are validation errors, re-render the form with submitted data and errors
        const categories = await db.getAllCategories();
        const submittedBook = { ...bookData, id: bookId };

        return res.status(400).render('books/book_form', {
          title: `Edit Book`,
          categories: categories,
          book: submittedBook, // Re-populate with the user's attempted changes
          errors: errors.array(),
          categoryBackLink: categoryBackLink,
        });
      }

      // If validation passes, update the book in the database
      const bookToUpdate = {
        ...bookData,
        rating: bookData.rating || null, // Handle empty rating
      };

      await db.updateBook(bookId, bookToUpdate);

      // On success, redirect to the book's detail page (completing the PRG pattern)
      const fromCategory = req.body.category_id;
      res.redirect(`/books/${bookId}?fromCategory=${fromCategory}`);
    } catch (error) {
      next(error);
    }
  },
];

// POST /books/:id/delete - DELETE
exports.deleteBookPost = async (req, res, next) => {
  try {
    const bookId = req.params.id;
    const { password, redirectTo } = req.body; // Assuming password comes from a modal form

    if (password !== process.env.ADMIN_PASSWORD) {
      // THE FIX: Redirect back to the book details page with an error query param
      const queryParams = new URLSearchParams({
        error: 'Incorrect admin password.',
      }).toString();
      return res.redirect(`/books/${bookId}?${queryParams}`);
    }

    await db.deleteBook(bookId);
    res.redirect(redirectTo || '/dashboard'); // Use the provided path, or fall back to the dashboard
  } catch (error) {
    next(error);
  }
};
