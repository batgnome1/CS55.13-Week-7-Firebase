"use client";

// This component handles the review dialog and uses a Next.js feature known as Server Actions to handle the form submission

import { useLayoutEffect, useRef } from "react";
import RatingPicker from "@/src/components/RatingPicker.jsx";
import { handleReviewFormSubmission } from "@/src/app/actions.js";

/**
 * ReviewDialog Component
 * A modal dialog component for adding restaurant reviews
 * 
 * @param {boolean} isOpen - Controls whether the dialog is visible
 * @param {function} handleClose - Function to close the dialog
 * @param {object} review - Current review object containing text and rating
 * @param {function} onChange - Function to handle changes to review fields
 * @param {string} userId - ID of the user submitting the review
 * @param {string} id - ID of the restaurant being reviewed
 */
const ReviewDialog = ({
  isOpen,
  handleClose,
  review,
  onChange,
  userId,
  id,
}) => {
  // Reference to the dialog DOM element for programmatic control
  const dialog = useRef();

  // Use useLayoutEffect to synchronously update the dialog's modal state
  // This ensures the dialog backdrop renders immediately when opened
  useLayoutEffect(() => {
    if (isOpen) {
      // Show the modal dialog with backdrop
      dialog.current.showModal();
    } else {
      // Close the modal dialog
      dialog.current.close();
    }
  }, [isOpen, dialog]); // Re-run when isOpen state changes

  /**
   * Handle clicks on the dialog backdrop
   * Closes the dialog when user clicks outside the modal content
   * 
   * @param {Event} e - The click event
   */
  const handleClick = (e) => {
    // Check if the click target is the dialog backdrop (not the content)
    if (e.target === dialog.current) {
      handleClose();
    }
  };

  return (
    // Dialog element with backdrop click handling
    <dialog ref={dialog} onMouseDown={handleClick}>
      {/* Form using Next.js Server Actions for submission */}
      <form
        action={handleReviewFormSubmission}
        onSubmit={(e) => {
            // Extract form data before submission for debugging
            const text = e.target.text.value;
            const rating = e.target.rating.value;
            const userId = e.target.userId.value;
            const restId = e.target.restaurantId.value;
            // Log form data for debugging purposes
            console.log("Review text being sent:", text, "/", rating, "/", userId, "/", restId);
            // Close dialog after form submission
            handleClose();
        }}
      >
        {/* Dialog header with title */}
        <header>
          <h3>Add your review</h3>
        </header>
        
        {/* Main form content */}
        <article>
          {/* Rating picker component for selecting star rating */}
          <RatingPicker />

          {/* Text input for review content */}
          <p>
            <input
              type="text"
              name="text"
              id="review"
              placeholder="Write your thoughts here"
              required
              value={review.text}
              onChange={(e) => onChange(e.target.value, "text")}
            />
          </p>

          {/* Hidden inputs to pass restaurant and user IDs to server action */}
          <input type="hidden" name="restaurantId" value={id} />
          <input type="hidden" name="userId" value={userId} />
        </article>
        
        {/* Dialog footer with action buttons */}
        <footer>
          <menu>
            {/* Cancel button that resets form and closes dialog */}
            <button
              autoFocus
              type="reset"
              onClick={handleClose}
              className="button--cancel"
            >
              Cancel
            </button>
            {/* Submit button to send form data to server action */}
            <button type="submit" value="confirm" className="button--confirm">
              Submit
            </button>
          </menu>
        </footer>
      </form>
    </dialog>
  );
};

// Export the ReviewDialog component as the default export
export default ReviewDialog;
