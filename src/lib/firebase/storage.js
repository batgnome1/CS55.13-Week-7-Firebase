/**
 * Firebase Storage Operations Module
 * 
 * This module provides functions for handling file uploads to Firebase Storage,
 * specifically for restaurant images. It handles the complete workflow of
 * uploading images and updating database references.
 * 
 * Key Features:
 * - Restaurant image uploads to Firebase Storage
 * - Automatic file path generation and organization
 * - Database reference updates after successful uploads
 * - Error handling and validation
 */

// Import Firebase Storage functions for file operations
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

// Import the Firebase Storage instance from the client app configuration
import { storage } from "@/src/lib/firebase/clientApp";

// Import Firestore function to update restaurant image references
import { updateRestaurantImageReference } from "@/src/lib/firebase/firestore";

/**
 * Update a restaurant's image by uploading to Firebase Storage and updating the database
 * This function handles the complete workflow of image upload and database reference update
 * 
 * @param {string} restaurantId - The unique identifier of the restaurant
 * @param {File} image - The image file to upload (from file input)
 * @returns {Promise<string|undefined>} Promise that resolves to the public image URL, or undefined if error
 */
export async function updateRestaurantImage(restaurantId, image) {
  try {
    // Validate that a restaurant ID is provided
    if (!restaurantId) {
      throw new Error("No restaurant ID has been provided.");
    }

    // Validate that a valid image file is provided
    if (!image || !image.name) {
      throw new Error("A valid image has not been provided.");
    }

    // Upload the image to Firebase Storage and get the public URL
    const publicImageUrl = await uploadImage(restaurantId, image);
    
    // Update the restaurant document in Firestore with the new image URL
    await updateRestaurantImageReference(restaurantId, publicImageUrl);

    // Return the public URL for immediate use in the UI
    return publicImageUrl;
  } catch (error) {
    // Log the error for debugging purposes
    console.error("Error processing request:", error);
    
    // Return undefined to indicate failure (caller should handle this)
    return undefined;
  }
}

/**
 * Upload an image file to Firebase Storage
 * This is a helper function that handles the actual file upload process
 * 
 * @param {string} restaurantId - The unique identifier of the restaurant
 * @param {File} image - The image file to upload
 * @returns {Promise<string>} Promise that resolves to the public download URL
 */
async function uploadImage(restaurantId, image) {
  // Create a structured file path for organization: images/{restaurantId}/{filename}
  // This keeps images organized by restaurant and prevents naming conflicts
  const filePath = `images/${restaurantId}/${image.name}`;
  
  // Create a reference to the file location in Firebase Storage
  const newImageRef = ref(storage, filePath);
  
  // Upload the file to Firebase Storage using resumable upload
  // Resumable uploads are better for larger files and provide progress tracking
  await uploadBytesResumable(newImageRef, image);

  // Get the public download URL for the uploaded file
  // This URL can be used directly in img src attributes or shared publicly
  return await getDownloadURL(newImageRef);
}
