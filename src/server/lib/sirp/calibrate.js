
/**
 * Calibrates SIRP state based on the evaluation of user's response
 * Maps the evaluation results to feedback value (0-3) and adjustment factors
 * @param {Object} evaluation - The evaluation result from evaluateResponse
 * @returns {Object} Settings object with adjustEaseFactor, adjustInterval, and feedback
 */
export default function calibrateSirpState(evaluation) {

    // Map transcription accuracy to numeric value
    const transcriptionScore = 
        evaluation.transcriptionAccuracy === "perfect" ? 3 :
        evaluation.transcriptionAccuracy === "minor errors" ? 2 : 
        0; // major errors
    
    // Map translation accuracy to numeric value
    const translationScore = 
        evaluation.translationAccuracy === "perfect" ? 3 :
        evaluation.translationAccuracy === "minor errors" ? 2 : 
        evaluation.translationAccuracy === "not provided" || 
        evaluation.translationAccuracy === "not evaluated" ? 1.5 : 
        0; // major errors
    
    // Calculate combined score, weighted more toward transcription
    const combinedScore = (transcriptionScore * 0.7) + (translationScore * 0.3);
    
    // Map to feedback value for SRS (0-3)
    let feedback = Math.round(combinedScore);
    
    // Adjust ease factor and interval based on performance
    let adjustEaseFactor = 1.0;
    let adjustInterval = 1.0;
    
    // Apply adjustments based on feedback level
    if (feedback === 0) { // Fail
        adjustEaseFactor = 0.8; // More aggressive reduction for inconsistent learners
        adjustInterval = 0.7; // Shorter intervals for failed items
    } else if (feedback === 1) { // Hard
        adjustEaseFactor = 0.9;
        adjustInterval = 0.8;
    } else if (feedback === 2) { // Good
        adjustEaseFactor = 0.95; // Slightly conservative for good performance
        adjustInterval = 0.9;  // Still slightly shorter intervals than standard
    } else { // Easy (3)
        adjustEaseFactor = 1.0;
        adjustInterval = 1.0;
    }
    
    // Fine-tune based on mistake type
    if (evaluation.mistakeType === "typo") {
        // Typos are less severe - slightly increase factors
        adjustEaseFactor += 0.05;
        adjustInterval += 0.05;
    } else if (evaluation.mistakeType === "full misunderstanding") {
        // Major comprehension issues - be more conservative
        adjustEaseFactor -= 0.1;
        adjustInterval -= 0.1;
    } else if (evaluation.mistakeType === "audio misunderstanding") {
        // Audio issues - moderate adjustment
        adjustEaseFactor -= 0.05;
        adjustInterval -= 0.05;
    }
    
    //
    // There are all the values possible
    //
    // FB. errType. adEF.   adInt
    // --------------------------
    // 0 - typo	    0.85	0.75
    // 0 - fullMis	0.70	0.60
    // 0 - audioMis	0.75	0.65
    // 0 - 	        0.80	0.70
            
    // 1 - typo	    0.95	0.85
    // 1 - fullMis	0.80	0.70
    // 1 - audioMis	0.85	0.75
    // 1 -      	0.90	0.80
            
    // 2 - typo	    1.00	0.95
    // 2 - fullMis	0.85	0.80
    // 2 - audioMis	0.90	0.85
    // 2 - 	        0.95	0.90
            
    // 3 - typo	    1.05	1.05
    // 3 - fullMis	0.90	0.90
    // 3 - audioMis	0.95	0.95
    // 3 - 	        1.00	1.00

    /*
        Ensure values stay within reasonable bounds

        #NOTE: disabling this clamp since all cases as written
        are within the clamping range
    */
    // adjustEaseFactor = Math.max(0.5, Math.min(adjustEaseFactor, 1.2));
    // adjustInterval = Math.max(0.5, Math.min(adjustInterval, 1.2));

    return {
        adjustEaseFactor,
        adjustInterval,
        feedback
    };
}