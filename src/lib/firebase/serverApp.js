// This import enforces that this code can only be called on the server
// It prevents this module from being accidentally imported in client-side code
// https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns#keeping-server-only-code-out-of-the-client-environment
import "server-only";

// Import Next.js cookies function to access server-side cookies
import { cookies } from "next/headers";
// Import Firebase app initialization functions
import { initializeServerApp, initializeApp } from "firebase/app";

// Import Firebase authentication functions
import { getAuth } from "firebase/auth";

/**
 * Get an authenticated Firebase app instance for server-side operations
 * This function creates a Firebase server app with the user's authentication token
 * from cookies, allowing server-side code to perform authenticated operations
 * 
 * @returns {Promise<Object>} Promise that resolves to an object containing:
 *   - firebaseServerApp: The authenticated Firebase server app instance
 *   - currentUser: The current authenticated user object (or null if not authenticated)
 */
export async function getAuthenticatedAppForUser() {
  // Get the authentication ID token from the "__session" cookie
  // This token was set by the client-side authentication flow
  const authIdToken = (await cookies()).get("__session")?.value;

  // Firebase Server App is a new feature in the JS SDK that allows you to
  // instantiate the SDK with credentials retrieved from the client & has
  // other affordances for use in server environments.
  const firebaseServerApp = initializeServerApp(
    // Initialize a base Firebase app first (required for server app initialization)
    // https://github.com/firebase/firebase-js-sdk/issues/8863#issuecomment-2751401913
    initializeApp(),
    {
      authIdToken, // Pass the ID token to authenticate the server app
    }
  );

  // Get the authentication instance from the server app
  const auth = getAuth(firebaseServerApp);
  
  // Wait for the authentication state to be ready
  // This ensures that the auth state is fully initialized before proceeding
  await auth.authStateReady();

  // Return both the server app instance and the current user
  // The currentUser will be null if no valid token was provided or if the user is not authenticated
  return { firebaseServerApp, currentUser: auth.currentUser };
}
