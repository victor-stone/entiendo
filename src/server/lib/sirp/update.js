/**
 * Updates idiom state using SIRP algorithm
 * @param {Object} idiomState - Current idiom state
 * @param {Number} feedback - User feedback (0-3)
 * @param {Object} settings - algorithm settings tweaked by user's performance
 * @returns {Object} Updated idiom state
 */
export default function updateSirpState(state, settings = {}) {
    
    const { feedback = 0, adjustEaseFactor = 1.0, adjustInterval = 1.0 } = settings;

    // Clone state to avoid mutation
    const newState = {  
        interval: 1,
        difficulty: 2.5,
        dueDate: Date.now(),
        successRate: 0.9,
        lapseCount: 0,
        isLeech: false,
        ...state 
    };
    
    // Default values for randomization (add ±5% variation)
    const randomFactor = 0.95 + Math.random() * 0.1;
    
    // Update success rate based on feedback
    // Scale feedback from 0-3 to 0-1 for success rate calculation
    const normalizedFeedback = Math.min(feedback / 3, 1);
    newState.successRate = 0.9 * newState.successRate + 0.1 * normalizedFeedback;
    
    // Process based on feedback
    if (feedback === 0) { // Fail
      // Increment lapse count for tracking problem items
      newState.lapseCount += 1;
      
      // Decrease difficulty (ease factor) more significantly 
      newState.difficulty = Math.max(1.3, newState.difficulty - 0.2 * adjustEaseFactor);
      
      // Reset interval for re-drilling
      newState.interval = Math.max(1, Math.floor(newState.interval * 0.5 * adjustInterval));
    } 
    else if (feedback === 1) { // Hard
      // Slightly decrease difficulty for items that were challenging
      newState.difficulty = Math.max(1.3, newState.difficulty - 0.05 * adjustEaseFactor);
      
      // Shorter interval than normal but not as short as a fail
      newState.interval = Math.max(1, Math.ceil(newState.interval * 0.7 * adjustInterval));
    }
    else if (feedback === 2) { // Good
      // Slight adjustment based on success rate trend
      if (newState.successRate < 0.85) {
        newState.difficulty = Math.max(1.3, newState.difficulty - 0.02 * adjustEaseFactor);
      } else if (newState.successRate > 0.95) {
        newState.difficulty = Math.min(3.0, newState.difficulty + 0.02 * adjustEaseFactor);
      }
      
      // Normal interval growth
      newState.interval = Math.ceil(newState.interval * newState.difficulty * adjustInterval);
    }
    else if (feedback === 3) { // Easy
      // Increase difficulty for easier growth
      newState.difficulty = Math.min(3.0, newState.difficulty + 0.05 * adjustEaseFactor);
      
      // Longer interval with a boost
      newState.interval = Math.ceil(newState.interval * newState.difficulty * 1.3 * adjustInterval);
    }
    
    // Apply random variation to prevent predictable scheduling
    newState.interval = Math.max(1, Math.round(newState.interval * randomFactor));
    
    // Set new due date based on interval (in days)
    const now = Date.now();
    newState.dueDate = now + (newState.interval * 24 * 60 * 60 * 1000);
    
    // Flag cards with repeated lapses (3 or more) for special attention
    if (newState.lapseCount >= 3) {
      newState.isLeech = true;
    }
    
    return newState;
  }
  