// src/server/lib/auth.js
// Authentication middleware using express-oauth2-jwt-bearer for Auth0

import { auth } from 'express-oauth2-jwt-bearer';
import dotenv from 'dotenv';
import UserModel from '../models/UserModel.js';

// Load environment variables
dotenv.config();

// Create the JWT validation middleware
export const requireAuth = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}/`,
  tokenSigningAlg: 'RS256'
});

/**
 * Extract user info from the request and merge with database user
 * @param {Object} req Express request object
 * @returns {Promise<Object>} User info from the token merged with database record
 */
export async function getUserFromRequest(req) {
  // The auth middleware adds the auth property to the request
  if (!req.auth || !req.auth.payload) {
    throw new Error('No authentication data available');
  }
  
  // Extract the user ID from the token
  const userId = req.auth.payload.sub;
  
  // Get basic user info from token
  const tokenUser = {
    sub: userId,
    email: req.auth.payload.email,
    name: req.auth.payload.name
  };
  
  try {
    // Fetch the complete user record from the database
    const userModel = new UserModel();
    const dbUser = await userModel.findByAuthId(userId);
    
    if (dbUser) {
      // Return merged user with database info (includes role)
      return { ...tokenUser, ...dbUser };
    } else {
      // If no DB record exists, create one 
      // This ensures a minimal user record exists for future requests
      const newUser = await userModel.create({
        userId,
        role: 'user', // Default role
        createdAt: Date.now()
      });
      
      return { ...tokenUser, ...newUser };
    }
  } catch (error) {
    console.error('Error fetching user from database:', error);
    // Fallback to token data only in case of database errors
    return tokenUser;
  }
} 