// src/server/lib/openai.js
import { OpenAI } from "openai";
import dotenv from "dotenv";

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
      model          : process.env.OPENAI_MODEL || "gpt-5",
      temperature    : 0.7,
      max_tokens     : 250,
      response_format: { type: "json_object" },
    };

    const config = { ...defaultOptions, ...options };

    const response = await openai.chat.completions.create({
      ...config,
      messages: [
        { role: "system", content: systemPrompt.trim() },
        { role: "user", content: userPrompt.trim() },
      ],
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("OpenAI API Error:", error);
    throw new Error(`Failed to generate text: ${error.message}`);
  }
}


export async function consultAssistant(assistantId, userMessage) {
  const thread = await openai.beta.threads.create();

  // Step 1: Post message
  await openai.beta.threads.messages.create(thread.id, {
    role: "user",
    content: userMessage,
  });

  // Step 2: Run the Assistant
  const run = await openai.beta.threads.runs.create(thread.id, {
    assistant_id: assistantId,
  });

  // Step 3: Poll until done
  let result;
  const maxAttempts = 30; // ~30 seconds
  let attempts = 0;

  while (attempts < maxAttempts) {
    await new Promise((r) => setTimeout(r, 1000));
    result = await openai.beta.threads.runs.retrieve(thread.id, run.id);

    if (result.status === "completed") break;
    if (["failed", "cancelled", "expired"].includes(result.status)) {
      throw new Error(`Assistant run failed: ${result.status}`);
    }

    attempts++;
  }

  if (attempts === maxAttempts) {
    throw new Error("Assistant run timed out after 30 seconds");
  }
  
  // Step 4: Get the response
  const messages = await openai.beta.threads.messages.list(thread.id);
  const reply = messages.data.find((m) => m.role === "assistant");
  const raw = reply?.content?.[0]?.text?.value;

  if (!raw) throw new Error("Assistant did not respond.");

  try {
    const feedback = JSON.parse(raw);
    return feedback;
  } catch (e) {
    console.error("Failed to parse feedback:", raw);
    throw e;
  }
}
export default {
  generateText,
};
