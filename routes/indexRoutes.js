// indexRoutes.js
const { Router } = require('express');
const db = require('../db/queries');

const indexRouter = Router();

indexRouter.get('/', async (req, res) => {
  res.render('welcome/index', {
    title: 'The Reading List',
  });
});

indexRouter.get('/dashboard', async (req, res, next) => {
  try {
    const categories = await db.getAllCategories();
    const books = await db.getAllBooks();

    // Sort categories by ID before rendering
    categories.sort((a, b) => a.id - b.id);

    res.render('welcome/dashboard', {
      title: 'The Reading List',
      books: books,
      categories: categories,
      // Pass query params to the view for error handling
      errors: req.query.error ? req.query.error.split(';') : [],
      categoryData: {
        name: req.query.oldName || '',
        description: req.query.oldDesc || '',
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = indexRouter;
