# Auth0 Setup for Entiendo

This document outlines the steps to set up Auth0 authentication for the Entiendo application.

## Create an Auth0 Account and Application

1. Sign up for an Auth0 account at [auth0.com](https://auth0.com/).
2. Create a new application:
   - Go to the Auth0 Dashboard
   - Navigate to "Applications" > "Applications"
   - Click "Create Application"
   - Name it "Entiendo"
   - Select "Single Page Web Applications"
   - Click "Create"

## Configure the Auth0 Application

1. In the application settings:

   - Set "Allowed Callback URLs" to:
     ```
     http://localhost:3000, http://localhost:5173
     ```
   - Set "Allowed Logout URLs" to:
     ```
     http://localhost:3000, http://localhost:5173
     ```
   - Set "Allowed Web Origins" to:
     ```
     http://localhost:3000, http://localhost:5173
     ```
   - Save the changes
2. Create an API in Auth0:

   - Go to "Applications" > "APIs"
   - Click "Create API"
   - Set Name to "Entiendo API"
   - Set Identifier to `https://api.entiendo.com` (or your chosen audience)
   - Select RS256 as the signing algorithm
   - Click "Create"

## Add Auth0 Configuration to Environment Variables

Add the following variables to your `.env` file:

```
# Auth0 Configuration
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_AUDIENCE=https://api.entiendo.com
VITE_AUTH0_DOMAIN=your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
VITE_AUTH0_AUDIENCE=https://api.entiendo.com
```

Replace the placeholders with your actual Auth0 values:

- `your-tenant.auth0.com`: Your Auth0 domain
- `your-client-id`: Your Auth0 application's Client ID
- `https://api.entiendo.com`: Your API identifier (audience)

## Testing Authentication

1. Start the application with:

   ```
   npm run dev
   ```
2. Click on the "Login" button in the application.
3. You should be redirected to the Auth0 login page.
4. After logging in, you will be redirected back to the application, and the Auth0 user information will be available in the application.
