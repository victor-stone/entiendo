#!/bin/bash

# Exit on any error
set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}Setting up Tailwind CSS v4 for your Entiendo project...${NC}"

# Ensure we're using Node.js 18+
NODE_VERSION=$(node -v | cut -d. -f1 | tr -d 'v')
if [ "$NODE_VERSION" -lt 18 ]; then
  echo -e "${YELLOW}Warning: Tailwind CSS v4 requires Node.js 18+. You're running Node.js $NODE_VERSION.${NC}"
  echo "Please update Node.js before continuing."
  exit 1
fi

# Install Tailwind CSS v4
echo -e "${YELLOW}Installing Tailwind CSS v4...${NC}"
npm install tailwindcss@latest

# Create Tailwind config file as ESM
echo -e "${YELLOW}Creating Tailwind CSS v4 configuration...${NC}"
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/client/**/*.{js,jsx,ts,tsx}",
    "./src/client/index.html",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
EOF

# Create source CSS file
mkdir -p src/client/styles
cat > src/client/styles/index.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom CSS here */
EOF

# Create PostCSS config
cat > postcss.config.js << 'EOF'
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

# Add Tailwind import to main JSX file if it exists
if [ -f src/client/main.jsx ]; then
  # Check if the import already exists
  if ! grep -q "styles/index.css" src/client/main.jsx; then
    # Create a temp file with the import added at the top
    echo "import './styles/index.css';" > temp.jsx
    cat src/client/main.jsx >> temp.jsx
    mv temp.jsx src/client/main.jsx
    echo -e "${GREEN}Added Tailwind CSS import to main.jsx${NC}"
  fi
else
  # Create a basic main.jsx with Tailwind import
  mkdir -p src/client
  cat > src/client/main.jsx << 'EOF'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
EOF
  echo -e "${GREEN}Created main.jsx with Tailwind CSS import${NC}"

  # Create a simple App.jsx if it doesn't exist
  if [ ! -f src/client/App.jsx ]; then
    cat > src/client/App.jsx << 'EOF'
import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-md flex items-center space-x-4">
        <div>
          <div className="text-xl font-medium text-black">Entiendo</div>
          <p className="text-gray-500">Language learning app</p>
          <button
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => setCount((count) => count + 1)}
          >
            count is {count}
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
EOF
    echo -e "${GREEN}Created App.jsx with Tailwind CSS classes${NC}"
  fi
fi

echo -e "${GREEN}Tailwind CSS v4 setup complete!${NC}"
echo -e "${BLUE}Next steps:${NC}"
echo "1. Make sure your Vite configuration includes PostCSS"
echo "2. Run your development server to see Tailwind in action"
echo "3. Refer to Tailwind v4 docs for new features and changes: https://tailwindcss.com/docs"
