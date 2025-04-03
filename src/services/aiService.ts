// import { leaderboardState } from "../stores/leaderboard";
// import { state as scoreState } from "../stores/score";

// // In a real implementation, you would use environment variables for API keys
// const OPENAI_API_KEY = "your-api-key-here";

// export interface GameTip {
//   id: number;
//   content: string;
//   category: "beginner" | "intermediate" | "advanced";
// }

// export interface AIGameAssistant {
//   tips: GameTip[];
//   personalizedAdvice: string | null;
//   isLoading: boolean;
//   error: string | null;
//   fetchTips: () => Promise<void>;
//   generatePersonalizedAdvice: (playerStats: any) => Promise<void>;
// }

// // Mock data for development without API key
// const MOCK_TIPS: GameTip[] = [
//   {
//     id: 1,
//     content: "Focus on dodging obstacles rather than racing ahead.",
//     category: "beginner",
//   },
//   {
//     id: 2,
//     content: "Try to maintain a steady pace instead of rapid movements.",
//     category: "beginner",
//   },
//   {
//     id: 3,
//     content: "Look ahead at upcoming obstacles to plan your route.",
//     category: "intermediate",
//   },
//   {
//     id: 4,
//     content: "Practice quick directional changes to navigate tight spaces.",
//     category: "intermediate",
//   },
//   {
//     id: 5,
//     content: "Learn obstacle patterns to anticipate what's coming next.",
//     category: "advanced",
//   },
//   {
//     id: 6,
//     content: "Develop muscle memory for the controls to react instantly.",
//     category: "advanced",
//   },
// ];

// const MOCK_ADVICE = [
//   "Based on your recent scores, try focusing more on consistent movement patterns.",
//   "Your gameplay shows good survival skills. Work on increasing your speed while maintaining control.",
//   "You're making great progress! Try challenging yourself with more difficult levels.",
//   "I notice you often struggle in the early game. Focus on starting slower and building momentum.",
// ];

// // Game Assistant service
// export const aiGameAssistant: AIGameAssistant = {
//   tips: [],
//   personalizedAdvice: null,
//   isLoading: false,
//   error: null,

//   // Fetch general game tips
//   fetchTips: async () => {
//     aiGameAssistant.isLoading = true;
//     aiGameAssistant.error = null;

//     try {
//       // For development/demo purposes, use mock data
//       // In production, uncomment the fetch code below

//       /* 
//       const response = await fetch('https://api.openai.com/v1/completions', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${OPENAI_API_KEY}`
//         },
//         body: JSON.stringify({
//           model: "gpt-3.5-turbo",
//           messages: [
//             {
//               role: "system",
//               content: "You are a helpful gaming assistant. Provide 6 tips for playing a tank obstacle avoidance game. Format as JSON array with id, content, and category fields."
//             }
//           ],
//           max_tokens: 500
//         })
//       });
      
//       if (!response.ok) {
//         throw new Error('Failed to fetch tips from OpenAI');
//       }
      
//       const data = await response.json();
//       aiGameAssistant.tips = JSON.parse(data.choices[0].message.content);
//       */

//       // Use mock data instead
//       await new Promise((resolve) => setTimeout(resolve, 700)); // Simulate API delay
//       aiGameAssistant.tips = MOCK_TIPS;
//     } catch (error) {
//       console.error("Error fetching game tips:", error);
//       aiGameAssistant.error =
//         "Failed to load game tips. Please try again later.";
//       aiGameAssistant.tips = MOCK_TIPS; // Fallback to mock data on error
//     } finally {
//       aiGameAssistant.isLoading = false;
//     }
//   },

//   // Generate personalized advice based on player statistics
//   generatePersonalizedAdvice: async (playerStats) => {
//     aiGameAssistant.isLoading = true;
//     aiGameAssistant.error = null;

//     try {
//       // Gather player data for AI analysis
//       const playerName = leaderboardState.playerName || "Player";
//       const currentScore = scoreState.value;
//       const scoreHistory = leaderboardState.scores
//         .filter((entry) => entry.name === playerName)
//         .map((entry) => entry.score);

//       const averageScore =
//         scoreHistory.length > 0
//           ? scoreHistory.reduce((sum, score) => sum + score, 0) /
//             scoreHistory.length
//           : 0;

//       // For development/demo purposes, use mock data
//       // In production, uncomment the fetch code below

//       /*
//       const response = await fetch('https://api.openai.com/v1/chat/completions', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${OPENAI_API_KEY}`
//         },
//         body: JSON.stringify({
//           model: "gpt-3.5-turbo",
//           messages: [
//             {
//               role: "system",
//               content: "You are a helpful gaming coach. Provide personalized advice based on player statistics."
//             },
//             {
//               role: "user",
//               content: `Player: ${playerName}
//                         Current Score: ${currentScore}
//                         Average Score: ${averageScore}
//                         Score History: ${JSON.stringify(scoreHistory)}
//                         Please provide personalized gaming advice in 1-2 sentences.`
//             }
//           ],
//           max_tokens: 150
//         })
//       });
      
//       if (!response.ok) {
//         throw new Error('Failed to generate advice');
//       }
      
//       const data = await response.json();
//       aiGameAssistant.personalizedAdvice = data.choices[0].message.content;
//       */

//       // Use mock data instead
//       await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API delay
//       const randomAdvice =
//         MOCK_ADVICE[Math.floor(Math.random() * MOCK_ADVICE.length)];
//       aiGameAssistant.personalizedAdvice = randomAdvice;
//     } catch (error) {
//       console.error("Error generating personalized advice:", error);
//       aiGameAssistant.error =
//         "Failed to generate advice. Please try again later.";

//       // Fallback to generic advice
//       aiGameAssistant.personalizedAdvice =
//         "Focus on improving your reaction time and planning your movements.";
//     } finally {
//       aiGameAssistant.isLoading = false;
//     }
//   },
// };
