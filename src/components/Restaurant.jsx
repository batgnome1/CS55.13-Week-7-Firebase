"use client";

// This component shows one individual restaurant
// It receives data from src/app/restaurant/[id]/page.jsx

import { React, useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import { getRestaurantSnapshotById } from "@/src/lib/firebase/firestore.js";
import { useUser } from "@/src/lib/getUser";
import RestaurantDetails from "@/src/components/RestaurantDetails.jsx";
import { updateRestaurantImage } from "@/src/lib/firebase/storage.js";

// Dynamically import ReviewDialog to enable code splitting and lazy loading
const ReviewDialog = dynamic(() => import("@/src/components/ReviewDialog.jsx"));

/**
 * Restaurant Component
 * Displays a single restaurant with details, image upload, and review functionality
 * 
 * @param {string} id - The restaurant's unique identifier
 * @param {object} initialRestaurant - Initial restaurant data from server-side rendering
 * @param {string} initialUserId - Initial user ID for server-side rendering
 * @param {React.ReactNode} children - Child components to render within RestaurantDetails
 */
export default function Restaurant({
  id,
  initialRestaurant,
  initialUserId,
  children,
}) {
  // State for restaurant details, initialized with server-side data
  const [restaurantDetails, setRestaurantDetails] = useState(initialRestaurant);
  
  // State to control the review dialog visibility
  const [isOpen, setIsOpen] = useState(false);

  // Get current user ID - prioritize client-side user over initial server-side user
  // The only reason this component needs to know the user ID is to associate a review with the user, and to know whether to show the review dialog
  const userId = useUser()?.uid || initialUserId;
  
  // State for managing review form data
  const [review, setReview] = useState({
    rating: 0,
    text: "",
  });

  /**
   * Handle changes to review form fields
   * Updates the review state with new values while preserving other fields
   * 
   * @param {string|number} value - The new value for the field
   * @param {string} name - The name of the field to update ('rating' or 'text')
   */
  const onChange = (value, name) => {
    setReview({ ...review, [name]: value });
  };

  /**
   * Handle restaurant image upload
   * Processes the selected image file and updates the restaurant's photo
   * 
   * @param {EventTarget} target - The file input element containing the selected image
   */
  async function handleRestaurantImage(target) {
    // Extract the first selected file from the input
    const image = target.files ? target.files[0] : null;
    if (!image) {
      return;
    }

    // Upload image to Firebase Storage and get the download URL
    const imageURL = await updateRestaurantImage(id, image);
    
    // Update restaurant details with the new image URL
    setRestaurantDetails({ ...restaurantDetails, photo: imageURL });
  }

  /**
   * Handle closing the review dialog
   * Closes the dialog and resets the review form to initial state
   */
  const handleClose = () => {
    setIsOpen(false);
    setReview({ rating: 0, text: "" });
  };

  /**
   * Set up real-time listener for restaurant data changes
   * Listens for updates to the restaurant document in Firestore
   */
  useEffect(() => {
    // Return the cleanup function from the snapshot listener
    return getRestaurantSnapshotById(id, (data) => {
      setRestaurantDetails(data);
    });
  }, [id]); // Re-run when restaurant ID changes

  return (
    <>
      {/* Main restaurant details component */}
      <RestaurantDetails
        restaurant={restaurantDetails}
        userId={userId}
        handleRestaurantImage={handleRestaurantImage}
        setIsOpen={setIsOpen}
        isOpen={isOpen}
      >
        {children}
      </RestaurantDetails>
      
      {/* Conditionally render review dialog only for authenticated users */}
      {userId && (
        <Suspense fallback={<p>Loading...</p>}>
          <ReviewDialog
            isOpen={isOpen}
            handleClose={handleClose}
            review={review}
            onChange={onChange}
            userId={userId}
            id={id}
          />
        </Suspense>
      )}
    </>
  );
}
