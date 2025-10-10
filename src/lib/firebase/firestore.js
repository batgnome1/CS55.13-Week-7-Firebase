// Import function to generate fake restaurant and review data for development/testing
import { generateFakeRestaurantsAndReviews } from "@/src/lib/fakeRestaurants.js";

// Import Firebase Firestore functions for database operations
import {
  collection, // Reference to a collection in Firestore
  onSnapshot, // Real-time listener for document changes
  query, // Create a query for filtering and sorting documents
  getDocs, // Get all documents from a query
  doc, // Reference to a specific document
  getDoc, // Get a single document
  updateDoc, // Update a document's fields
  orderBy, // Sort documents by a field
  Timestamp, // Firebase timestamp type
  runTransaction, // Execute operations in a transaction
  where, // Filter documents by field values
  addDoc, // Add a new document to a collection
  getFirestore, // Get Firestore instance
} from "firebase/firestore";

// Import the Firestore database instance from the client app configuration
import { db } from "@/src/lib/firebase/clientApp";

/**
 * Update a restaurant's image reference in Firestore
 * This function updates the photo URL field of a restaurant document
 * @param {string} restaurantId - The ID of the restaurant to update
 * @param {string} publicImageUrl - The public URL of the uploaded image
 * @returns {Promise<void>} Promise that resolves when the update is complete
 */
export async function updateRestaurantImageReference(
  restaurantId,
  publicImageUrl
) {
  // Create a reference to the specific restaurant document
  const restaurantRef = doc(collection(db, "restaurants"), restaurantId);
  if (restaurantRef) {
    // Update the photo field with the new image URL
    await updateDoc(restaurantRef, { photo: publicImageUrl });
  }
}

/**
 * Helper function to update restaurant rating statistics within a transaction
 * This function is currently a placeholder and not implemented
 * @param {Object} transaction - Firestore transaction object
 * @param {Object} docRef - Reference to the restaurant document
 * @param {Object} newRatingDocument - The new rating document being added
 * @param {Object} review - The review data
 * @returns {Promise<void>} Promise that resolves when the transaction is complete
 */
const updateWithRating = async (
  transaction,
  docRef,
  newRatingDocument,
  review
) => {
  return;
};

export async function addReviewToRestaurant(db, restaurantId, review) {
  return;
}


/**
 * Add a review to a restaurant and update its rating statistics
 * This function is currently a placeholder and not implemented
 * @param {Object} db - Firestore database instance
 * @param {string} restaurantId - The ID of the restaurant to add the review to
 * @param {Object} review - The review data to add
 * @returns {Promise<void>} Promise that resolves when the review is added
 */
export async function addReviewToRestaurant(db, restaurantId, review) {
        if (!restaurantId) {
                throw new Error("No restaurant ID has been provided.");
        }

        if (!review) {
                throw new Error("A valid review has not been provided.");
        }

        try {
                const docRef = doc(collection(db, "restaurants"), restaurantId);
                const newRatingDocument = doc(
                        collection(db, `restaurants/${restaurantId}/ratings`)
                );

                // corrected line
                await runTransaction(db, transaction =>
                        updateWithRating(transaction, docRef, newRatingDocument, review)
                );
        } catch (error) {
                console.error(
                        "There was an error adding the rating to the restaurant",
                        error
                );
                throw error;
        }
}



/**
 * Apply filtering and sorting to a Firestore query
 * This function builds a query with filters for category, city, price, and sorting options
 * @param {Object} q - The base Firestore query
 * @param {Object} filters - Filter options object
 * @param {string} filters.category - Filter by restaurant category
 * @param {string} filters.city - Filter by city location
 * @param {string} filters.price - Filter by price level (length of string determines price)
 * @param {string} filters.sort - Sort by "Rating" or "Review" count
 * @returns {Object} The modified query with filters applied
 */
function applyQueryFilters(q, { category, city, price, sort }) {
  // Filter by restaurant category if specified
  if (category) {
    q = query(q, where("category", "==", category));
  }
  // Filter by city if specified
  if (city) {
    q = query(q, where("city", "==", city));
  }
  // Filter by price level (price string length determines the level)
  if (price) {
    q = query(q, where("price", "==", price.length));
  }
  // Sort by average rating (default) or by number of reviews
  if (sort === "Rating" || !sort) {
    q = query(q, orderBy("avgRating", "desc"));
  } else if (sort === "Review") {
    q = query(q, orderBy("numRatings", "desc"));
  }
  return q;
}

/**
 * Get restaurants from Firestore with optional filtering
 * This function performs a one-time read of restaurant data with server-side filtering
 * @param {Object} db - Firestore database instance (defaults to client db)
 * @param {Object} filters - Filter options for the query
 * @returns {Promise<Array>} Promise that resolves to an array of restaurant objects
 */
export async function getRestaurants(db = db, filters = {}) {
  // Create a base query for the restaurants collection
  let q = query(collection(db, "restaurants"));

  // Apply filters to the query
  q = applyQueryFilters(q, filters);
  
  // Execute the query and get all matching documents
  const results = await getDocs(q);
  
  // Transform the documents into plain objects for client components
  return results.docs.map((doc) => {
    return {
      id: doc.id, // Include the document ID
      ...doc.data(), // Spread all document data
      // Convert Firestore timestamp to JavaScript Date object
      // Only plain objects can be passed to Client Components from Server Components
      timestamp: doc.data().timestamp.toDate(),
    };
  });
}

/**
 * Set up a real-time listener for restaurant data changes
 * This function creates a snapshot listener that triggers whenever restaurant data changes
 * @param {Function} cb - Callback function that receives the updated restaurant array
 * @param {Object} filters - Filter options for the query
 * @returns {Function} Unsubscribe function to stop listening to changes
 */
