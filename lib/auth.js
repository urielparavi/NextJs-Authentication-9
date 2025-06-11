import { BetterSqlite3Adapter } from '@lucia-auth/adapter-sqlite'; // Import SQLite adapter for Lucia
import { Lucia } from 'lucia'; // Import Lucia authentication library

import db from './db'; // Import the SQLite database instance
import { cookies } from 'next/headers';

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

// // The session object returned from Lucia
// const session = await lucia.getSession("randomstring1");

// console.log(session);
// // Output:
// // {
// //   sessionId: "randomstring1",
// //   userId: "user123",
// //   expires: null,
// //   createdAt: 2025-06-11T12:00:00.000Z,
// //   updatedAt: 2025-06-11T12:00:00.000Z
// // }

// // The user that is associated with the session for example
// const user = {
//   id: 'user123', // Must match session.userId
//   email: 'foo@bar.com', // User's unique email address
//   password: '$2b$10$8Gx...hashExample', // Hashed password (use bcrypt or similar)
// };

export async function createAuthSession(userId) {
  // Create a new session for the given user ID using Lucia
  const session = await lucia.createSession(userId, {});

  // Create a session cookie using session.id, the unique session identifier returned by Lucia.
  // This ID links the client to the server session and is stored in the cookie to maintain authentication.
  // Using session.id directly ensures it's fresh and secure (not from an external or untrusted source).
  const sessionCookie = lucia.createSessionCookie(session.id);

  // The sessionCookie for example
  // {
  //   name: "session",              // The name of the cookie
  //   value: "randomstring1",       // The cookie value (the sessionId)
  //   attributes: {                 // Cookie attributes/settings
  //     path: "/",                 // The path where the cookie is valid
  //     httpOnly: true,            // Cookie inaccessible to JavaScript on the client
  //     secure: true,              // Cookie sent only over HTTPS (usually in production)
  //     sameSite: "lax",           // SameSite policy to help prevent CSRF attacks
  //     maxAge: null               // Cookie lifetime; null means session cookie (expires when browser closes)
  //   }
  // }

  // Retrieve the cookies interface and set the session cookie with its name, value, and attributes.
  // This sends the session ID to the client as a secure, HTTP-only cookie that lasts for the browser session.
  (await cookies()).set(
    // We don't pass the whole sessionCookie object because cookies().set()
    // requires the name, value, and attributes to be passed separately.
    sessionCookie.name, // string
    sessionCookie.value, // string
    sessionCookie.attributes // object

    //     sessionCookie.name
    //     Output:
    //     "session"

    //     sessionCookie.value
    //     Output:
    //     "a1b2c3d4e5f6g7h8i9j0"  (this is the session ID)

    //     sessionCookie.attributes
    //     Output:
    //     {
    //       path: "/",            // Cookie is valid for all routes in the app
    //       httpOnly: true,       // JavaScript in the browser cannot access it
    //       secure: true,         // Only sent over HTTPS (secure connections)
    //       sameSite: "lax",      // Helps prevent CSRF attacks
    //       maxAge: null          // Session cookie (expires when browser is closed)
    //     }
  );
}
