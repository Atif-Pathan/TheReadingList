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
  ( 'The Poppy War', 'R.F. Kuang', 'Military Fantasy, Grimdark', 10, $$An incredible and brutal start to a trilogy.$$, 1, 'https://m.media-amazon.com/images/I/71ZVpkRIGsL.jpg', $$The Poppy War follows Fang Runin, a war orphan who passes a national test to enter the elite Sinegard military academy and discovers she possesses immense shamanic powers. Targeted by classmates, Rin learns to wield destructive magic from a powerful god through psychedelic drugs and harsh training, only to find her powers and ruthless methods may cost her humanity as the Mugen Federation invades her homeland, the Nikan Empire. The story is a dark, adult fantasy inspired by historical events in China, featuring themes of war, trauma, and moral corruption.$$),
  ( 'Babel', 'R.F. Kuang', 'Dark Academia, Historical Fantasy', 7, $$A truly phenomenal and thought-provoking novel.$$, 1, 'https://m.media-amazon.com/images/I/A1lv97-jJoL.jpg', $$Babel is a fantasy novel that explores the intersection of language, magic, and colonialism in an alternative 1830s Britain. The story follows Robin Swift, a Chinese orphan brought to England to study at Oxford's prestigious translation institute, known as Babel. There, magic is harnessed by inscribing 'match-pairs'—words with similar meanings lost in translation—onto silver bars, powering the British Empire's colonial expansion. As Robin becomes aware of the injustice of this system, he is caught between his gratitude to the Empire and the anti-colonialist Hermes Society, ultimately leading to a conflict over the future of the Empire and the role of translation in its creation and destruction.$$),
  ( 'Yellowface', 'R.F. Kuang', 'Literary Fiction, Satire', 9, NULL, 1, 'https://m.media-amazon.com/images/I/61pZ0M900BL.jpg', $$Yellowface is a satirical novel about June Hayward, a white author who steals her recently deceased Asian friend Athena Liu's unpublished manuscript about Chinese laborers in World War I. June publishes the manuscript as her own under the ambiguous pen name Juniper Song, becoming a literary sensation. The story follows June's increasingly desperate attempts to maintain the lie, navigate accusations of racism and plagiarism, and her descent into self-deception, all while confronting the social media-driven realities of the publishing world.$$),
  ( 'Jade City', 'Fonda Lee', 'Fantasy, Sci-Fi, Magic, Crime', NULL, NULL, 3, 'https://www.fondalee.com/wp-content/uploads/2025/04/JADECITY_COVER_ISS1_250425-683x1024.jpg', $$Jade City is a fantasy novel about the Kaul family, who lead the international No Peak clan of Green Bone warriors in Kekon's capital city, a place rich in magical jade. When a new drug emerges, allowing non-Green Bones to wield jade, it triggers a violent clan war with their rivals, the isolationist Mountain clan. The story follows the Kaul siblings as they navigate this changing world, their roles within the clan, and the struggle to protect their family and the future of their island.$$),
  ( 'The Dragon Republic', 'R.F. Kuang', 'Military Fantasy, Sequel', NULL, NULL, 2, 'https://m.media-amazon.com/images/I/81-pYcJnBlL.jpg', NULL),
  ( 'The Burning God', 'R.F. Kuang', 'Military Fantasy, Grimdark', NULL, $$Got halfway through but needed a break.$$, 4, 'https://m.media-amazon.com/images/I/71pNOR-3x3L.jpg', $$After saving her nation of Nikan from foreign invaders and battling the evil Empress Su Daji... a civil war, Fang Runin was betrayed by allies and left for dead.$$)
;
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
