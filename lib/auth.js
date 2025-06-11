import { BetterSqlite3Adapter } from '@lucia-auth/adapter-sqlite'; // Import SQLite adapter for Lucia
import { Lucia } from 'lucia'; // Import Lucia authentication library

import db from './db'; // Import the SQLite database instance

// Create a new adapter instance, linking Lucia to SQLite tables
const adapter = new BetterSqlite3Adapter(db, {
  user: 'users', // Table name for storing users
  session: 'sessions', // Table name for storing sessions
});

// Create a new Lucia instance with the adapter and session cookie options
const lucia = new Lucia(adapter, {
  sessionCookie: {
    expires: false, // Session cookie does not expire (persistent until browser closes)
    attributes: {
      secure: process.env.NODE_ENV === 'production', // Secure cookie in production (HTTPS only)
    },
  },
});

// const session = await lucia.getSession("randomstring1");

// console.log(session);
// Output:
// {
//   sessionId: "randomstring1",
//   userId: "user123",
//   expires: null,
//   createdAt: 2025-06-11T12:00:00.000Z,
//   updatedAt: 2025-06-11T12:00:00.000Z
// }
