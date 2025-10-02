// This directive tells Next.js that this component should run on the client side
// Required for components that use browser APIs, event handlers, or state
"use client";

// Import React and useEffect hook for managing component lifecycle
import React, { useEffect } from "react";
// Import Next.js Link component for client-side navigation
import Link from "next/link";
// Import Firebase authentication functions
import {
  signInWithGoogle, // Function to sign in with Google OAuth
  signOut, // Function to sign out the current user
  onIdTokenChanged, // Firebase listener for authentication state changes
} from "@/src/lib/firebase/auth.js";
// Import function to add sample data for development/testing
import { addFakeRestaurantsAndReviews } from "@/src/lib/firebase/firestore.js";
// Import cookie utilities for managing session cookies
import { setCookie, deleteCookie } from "cookies-next";

/**
 * Custom hook to manage user session state and authentication tokens
 * This hook handles the synchronization between Firebase auth state and session cookies
 * @param {Object} initialUser - The initial user object from server-side rendering
 * @returns {Object} The current user object
 */
function useUserSession(initialUser) {
  useEffect(() => {
    // Set up a listener for Firebase authentication state changes
    return onIdTokenChanged(async (user) => {
      if (user) {
        // User is signed in - get their ID token and store it in a cookie
        const idToken = await user.getIdToken();
        await setCookie("__session", idToken);
      } else {
        // User is signed out - remove the session cookie
        await deleteCookie("__session");
      }
      
      // If the user hasn't changed, don't reload the page
      if (initialUser?.uid === user?.uid) {
        return;
      }
      
      // User state has changed - reload the page to update server-side state
      window.location.reload();
    });
  }, [initialUser]); // Re-run effect when initialUser changes

  return initialUser;
}

/**
 * Header component that displays the app logo and user authentication controls
 * Shows different content based on whether a user is signed in or not
 * @param {Object} props - Component props
 * @param {Object} props.initialUser - The initial user object from server-side rendering
 * @returns {JSX.Element} The rendered header component
 */
export default function Header({ initialUser }) {
  // Use the custom hook to manage user session state
  const user = useUserSession(initialUser);

  /**
   * Handle user sign out action
   * Prevents default link behavior and calls the sign out function
   * @param {Event} event - The click event
   */
  const handleSignOut = (event) => {
    event.preventDefault(); // Prevent the default link navigation
    signOut(); // Call Firebase sign out function
  };

  /**
   * Handle user sign in action
   * Prevents default link behavior and initiates Google sign in
   * @param {Event} event - The click event
   */
  const handleSignIn = (event) => {
    event.preventDefault(); // Prevent the default link navigation
    signInWithGoogle(); // Call Firebase Google sign in function
  };

  return (
    <header>
      {/* App logo and title - links back to home page */}
      <Link href="/" className="logo">
        <img src="/friendly-eats.svg" alt="FriendlyEats" />
        Friendly Eats
      </Link>
      
      {/* Conditional rendering based on user authentication state */}
      {user ? (
        // User is signed in - show profile information and menu
        <>
          <div className="profile">
            {/* Display user's profile picture and name */}
            <p>
              <img
                className="profileImage"
                src={user.photoURL || "/profile.svg"} // Use user's photo or default placeholder
                alt={user.email}
              />
              {user.displayName}
            </p>

            {/* Dropdown menu with user options */}
            <div className="menu">
              ...
              <ul>
                {/* Display user's name in the menu */}
                <li>{user.displayName}</li>

                {/* Option to add sample data (for development/testing) */}
                <li>
                  <a href="#" onClick={addFakeRestaurantsAndReviews}>
                    Add sample restaurants
                  </a>
                </li>

                {/* Sign out option */}
                <li>
                  <a href="#" onClick={handleSignOut}>
                    Sign Out
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </>
      ) : (
        // User is not signed in - show sign in option
        <div className="profile">
          <a href="#" onClick={handleSignIn}>
            <img src="/profile.svg" alt="A placeholder user image" />
            Sign In with Google
          </a>
        </div>
      )}
    </header>
  );
}