export function getRestaurantsSnapshot(cb, filters = {}) {
  // Validate that the callback is a function
  if (typeof cb !== "function") {
    console.log("Error: The callback parameter is not a function");
    return;
  }

  // Create a base query for the restaurants collection
  let q = query(collection(db, "restaurants"));
  // Apply filters to the query
  q = applyQueryFilters(q, filters);

  // Set up real-time listener for query changes
  return onSnapshot(q, (querySnapshot) => {
    // Transform the documents into plain objects for client components
    const results = querySnapshot.docs.map((doc) => {
      return {
        id: doc.id, // Include the document ID
        ...doc.data(), // Spread all document data
        // Convert Firestore timestamp to JavaScript Date object
        // Only plain objects can be passed to Client Components from Server Components
        timestamp: doc.data().timestamp.toDate(),
      };
    });

    // Call the callback with the transformed results
    cb(results);
  });
}

/**
 * Get a single restaurant by its ID
 * This function performs a one-time read of a specific restaurant document
 * @param {Object} db - Firestore database instance
 * @param {string} restaurantId - The ID of the restaurant to retrieve
 * @returns {Promise<Object>} Promise that resolves to the restaurant object or undefined
 */
export async function getRestaurantById(db, restaurantId) {
  // Validate the restaurant ID
  if (!restaurantId) {
    console.log("Error: Invalid ID received: ", restaurantId);
    return;
  }
  
  // Create a reference to the specific restaurant document
  const docRef = doc(db, "restaurants", restaurantId);
  // Get the document snapshot
  const docSnap = await getDoc(docRef);
  
  // Return the document data with converted timestamp
  return {
    ...docSnap.data(), // Spread all document data
    timestamp: docSnap.data().timestamp.toDate(), // Convert timestamp to Date
  };
}

/**
 * Set up a real-time listener for a specific restaurant's data changes
 * This function is currently a placeholder and not implemented
 * @param {string} restaurantId - The ID of the restaurant to listen to
 * @param {Function} cb - Callback function that receives the updated restaurant data
 * @returns {Function} Unsubscribe function to stop listening to changes
 */
export function getRestaurantSnapshotById(restaurantId, cb) {
  // TODO: Implement real-time listener for single restaurant
  return;
}

/**
 * Get all reviews for a specific restaurant
 * This function performs a one-time read of all reviews for a restaurant, sorted by timestamp
 * @param {Object} db - Firestore database instance
 * @param {string} restaurantId - The ID of the restaurant to get reviews for
 * @returns {Promise<Array>} Promise that resolves to an array of review objects
 */
export async function getReviewsByRestaurantId(db, restaurantId) {
  // Validate the restaurant ID
  if (!restaurantId) {
    console.log("Error: Invalid restaurantId received: ", restaurantId);
    return;
  }

  // Create a query for the restaurant's ratings subcollection, ordered by timestamp (newest first)
  const q = query(
    collection(db, "restaurants", restaurantId, "ratings"),
    orderBy("timestamp", "desc")
  );

  // Execute the query and get all matching documents
  const results = await getDocs(q);
  
  // Transform the documents into plain objects for client components
  return results.docs.map((doc) => {
    return {
      id: doc.id, // Include the document ID
      ...doc.data(), // Spread all document data
      // Convert Firestore timestamp to JavaScript Date object
      // Only plain objects can be passed to Client Components from Server Components
      timestamp: doc.data().timestamp.toDate(),
    };
  });
}

/**
 * Set up a real-time listener for restaurant reviews
 * This function creates a snapshot listener that triggers whenever reviews for a restaurant change
 * @param {string} restaurantId - The ID of the restaurant to listen to reviews for
 * @param {Function} cb - Callback function that receives the updated reviews array
 * @returns {Function} Unsubscribe function to stop listening to changes
 */
export function getReviewsSnapshotByRestaurantId(restaurantId, cb) {
  // Validate the restaurant ID
  if (!restaurantId) {
    console.log("Error: Invalid restaurantId received: ", restaurantId);
    return;
  }

  // Create a query for the restaurant's ratings subcollection, ordered by timestamp (newest first)
  const q = query(
    collection(db, "restaurants", restaurantId, "ratings"),
    orderBy("timestamp", "desc")
  );
  
  // Set up real-time listener for query changes
  return onSnapshot(q, (querySnapshot) => {
    // Transform the documents into plain objects for client components
    const results = querySnapshot.docs.map((doc) => {
      return {
        id: doc.id, // Include the document ID
        ...doc.data(), // Spread all document data
        // Convert Firestore timestamp to JavaScript Date object
        // Only plain objects can be passed to Client Components from Server Components
        timestamp: doc.data().timestamp.toDate(),
      };
    });
    // Call the callback with the transformed results
    cb(results);
  });
}

/**
 * Add fake restaurants and reviews to the database for development/testing
 * This function generates sample data and adds it to Firestore collections
 * @returns {Promise<void>} Promise that resolves when all data is added
 */
export async function addFakeRestaurantsAndReviews() {
  // Generate fake restaurant and review data
  const data = await generateFakeRestaurantsAndReviews();
  
  // Process each restaurant and its associated reviews
  for (const { restaurantData, ratingsData } of data) {
    try {
      // Add the restaurant document to the restaurants collection
      const docRef = await addDoc(
        collection(db, "restaurants"),
        restaurantData
      );

      // Add each review to the restaurant's ratings subcollection
      for (const ratingData of ratingsData) {
        await addDoc(
          collection(db, "restaurants", docRef.id, "ratings"),
          ratingData
        );
      }
    } catch (e) {
      // Log any errors that occur during the data addition process
      console.log("There was an error adding the document");
      console.error("Error adding document: ", e);
    }
  }
}
