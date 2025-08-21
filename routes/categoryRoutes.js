// routes/categoryRoutes.js
const { Router } = require('express');
const categoryController = require('../controllers/categoryController');
const categoryRouter = Router();

categoryRouter.get('/new', categoryController.createCategoryGet);
categoryRouter.post('/new', categoryController.createCategoryPost);
categoryRouter.get('/:id', categoryController.getCategory);
// bookRouter.get('/post', bookController.createBookPost);
// bookRouter.get("/create", usersController.usersCreateGet);
// bookRouter.post("/create", usersController.usersCreatePost);
// bookRouter.get("/:id/update", usersController.usersUpdateGet);
// bookRouter.post("/:id/update", usersController.usersUpdatePost);
// bookRouter.post("/:id/delete", usersController.usersDeletePost);
// bookRouter.get("/search", usersController.usersSearchGet);

module.exports = categoryRouter;
