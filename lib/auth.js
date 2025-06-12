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

export async function createAuthSession(userId) {
  // Create a new session for the given user ID using Lucia
  const session = await lucia.createSession(userId, {});

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
    sessionCookie.name, // string - by default it will be 'auth_session' from lucia
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

// Exporting an async function to verify user authentication
export async function verifyAuth() {
  // Get the session cookie sent from the user's browser.
  // This cookie contains the session ID used to validate the user's session.
  const sessionCookie = cookies().get(lucia.sessionCookieName);

  // If the session cookie does not exist, return null values for user and session
  if (!sessionCookie) {
    return {
      user: null,
      session: null,
    };
  }

  // Extract the session ID value from the cookie
  const sessionId = sessionCookie.value; // Output: a1b2c3d4e5f6g7h8i9j0

  // If the session ID is missing, return null values for user and session.
  // This can happen if the user has a session cookie but its value is empty or invalid,
  // for example: "session=" (empty string) or cookie missing the session ID entirely.
  if (!sessionId) {
    return {
      user: null,
      session: null,
    };
  }
  // Validate the session using Lucia with the given session ID
  // This checks the session ID sent from the user's browser against the database,
  // ensuring the session exists and is still valid.
  const result = await lucia.validateSession(sessionId);
  // result:
  // {
  //   user: { ... } | null,
  //   session: { id, userId, expiresAt, fresh, ... } | null
  // }

  try {
    // If the session is valid and marked as "fresh" (meaning it was created recently, close to its creation time),
    // we refresh the session cookie to extend its expiration.
    // This helps keep active users logged in by renewing the session before it ages out,
    // and because it's a new session, it should receive the full expiration time.
    // At the same time, we avoid unnecessary cookie updates for sessions that are still valid but not fresh.
    if (result.session && result.session.fresh) {
      const sessionCookie = lucia.createSessionCookie(result.session.id);

      // Set the new session cookie with the correct name, value, and attributes
      (await cookies()).set(
        sessionCookie.name, // The name of the cookie (e.g., 'auth_session')
        sessionCookie.value, // The session ID value
        sessionCookie.attributes // Cookie attributes like path, maxAge, etc.
      );
    }

    // If the session is not valid, set a blank session cookie to clear it from the browser
    if (!result.session) {
      const sessionCookie = lucia.createBlankSessionCookie();
      (await cookies()).set(
        sessionCookie.name, // The cookie name to clear
        sessionCookie.value, // The blank value
        sessionCookie.attributes // Attributes to expire or remove the cookie
      );
    }
    // Ignore errors during cookie setting to prevent disruptions caused by issues like invalid cookie attributes,
    // browser restrictions, or environment limitations. This ensures the app continues smoothly even if cookie update fails.
  } catch {}

  // Return the result which includes user and session data (or nulls if invalid)
  return result;
}

// Async function to log out the user by invalidating their session and clearing the session cookie
export async function destroySession() {
  // Call verifyAuth to check if the user is authenticated
  // Returns an object like:
  // {
  //   user: { ... } | null,
  //   session: { id, userId, expiresAt, fresh, ... } | null
  // }

  const { session } = await verifyAuth();

  // If there's no active session, return an error response
  if (!session) {
    return {
      error: 'Unauthorized!',
    };
  }

  // Invalidate the session on the server side — mark it as no longer valid in the DB or session store
  lucia.invalidateSession(session.id);

  // Generate a "blank" session cookie with attributes that cause the browser to remove it
  const sessionCookie = lucia.createBlankSessionCookie();

  // Set the blank cookie in the user's browser to clear the original session cookie
  (await cookies()).set(
    sessionCookie.name, // The name of the cookie to clear (e.g., "auth_session")
    sessionCookie.value, // A blank or null value to invalidate the cookie
    sessionCookie.attributes // Attributes like `expires` to force cookie removal
  );
}
