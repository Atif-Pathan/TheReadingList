// db/queries.js
const pool = require('./pool');

// Book Queries
async function getAllBooks() {
  try {
    const { rows } = await pool.query('SELECT * FROM books');
    return rows;
  } catch (err) {
    console.error('Error fetching all books:', err.stack);
    throw err; // Re-throw to be caught by the route handler
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

// Category Queries
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

async function updateCategory(id, { name, description }) {
  try {
    const { rows } = await pool.query(
      `UPDATE categories SET name = $1, description = $2 WHERE id = $3 RETURNING id`,
      [name, description || null, id],
    );
    return rows[0];
  } catch (err) {
    console.error('Error updating category:', err.stack);
    throw err;
  }
}

async function moveBooksToCategory(fromCategoryId, toCategoryId) {
  try {
    await pool.query(
      `UPDATE books SET category_id = $1 WHERE category_id = $2`,
      [toCategoryId, fromCategoryId],
    );
  } catch (err) {
    console.error('Error moving books to category:', err.stack);
    throw err;
  }
}

async function deleteCategory(id) {
  try {
    await pool.query(`DELETE FROM categories WHERE id = $1`, [id]);
  } catch (err) {
    console.error('Error deleting category:', err.stack);
    throw err;
  }
}

async function findOrCreateCategoryByName(name, description = null) {
  try {
    const existing = await pool.query(
      `SELECT id FROM categories WHERE name = $1`,
      [name],
    );
    if (existing.rowCount) return existing.rows[0];
    const { rows } = await pool.query(
      `INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING id`,
      [name, description],
    );
    return rows[0];
  } catch (err) {
    console.error('Error finding or creating category:', err.stack);
    throw err;
  }
}

async function updateBook(id, book) {
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
      `UPDATE books
       SET title = $1, author = $2, cover_image_url = $3, summary = $4, genre = $5, rating = $6, review = $7, category_id = $8
       WHERE id = $9
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
        id, // The ID for the WHERE clause
      ],
    );
    return rows[0];
  } catch (err) {
    console.error('Error updating book:', err.stack);
    throw err;
  }
}

async function deleteBook(id) {
  try {
    await pool.query(`DELETE FROM books WHERE id = $1`, [id]);
    // No return value is needed for a simple delete
  } catch (err) {
    console.error('Error deleting book:', err.stack);
    throw err;
  }
}

module.exports = {
  getAllBooks,
  getBookById,
  getBooksByCategoryId,
  insertBook,
  getAllCategories,
  getCategoryById,
  insertCategory,
  updateCategory,
  moveBooksToCategory,
  deleteCategory,
  findOrCreateCategoryByName,
  updateBook,
  deleteBook,
};
