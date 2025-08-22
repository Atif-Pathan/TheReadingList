// routes/categoryRoutes.js
const { Router } = require('express');
const categoryController = require('../controllers/categoryController');
const categoryRouter = Router();

// CRUD
categoryRouter.post('/new', categoryController.createCategoryPost); // CREATE
categoryRouter.get('/:id', categoryController.getCategory); // READ
categoryRouter.post('/:id/edit', categoryController.editCategoryPost); // UPDATE
categoryRouter.post('/:id/delete', categoryController.deleteCategoryPost); // DELETE

module.exports = categoryRouter;
