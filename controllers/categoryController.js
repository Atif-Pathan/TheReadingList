// categoryController.js
const db = require('../db/queries');
const { body, validationResult } = require('express-validator');

// --- Validation Rules ---
// This is an array of middleware that will be used by the POST route.
const validateCategory = [
  body(
    'name',
    'Category name is required and must be between 1 and 100 characters.',
  )
    .trim()
    .isLength({ min: 1, max: 100 })
    .escape(),

  body('description', 'Description must be less than 500 characters.')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .escape(),
];

// --- Controller Functions ---
// GET /categories/:id
exports.getCategory = async (req, res, next) => {
  try {
    const categoryId = req.params.id;
    const category = await db.getCategoryById(categoryId);
    if (!category) {
      return res.status(404).render('error', {
        message: 'Category not found',
        error: {},
      });
    }
    const books = await db.getBooksByCategoryId(categoryId);
    res.render('categories/category_details', {
      title: `${category.name}`,
      category,
      books,
    });
  } catch (error) {
    next(error);
  }
};

// GET /categories/new
exports.createCategoryGet = async (req, res, next) => {
  try {
    res.render('categories/category_form', {
      title: 'New Category',
      category: {},
      errors: [],
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
      const categoryData = {
        name: req.body.name,
        description: req.body.description,
      };

      if (!errors.isEmpty()) {
        return res.status(400).render('categories/category_form', {
          title: 'New Category',
          category: categoryData,
          errors: errors.array(),
        });
      }

      try {
        const newCat = await db.insertCategory(categoryData);
        return res.redirect(`/categories/${newCat.id}`);
      } catch (err) {
        // Handle unique violation (duplicate name)
        if (err && err.code === '23505') {
          return res.status(400).render('categories/category_form', {
            title: 'New Category',
            category: categoryData,
            errors: [{ msg: 'A category with this name already exists.' }],
          });
        }
        throw err;
      }
    } catch (error) {
      next(error);
    }
  },
];
