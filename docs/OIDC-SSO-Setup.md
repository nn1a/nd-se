# OIDC/SSO Configuration Guide

This guide explains how to set up Single Sign-On (SSO) using OpenID Connect (OIDC) with your ND-SE application.

## Overview

The application supports OIDC authentication alongside traditional username/password login. When OIDC is enabled and configured, users will see an "SSO Login" button on the login page.

## Backend Configuration

### 1. Environment Variables

Add the following variables to your backend `.env` file:

```bash
# OIDC/SSO Configuration
OIDC_ENABLED=true
OIDC_CLIENT_ID=your-client-id
OIDC_CLIENT_SECRET=your-client-secret
OIDC_DISCOVERY_URL=https://your-provider.com/.well-known/openid_configuration
OIDC_REDIRECT_URI=http://localhost:8000/api/auth/oidc/callback
OIDC_SCOPES=openid profile email
```

### 2. Install Dependencies

The required dependencies are already included in `requirements.txt`:
- `authlib==1.3.2` - OIDC client library
- `motor==3.5.1` - MongoDB async driver
- `pydantic-settings==2.6.1` - Settings management

Install them with:
```bash
cd backend
pip install -r requirements.txt
```

## Common Provider Configurations

### Microsoft Azure AD

1. Register an application in Azure AD
2. Configure these environment variables:

```bash
OIDC_ENABLED=true
OIDC_CLIENT_ID=your-azure-app-id
OIDC_CLIENT_SECRET=your-azure-app-secret
OIDC_DISCOVERY_URL=https://login.microsoftonline.com/{tenant-id}/v2.0/.well-known/openid_configuration
OIDC_REDIRECT_URI=http://localhost:8000/api/auth/oidc/callback
OIDC_SCOPES=openid profile email
```

### Google Workspace

1. Create OAuth 2.0 credentials in Google Cloud Console
2. Configure these environment variables:

```bash
OIDC_ENABLED=true
OIDC_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
OIDC_CLIENT_SECRET=your-google-client-secret
OIDC_DISCOVERY_URL=https://accounts.google.com/.well-known/openid_configuration
OIDC_REDIRECT_URI=http://localhost:8000/api/auth/oidc/callback
OIDC_SCOPES=openid profile email
```

### Okta

1. Create an OIDC application in Okta
2. Configure these environment variables:

```bash
OIDC_ENABLED=true
OIDC_CLIENT_ID=your-okta-client-id
OIDC_CLIENT_SECRET=your-okta-client-secret
OIDC_DISCOVERY_URL=https://your-domain.okta.com/.well-known/openid_configuration
OIDC_REDIRECT_URI=http://localhost:8000/api/auth/oidc/callback
OIDC_SCOPES=openid profile email
```

### Auth0

1. Create an application in Auth0
2. Configure these environment variables:

```bash
OIDC_ENABLED=true
OIDC_CLIENT_ID=your-auth0-client-id
OIDC_CLIENT_SECRET=your-auth0-client-secret
OIDC_DISCOVERY_URL=https://your-domain.auth0.com/.well-known/openid_configuration
OIDC_REDIRECT_URI=http://localhost:8000/api/auth/oidc/callback
OIDC_SCOPES=openid profile email
```

## Frontend Configuration

The frontend automatically detects if OIDC is enabled by calling `/api/auth/oidc/status`. No additional configuration is needed.

## API Endpoints

The following OIDC endpoints are available:

- `GET /api/auth/oidc/status` - Check if OIDC is enabled and configured
- `GET /api/auth/oidc/login` - Start OIDC login flow
- `GET /api/auth/oidc/callback` - Handle OIDC callback (redirect)
- `POST /api/auth/oidc/callback` - Handle OIDC callback (JSON)

## Authentication Flow

1. User clicks "SSO Login" button
2. Frontend calls `/api/auth/oidc/login` to get authorization URL
3. User is redirected to identity provider
4. After authentication, user is redirected to `/api/auth/oidc/callback`
5. Backend processes the callback and redirects to frontend with tokens
6. Frontend stores tokens and authenticates the user

## User Management

When a user logs in via OIDC:

1. System checks if user exists by `oidc_sub` field
2. If user exists, updates their info and login timestamp
3. If user doesn't exist, creates new user with:
   - Username from OIDC claim (made unique if needed)
   - Email from OIDC claim
   - Default "user" role
   - `auth_provider: "oidc"`

## Security Features

- **PKCE (Proof Key for Code Exchange)** for additional security
- **State parameter** for CSRF protection
- **Token validation** using provider's public keys
- **Secure token storage** in localStorage
- **Automatic token refresh** using existing auth system

## Testing

1. Set `OIDC_ENABLED=true` and configure your provider
2. Start the backend: `uvicorn app.main:app --reload`
3. Start the frontend: `npm run dev`
4. Navigate to `/auth/login` and test the SSO button

## Troubleshooting

### Common Issues

1. **"OIDC is not enabled"** - Check `OIDC_ENABLED=true` in backend .env
2. **Discovery URL fails** - Verify the provider's discovery URL is accessible
3. **Invalid redirect URI** - Ensure redirect URI matches provider configuration
4. **Token validation fails** - Check client ID/secret and provider configuration

### Debug Mode

Enable debug logging by setting environment variable:
```bash
PYTHONPATH=/path/to/backend python -c "import logging; logging.basicConfig(level=logging.DEBUG)"
```

## Production Considerations

1. Use HTTPS for all URLs in production
2. Store client secrets securely (Azure Key Vault, AWS Secrets Manager, etc.)
3. Configure proper CORS settings
4. Set up monitoring for authentication failures
5. Consider implementing session management for better security
6. Regular security audits of OIDC configuration

## Fallback Authentication

Traditional username/password authentication remains available even with OIDC enabled. Users can use either method to log in.