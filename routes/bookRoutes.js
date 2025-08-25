// routes/bookRoutes.js
const { Router } = require('express');
const bookController = require('../controllers/bookController');
const bookRouter = Router();

// CREATE a new book
bookRouter.get('/new', bookController.createBookGet);
bookRouter.post('/new', bookController.createBookPost);

// READ a single book's details
bookRouter.get('/:id', bookController.getBook);

// UPDATE a book
bookRouter.get('/:id/edit', bookController.editBookGet); // to show the edit form
bookRouter.post('/:id/edit', bookController.editBookPost);

// DELETE a book
bookRouter.post('/:id/delete', bookController.deleteBookPost);

module.exports = bookRouter;
