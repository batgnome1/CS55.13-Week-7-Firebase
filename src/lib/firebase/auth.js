// Import Firebase authentication functions and providers
import {
  GoogleAuthProvider, // Provider for Google OAuth authentication
  signInWithPopup, // Function to sign in using a popup window
  onAuthStateChanged as _onAuthStateChanged, // Listener for authentication state changes (renamed to avoid conflicts)
  onIdTokenChanged as _onIdTokenChanged, // Listener for ID token changes (renamed to avoid conflicts)
} from "firebase/auth";

// Import the Firebase auth instance from the client app configuration
import { auth } from "@/src/lib/firebase/clientApp";

/**
 * Wrapper function for Firebase's onAuthStateChanged listener
 * This function sets up a listener that triggers whenever the user's authentication state changes
 * (e.g., when they sign in, sign out, or when the auth state is restored from storage)
 * @param {Function} cb - Callback function that receives the current user object (or null if signed out)
 * @returns {Function} Unsubscribe function to stop listening to auth state changes
 */
export function onAuthStateChanged(cb) {
  return _onAuthStateChanged(auth, cb);
}

/**
 * Wrapper function for Firebase's onIdTokenChanged listener
 * This function sets up a listener that triggers whenever the user's ID token changes
 * ID tokens are used for server-side authentication and are refreshed automatically
 * @param {Function} cb - Callback function that receives the current user object (or null if signed out)
 * @returns {Function} Unsubscribe function to stop listening to ID token changes
 */
export function onIdTokenChanged(cb) {
  return _onIdTokenChanged(auth, cb);
}

/**
 * Sign in a user with Google OAuth using a popup window
 * This function initiates the Google sign-in flow by opening a popup window
 * where the user can authenticate with their Google account
 * @returns {Promise<void>} Promise that resolves when sign-in is complete or rejects on error
 */
export async function signInWithGoogle() {
  // Create a new Google authentication provider instance
  const provider = new GoogleAuthProvider();

  try {
    // Attempt to sign in using the popup method with the Google provider
    // This will open a popup window for the user to authenticate with Google
    await signInWithPopup(auth, provider);
  } catch (error) {
    // Log any errors that occur during the sign-in process
    // Common errors include: popup blocked, user cancelled, network issues
    console.error("Error signing in with Google", error);
  }
}

/**
 * Sign out the currently authenticated user
 * This function signs out the user from Firebase authentication
 * After signing out, the user will need to sign in again to access protected resources
 * @returns {Promise<void>} Promise that resolves when sign-out is complete or rejects on error
 */
export async function signOut() {
  try {
    // Call Firebase's signOut method to sign out the current user
    return auth.signOut();
  } catch (error) {
    // Log any errors that occur during the sign-out process
    console.error("Error signing out with Google", error);
  }
}
