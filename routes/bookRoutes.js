// routes/bookRoutes.js
const { Router } = require('express');
const bookController = require('../controllers/bookController');
const bookRouter = Router();

bookRouter.get('/:id', bookController.getBook);
// bookRouter.get("/create", usersController.usersCreateGet);
// bookRouter.post("/create", usersController.usersCreatePost);
// bookRouter.get("/:id/update", usersController.usersUpdateGet);
// bookRouter.post("/:id/update", usersController.usersUpdatePost);
// bookRouter.post("/:id/delete", usersController.usersDeletePost);
// bookRouter.get("/search", usersController.usersSearchGet);

module.exports = bookRouter;
