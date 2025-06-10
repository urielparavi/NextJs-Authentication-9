import sql from 'better-sqlite3';

// Open (or create if not existing) the SQLite database file named 'training.db'
const db = sql('training.db');

// Create a 'users' table if it doesn't already exist, with unique email and basic password storage
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,         -- Unique identifier for each user
    email TEXT UNIQUE,              -- User email, must be unique
    password TEXT                   -- User password (should be hashed in production)
  );
`);

// Create a 'sessions' table to store login session info for users
db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT NOT NULL PRIMARY KEY,   -- Session ID (likely a UUID or token)
    expires_at INTEGER NOT NULL,    -- Expiration time for the session (UNIX timestamp)
    user_id TEXT NOT NULL,          -- ID of the user associated with the session
    FOREIGN KEY (user_id) REFERENCES users(id) -- Link session to a user
  );
`);

// Create a 'trainings' table to store training categories or types
db.exec(`
  CREATE TABLE IF NOT EXISTS trainings (
    id INTEGER PRIMARY KEY,         -- Unique identifier for each training
    title TEXT,                     -- Title of the training type
    image TEXT,                     -- Path to the image associated with the training
    description TEXT                -- Brief description of the training
  );
`);

// Check if the 'trainings' table already has data (records)
const hasTrainings =
  db.prepare('SELECT COUNT(*) as count FROM trainings').get().count > 0;

// If no training data exists, insert default training categories
if (!hasTrainings) {
  db.exec(`
    INSERT INTO trainings (title, image, description)
    VALUES
    ('Yoga', '/yoga.jpg', 'A gentle way to improve flexibility and balance.'),
    ('Boxing', '/boxing.jpg', 'A high-energy workout that improves strength and speed.'),
    ('Running', '/running.jpg', 'A great way to improve cardiovascular health and endurance.'),
    ('Weightlifting', '/weightlifting.jpg', 'A strength-building workout that helps tone muscles.'),
    ('Cycling', '/cycling.jpg', 'A low-impact workout that improves cardiovascular health and endurance.'),
    ('Gaming', '/gaming.jpg', 'A fun way to improve hand-eye coordination and reflexes.'),
    ('Sailing', '/sailing.jpg', 'A relaxing way to enjoy the outdoors and improve balance.');
  `);
}

// Export the database instance so it can be used in other modules
export default db;
