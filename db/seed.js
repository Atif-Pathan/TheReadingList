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
  summary TEXT, -- ADDED: For the book's official summary
  genre TEXT, -- Storing as comma-separated text is perfect for this project
  rating INTEGER,
  review TEXT,
  category_id INTEGER NOT NULL REFERENCES categories(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, -- ADDED
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP  -- ADDED
);

-- Optional: A trigger to automatically update the updated_at timestamp.
-- This is advanced but good practice. For now, we'll just set it on creation.
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
  ('Unfinished', 'Books I started but did not finish.');

INSERT INTO books (title, author, genre, rating, review, category_id, cover_image_url, summary) VALUES
  (
    'The Poppy War',
    'R.F. Kuang',
    'Military Fantasy, Grimdark',
    9,
    'An incredible and brutal start to a trilogy. A masterpiece of grimdark fantasy.',
    1, -- Read
    'https://m.media-amazon.com/images/I/71ZVpkRIGsL.jpg',
    'When Rin aced the Keju—the Empire-wide test to find the most talented youth to learn at the Academies—it was a shock to everyone: to the test officials, who couldn’t believe a war orphan from Rooster Province could pass without cheating; to Rin’s guardians, who believed they’d finally be able to marry her off and further their criminal enterprise; and to Rin herself, who realized she was finally free of the servitude and despair that had made up her daily existence.'
  ),
  (
    'The Dragon Republic',
    'R.F. Kuang',
    'Military Fantasy, Sequel',
    NULL,
    NULL,
    2, -- Want to Read
    'https://m.media-amazon.com/images/I/81-pYcJnBlL.jpg',
    'Three times Rin fought the Dragon Republic, and three times she managed to save it. But her power is growing, and the more she relies on it, the more she fears she is becoming the very thing she fought so hard to destroy.'
  ),
  (
    'Babel',
    'R.F. Kuang',
    'Dark Academia, Historical Fantasy',
    10,
    'A truly phenomenal and thought-provoking novel.',
    1, -- Read
    'https://m.media-amazon.com/images/I/A1lv97-jJoL.jpg',
    'Traduttore, traditore: An act of translation is always an act of betrayal. 1828. Robin Swift, orphaned in Canton and brought to London by the mysterious Professor Lovell, has trained for years in Latin, Ancient Greek, and Chinese, all in preparation for the day he’ll enroll in Oxford University’s prestigious Royal Institute of Translation—also known as Babel.'
  ),
  (
    'Yellowface',
    'R.F. Kuang',
    'Literary Fiction, Satire',
    NULL,
    NULL,
    3, -- Currently Reading
    'https://m.media-amazon.com/images/I/61pZ0M900BL.jpg',
    'Authors June Hayward and Athena Liu were supposed to be twin rising stars. But Athena’s a literary darling. June Hayward is literally nobody. Who wants stories about basic white girls, June thinks. So when June witnesses Athena’s death in a freak accident, she acts on impulse: she steals Athena’s just-finished masterpiece, an experimental novel about the unsung contributions of Chinese laborers during World War I.'
  ),
  (
    'The Burning God',
    'R.F. Kuang',
    'Military Fantasy, Grimdark',
    NULL,
    'Got halfway through but needed a break. Will come back to it later.',
    4, -- Unfinished
    'https://m.media-amazon.com/images/I/71pNOR-3x3L.jpg',
    'After saving her nation of Nikan from foreign invaders and battling the evil Empress Su Daji in a brutal civil war, Fang Runin was betrayed by allies and left for dead.'
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
