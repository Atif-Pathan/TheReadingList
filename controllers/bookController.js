// bookController.js
const db = require('../db/queries');

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
