// src/server/api/userAPI.js
import { Users } from '../models/index.js';
import { validateUser } from '../lib/validate.js';
import { ValidationError } from '../../shared/constants/errorTypes.js';
import filterDefaults from '../../shared/filterDefaults.js';

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

  user.preferences = user.preferences || {};
  let needUpdate = false;

  if (!user.preferences.filter) {
    user.preferences.filter = { ...filterDefaults };
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
  const { user: { userId }, payload: { preferences } } = routeContext;
  const u = new Users();
  return u.update(userId, { preferences }).preferences;
}
