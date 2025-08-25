// controllers/categoryController.js
const db = require('../db/queries');
const { body, validationResult } = require('express-validator');

const validateCategory = [
  body('name', 'Category name must be 1–100 characters.')
    .trim()
    .isLength({ min: 1, max: 100 })
    .escape(),
  body('description', 'Description must be <= 500 characters.')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .escape(),
  // Add password validation
  body('password', 'Admin password is required.').notEmpty(),
];

// GET /categories/:id
exports.getCategory = async (req, res, next) => {
  try {
    const category = await db.getCategoryById(req.params.id);
    if (!category) {
      const err = new Error('Category not found');
      err.status = 404;
      return next(err); // Use the global error handler
    }
    const books = await db.getBooksByCategoryId(req.params.id);
    res.render('categories/category_details', {
      title: category.name,
      category,
      books,
    });
  } catch (error) {
    next(error);
  }
};

// POST /categories/new
exports.createCategoryPost = [
  ...validateCategory,
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      const { name, description, password } = req.body;

      // Check admin password first
      if (password !== process.env.ADMIN_PASSWORD) {
        const queryParams = new URLSearchParams({
          error: 'Incorrect admin password.',
          oldName: name,
          oldDesc: description,
        }).toString();
        return res.redirect(`/dashboard?${queryParams}#category-form-wrapper`);
      }

      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map((e) => e.msg);
        const queryParams = new URLSearchParams({
          error: errorMessages.join('; '),
          oldName: name,
          oldDesc: description,
        }).toString();
        return res.redirect(`/dashboard?${queryParams}#category-form-wrapper`);
      }

      await db.insertCategory({ name, description });
      res.redirect('/dashboard');
    } catch (error) {
      if (error.code === '23505') {
        const queryParams = new URLSearchParams({
          error: 'A category with this name already exists.',
          oldName: req.body.name,
          oldDesc: req.body.description,
        }).toString();
        return res.redirect(`/dashboard?${queryParams}#category-form-wrapper`);
      }
      next(error);
    }
  },
];

// POST /categories/:id/edit
exports.editCategoryPost = [
  ...validateCategory,
  async (req, res, next) => {
    const categoryId = req.params.id;
    try {
      const errors = validationResult(req);
      const { name, description, password } = req.body;

      // Check admin password first
      if (password !== process.env.ADMIN_PASSWORD) {
        const queryParams = new URLSearchParams({
          error: 'Incorrect admin password.',
          oldName: name,
          oldDesc: description,
        }).toString();
        return res.redirect(
          `/categories/${categoryId}?${queryParams}#category-form-wrapper`,
        );
      }

      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map((e) => e.msg);
        const queryParams = new URLSearchParams({
          error: errorMessages.join('; '),
          oldName: name,
          oldDesc: description,
        }).toString();
        // Redirect back to the category page with errors in the URL
        return res.redirect(
          `/categories/${categoryId}?${queryParams}#category-form-wrapper`,
        );
      }

      await db.updateCategory(categoryId, { name, description });
      res.redirect(`/categories/${categoryId}`);
    } catch (error) {
      if (error.code === '23505') {
        const queryParams = new URLSearchParams({
          error: 'A category with this name already exists.',
          oldName: req.body.name,
          oldDesc: req.body.description,
        }).toString();
        return res.redirect(
          `/categories/${categoryId}?${queryParams}#category-form-wrapper`,
        );
      }
      next(error);
    }
  },
];

// POST /categories/:id/delete
exports.deleteCategoryPost = async (req, res, next) => {
  try {
    const fromId = parseInt(req.params.id, 10);
    const archiveCategory = await db.findOrCreateCategoryByName('Archive');

    const { adminPassword } = req.body;

    // Check admin password first
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      const queryParams = new URLSearchParams({
        error: 'Incorrect admin password.',
      }).toString();
      return res.redirect(
        `/categories/${fromId}?${queryParams}#category-form-wrapper`,
      );
    }

    if (fromId === archiveCategory.id) {
      // This is a server-level rule violation, not a validation error.
      // Create an error and pass it to the global error handler.
      const err = new Error('The "Archive" category cannot be deleted.');
      err.status = 400; // Bad Request
      return next(err);
    }

    await db.moveBooksToCategory(fromId, archiveCategory.id);
    await db.deleteCategory(fromId);
    res.redirect('/dashboard');
  } catch (error) {
    next(error);
  }
};
