// src/server/api/userAPI.js
import { UserModel } from '../models/index.js';
import { validateUser } from '../lib/validate.js';
import { ValidationError } from '../../shared/constants/errorTypes.js';
import filterDefaults from '../../shared/filterDefaults.js';

/**
 * Synchronize user data from Auth0 profile
 */
export async function syncUserFromAuth0(unified) {
  const validation = validateUser(unified);
  if (!validation.valid) {
    throw new ValidationError(validation.error.message || 'Invalid user data');
  }
  
  const { userId } = validation;
  const userModel  = new UserModel();
  const createdAt  = Date.now();
  let   user       = await userModel.findByAuthId(userId);
  
  if( !user ) {
    user = await userModel.create({
        userId,
        role: 'user',
        createdAt
      });
  }
  if( user && !user.preferences ) {
    user.preferences = {};
  }

  if( user && !user.preferences.filter ) {
    user.preferences.filter = { ...filterDefaults }
    user = await userModel.update( userId, user );
  }

  return user;
}

export async function updatePreferences(unified) {
    const { user: {userId}, payload: { preferences }} = unified;
    const model = new UserModel();
    return (await model.update(userId, { preferences })).preferences;
  }
