// db/queries.js
const pool = require('./pool');

async function getAllBooks() {
  try {
    const { rows } = await pool.query('SELECT * FROM books');
    return rows;
  } catch (err) {
    console.error('Error fetching all books:', err.stack);
    throw err; // Re-throw to be caught by the route handler
  }
}

async function getAllCategories() {
  try {
    const { rows } = await pool.query('SELECT * FROM categories');
    return rows;
  } catch (err) {
    console.error('Error fetching all categories:', err.stack);
    throw err;
  }
}

async function getBookById(id) {
  try {
    const { rows } = await pool.query(
      `SELECT
         books.*,
         categories.name AS category_name
       FROM books
       JOIN categories ON books.category_id = categories.id
       WHERE books.id = $1`,
      [id],
    );
    return rows[0];
  } catch (error) {
    console.error('Error executing search query:', error.stack);
    throw error;
  }
}

async function insertBook(book) {
  const { title, author, cover_image_url, genre, rating, review, category_id } =
    book;
  try {
    const { rows } = await pool.query(
      `INSERT INTO books (title, author, cover_image_url, genre, rating, review, category_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`, // RETURNING id is useful to get the new book's ID
      [title, author, cover_image_url, genre, rating, review, category_id],
    );
    return rows[0]; // Returns { id: new_book_id }
  } catch (err) {
    console.error('Error inserting book:', err.stack);
    throw err;
  }
}

module.exports = {
  getAllBooks,
  getAllCategories,
  getBookById,
  insertBook,
};
