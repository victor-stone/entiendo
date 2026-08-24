import { NotFoundError, ValidationError } from '../../../shared/constants/errorTypes.js';
import { Examples } from '../../models/index.js';
import {
  audioResponse,
  resolveAudioVariant,
} from '../lib/audioVariants.js';
import { isVoiceType } from '../lib/audioVariantUtils.js';

/**
 * Idempotently resolve (or lazily generate) one server-approved audio style.
 * The client chooses only the style; voice IDs and speed remain server-owned.
 */
export async function getExerciseAudio(routeContext) {
  const { exampleId, voiceType } = routeContext.params;

  if (!isVoiceType(voiceType)) {
    throw new ValidationError(`Unsupported voice type: ${voiceType}`);
  }

  const examples = new Examples();
  const example = examples.byId(exampleId);
  if (!example) {
    throw new NotFoundError('Exercise example not found');
  }

  const resolved = await resolveAudioVariant(example, voiceType, {
    model: examples,
  });

  return audioResponse(resolved);
}
