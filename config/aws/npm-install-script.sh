#!/bin/bash

# Exit on any error
set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}Installing Entiendo project dependencies...${NC}"

# Backend dependencies
echo -e "${YELLOW}Installing backend dependencies...${NC}"
npm install express \
  @aws-sdk/client-dynamodb \
  @aws-sdk/client-s3 \
  @aws-sdk/client-cognito-identity-provider \
  amazon-cognito-identity-js \
  openai \
  microsoft-cognitiveservices-speech-sdk \
  dynamoose \
  dotenv \
  cors

# Frontend dependencies
echo -e "${YELLOW}Installing frontend dependencies...${NC}"
npm install react \
  react-dom \
  react-router-dom \
  wavesurfer.js

# Development dependencies with specific Tailwind v3 version
echo -e "${YELLOW}Installing development dependencies (with Tailwind CSS v3)...${NC}"
npm install --save-dev \
  vite \
  @vitejs/plugin-react \
  tailwindcss@3.3.5 \
  postcss \
  autoprefixer \
  eslint \
  eslint-plugin-react \
  prettier \
  nodemon \
  jest \
  @testing-library/react \
  @testing-library/jest-dom \
  supertest \
  cross-env \
  concurrently

echo -e "${GREEN}All dependencies installed successfully!${NC}"
echo -e "${YELLOW}Setting up Tailwind CSS v3 configuration...${NC}"

# Create Tailwind config file (for v3)
npx tailwindcss init -p

# Update the content paths in the Tailwind config
sed -i.bak 's/content: \[\],/content: ["\.\/src\/client\/**\/*.{js,jsx,ts,tsx}", "\.\/src\/client\/index.html"],/' tailwind.config.js || sed -i '' 's/content: \[\],/content: ["\.\/src\/client\/**\/*.{js,jsx,ts,tsx}", "\.\/src\/client\/index.html"],/' tailwind.config.js

# Create Vite config
cat > vite.config.js << 'EOF'
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
EOF

# Create CSS file with Tailwind directives
mkdir -p src/client/styles
cat > src/client/styles/index.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom styles below */
EOF

echo -e "${GREEN}Tailwind CSS v3 and Vite setup complete!${NC}"
echo -e "${BLUE}Next steps:${NC}"
echo "1. Set up environment variables (.env file)"
echo "2. Create your React components in src/client/"
echo "3. Start development: npm run dev (after setting up scripts in package.json)"
