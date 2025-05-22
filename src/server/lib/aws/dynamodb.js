// src/server/lib/aws/dynamodb.js
// Pure library code - no app-specific knowledge
// AWS DynamoDB client setup - pure infrastructure code

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import dotenv from 'dotenv';

dotenv.config();

// Configuration for DynamoDB client
const config = {
  region: process.env.AWS_REGION || 'us-east-1',
};

// Add credentials if provided via environment variables
if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  config.credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  };
}

// Create and export the DynamoDB client instance
export const dynamoDBClient = new DynamoDBClient(config);

// Export a function to get the client (useful for testing with mocks)
export const getDynamoDBClient = () => dynamoDBClient;
