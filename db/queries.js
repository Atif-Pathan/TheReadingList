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
  // The controller already handles the case where the book isn't found,
  // so we can simplify this.
  const { rows } = await pool.query('SELECT * FROM books WHERE id = ($1)', [
    id,
  ]);
  return rows[0]; // This will be `undefined` if not found.
}

// async function insertMessage(text, user) {
//   await pool.query(
//     'INSERT INTO messages (message_text, username) VALUES ($1, $2)',
//     [text, user],
//   );
// }

module.exports = {
  getAllBooks,
  getAllCategories,
  getBookById,
};
