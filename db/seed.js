#! /usr/bin/env node
require('dotenv').config();
const { Client } = require('pg');

// The SQL statements are wrapped in a single template literal.
// The order is important: drop dependent tables first, then create parent tables first.
const SQL = `
-- Drop tables in reverse order of creation to avoid foreign key constraints
DROP TABLE IF EXISTS books;
DROP TABLE IF EXISTS categories;

-- Create the categories table first, as books will reference it
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT
);

-- Create the books table with a foreign key reference to categories
CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  cover_image_url TEXT,
  genre VARCHAR(100),
  rating INTEGER,
  review TEXT,
  category_id INTEGER NOT NULL REFERENCES categories(id)
);

-- Insert the categories first to generate their IDs
INSERT INTO categories (name, description) VALUES
  ('Read', 'Books that I have completed.'),
  ('Want to Read', 'My reading backlog.'),
  ('Currently Reading', 'Books I am actively reading.'),
  ('Unfinished', 'Books I started but did not finish.');

-- Insert the books, referencing the category IDs
-- NOTE: The SERIAL IDs for categories will be 1, 2, 3, 4 in the order they were inserted above.
INSERT INTO books (title, author, genre, rating, review, category_id, cover_image_url) VALUES
  (
    'The Poppy War',
    'R.F. Kuang',
    'Military Fantasy',
    5,
    'An incredible and brutal start to a trilogy. A masterpiece of grimdark fantasy.',
    1, -- Corresponds to 'Read'
    'https://m.media-amazon.com/images/I/71ZVpkRIGsL.jpg'
  ),
  (
    'The Dragon Republic',
    'R.F. Kuang',
    'Military Fantasy',
    NULL,
    NULL,
    2, -- Corresponds to 'Want to Read'
    'https://m.media-amazon.com/images/I/81-pYcJnBlL.jpg'
  ),
  (
    'Babel',
    'R.F. Kuang',
    'Dark Academia',
    5,
    NULL,
    1, -- Corresponds to 'Read'
    'https://m.media-amazon.com/images/I/A1lv97-jJoL.jpg'
  ),
  (
    'Yellowface',
    'R.F. Kuang',
    'Literary Fiction',
    NULL,
    NULL,
    3, -- Corresponds to 'Currently Reading'
    'https://m.media-amazon.com/images/I/61pZ0M900BL.jpg'
  ),
  (
    'The Burning God',
    'R.F. Kuang',
    'Military Fantasy',
    NULL,
    'Got halfway through but needed a break. Will come back to it later.',
    4, -- Corresponds to 'Unfinished'
    'https://m.media-amazon.com/images/I/71pNOR-3x3L.jpg'
  );
`;

async function main() {
  console.log('seeding...');

  const connectionString = process.argv[2] || process.env.DATABASE_URL;

  if (!connectionString) {
    console.error(
      'Error: must provide a DATABASE_URL via env or as the first argument',
    );
    process.exit(1);
  }

  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log('Connected to database.');
    await client.query(SQL);
    console.log('Seeding complete.');
  } catch (err) {
    console.error('Seeding failed:', err.stack);
  } finally {
    await client.end();
    console.log('Database connection closed.');
  }
}

main();
