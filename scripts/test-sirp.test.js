import processSirpState from "../src/server/lib/sirp/process.js";
import {format} from 'timeago.js'

// Manual test for SIRP processing with customizable evaluations (no Jest required)

function initialState() {
    return {
        interval: 1,
        difficulty: 2.5,
        dueDate: Date.now(),
        successRate: 0.9,
        lapseCount: 0,
        isLeech: false,
    };
}

const abrv = {
    "major errors": '--',
    "perfect": "++",
    "minor errors": "-+"
}
function simulateSirp(state, evaluations) {
    const intervals = [];
    const dueDates = [];
    let now = Date.now();
    for (let i = 0; i < evaluations.length; i++) {
        state.dueDate = now; // simulate reviewing when due
        state = processSirpState(state, evaluations[i]);
        now = state.dueDate; // next review happens at the new due date
        intervals.push(state.interval);
        dueDates.push(state.dueDate);
        const { transcriptionAccuracy: tpa, translationAccuracy: tla } =  evaluations[i];
        console.log(
            `Review ${i + 1}: ${abrv[tpa]}/${abrv[tla]} int=${state.interval}, diff:${state.difficulty.toFixed(2)} succ:${state.successRate.toFixed(2)} lap:${state.lapseCount} dueDate=${format(state.dueDate)}`
        );
    }
    // Simple checks
    for (let i = 1; i < intervals.length; i++) {
        if (intervals[i] <= intervals[i - 1]) {
            console.error(`Interval did not increase at review ${i + 1}`);
        }
        if (dueDates[i] <= dueDates[i - 1]) {
            console.error(`Due date did not move forward at review ${i + 1}`);
        }
    }
    return { intervals, dueDates };
}

// Example usage:
const perfectEvaluation = {
    transcriptionAccuracy: "perfect",
    translationAccuracy: "perfect",
    mistakeType: null,
};

const perfectEvaluations = Array(15).fill(perfectEvaluation);

console.log("Manual SIRP simulation with all perfect scores:");

simulateSirp(initialState(), perfectEvaluations);

const failEvaluation = {
    transcriptionAccuracy: "major errors",
    translationAccuracy: "major errors",
    mistakeType: "other",
};

const failEvaluations = Array(5).fill(failEvaluation);

console.log("Manual SIRP simulation with all failures:");
simulateSirp(initialState(), failEvaluations);

const minorErrorEvaluation = {
    transcriptionAccuracy: "minor errors",
    translationAccuracy: "minor errors",
    mistakeType: "spelling",
};

const minorErrorEvaluations = Array(5).fill(minorErrorEvaluation);

console.log("Manual SIRP simulation with all minor errors:");
simulateSirp(initialState(), minorErrorEvaluations);

// Mixed evaluation arrays for more realistic SIRP runs

const mix1 = [
    { transcriptionAccuracy: "perfect", translationAccuracy: "perfect", mistakeType: null },
    { transcriptionAccuracy: "minor errors", translationAccuracy: "perfect", mistakeType: "spelling" },
    { transcriptionAccuracy: "perfect", translationAccuracy: "minor errors", mistakeType: "grammar" },
    { transcriptionAccuracy: "major errors", translationAccuracy: "perfect", mistakeType: "other" },
    { transcriptionAccuracy: "perfect", translationAccuracy: "major errors", mistakeType: "other" },
    { transcriptionAccuracy: "minor errors", translationAccuracy: "minor errors", mistakeType: "spelling" },
    { transcriptionAccuracy: "perfect", translationAccuracy: "perfect", mistakeType: null },
    { transcriptionAccuracy: "minor errors", translationAccuracy: "major errors", mistakeType: "grammar" },
    { transcriptionAccuracy: "major errors", translationAccuracy: "minor errors", mistakeType: "spelling" },
];

console.log("Manual SIRP simulation with mixed results (mix1):");
simulateSirp(initialState(), mix1);

const mix2 = [
    { transcriptionAccuracy: "minor errors", translationAccuracy: "perfect", mistakeType: "spelling" },
    { transcriptionAccuracy: "minor errors", translationAccuracy: "minor errors", mistakeType: "spelling" },
    { transcriptionAccuracy: "perfect", translationAccuracy: "perfect", mistakeType: null },
    { transcriptionAccuracy: "major errors", translationAccuracy: "major errors", mistakeType: "other" },
    { transcriptionAccuracy: "perfect", translationAccuracy: "minor errors", mistakeType: "grammar" },
    { transcriptionAccuracy: "minor errors", translationAccuracy: "perfect", mistakeType: "spelling" },
    { transcriptionAccuracy: "perfect", translationAccuracy: "perfect", mistakeType: null },
    { transcriptionAccuracy: "major errors", translationAccuracy: "perfect", mistakeType: "other" },
    { transcriptionAccuracy: "perfect", translationAccuracy: "major errors", mistakeType: "other" },
];

