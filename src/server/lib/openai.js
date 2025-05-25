// src/server/lib/openai.js
import { OpenAI } from 'openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Generate a response using OpenAI's API
 * 
 * @param {String} systemPrompt - Instructions for the AI
 * @param {String} userPrompt - User query
 * @param {Object} options - Additional options (model, temperature, etc.)
 * @returns {Promise<String>} The generated text response
 */
export async function generateText(systemPrompt, userPrompt, options = {}) {
  try {
    const defaultOptions = {
      model      : process.env.OPENAI_MODEL || 'gpt-4o',
      temperature: 0.7,
      max_tokens : 150,
      response_format: { type: "json_object" }
    };
    
    const config = { ...defaultOptions, ...options };
    
    const response = await openai.chat.completions.create({
      ...config,
      messages: [
        { role: 'system', content: systemPrompt.trim() },
        { role: 'user',   content: userPrompt.trim() }
      ]
    });
    
    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error(`Failed to generate text: ${error.message}`);
  }
}

export default {
  generateText
};