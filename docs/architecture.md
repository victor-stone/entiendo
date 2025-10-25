# Entiendo Architecture

## Core Technology Stack

top to bottom - layer only calls one layer down and never up

- /src/client/components
- /src/client/stores
- /src/client/services
- apClient.js --> server.js
- /src/server/http
- /src/server/api
- /src/server/models (data) OR
- /src/server/lib (3rd party services)

### 1. Frontend (React)

- User interacts with React component (**/src/client/components**)
- Component calls Zustand store action (**/src/client/stores**)
- Store calls service function (**/src/client/services**)
- Service uses API client to make HTTP request

### 2. Transport (apiClient.js)

- API client adds auth token to request
- Executes fetch() with appropriate HTTP method
- Sends JSON payload to Express endpoint

### 3. Backend (Express)

- **server.js** receives request
- **routeHandler.js** processes the request (**/src/server/http**)
- **routeTable.js** matches endpoint to function
- API implementation executes business logic (**/src/server/api**)

### 4. Data Layer (/src/server/models)

- API functions interact with data models
- Models abstract database operations
- Data is stored as JSON files in an S3 bucket

### 5. External Services (/src/server/lib)

- *OpenAI* API for language evaluation
- *AWS S3* for file storage
- *Azure* Cognitive Services for speech
- *Auth0* for authentication

## Authentication

- Frontend obtains JWT via Auth0
- Token added to Authorization header
- Backend verifies token
- Protected routes require authentication

## Deployment

- Express serves static React build
- Backend API on same Express server
- Deployed to EC2 instance
