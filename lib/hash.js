import crypto from 'node:crypto'; // Node.js built-in crypto module

export function hashUserPassword(password) {
  // Generate a random 16-byte salt and convert it to hex string
  const salt = crypto.randomBytes(16).toString('hex');
  // Example salt (dummy value for understanding):
  // const salt = 'a1b2c3d4e5f6a7b8';

  // Hash the password using scrypt with the generated salt, output length 64 bytes
  const hashedPassword = crypto.scryptSync(password, salt, 64);
  // Example hashedPassword (dummy hex string for understanding):
  // const hashedPassword = Buffer.from('5f2d7c4e8a1b3d2f4e6a9b7c1d0e5f3a', 'hex');

  // Return combined string: hashed password (hex) + ':' + salt
  // Example returned value:
  // '5f2d7c4e8a1b3d2f4e6a9b7c1d0e5f3a:a1b2c3d4e5f6a7b8'
  return hashedPassword.toString('hex') + ':' + salt;
}

export function verifyPassword(storedPassword, suppliedPassword) {
  // storedPassword format:
  // '<hashedPassword>:<salt>'
  // Example dummy value:
  // storedPassword = '5f2d7c4e8a1b3d2f4e6a9b7c1d0e5f3a:a1b2c3d4e5f6a7b8'

  // The password the user supplies when logging in:
  // Example:
  // suppliedPassword = 'mySecret123';

  // Split the stored password string into hashedPassword and salt
  const [hashedPassword, salt] = storedPassword.split(':');
  // Example after split:
  // hashedPassword = '5f2d7c4e8a1b3d2f4e6a9b7c1d0e5f3a'
  // salt = 'a1b2c3d4e5f6a7b8'

  // Convert hashed password from hex string back to Buffer
  const hashedPasswordBuf = Buffer.from(hashedPassword, 'hex');

  // Hash the supplied password with the same salt
  const suppliedPasswordBuf = crypto.scryptSync(suppliedPassword, salt, 64);
  // Example:
  // suppliedPassword = 'mySecret123'
  // suppliedPasswordBuf = Buffer with the hash bytes

  // Compare the two Buffers securely
  return crypto.timingSafeEqual(hashedPasswordBuf, suppliedPasswordBuf);
  // Use a constant-time comparison to prevent timing attacks.
  // Instead of using === which may leak information based on how long it takes to compare,
  // timingSafeEqual ensures the comparison takes the same amount of time regardless of the input,
  // making it safer against attackers trying to guess the password based on response times.
}

/*

Example values for illustration only:

password = 'mySecret123'

salt (16 bytes hex) = 'a1b2c3d4e5f6a7b8'

hashedPassword (partial hex) = '5f2d7c4e8a1b3d2f4e6a9b7c1d0e5f3a'

storedPassword = hashedPassword + ':' + salt

Example storedPassword string:

"5f2d7c4e8a1b3d2f4e6a9b7c1d0e5f3a:a1b2c3d4e5f6a7b8"

*/
