// import React, { useEffect, useState } from "react";
// import { aiGameAssistant, GameTip } from "../services/aiService";
// import { sfxState } from "../stores/sfxState";
// import "../styles/GameAssistant.css";

// export const GameAssistant: React.FC = () => {
//   const [loading, setLoading] = useState(false);
//   const [tips, setTips] = useState<GameTip[]>([]);
//   const [advice, setAdvice] = useState<string | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [activeCategory, setActiveCategory] = useState<
//     "beginner" | "intermediate" | "advanced"
//   >("beginner");

//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);
//       try {
//         // Load tips
//         if (aiGameAssistant.tips.length === 0) {
//           await aiGameAssistant.fetchTips();
//         }
//         setTips(aiGameAssistant.tips);

//         // Generate advice if needed
//         if (!aiGameAssistant.personalizedAdvice) {
//           await aiGameAssistant.generatePersonalizedAdvice({});
//         }
//         setAdvice(aiGameAssistant.personalizedAdvice);

//         setError(aiGameAssistant.error);
//       } catch (err) {
//         setError("Failed to load game assistant data. Please try again.");
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   const handleCategoryChange = (
//     category: "beginner" | "intermediate" | "advanced"
//   ) => {
//     sfxState.playSfx("menuSelect");
//     setActiveCategory(category);
//   };

//   const refreshAdvice = async () => {
//     sfxState.playSfx("menuSelect");
//     setLoading(true);
//     try {
//       await aiGameAssistant.generatePersonalizedAdvice({});
//       setAdvice(aiGameAssistant.personalizedAdvice);
//     } catch (err) {
//       setError("Failed to generate new advice. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="game-assistant-container">
//       <h2 className="assistant-title">Game Assistant</h2>

//       {loading && <div className="loading-spinner">Loading...</div>}

//       {error && (
//         <div className="error-message">
//           {error}
//           <button
//             className="retry-button"
//             onClick={() =>
//               aiGameAssistant
//                 .fetchTips()
//                 .then(() => setTips(aiGameAssistant.tips))
//             }
//           >
//             Retry
//           </button>
//         </div>
//       )}

//       <div className="assistant-section advice-section">
//         <h3>Personalized Advice</h3>
//         <div className="advice-content">
//           {advice ? (
//             <>
//               <p className="advice-text">{advice}</p>
//               <button
//                 className="refresh-button"
//                 onClick={refreshAdvice}
//                 disabled={loading}
//               >
//                 Get New Advice
//               </button>
//             </>
//           ) : (
//             <p>No advice available. Please check back later.</p>
//           )}
//         </div>
//       </div>

//       <div className="assistant-section tips-section">
//         <h3>Game Tips</h3>

//         <div className="tips-category-tabs">
//           <button
//             className={`category-tab ${
//               activeCategory === "beginner" ? "active" : ""
//             }`}
//             onClick={() => handleCategoryChange("beginner")}
//           >
//             Beginner
//           </button>
//           <button
//             className={`category-tab ${
//               activeCategory === "intermediate" ? "active" : ""
//             }`}
//             onClick={() => handleCategoryChange("intermediate")}
//           >
//             Intermediate
//           </button>
//           <button
//             className={`category-tab ${
//               activeCategory === "advanced" ? "active" : ""
//             }`}
//             onClick={() => handleCategoryChange("advanced")}
//           >
//             Advanced
//           </button>
//         </div>

//         <div className="tips-list">
//           {tips.filter((tip) => tip.category === activeCategory).length > 0 ? (
//             tips
//               .filter((tip) => tip.category === activeCategory)
//               .map((tip) => (
//                 <div key={tip.id} className="tip-item">
//                   <div className="tip-icon">💡</div>
//                   <div className="tip-content">{tip.content}</div>
//                 </div>
//               ))
//           ) : (
//             <p className="no-tips-message">
//               No tips available for this category.
//             </p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };
