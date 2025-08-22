#! /usr/bin/env node
require('dotenv').config();
const { Client } = require('pg');

const SQL = `
DROP TABLE IF EXISTS books;
DROP TABLE IF EXISTS categories;

CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT
);

CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  cover_image_url TEXT,
  summary TEXT,
  genre TEXT,
  rating INTEGER,
  review TEXT,
  category_id INTEGER NOT NULL REFERENCES categories(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_books_updated_at BEFORE UPDATE
ON books FOR EACH ROW EXECUTE PROCEDURE
update_updated_at_column();

INSERT INTO categories (name, description) VALUES
  ('Read', 'Books that I have completed.'),
  ('Want to Read', 'My reading backlog.'),
  ('Currently Reading', 'Books I am actively reading.'),
  ('Archive', 'Books I started but did not finish, or have no other status.');

INSERT INTO books (title, author, genre, rating, review, category_id, cover_image_url, summary) VALUES
  ( 'The Poppy War', 'R.F. Kuang', 'Military Fantasy, Grimdark', 9, 'An incredible and brutal start to a trilogy.', 1, 'https://m.media-amazon.com/images/I/71ZVpkRIGsL.jpg', 'When Rin aced the Keju—the Empire-wide test to find the most talented youth to learn at the Academies—it was a shock to everyone...'),
  ( 'The Dragon Republic', 'R.F. Kuang', 'Military Fantasy, Sequel', NULL, NULL, 2, 'https://m.media-amazon.com/images/I/81-pYcJnBlL.jpg', 'Three times Rin fought the Dragon Republic, and three times she managed to save it...'),
  ( 'Babel', 'R.F. Kuang', 'Dark Academia, Historical Fantasy', 10, 'A truly phenomenal and thought-provoking novel.', 1, 'https://m.media-amazon.com/images/I/A1lv97-jJoL.jpg', 'Traduttore, traditore: An act of translation is always an act of betrayal...'),
  ( 'Yellowface', 'R.F. Kuang', 'Literary Fiction, Satire', NULL, NULL, 3, 'https://m.media-amazon.com/images/I/61pZ0M900BL.jpg', 'Authors June Hayward and Athena Liu were supposed to be twin rising stars...'),
  ( 'The Burning God', 'R.F. Kuang', 'Military Fantasy, Grimdark', NULL, 'Got halfway through but needed a break.', 4, 'https://m.media-amazon.com/images/I/71pNOR-3x3L.jpg', 'After saving her nation of Nikan from foreign invaders and battling the evil Empress Su Daji... a civil war, Fang Runin was betrayed by allies and left for dead.');
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
    await client.query(SQL);
    console.log('Seeding complete.');
  } catch (err) {
    console.error('Seeding failed:', err.stack);
  } finally {
    await client.end();
  }
}
main();
