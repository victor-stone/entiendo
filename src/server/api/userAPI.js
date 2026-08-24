// src/server/api/userAPI.js
import { Users } from '../models/index.js';
import { validateUser } from '../lib/validate.js';
import { ValidationError } from '../../shared/constants/errorTypes.js';
import filterDefaults from '../../shared/filterDefaults.js';
import {
  VOICE_TYPE,
  isVoiceType,
  normalizeVoiceType
} from '../../shared/constants/voiceTypes.js';

const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);

export function normalizePreferences(preferences = {}) {
  const safePreferences = isObject(preferences) ? preferences : {};
  const filter = isObject(safePreferences.filter) ? safePreferences.filter : {};

  return {
    ...safePreferences,
    filter: {
      ...filterDefaults,
      ...filter
    },
    [VOICE_TYPE]: normalizeVoiceType(safePreferences[VOICE_TYPE])
  };
}

/**
 * Synchronize user data from Auth0 profile
 */
export async function syncUserFromAuth0(routeContext) {
  const validation = validateUser(routeContext);
  if (!validation.valid) 
    throw new ValidationError(validation.error.message || 'Invalid user data');

  const { payload: { authUser } } = routeContext;
  const { userId } = validation;
  const users = new Users();
  let user = users.byId(userId);

  if (!user) {
    user = users.create({
      userId,
      role: 'user',
      createdAt: Date.now(),
      name: authUser.name,
    });
  }

  let needUpdate = false;

  const normalizedPreferences = normalizePreferences(user.preferences);
  if (JSON.stringify(user.preferences) !== JSON.stringify(normalizedPreferences)) {
    user.preferences = normalizedPreferences;
    needUpdate = true;
  }
  if (!user.name && authUser.name) {
    user.name = authUser.name;
    needUpdate = true;
  }
  if( !user.email && authUser.email) {
    // there's no reason to save full emails 
    // addresses (in fact, using it would break
    // the license of this code)
    user.email = authUser.email.split('@')[0];
    needUpdate = true;
  }

  if (needUpdate) 
    user = users.update(userId, user);

  return user;
}

export async function updatePreferences(routeContext) {
  const validation = validateUser(routeContext);
  if (!validation.valid)
    throw new ValidationError(validation.error.message || 'Invalid user data');

  const preferences = routeContext.payload?.preferences;
  if (!isObject(preferences))
    throw new ValidationError('Preferences must be an object');

  if (
    Object.prototype.hasOwnProperty.call(preferences, VOICE_TYPE) &&
    !isVoiceType(preferences[VOICE_TYPE])
  ) {
    throw new ValidationError(`Invalid voice type: ${preferences[VOICE_TYPE]}`);
  }

  const normalizedPreferences = normalizePreferences(preferences);
  const u = new Users();
  return u.update(validation.userId, { preferences: normalizedPreferences }).preferences;
}
