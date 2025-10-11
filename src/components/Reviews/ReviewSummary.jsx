// Import AI/ML libraries for generating review summaries
import { gemini20Flash, googleAI } from "@genkit-ai/googleai";
import { genkit } from "genkit";

// Import Firebase utilities for data access
import { getReviewsByRestaurantId } from "@/src/lib/firebase/firestore.js";
import { getAuthenticatedAppForUser } from "@/src/lib/firebase/serverApp";
import { getFirestore } from "firebase/firestore";

/**
 * GeminiSummary Component
 * Uses Google's Gemini AI to generate a one-sentence summary of restaurant reviews
 * This is a server-side component that fetches reviews and processes them with AI
 * 
 * @param {string} restaurantId - The unique identifier of the restaurant
 * @returns {Promise<JSX.Element>} A React component displaying the AI-generated summary
 */
export async function GeminiSummary({ restaurantId }) {
  // Get authenticated Firebase app instance for server-side operations
  const { firebaseServerApp } = await getAuthenticatedAppForUser();
  
  // Fetch all reviews for the specified restaurant from Firestore
  const reviews = await getReviewsByRestaurantId(
    getFirestore(firebaseServerApp),
    restaurantId
  );

  // Define separator character to distinguish between individual reviews in the prompt
  const reviewSeparator = "@";
  
  // Construct the prompt for the AI model
  // The prompt instructs Gemini to create a one-sentence summary from all reviews
  const prompt = `
    Based on the following restaurant reviews, 
    where each review is separated by a '${reviewSeparator}' character, 
    create a one-sentence summary of what people think of the restaurant. 

    Here are the reviews: ${reviews.map((review) => review.text).join(reviewSeparator)}
  `;

  try {
    // Validate that the required API key is configured
    if (!process.env.GEMINI_API_KEY) {
      // Make sure GEMINI_API_KEY environment variable is set:
      // https://firebase.google.com/docs/genkit/get-started
      throw new Error(
        'GEMINI_API_KEY not set. Set it with "firebase apphosting:secrets:set GEMINI_API_KEY"'
      );
    }

    // Configure a Genkit AI instance with Google AI plugin
    const ai = genkit({
      plugins: [googleAI()],
      model: gemini20Flash, // Set default model to Gemini 2.0 Flash
    });
    
    // Generate the summary using the AI model
    const { text } = await ai.generate(prompt);

    // Return the summary component with AI-generated text
    return (
      <div className="restaurant__review_summary">
        <p>{text}</p>
        <p>✨ Summarized with Gemini</p>
      </div>
    );
  } catch (e) {
    // Log the error for debugging purposes
    console.error(e);
    
    // Return error message if AI summarization fails
    return <p>Error summarizing reviews.</p>;
  }
}


/**
 * GeminiSummarySkeleton Component
 * A loading skeleton component displayed while the AI summary is being generated
 * Provides visual feedback to users during the async AI processing
 * 
 * @returns {JSX.Element} A loading indicator component
 */
export function GeminiSummarySkeleton() {
  return (
    <div className="restaurant__review_summary">
      <p>✨ Summarizing reviews with Gemini...</p>
    </div>
  );
}
