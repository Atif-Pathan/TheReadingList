// indexRoutes.js
const { Router } = require('express');
const db = require('../db/queries');

const indexRouter = Router();

indexRouter.get('/', async (req, res) => {
  res.render('welcome/index', {
    title: 'The Reading List',
  });
});

indexRouter.get('/dashboard', async (req, res) => {
  const categories = await db.getAllCategories();
  const books = await db.getAllBooks();
  console.log(books);
  console.log(categories);
  res.render('welcome/dashboard', {
    title: 'The Reading List',
    books: books,
    categories: categories,
  });
});

module.exports = indexRouter;