console.log("Manual SIRP simulation with mixed results (mix2):");
simulateSirp(initialState(), mix2);

const mix3 = [
    { transcriptionAccuracy: "major errors", translationAccuracy: "minor errors", mistakeType: "spelling" },
    { transcriptionAccuracy: "minor errors", translationAccuracy: "major errors", mistakeType: "grammar" },
    { transcriptionAccuracy: "perfect", translationAccuracy: "minor errors", mistakeType: "grammar" },
    { transcriptionAccuracy: "minor errors", translationAccuracy: "perfect", mistakeType: "spelling" },
    { transcriptionAccuracy: "perfect", translationAccuracy: "perfect", mistakeType: null },
    { transcriptionAccuracy: "major errors", translationAccuracy: "major errors", mistakeType: "other" },
    { transcriptionAccuracy: "minor errors", translationAccuracy: "minor errors", mistakeType: "spelling" },
    { transcriptionAccuracy: "perfect", translationAccuracy: "major errors", mistakeType: "other" },
    { transcriptionAccuracy: "perfect", translationAccuracy: "perfect", mistakeType: null },
];

console.log("Manual SIRP simulation with mixed results (mix3):");
simulateSirp(initialState(), mix3);

const mix4 = [
    { transcriptionAccuracy: "perfect", translationAccuracy: "minor errors", mistakeType: "grammar" },
    { transcriptionAccuracy: "minor errors", translationAccuracy: "perfect", mistakeType: "spelling" },
    { transcriptionAccuracy: "major errors", translationAccuracy: "perfect", mistakeType: "other" },
    { transcriptionAccuracy: "perfect", translationAccuracy: "major errors", mistakeType: "other" },
    { transcriptionAccuracy: "minor errors", translationAccuracy: "minor errors", mistakeType: "spelling" },
    { transcriptionAccuracy: "perfect", translationAccuracy: "perfect", mistakeType: null },
    { transcriptionAccuracy: "major errors", translationAccuracy: "minor errors", mistakeType: "spelling" },
    { transcriptionAccuracy: "minor errors", translationAccuracy: "major errors", mistakeType: "grammar" },
    { transcriptionAccuracy: "perfect", translationAccuracy: "perfect", mistakeType: null },
];

console.log("Manual SIRP simulation with mixed results (mix4):");
simulateSirp(initialState(), mix4);

const recoverySeries = [
    // Start weak: major errors
    { transcriptionAccuracy: "major errors", translationAccuracy: "major errors", mistakeType: "other" },
    { transcriptionAccuracy: "major errors", translationAccuracy: "major errors", mistakeType: "other" },
    { transcriptionAccuracy: "major errors", translationAccuracy: "minor errors", mistakeType: "spelling" },
    // Slight improvement: minor errors
    { transcriptionAccuracy: "minor errors", translationAccuracy: "minor errors", mistakeType: "spelling" },
    { transcriptionAccuracy: "minor errors", translationAccuracy: "perfect", mistakeType: "spelling" },
    // Good streak: perfects
    { transcriptionAccuracy: "perfect", translationAccuracy: "perfect", mistakeType: null },
    { transcriptionAccuracy: "perfect", translationAccuracy: "perfect", mistakeType: null },
    // Lapse: major error
    { transcriptionAccuracy: "major errors", translationAccuracy: "major errors", mistakeType: "other" },
    // Recovery: minor errors
    { transcriptionAccuracy: "minor errors", translationAccuracy: "minor errors", mistakeType: "spelling" },
    { transcriptionAccuracy: "minor errors", translationAccuracy: "perfect", mistakeType: "spelling" },
    // Good streak again
    { transcriptionAccuracy: "perfect", translationAccuracy: "perfect", mistakeType: null },
    { transcriptionAccuracy: "perfect", translationAccuracy: "minor errors", mistakeType: "grammar" },
    { transcriptionAccuracy: "perfect", translationAccuracy: "perfect", mistakeType: null },
    // Small lapse
    { transcriptionAccuracy: "minor errors", translationAccuracy: "major errors", mistakeType: "other" },
    // Finish strong
    { transcriptionAccuracy: "perfect", translationAccuracy: "perfect", mistakeType: null },
];

console.log("Manual SIRP simulation with recovery/lapse series:");
simulateSirp(initialState(), recoverySeries);
