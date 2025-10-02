// Import the RestaurantListings component that will display the list of restaurants
import RestaurantListings from "@/src/components/RestaurantListings.jsx";
// Import the getRestaurants function to fetch restaurant data from Firestore
import { getRestaurants } from "@/src/lib/firebase/firestore.js";
// Import the function to get an authenticated Firebase app instance for server-side operations
import { getAuthenticatedAppForUser } from "@/src/lib/firebase/serverApp.js";
// Import Firestore from Firebase to create a database instance
import { getFirestore } from "firebase/firestore";

// Force next.js to treat this route as server-side rendered
// Without this line, during the build process, next.js will treat this route as static and build a static HTML file for it
// This ensures the page is rendered on the server for each request, allowing dynamic content
export const dynamic = "force-dynamic";

// Alternative way to force server-side rendering (currently commented out)
// This would also prevent static generation and force revalidation on every request
// export const revalidate = 0;

/**
 * Home page component - the main landing page for the restaurant app
 * This is an async server component that fetches restaurant data on the server
 * @param {Object} props - Component props from Next.js
 * @param {Promise<Object>} props.searchParams - URL search parameters for filtering
 * @returns {JSX.Element} The rendered home page with restaurant listings
 */
export default async function Home(props) {
  // Extract search parameters from the URL (e.g., ?city=London&category=Indian&sort=Review)
  // These parameters are used for filtering restaurants on the server-side
  const searchParams = await props.searchParams;
  
  // Get an authenticated Firebase app instance for server-side operations
  // This ensures we have proper authentication context when accessing Firestore
  const { firebaseServerApp } = await getAuthenticatedAppForUser();
  
  // Fetch restaurants from Firestore using the server app and search parameters
  // The searchParams allow for server-side filtering by city, category, price, etc.
  const restaurants = await getRestaurants(
    getFirestore(firebaseServerApp), // Create a Firestore instance from the server app
    searchParams // Pass search parameters for filtering
  );
  
  // Render the main page with restaurant listings
  return (
    <main className="main__home">
      <RestaurantListings
        initialRestaurants={restaurants} // Pass the fetched restaurants as initial data
        searchParams={searchParams} // Pass search parameters to the component for client-side filtering
      />
    </main>
  );
}
