import updateSirpState from "./update.js";
import calibrateSirpState from "./calibrate.js";

export default function processSirpState(state, evaluation) {
    const settings = calibrateSirpState(evaluation);
    const newState = updateSirpState(state, settings);
    return newState;
}