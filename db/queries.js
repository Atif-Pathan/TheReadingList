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

async function getCategoryById(id) {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM categories WHERE id = $1',
      [id],
    );
    return rows[0];
  } catch (err) {
    console.error('Error fetching category by id:', err.stack);
    throw err;
  }
}

async function getBooksByCategoryId(categoryId) {
  try {
    const { rows } = await pool.query(
      `SELECT *
       FROM books
       WHERE category_id = $1
       ORDER BY created_at DESC`,
      [categoryId],
    );
    return rows;
  } catch (err) {
    console.error('Error fetching books by category id:', err.stack);
    throw err;
  }
}

async function getBookById(id) {
  try {
    const { rows } = await pool.query(
      `SELECT b.*, c.name AS category_name
       FROM books b
       JOIN categories c ON b.category_id = c.id
       WHERE b.id = $1`,
      [id],
    );
    return rows[0];
  } catch (error) {
    console.error('Error executing search query:', error.stack);
    throw error;
  }
}

async function insertBook(book) {
  const {
    title,
    author,
    cover_image_url,
    summary,
    genre,
    rating,
    review,
    category_id,
  } = book;
  try {
    const { rows } = await pool.query(
      `INSERT INTO books
        (title, author, cover_image_url, summary, genre, rating, review, category_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [
        title,
        author,
        cover_image_url || null,
        summary || null,
        genre || null,
        rating ?? null,
        review || null,
        category_id,
      ],
    );
    return rows[0];
  } catch (err) {
    console.error('Error inserting book:', err.stack);
    throw err;
  }
}

async function insertCategory({ name, description }) {
  try {
    const { rows } = await pool.query(
      `INSERT INTO categories (name, description)
       VALUES ($1, $2)
       RETURNING id`,
      [name, description || null],
    );
    return rows[0];
  } catch (err) {
    console.error('Error inserting category:', err.stack);
    throw err;
  }
}

module.exports = {
  getAllBooks,
  getAllCategories,
  getCategoryById,
  getBooksByCategoryId,
  getBookById,
  insertBook,
  insertCategory,
};
